var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    Shop = model.shop,
    ShopPath = model.shopPath,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/shopList', checkLogin);
    app.get('/admin/shopList', function (req, res) {
        auth.serverOption({
            title: '>机器列表',
            user: req.session.admin
        }).then(option => {
            res.render('Server/shopList.html', option);
        });
    });

    app.post('/admin/shop/add', checkLogin);
    app.post('/admin/shop/add', function (req, res) {
        Shop.create({
                name: req.body.name,
                password: Math.random().toString(12).substr(2, 10),
                address: req.body.address,
                hpathCount: req.body.hpathCount,
                vpathCount: req.body.vpathCount,
                phone: req.body.phone,
                openTime: req.body.openTime,
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
                hpathCount: req.body.hpathCount,
                vpathCount: req.body.vpathCount,
                phone: req.body.phone,
                openTime: req.body.openTime,
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
                ShopPath.update({
                        isDeleted: true,
                        deletedBy: req.session.admin._id,
                        deletedDate: new Date()
                    }, {
                        where: {
                            shopId: req.body.id
                        }
                    })
                    .then(() => {
                        res.jsonp({
                            sucess: true
                        });
                    })
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

    // 设置轨道
    app.post('/admin/shop/resetPath', checkLogin);
    app.post('/admin/shop/resetPath', function (req, res) {
        ShopPath.update({
                isDeleted: true,
                deletedBy: req.session.admin._id,
                deletedDate: new Date()
            }, {
                where: {
                    shopId: req.body.id
                }
            })
            .then(function () {
                var i = parseInt(req.body.hpathCount),
                    j = parseInt(req.body.vpathCount),
                    total = i * j,
                    shopPaths = [];

                for (var i = 0; i < total; i++) {
                    shopPaths.push({
                        sequence: i + 1,
                        shopId: req.body.id
                    });
                }
                // update path also
                ShopPath.bulkCreate(shopPaths)
                    .then(() => {
                        res.jsonp({
                            sucess: true
                        });
                    });
            });
    });
}