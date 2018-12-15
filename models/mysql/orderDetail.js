// 模板，可以用于自动生成entity

const db = require('../../db'),
    config = require('../../settings');

// 章节默认为4级，每级4位 最多16位
const OrderDetail = db.defineModel('orderDetails', {
    orderId: {
        type: db.STRING(32)
    },
    orderTypeId: { // 订单type
        type: db.INTEGER,
        defaultValue: 0
    },
    orderTypeName: {
        type: db.STRING(50),
        defaultValue: ''
    },
    shopGoodId: {
        type: db.INTEGER
    },
    goodPrice: {
        type: db.DECIMAL(10, 2),
        defaultValue: 0
    },
    attrDetail: {
        // 规格参数
        type: db.STRING(100),
        defaultValue: ""
    },
    buyCount: {
        type: db.INTEGER,
        defaultValue: 1
    },
    status: {
        type: db.INTEGER,
        defaultValue: 0
    } // 0 排队 1 已取 2 待取 7 过期 9 取消
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
            ['createdDate'],
            ['_id']
        ],
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};