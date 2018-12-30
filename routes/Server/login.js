var crypto = require('crypto'),
    model = require("../../model.js"),
    User = model.user,
    auth = require("./auth");

module.exports = function (app) {
    app.get('/admin', auth.checkLogin)
    app.get('/admin', function (req, res) {
        auth.serverOption({
            title: '>管理员设置',
            user: req.session.admin
        }).then(option => {
            res.render('Server/adminList.html', option);
        });
    });

    app.get('/admin/login', auth.checkNotLogin);
    app.get('/admin/login', function (req, res) {
        auth.serverOption({
            title: '登录',
            user: req.session.admin
        }).then(option => {
            res.render('Server/login.html', option);
        });
    });

    // app.post('/admin/login', auth.checkSecure([0]));
    app.post('/admin/login', auth.checkNotLogin);
    app.post('/admin/login', function (req, res) {
        //生成密码的 md5 值
        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');
        //检查用户是否存在
        User.getFilter({
                name: req.body.name,
                role: 100
            })
            .then(function (user) {
                if (!user) {
                    return res.redirect('/admin/login'); //用户不存在则跳转到登录页
                }

                //检查密码是否一致
                if (user.password != password) {
                    return res.redirect('/admin/login'); //密码错误则跳转到登录页
                }

                //用户名密码都匹配后，将用户信息存入 session
                req.session.admin = user;
                res.redirect('/admin');
            })
            .catch(function (err) {
                //error to handle
            });
    });
}