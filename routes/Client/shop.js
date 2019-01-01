var model = require("../../model.js"),
    pageSize = model.db.config.pageSize,
    Shop = model.shop,
    ShopGood = model.shopGood,
    GoodType = model.goodType,
    Order = model.order,
    OrderSeq = model.orderSeq,
    OrderDetail = model.orderDetail,
    Good = model.good,
    GoodAttribute = model.goodAttribute,
    GoodAttrVal = model.goodAttrVal,
    ShopGoodAttrVal = model.shopGoodAttrVal,
    Ws_user = model.ws_user,
    WechatHelper = require('../../util/wechatHelper'),
    crypto = require('crypto'),
    auth = require("./auth"),
    checkLogin = auth.checkLogin;

module.exports = function (app) {
    
}