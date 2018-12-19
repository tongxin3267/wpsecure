$(document).ready(function () {
    var pageManager = {
        options: {
            $mainSelectBody: $('.content.mainModal table tbody')
        },
        init: function () {
            this.initStyle();
            this.initEvents();
            this.initData();
        },
        initStyle: function () {
            $("#left_btnOrder").addClass("active");

            $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
            $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动
        },
        initEvents: function () {
            var that = this;
            $(".mainModal #InfoSearch #btnSearch").on("click", function (e) {
                that.search();
            });

            $("#gridBody").on("click", "td .btnSet", function (e) {
                var obj = e.currentTarget;
                var entity = $(obj).parent().data("obj");
                location.href = "/shop/orderDetail/{0}".format(entity._id);
            });
        },
        initData: function () {
            this.search();
        },
        search: function (p) {
            var that = this,
                filter = {
                    name: $(".mainModal #InfoSearch #Name").val()
                },
                pStr = p ? "p=" + p : "";
            this.options.$mainSelectBody.empty();
            selfAjax("post", "/admin/orderList/search?" + pStr, filter, function (data) {
                if (data && data.records.length > 0) {
                    var d = $(document.createDocumentFragment());
                    data.records.forEach(function (record) {
                        var $tr = $('<tr id=' + record._id + '><td>' + record._id + '</td><td>' +
                            moment(record.createdDate).format("YYYY-MM-DD HH:mm") + '</td><td>' + that.getStatus(record.orderStatus) + '</td><td>' + that.getPayStatus(record.payStatus) +
                            '</td><td>' + record.totalPrice + '</td><td><div class="btn-group">' + that.getButtons(record._id) + '</div></td></tr>');
                        $tr.find(".btn-group").data("obj", record);
                        d.append($tr);
                    });
                    that.options.$mainSelectBody.append(d);
                }
                setPaging("#mainModal", data, that.search.bind(that));
            });
        },
        getStatus: function (status) {
            switch (status) {
                case 10:
                    return "已完成";
                case 11:
                    return "已取消";
                case 12:
                    return "已过期";
                case 13:
                    return "已退款";
                default:
                    return "未处理";
            }
        },
        getPayStatus: function (status) {
            switch (status) {
                case 2:
                    return "已支付";
                default:
                    return "未付款";
            }
        },
        getButtons: function (goodId) {
            var strButton = '<a class="btn btn-default btnSet">详情</a>';
            return strButton;
        }
    };

    pageManager.init();
});