// 模板，可以用于自动生成entity

const db = require('../../db'),
    config = require('../../settings');

// 章节默认为4级，每级4位 最多16位
const Ws_user = db.defineModel('ws_users', {
    wxId: {
        type: db.STRING(50)
    }
});
module.exports = Ws_user;

//读取用户信息
Ws_user.getFilter = function (filter) {
    filter.isDeleted = false;
    return Ws_user.findOne({
        'where': filter
    });
};

Ws_user.getFilters = function (filter) {
    filter.isDeleted = false;
    return Ws_user.findAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ]
    });
};

Ws_user.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return Ws_user.findAndCountAll({
        'where': filter,
        order: [
            ['createdDate'],
            ['_id']
        ],
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};