// 模板，可以用于自动生成entity

const db = require('../../db'),
    config = require('../../settings');

// 章节默认为4级，每级4位 最多16位
const OrderDetailSnap = db.defineModel('orderDetailSnaps', {
    orderDetailId: {
        type: db.INTEGER
    },
    img: {
        type: db.STRING(50),
        defaultValue: ""
    }
});
module.exports = OrderDetailSnap;

//读取用户信息
OrderDetailSnap.getFilter = function (filter) {
    filter.isDeleted = false;
    return OrderDetailSnap.findOne({
        'where': filter
    });
};

OrderDetailSnap.getFilters = function (filter) {
    filter.isDeleted = false;
    return OrderDetailSnap.findAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ]
    });
};

OrderDetailSnap.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return OrderDetailSnap.findAndCountAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ],
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};