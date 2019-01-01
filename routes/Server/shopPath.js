var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    ShopPath = model.shopPath,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function(app) {
    app.get('/shop/shopPathList', checkLogin);
    app.get('/shop/shopPathList', function(req, res) {
        res.render('Server/shopPathList.html', {
            title: '>机器轨道',
            websiteTitle: req.session.shop.name,
            user: req.session.admin
        });
    });

    app.post('/shop/shopPath/add', checkLogin);
    app.post('/shop/shopPath/add', function(req, res) {
        ShopPath.create({
            shopId: req.session.shop._id,
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

    app.post('/shop/shopPath/edit', checkLogin);
    app.post('/shop/shopPath/edit', function(req, res) {
        ShopPath.update({
            shopId: req.session.shop._id,
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

    app.post('/shop/shopPath/delete', checkLogin);
    app.post('/shop/shopPath/delete', function(req, res) {
        ShopPath.update({
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

    app.post('/shop/shopPathList/search', checkLogin);
    app.post('/shop/shopPathList/search', function(req, res) {

        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {shopId: req.session.shop._id};
        if (req.body.name && req.body.name.trim()) {
            filter.name = {
                $like: `%${req.body.name.trim()}%`
            };
        }
        if (req.body.grade) {
            filter.gradeId = req.body.grade;
        }

        ShopPath.getFiltersWithPage(page, filter)
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