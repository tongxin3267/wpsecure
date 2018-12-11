var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    Order = model.order,
    User = model.user,
    Shop = model.shop,
    OrderSeq = model.orderSeq,
    OrderType = model.orderType,
    OrderDetail = model.orderDetail,
    crypto = require('crypto'),
    auth = require("./auth.js"),
    checkLogin = auth.adminCheckLogin;

module.exports = function (app) {
    app.get('/900', function (req, res) {
        res.render('900.html', {
            title: '主页',
            websiteTitle: model.db.config.websiteTitle
        });
    });

    app.get('/wechatAdmin/login', function (req, res) {
        res.render('Wechat/admin_selectShop.html', {
            title: '>选择门店',
            websiteTitle: model.db.config.websiteTitle
        });
    });

    app.post('/wechatAdmin/getAllShops', function (req, res) {
        Shop.getFilters({})
            .then(shops => {
                res.jsonp(shops);
            });
    });

    app.get('/wechatAdmin/:id/login', function (req, res) {
        Shop.getFilter({
                _id: req.params.id
            })
            .then(shop => {
                if (shop) {
                    req.session.shop = shop;
                    res.render('Wechat/admin_login.html', {
                        title: '>门店登录',
                        websiteTitle: shop.name
                    });
                } else {
                    res.redirect("/404");
                }
            });
    });

    app.post('/wechatAdmin/login', function (req, res) {
        //生成密码的 md5 值
        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password.trim()).digest('hex');
        //检查用户是否存在
        User.getFilter({
                name: req.body.name.trim(),
                role: 0
            })
            .then(function (user) {
                if (!user) {
                    res.jsonp({
                        error: "用户名或密码不正确"
                    });
                    return;
                }

                //检查密码是否一致
                if (user.password != password) {
                    res.jsonp({
                        error: "用户名或密码不正确"
                    });
                    return;
                }

                //用户名密码都匹配后，将用户信息存入 session
                req.session.wechatAdmin = user;
                res.jsonp(user);
            })
            .catch(function (err) {
                //error to handle
            });
    });

    app.get('/wechatAdmin/logout', checkLogin);
    app.get('/wechatAdmin/logout', function (req, res) {
        req.session.shop = null;
        req.session.wechatAdmin = null;
        res.redirect("/wechatAdmin/login");
    });

    app.get('/wechatAdmin', checkLogin);
    app.get('/wechatAdmin', function (req, res) {
        var s = req.session.shop;
        res.render('Wechat/admin_shopOrderList.html', {
            title: '>门店订单',
            websiteTitle: s.name,
            user: req.session.wechatAdmin
        });
    });

    app.post('/wechatAdmin/getOrderTypes', checkLogin);
    app.post('/wechatAdmin/getOrderTypes', function (req, res) {
        OrderType.getFilters({})
            .then(types => {
                res.jsonp(types);
            });
    });

    function getSingleOrderDetails(orderId, orderTypeId) {
        var strSql = "select B.orderId, B.goodPrice, B.attrDetail, B.buyCount, G.name from shopGoods A join orderDetails B on A._id=B.shopGoodId  \
            join goods G on A.goodId=G._id \
            where G.isDeleted=0 and B.orderId=:orderId and B.orderTypeId=:orderTypeId and B.status=0 order by B.createdDate, B._id";
        return model.db.sequelize.query(strSql, {
            replacements: {
                orderId: orderId,
                orderTypeId: orderTypeId
            },
            type: model.db.sequelize.QueryTypes.SELECT
        });
    };

    app.post('/wechatAdmin/orderList/search', checkLogin);
    app.post('/wechatAdmin/orderList/search', function (req, res) {
        //查询并返回第 page 页的 20 篇文章
        var strSql = "select O.* from orders O join orderSeqs S on O._id=S.orderId where S.orderTypeId=:orderTypeId \
            and O.payStatus=2 and O.orderStatus=0 and O.shopId=:shopId order by O.updatedDate, O._id LIMIT 0, 20";
        return model.db.sequelize.query(strSql, {
                replacements: {
                    orderTypeId: req.body.orderTypeId,
                    shopId: req.session.shop._id
                },
                type: model.db.sequelize.QueryTypes.SELECT
            })
            .then(function (os) {
                if (os.length > 0) {
                    var pArray = [];
                    os.forEach(o => {
                        var p = getSingleOrderDetails(o._id, req.body.orderTypeId)
                            .then(ds => {
                                o.details = ds;
                            });
                        pArray.push(p);
                    });

                    Promise.all(pArray)
                        .then(r => {
                            res.jsonp({
                                records: os
                            });
                        });
                } else {
                    res.jsonp({
                        records: []
                    });
                }
            });
    });

    app.post('/wechatAdmin/finishOrder', checkLogin);
    app.post('/wechatAdmin/finishOrder', function (req, res) {
        // 更改订单状态同时移除队列
        OrderSeq.destroy({
                'where': {
                    orderId: req.body.orderId,
                    orderTypeId: req.body.orderTypeId
                }
            })
            .then(r => {
                // 更新订单状态
                OrderDetail.update({
                        // 已完成
                        status: 1,
                        updatedDate: new Date(),
                        deletedBy: req.session.wechatAdmin._id
                    }, {
                        where: {
                            orderId: req.body.orderId,
                            orderTypeId: req.body.orderTypeId
                        }
                    })
                    .then(o => {
                        OrderDetail.getFilter({
                                status: 0,
                                orderId: req.body.orderId,
                                orderTypeId: req.body.orderTypeId
                            })
                            .then(d => {
                                if (d) {
                                    //不需要关闭订单
                                    res.jsonp({
                                        sucess: true
                                    });
                                } else {
                                    // 关闭订单
                                    Order.update({
                                            orderStatus: 10
                                        }, {
                                            where: {
                                                _id: req.body.orderId,
                                            }
                                        })
                                        .then(o => {
                                            res.jsonp({
                                                sucess: true
                                            });
                                        });
                                }
                            });
                    });
            });
    });
}