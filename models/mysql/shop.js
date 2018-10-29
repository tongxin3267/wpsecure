// 模板，可以用于自动生成entity

const db = require('../../db'),
    config = require('../../settings');

// 章节默认为4级，每级4位 最多16位
const Shop = db.defineModel('shops', {
    name: {
        // 分店名称
        type: db.STRING(50)
    },
    sequence: {
        // 分店顺序
        type: db.INTEGER,
        defaultValue: 0
    },
    address: {
        // 分店地址
        type: db.STRING(200),
        defaultValue: ''
    }
});
module.exports = Shop;

//读取用户信息
Shop.getFilter = function (filter) {
    filter.isDeleted = false;
    return Shop.findOne({
        'where': filter
    });
};

Shop.getFilters = function (filter) {
    filter.isDeleted = false;
    return Shop.findAll({
        'where': filter,
        order: [
            ['sequence'],
            ['createdDate'],
            ['_id']
        ]
    });
};

Shop.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return Shop.findAndCountAll({
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