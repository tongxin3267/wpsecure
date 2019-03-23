var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    SecureUpload = model.secureUpload,
    Ws_user = model.ws_user,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/secureUploadList', checkLogin);
    app.get('/admin/secureUploadList', function (req, res) {
        res.render('Server/secureUploadList.html', {
            title: '>校区列表',
            user: req.session.admin,
            websiteTitle: model.db.config.websiteTitle
        });
    });

    app.post('/admin/secureUpload/add', checkLogin);
    app.post('/admin/secureUpload/add', function (req, res) {
        SecureUpload.create({
                position: req.body.position,
                description: req.body.description,
                secureStatus: req.body.secureStatus,
                secureLevel: req.body.secureLevel,
                responseUser: req.body.responseUser,
                responseResult: req.body.responseResult,
                createdBy: req.session.admin._id
            })
            .then(function (result) {
                if (result) {
                    res.jsonp(result);
                }
            });
    });

    app.post('/admin/secureUpload/edit', checkLogin);
    app.post('/admin/secureUpload/edit', function (req, res) {
        SecureUpload.update({
                position: req.body.position,
                description: req.body.description,
                secureStatus: req.body.secureStatus,
                secureLevel: req.body.secureLevel,
                responseUser: req.body.responseUser,
                responseResult: req.body.responseResult,
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

    app.post('/admin/secureUpload/delete', checkLogin);
    app.post('/admin/secureUpload/delete', function (req, res) {
        SecureUpload.update({
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

    app.post('/admin/secureUploadList/search', checkLogin);
    app.post('/admin/secureUploadList/search', function (req, res) {

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

        SecureUpload.getFiltersWithPage(page, filter)
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