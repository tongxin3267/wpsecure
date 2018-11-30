var Order = require('../../models/mysql/order.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/shop/:id/orderList', checkLogin);
    app.get('/shop/:id/orderList', function (req, res) {
        Shop.getFilter({
                _id: req.params.id
            })
            .then(s => {
                res.render('Server/shopOrderList.html', {
                    title: '>门店商品',
                    websiteTitle: s.name,
                    user: req.session.admin,
                    shopId: req.params.id
                });
            });
    });

    app.post('/admin/orderList/search', checkLogin);
    app.post('/admin/orderList/search', function (req, res) {

        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.name) {
            var reg = new RegExp(req.body.name, 'i')
            filter.name = {
                $regex: reg
            };
        }

        Order.getAll(null, page, filter, function (err, orders, total) {
            if (err) {
                orders = [];
            }
            res.jsonp({
                orders: orders,
                total: total,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 14 + orders.length) == total
            });
        });
    });
}