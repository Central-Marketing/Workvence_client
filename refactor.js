const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const srcDir = path.join(__dirname, 'src');

// 1. Rename Directories and Files
const moves = [
  ['src/app/gig', 'src/app/package'],
  ['src/app/gigs', 'src/app/packages'],
  ['src/app/my-gigs', 'src/app/my-packages'],
  ['src/components/GigCard', 'src/components/PackageCard'],
  ['src/components/PackageCard/GigCard.tsx', 'src/components/PackageCard/PackageCard.tsx'],
  ['src/components/PackageCard/GigCard.scss', 'src/components/PackageCard/PackageCard.scss'],
  ['src/reducers/gigReducer.js', 'src/reducers/packageReducer.js'],
  ['src/app/my-packages/MyGigs.scss', 'src/app/my-packages/MyPackages.scss'],
  ['src/app/organize/[id]/page.tsx', 'src/app/organize/[id]/page.tsx'], // No rename needed here, but its imports will change
];

for (const [src, dest] of moves) {
  const fullSrc = path.join(__dirname, src);
  const fullDest = path.join(__dirname, dest);
  if (fs.existsSync(fullSrc)) {
    if (fullSrc !== fullDest) {
      console.log(`Moving ${src} -> ${dest}`);
      fs.renameSync(fullSrc, fullDest);
    }
  } else {
    console.log(`Warning: ${src} not found.`);
  }
}

// 2. Global Replace
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

  // Replacements
  // 1. MyGigs -> MyPackages (PascalCase)
  content = content.replace(/MyGigs/g, 'MyPackages');
  content = content.replace(/myGigs/g, 'myPackages');
  content = content.replace(/my-gigs/g, 'my-packages');

  // 2. GigCard -> PackageCard
  content = content.replace(/GigCard/g, 'PackageCard');
  
  // 3. gigReducer -> packageReducer
  content = content.replace(/gigReducer/g, 'packageReducer');
  
  // 4. Gig -> Package (PascalCase and Capitalized)
  content = content.replace(/Gig(s?)/g, (match, p1) => `Package${p1}`);
  
  // 5. gig -> package (lowercase)
  // We need to be careful with words containing 'gig', but in this project it's mostly standalone or camelCase
  // Using a lookaround to avoid replacing inside middle of words, but simple replace might be enough if no conflict
  // We'll replace all 'gig' and 'gigs' globally, except we will restore axiosFetch urls afterwards
  content = content.replace(/gigs/g, 'packages');
  content = content.replace(/gig/g, 'package');
  
  // 6. Restore API endpoint calls
  // The API endpoints used are: /gigs, /gigs/${id}, etc.
  // Because we changed 'gigs' to 'packages', they became /packages
  // We look for axiosFetch.*('/packages
  // We can just look for /packages in quotes when inside axiosFetch, or more simply:
  // any string matching axiosFetch.*['"`]\/packages
  content = content.replace(/axiosFetch([.\w]*)\(\s*(['"`])\/packages/g, 'axiosFetch$1($2/gigs');
  
  if (content !== original) {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`Updated: ${filepath.replace(__dirname, '')}`);
  }
});

console.log('Refactor complete!');
