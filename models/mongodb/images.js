var mongoose = require('./db');
var db = mongoose.connection;

var imagesSchema = new mongoose.Schema({
    userId: String, //用户Id
    imageId: String, //图片Id
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
    collection: 'images'
});

var imagesModel = mongoose.model('images', imagesSchema);

function Images(option) {
    this.option = option;
};

module.exports = Images;

//存储学区信息
Images.prototype.save = function () {
    var newEntity = new imagesModel(this.option);

    return newEntity.save();
};

Images.prototype.update = function (id) {
    return imagesModel.update({
            _id: id
        }, this.option)
        .exec();
};

//读取学区信息
Images.get = function (id) {
    //打开数据库
    return imagesModel.findOne({
        _id: id,
        isDeleted: false
    });
};

//一次获取20个学区信息
Images.getAll = function (id, page, filter, callback) {
    if (filter) {
        filter.isDeleted = false;
    } else {
        filter = {
            isDeleted: false
        };
    }
    var query = imagesModel.count(filter);
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
Images.delete = function (filter) {
    return imagesModel.update(filter, {
            isDeleted: true,
            deletedDate: new Date()
        }, {
            multi: true
        })
        .exec();
};

Images.getFilters = function (filter) {
    if (filter) {
        filter.isDeleted = false;
    } else {
        filter = {
            isDeleted: false
        };
    }
    return imagesModel.find(filter);
};