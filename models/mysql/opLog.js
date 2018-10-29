// 模板，可以用于自动生成entity

const db = require('../../db'),
    config = require('../../settings');

const OpLog = db.defineModel('opLogs', {
    userId: {
        type: db.INTEGER
    },
    description: {
        type: db.STRING(100),
        defaultValue: ""
    }
});
module.exports = OpLog;

//读取用户信息
OpLog.getFilter = function (filter) {
    filter.isDeleted = false;
    return OpLog.findOne({
        'where': filter
    });
};

OpLog.getFilters = function (filter) {
    filter.isDeleted = false;
    return OpLog.findAll({
        'where': filter,
        order: [
            ['sequence'],
            ['createdDate'],
            ['_id']
        ]
    });
};

OpLog.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return OpLog.findAndCountAll({
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