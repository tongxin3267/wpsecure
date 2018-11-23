// 模板，可以用于自动生成entity

const db = require('../../db'),
    config = require('../../settings');

// 章节默认为4级，每级4位 最多16位
const GoodAttrVal = db.defineModel('goodAttrVals', {
    goodId: {
        type: db.INTEGER
    },
    goodAttrId: {
        type: db.INTEGER
    },
    name: {
        type: db.STRING(20),
        defaultValue: ""
    },
    sequence: {
        type: db.INTEGER,
        defaultValue: 0
    },
    price: {
        type: db.DECIMAL(10, 2),
        defaultValue: 0
    }
});
module.exports = GoodAttrVal;

//读取用户信息
GoodAttrVal.getFilter = function (filter) {
    filter.isDeleted = false;
    return GoodAttrVal.findOne({
        'where': filter
    });
};

GoodAttrVal.getFilters = function (filter) {
    filter.isDeleted = false;
    return GoodAttrVal.findAll({
        'where': filter,
        order: [
            ['sequence'],
            ['createdDate'],
            ['_id']
        ]
    });
};

GoodAttrVal.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return GoodAttrVal.findAndCountAll({
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