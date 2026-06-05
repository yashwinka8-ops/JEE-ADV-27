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
      
      // We want to find style={{ display: 'grid' ... }} and add className="mobile-stack-grid"
      // Note: we only do this if it's NOT the 7-day journal grid
      let modified = false;
      
      // Regex to find <div> or other tags that have style={{ display: 'grid', ... }}
      content = content.replace(/<([a-zA-Z0-9]+)([^>]*?style={{[^}]*display:\s*['"]grid['"][^}]*}}[^>]*?)>/g, (match, tag, rest) => {
        // Skip the journal mood tracker
        if (match.includes('repeat(7') || match.includes('auto-fill')) {
          return match;
        }
        
        // If it already has a className, append to it
        if (rest.includes('className=')) {
          if (!match.includes('mobile-stack-grid')) {
            modified = true;
            return match.replace(/className=['"]([^'"]*)['"]/, 'className="$1 mobile-stack-grid"');
          }
          return match;
        } else {
          // Add className
          modified = true;
          return `<${tag} className="mobile-stack-grid"${rest}>`;
        }
      });

      if (modified) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDir(path.join(__dirname, 'app'));
