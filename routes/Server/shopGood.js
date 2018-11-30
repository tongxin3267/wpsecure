var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    ShopGood = model.shopGood,
    Good = model.good,
    Shop = model.shop,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/shop/shopId/:id', checkLogin);
    app.get('/shop/shopId/:id', function (req, res) {
        Shop.getFilter({
                _id: req.params.id
            })
            .then(s => {
                req.session.shop = s;
                res.redirect('/shop/goodList');
            });
    });

    app.get('/shop/goodList', checkLogin);
    app.get('/shop/goodList', function (req, res) {
        res.render('Server/shopGoodList.html', {
            title: '>门店商品',
            websiteTitle: req.session.shop.name,
            user: req.session.admin
        });
    });

    app.get('/shop/good/:gId/attribute', checkLogin);
    app.get('/shop/good/:gId/attribute', function (req, res) {
        res.render('Server/shopGoodAttributeList.html', {
            title: '>商品属性',
            websiteTitle: req.session.shop.name,
            user: req.session.admin,
            goodId: req.params.gId
        });
    });

    app.post('/shop/shopGood/on', checkLogin);
    app.post('/shop/shopGood/on', function (req, res) {
        var shopId = req.session.shop._id;
        ShopGood.getFilter({
                goodId: req.body.goodId,
                shopId: shopId
            })
            .then(g => {
                if (g) {
                    res.jsonp({
                        error: "已经上架了"
                    });
                } else {
                    ShopGood.getFilterAll({
                            goodId: req.body.goodId,
                            shopId: shopId
                        })
                        .then(g => {
                            if (g) {
                                //被下架，恢复
                                g.isDeleted = false;
                                g.deletedBy = req.session.admin._id;
                                g.updatedDate = new Date();
                                return g.save();
                            } else {
                                return ShopGood.create({
                                    goodId: req.body.goodId,
                                    shopId: shopId,
                                    goodPrice: req.body.goodPrice,
                                    createdBy: req.session.admin._id
                                });
                            }
                        })
                        .then(function (result) {
                            if (result) {
                                res.jsonp(result);
                            }
                        });
                }
            });
    });

    app.post('/shop/shopGood/off', checkLogin);
    app.post('/shop/shopGood/off', function (req, res) {
        var shopId = req.session.shop._id;
        ShopGood.getFilter({
                goodId: req.body.goodId,
                shopId: shopId
            })
            .then(g => {
                if (!g) {
                    res.jsonp({
                        error: "已经下架了"
                    });
                } else {
                    ShopGood.update({
                            isDeleted: true,
                            deletedBy: req.session.admin._id,
                            updatedDate: new Date()
                        }, {
                            where: {
                                goodId: req.body.goodId,
                                shopId: shopId
                            }
                        })
                        .then(function (result) {
                            if (result) {
                                res.jsonp(result);
                            }
                        });
                }
            });
    });

    app.post('/admin/shopGood/edit', checkLogin);
    app.post('/admin/shopGood/edit', function (req, res) {
        if (req.body.id) {
            ShopGood.update({
                    goodPrice: req.body.goodPrice,
                    deletedBy: req.session.admin._id,
                    updatedDate: new Date()
                }, {
                    where: {
                        _id: req.body.id
                    }
                })
                .then(o => {
                    res.jsonp({
                        sucess: true
                    });
                });
        } else {
            res.jsonp({
                sucess: true
            });
        }
    });

    app.post('/admin/shopGoodList/search', checkLogin);
    app.post('/admin/shopGoodList/search', function (req, res) {

        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var strSql = "select count(0) as count from goods A  where isDeleted=0 ",
            whereFilter = "";
        if (req.body.name) {
            whereFilter += " and A.name like:name";
        }
        if (req.body.goodTypeId) {
            whereFilter += " and A.goodTypeId=:goodTypeId";
        }
        model.db.sequelize.query(strSql + whereFilter, {
                replacements: {
                    name: "%" + req.body.name + "%",
                    goodTypeId: req.body.goodTypeId
                },
                type: model.db.sequelize.QueryTypes.SELECT
            })
            .then(counts => {
                var offset = ((page - 1) * pageSize);
                strSql = "select A.name, A.goodPrice, A.goodTypeName, A._id as goodId,B._id, B.goodPrice as newPrice from goods A left join shopGoods B on A._id=B.goodId and B.shopId=:shopId and B.isDeleted=false where A.isDeleted=0 ";
                strSql += (whereFilter + " LIMIT " + offset + ", " + pageSize);
                var shopId = req.session.shop._id;
                model.db.sequelize.query(strSql, {
                        replacements: {
                            name: "%" + req.body.name + "%",
                            goodTypeId: req.body.goodTypeId,
                            shopId: shopId
                        },
                        type: model.db.sequelize.QueryTypes.SELECT
                    })
                    .then(goods => {
                        res.jsonp({
                            records: goods,
                            total: counts[0].count,
                            page: page,
                            pageSize: pageSize
                        });
                    });
            });
    });
}