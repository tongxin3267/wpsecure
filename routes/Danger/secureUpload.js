var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    SecureUpload = model.secureUpload,
    auth = require("../Danger/auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/danger', checkLogin);
    app.get('/danger', function (req, res) {
        res.render('danger/secureUploadList.html', {
            title: '>隐患列表',
            user: req.session.danger,
            websiteTitle: req.session.company.name
        });
    });

    app.post('/danger/secureUpload/delete', checkLogin);
    app.post('/danger/secureUpload/delete', function (req, res) {
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

    app.post('/danger/secureUploadList/search', checkLogin);
    app.post('/danger/secureUploadList/search', function (req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {
            companyId: req.session.company._id,
        };
        if (req.body.secureStatus) {
            filter.secureStatus = req.body.secureStatus;
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