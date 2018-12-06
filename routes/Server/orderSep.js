var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    OrderSep = model.orderSep,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function(app) {
    app.get('/admin/orderSepList', checkLogin);
    app.get('/admin/orderSepList', function(req, res) {
        res.render('Server/orderSepList.html', {
            title: '>校区列表',
            user: req.session.admin
        });
    });

    app.post('/admin/orderSep/add', checkLogin);
    app.post('/admin/orderSep/add', function(req, res) {
        OrderSep.create({
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

    app.post('/admin/orderSep/edit', checkLogin);
    app.post('/admin/orderSep/edit', function(req, res) {
        OrderSep.update({
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

    app.post('/admin/orderSep/delete', checkLogin);
    app.post('/admin/orderSep/delete', function(req, res) {
        OrderSep.update({
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

    app.post('/admin/orderSepList/search', checkLogin);
    app.post('/admin/orderSepList/search', function(req, res) {

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

        OrderSep.getFiltersWithPage(page, filter)
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