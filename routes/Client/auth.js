var crypto = require('crypto'),
    model = require("../../model.js"),
    Shop = model.shop,
    auth = {
        checkSession: function (auth) {
            return function (req, res, next) {
                if (!req.session.user) {
                    auth.gotoError(req, res);
                    return;
                }
                next();
            }
        },
        gotoError: function (req, res) {
            if (req.method == "GET") {
                res.redirect("/Client/login");
                // res.render("404.html", {
                //     websiteTitle: "404"
                // });
            } else {
                res.jsonp({
                    error: "not login"
                });
            }
        },
        checkLogin: function (auth, needShop) {
            return function (req, res, next) {
                if (!req.cookies['shopId'] || !req.cookies['awstoken']) {
                    auth.gotoError(req, res);
                    return;
                }
                Shop.getFilter({
                        _id: req.cookies['shopId']
                    })
                    .then(shop => {
                        if (shop) {
                            var md5 = crypto.createHash('md5'),
                                token = md5.update(shop.password).digest('hex');
                            if (token == req.cookies['awstoken']) {
                                if (needShop) {
                                    req.session.user = shop;
                                }
                                next();
                            } else {
                                that.gotoError(req, res);
                            }
                        }
                    });
            };
        },
        checkManager: function (req, res, next) {
            if (!req.session.manager) {
                if (req.method == "GET") {
                    res.redirect("/Client/manage/login");
                } else {
                    res.jsonp({
                        error: "not login"
                    });
                }
                return;
            }
            next();
        },
    };
// auth.checkSession();
module.exports = auth;