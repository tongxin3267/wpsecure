var https = require('https'),
    zlib = require('zlib'),
    crypto = require('crypto');

var fs = require('fs'),
    path = require("path");
// 加载编码转换模块  
var iconv = require('iconv-lite');

function readFile(file1, file2, callback) {
    fs.readFile(file1, function (err, data) {
        if (err)
            console.log("读取文件fail " + err);
        else {
            var str = iconv.decode(data, 'utf-8');
            str = callback(str);
            fs.appendFile(file2, str, function (err) {
                if (err)
                    console.log("fail " + err);
                else
                    console.log("写入文件ok");
            });
        }
    });
}


module.exports = function (app) {
    app.get('/generator', function (req, res) {
        res.render('Test/generator.html', {
            title: '自动生成'
        });
    });
    app.post('/generator', function (req, res) {
        var root = process.cwd();
        var objId = req.body.objId,
            objCase = objId[0].toUpperCase() + objId.substr(1);
        //generate models
        var modelPath = path.join(root, "models/template4.md"),
            targetPath = path.join(root, "models/" + objId + ".js");
        readFile(modelPath, targetPath, function (str) {
            var strResult = str.replace(/#name#/g, objId);
            return strResult.replace(/#Name#/g, objCase);
        });

        //generate routes
        modelPath = path.join(root, "routes/Server/template4.md"),
            targetPath = path.join(root, "routes/Server/" + objId + ".js");
        readFile(modelPath, targetPath, function (str) {
            var strResult = str.replace(/#name#/g, objId);
            return strResult.replace(/#Name#/g, objCase);
        });

        //generate views
        modelPath = path.join(root, "views/Server/template4.md"),
            targetPath = path.join(root, "views/Server/" + objId + "List.html"); // "List.html");
        readFile(modelPath, targetPath, function (str) {
            var strResult = str.replace(/#name#/g, objId);
            return strResult.replace(/#Name#/g, objCase);
        });

        //generate public js
        modelPath = path.join(root, "public/default/assets/js/template4.md"),
            targetPath = path.join(root, "public/default/assets/js/Server/" + objId + ".js");
        readFile(modelPath, targetPath, function (str) {
            var strResult = str.replace(/#name#/g, objId);
            return strResult.replace(/#Name#/g, objCase);
        });

        //readFile();
        //writeFile(file);
        res.render('Test/generator.html', {
            title: '生成成功'
        });
    });
};