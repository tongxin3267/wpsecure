var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    OrderType = model.orderType,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/orderTypeList', checkLogin);
    app.get('/admin/orderTypeList', function (req, res) {
        res.render('Server/orderTypeList.html', {
            title: '>订单分类列表',
            websiteTitle: model.db.config.websiteTitle,
            user: req.session.admin
        });
    });

    app.post('/admin/orderType/add', checkLogin);
    app.post('/admin/orderType/add', function (req, res) {
        OrderType.create({
                name: req.body.name,
                sequence: req.body.sequence,
                createdBy: req.session.admin._id
            })
            .then(function (result) {
                if (result) {
                    res.jsonp(result);
                }
            });
    });

    app.post('/admin/orderType/edit', checkLogin);
    app.post('/admin/orderType/edit', function (req, res) {
        OrderType.update({
                name: req.body.name,
                sequence: req.body.sequence,
                deletedBy: req.session.admin._id,
                updatedDate: new Date()
            }, {
                where: {
                    _id: req.body.id
                }
            })
            .then(function () {
                res.jsonp({
                    sucess: true
                });
            });
    });

    app.post('/admin/orderType/delete', checkLogin);
    app.post('/admin/orderType/delete', function (req, res) {
        OrderType.update({
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
    });

    app.post('/admin/orderTypeList/search', checkLogin);
    app.post('/admin/orderTypeList/search', function (req, res) {

        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.name && req.body.name.trim()) {
            filter.name = {
                $like: `%${req.body.name.trim()}%`
            };
        }

        OrderType.getFiltersWithPage(page, filter)
            .then(function (result) {
                res.jsonp({
                    records: result.rows,
                    total: result.count,
                    page: page,
                    pageSize: pageSize
                });
            });
    });
}