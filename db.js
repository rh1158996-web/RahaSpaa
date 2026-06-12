const mysql = require('mysql2/promise');

let pool = null;

function getPool() {
    if (!pool) {
        if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
            console.warn('[db.js] WARNING: Database environment variables (DB_HOST, DB_USER, DB_NAME) are not set. Queries will return empty results.');
        }
        pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'raha_spa',
            waitForConnections: true,
            connectionLimit: 5,
            queueLimit: 0,
            connectTimeout: 10000,
            enableKeepAlive: false
        });
    }
    return pool;
}

// Safe query wrapper — returns [[], fields] on DB error instead of throwing
const safePool = {
    query: async (...args) => {
        try {
            return await getPool().query(...args);
        } catch (err) {
            console.error('[db.js] Query error:', err.message);
            throw err; // re-throw so individual route handlers can catch it
        }
    },
    execute: async (...args) => {
        try {
            return await getPool().execute(...args);
        } catch (err) {
            console.error('[db.js] Execute error:', err.message);
            throw err;
        }
    }
};

module.exports = safePool;
