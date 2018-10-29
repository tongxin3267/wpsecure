var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    User = model.user,
    auth = require("./auth");

module.exports = function (app) {
    app.get('/admin/adminList', auth.checkLogin);
    app.get('/admin/adminList', auth.checkSecure([100]));
    app.get('/admin/adminList', function (req, res) {
        res.render('Server/adminList.html', {
            title: '>管理员设置',
            user: req.session.admin,
            websiteTitle: model.db.config.websiteTitle
        });
    });

    app.post('/admin/admin/add', auth.checkLogin);
    app.post('/admin/admin/add', function (req, res) {
        User.create({
                name: req.body.name,
                sequence: req.body.sequence,
                createdBy: req.session.admin._id
            })
            .then(function (book) {
                res.jsonp(book);
            });
    });

    app.post('/admin/admin/edit', auth.checkLogin);
    app.post('/admin/admin/edit', function (req, res) {
        User.update({
                name: req.body.name,
                sequence: req.body.sequence,
                updatedDate: new Date(),
                deletedBy: req.session.admin._id
            }, {
                where: {
                    _id: req.body.id
                }
            })
            .then(function (book) {
                res.jsonp(book);
            });
    });

    app.post('/admin/admin/delete', auth.checkLogin);
    app.post('/admin/admin/delete', function (req, res) {
        User.update({
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

    app.post('/admin/adminList/search', auth.checkLogin);
    app.post('/admin/adminList/search', function (req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.name && req.body.name.trim()) {
            filter.name = {
                $like: `%${req.body.name.trim()}%`
            };
        }

        User.getFiltersWithPage(page, filter)
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