var Cart = require('../../models/mysql/cart.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/cartList', checkLogin);
    app.get('/admin/cartList', function (req, res) {
        res.render('Server/cartList.html', {
            title: '>校区列表',
            user: req.session.admin
        });
    });

    app.post('/admin/cart/add', checkLogin);
    app.post('/admin/cart/add', function (req, res) {
        var cart = new Cart({
            name: req.body.name,
            address: req.body.address,
            createdBy: req.session.admin._id
        });

        cart.save().then(function (result) {
            if (result) {
                res.jsonp(result);
            }
        });
    });

    app.post('/admin/cart/edit', checkLogin);
    app.post('/admin/cart/edit', function (req, res) {
        var cart = new Cart({
            name: req.body.name,
            address: req.body.address
        });

        cart.update(req.body.id)
            .then(function () {
                res.jsonp({
                    sucess: true
                });
            });
    });

    app.post('/admin/cart/delete', checkLogin);
    app.post('/admin/cart/delete', function (req, res) {
        Cart.delete(req.body.id, req.session.admin._id).then(function (result) {
            res.jsonp({
                sucess: true
            });
        });
    });

    app.post('/admin/cartList/search', checkLogin);
    app.post('/admin/cartList/search', function (req, res) {

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

        Cart.getAll(null, page, filter, function (err, carts, total) {
            if (err) {
                carts = [];
            }
            res.jsonp({
                carts: carts,
                total: total,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 14 + carts.length) == total
            });
        });
    });
}