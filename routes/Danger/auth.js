module.exports = {
    checkLogin: function (req, res, next) {
        if (!req.session.company || !req.session.danger) {
            if (req.method == "GET") {
                res.redirect('/danger/login');
                return;
            } else {
                res.jsonp({
                    error: "not login"
                });
                return;
            }
        }
        next();
    },
    checkNotLogin: function (req, res, next) {
        if (req.session.danger) {
            res.redirect('back'); //返回之前的页面
            return;
        }
        next();
    }
};