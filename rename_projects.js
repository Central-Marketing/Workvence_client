const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const srcDir = path.join(__dirname, 'src');

// 1. Move directory
const srcPackages = path.join(__dirname, 'src/app/packages');
const destProjects = path.join(__dirname, 'src/app/projects');
if (fs.existsSync(srcPackages)) {
  console.log('Moving src/app/packages -> src/app/projects');
  fs.renameSync(srcPackages, destProjects);
}

// 2. Global Replace /packages with /projects
function walkSync(dir, callback) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filepath = path.join(dir, file);
    const stats = fs.statSync(filepath);
    if (stats.isDirectory()) {
      walkSync(filepath, callback);
    } else if (stats.isFile()) {
      callback(filepath);
    }
  });
}

const exts = ['.ts', '.tsx', '.js', '.jsx', '.scss', '.css'];

walkSync(srcDir, (filepath) => {
  if (!exts.includes(path.extname(filepath))) return;

  let content = fs.readFileSync(filepath, 'utf8');
  let original = content;

  // Replace /packages with /projects
  content = content.replace(/\/packages/g, '/projects');
  
  if (content !== original) {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`Updated: ${filepath.replace(__dirname, '')}`);
  }
});

console.log('Done mapping /packages to /projects');
