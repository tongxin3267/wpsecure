var crypto = require('crypto'),
    model = require("../../model.js"),
    Shop = model.shop;

module.exports = {
    checkSession: function (req, res, next) {
        if (!req.session.user) {
            this.gotoError();
            return;
        }
        next();
    },
    gotoError: function (req, res) {
        if (req.method == "GET") {
            res.render("404.html", {
                websiteTitle: "404"
            });
        } else {
            res.jsonp({
                error: "not login"
            });
        }
    },
    checkLogin: function (req, res, next) {
        if (!req.body.shopId || !req.body.awstoken) {
            this.gotoError();
            return;
        }
        Shop.getFilter({ _id: req.body.shopId })
            .then(shop => {
                if (shop) {
                    var md5 = crypto.createHash('md5'),
                        token = md5.update(shop.password).digest('hex');
                    if (token == req.body.awstoken) {
                        next();
                    }
                    else {
                        this.gotoError();
                    }
                }
            });
    }
};