// 校区和年级对应关系

const db = require('../../db'),
    config = require('../../settings');

const ScoreFail = db.defineModel('scoreFails', {
    name: {
        type: db.STRING(50),
        defaultValue: ''
    },
    mobile: {
        type: db.STRING(50),
        defaultValue: ''
    },
    score: {
        type: db.STRING(50),
        defaultValue: ''
    },
    examId: {
        type: db.STRING(50),
        defaultValue: ''
    },
    subject: {
        type: db.STRING(50),
        defaultValue: ''
    }
});
module.exports = ScoreFail;

ScoreFail.getFilter = function (filter) {
    filter.isDeleted = false;
    return ScoreFail.findOne({
        'where': filter
    });
};

ScoreFail.getFilters = function (filter) {
    filter.isDeleted = false;
    return ScoreFail.findAll({
        'where': filter
    });
};

ScoreFail.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return ScoreFail.findAndCountAll({
        'where': filter,
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};