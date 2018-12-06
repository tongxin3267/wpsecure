// 准备去掉这个表，似乎利用率比较低 //TBD

const db = require('../../db'),
    config = require('../../settings');

// 章节默认为4级，每级4位 最多16位
const OrderSep = db.defineModel('orderSeps', {
    orderId: {
        type: db.STRING(32)
    },
    orderTypeId: {
        type: db.INTEGER,
        defaultValue: 0
    },
    orderTypeName: {
        type: db.STRING(50),
        defaultValue: ''
    },
    sepStatus: {
        type: db.INTEGER,
        defaultValue: 0,
        comment: "订单状态 0，未确认；5:待取 10，已完成；11，已取消；12，无效；13，退货；"
    },
});
module.exports = OrderSep;

//读取用户信息
OrderSep.getFilter = function (filter) {
    filter.isDeleted = false;
    return OrderSep.findOne({
        'where': filter
    });
};

OrderSep.getFilters = function (filter) {
    filter.isDeleted = false;
    return OrderSep.findAll({
        'where': filter,
        order: [
            ['sequence'],
            ['createdDate'],
            ['_id']
        ]
    });
};

OrderSep.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return OrderSep.findAndCountAll({
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