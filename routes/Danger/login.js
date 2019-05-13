var crypto = require('crypto'),
    model = require("../../model.js"),
    Company = model.company,
    Employee = model.employee,
    auth = require("./auth"),
    checkNotLogin = auth.checkNotLogin;

module.exports = function (app) {
    app.get('/danger/login', function (req, res) {
        if (process.env.NODE_ENV == "development") {
            return Company.getFilter({
                    we_appId: "wwb50dd79078e140ef"
                })
                .then(company => {
                    req.session.company = company;
                    return Employee.getFilter({
                            companyId: req.session.company._id,
                            weUserId: "ZhaoWeiPu"
                        })
                        .then(user => {
                            req.session.danger = user;
                            return res.redirect('/danger');
                        });
                });
        }
        res.render('danger/login.html', {
            title: '登录'
        });
    });

    app.post('/danger/login', function (req, res) {
        //生成密码的 md5 值
        // var md5 = crypto.createHash('md5'),
        //     password = md5.update(req.body.password).digest('hex');
        // //检查用户是否存在
        // Company.getFilter({
        //         we_appId: req.body.name
        //     })
        //     .then(function (company) {
        //         if (!company) {
        //             return res.redirect('/people/login'); //用户不存在则跳转到登录页
        //         }

        //         //检查密码是否一致
        //         if (company.password != password) {
        //             return res.redirect('/people/login'); //密码错误则跳转到登录页
        //         }

        //         //用户名密码都匹配后，将用户信息存入 session
        //         req.session.company = company;
        //         res.redirect('/people/employeeList'); //登陆成功后跳转到主页
        //     })
        //     .catch(function (err) {
        //         //error to handle
        //     });
    });

    app.get('/danger/logout', function (req, res) {
        req.session.company = null;
        req.session.danger = null;
        res.redirect('/danger/login'); //登出成功后跳转到登录页面
    });
}