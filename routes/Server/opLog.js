var OpLog = require('../../models/mysql/opLog.js'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/opLogList', checkLogin);
    app.get('/admin/opLogList', function (req, res) {
        res.render('Server/opLogList.html', {
            title: '>校区列表',
            user: req.session.admin
        });
    });

    app.post('/admin/opLog/add', checkLogin);
    app.post('/admin/opLog/add', function (req, res) {
        var opLog = new OpLog({
            name: req.body.name,
            address: req.body.address,
            createdBy: req.session.admin._id
        });

        opLog.save().then(function (result) {
            if (result) {
                res.jsonp(result);
            }
        });
    });

    app.post('/admin/opLog/edit', checkLogin);
    app.post('/admin/opLog/edit', function (req, res) {
        var opLog = new OpLog({
            name: req.body.name,
            address: req.body.address
        });

        opLog.update(req.body.id)
            .then(function () {
                res.jsonp({
                    sucess: true
                });
            });
    });

    app.post('/admin/opLog/delete', checkLogin);
    app.post('/admin/opLog/delete', function (req, res) {
        OpLog.delete(req.body.id, req.session.admin._id).then(function (result) {
            res.jsonp({
                sucess: true
            });
        });
    });

    app.post('/admin/opLogList/search', checkLogin);
    app.post('/admin/opLogList/search', function (req, res) {

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

        OpLog.getAll(null, page, filter, function (err, opLogs, total) {
            if (err) {
                opLogs = [];
            }
            res.jsonp({
                opLogs: opLogs,
                total: total,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 14 + opLogs.length) == total
            });
        });
    });
}