const fs = require('fs');
const path = require('path');

function processDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.ejs') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let newContent = content;

            // Remove .php from local hrefs and form actions
            newContent = newContent.replace(/href=["']([^"']*)\.php(\?[^"']*)?["']/g, 'href="$1$2"');
            newContent = newContent.replace(/action=["']([^"']*)\.php(\?[^"']*)?["']/g, 'action="$1$2"');
            
            // Fix Express route definitions
            newContent = newContent.replace(/router\.(get|post)\(['"]\/([a-zA-Z0-9_-]+)\.php['"]/g, "router.$1('/$2'");
            newContent = newContent.replace(/router\.(get|post)\(['"]\/index\.php['"]/g, "router.$1('/'");
            
            // Fix Express redirects
            newContent = newContent.replace(/res\.redirect\(['"]\/([a-zA-Z0-9_-]+)\.php(\?[^"']*)?['"]/g, "res.redirect('/$1$2'");
            newContent = newContent.replace(/res\.redirect\(['"]\/index\.php['"]/g, "res.redirect('/'");
            newContent = newContent.replace(/res\.redirect\(['"]\/admin\/index\.php['"]/g, "res.redirect('/admin/dashboard'");

            // Fix string literal .php references
            newContent = newContent.replace(/current_page\s*==\s*['"]([a-zA-Z0-9_-]+)\.php['"]/g, "current_page == '$1'");
            newContent = newContent.replace(/page \+ '\.php'/g, "page");
            
            // Update sidebar.ejs specifically
            newContent = newContent.replace(/const current_page = \(typeof page !== 'undefined' \? page : 'dashboard'\) \+ '\.php';/g, "const current_page = (typeof page !== 'undefined' ? page : 'dashboard');");

            if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent);
                console.log('Cleaned:', fullPath);
            }
        }
    }
}

console.log("Cleaning up .php extensions...");
processDir(path.join(__dirname, 'views'));
processDir(path.join(__dirname, 'routes'));
console.log("Cleanup complete!");
