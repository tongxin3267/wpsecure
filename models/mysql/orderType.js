// 模板，可以用于自动生成entity

const db = require('../../db'),
    config = require('../../settings');

// 订单类别，用于自动分单
const OrderType = db.defineModel('orderTypes', {
    name: {
        type: db.STRING(50)
    },
    sequence: {
        type: db.INTEGER,
        defaultValue: 0
    }
});
module.exports = OrderType;

//读取用户信息
OrderType.getFilter = function (filter) {
    filter.isDeleted = false;
    return OrderType.findOne({
        'where': filter
    });
};

OrderType.getFilters = function (filter) {
    filter.isDeleted = false;
    return OrderType.findAll({
        'where': filter,
        order: [
            ['sequence'],
            ['createdDate'],
            ['_id']
        ]
    });
};

OrderType.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return OrderType.findAndCountAll({
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