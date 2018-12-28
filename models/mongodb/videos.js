var mongoose = require('./db');
var db = mongoose.connection;

var videosSchema = new mongoose.Schema({
    userId: String, //用户Id
    videoId: String, //图片Id
    isDeleted: {
        type: Boolean,
        default: false
    }, // 是否删除
    createdDate: {
        type: Date,
        default: Date.now
    }, //创建日期
    deletedDate: Date, //删除日期
    deletedBy: String //被谁删掉
}, {
    collection: 'videos'
});

var videosModel = mongoose.model('videos', videosSchema);

function Videos(option) {
    this.option = option;
};

module.exports = Videos;

//存储学区信息
Videos.prototype.save = function () {
    var newEntity = new videosModel(this.option);

    return newEntity.save();
};

Videos.prototype.update = function (id) {
    return videosModel.update({
            _id: id
        }, this.option)
        .exec();
};

//读取学区信息
Videos.get = function (id) {
    //打开数据库
    return videosModel.findOne({
        _id: id,
        isDeleted: false
    });
};

//一次获取20个学区信息
Videos.getAll = function (id, page, filter, callback) {
    if (filter) {
        filter.isDeleted = false;
    } else {
        filter = {
            isDeleted: false
        };
    }
    var query = videosModel.count(filter);
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
Videos.delete = function (filter) {
    return videosModel.update(filter, {
            isDeleted: true,
            deletedDate: new Date()
        }, {
            multi: true
        })
        .exec();
};

Videos.getFilters = function (filter) {
    if (filter) {
        filter.isDeleted = false;
    } else {
        filter = {
            isDeleted: false
        };
    }
    return videosModel.find(filter);
};