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
    app.post('/wechat/login', function (req, res) {
        // 过期用户，重新获取session等信息
        WechatHelper.getSessionKey(req.body.code, "wxa155aceaa74876cb", "10266a3d9426016582b3ba34d937acc1", function (data) {
            // data.session_key
            if (data.error) {
                res.jsonp({
                    error: data.error
                });
                return;
            }
            var md5 = crypto.createHash('md5'),
                skey = md5.update(data.session_key).digest('hex');
            Ws_user.getFilter({
                wxId: data.openid
            })
                .then(user => {
                    if (user) {
                        // 更新
                        Ws_user.update({
                            sessionkey: data.session_key,
                            skey: skey
                        }, {
                                where: {
                                    wxId: data.openid
                                }
                            })
                            .then(user => {
                                res.jsonp({
                                    skey: skey
                                });
                            });
                    } else {
                        // 新建
                        Ws_user.create({
                            wxId: data.openid,
                            sessionkey: data.session_key,
                            skey: skey,
                            uname: req.body.nickName,
                            uavatar: req.body.avatarUrl,
                            ugender: req.body.gender
                        })
                            .then(user => {
                                res.jsonp({
                                    skey: skey,
                                    userId: user._id
                                });
                            });
                    }
                });
        });
    });

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
                    left join (select distinct goodId from goodAttributes where isDeleted=false)GA on A._id=GA.goodId \
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
            userId = req.body.userId,
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
                                    orderTypeId: sysGood.orderTypeId,
                                    status:1, // TBD real env need remove
                                    createdBy: userId || 1
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
                                        createdBy: userId || 1,
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
                                        orderTypeId: sysGood.orderTypeId,
                                        orderTypeName: sysGood.orderTypeName,
                                        buyCount: g.count,
                                        createdBy: userId || 1
                                    });
                                }
                            }
                        });

                        return model.db.sequelize.transaction(function (t1) {
                            return Order.create({
                                userId: userId || 1,
                                shopId: shopId,
                                totalPrice: total.toFixed(2),
                                _id: orderId,
                                payStatus:2,// TBD need remove in real env
                                createdBy: userId || 1
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
            userId: userId || 1,
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

    // 获取队列信息和排名
    app.post('/wechat/getOrderSeqs', function (req, res) {
        // goodId, goodCount
        // userId
        // assume there are enough counts
        var orderId = req.body.orderId,
            userId = req.body.userId || 1;
        Order.getFilter({
            userId: userId,
            _id: orderId,
            payStatus: 2
        })
            .then(o => {
                var p = Promise.all([]);
                if (o && o.orderStatus < 10) {
                    // 未完成，需要排序信息
                    var strSql = "select distinct T.sequence, T.createdDate, T.name, T._id as orderTypeId, S.updatedDate from orderDetails D join orderTypes T on T._id=D.orderTypeId  \
                    left join orderSeqs S on D.orderTypeId=S.orderTypeId and D.orderId=S.orderId  \
                    where D.isDeleted=0 and D.orderId=:orderId order by T.sequence, T.createdDate, T._id";
                    p = model.db.sequelize.query(strSql, {
                        replacements: {
                            orderId: orderId
                        },
                        type: model.db.sequelize.QueryTypes.SELECT
                    })
                        .then(seqs => {
                            var pSeqs = [];
                            seqs.forEach(seq => {
                                if (seq.updatedDate) {
                                    var pChild = OrderSeq.count({
                                        where: {
                                            orderTypeId: seq.orderTypeId,
                                            status: 1,
                                            updatedDate: {
                                                $lt: seq.updatedDate
                                            }
                                        }
                                    })
                                        .then(count => {
                                            seq.count = count;
                                        });
                                    pSeqs.push(pChild);
                                } else {
                                    seq.count = 0;
                                }
                            });
                            return Promise.all(pSeqs)
                                .then(function () {
                                    return seqs;
                                });
                        });
                }
                p.then(seqs => {
                    res.jsonp(seqs);
                });
            });
    });
}