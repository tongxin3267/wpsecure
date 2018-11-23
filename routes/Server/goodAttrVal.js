var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    GoodAttrVal = model.goodAttrVal,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/goodAttrValList/:goodId/:attrId', checkLogin);
    app.get('/admin/goodAttrValList/:goodId/:attrId', function (req, res) {
        res.render('Server/goodAttrValList.html', {
            title: '>属性值信息',
            websiteTitle: model.db.config.websiteTitle,
            user: req.session.admin,
            goodId: req.params.goodId,
            attrId: req.params.attrId
        });
    });

    app.post('/admin/goodAttrVal/add', checkLogin);
    app.post('/admin/goodAttrVal/add', function (req, res) {
        GoodAttrVal.create({
                name: req.body.name,
                sequence: req.body.sequence,
                price: req.body.price,
                goodId: req.body.goodId,
                goodAttrId: req.body.attrId,
                createdBy: req.session.admin._id
            })
            .then(function (result) {
                if (result) {
                    res.jsonp(result);
                }
            });
    });

    app.post('/admin/goodAttrVal/edit', checkLogin);
    app.post('/admin/goodAttrVal/edit', function (req, res) {
        GoodAttrVal.update({
                name: req.body.name,
                sequence: req.body.sequence,
                price: req.body.price,
                goodId: req.body.goodId,
                goodAttrId: req.body.attrId,
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

    app.post('/admin/goodAttrVal/delete', checkLogin);
    app.post('/admin/goodAttrVal/delete', function (req, res) {
        GoodAttrVal.update({
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

    app.post('/admin/goodAttrValList/search', checkLogin);
    app.post('/admin/goodAttrValList/search', function (req, res) {

        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {
            goodAttrId: req.body.attrId
        };
        if (req.body.name && req.body.name.trim()) {
            filter.name = {
                $like: `%${req.body.name.trim()}%`
            };
        }
        if (req.body.grade) {
            filter.gradeId = req.body.grade;
        }

        GoodAttrVal.getFiltersWithPage(page, filter)
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