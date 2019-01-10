// 网站配置信息，可以放微信信息等

const db = require('../../db'),
    config = require('../../settings');

// 章节默认为4级，每级4位 最多16位
const SiteInfo = db.defineModel('siteInfos', {
    name: {
        type: db.STRING(50)
    },
    description: {
        type: db.STRING(100),
        defaultValue: ""
    },
    bgImg: {
        type: db.STRING(50),
        defaultValue: ""
    },
    advImg: {
        type: db.STRING(50),
        defaultValue: ""
    },
    advideo: {
        type: db.STRING(50),
        defaultValue: ""
    }
});
module.exports = SiteInfo;

//读取用户信息
SiteInfo.getFilter = function (filter) {
    filter.isDeleted = false;
    return SiteInfo.findOne({
        'where': filter
    });
};

SiteInfo.getFilters = function (filter) {
    filter.isDeleted = false;
    return SiteInfo.findAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ]
    });
};

SiteInfo.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return SiteInfo.findAndCountAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ],
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};