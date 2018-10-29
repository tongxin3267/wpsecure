// 模板，可以用于自动生成entity

const db = require('../../db'),
    config = require('../../settings');

// 章节默认为4级，每级4位 最多16位
const GoodType = db.defineModel('goodTypes', {
    name: {
        type: db.STRING(50)
    },
    sequence: {
        type: db.INTEGER,
        defaultValue: 0
    }
});
module.exports = GoodType;

//读取用户信息
GoodType.getFilter = function (filter) {
    filter.isDeleted = false;
    return GoodType.findOne({
        'where': filter
    });
};

GoodType.getFilters = function (filter) {
    filter.isDeleted = false;
    return GoodType.findAll({
        'where': filter,
        order: [
            ['sequence'],
            ['createdDate'],
            ['_id']
        ]
    });
};

GoodType.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return GoodType.findAndCountAll({
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