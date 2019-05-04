var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    User = model.user,
    crypto = require('crypto'),
    auth = require("./auth");

module.exports = function (app) {
    app.get('/admin/adminList', auth.checkLogin);
    app.get('/admin/adminList', auth.checkSecure([100]));
    app.get('/admin/adminList', function (req, res) {
        res.render('Server/adminList.html', {
            title: '>管理员设置',
            user: req.session.admin,
            websiteTitle: model.db.config.websiteTitle
        });
    });

    app.post('/admin/admin/add', auth.checkLogin);
    app.post('/admin/admin/add', function (req, res) {
        User.getFilter({
            name: req.body.name.trim(),
        })
            .then(user => {
                if (user) {
                    res.jsonp({
                        error: "用户名已经存在"
                    });
                } else {
                    var md5 = crypto.createHash('md5'),
                        password = md5.update(req.body.password.trim() || '654321').digest('hex');
                    User.create({
                        name: req.body.name.trim(),
                        password: password,
                        role: req.body.role,
                        createdBy: req.session.admin._id
                    })
                        .then(function (book) {
                            res.jsonp(book);
                        });
                }
            })
    });

    app.post('/admin/admin/edit', auth.checkLogin);
    app.post('/admin/admin/edit', function (req, res) {
        User.getFilter({
            name: req.body.name.trim(),
            _id: {
                $ne: req.body.id
            }
        })
            .then(user => {
                if (user) {
                    res.jsonp({
                        error: "用户名已经存在"
                    });
                } else {
                    var filter = {
                        name: req.body.name.trim(),
                        role: req.body.role,
                        updatedDate: new Date(),
                        deletedBy: req.session.admin._id
                    };
                    if (req.body.password.trim()) {
                        var md5 = crypto.createHash('md5'),
                            password = md5.update(req.body.password.trim() || '654321').digest('hex');
                        filter.password = password;
                    }

                    User.update(filter, {
                        where: {
                            _id: req.body.id
                        }
                    })
                        .then(function (book) {
                            res.jsonp(book);
                        });
                }
            })
    });

    app.post('/admin/admin/delete', auth.checkLogin);
    app.post('/admin/admin/delete', function (req, res) {
        User.update({
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

    app.post('/admin/adminList/search', auth.checkLogin);
    app.post('/admin/adminList/search', function (req, res) {
        var page = req.query.p ? parseInt(req.query.p) : 1;
        var filter = {};
        if (req.body.name && req.body.name.trim()) {
            filter.name = {
                $like: `%${req.body.name.trim()}%`
            };
        }

        User.getFiltersWithPage(page, filter)
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