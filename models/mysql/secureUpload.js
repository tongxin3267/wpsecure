// 模板，可以用于自动生成entity

const db = require('../../db'),
    config = require('../../settings');

// 章节默认为4级，每级4位 最多16位
const SecureUpload = db.defineModel('secureUploads', {
    position: {
        // 地点
        type: db.STRING(50),
        comment: "地点"
    },
    description: {
        // 问题
        type: db.STRING(500),
        defaultValue: "",
        comment: "问题描述"
    }, // 描述信息，用于seo
    imageName: {
        type: db.STRING(50),
        defaultValue: "",
        comment: "图片"
    },
    secureStatus: {
        // 状态：0 已提交 1 已处理 9 处理中
        type: db.INTEGER,
        defaultValue: 0,
        comment: "状态"
    },
    secureLevel: {
        // 安全等级 0 普通 9 紧急
        type: db.INTEGER,
        defaultValue: 0,
        comment: "安全等级"
    },
    responseUser: {
        // 责任人
        type: db.INTEGER,
        defaultValue: 0,
        comment: "责任人"
    },
    responseResult: {
        // 整顿情况
        type: db.STRING(500),
        defaultValue: "",
        comment: "整顿情况"
    },
    responseImage: {
        type: db.STRING(50),
        defaultValue: "",
        comment: "图片"
    }
});
module.exports = SecureUpload;

//读取用户信息
SecureUpload.getFilter = function (filter) {
    filter.isDeleted = false;
    return SecureUpload.findOne({
        'where': filter
    });
};

SecureUpload.getFilters = function (filter) {
    filter.isDeleted = false;
    return SecureUpload.findAll({
        'where': filter,
        order: [
            ['_id']
        ]
    });
};

SecureUpload.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return SecureUpload.findAndCountAll({
        'where': filter,
        order: [
            ['_id']
        ],
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};