import importlib.util
from pathlib import Path
import tempfile
import unittest

script = Path(__file__).resolve().parents[2] / "deploy/update-hmo-donation-link.py"
spec = importlib.util.spec_from_file_location("hmo_maintenance", script)
maintenance = importlib.util.module_from_spec(spec)
spec.loader.exec_module(maintenance)

class HmoDonationLinkTest(unittest.TestCase):
    def test_only_public_source_changes_and_is_recoverable(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            for name in ["public/index.html", "src/server.js", "data/report.json", "uploads/evidence.html", "node_modules/example.js", ".env"]:
                path = root / name
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_bytes(maintenance.OLD)
            backup = root / ".sylp-donation-backup/test"
            changed = maintenance.replace_public_links(root, backup)
            self.assertEqual({str(path.relative_to(root)) for path, _ in changed}, {"public/index.html", "src/server.js"})
            self.assertEqual((root / "public/index.html").read_bytes(), maintenance.NEW)
            self.assertEqual((root / "data/report.json").read_bytes(), maintenance.OLD)
            self.assertEqual((root / "uploads/evidence.html").read_bytes(), maintenance.OLD)
            self.assertEqual(maintenance.replace_public_links(root, backup), [])
            maintenance.restore(changed)
            self.assertEqual((root / "public/index.html").read_bytes(), maintenance.OLD)

    def test_does_not_follow_external_symlinks(self):
        with tempfile.TemporaryDirectory() as directory:
            base = Path(directory)
            root = base / "site"
            root.mkdir()
            outside = base / "outside.html"
            outside.write_bytes(maintenance.OLD)
            (root / "linked.html").symlink_to(outside)
            self.assertEqual(maintenance.replace_public_links(root, root / ".backup"), [])
            self.assertEqual(outside.read_bytes(), maintenance.OLD)

if __name__ == "__main__":
    unittest.main()
