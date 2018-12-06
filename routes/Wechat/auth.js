module.exports = {
    checkLogin: function (req, res, next) {
        //if (!req.session.admin || req.session.admin.name != "11") {
        if (!req.session.wechat) {
            if (req.method == "GET") {
                res.redirect('/wechat/login');
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
        //if (req.session.admin && req.session.admin.name == "11") {
        if (req.session.wechat) {
            res.redirect('back'); //返回之前的页面
            return;
        }
        next();
    },
    checkSecure: function (passRoles) {
        return function (req, res, next) {
            if (passRoles.some(function (role) {
                    return role == req.session.wechat.role;
                })) {
                next();
                return;
            } else {
                if (req.method == "GET") {
                    res.render("401.html");
                    return;
                } else {
                    res.status(401).send("NOT FOUND");
                    return;
                }
            }
        };
    }
};