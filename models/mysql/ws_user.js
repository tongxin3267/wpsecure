// 模板，可以用于自动生成entity

const db = require('../../db'),
    config = require('../../settings');

// 章节默认为4级，每级4位 最多16位
const Ws_user = db.defineModel('ws_users', {
    wxId: {
        type: db.STRING(50),
        COMMENT: '用户openid'
    },
    uname: {
        type: db.STRING(40),
        defaultValue: '',
        COMMENT: '用户名'
    },
    ugender: {
        type: db.BOOLEAN,
        defaultValue: false
    },
    uavatar: {
        type: db.STRING(256),
        defaultValue: '',
        COMMENT: '用户头像'
    },
    skey: {
        type: db.STRING(128),
        defaultValue: '',
        COMMENT: '用户登录态标识'
    },
    sessionkey: {
        type: db.STRING(128),
        defaultValue: '',
        COMMENT: '微信登录态标识'
    },
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