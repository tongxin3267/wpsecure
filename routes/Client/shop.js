var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    Shop = model.shop,
    ShopGood = model.shopGood,
    GoodType = model.goodType,
    Order = model.order,
    OrderSeq = model.orderSeq,
    OrderDetail = model.orderDetail,
    Good = model.good,
    GoodAttribute = model.goodAttribute,
    GoodAttrVal = model.goodAttrVal,
    ShopGoodAttrVal = model.shopGoodAttrVal,
    User = model.user,
    Ws_user = model.ws_user,
    WechatHelper = require('../../util/wechatHelper'),
    crypto = require('crypto'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/Client/manage', auth.checkLogin.bind(auth));
    app.get('/Client/manage', auth.checkManager.bind(auth));
    app.get('/Client/manage', function (req, res) {
        res.render('Client/manage.html', {
            title: '管理中心',
            user: req.session.manager
        });
    });

    app.get('/Client/manage/login', auth.checkLogin.bind(auth));
    app.get('/Client/manage/login', function (req, res) {
        res.render('Client/manageLogin.html', {
            title: '管理中心',
            user: req.session.user
        });
    });

    app.post('/Client/manage/login', auth.checkLogin.bind(auth));
    app.post('/Client/manage/login', function (req, res) {
        // 日志
        User.getFilter({
                name: req.body.name
            })
            .then(user => {
                var md5 = crypto.createHash('md5'),
                    password = md5.update(req.body.password).digest('hex');
                if (user.password == password) {
                    req.session.manager = user;
                    return res.redirect('/Client/manage');
                } else {
                    return res.redirect('/Client/manage/login?err=1')
                }
            });
    });
}