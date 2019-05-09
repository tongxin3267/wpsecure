// 模板，可以用于自动生成entity

const db = require('../../db'),
    config = require('../../settings');

// 章节默认为4级，每级4位 最多16位
const SysSuit = db.defineModel('sysSuits', {
    name: {
        type: db.STRING(50)
    },
    suiteId: {
        type: db.STRING(30),
        defaultValue: ""
    },
    secret: {
        type: db.STRING(50),
        defaultValue: ""
    }
});
module.exports = SysSuit;

//读取用户信息
SysSuit.getFilter = function (filter) {
    filter.isDeleted = false;
    return SysSuit.findOne({
        'where': filter
    });
};

SysSuit.getFilters = function (filter) {
    filter.isDeleted = false;
    return SysSuit.findAll({
        'where': filter,
        order: [
            ['_id']
        ]
    });
};

SysSuit.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return SysSuit.findAndCountAll({
        'where': filter,
        order: [
            ['_id']
        ],
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};