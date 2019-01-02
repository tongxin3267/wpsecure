var crypto = require('crypto'),
    model = require("../../model.js"),
    Shop = model.shop,
    request = require('request'),
    auth = require("./auth");

module.exports = function (app) {
    app.get('/Client/login', function (req, res) {
        req.session.user = null;
        res.render('Client/login.html', {
            title: '主页'
        });
    });

    app.get('/Client', auth.checkLogin);
    app.get('/Client', function (req, res) {
        res.render('Client/index.html', {
            title: '个人中心',
            user: req.session.user
        });
    });

    app.post('/Client/login', function (req, res) {
        //检查用户是否存在
        Shop.getFilter({
                name: req.body.name
            })
            .then(shop => {
                if (shop.password == req.body.password) {
                    req.session.user = shop;
                    var newpassword = Math.random().toString(12).substr(2, 10);

                    // update password
                    Shop.update({
                            password: newpassword
                        }, {
                            where: {
                                name: req.body.name,
                            }
                        })
                        .then(() => {
                            // sucess
                            return res.redirect('/Client')
                        });
                } else {
                    return res.redirect('/Client/login?err=1')
                }
            });
    });
}