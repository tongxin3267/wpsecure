var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    Shop = model.shop,
    GoodType = model.goodType,
    Order = model.order,
    OrderDetail = model.orderDetail,
    Good = model.good,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.post('/wechat/shopList', function (req, res) {
        Shop.getFilters({})
            .then(function (results) {
                if (results) {
                    res.jsonp(results);
                }
            });
    });

    app.post('/wechat/shopgoods', function (req, res) {
        GoodType.getFilters({})
            .then(function (categories) {
                var strSql = "select A.* from goods A join shopGoods B on A._id=B.goodId and B.shopId=:shopId \
                    join goodTypes T on A.goodTypeId=T._id\
                    where A.isDeleted=0 order by T.sequence, T._id, A.sequence, A._id";
                model.db.sequelize.query(strSql, {
                        replacements: {
                            shopId: req.body.shopId
                        },
                        type: model.db.sequelize.QueryTypes.SELECT
                    })
                    .then(shopGoods => {
                        res.jsonp({
                            categories: categories,
                            shopGoods: shopGoods
                        });
                    });
            });
    });

    function random4() {
        var r = '000' + Math.random() * 1000;
        return r.slice(-3);
    };

    app.post('/wechat/pay', function (req, res) {
        // goodId, goodCount
        // userId
        // assume there are enough counts

        var goods = JSON.parse(req.body.goods),
            _id = req.body._id,
            goodIds = goods.map(g => {
                return g._id;
            }),
            orderId = (new Date().getTime()).toString() + random4(),
            shopId = req.body.shopId;

        Good.getFilters({
                _id: {
                    $in: goodIds
                }
            })
            .then(gs => {
                var total = 0;
                var bulkOrderDetals = gs.map(g => {
                    var count;
                    goods.some(c => {
                        if (g._id == c._id) {
                            count = c.count;
                            return true;
                        }
                    });
                    total += count * g.goodPrice;
                    return {
                        orderId: orderId,
                        shopGoodId: g._id,
                        goodPrice: g.goodPrice,
                        buyCount: count
                    };
                });
                model.db.sequelize.transaction(function (t1) {
                        return Order.create({
                                userId: 1,
                                shopId: shopId,
                                totalPrice: total,
                                _id: orderId
                            }, {
                                transaction: t1
                            })
                            .then(o => {
                                return OrderDetail.bulkCreate(bulkOrderDetals, {
                                        transaction: t1
                                    })
                                    .then(ds => {
                                        return o;
                                    });
                            });
                    })
                    .then(r => {
                        getSingleOrderDetails(r._id)
                            .then(ds => {
                                r.dataValues.details = ds;
                                res.jsonp({
                                    order: r
                                });
                            });
                    })
                    .catch(e => {
                        res.jsonp({
                            error: "订单生成失败"
                        });
                    });
            });
        // 1. check if there is enough count
        // 2. order and pay
    });

    function getSingleOrderDetails(orderId) {
        var strSql = "select B.*, G.name from shopGoods A join orderDetails B on A._id=B.shopGoodId  \
            join goods G on A.goodId=G._id \
            where G.isDeleted=0 and B.orderId=:orderId order by B.createdDate, B._id";
        return model.db.sequelize.query(strSql, {
            replacements: {
                orderId: orderId
            },
            type: model.db.sequelize.QueryTypes.SELECT
        });
    };

    app.post('/wechat/orderList', function (req, res) {
        // goodId, goodCount
        // userId
        // assume there are enough counts
        var userId = req.body.userId,
            shopId = req.body.shopId;

        Order.getFilters({
                userId: 1,
                shopId: shopId
            }, [
                ['createdDate', 'desc'],
                ['_id', 'desc']
            ])
            .then(os => {
                if (os.length > 0) {
                    var pArray = [];
                    os.forEach(o => {
                        var p = getSingleOrderDetails(o._id)
                            .then(ds => {
                                o.dataValues.details = ds;
                            });
                        pArray.push(p);
                    });

                    Promise.all(pArray)
                        .then(r => {
                            res.jsonp(os);
                        });
                } else {
                    res.jsonp({});
                }
            });
    });
}