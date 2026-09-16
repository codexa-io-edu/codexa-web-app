const fs = require('fs');
const path = require('path');

const rootDir = 'C:\\Users\\JAGADEESH M\\Documents\\CourseContent\\modules';

function scanDir(dir, depth = 0) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    const indent = '  '.repeat(depth);
    if (item.isDirectory()) {
      const childItems = fs.readdirSync(fullPath);
      const mdFiles = childItems.filter(f => f.endsWith('.md'));
      const subDirs = childItems.filter(f => fs.statSync(path.join(fullPath, f)).isDirectory());
      console.log(`${indent}📁 [DIR] ${item.name} (${mdFiles.length} md files, ${subDirs.length} subdirs)`);
      if (depth < 3) {
        scanDir(fullPath, depth + 1);
      }
    }
  }
}

console.log('=== SCANNING COURSE CONTENT ===');
scanDir(rootDir);
