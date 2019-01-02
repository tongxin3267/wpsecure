// shop 这里是单个机器的配置

const db = require('../../db'),
    config = require('../../settings');

// 章节默认为4级，每级4位 最多16位
const Shop = db.defineModel('shops', {
    name: {
        // 分店名称
        type: db.STRING(50)
    },
    password: {
        // 密码，机器需要自动登录
        type: db.STRING(50),
        defaultValue: ''
    },
    address: {
        // 分店地址
        type: db.STRING(200),
        defaultValue: ''
    },
    phone: {
        // 电话
        type: db.STRING(20),
        defaultValue: ''
    },
    openTime: {
        // 营业时间
        type: db.STRING(50),
        defaultValue: ''
    },
    bgImg: {
        // 背景图片
        type: db.STRING(50),
        defaultValue: ''
    },
    bgVideo: {
        // 待机时广告
        type: db.STRING(50),
        defaultValue: ''
    },
    vpathCount: {
        // 竖向轨道数
        type: db.INTEGER,
        defaultValue: 0
    },
    hpathCount: {
        // 横向轨道数
        type: db.INTEGER,
        defaultValue: 0
    }
});
module.exports = Shop;

//读取用户信息
Shop.getFilter = function (filter) {
    filter.isDeleted = false;
    return Shop.findOne({
        'where': filter
    });
};

Shop.getFilters = function (filter) {
    filter.isDeleted = false;
    return Shop.findAll({
        'where': filter,
        order: [
            ['createdDate']
        ]
    });
};

Shop.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return Shop.findAndCountAll({
        'where': filter,
        order: [
            ['createdDate']
        ],
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};