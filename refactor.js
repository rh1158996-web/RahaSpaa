const fs = require('fs');
const path = require('path');

// 1. Remove .php from all EJS files
function removePhpFromViews(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            removePhpFromViews(fullPath);
        } else if (fullPath.endsWith('.ejs')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            // Remove .php from hrefs and actions
            content = content.replace(/href="([^"]+)\.php(\?[^"]*)?"/g, 'href="$1$2"');
            content = content.replace(/action="([^"]+)\.php(\?[^"]*)?"/g, 'action="$1$2"');
            // specifically handle index.php to /
            content = content.replace(/href="index"/g, 'href="/"');
            content = content.replace(/href="\/index"/g, 'href="/"');
            content = content.replace(/href="admin\/index"/g, 'href="/admin"');
            
            // Fix some hardcoded strings
            content = content.replace(/current_page=='([^']+)\.php'/g, "current_page=='$1'");
            content = content.replace(/current_page \+ '\.php'/g, "current_page");

            fs.writeFileSync(fullPath, content);
        }
    }
}

removePhpFromViews(path.join(__dirname, 'views'));
console.log('Removed .php from views');

// 2. Rewrite Routes to remove .php
function removePhpFromRoutes(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            content = content.replace(/\.php/g, '');
            // fix index route to just /
            content = content.replace(/router\.get\('\/index'/g, "router.get('/'");
            // fix redirects
            content = content.replace(/redirect\('\/index'\)/g, "redirect('/')");
            fs.writeFileSync(fullPath, content);
        }
    }
}
removePhpFromRoutes(path.join(__dirname, 'routes'));
console.log('Removed .php from routes');

// 3. Create api/index.js for Vercel
if (!fs.existsSync(path.join(__dirname, 'api'))) {
    fs.mkdirSync(path.join(__dirname, 'api'));
}
const apiIndex = `const app = require('../server.js');
module.exports = app;`;
fs.writeFileSync(path.join(__dirname, 'api/index.js'), apiIndex);
console.log('Created api/index.js');

// 4. Clean up Vercel JSON
const vercelJson = `{
  "version": 2,
  "rewrites": [
    {
      "source": "/css/(.*)",
      "destination": "/css/$1"
    },
    {
      "source": "/js/(.*)",
      "destination": "/js/$1"
    },
    {
      "source": "/admin/css/(.*)",
      "destination": "/admin/css/$1"
    },
    {
      "source": "/uploads/(.*)",
      "destination": "/uploads/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/api/index.js"
    }
  ]
}`;
fs.writeFileSync(path.join(__dirname, 'vercel.json'), vercelJson);
console.log('Updated vercel.json');

console.log('Refactoring complete.');
