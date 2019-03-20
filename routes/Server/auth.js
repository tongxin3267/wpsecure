var model = require("../../model.js"),
    SiteInfo = model.siteInfo;

module.exports = {
    checkLogin: function (req, res, next) {
        //if (!req.session.admin || req.session.admin.name != "11") {
        if (!req.session.admin) {
            if (req.method == "GET") {
                res.redirect('/admin/login');
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
        if (req.session.admin) {
            res.redirect('back'); //返回之前的页面
            return;
        }
        next();
    },
    checkSecure: function (passRoles) {
        return function (req, res, next) {
            if (passRoles.some(function (role) {
                    return role == req.session.admin.role;
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