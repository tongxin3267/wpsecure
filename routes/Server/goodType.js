var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    GoodType = model.goodType,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/goodTypeList', checkLogin);
    app.get('/admin/goodTypeList', function (req, res) {
        res.render('Server/goodTypeList.html', {
            title: '>商品种类列表',
            websiteTitle: model.db.config.websiteTitle,
            user: req.session.admin
        });
    });

    app.post('/admin/goodType/add', checkLogin);
    app.post('/admin/goodType/add', function (req, res) {
        GoodType.create({
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

    app.post('/admin/goodType/edit', checkLogin);
    app.post('/admin/goodType/edit', function (req, res) {
        GoodType.update({
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

    app.post('/admin/goodType/delete', checkLogin);
    app.post('/admin/goodType/delete', function (req, res) {
        GoodType.update({
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

    app.post('/admin/goodTypeList/search', checkLogin);
    app.post('/admin/goodTypeList/search', function (req, res) {

        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.name && req.body.name.trim()) {
            filter.name = {
                $like: `%${req.body.name.trim()}%`
            };
        }

        GoodType.getFiltersWithPage(page, filter)
            .then(function (result) {
                res.jsonp({
                    records: result.rows,
                    total: result.count,
                    page: page,
                    pageSize: pageSize
                });
            });
    });

    app.post('/admin/goodTypeList/all', checkLogin);
    app.post('/admin/goodTypeList/all', function (req, res) {
        GoodType.getFilters({})
            .then(function (results) {
                res.jsonp(
                    results
                );
            });
    });
}