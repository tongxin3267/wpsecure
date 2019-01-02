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
    Ws_user = model.ws_user,
    WechatHelper = require('../../util/wechatHelper'),
    crypto = require('crypto'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/Client/manage', auth.checkLogin);
    app.get('/Client/manage', function (req, res) {
        res.render('Client/manage.html', {
            title: '管理中心',
            user: req.session.manager,
            shopId: req.session.user._id,
            awstoken: token
        });
    });

    app.get('/Client/manage/login', auth.checkLogin);
    app.get('/Client/manage/login', function (req, res) {
        res.render('Client/manageLogin.html', {
            title: '管理中心',
            user: req.session.user,
            shopId: req.session.user._id,
            awstoken: token
        });
    });

    app.post('/Client/manage/login', auth.checkLogin);
    app.post('/Client/manage/login', function (req, res) {
       
    });
}