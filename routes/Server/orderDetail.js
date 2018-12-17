var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    Order = model.order,
    OrderDetail = model.orderDetail,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/orderDetailList', checkLogin);
    app.get('/admin/orderDetailList', function (req, res) {
        var s = req.session.shop;
        res.render('Server/orderDetailList.html', {
            title: '>订单详情',
            websiteTitle: s.name,
            user: req.session.admin
        });
    });

    app.post('/admin/orderDetailList/search', checkLogin);
    app.post('/admin/orderDetailList/search', function (req, res) {
        strSql = "select case when A.price then A.price else AV.price end price, AV.goodId, AV.name, AV.goodAttrId, AV._id from goodAttrVals AV left join shopGoodAttrVals A on A.isDeleted=false \
                    and A.goodAttrValId=AV._id and A.shopId=:shopId where AV.goodId in (:goodIds)";
        model.db.sequelize.query(strSql, {
                replacements: {
                    shopId: req.body.shopId,
                    goodIds: goodIds
                },
                type: model.db.sequelize.QueryTypes.SELECT
            })
            .then(results => {
                res.jsonp(results);
            })
    });
}