var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    ShopGoodAttrVal = model.shopGoodAttrVal,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/shop/good/:gId/attribute/:attrId', checkLogin);
    app.get('/shop/good/:gId/attribute/:attrId', function (req, res) {
        res.render('Server/shopGoodAttrValList.html', {
            title: '>属性值信息',
            websiteTitle: req.session.shop.name,
            user: req.session.admin,
            goodId: req.params.gId,
            attrId: req.params.attrId
        });
    });

    app.post('/admin/shopGoodAttrVal/edit', checkLogin);
    app.post('/admin/shopGoodAttrVal/edit', function (req, res) {
        var p;
        if (req.body.id) {
            p = ShopGoodAttrVal.update({
                price: req.body.price,
                deletedBy: req.session.admin._id,
                updatedDate: new Date()
            }, {
                where: {
                    _id: req.body.id
                }
            });
        } else {
            p = ShopGoodAttrVal.create({
                price: req.body.price,
                shopId: req.session.shop._id,
                goodId: req.body.goodId,
                goodAttrValId: req.body.valId,
                createdBy: req.session.admin._id
            });
        }
        p.then(o => {
            res.jsonp({
                sucess: true
            });
        });
    });

    app.post('/admin/shopGoodAttrVal/delete', checkLogin);
    app.post('/admin/shopGoodAttrVal/delete', function (req, res) {
        if (req.body.id) {
            ShopGoodAttrVal.update({
                    isDeleted: true,
                    deletedBy: req.session.admin._id,
                    deletedDate: new Date()
                }, {
                    where: {
                        _id: req.body.id
                    }
                })
                .then(function (result) {
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

    app.post('/admin/shopGoodAttrValList/search', checkLogin);
    app.post('/admin/shopGoodAttrValList/search', function (req, res) {
        var strSql = "select A.name, A.sequence,A.price, B._id, A._id as valId, B.price as newPrice from goodAttrVals A left join shopGoodAttrVals B on A._id=B.goodAttrValId and B.isDeleted=false\
             and B.shopId=:shopId where A.isDeleted=0 and A.goodAttrId=:attrId";
        if (req.body.name) {
            strSql += " and A.name like '%" + req.body.name.trim() + "%'";
        }
        model.db.sequelize.query(strSql, {
                replacements: {
                    shopId: req.session.shop._id,
                    attrId: req.body.attrId
                },
                type: model.db.sequelize.QueryTypes.SELECT
            })
            .then(function (results) {
                res.jsonp({
                    records: results
                });
            });
    });
}