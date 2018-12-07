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
            });

            $("#btnExit").click(function (e) {
                location.href = "/wechatAdmin/logout";
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
            selfAjax("post", "/wechatAdmin/orderList/search", null, function (data) {
                if (data && data.length > 0) {
                    var d = $(document.createDocumentFragment());
                    data.forEach(function (record) {
                        d.append('<a class="weui-btn weui-btn_primary" id=' + record._id + ' href="javascript:">' + record.name + '</a>');
                    });
                    that.options.$orders.append(d);
                }
            });
        }
    };

    pageManager.init();
});