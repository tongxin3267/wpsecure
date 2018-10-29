// 模板，可以用于自动生成entity

const db = require('../../db'),
    config = require('../../settings');

// 章节默认为4级，每级4位 最多16位
const Cart = db.defineModel('carts', {
    userId: {
        type: db.INTEGER
    },
    shopGoodId: {
        type: db.INTEGER
    },
    buyCount: {
        type: db.INTEGER,
        defaultValue: 1
    }
});
module.exports = Cart;

//读取用户信息
Cart.getFilter = function (filter) {
    filter.isDeleted = false;
    return Cart.findOne({
        'where': filter
    });
};

Cart.getFilters = function (filter) {
    filter.isDeleted = false;
    return Cart.findAll({
        'where': filter,
        order: [
            ['sequence'],
            ['createdDate'],
            ['_id']
        ]
    });
};

Cart.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return Cart.findAndCountAll({
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