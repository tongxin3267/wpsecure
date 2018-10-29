// 模板，可以用于自动生成entity

const db = require('../../db'),
    config = require('../../settings');

// 章节默认为4级，每级4位 最多16位
const Good = db.defineModel('goods', {
    name: {
        // 商品名称
        type: db.STRING(50)
    },
    sequence: {
        // 商品顺序
        type: db.INTEGER,
        defaultValue: 0
    },
    goodPrice: {
        type: db.DECIMAL(10, 2),
        defaultValue: 0
    },
    img: {
        // 商品图标
        type: db.STRING(100),
        defaultValue: ''
    },
    goodTypeId: {
        type: db.INTEGER,
        defaultValue: 0
    },
    goodTypeName: {
        type: db.STRING(50),
        defaultValue: ''
    }
});
module.exports = Good;

//读取用户信息
Good.getFilter = function (filter) {
    filter.isDeleted = false;
    return Good.findOne({
        'where': filter
    });
};

Good.getFilters = function (filter) {
    filter.isDeleted = false;
    return Good.findAll({
        'where': filter,
        order: [
            ['sequence'],
            ['createdDate'],
            ['_id']
        ]
    });
};

Good.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return Good.findAndCountAll({
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