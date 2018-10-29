var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    Good = model.good,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/goodList', checkLogin);
    app.get('/admin/goodList', function (req, res) {
        res.render('Server/goodList.html', {
            title: '>商品列表',
            websiteTitle: model.db.config.websiteTitle,
            user: req.session.admin
        });
    });

    app.post('/admin/good/add', checkLogin);
    app.post('/admin/good/add', function (req, res) {
        Good.create({
                name: req.body.name,
                sequence: req.body.sequence,
                goodPrice: req.body.goodPrice,
                img: req.body.img,
                goodTypeId: req.body.goodTypeId,
                goodTypeName: req.body.goodTypeName,
                createdBy: req.session.admin._id
            })
            .then(function (result) {
                if (result) {
                    res.jsonp(result);
                }
            });
    });

    app.post('/admin/good/edit', checkLogin);
    app.post('/admin/good/edit', function (req, res) {
        Good.update({
                name: req.body.name,
                sequence: req.body.sequence,
                goodPrice: req.body.goodPrice,
                img: req.body.img,
                goodTypeId: req.body.goodTypeId,
                goodTypeName: req.body.goodTypeName,
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

    app.post('/admin/good/delete', checkLogin);
    app.post('/admin/good/delete', function (req, res) {
        Good.update({
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

    app.post('/admin/goodList/search', checkLogin);
    app.post('/admin/goodList/search', function (req, res) {

        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.name && req.body.name.trim()) {
            filter.name = {
                $like: `%${req.body.name.trim()}%`
            };
        }
        Good.getFiltersWithPage(page, filter)
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