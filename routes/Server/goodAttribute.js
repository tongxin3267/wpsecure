var GoodAttribute = require('../../models/mysql/goodAttribute.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/goodAttributeList', checkLogin);
    app.get('/admin/goodAttributeList', function (req, res) {
        res.render('Server/goodAttributeList.html', {
            title: '>校区列表',
            user: req.session.admin
        });
    });

    app.post('/admin/goodAttribute/add', checkLogin);
    app.post('/admin/goodAttribute/add', function (req, res) {
        var goodAttribute = new GoodAttribute({
            name: req.body.name,
            address: req.body.address,
            createdBy: req.session.admin._id
        });

        goodAttribute.save().then(function (result) {
            if (result) {
                res.jsonp(result);
            }
        });
    });

    app.post('/admin/goodAttribute/edit', checkLogin);
    app.post('/admin/goodAttribute/edit', function (req, res) {
        var goodAttribute = new GoodAttribute({
            name: req.body.name,
            address: req.body.address
        });

        goodAttribute.update(req.body.id)
            .then(function () {
                res.jsonp({
                    sucess: true
                });
            });
    });

    app.post('/admin/goodAttribute/delete', checkLogin);
    app.post('/admin/goodAttribute/delete', function (req, res) {
        GoodAttribute.delete(req.body.id, req.session.admin._id).then(function (result) {
            res.jsonp({
                sucess: true
            });
        });
    });

    app.post('/admin/goodAttributeList/search', checkLogin);
    app.post('/admin/goodAttributeList/search', function (req, res) {

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

        GoodAttribute.getAll(null, page, filter, function (err, goodAttributes, total) {
            if (err) {
                goodAttributes = [];
            }
            res.jsonp({
                goodAttributes: goodAttributes,
                total: total,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 14 + goodAttributes.length) == total
            });
        });
    });
}