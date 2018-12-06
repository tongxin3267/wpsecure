var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    Order = model.order,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/wechat/orderList', checkLogin);
    app.get('/wechat/orderList', function (req, res) {
        var s = req.session.shop;
        res.render('wechat/shopOrderList.html', {
            title: '>门店订单',
            websiteTitle: s.name,
            user: req.session.admin,
            shopId: req.params.id
        });
    });

    app.post('/wechat/orderList/search', checkLogin);
    app.post('/wechat/orderList/search', function (req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {
            payStatus: 2
        };
        Order.getFiltersWithPage(page, filter)
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