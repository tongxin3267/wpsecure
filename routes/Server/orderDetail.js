var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    Order = model.order,
    OrderDetail = model.orderDetail,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/shop/orderDetail/:orderId', checkLogin);
    app.get('/shop/orderDetail/:orderId', function (req, res) {
        var s = req.session.shop;
        res.render('Server/orderDetailList.html', {
            title: '>订单详情',
            websiteTitle: s.name,
            user: req.session.admin,
            orderId: req.params.orderId
        });
    });

    app.post('/shop/orderDetail/orderAndDetails', checkLogin);
    app.post('/shop/orderDetail/orderAndDetails', function (req, res) {
        Order.getFilter({
                _id: req.body.orderId
            })
            .then(order => {
                strSql = "select D._id, G.name,  D.buyCount, D.goodPrice from orderDetails D  \
                    join goods G on D.goodId=G._id where D.orderId=:orderId ";
                model.db.sequelize.query(strSql, {
                        replacements: {
                            orderId: req.body.orderId
                        },
                        type: model.db.sequelize.QueryTypes.SELECT
                    })
                    .then(results => {
                        res.jsonp({
                            order: order,
                            details: results
                        });
                    })
            });
    });
}