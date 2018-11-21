// var Grade = require('../../models/grade.js');
var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    KeyGenerate = model.keyGenerate;

module.exports = function (app) {
    app.get('/dbPressure', function (req, res) {
        res.render('Test/dbPressure.html', {
            title: '数据库压力测试'
        });
    });

    function genkey(i) {
        if (i <= 1000) {
            return KeyGenerate.create({})
                .then(o => {
                    return genkey(i + 1);
                })
                .catch(e => {
                    console.log(e);
                });
        }
    }

    app.post('/dbPressure', function (req, res) {
        // 压力测试
        var t1 = new Date();
        genkey(1)
            .then(o => {
                var t2 = new Date();
                console.log(t1.getTime());
                console.log(t2.getTime());
                res.jsonp({
                    sucess: true
                });
            });
    });
};