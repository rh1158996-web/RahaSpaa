const fs = require('fs');
const path = require('path');
const adminPath = path.join(__dirname, 'views', 'admin');

fs.readdirSync(adminPath).filter(f => f.endsWith('.ejs')).forEach(f => {
    const p = path.join(adminPath, f);
    let c = fs.readFileSync(p, 'utf8');
    let original = c;
    c = c.replace(/<html lang="en">/g, '<html lang="ar" dir="rtl">');
    if (c !== original) {
        fs.writeFileSync(p, c);
        console.log('Fixed', f);
    }
});
