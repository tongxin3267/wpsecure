// 模板，可以用于自动生成entity

const db = require('../../db'),
    config = require('../../settings');

// 章节默认为4级，每级4位 最多16位
const Order = db.defineModel('orders', {
    userId: {
        type: db.INTEGER
    },
    totalPrice: {
        type: db.DECIMAL(10, 2),
        defaultValue: 0
    }
});
module.exports = Order;

//读取用户信息
Order.getFilter = function (filter) {
    filter.isDeleted = false;
    return Order.findOne({
        'where': filter
    });
};

Order.getFilters = function (filter) {
    filter.isDeleted = false;
    return Order.findAll({
        'where': filter,
        order: [
            ['sequence'],
            ['createdDate'],
            ['_id']
        ]
    });
};

Order.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return Order.findAndCountAll({
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