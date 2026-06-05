const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let modified = false;
      
      // We want to add flexWrap: 'wrap' and gap: 16 to any flex container with space-between
      const newContent = content.replace(/(style={{[^}]*display:\s*['"]flex['"][^}]*justifyContent:\s*['"]space-between['"])([^}]*}})/g, (match, p1, p2) => {
        if (!match.includes('flexWrap:')) {
          modified = true;
          // Inject flexWrap: 'wrap' and gap: 16
          return p1 + ", flexWrap: 'wrap', gap: 16" + p2;
        }
        return match;
      });

      if (modified) {
        fs.writeFileSync(fullPath, newContent);
        console.log(`Updated flex header in: ${fullPath}`);
      }
    }
  }
}

processDir(path.join(__dirname, 'app'));
