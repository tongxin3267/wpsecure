module.exports = {
    checkLogin: function (req, res, next) {
        if (!req.session.company || !req.session.people) {
            if (req.method == "GET") {
                res.redirect('/people/login');
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
        if (req.session.people) {
            res.redirect('back'); //返回之前的页面
            return;
        }
        next();
    }
};