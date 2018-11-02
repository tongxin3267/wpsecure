var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    Shop = model.shop,
    GoodType = model.goodType,
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
                strSql = "select A.* from goods A join shopGoods B on A._id=B.goodId and B.shopId=:shopId where A.isDeleted=0 ";
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
}