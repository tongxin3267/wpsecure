var OrderSeq = require('../../models/mysql/orderSeq.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/orderSeqList', checkLogin);
    app.get('/admin/orderSeqList', function (req, res) {
        res.render('Server/orderSeqList.html', {
            title: '>校区列表',
            user: req.session.admin
        });
    });

    app.post('/admin/orderSeq/add', checkLogin);
    app.post('/admin/orderSeq/add', function (req, res) {
        var orderSeq = new OrderSeq({
            name: req.body.name,
            address: req.body.address,
            createdBy: req.session.admin._id
        });

        orderSeq.save().then(function (result) {
            if (result) {
                res.jsonp(result);
            }
        });
    });

    app.post('/admin/orderSeq/edit', checkLogin);
    app.post('/admin/orderSeq/edit', function (req, res) {
        var orderSeq = new OrderSeq({
            name: req.body.name,
            address: req.body.address
        });

        orderSeq.update(req.body.id)
            .then(function () {
                res.jsonp({
                    sucess: true
                });
            });
    });

    app.post('/admin/orderSeq/delete', checkLogin);
    app.post('/admin/orderSeq/delete', function (req, res) {
        OrderSeq.delete(req.body.id, req.session.admin._id).then(function (result) {
            res.jsonp({
                sucess: true
            });
        });
    });

    app.post('/admin/orderSeqList/search', checkLogin);
    app.post('/admin/orderSeqList/search', function (req, res) {

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

        OrderSeq.getAll(null, page, filter, function (err, orderSeqs, total) {
            if (err) {
                orderSeqs = [];
            }
            res.jsonp({
                orderSeqs: orderSeqs,
                total: total,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 14 + orderSeqs.length) == total
            });
        });
    });
}