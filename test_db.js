const pool = require('./db');
(async () => {
    try {
        const [[{ total_bookings }]] = await pool.query('SELECT COUNT(*) as total_bookings FROM bookings');
        console.log("total_bookings:", total_bookings);
        const [[{ pending_bookings }]] = await pool.query("SELECT COUNT(*) as pending_bookings FROM bookings WHERE status='Pending'");
        console.log("pending_bookings:", pending_bookings);
        const [[{ total_users }]] = await pool.query('SELECT COUNT(*) as total_users FROM users');
        console.log("total_users:", total_users);
        const [[{ total_revenue }]] = await pool.query("SELECT COALESCE(SUM(s.price),0) as total_revenue FROM bookings b JOIN services s ON b.service_id=s.id WHERE b.status='Completed'");
        console.log("total_revenue:", total_revenue);
        const [recent_bookings] = await pool.query(`
            SELECT b.*, CONCAT(u.first_name,' ',u.last_name) as customer_name,
                   s.name_en as service_name
            FROM bookings b
            JOIN users u ON b.user_id=u.id
            JOIN services s ON b.service_id=s.id
            WHERE b.status='Pending'
            ORDER BY b.created_at DESC LIMIT 10
        `);
        console.log("recent_bookings:", recent_bookings.length);
    } catch(e) {
        console.error("ERROR:", e);
    }
    process.exit();
})();
