const Sequelize = require('sequelize');

const uuid = require('uuid');

const config = require('./settings');

console.log('init sequelize...');

function generateId() {
    var strArr = uuid.v1().split("-");
    return `${strArr[4]}${strArr[3]}${strArr[2]}${strArr[1]}${strArr[0]}`;
}

var sequelize = new Sequelize(config.db, config.username, config.password, {
    host: config.host,
    dialect: 'mysql',
    dialectOptions: {
        charset: 'utf8mb4'
    },
    pool: {
        max: 10,
        min: 0,
        idle: 30000,
        acquire: 30000
    }
});

const ID_TYPE = Sequelize.STRING(50);

function defineModel(name, attributes) {
    var attrs = {};
    for (let key in attributes) {
        let value = attributes[key];
        if (typeof value === 'object' && value['type']) {
            value.allowNull = value.allowNull || false;
            attrs[key] = value;
        } else {
            attrs[key] = {
                type: value,
                allowNull: false
            };
        }
    }
    attrs._id = {
        type: ID_TYPE,
        primaryKey: true
    };
    attrs.createdBy = {
        type: Sequelize.STRING(50),
        defaultValue: ''
    };
    attrs.createdDate = {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
    };
    attrs.updatedDate = {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
    };
    attrs.isDeleted = {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    };
    attrs.deletedBy = {
        type: Sequelize.STRING(50),
        defaultValue: ''
    };
    attrs.deletedDate = {
        type: Sequelize.DATE,
        allowNull: true
    };
    attrs.version = {
        type: Sequelize.BIGINT,
        defaultValue: 0,
        allowNull: false
    };

    return sequelize.define(name, attrs, {
        tableName: name,
        timestamps: false,
        hooks: {
            beforeValidate: function (obj) {
                let now = Date.now();
                if (obj.isNewRecord) {
                    console.log('will create entity...' + obj);
                    if (!obj._id) {
                        obj._id = generateId();
                    }
                } else {
                    console.log('will update entity...');
                    obj.updatedDate = now;
                    obj.version++;
                }
            }
        },
        charset: 'utf8mb4'
    });
}

const TYPES = ['STRING', 'INTEGER', 'BIGINT', 'TEXT', 'DECIMAL', 'DOUBLE', 'DATE', 'DATEONLY', 'BOOLEAN', 'NOW', 'DATEONLY'];

var exp = {
    defineModel: defineModel,
    sync: () => {
        // only allow create ddl in non-production environment:
        if (process.env.NODE_ENV !== 'production') {
            return sequelize.sync({
                force: true
            });
        } else {
            throw new Error('Cannot sync() when NODE_ENV is set to \'production\'.');
        }
    }
};

for (let type of TYPES) {
    exp[type] = Sequelize[type];
}

exp.ID = ID_TYPE;
exp.generateId = generateId;
exp.config = config;
exp.sequelize = sequelize;

module.exports = exp;