module.exports = {
    checkLogin: function (req, res, next) {
        //if (!req.session.admin || req.session.admin.name != "11") {
        if (!req.session.admin) {
            res.redirect('/admin/login');
            return;
        }
        next();
    },
    checkNotLogin: function (req, res, next) {
        //if (req.session.admin && req.session.admin.name == "11") {
        if (req.session.admin) {
            res.redirect('back'); //返回之前的页面
            return;
        }
        next();
    },
    checkSecure: function (req, res, next) {
        switch (req.session.admin.role) {
            case 10:
                if (req.path == "/admin/adminRollCallList") {
                    next();
                    break;
                } else {
                    res.redirect('/admin/adminRollCallList'); //返回之前的页面
                    return;
                }
            case 7:
                if (req.path == "/admin/adminBookList") {
                    next();
                    break;
                } else {
                    res.redirect('/admin/adminBookList'); //返回之前的页面
                    return;
                }
            case 3:
                next();
                break;
            case 0:
                next();
                break;
        }
    }
};