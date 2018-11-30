// 模板，可以用于自动生成entity

const db = require('../../db'),
    config = require('../../settings');

const ShopGoodAttrVal = db.defineModel('shopGoodAttrVals', {
    goodId: db.INTEGER,
    shopId: {
        // 分店Id
        type: db.INTEGER,
        defaultValue: 0
    },
    goodAttrValId: {
        type: db.INTEGER
    },
    price: {
        type: db.DECIMAL(10, 2),
        defaultValue: 0
    }
});
module.exports = ShopGoodAttrVal;

//读取用户信息
ShopGoodAttrVal.getFilter = function (filter) {
    filter.isDeleted = false;
    return ShopGoodAttrVal.findOne({
        'where': filter
    });
};

ShopGoodAttrVal.getFilters = function (filter) {
    filter.isDeleted = false;
    return ShopGoodAttrVal.findAll({
        'where': filter,
        order: [
            ['sequence'],
            ['createdDate'],
            ['_id']
        ]
    });
};

ShopGoodAttrVal.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return ShopGoodAttrVal.findAndCountAll({
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