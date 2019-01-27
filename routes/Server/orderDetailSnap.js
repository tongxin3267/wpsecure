var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    OrderDetailSnap = model.orderDetailSnap,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.post('/admin/orderDetailSnapList/getsnaps', checkLogin);
    app.post('/admin/orderDetailSnapList/getsnaps', function (req, res) {
        OrderDetailSnap.getFilters({
                orderDetailId: req.body.detailId
            })
            .then(function (snaps) {
                res.jsonp(snaps);
            });
    });

    app.post('/admin/orderDetailSnapList/search', checkLogin);
    app.post('/admin/orderDetailSnapList/search', function (req, res) {

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

        OrderDetailSnap.getFiltersWithPage(page, filter)
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