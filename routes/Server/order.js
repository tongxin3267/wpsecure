var Order = require('../../models/mysql/order.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/orderList', checkLogin);
    app.get('/admin/orderList', function (req, res) {
        res.render('Server/orderList.html', {
            title: '>校区列表',
            user: req.session.admin
        });
    });

    app.post('/admin/order/add', checkLogin);
    app.post('/admin/order/add', function (req, res) {
        var order = new Order({
            name: req.body.name,
            address: req.body.address,
            createdBy: req.session.admin._id
        });

        order.save().then(function (result) {
            if (result) {
                res.jsonp(result);
            }
        });
    });

    app.post('/admin/order/edit', checkLogin);
    app.post('/admin/order/edit', function (req, res) {
        var order = new Order({
            name: req.body.name,
            address: req.body.address
        });

        order.update(req.body.id)
            .then(function () {
                res.jsonp({
                    sucess: true
                });
            });
    });

    app.post('/admin/order/delete', checkLogin);
    app.post('/admin/order/delete', function (req, res) {
        Order.delete(req.body.id, req.session.admin._id).then(function (result) {
            res.jsonp({
                sucess: true
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