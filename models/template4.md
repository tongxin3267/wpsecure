// 模板，可以用于自动生成entity

const db = require('../../db'),
    config = require('../../settings');

// 章节默认为4级，每级4位 最多16位
const #Name# = db.defineModel('#name#s', {
    name: {
        type: db.STRING(50)
    },
    description: {
        type: db.STRING(100),
        defaultValue: ""
    }, // 描述信息，用于seo
    sequence: {
        type: db.INTEGER,
        defaultValue: 0
    },
    isArticle: { // 0 是分类，1 是目录
        type: db.BOOLEAN,
        defaultValue: true
    },
    parentId: {
        type: db.STRING(50),
        defaultValue: ''
    }
});
module.exports = #Name#;

//读取用户信息
#Name#.getFilter = function (filter) {
    filter.isDeleted = false;
    return #Name#.findOne({
        'where': filter
    });
};

#Name#.getFilters = function (filter) {
    filter.isDeleted = false;
    return #Name#.findAll({
        'where': filter,
        order: [
            ['sequence'],
            ['createdDate'],
            ['_id']
        ]
    });
};

#Name#.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return #Name#.findAndCountAll({
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