// 模板，可以用于自动生成entity

const db = require('../../db'),
    config = require('../../settings');

// 章节默认为4级，每级4位 最多16位
const OrderDetail = db.defineModel('orderDetails', {
    orderId: {
        type: db.INTEGER
    },
    shopGoodId: {
        type: db.INTEGER
    },
    goodPrice: {
        type: db.DECIMAL(10, 2),
        defaultValue: 0
    },
    buyCount: {
        type: db.INTEGER,
        defaultValue: 1
    },
    status: {
        type: db.INTEGER,
        defaultValue: 0
    } // 0 排队 1 待取
});
module.exports = OrderDetail;

//读取用户信息
OrderDetail.getFilter = function (filter) {
    filter.isDeleted = false;
    return OrderDetail.findOne({
        'where': filter
    });
};

OrderDetail.getFilters = function (filter) {
    filter.isDeleted = false;
    return OrderDetail.findAll({
        'where': filter,
        order: [
            ['sequence'],
            ['createdDate'],
            ['_id']
        ]
    });
};

OrderDetail.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return OrderDetail.findAndCountAll({
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