$(document).ready(function () {
    var pageManager = {
        options: {},
        init: function () {
            this.initStyle();
            this.initEvents();
            this.initData();
        },
        initStyle: function () {
            $("#left_btnManage").addClass("active");

            $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
            $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动
        },
        initEvents: function () {
            var that = this;
            $(".mainModal #btnExpire").on("click", function (e) {
                showConfirm("确定要过期所有订单吗？");
                $("#btnConfirmSave").off("click").on("click", function (e) {
                    selfAjax("post", "/shop/expier", null, function (data) {
                        if (data.error) {
                            showAlert("出错了！");
                            return
                        }
                        showAlert("当前店铺订单过期成功！");
                    });
                });
            });
        },
        initData: function () {

        }
    };

    pageManager.init();
});