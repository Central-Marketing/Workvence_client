const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

// 1. Move directory back
const srcProjects = path.join(__dirname, 'src/app/projects');
const destPackages = path.join(__dirname, 'src/app/packages');
if (fs.existsSync(srcProjects)) {
  console.log('Moving src/app/projects -> src/app/packages');
  fs.renameSync(srcProjects, destPackages);
}

// 2. Global Replace /projects with /packages
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

  // Replace /projects with /packages
  content = content.replace(/\/projects/g, '/packages');
  
  if (content !== original) {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`Updated: ${filepath.replace(__dirname, '')}`);
  }
});

console.log('Reverted /projects to /packages');
