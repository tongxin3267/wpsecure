var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    SystemConfigure = model.systemConfigure,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function(app) {
    app.get('/admin/systemConfigureList', checkLogin);
    app.get('/admin/systemConfigureList', function(req, res) {
        res.render('Server/systemConfigureList.html', {
            title: '>校区列表',
            websiteTitle: model.db.config.websiteTitle,
            user: req.session.admin
        });
    });

    app.post('/admin/systemConfigure/add', checkLogin);
    app.post('/admin/systemConfigure/add', function(req, res) {
        SystemConfigure.create({
            name: req.body.name,
            sequence: req.body.sequence,
            createdBy: req.session.admin._id
        })
        .then(function(result){
            if(result)
            {
                 res.jsonp(result);
            }
        });
    });

    app.post('/admin/systemConfigure/edit', checkLogin);
    app.post('/admin/systemConfigure/edit', function(req, res) {
        SystemConfigure.update({
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

    app.post('/admin/systemConfigure/delete', checkLogin);
    app.post('/admin/systemConfigure/delete', function(req, res) {
        SystemConfigure.update({
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

    app.post('/admin/systemConfigureList/search', checkLogin);
    app.post('/admin/systemConfigureList/search', function(req, res) {

        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.name && req.body.name.trim()) {
            filter.name = {
                $like: `%${req.body.name.trim()}%`
            };
        }
        if (req.body.grade) {
            filter.gradeId = req.body.grade;
        }

        SystemConfigure.getFiltersWithPage(page, filter)
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