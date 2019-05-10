var xlsx = require("node-xlsx"),
    path = require('path'),
    multer = require('multer'),
    fs = require('fs'),
    model = require("../../model.js"),
    Salary = model.salary,
    Employee = model.employee,
    EmployeeContract = model.employeeContract,
    SystemConfigure = model.systemConfigure,
    ScoreFails = model.scoreFails,
    crypto = require('crypto'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin,
    serverPath = path.join(__dirname, "../"),
    storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './public/uploads/');
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname);
        }
    }),
    upload = multer({
        storage: storage
    });

module.exports = function (app) {
    // 错误记录，添加了错误人信息
    function failedScore(peopleId, name, mobile, score, examId, subject) {
        return ScoreFails.create({
            companyId: req.session.company._id,
            name: name, //score[0],
            mobile: mobile, //score[1],
            score: score, //score[2],
            examId: examId,
            subject: subject,
            createdBy: peopleId
        });
    };

    app.get('/people/score', checkLogin);
    app.get('/people/score', function (req, res) {
        res.render('people/scoreResult.html', {
            title: '>导入结果失败列表',
            websiteTitle: req.session.company.name,
            user: req.session.people,
            toPage: "people/partial/basicSetting.html",
            activeMenu: req.query.atm
        });
    });

    function clearFails(req) {
        return ScoreFails.destroy({
            where: {
                companyId: req.session.company._id,
                createdBy: req.session.people._id
            }
        });
    };
    // 清空个人错误记录
    app.get('/people/score/clearAll', checkLogin);
    app.get('/people/score/clearAll', function (req, res) {
        clearFails(req)
            .then(function () {
                res.jsonp({
                    sucess: true
                });
            });
    });

    // 显示出错记录
    app.get('/people/score/getAllWithoutPage', checkLogin);
    app.get('/people/score/getAllWithoutPage', function (req, res) {
        ScoreFails.getFilters({
                companyId: req.session.company._id,
                createdBy: req.session.people._id
            })
            .then(function (scoreFails) {
                res.jsonp(scoreFails);
            })
            .catch(function (err) {
                console.log('errored');
            });
    });

    // 提交工资
    app.post('/people/salary', upload.single('avatar'), function (req, res, next) {
        clearFails(req);

        var list = xlsx.parse(path.join(serverPath, "../public/uploads/", req.file.filename));
        // item 单独设置值，其他存到others
        var year = req.body.year,
            month = req.body.month,
            length = list[0].data.length,
            pArray = [],
            titleAry = [],
            colCount = 0;
        while (1) {
            if ((!list[0].data[0][colCount]) && (!list[0].data[1][colCount])) {
                // 第一行，第二行都为空
                break;
            }
            var cell = {
                title: list[0].data[1][colCount],
                parent: list[0].data[0][colCount]
            }
            if (!cell.title) {
                cell.title = cell.parent;
                cell.parent = "";
            } else if (!cell.parent) {
                cell.parent = titleAry[colCount - 1].parent;
            }
            titleAry.push(cell);
            colCount++;
        }

        // update salary month
        SystemConfigure.getFilter({
                name: "salaryMonth",
                companyId: req.session.company._id
            })
            .then(configure => {
                var configDate = new Date(configure.value),
                    uploadDate = new Date(year, month, 1);
                if (uploadDate > configDate) {
                    configure.value = year + "-" + month + "-1";
                    configure.save();
                }
            });
        var peopleId = req.session.people._id,
            companyId = req.session.company._id;
        for (var i = 2; i < length; i++) {
            // 双层excel
            // 0是序号，没有的时候通过name+mobile匹配
            if (!list[0].data[i][2]) {
                break;
            }
            pArray.push(updateSalary(titleAry, peopleId, list[0].data[i], colCount, year, month, companyId));
        }
        Promise.all(pArray)
            .then(function () {
                res.jsonp({
                    sucess: true
                });
            });
    });

    function updateSalary(titleAry, peopleId, data, colCount, year, month, companyId) {
        var mobile = getExcelNumber(data[1]);
        return Employee.getFilter({
                mobile: mobile,
                companyId: companyId
            })
            .then(employee => {
                if (!employee) {
                    return failedScore(peopleId, data[0], data[1], data[2], '没找到该员工');
                }
                return Salary.getFilter({
                        companyId: companyId,
                        year: year,
                        month: month,
                        employeeId: employee._id
                    })
                    .then(salary => {
                        if (salary) {
                            // 修改工资项
                            var attrs = {},
                                obj = [],
                                strUpdate = "update salarys set other=:other ",
                                replacement = {
                                    id: salary._id
                                };
                            for (var i = 2; i < colCount; i++) {
                                obj.push({
                                    title: titleAry[i].title,
                                    parent: titleAry[i].parent,
                                    value: data[i] || 0
                                });
                            }
                            replacement.other = JSON.stringify(obj);
                            return model.db.sequelize.query(strUpdate + " where _id=:id", {
                                replacements: replacement,
                                type: model.db.sequelize.QueryTypes.RAW
                            });
                        } else {
                            // 新增工资项
                            var attrs = {},
                                obj = {},
                                strUpdate = "INSERT INTO salarys (companyId,createdBy,employeeName,employeeId,mobile,year,month,other,createdDate,updatedDate",
                                strValue = "values (:companyId, :createdBy, :employeeName,:employeeId,:mobile,:year,:month,:other,now(),now()",
                                replacement = {
                                    companyId: companyId,
                                    createdBy: peopleId,
                                    employeeName: employee.name,
                                    employeeId: employee._id,
                                    mobile: employee.mobile,
                                    year: year,
                                    month: month
                                };
                            for (var i = 2; i < colCount; i++) {
                                obj.push({
                                    title: titleAry[i].title,
                                    parent: titleAry[i].parent,
                                    value: data[i] || 0
                                });
                            }
                            replacement.other = JSON.stringify(obj);
                            return model.db.sequelize.query(strUpdate + ")" + strValue + ")", {
                                replacements: replacement,
                                type: model.db.sequelize.QueryTypes.RAW
                            });
                        }
                    });
            });
    };

    //  failedScore(score[0], score[1], score[2], examId, subject);
    function addEmployee(score, peopleId, companyId) {
        var p, mobile = getExcelNumber(score[1]);
        if (score[2]) {
            // 根据编号
            p = Employee.getFilter({
                companyId: companyId,
                weUserId: score[2].trim()
            })
        } else {
            // 根据手机号
            p = Employee.getFilter({
                companyId: companyId,
                name: score[0].trim(),
                mobile: mobile
            });
        }
        p.then(function (employee) {
                if (employee) {
                    employee.mobile = mobile;
                    if (score[2] && score[2].trim()) {
                        employee.weUserId = score[2].trim();
                    }
                    return employee.save();
                } else {
                    return Employee.create({
                        name: score[0].trim(),
                        mobile: mobile,
                        companyId: companyId,
                        weUserId: (score[2] && score[2].trim()) || '',
                        other: {},
                        createdBy: peopleId
                    });
                }
            })
            .catch(err => {
                return failedScore(peopleId, score[0], score[1], score[2], (err.message || err));
            });
    };

    // 批量添加员工
    app.post('/people/batchAddemployee', upload.single('avatar'), function (req, res, next) {
        clearFails(req);

        var list = xlsx.parse(path.join(serverPath, "../public/uploads/", req.file.filename));
        //list[0].data[0] [0] [1] [2]
        var length = list[0].data.length,
            pArray = [],
            peopleId = req.session.people._id,
            companyId = req.session.company._id;
        for (var i = 1; i < length; i++) {
            if (!list[0].data[i][0]) {
                break; //already done
            }
            pArray.push(addEmployee(list[0].data[i], peopleId, companyId));
        }

        // res.redirect('/admin/score');
        Promise.all(pArray).then(function () {
            res.jsonp({
                sucess: true
            });
        });
    });

    function getExcelDate(excelDate) {
        if (typeof (excelDate) == "string") {
            return new Date(excelDate);
        } else if (typeof (excelDate) == "number") {
            return (new Date(1900, 0, parseInt(excelDate) - 1));
        } else {
            return new Date("1900-1-1");
        }
    };

    function getExcelNumber(excelData) {
        if (typeof (excelData) == "string") {
            return excelData.trim();
        } else if (typeof (excelData) == "number") {
            return excelData;
        } else {
            return excelData;
        }
    };
    // 批量添加合同的操作
    function addContract(contract, peopleId, companyId) {
        return Employee.getFilter({
                companyId: companyId,
                mobile: getExcelNumber(contract[1])
            })
            .then(function (employee) {
                if (employee) {
                    // check contract
                    var sequence = getExcelNumber(contract[2]);
                    return EmployeeContract.getFilter({
                            employeeId: employee._id,
                            sequence: sequence,
                            companyId: companyId
                        })
                        .then(oldcontract => {
                            if (oldcontract) {
                                oldcontract.startDate = getExcelDate(contract[3]);
                                oldcontract.endDate = getExcelDate(contract[4]);
                                oldcontract.deletedBy = peopleId;
                                return oldcontract.save();
                            } else {
                                return EmployeeContract.create({
                                    companyId: companyId,
                                    employeeId: employee._id,
                                    sequence: sequence,
                                    startDate: getExcelDate(contract[3]),
                                    endDate: getExcelDate(contract[4]),
                                    createdBy: peopleId
                                });
                            }
                        });
                } else {
                    return failedScore(peopleId, contract[0], '', '', '没找到该员工');
                }
            });
    };

    // 批量添加合同
    app.post('/people/batchAddContract', upload.single('avatar'), function (req, res, next) {
        clearFails(req);

        var list = xlsx.parse(path.join(serverPath, "../public/uploads/", req.file.filename));
        //list[0].data[0] [0] [1] [2]
        var length = list[0].data.length,
            pArray = [],
            peopleId = req.session.people._id,
            companyId = req.session.company._id;
        for (var i = 1; i < length; i++) {
            if (!list[0].data[i][0]) {
                break; //already done
            }
            pArray.push(addContract(list[0].data[i], peopleId, companyId));
        }

        // res.redirect('/admin/score');
        Promise.all(pArray).then(function () {
            res.jsonp({
                sucess: true
            });
        });
    });
}