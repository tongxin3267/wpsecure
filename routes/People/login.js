var crypto = require('crypto'),
    model = require("../../model.js"),
    Company = model.company,
    auth = require("./auth"),
    checkNotLogin = auth.checkNotLogin;

module.exports = function (app) {
    app.get('/people/login', function (req, res) {
        res.render('people/login.html', {
            title: '登录'
        });
    });

    app.post('/people/login', function (req, res) {
        //生成密码的 md5 值
        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');
        //检查用户是否存在
        Company.getFilter({
                we_appId: req.body.name
            })
            .then(function (company) {
                if (!company) {
                    return res.redirect('/people/login'); //用户不存在则跳转到登录页
                }

                //检查密码是否一致
                if (company.password != password) {
                    return res.redirect('/people/login'); //密码错误则跳转到登录页
                }

                //用户名密码都匹配后，将用户信息存入 session
                req.session.company = company;
                res.redirect('/people/employeeList'); //登陆成功后跳转到主页
            })
            .catch(function (err) {
                //error to handle
            });
    });

    app.get('/people/logout', function (req, res) {
        req.session.company = null;
        res.redirect('/people/login'); //登出成功后跳转到登录页面
    });
}