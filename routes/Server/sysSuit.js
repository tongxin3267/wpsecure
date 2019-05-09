var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    SysSuit = model.sysSuit,
    SystemConfigure = model.systemConfigure,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/sysSuitList', checkLogin);
    app.get('/admin/sysSuitList', function (req, res) {
        res.render('Server/sysSuitList.html', {
            title: '>套件列表',
            user: req.session.admin,
            websiteTitle: model.db.config.websiteTitle
        });
    });

    app.post('/admin/sysSuit/add', checkLogin);
    app.post('/admin/sysSuit/add', function (req, res) {
        var suiteId = req.body.suiteId;
        SysSuit.create({
                name: req.body.name,
                suiteId: req.body.suiteId,
                secret: req.body.secret,
                createdBy: req.session.admin._id
            })
            .then(function (result) {
                // add configures
                SystemConfigure.getFilter({
                        suiteId: suiteId
                    })
                    .then(suit => {
                        if (suit) {
                            SystemConfigure.update({
                                    isDeleted: 0
                                }, {
                                    where: {
                                        suiteId: suit.suiteId
                                    }
                                })
                                .then(() => {
                                    res.jsonp({
                                        error: "原来套件已经存在，恢复成可见"
                                    });
                                });
                        } else {
                            return SystemConfigure.bulkCreate([{
                                    companyId: 0,
                                    name: 'suite_ticket',
                                    suiteId: suiteId
                                }, {
                                    companyId: 0,
                                    name: "suite_access_token",
                                    suiteId: suiteId
                                }])
                                .then(() => {
                                    res.jsonp(result);
                                });
                        }
                    });
            });
    });

    app.post('/admin/sysSuit/edit', checkLogin);
    app.post('/admin/sysSuit/edit', function (req, res) {
        SysSuit.getFilter({
                _id: req.body.id
            })
            .then(suit => {
                SysSuit.update({
                        name: req.body.name,
                        suiteId: req.body.suiteId,
                        secret: req.body.secret,
                        deletedBy: req.session.admin._id,
                        updatedDate: new Date()
                    }, {
                        where: {
                            _id: req.body.id
                        }
                    })
                    .then(function () {
                        if (suit.suiteId == req.body.suiteId) {
                            res.jsonp({
                                sucess: true
                            });
                        } else {
                            SystemConfigure.update({
                                    suiteId: req.body.suiteId
                                }, {
                                    where: {
                                        suiteId: suit.suiteId
                                    }
                                })
                                .then(() => {
                                    res.jsonp({
                                        sucess: true
                                    });
                                });
                        }
                    });
            });
    });

    app.post('/admin/sysSuit/delete', checkLogin);
    app.post('/admin/sysSuit/delete', function (req, res) {
        SysSuit.update({
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

    app.post('/admin/sysSuitList/search', checkLogin);
    app.post('/admin/sysSuitList/search', function (req, res) {

        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.name && req.body.name.trim()) {
            filter.name = {
                $like: `%${req.body.name.trim()}%`
            };
        }

        SysSuit.getFiltersWithPage(page, filter)
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