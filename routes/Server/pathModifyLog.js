var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    PathModifyLog = model.pathModifyLog,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/shop/goodLog', checkLogin);
    app.get('/shop/goodLog', function (req, res) {
        auth.serverOption({
            title: '>补货日志列表',
            user: req.session.admin
        }).then(option => {
            res.render('Server/pathModifyLogList.html', option);
        });
    });

    app.post('/admin/pathModifyLogList/search', checkLogin);
    app.post('/admin/pathModifyLogList/search', function (req, res) {

        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {};

        PathModifyLog.getFiltersWithPage(page, filter)
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