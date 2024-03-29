var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    Salary = model.salary,
    SalaryItem = model.salaryItem,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/people/salaryList', checkLogin);
    app.get('/people/salaryList', function (req, res) {
        res.render('people/salaryList.html', {
            title: '>工资列表',
            websiteTitle: req.session.company.name,
            user: req.session.people
        });
    });

    app.get('/people/batchuploadSalary', checkLogin);
    app.get('/people/batchuploadSalary', function (req, res) {
        res.render('people/batchuploadSalary.html', {
            title: '>工资批量上传',
            websiteTitle: req.session.company.name,
            user: req.session.people
        });
    });

    app.get('/people/sumSalary', checkLogin);
    app.get('/people/sumSalary', function (req, res) {
        res.render('people/sumSalary.html', {
            title: '>工资总和统计',
            websiteTitle: req.session.company.name,
            user: req.session.people
        });
    });

    app.post('/people/salary/add', checkLogin);
    app.post('/people/salary/add', function (req, res) {
        Salary.create({
                companyId: req.session.company._id,
                employeeName: req.body.employeeName,
                employeeId: req.body.employeeId,
                year: req.body.year,
                month: req.body.month,
                other: req.body.other,
                createdBy: req.session.people._id
            })
            .then(function (result) {
                if (result) {
                    res.jsonp(result);
                }
            });
    });

    app.post('/people/salary/edit', checkLogin);
    app.post('/people/salary/edit', function (req, res) {
        Salary.update({
                employeeName: req.body.employeeName,
                employeeId: req.body.employeeId,
                year: req.body.year,
                month: req.body.month,
                other: req.body.other,
                deletedBy: req.session.people._id,
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

    app.post('/people/salary/delete', checkLogin);
    app.post('/people/salary/delete', function (req, res) {
        Salary.update({
                isDeleted: true,
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

    app.post('/people/salaryList/search', checkLogin);
    app.post('/people/salaryList/search', function (req, res) {

        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {
            companyId: req.session.company._id,
            year: req.body.year,
            month: req.body.month,
            createdBy: req.session.people._id
        };
        if (req.body.name && req.body.name.trim()) {
            filter.employeeName = req.body.name.trim();
        }

        Salary.getFiltersWithPage(page, filter)
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