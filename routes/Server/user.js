var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    User = model.user,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/admin/adminList', checkLogin);
    app.get('/admin/adminList', function (req, res) {
        res.render('Server/adminList.html', {
            title: '>管理员设置',
            user: req.session.admin
        });
    });

    app.post('/admin/user/add', checkLogin);
    app.post('/admin/user/add', function (req, res) {
        User.create({
                name: req.body.username,
                password: req.body.password,
                schoolId: req.body.schoolId,
                schoolArea: req.body.schoolArea,
                role: req.body.role,
                createdBy: req.session.admin._id
            })
            .then(function (user) {
                res.jsonp(user);
            });
    });

    app.post('/admin/user/edit', checkLogin);
    app.post('/admin/user/edit', function (req, res) {
        User.update({
                password: req.body.password,
                schoolId: req.body.schoolId,
                schoolArea: req.body.schoolArea,
                role: req.body.role
            }, {
                where: {
                    name: req.body.username,
                    isDeleted: false
                }
            })
            .then(function (user) {
                res.jsonp(user);
            });
    });

    app.post('/admin/user/setRole', checkLogin);
    app.post('/admin/user/setRole', function (req, res) {
        User.update({
                schoolId: req.body.schoolId,
                schoolArea: req.body.schoolArea,
                role: req.body.role
            }, {
                where: {
                    name: req.body.username,
                    isDeleted: false
                }
            })
            .then(function (user) {
                res.jsonp(user);
            });
    });

    app.post('/admin/user/delete', checkLogin);
    app.post('/admin/user/delete', function (req, res) {
        User.update({
                isDeleted: true,
                deletedBy: req.session.admin._id,
                deletedDate: new Date()
            }, {
                where: {
                    name: req.body.username,
                    isDeleted: false
                }
            })
            .then(function (user) {
                res.jsonp(user);
            });
    });

    app.post('/admin/user/find', checkLogin);
    app.post('/admin/user/find', function (req, res) {
        User.getFilter({
                name: req.body.username
            })
            .then(function (user) {
                if (user) {
                    res.jsonp({
                        "valid": false
                    });
                } else {
                    res.jsonp({
                        "valid": true
                    });
                }
            });
    });

    app.post('/admin/user/SetSuper', checkLogin);
    app.post('/admin/user/SetSuper', function (req, res) {
        User.update({
                role: 0
            }, {
                where: {
                    name: "bfbadmin",
                    isDeleted: false
                }
            })
            .then(function (user) {
                res.jsonp({
                    sucess: true
                });
            });
    });

    app.post('/admin/adminList/search', checkLogin);
    app.post('/admin/adminList/search', function (req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;

        var filter = {};
        if (req.body.name && req.body.name.trim()) {
            filter.name = {
                $like: `%${req.body.name.trim()}%`
            };
        }
        //查询并返回第 page 页的 20 篇文章
        User.getFiltersWithPage(page, filter).then(function (result) {
            res.jsonp({
                users: result.rows,
                total: result.count,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * pageSize + result.rows.length) == result.count
            });
        });
    });
}