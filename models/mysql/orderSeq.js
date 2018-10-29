// 暂时不用

const db = require('../../db'),
    config = require('../../settings');

const OrderSeq = db.defineModel('orderSeqs', {
    orderDetailId: {
        type: db.INTEGER,
    },
    status: {
        type: db.INTEGER,
        defaultValue: 0
    } // 0 排队 1 待取
});
module.exports = OrderSeq;

//读取用户信息
OrderSeq.getFilter = function (filter) {
    filter.isDeleted = false;
    return OrderSeq.findOne({
        'where': filter
    });
};

OrderSeq.getFilters = function (filter) {
    filter.isDeleted = false;
    return OrderSeq.findAll({
        'where': filter,
        order: [
            ['sequence'],
            ['createdDate'],
            ['_id']
        ]
    });
};

OrderSeq.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return OrderSeq.findAndCountAll({
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