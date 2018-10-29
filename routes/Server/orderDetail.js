var OrderDetail = require('../../models/mysql/orderDetail.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/orderDetailList', checkLogin);
    app.get('/admin/orderDetailList', function (req, res) {
        res.render('Server/orderDetailList.html', {
            title: '>校区列表',
            user: req.session.admin
        });
    });

    app.post('/admin/orderDetail/add', checkLogin);
    app.post('/admin/orderDetail/add', function (req, res) {
        var orderDetail = new OrderDetail({
            name: req.body.name,
            address: req.body.address,
            createdBy: req.session.admin._id
        });

        orderDetail.save().then(function (result) {
            if (result) {
                res.jsonp(result);
            }
        });
    });

    app.post('/admin/orderDetail/edit', checkLogin);
    app.post('/admin/orderDetail/edit', function (req, res) {
        var orderDetail = new OrderDetail({
            name: req.body.name,
            address: req.body.address
        });

        orderDetail.update(req.body.id)
            .then(function () {
                res.jsonp({
                    sucess: true
                });
            });
    });

    app.post('/admin/orderDetail/delete', checkLogin);
    app.post('/admin/orderDetail/delete', function (req, res) {
        OrderDetail.delete(req.body.id, req.session.admin._id).then(function (result) {
            res.jsonp({
                sucess: true
            });
        });
    });

    app.post('/admin/orderDetailList/search', checkLogin);
    app.post('/admin/orderDetailList/search', function (req, res) {

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

        OrderDetail.getAll(null, page, filter, function (err, orderDetails, total) {
            if (err) {
                orderDetails = [];
            }
            res.jsonp({
                orderDetails: orderDetails,
                total: total,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 14 + orderDetails.length) == total
            });
        });
    });
}