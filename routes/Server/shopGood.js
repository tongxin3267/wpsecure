var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    ShopGood = model.shopGood,
    Good = model.good,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.post('/shop/shopGood/on', checkLogin);
    app.post('/shop/shopGood/on', function (req, res) {
        ShopGood.getFilter({
                goodId: req.body.goodId,
                shopId: req.body.shopId
            })
            .then(g => {
                if (g) {
                    res.jsonp({
                        error: "已经上架了"
                    });
                } else {
                    ShopGood.create({
                            goodId: req.body.goodId,
                            shopId: req.body.shopId,
                            createdBy: req.session.admin._id
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
        ShopGood.getFilter({
                goodId: req.body.goodId,
                shopId: req.body.shopId
            })
            .then(g => {
                if (!g) {
                    res.jsonp({
                        error: "已经下架了"
                    });
                } else {
                    ShopGood.destroy({
                            where: {
                                goodId: req.body.goodId,
                                shopId: req.body.shopId
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
                strSql = "select A.*,B._id as goodId from goods A left join shopGoods B on A._id=B.goodId and B.shopId=:shopId where A.isDeleted=0 ";
                strSql += (whereFilter + " LIMIT " + offset + ", " + pageSize);
                model.db.sequelize.query(strSql, {
                        replacements: {
                            name: "%" + req.body.name + "%",
                            goodTypeId: req.body.goodTypeId,
                            shopId: req.body.shopId
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