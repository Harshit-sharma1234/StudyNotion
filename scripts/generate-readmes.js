/*
 Generates README.md files in all subdirectories starting from the repo root,
 excluding common directories like node_modules, build, and .git. Each README
 is initialized with a small template if it does not already exist.
*/

const fs = require('fs');
const path = require('path');

const repoRoot = process.cwd();

const EXCLUDED_DIR_NAMES = new Set(['node_modules', 'build', '.git']);

function isExcludedDir(dirPath) {
  const name = path.basename(dirPath);
  return EXCLUDED_DIR_NAMES.has(name);
}

function ensureReadmeForDir(dirPath) {
  const readmePath = path.join(dirPath, 'README.md');
  if (fs.existsSync(readmePath)) {
    return; // Do not overwrite existing README
  }
  let relativePath = path.relative(repoRoot, dirPath) || '.';
  const title = path.basename(dirPath) || path.basename(repoRoot);
  const content = `# ${title}\n\nPath: ${relativePath}\n\nDescribe the purpose of this folder, key files, and how to use it.\n`;
  fs.writeFileSync(readmePath, content, { encoding: 'utf8' });
}

function walkAndGenerate(currentDir) {
  if (isExcludedDir(currentDir)) return;

  // Create README for the current directory
  ensureReadmeForDir(currentDir);

  const entries = fs.readdirSync(currentDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const nextDir = path.join(currentDir, entry.name);
    if (isExcludedDir(nextDir)) continue;
    walkAndGenerate(nextDir);
  }
}

walkAndGenerate(repoRoot);
console.log('README.md generation complete.');


