require('dotenv').config();
const express = require('express');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const path = require('path');
const cors = require('cors');
const pool = require('./db');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use memory storage for file uploads (Vercel has no writable disk)
app.use(fileUpload({
    useTempFiles: false,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
}));

// Session (in-memory — persists per function instance; acceptable for serverless)
app.use(session({
    secret: process.env.SESSION_SECRET || 'raha_spa_secret_key_2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Serve static assets
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/admin/css', express.static(path.join(__dirname, 'admin', 'css')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Global Middleware — attach language, settings, and helpers to res.locals
app.use(async (req, res, next) => {
    try {
        if (req.query.lang && ['en', 'ar'].includes(req.query.lang)) {
            req.session.lang = req.query.lang;
        }
        const current_lang = req.session.lang || 'ar';
        const lang = current_lang === 'en'
            ? require('./includes/lang_en.js')
            : require('./includes/lang_ar.js');
        const dir = current_lang === 'en' ? 'ltr' : 'rtl';

        let settings = {};
        try {
            const [rows] = await pool.query('SELECT setting_key, setting_value FROM settings');
            rows.forEach(r => { settings[r.setting_key] = r.setting_value; });
        } catch (e) {
            // DB may not be configured — silently continue with empty settings
            console.warn('[server.js] Could not load settings from DB:', e.message);
        }

        const site_name = settings['site_name_' + current_lang] || (current_lang === 'ar' ? 'راحة سبا' : 'Raha Spa');

        res.locals.current_lang = current_lang;
        res.locals.lang = lang;
        res.locals.dir = dir;
        res.locals.settings = settings;
        res.locals.site_name = site_name;
        res.locals._SESSION = req.session;

        // PHP-style helpers used in EJS templates
        res.locals.number_format = (num, dec) => Number(num || 0).toFixed(dec || 0);
        res.locals.strtotime = (str) => str ? new Date(str).getTime() : 0;
        res.locals.date = (fmt, ts) => ts ? new Date(ts).toLocaleDateString() : '';
        res.locals.empty = (val) => !val || (Array.isArray(val) ? val.length === 0 : String(val).trim() === '');

        next();
    } catch (err) {
        console.error('[server.js] Global middleware error:', err);
        next(err);
    }
});

// Import Routes
app.use('/', require('./routes/pages'));
app.use('/', require('./routes/api'));
app.use('/admin', require('./routes/admin'));

// 404 handler
app.use((req, res) => {
    res.status(404).send('<h2>404 - Page Not Found</h2><a href="/">Go Home</a>');
});

// Global error handler — prevents Vercel FUNCTION_INVOCATION_FAILED crashes
app.use((err, req, res, next) => {
    console.error('[server.js] Unhandled error:', err.stack || err);
    if (res.headersSent) return next(err);
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
    });
});

// Local dev server
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`✅ Raha Spa running at http://localhost:${PORT}`);
    });
}

module.exports = app;
