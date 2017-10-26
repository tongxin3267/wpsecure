var StudentInfo = require('../../models/studentInfo.js');

module.exports = function(app) {
    app.get('/updateStudent', function(req, res) {
        res.render('Test/updateStudentAccount.html', {
            title: '学生更新'
        });
    });

    app.post('/updateStudent', function(req, res) {
        var studentInfo = new StudentInfo({
            accountId: req.body.accountId
        });

        studentInfo.update(req.body.studentId, function(err, studentInfo) {
            if (err) {
                studentInfo = {};
            }
            res.jsonp({ sucess: true });
        });
    });

    app.post('/recoverStudent', function(req, res) {
        var studentInfo = new StudentInfo({
            isDeleted: false
        });

        studentInfo.update(req.body.studentId, function(err, studentInfo) {
            if (err) {
                studentInfo = {};
            }
            res.jsonp({ sucess: true });
        });
    });
}