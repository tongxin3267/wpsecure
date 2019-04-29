var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    Teacher = model.teacher,
    Grade = model.grade,
    auth = require("./auth"),
    crypto = require('crypto'),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    app.get('/people', checkLogin);
    app.get('/people', function (req, res) {
        res.render('people/employeeList.html', {
            title: '>员工设置',
            user: req.session.people
        });
    });

    app.get('/people/employeeList', checkLogin);
    app.get('/people/employeeList', function (req, res) {
        res.render('people/employeeList.html', {
            title: '>员工设置',
            user: req.session.people
        });
    });

    app.get('/people/batchAddemployee', checkLogin);
    app.get('/people/batchAddemployee', function (req, res) {
        res.render('people/batchAddemployee.html', {
            title: '>批量添加员工',
            user: req.session.people
        });
    });

    app.post('/people/employee/add', checkLogin);
    app.post('/people/employee/add', function (req, res) {
        var md5 = crypto.createHash('md5');
        Teacher.getFilter({
            mobile: req.body.mobile
        })
            .then(function (teacher) {
                if (teacher) {
                    res.jsonp({
                        error: "电话号码已经存在了！"
                    });
                } else {
                    Teacher.create({
                        name: req.body.name,
                        engName: req.body.engName,
                        mobile: req.body.mobile,
                        address: req.body.address,
                        subjectId: req.body.subjectId,
                        gradeType: req.body.gradeType,
                        role: (req.body.role || 20),
                        password: md5.update("111111").digest('hex'),
                        nativePlace: req.body.nativePlace,
                        idType: req.body.idType,
                        marryType: req.body.marryType,
                        partyType: req.body.partyType,
                        sex: req.body.sex,
                        isRegSecur: req.body.isRegSecur,
                        departmentName: req.body.departmentName,
                        positionType: req.body.positionType,
                        highEduBg: req.body.highEduBg,
                        graduateSchool: req.body.graduateSchool,
                        graduateSubject: req.body.graduateSubject,
                        idNumber: req.body.idNumber,
                        firstWorkDate: req.body.firstWorkDate,
                        onBoardDate: req.body.onBoardDate,
                        yearHolidays: req.body.yearHolidays,
                        usedHolidays: req.body.usedHolidays,
                        overTime: req.body.overTime,
                        nickname: req.body.nickname,
                        createdBy: req.session.people._id
                    })
                        .then(function (teacher) {
                            res.jsonp(teacher);
                        });
                }
            });

    });

    app.post('/people/employee/edit', checkLogin);
    app.post('/people/employee/edit', function (req, res) {
        Teacher.getFilter({
            mobile: req.body.mobile,
            _id: {
                $ne: req.body.id
            }
        })
            .then(function (teacher) {
                if (teacher) {
                    res.jsonp({
                        error: "电话号码已经存在了！"
                    });
                } else {
                    Teacher.update({
                        name: req.body.name,
                        engName: req.body.engName,
                        mobile: req.body.mobile,
                        subjectId: req.body.subjectId,
                        gradeType: req.body.gradeType,
                        role: (req.body.role || 20),
                        address: req.body.address,
                        nativePlace: req.body.nativePlace,
                        idType: req.body.idType,
                        marryType: req.body.marryType,
                        partyType: req.body.partyType,
                        sex: req.body.sex,
                        isRegSecur: req.body.isRegSecur,
                        departmentName: req.body.departmentName,
                        positionType: req.body.positionType,
                        highEduBg: req.body.highEduBg,
                        graduateSchool: req.body.graduateSchool,
                        graduateSubject: req.body.graduateSubject,
                        idNumber: req.body.idNumber,
                        firstWorkDate: req.body.firstWorkDate,
                        onBoardDate: req.body.onBoardDate,
                        yearHolidays: req.body.yearHolidays,
                        usedHolidays: req.body.usedHolidays,
                        overTime: req.body.overTime,
                        nickname: req.body.nickname
                    }, {
                            where: {
                                _id: req.body.id
                            }
                        })
                        .then(function (teacher) {
                            res.jsonp(teacher);
                        });
                }
            });
    });

    app.post('/people/employee/delete', checkLogin);
    app.post('/people/employee/delete', function (req, res) {
        Teacher.update({
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

    app.post('/people/employee/recover', checkLogin);
    app.post('/people/employee/recover', function (req, res) {
        Teacher.update({
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
        if (req.body.departmentName) {
            filter.departmentName = req.body.departmentName;
        }

        if (req.body.isDeleted == "true") {
            filter.isDeleted = true;
        }

        Teacher.getFiltersWithPage(page, filter)
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