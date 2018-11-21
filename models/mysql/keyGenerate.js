// 模板，可以用于自动生成entity

const db = require('../../db'),
    config = require('../../settings');

// 章节默认为4级，每级4位 最多16位
const KeyGenerate = db.defineModel('keyGenerates', {});
module.exports = KeyGenerate;

//读取用户信息
KeyGenerate.getFilter = function (filter) {
    filter.isDeleted = false;
    return KeyGenerate.findOne({
        'where': filter
    });
};

KeyGenerate.getFilters = function (filter) {
    filter.isDeleted = false;
    return KeyGenerate.findAll({
        'where': filter,
        order: [
            ['sequence'],
            ['createdDate'],
            ['_id']
        ]
    });
};

KeyGenerate.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return KeyGenerate.findAndCountAll({
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