#!/usr/bin/env python3
"""Idempotent maintenance for the co-hosted HMO site's public donation URL.

Uses the existing hmo-report service's working directory. Does not access reports,
contact data, secrets, dependencies or upload directories. Backs up changed source
files and restores them if the service cannot restart. No effect on other hosts.
"""
import os
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
    if not changed:
        print("HMO donation maintenance: no old links remain in public source")
        return
    try:
        subprocess.run(["systemctl", "restart", service], check=True)
        time.sleep(2)
        subprocess.run(["systemctl", "is-active", "--quiet", service], check=True)
    except Exception:
        restore(changed)
        subprocess.run(["systemctl", "restart", service], check=False)
        raise
    print(f"HMO donation maintenance: updated {len(changed)} source files; service active; backups retained")


if __name__ == "__main__":
    main()
