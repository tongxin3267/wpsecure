module.exports = {
    checkLogin: function (req, res, next) {
        if (!req.session.user) {
            if (req.method == "GET") {
                res.redirect('/Client/login');
                return;
            } else {
                res.jsonp({
                    error: "not login"
                });
                return;
            }
        }
        next();
    }
};