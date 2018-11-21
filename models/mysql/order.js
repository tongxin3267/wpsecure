// 模板，可以用于自动生成entity

const db = require('../../db'),
    config = require('../../settings');

// 章节默认为4级，每级4位 最多16位
const Order = db.defineModel('orders', {
    userId: {
        type: db.INTEGER
    },
    shopId: {
        type: db.INTEGER
    },
    totalPrice: {
        type: db.DECIMAL(10, 2),
        defaultValue: 0
    },
    orderStatus: {
        type: db.INTEGER,
        defaultValue: 0,
        comment: "订单状态 0，未确认；1，已确认；2，已取消；3，无效；4，退货；"
    },
    payStatus: {
        type: db.INTEGER,
        defaultValue: 0,
        comment: "支付状态；0，未付款；1，付款中；2，已付款"
    },
    _id: {
        type: db.STRING(32),
        primaryKey: true,
        comment: "主键，自增"
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

Order.getFilters = function (filter, orders) {
    filter.isDeleted = false;
    return Order.findAll({
        'where': filter,
        order: (orders || [
            ['createdDate'],
            ['_id']
        ])
    });
};

Order.getFiltersWithPage = function (page, filter, orders) {
    filter.isDeleted = false;
    return Order.findAndCountAll({
        'where': filter,
        order: (orders || [
            ['createdDate'],
            ['_id']
        ]),
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};