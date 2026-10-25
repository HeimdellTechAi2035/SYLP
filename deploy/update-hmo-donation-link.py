#!/usr/bin/env python3
"""Idempotent maintenance for the co-hosted HMO site's public donation URL.

Uses the existing hmo-report service's working directory. Does not access reports,
contact data, secrets, dependencies or upload directories. Backs up changed source
files and restores them if the service cannot restart. No effect on other hosts.
"""
import os
import re
import shlex
from pathlib import Path
import shutil
import subprocess
import time

OLD = b"https://buymeacoffee.com/report.a.local.hmo"
NEW = b"https://buymeacoffee.com/sylp"
EXCLUDED = {"node_modules", ".git", ".next", "data", "uploads", "media", "media-data", "backups", "logs", "coverage", "tests"}


def replace_public_links(root: Path, backup: Path):
    changed = []
    try:
        for directory, folders, names in os.walk(root, followlinks=False):
            folders[:] = [name for name in folders if not name.startswith(".") and name not in EXCLUDED and not (Path(directory) / name).is_symlink()]
            for name in names:
                path = Path(directory) / name
                if path.is_symlink() or path.suffix not in {".html", ".js", ".mjs", ".cjs"} or path.stat().st_size > 2_000_000:
                    continue
                content = path.read_bytes()
                if OLD not in content:
                    continue
                destination = backup / path.relative_to(root)
                destination.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
                shutil.copy2(path, destination)
                changed.append((path, destination))
                # Updating the existing inode preserves its owner and permissions.
                path.write_bytes(content.replace(OLD, NEW))
    except Exception:
        restore(changed)
        raise
    return changed


def replace_env_links(paths, backup):
    """Change only a setting whose entire value is the old public donation URL.

    Never print or export configuration contents, and leave all other values byte
    for byte intact. These files are the HMO service's own environment files.
    """
    changed = []
    pattern = re.compile(rb"^(\s*(?:export\s+)?[A-Za-z_][A-Za-z0-9_]*\s*=\s*[\"']?)" + re.escape(OLD) + rb"([\"']?\s*(?:#.*)?)$")
    try:
        for index, path in enumerate(dict.fromkeys(paths)):
            if path.is_symlink() or not path.is_file() or path.stat().st_size > 1_000_000:
                continue
            content = path.read_bytes()
            lines = []
            for line in content.splitlines(keepends=True):
                body = line.rstrip(b"\r\n")
                match = pattern.fullmatch(body)
                lines.append(match[1] + NEW + match[2] + line[len(body):] if match else line)
            updated = b"".join(lines)
            if updated == content:
                continue
            destination = backup / "environment" / str(index)
            destination.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
            shutil.copy2(path, destination)
            changed.append((path, destination))
            path.write_bytes(updated)
    except Exception:
        restore(changed)
        raise
    return changed


def restore(changed):
    for path, backup in changed:
        path.write_bytes(backup.read_bytes())
        shutil.copystat(backup, path)


def main():
    service = "hmo-report.service"
    result = subprocess.run(["systemctl", "show", service, "--property=WorkingDirectory", "--value"], capture_output=True, text=True, check=False)
    value = result.stdout.strip()
    if result.returncode != 0 or not value:
        print("HMO donation maintenance: service not present; no changes")
        return
    root = Path(value)
    if not root.is_absolute() or str(root.resolve()) in {"/", "/var", "/var/www", "/opt", "/home"} or not (root / "src/server.js").is_file():
        raise RuntimeError("Unexpected HMO service source directory; no changes made")
    # Check the service is live before editing, so maintenance never starts a
    # disabled service or masks a pre-existing deployment problem.
    subprocess.run(["systemctl", "is-active", "--quiet", service], check=True)
    backup = root / ".sylp-donation-backup" / str(time.time_ns())
    changed = replace_public_links(root, backup)
    environment_files = [root / ".env", root / ".env.production", root / ".env.local"]
    settings = subprocess.run(["systemctl", "show", service, "--property=EnvironmentFiles", "--value"], capture_output=True, text=True, check=True)
    for token in shlex.split(settings.stdout):
        if token.startswith("/"):
            candidate = Path(token)
            if candidate.is_relative_to("/etc") or candidate.is_relative_to(root):
                environment_files.append(candidate)
    try:
        changed.extend(replace_env_links(environment_files, backup))
    except Exception:
        restore(changed)
        raise
    if not changed:
        print("HMO donation maintenance: no old links remain in public source or donation settings")
        return
    try:
        subprocess.run(["systemctl", "restart", service], check=True)
        time.sleep(2)
        subprocess.run(["systemctl", "is-active", "--quiet", service], check=True)
    except Exception:
        restore(changed)
        subprocess.run(["systemctl", "restart", service], check=False)
        raise
    print(f"HMO donation maintenance: updated {len(changed)} files; service active; backups retained")


if __name__ == "__main__":
    main()
