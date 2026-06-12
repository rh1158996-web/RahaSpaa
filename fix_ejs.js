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

            // Fix the syntax error introduced by the bad regex
            newContent = newContent.replace(/<%= ([a-zA-Z0-9_]+)\["([a-zA-Z0-9_]+)'\] %>/g, "<%= $1['$2'] %>");
            newContent = newContent.replace(/<%= ([a-zA-Z0-9_]+)\[id'\] %>/g, "<%= $1['id'] %>");
            newContent = newContent.replace(/<%= ([a-zA-Z0-9_]+)\[([a-zA-Z0-9_]+)'\] %>/g, "<%= $1['$2'] %>");
            
            // Also need to properly remove .php from hrefs without breaking ejs blocks
            // The bad regex was: href=["']([^"']*)\.php(\?[^"']*)?["']
            // If the original was href="booking.php?service_id=<%= s['id'] %>"
            // Let's just fix any remaining .php references manually for safety
            newContent = newContent.replace(/\.php(\?[a-zA-Z0-9_=]+<%=)/g, '$1');

            // Find any literal ".php" strings inside href= or action= and replace them safely
            newContent = newContent.replace(/href="([^"]+)\.php"/g, 'href="$1"');
            newContent = newContent.replace(/action="([^"]+)\.php"/g, 'action="$1"');

            if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent);
                console.log('Fixed syntax:', fullPath);
            }
        }
    }
}

processDir(path.join(__dirname, 'views'));
