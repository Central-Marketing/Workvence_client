const fs = require('fs');

const filesToFix = [
  './src/app/packages/page.tsx',
  './src/app/my-packages/page.tsx',
  './src/app/organize/[id]/page.tsx',
  './src/app/organize/page.tsx',
];

for (const file of filesToFix) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace variable names
  content = content.replace(/\(package: any\)/g, '(pkg: any)');
  content = content.replace(/package\._id/g, 'pkg._id');
  content = content.replace(/package\.title/g, 'pkg.title');
  content = content.replace(/package\./g, 'pkg.');
  
  // Also any standalone package that's passed as a variable (like mutation.mutate(package))
  content = content.replace(/\(package\)/g, '(pkg)');
  content = content.replace(/, package\)/g, ', pkg)');
  
  fs.writeFileSync(file, content, 'utf8');
}

console.log('Fixed reserved keyword package');
