var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    Shop = model.shop,
    ShopGood = model.shopGood,
    ShopPath = model.shopPath,
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
    app.get('/Client/manage', auth.checkLogin().bind(auth));
    app.get('/Client/manage', auth.checkManager.bind(auth));
    app.get('/Client/manage', function (req, res) {
        res.render('Client/manage.html', {
            title: '管理中心',
            user: req.session.manager
        });
    });

    app.get('/Client/manage/login', auth.checkLogin().bind(auth));
    app.get('/Client/manage/login', function (req, res) {
        res.render('Client/manageLogin.html', {
            title: '管理中心',
            user: req.session.user
        });
    });

    app.post('/Client/manage/login', auth.checkLogin().bind(auth));
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

    app.post('/Client/manage/paths', auth.checkLogin(true).bind(auth));
    app.post('/Client/manage/paths', auth.checkManager.bind(auth));
    app.post('/Client/manage/paths', function (req, res) {
        var shopId = req.cookies['shopId'];
        ShopPath.getFilters({
            shopId: shopId
        })
            .then(paths => {
                var strSql = "select A.name, A.img, A._id as goodId, B._id from goods A join shopGoods B on A._id=B.goodId and B.shopId=:shopId and B.isDeleted=0 where A.isDeleted=0 ";
                var shopId = req.session.shop._id;
                model.db.sequelize.query(strSql, {
                    replacements: {
                        shopId: shopId
                    },
                    type: model.db.sequelize.QueryTypes.SELECT
                })
                    .then(goods => {
                        var shop = req.session.user;
                        res.jsonp({
                            goods:goods,
                            paths:paths,
                            shop:{
                                vpathCount: shop.vpathCount,
                                hpathCount:shop.hpathCount
                            }
                        });
                    });
            })
    });
}