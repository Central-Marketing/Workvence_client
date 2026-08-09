const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.scss') || file.endsWith('.css') || file.endsWith('.js') || file.endsWith('.jsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(directoryPath);
let modifiedFiles = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Replace Tailwind arbitrary values
    content = content.replace(/([a-zA-Z0-9:-]+)\[#(1dbf73|19a463|46b21b|6ad724|1ebf73)\]/gi, (match, prefix) => {
        return prefix + 'brand-green';
    });

    // Replace raw hex codes for SCSS or SVG fills
    content = content.replace(/#(1dbf73|19a463|46b21b|46B21B|6AD724|1DBF73|19A463|1ebf73)/gi, '#6ad724');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        modifiedFiles++;
        console.log(`Modified: ${file}`);
    }
});

console.log(`Total modified files: ${modifiedFiles}`);
