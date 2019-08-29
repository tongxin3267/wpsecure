var db = require('../../db');

var fs = require('fs'),
    path = require("path");

module.exports = function (app) {
    app.get('/renameMath', function (req, res) {
        res.render('Test/renameMath.html', {
            title: '文件重命名'
        });
    });

    app.post('/renameMath', function (req, res) {
        var sourceFolder = req.body.source,
            targetFolder = req.body.target,
            files = fs.readdirSync(sourceFolder);
        files.forEach(file => {
            var fPath = path.join(sourceFolder, file),
                stats = fs.statSync(fPath);
            if (stats.isFile()) {
                if ("Thumbs.db" == file) {
                    return;
                }
                // check name and copy to new target folder
                var gradeName = file.substr(0, 1),
                    i = file.indexOf('周'),
                    weekName = file.substr(4, i - 4),
                    j = file.indexOf('.'),
                    fullDayName = file.substr(i + 1, j - i - 1),
                    dayName = fullDayName;

                if (dayName.startsWith("J")) {
                    dayName = dayName.substr(2, 1);
                    fullDayName = "j";
                } else {
                    dayName = dayName.substr(1, 1);
                    fullDayName = "";
                }

                var newName = "";
                switch (gradeName) {
                    case "一":
                        newName += "01";
                        break;
                    case "二":
                        newName += "02";
                        break;
                    case "三":
                        newName += "03";
                        break;
                    case "四":
                        newName += "04";
                        break;
                    case "五":
                        newName += "05";
                        break;
                    case "六":
                        newName += "06";
                        break;
                }

                var week = '0' + (parseInt(weekName) + 35).toString();
                newName += week.substr(week.length - 2, 2);
                newName += (dayName + fullDayName + ".jpg");
                copyfile(fPath, path.join(targetFolder, newName));
            }
        });
        res.jsonp({
            sucess: true
        });
    });

    function copyfile(file1, file2) {
        return new Promise(function (resolve, reject) {
            fs.copyFile(file1, file2, function (err) {
                if (err) {
                    reject();
                    return;
                }
                resolve();
            });
        });
    };
};