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
                var strSql = "select A._id, A.name,A.img, A.detail, case when B.goodPrice then B.goodPrice else A.goodPrice end goodPrice, A.img, A.goodTypeId, A.goodTypeName, GA.goodId as hasAttr from goods A \
                    join shopGoods B on A._id=B.goodId and B.shopId=:shopId \
                    join goodTypes T on A.goodTypeId=T._id\
                    left join (select distinct goodId from goodattributes where isDeleted=false)GA on A._id=GA.goodId \
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
            goodIds = [];
        goods.forEach(g => {
                if (goodIds.indexOf(g._id) == -1) {
                    goodIds.push(g._id);
                }
            }),
            orderId = (new Date().getTime()).toString() + random4(),
            shopId = req.body.shopId;
        // 获取所有商品价格
        var strSql = "select S._id, S.goodPrice, S.goodId, G.orderTypeId, G.orderTypeName from shopGoods S join goods G on S.goodId=G._id and G.isDeleted=false \
                     where  S.isDeleted=false and S.shopId=:shopId and S.goodId in (:goodIds)";
        model.db.sequelize.query(strSql, {
                replacements: {
                    shopId: req.body.shopId,
                    goodIds: goodIds
                },
                type: model.db.sequelize.QueryTypes.SELECT
            })
            .then(gs => {
                //获取所有属性价格
                strSql = "select case when A.price then A.price else AV.price end price, AV.goodId, AV.name, AV.goodAttrId, AV._id from goodAttrVals AV left join shopGoodAttrVals A on A.isDeleted=false \
                    and A.goodAttrValId=AV._id and A.shopId=:shopId where AV.goodId in (:goodIds)";
                model.db.sequelize.query(strSql, {
                        replacements: {
                            shopId: req.body.shopId,
                            goodIds: goodIds
                        },
                        type: model.db.sequelize.QueryTypes.SELECT
                    })
                    .then(avs => {
                        var total = 0,
                            bulkOrderDetals = [],
                            bulkOrderSeqs = [],
                            gObj = {};
                        // good array to JSON
                        gs.forEach(g => {
                            gObj[g._id] = g;
                        });

                        // avs array to JSON
                        avs.forEach(av => {
                            var tmpAvs = gObj[av.goodId].avs;
                            if (!tmpAvs) {
                                tmpAvs = {};
                                gObj[av.goodId].avs = tmpAvs;
                            }
                            tmpAvs[av._id] = av;
                        });

                        // 根据客户端数据计算价格
                        goods.forEach(g => {
                            // 下面处理订单商品的价格和详情
                            var sysGood = gObj[g._id];
                            // 订单商品插入队列里
                            if (!bulkOrderSeqs.some(bs => {
                                    return bs.orderTypeId == sysGood.orderTypeId;
                                })) {
                                bulkOrderSeqs.push({
                                    orderId: orderId,
                                    orderTypeId: sysGood.orderTypeId
                                });
                            }

                            if (!sysGood) {
                                throw "商品已经售空:" + g.name;
                            }
                            if (g.hasAttr) {
                                if (sysGood.avs) {
                                    // 属性商品的处理
                                    // 规格里必须含有价格选项
                                    var attrDetail = '';
                                    sysGood.goodPrice = 0;
                                    g.attrs.forEach(attr => {
                                        if (attr.isMulti) {
                                            if (attr.selectedIds && attr.selectedIds.length > 0) {
                                                attr.selectedIds.forEach(valId => {
                                                    var curAv = sysGood.avs[valId];
                                                    attrDetail += "+" + curAv.name;
                                                    sysGood.goodPrice += parseFloat(curAv.price);
                                                });
                                            }
                                        } else {
                                            var curAv = sysGood.avs[attr.selectedId];
                                            attrDetail += "+" + curAv.name;
                                            sysGood.goodPrice += parseFloat(curAv.price);
                                        }
                                    });
                                    total += g.count * sysGood.goodPrice;
                                    bulkOrderDetals.push({
                                        orderId: orderId,
                                        shopGoodId: g._id,
                                        goodPrice: sysGood.goodPrice,
                                        orderTypeId: sysGood.orderTypeId,
                                        orderTypeName: sysGood.orderTypeName,
                                        buyCount: g.count,
                                        attrDetail: (attrDetail && attrDetail.substr(1))
                                    });

                                } else {
                                    throw "商品属性不一致:" + g.name;
                                }
                            } else {
                                if (sysGood.avs) {
                                    throw "商品属性不一致:" + g.name;
                                } else {
                                    // 单一商品的处理
                                    total += g.count * parseFloat(sysGood.goodPrice);
                                    bulkOrderDetals.push({
                                        orderId: orderId,
                                        shopGoodId: g._id,
                                        goodPrice: sysGood.goodPrice,
                                        buyCount: g.count
                                    });
                                }
                            }
                        });

                        return model.db.sequelize.transaction(function (t1) {
                                return Order.create({
                                        userId: 1,
                                        shopId: shopId,
                                        totalPrice: total.toFixed(2),
                                        _id: orderId
                                    }, {
                                        transaction: t1
                                    })
                                    .then(o => {
                                        return OrderDetail.bulkCreate(bulkOrderDetals, {
                                                transaction: t1
                                            })
                                            .then(ds => {
                                                return OrderSeq.bulkCreate(bulkOrderSeqs, {
                                                        transaction: t1
                                                    })
                                                    .then(oseq => {
                                                        return o;
                                                    });
                                            });
                                    });
                            })
                            .then(r => {
                                return getSingleOrderDetails(r._id)
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
                    })
                    .catch(e => {
                        res.jsonp({
                            error: e.toString()
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
                shopId: shopId,
                payStatus: 2,
                orderStatus: {
                    $lt: 10
                }
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

    app.post('/wechat/goodAttributes', function (req, res) {
        // goodId, goodCount
        // userId
        // assume there are enough counts
        var goodId = req.body.goodId,
            shopId = req.body.shopId;

        GoodAttribute.getFilters({
                goodId: goodId
            })
            .then(attrs => {
                var strSql = "select A._id, A.goodId, A.goodAttrId,A.name,case when B.price then B.price else A.price end price \
                from goodAttrVals A left join shopGoodAttrVals B on A._id=B.goodAttrValId and B.isDeleted=false \
                and B.shopId=:shopId and B.goodId=:goodId \
                where A.isDeleted = 0 and A.goodId=:goodId order by A.createdDate, A._id ";
                model.db.sequelize.query(strSql, {
                        replacements: {
                            goodId: goodId,
                            shopId: shopId
                        },
                        type: model.db.sequelize.QueryTypes.SELECT
                    })
                    .then(vals => {
                        res.jsonp({
                            vals: vals,
                            attrs: attrs
                        });
                    });
            });
    });
}