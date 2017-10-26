var Grade = require('../../models/grade.js');

module.exports = function(app) {
    app.get('/dbPressure', function(req, res) {
        res.render('Test/dbPressure.html', {
            title: '数据库压力测试'
        });
    });
    app.post('/dbPressure', function(req, res) {
        Grade.getAll(null, 1, {}, function(err, grades, total) {
            if (err) {
                grades = [];
            }
            res.jsonp({
                title: '测试成功',
                user: req.session.admin,
                grades: grades,
                counts: req.body.counts
            });
        });
    });
};