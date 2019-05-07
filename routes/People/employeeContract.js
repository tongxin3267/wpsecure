var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    Teacher = model.teacher,
    EmployeeContract = model.employeeContract,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/people/contract/:employeeId', checkLogin);
    app.get('/people/contract/:employeeId', function (req, res) {
        Teacher.getFilter({
                _id: req.params.employeeId
            })
            .then(teacher => {
                res.render('people/employeeContractList.html', {
                    title: '>合同列表-' + teacher.name,
                    websiteTitle: req.session.company.name,
                    user: req.session.people,
                    employeeId: teacher._id
                });
            });
    });

    app.get('/people/batchAddContract', checkLogin);
    app.get('/people/batchAddContract', function (req, res) {
        res.render('people/batchAddContract.html', {
            title: '>批量添加合同',
            websiteTitle: req.session.company.name,
            user: req.session.people
        });
    });

    app.post('/people/employeeContract/add', checkLogin);
    app.post('/people/employeeContract/add', function (req, res) {
        EmployeeContract.create({
                employeeId: req.body.employeeId,
                sequence: req.body.sequence,
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                createdBy: req.session.people._id
            })
            .then(function (result) {
                if (result) {
                    res.jsonp(result);
                }
            });
    });

    app.post('/people/employeeContract/edit', checkLogin);
    app.post('/people/employeeContract/edit', function (req, res) {
        EmployeeContract.update({
                employeeId: req.body.employeeId,
                sequence: req.body.sequence,
                startDate: req.body.startDate,
                endDate: req.body.endDate,
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

    app.post('/people/employeeContract/delete', checkLogin);
    app.post('/people/employeeContract/delete', function (req, res) {
        EmployeeContract.update({
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

    app.post('/people/employeeContractList/search', checkLogin);
    app.post('/people/employeeContractList/search', function (req, res) {

        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.employeeId) {
            filter.employeeId = req.body.employeeId;
        }
        EmployeeContract.getFiltersWithPage(page, filter)
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