var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    Shop = model.shop,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/shopList', checkLogin);
    app.get('/admin/shopList', function (req, res) {
        res.render('Server/shopList.html', {
            title: '>门店列表',
            websiteTitle: model.db.config.websiteTitle,
            user: req.session.admin
        });
    });

    app.get('/shop/:id/goodList', checkLogin);
    app.get('/shop/:id/goodList', function (req, res) {
        Shop.getFilter({
                _id: req.params.id
            })
            .then(s => {
                res.render('Server/shopGoodList.html', {
                    title: '>门店商品',
                    websiteTitle: s.name,
                    user: req.session.admin,
                    shopId: req.params.id
                });
            });
    });

    app.post('/admin/shop/add', checkLogin);
    app.post('/admin/shop/add', function (req, res) {
        Shop.create({
                name: req.body.name,
                address: req.body.address,
                createdBy: req.session.admin._id
            })
            .then(function (result) {
                if (result) {
                    res.jsonp(result);
                }
            });
    });

    app.post('/admin/shop/edit', checkLogin);
    app.post('/admin/shop/edit', function (req, res) {
        Shop.update({
                name: req.body.name,
                address: req.body.address,
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

    app.post('/admin/shop/delete', checkLogin);
    app.post('/admin/shop/delete', function (req, res) {
        Shop.update({
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

    app.post('/admin/shopList/search', checkLogin);
    app.post('/admin/shopList/search', function (req, res) {

        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.name && req.body.name.trim()) {
            filter.name = {
                $like: `%${req.body.name.trim()}%`
            };
        }

        Shop.getFiltersWithPage(page, filter)
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