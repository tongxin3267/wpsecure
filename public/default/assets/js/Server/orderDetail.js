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
            $("#left_btnOrderSep").addClass("active");

            $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
            $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动
        },
        initEvents: function () {
            var that = this;
            $(".mainModal .toolbar #btnPrint").on("click", function (e) {
                // to print

            });
        },
        initData: function () {
            this.search();
        },
        search: function (p) {
            var that = this,
                filter = {
                    orderId: $("#orderId").val()
                };
            this.options.$mainSelectBody.empty();
            selfAjax("post", "/shop/orderDetail/orderAndDetails", filter, function (data) {
                if (data) {
                    if (data.order) {
                        $(".content.mainModal .orderId").text(data.order._id);
                        $(".content.mainModal .orderDate").text(moment(data.order.updatedDate).format("YYYY-MM-DD HH:mm"));
                        $(".content.mainModal .total").text(data.order.totalPrice);
                    }
                    if (data.details.length > 0) {
                        var d = $(document.createDocumentFragment());
                        data.details.forEach(function (record) {
                            var name = record.name;
                            if (record.attrDetail) {
                                name += "<br/>" + record.attrDetail
                            }
                            var $tr = $('<tr id=' + record._id + '><td>' + name + '</td><td>' +
                                record.buyCount + '</td><td>' + record.goodPrice + '</td><td></td></tr>');
                            $tr.find(".btn-group").data("obj", record);
                            d.append($tr);
                        });
                        that.options.$mainSelectBody.append(d);
                    }
                }
            });
        },
        getButtons: function () {
            var buttons = '';
            return buttons;
        }
    };

    pageManager.init();
});