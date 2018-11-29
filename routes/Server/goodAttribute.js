var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    GoodAttribute = model.goodAttribute,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/goodAttributeList/:gId', checkLogin);
    app.get('/admin/goodAttributeList/:gId', function (req, res) {
        res.render('Server/goodAttributeList.html', {
            title: '>商品属性',
            websiteTitle: model.db.config.websiteTitle,
            user: req.session.admin,
            goodId: req.params.gId
        });
    });

    app.post('/admin/goodAttribute/add', checkLogin);
    app.post('/admin/goodAttribute/add', function (req, res) {
        GoodAttribute.create({
                name: req.body.name,
                isMulti: req.body.isMulti,
                sequence: req.body.sequence,
                goodId: req.body.goodId,
                createdBy: req.session.admin._id
            })
            .then(function (result) {
                if (result) {
                    res.jsonp(result);
                }
            });
    });

    app.post('/admin/goodAttribute/edit', checkLogin);
    app.post('/admin/goodAttribute/edit', function (req, res) {
        GoodAttribute.update({
                name: req.body.name,
                isMulti: req.body.isMulti,
                goodId: req.body.goodId,
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

    app.post('/admin/goodAttribute/delete', checkLogin);
    app.post('/admin/goodAttribute/delete', function (req, res) {
        GoodAttribute.update({
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

    app.post('/admin/goodAttributeList/search', checkLogin);
    app.post('/admin/goodAttributeList/search', function (req, res) {

        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {
            goodId: req.body.goodId
        };
        if (req.body.name && req.body.name.trim()) {
            filter.name = {
                $like: `%${req.body.name.trim()}%`
            };
        }
        if (req.body.grade) {
            filter.gradeId = req.body.grade;
        }

        GoodAttribute.getFiltersWithPage(page, filter)
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