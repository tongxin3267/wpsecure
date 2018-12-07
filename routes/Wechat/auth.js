module.exports = {
    adminCheckLogin: function (req, res, next) {
        //if (!req.session.admin || req.session.admin.name != "11") {
        if (!req.session.wechatAdmin) {
            if (req.method == "GET") {
                res.redirect('/wechatAdmin/login');
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
    adminCheckNotLogin: function (req, res, next) {
        //if (req.session.admin && req.session.admin.name == "11") {
        if (req.session.wechatAdmin) {
            res.redirect('back'); //返回之前的页面
            return;
        }
        next();
    },
    adminCheckSecure: function (passRoles) {
        return function (req, res, next) {
            if (passRoles.some(function (role) {
                    return role == req.session.wechatAdmin.role;
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