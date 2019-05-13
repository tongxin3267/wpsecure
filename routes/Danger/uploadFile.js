var model = require("../../model.js"),
    auth = require("./auth"),
    excel = require('excel4node'),
    path = require('path'),
    sharp = require('sharp'),
    SecureUpload = model.secureUpload,
    checkLogin = auth.checkLogin,
    serverPath = path.join(__dirname, "../");

module.exports = function (app) {
    function addimage(worksheet, name, companyId, row, col) {
        var imgPath = path.join(__dirname, "../../public/uploads/" + companyId + "/client/images/" + name);
        return sharp(imgPath)
            .rotate()
            .resize(350)
            .toBuffer()
            .then(imgbuf => {
                worksheet.addImage({
                    image: imgbuf,
                    type: 'picture',
                    position: {
                        type: 'twoCellAnchor',
                        from: {
                            col: col,
                            colOff: 0,
                            row: row,
                            rowOff: 0,
                        },
                        to: {
                            col: col + 1,
                            colOff: 0,
                            row: row + 1,
                            rowOff: 0,
                        }
                    }
                });
            });
    };

    function exportExcel(items, companyId) {
        var workbook = new excel.Workbook();
        var worksheet = workbook.addWorksheet('隐患列表');
        worksheet.column(5).setWidth(30);
        worksheet.column(9).setWidth(30);
        worksheet.row(1).setHeight(20);
        worksheet.cell(1, 1).string('创建人');
        worksheet.cell(1, 2).string('创建时间');
        worksheet.cell(1, 3).string('地点');
        worksheet.cell(1, 4).string('问题描述');
        worksheet.cell(1, 5).string('问题图片');
        worksheet.cell(1, 6).string('责任人');
        worksheet.cell(1, 7).string('整顿时间');
        worksheet.cell(1, 8).string('整顿情况');
        worksheet.cell(1, 9).string('整顿图片');

        function iterator(num) {
            if (num == items.length) {
                return;
            }
            var curItem = items[num],
                curIndex = num + 2,
                pArray = [];
            worksheet.row(curIndex).setHeight(120);
            worksheet.cell(curIndex, 1).string(curItem.createdName);
            worksheet.cell(curIndex, 2).date(curItem.createdDate);
            worksheet.cell(curIndex, 3).string(curItem.position);
            worksheet.cell(curIndex, 4).string(curItem.description);
            // worksheet.cell(curIndex, 5).string('问题图片');
            worksheet.cell(curIndex, 6).string(curItem.responsorName);
            if (curItem.doneDate) {
                worksheet.cell(curIndex, 7).date(curItem.doneDate);
            }
            worksheet.cell(curIndex, 8).string(curItem.responseResult);
            // worksheet.cell(curIndex, 9).string('整顿图片');
            if (curItem.imageName) {
                pArray.push(addimage(worksheet, curItem.imageName, companyId, curIndex, 5));
            }
            if (curItem.responseImage) {
                pArray.push(addimage(worksheet, curItem.responseImage, companyId, curIndex, 9));
            }
            return Promise.all(pArray)
                .then(() => {
                    return iterator(num + 1);
                });
        }

        iterator(0)
            .then(() => {
                workbook.write('exportWithimage.xlsx');
            })
            .catch(err => {

            });
    };

    app.post('/danger/exportWithimage', checkLogin)
    app.post('/danger/exportWithimage', function (req, res) {
        // 不能超过2000条
        SecureUpload.count({
                where: {
                    isDeleted: 0,
                    companyId: req.session.company._id,
                    secureStatus: req.body.secureStatus
                }
            })
            .then(count => {
                if (count == 0) {
                    return res.jsonp({
                        error: "还没有数据呢"
                    });
                } else if (count > 2000) {
                    return res.jsonp({
                        error: "数据超过2000条"
                    });
                } else {
                    SecureUpload.getFilters({
                            companyId: req.session.company._id,
                            secureStatus: req.body.secureStatus
                        })
                        .then(items => {
                            exportExcel(items, req.session.company._id);
                        });
                    return res.jsonp({
                        sucess: true
                    });
                }
            })
    });
}