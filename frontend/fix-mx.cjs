const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'src', 'pages', 'account');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  // Replace "max-w-4xl mx-auto" with "max-w-4xl" 
  // It handles any size (e.g. 5xl, 6xl, 2xl) and preserves following classes
  content = content.replace(/className="max-w-([0-9a-z]+)\s+mx-auto/g, 'className="max-w-$1');
  fs.writeFileSync(filePath, content);
}
console.log('Replaced mx-auto in all account pages');
