var mongoose = require('./db');
var db = mongoose.connection;

var opLogsSchema = new mongoose.Schema({
    userId: String, //用户Id
    description: String, //图片Id
    createdDate: {
        type: Date,
        default: Date.now
    }, //创建日期
    deletedBy: String //被谁删掉
}, {
    collection: 'opLogs'
});

var opLogsModel = mongoose.model('opLogs', opLogsSchema);

function OpLogs(option) {
    this.option = option;
};

module.exports = OpLogs;

//存储学区信息
OpLogs.prototype.save = function () {
    var newEntity = new opLogsModel(this.option);

    return newEntity.save();
};

OpLogs.prototype.update = function (id) {
    return opLogsModel.update({
            _id: id
        }, this.option)
        .exec();
};

//读取学区信息
OpLogs.get = function (id) {
    //打开数据库
    return opLogsModel.findOne({
        _id: id,
        isDeleted: false
    });
};

//一次获取20个学区信息
OpLogs.getAll = function (id, page, filter, callback) {
    if (filter) {
        filter.isDeleted = false;
    } else {
        filter = {
            isDeleted: false
        };
    }
    var query = opLogsModel.count(filter);
    query.exec(function (err, count) {
        query.find()
            .sort({
                _id: 1
            })
            .skip((page - 1) * 14)
            .limit(14)
            .exec(function (err, entitys) {
                callback(null, entitys, count);
            });
    });
};

//删除一个学区
OpLogs.delete = function (filter) {
    return opLogsModel.update(filter, {
            isDeleted: true,
            deletedDate: new Date()
        }, {
            multi: true
        })
        .exec();
};

OpLogs.getFilters = function (filter) {
    if (filter) {
        filter.isDeleted = false;
    } else {
        filter = {
            isDeleted: false
        };
    }
    return opLogsModel.find(filter);
};