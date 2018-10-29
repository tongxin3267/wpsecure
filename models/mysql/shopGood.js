// 模板，可以用于自动生成entity

const db = require('../../db'),
    config = require('../../settings');

// 章节默认为4级，每级4位 最多16位
const ShopGood = db.defineModel('shopGoods', {
    goodId: db.INTEGER,
    goodName: {
        // 商品名称
        type: db.STRING(50),
        defaultValue: ''
    },
    goodCount: {
        // 产品数量，0 表示售完， -1表示无限制
        type: db.INTEGER,
        defaultValue: 0
    },
    sequence: {
        // 商品顺序
        type: db.INTEGER,
        defaultValue: 0
    },
    goodPrice: {
        type: db.DECIMAL(10, 2),
        defaultValue: 0
    },
    shopName: {
        // 分店名称
        type: db.STRING(50),
        defaultValue: ''
    },
    shopId: {
        // 分店Id
        type: db.INTEGER,
        defaultValue: 0
    },
    goodTypeId: {
        type: db.INTEGER,
        defaultValue: 0
    },
    goodTypeName: {
        type: db.STRING(50),
        defaultValue: ''
    },
    isPublish: {
        // 是否上架
        type: db.BOOLEAN,
        defaultValue: 0
    }
});
module.exports = ShopGood;

//读取用户信息
ShopGood.getFilter = function (filter) {
    filter.isDeleted = false;
    return ShopGood.findOne({
        'where': filter
    });
};

ShopGood.getFilters = function (filter) {
    filter.isDeleted = false;
    return ShopGood.findAll({
        'where': filter,
        order: [
            ['sequence'],
            ['createdDate'],
            ['_id']
        ]
    });
};

ShopGood.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return ShopGood.findAndCountAll({
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