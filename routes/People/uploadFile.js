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
    function failedScore(people, name, mobile, score, examId, subject) {
        return ScoreFails.create({
            name: name, //score[0],
            mobile: mobile, //score[1],
            score: score, //score[2],
            examId: examId,
            subject: subject,
            createdBy: people._id
        });
    };

    app.get('/people/score', checkLogin);
    app.get('/people/score', function (req, res) {
        res.render('people/scoreResult.html', {
            title: '>导入结果失败列表',
            websiteTitle: req.session.company.name,
            user: req.session.company,
            toPage: "people/partial/basicSetting.html"
        });
    });

    // 清空个人错误记录
    app.get('/people/score/clearAll', checkLogin);
    app.get('/people/score/clearAll', function (req, res) {
        ScoreFails.destroy({
                where: {
                    createdBy: req.session.company._id
                }
            })
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
                createdBy: req.session.company._id
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
        var list = xlsx.parse(path.join(serverPath, "../public/uploads/", req.file.filename));
        SalaryItem.getFilters({})
            .then(items => {
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
                for (var i = 2; i < length; i++) {
                    // 双层excel
                    // 0是序号，没有的时候通过name+mobile匹配
                    if (!list[0].data[i][2]) {
                        break;
                    }
                    pArray.push(updateSalary(titleAry, items, req.session.company, list[0].data[i], colCount, year, month));
                }
                Promise.all(pArray)
                    .then(function () {
                        res.jsonp({
                            sucess: true
                        });
                    });
            });
    });

    function updateSalary(titleAry, items, people, data, colCount, year, month) {
        return Employee.getFilter({
                nickname: data[2].trim()
            })
            .then(employee => {
                SystemConfigure.getFilter({
                        key: "salaryMonth"
                    })
                    .then(configure => {
                        var configDate = new Date(configure.value),
                            uploadDate = new Date(year, month, 1);
                        if (uploadDate > configDate) {
                            configure.value = year + "-" + month + "-1";
                            configure.save();
                        }
                    });
                return employee;
            })
            .then(employee => {
                if (!employee) {
                    return failedScore(people, data[0], data[1], data[2], '没找到该员工');
                }
                return Salary.getFilter({
                        year: year,
                        month: month,
                        employeeId: employee._id
                    })
                    .then(salary => {
                        if (salary) {
                            // 修改工资项
                            var attrs = {},
                                obj = {},
                                strUpdate = "update salarys set other=:other ",
                                replacement = {
                                    id: salary._id
                                };
                            for (var i = 5; i < colCount; i++) {
                                if (titleAry[i].parent) {
                                    if (!obj[titleAry[i].parent]) {
                                        obj[titleAry[i].parent] = {};
                                    }
                                    obj[titleAry[i].parent][titleAry[i].title] = data[i] || 0;
                                } else {
                                    obj[titleAry[i].title] = data[i] || 0;
                                }
                                attrs[titleAry[i]] = data[i] || 0;
                            }
                            replacement.other = JSON.stringify(obj);
                            items.forEach(item => {
                                strUpdate += "," + item.fieldName + "=:" + item.fieldName;
                                replacement[item.fieldName] = (attrs[item.name] || 0);
                            });
                            return model.db.sequelize.query(strUpdate + " where _id=:id", {
                                replacements: replacement,
                                type: model.db.sequelize.QueryTypes.RAW
                            });
                        } else {
                            // 新增工资项
                            var attrs = {},
                                obj = {},
                                strUpdate = "INSERT INTO salarys (employeeName,employeeId,mobile,year,month,other,createdDate,updatedDate",
                                strValue = "values (:employeeName,:employeeId,:mobile,:year,:month,:other,now(),now()",
                                replacement = {
                                    employeeName: employee.name,
                                    employeeId: employee._id,
                                    mobile: employee.mobile,
                                    year: year,
                                    month: month
                                };
                            for (var i = 5; i < colCount; i++) {
                                if (titleAry[i].parent) {
                                    if (!obj[titleAry[i].parent]) {
                                        obj[titleAry[i].parent] = {};
                                    }
                                    obj[titleAry[i].parent][titleAry[i].title] = data[i] || 0;
                                } else {
                                    obj[titleAry[i].title] = data[i] || 0;
                                }
                                attrs[titleAry[i]] = data[i] || 0;
                            }
                            replacement.other = JSON.stringify(obj);
                            items.forEach(item => {
                                strUpdate += "," + item.fieldName;
                                strValue += ",:" + item.fieldName;
                                replacement[item.fieldName] = (attrs[item.name] || 0);
                            });
                            return model.db.sequelize.query(strUpdate + ")" + strValue + ")", {
                                replacements: replacement,
                                type: model.db.sequelize.QueryTypes.RAW
                            });
                        }
                    });
            });
    };

    //  failedScore(score[0], score[1], score[2], examId, subject);
    function addEmployee(score) {
        var p;
        if (score[2]) {
            // 根据编号
            p = Employee.getFilter({
                weUserId: score[2].trim()
            })
        } else {
            // 根据手机号
            p = Employee.getFilter({
                name: score[0].trim(),
                mobile: score[1]
            });
        }
        p.then(function (employee) {
            if (employee) {
                employee.other = score[5].trim();
                return employee.save();
            } else {
                return Employee.create({
                    name: score[0].trim(),
                    mobile: score[1],
                    companyId: req.session.company._id,
                    other: score[5].trim()
                });
            }
        });
    };

    // 批量添加老师
    app.post('/people/batchAddemployee', upload.single('avatar'), function (req, res, next) {
        var list = xlsx.parse(path.join(serverPath, "../public/uploads/", req.file.filename));
        //list[0].data[0] [0] [1] [2]
        var length = list[0].data.length,
            pArray = [];
        for (var i = 1; i < length; i++) {
            if (!list[0].data[i][0]) {
                break; //already done
            }
            pArray.push(addEmployee(list[0].data[i]));
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
    // 批量添加合同的操作
    function addContract(contract, people) {
        return Employee.getFilter({
                nickname: contract[0].trim()
            })
            .then(function (employee) {
                if (employee) {
                    // check contract
                    return EmployeeContract.getFilter({
                            employeeId: employee._id,
                            sequence: contract[1]
                        })
                        .then(oldcontract => {
                            if (oldcontract) {
                                oldcontract.startDate = getExcelDate(contract[2]);
                                oldcontract.endDate = getExcelDate(contract[3]);
                                oldcontract.deletedBy = people._id;
                                return oldcontract.save();
                            } else {
                                return EmployeeContract.create({
                                    employeeId: employee._id,
                                    sequence: contract[1],
                                    startDate: getExcelDate(contract[2]),
                                    endDate: getExcelDate(contract[3]),
                                    createdBy: people._id
                                });
                            }
                        });
                } else {
                    return failedScore(people, contract[0], '', '', '没找到该员工');
                }
            });
    };

    // 批量添加合同
    app.post('/people/batchAddContract', upload.single('avatar'), function (req, res, next) {
        var list = xlsx.parse(path.join(serverPath, "../public/uploads/", req.file.filename));
        //list[0].data[0] [0] [1] [2]
        var length = list[0].data.length,
            pArray = [],
            people = req.session.company;
        for (var i = 1; i < length; i++) {
            if (!list[0].data[i][0]) {
                break; //already done
            }
            pArray.push(addContract(list[0].data[i], people));
        }

        // res.redirect('/admin/score');
        Promise.all(pArray).then(function () {
            res.jsonp({
                sucess: true
            });
        });
    });
}