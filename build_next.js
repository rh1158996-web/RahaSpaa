const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'views');
const targetDir = path.join(__dirname, 'next-spa');

if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir);

// Initialize Next.js structure
const packageJson = {
  "name": "raha-spa-next",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.2.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "mysql2": "^3.9.7",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2"
  }
};
fs.writeFileSync(path.join(targetDir, 'package.json'), JSON.stringify(packageJson, null, 2));

const nextConfig = `
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: { remotePatterns: [] }
};
export default nextConfig;
`;
fs.writeFileSync(path.join(targetDir, 'next.config.js'), nextConfig);

// Setup directories
const appDir = path.join(targetDir, 'app');
if (!fs.existsSync(appDir)) fs.mkdirSync(appDir);
if (!fs.existsSync(path.join(appDir, 'api'))) fs.mkdirSync(path.join(appDir, 'api'));
if (!fs.existsSync(path.join(targetDir, 'public'))) fs.mkdirSync(path.join(targetDir, 'public'));
if (!fs.existsSync(path.join(targetDir, 'lib'))) fs.mkdirSync(path.join(targetDir, 'lib'));
if (!fs.existsSync(path.join(targetDir, 'components'))) fs.mkdirSync(path.join(targetDir, 'components'));

// Copy CSS and JS
function copyRecursive(src, dest) {
    if (fs.existsSync(src)) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        for (const file of fs.readdirSync(src)) {
            const srcPath = path.join(src, file);
            const destPath = path.join(dest, file);
            if (fs.statSync(srcPath).isDirectory()) {
                copyRecursive(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        }
    }
}
copyRecursive(path.join(__dirname, 'css'), path.join(targetDir, 'public', 'css'));
copyRecursive(path.join(__dirname, 'js'), path.join(targetDir, 'public', 'js'));
copyRecursive(path.join(__dirname, 'admin', 'css'), path.join(targetDir, 'public', 'admin', 'css'));
if (fs.existsSync(path.join(__dirname, 'uploads'))) {
    copyRecursive(path.join(__dirname, 'uploads'), path.join(targetDir, 'public', 'uploads'));
}

// Convert DB logic
const dbJs = `import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'raha_spa',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default pool;
`;
fs.writeFileSync(path.join(targetDir, 'lib', 'db.js'), dbJs);

console.log("Base Next.js project created!");
