var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    Employee = model.employee,
    Grade = model.grade,
    auth = require("./auth"),
    crypto = require('crypto'),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/people', checkLogin);
    app.get('/people', function (req, res) {
        res.render('people/employeeList.html', {
            title: '>员工设置',
            websiteTitle: req.session.company.name,
            user: req.session.people
        });
    });

    app.get('/people/employeeList', checkLogin);
    app.get('/people/employeeList', function (req, res) {
        res.render('people/employeeList.html', {
            title: '>员工设置',
            websiteTitle: req.session.company.name,
            user: req.session.people
        });
    });

    app.get('/people/batchAddemployee', checkLogin);
    app.get('/people/batchAddemployee', function (req, res) {
        res.render('people/batchAddemployee.html', {
            title: '>批量添加员工',
            websiteTitle: req.session.company.name,
            user: req.session.people
        });
    });

    app.post('/people/employee/addManager', function (req, res) {
        if (!req.session.company) {
            res.jsonp({
                error: "not login"
            });
            return;
        }
        Employee.getFilter({
                mobile: req.body.mobile
            })
            .then(function (employee) {
                if (employee) {
                    res.jsonp({
                        error: "电话号码已经存在了！"
                    });
                } else {
                    Employee.create({
                            companyId: req.session.company._id,
                            name: req.body.name,
                            mobile: req.body.mobile,
                            weUserId: req.body.weUserId,
                            other: {},
                            createdBy: 0
                        })
                        .then(function (employee) {
                            req.session.people = employee;
                            res.jsonp(employee);
                        });
                }
            });
    });

    app.post('/people/employee/add', checkLogin);
    app.post('/people/employee/add', function (req, res) {
        var md5 = crypto.createHash('md5');
        Employee.getFilter({
                mobile: req.body.mobile
            })
            .then(function (employee) {
                if (employee) {
                    res.jsonp({
                        error: "电话号码已经存在了！"
                    });
                } else {
                    Employee.create({
                            companyId: req.session.company._id,
                            name: req.body.name,
                            mobile: req.body.mobile,
                            weUserId: req.body.weUserId,
                            other: {},
                            createdBy: req.session.people._id
                        })
                        .then(function (employee) {
                            res.jsonp(employee);
                        });
                }
            });

    });

    app.post('/people/employee/edit', checkLogin);
    app.post('/people/employee/edit', function (req, res) {
        Employee.getFilter({
                mobile: req.body.mobile,
                _id: {
                    $ne: req.body.id
                }
            })
            .then(function (employee) {
                if (employee) {
                    res.jsonp({
                        error: "电话号码已经存在了！"
                    });
                } else {
                    Employee.update({
                            name: req.body.name,
                            mobile: req.body.mobile,
                            weUserId: req.body.weUserId,
                            deletedBy: req.session.people._id
                        }, {
                            where: {
                                _id: req.body.id
                            }
                        })
                        .then(function (employee) {
                            res.jsonp(employee);
                        });
                }
            });
    });

    app.post('/people/employee/delete', checkLogin);
    app.post('/people/employee/delete', function (req, res) {
        Employee.update({
                isDeleted: 1,
                deletedBy: req.session.people._id,
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

    // 删掉的重新恢复
    app.post('/people/employee/recover', checkLogin);
    app.post('/people/employee/recover', function (req, res) {
        Employee.update({
                isDeleted: false,
                deletedBy: req.session.people._id,
                updatedDate: new Date()
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

    app.post('/people/employee/search', checkLogin);
    app.post('/people/employee/search', function (req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.name && req.body.name.trim()) {
            filter.name = {
                $like: `%${req.body.name.trim()}%`
            };
        }

        if (req.body.isDeleted == "true") {
            filter.isDeleted = true;
        }

        Employee.getFiltersWithPage(page, filter)
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