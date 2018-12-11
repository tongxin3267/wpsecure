$(document).ready(function () {
    var pageManager = {
        options: {
            $mainSelectBody: $('.orderType .weui-btn-area.list'),
            orderType: null,
            $orders: $('.weui-cells.orders')
        },
        init: function () {
            this.initEvents();
            this.initData();
        },
        initEvents: function () {
            var that = this;
            $('.js_category.menu img').click(function (e) {
                $('.orderType').show();
            });

            $('#btnRefresh').click(function (e) {
                that.search();
            });

            $('.orderType .weui-btn-area').on("click", "a.weui-btn", function (e) {
                var $ob = $(e.currentTarget);
                that.options.orderType = $ob.attr("id");
                $('.orderType').hide();
                that.search();
            });

            $("#btnExit").click(function (e) {
                location.href = "/wechatAdmin/logout";
            });

            $('.weui-cells.orders').on("click", ".weui-form-preview .weui-form-preview__ft .weui-form-preview__btn_primary", function (e) {
                var $ob = $(e.currentTarget),
                    id = $ob.parents(".weui-form-preview").data("obj");
                selfAjax("post", "/wechatAdmin/finishOrder", {
                    orderId: id,
                    orderTypeId: that.options.orderType
                }, function (data) {
                    if (data.error) {
                        showAlert("出错了！");
                        return;
                    }
                    that.search();
                });

            });
        },
        initData: function () {
            var that = this;
            selfAjax("post", "/wechatAdmin/getOrderTypes", null, function (data) {
                if (data && data.length > 0) {
                    var d = $(document.createDocumentFragment());
                    data.forEach(function (record) {
                        d.append('<a class="weui-btn weui-btn_primary" id=' + record._id + ' href="javascript:">' + record.name + '</a>');
                    });
                    that.options.$mainSelectBody.append(d);
                }
            });
        },
        search: function () {
            var that = this;
            that.options.$orders.empty();
            selfAjax("post", "/wechatAdmin/orderList/search", {
                orderTypeId: that.options.orderType
            }, function (data) {
                if (data && data.records.length > 0) {
                    var d = $(document.createDocumentFragment());
                    data.records.forEach(function (record) {
                        var $ord = $(that.renderOrder(record));
                        d.append($ord);
                        $ord.data("obj", record._id);
                    });
                    that.options.$orders.append(d);
                }
            });
        },
        renderOrder: function (record) {
            var strDetail = "";
            if (record.details) {
                record.details.forEach(function (detail) {
                    var strCount = detail.attrDetail;
                    if (strCount) {
                        strCount += "<br/>X" + detail.buyCount;
                    } else {
                        strCount = "X" + detail.buyCount;
                    }
                    strDetail += '<div class="weui-form-preview__item">\
                                    <label class="weui-form-preview__label">' + detail.name + '</label>\
                                    <span class="weui-form-preview__value">' + strCount + '</span>\
                                </div>';
                });
            }
            return '<div class="weui-form-preview">\
                        <div class="weui-form-preview__bd">\
                            <div class="weui-form-preview__item">\
                                <label class="weui-form-preview__label">订单号</label>\
                                <span class="weui-form-preview__value">' + record._id + '</span>\
                            </div>\
                            <div class="weui-form-preview__item">\
                                <label class="weui-form-preview__label">订单时间</label>\
                                <span class="weui-form-preview__value">' + moment(record.updatedDate).format('YYYY-MM-DD HH:mm:ss') + '</span>\
                            </div>' +
                strDetail +
                '<div class="weui-form-preview__item">\
                                <label class="weui-form-preview__label">总金额</label>\
                                <span class="weui-form-preview__value">￥' + record.totalPrice + '</span>\
                            </div>\
                        </div>\
                        <div class="weui-form-preview__ft">\
                            <a class="weui-form-preview__btn weui-form-preview__btn_primary" href="javascript:">完成</a>\
                        </div>\
                    </div>';
        }
    };

    pageManager.init();
});