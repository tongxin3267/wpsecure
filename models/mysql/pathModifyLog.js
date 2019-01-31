// 模板，可以用于自动生成entity

const db = require('../../db'),
    config = require('../../settings');

// 章节默认为4级，每级4位 最多16位
const PathModifyLog = db.defineModel('pathModifyLogs', {
    pathId: {
        type: db.INTEGER
    },
    sequence: {
        type: db.INTEGER,
        defaultValue: 0
    },
    preGoodId: {
        type: db.INTEGER,
        defaultValue: ""
    }, // 描述信息，用于seo
    preGoodName: {
        // 商品名称
        type: db.STRING(50),
        defaultValue: ''
    },
    preGoodCount: {
        // 机器管理员修改
        type: db.INTEGER,
        defaultValue: 0,
        comment: "商品数量"
    },
    goodCount: {
        // 机器管理员修改
        type: db.INTEGER,
        defaultValue: 0,
        comment: "商品数量"
    },
    goodId: {
        // 可以为空，就是不添加商品
        // 机器管理员修改
        type: db.INTEGER,
        defaultValue: ''
    },
    goodName: {
        // 商品名称
        type: db.STRING(50),
        defaultValue: ''
    }
});
module.exports = PathModifyLog;

//读取用户信息
PathModifyLog.getFilter = function (filter) {
    filter.isDeleted = false;
    return PathModifyLog.findOne({
        'where': filter
    });
};

PathModifyLog.getFilters = function (filter) {
    filter.isDeleted = false;
    return PathModifyLog.findAll({
        'where': filter,
        order: [
            ['sequence'],
            ['createdDate'],
            ['_id']
        ]
    });
};

PathModifyLog.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return PathModifyLog.findAndCountAll({
        'where': filter,
        order: [
            ['sequence'],
            ['createdDate'],
            ['_id']
        ],
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};