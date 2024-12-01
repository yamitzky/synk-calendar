const fs = require('node:fs');
const path = require('node:path');

function createSymlinks(sourceDir, targetDir) {
  console.log('Creating symlinks from', sourceDir, 'to', targetDir);

  if (!fs.existsSync(sourceDir)) {
    console.error(`Source directory does not exist: ${sourceDir}`);
    return;
  }

  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      createSymlinks(sourcePath, targetPath);
    } else if (entry.isSymbolicLink()) {
      const originalLinkPath = fs.readlinkSync(sourcePath);
      const absoluteLinkTarget = path.resolve(sourceDir, originalLinkPath);
      const relativeLinkTarget = path.relative(targetDir, absoluteLinkTarget);

      if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
        fs.symlinkSync(relativeLinkTarget, targetPath, 'junction');
        console.log(`Linked: ${targetPath} -> ${relativeLinkTarget}`);
      } else {
        console.log(`Skipped: ${targetPath} (already exists)`);
      }
    }
  }
}

const sourceNodeModules = path.resolve(__dirname, 'apps/web/node_modules');
const targetNodeModules = path.resolve(__dirname, 'node_modules');

createSymlinks(sourceNodeModules, targetNodeModules);
