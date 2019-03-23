var https = require('https'),
    zlib = require('zlib'),
    crypto = require('crypto');
const db = require('../../db');

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
            fs.writeFile(file2, str, function (err) {
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

    app.post('/generator1', function (req, res) {
        var root = process.cwd();
        var objId = req.body.objId,
            objCase = objId[0].toUpperCase() + objId.substr(1);

        //generate models
        var modelPath = path.join(root, "models/template4.md"),
            targetPath = path.join(root, "models/mysql/" + objId + ".js");
        readFile(modelPath, targetPath, function (str) {
            var strResult = str.replace(/#name#/g, objId);
            return strResult.replace(/#Name#/g, objCase);
        });

        res.jsonp({
            sucess: true
        });
    });

    app.post('/generator2', function (req, res) {
        var root = process.cwd();
        var objId = req.body.objId,
            objCase = objId[0].toUpperCase() + objId.substr(1),
            newEntity,
            objBasicAttributes = "",
            viewAttributes = "",
            jsAddAttributes = "",
            jsEditAttributes = "",
            jsSaveAttributes = "";
        try {
            newEntity = require('../../models/mysql/' + objId + '.js');
        } catch (ex) {

        }
        for (var key in newEntity.attributes) {
            switch (key) {
                case "_id":
                case "createdBy":
                case "createdDate":
                case "updatedDate":
                case "isDeleted":
                case "deletedBy":
                case "deletedDate":
                case "version":
                    break;
            }
            objBasicAttributes += (`${key}:req.body.${key}`);

            var curField = newEntity.attributes[key];
            switch (curField.type.key) {
                case "STRING":
                    var length = curField.type._length;
                    viewAttributes += '<div class="form-group"><label for="' + key + '" class="control-label">' + (curField.comment) + ':</label><input type="text" maxlength="' + length + '" class="form-control" name="' + key + '" id="' + key + '"></div>';
                    jsAddAttributes += '$("#myModal #' + key + '").val("");';
                    jsEditAttributes += '$("#myModal #' + key + '").val(entity.' + key + ');';
                    jsSaveAttributes += key + ': $.trim($("#myModal #' + key + '").val()),';
                    break;
                case "INTEGER":
                    viewAttributes += '<div class="form-group"><label for="' + key + '" class="control-label">' + (curField.comment) + ':</label><input type="number" maxlength="10" class="form-control" name="' + key + '" id="' + key + '" value="0"></div>';
                    jsAddAttributes += '$("#myModal #' + key + '").val(0);';
                    jsEditAttributes += '$("#myModal #' + key + '").val(entity.' + key + ');';
                    jsSaveAttributes += key + ': $.trim($("#myModal #' + key + '").val()),';
                    break;
                case "DATE":
                    viewAttributes += '<div class="form-group"><label for="' + key + '" class="control-label">' + (curField.comment) + ':</label><input type="text" class="form-control" name="' + key + '" required id="' + key + '"></div>'
                    jsAddAttributes += '$("#myModal #' + key + '").val(moment(new Date()).format("YYYY-MM-DD HH:mm"));';
                    jsEditAttributes += '$("#myModal #' + key + '").val(entity.' + key + ');';
                    jsSaveAttributes += key + ': $.trim($("#myModal #' + key + '").val()),';
                    break;
                case "BOOLEAN":
                    viewAttributes += '<div class="form-group"><label for="' + key + '" class="control-label">' + (curField.comment) + ':</label><select name="' + key + '" id="' + key + '"><option value="0">否</option><option value="1">是</option></select></div>';
                    jsAddAttributes += '$("#myModal #' + key + '").val("0");';
                    jsEditAttributes += '$("#myModal #' + key + '").val(entity.' + key + ');';
                    jsSaveAttributes += key + ': $.trim($("#myModal #' + key + '").val()),';
                    break;
                case "DECIMAL":
                    var length = curField.type._length;
                    viewAttributes += '<div class="form-group"><label for="' + key + '" class="control-label">' + (curField.comment) + ':</label><input type="text" maxlength="20" class="form-control" name="' + key + '" id="' + key + '" value="0"></div>';
                    jsAddAttributes += '$("#myModal #' + key + '").val("0");';
                    jsEditAttributes += '$("#myModal #' + key + '").val(entity.' + key + ');';
                    jsSaveAttributes += key + ': $.trim($("#myModal #' + key + '").val()),';
                    break;
            }
        }
        //generate routes
        modelPath = path.join(root, "routes/Server/template4.md"),
            targetPath = path.join(root, "routes/Server/" + objId + ".js");
        readFile(modelPath, targetPath, function (str) {
            var strResult = str.replace(/#name#/g, objId);
            strResult = strResult.replace(/#Name#/g, objCase);

            return strResult.replace(/#BasicAttributes#/g, objBasicAttributes);
        });

        //generate views
        modelPath = path.join(root, "views/Server/template4.md"),
            targetPath = path.join(root, "views/Server/" + objId + "List.html"); // "List.html");
        readFile(modelPath, targetPath, function (str) {
            var strResult = str.replace(/#name#/g, objId);
            strResult = strResult.replace(/#Name#/g, objCase);
            return strResult.replace(/#viewAttributes#/g, viewAttributes);
        });

        //generate public js
        modelPath = path.join(root, "public/default/assets/js/template4.md"),
            targetPath = path.join(root, "public/default/assets/js/Server/" + objId + "List.js");
        readFile(modelPath, targetPath, function (str) {
            var strResult = str.replace(/#name#/g, objId);
            strResult = strResult.replace(/#Name#/g, objCase);
            strResult = strResult.replace(/#jsAddAttributes#/g, jsAddAttributes);
            strResult = strResult.replace(/#jsEditAttributes#/g, jsEditAttributes);
            return strResult.replace(/#jsSaveAttributes#/g, jsSaveAttributes);
        });

        res.jsonp({
            sucess: true
        });
    });
};