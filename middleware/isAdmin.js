async function isAdmin(req, res, next) {
    try {
        if (!req.session.userId || req.session.role !== "Admin") {
            return res.redirect('/'); // Redirect ke halaman utama jika bukan admin
        }
        next();
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
}

//mm

module.exports = isAdmin;