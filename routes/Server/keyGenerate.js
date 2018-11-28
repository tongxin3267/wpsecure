var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    KeyGenerate = model.keyGenerate,
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function(app) {
    app.get('/admin/keyGenerateList', checkLogin);
    app.get('/admin/keyGenerateList', function(req, res) {
        res.render('Server/keyGenerateList.html', {
            title: '>校区列表',
            user: req.session.admin
        });
    });

    app.post('/admin/keyGenerate/add', checkLogin);
    app.post('/admin/keyGenerate/add', function(req, res) {
        KeyGenerate.create({
            name: req.body.name,
            sequence: req.body.sequence,
            createdBy: req.session.admin._id
        })
        .then(function(result){
            if(result)
            {
                 res.jsonp(result);
            }
        });
    });

    app.post('/admin/keyGenerate/edit', checkLogin);
    app.post('/admin/keyGenerate/edit', function(req, res) {
        KeyGenerate.update({
            name: req.body.name,
            sequence: req.body.sequence,
            deletedBy: req.session.admin._id,
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

    app.post('/admin/keyGenerate/delete', checkLogin);
    app.post('/admin/keyGenerate/delete', function(req, res) {
        KeyGenerate.update({
                isDeleted: true,
                deletedBy: req.session.admin._id,
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

    app.post('/admin/keyGenerateList/search', checkLogin);
    app.post('/admin/keyGenerateList/search', function(req, res) {

        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 20 篇文章
        var filter = {};
        if (req.body.name && req.body.name.trim()) {
            filter.name = {
                $like: `%${req.body.name.trim()}%`
            };
        }
        if (req.body.grade) {
            filter.gradeId = req.body.grade;
        }

        KeyGenerate.getFiltersWithPage(page, filter)
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