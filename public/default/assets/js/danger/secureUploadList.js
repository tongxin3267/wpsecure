$(document).ready(function () {
    var pageManager = {
        pageOptions: {
            $mainSelectBody: $('.content.mainModal table tbody')
        },
        pageInit: function () {
            this.pageInitStyle();
            this.pageInitEvents();
            this.pageInitData();
        },
        pageInitStyle: function () {
            $("#left_btnSecure").addClass("active");

            $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
            $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动
        },
        pageInitEvents: function () {
            var that = this;
            $(".mainModal #InfoSearch #btnSearch").on("click", function (e) {
                that.pageSearch();
            });

            $(".toolbar #btnExport").on("click", function (e) {
                showConfirm("确定要导出吗？");
                $("#btnConfirmSave").off("click").on("click", function (e) {
                    selfAjax("post", "/danger/exportWithimage", {
                        secureStatus: $("#secureStatus").val()
                    }, function (data) {
                        if (data.error) {
                            showAlert(data.error);
                            return;
                        }
                        showAlert("sucess");
                    });
                });
            });

            $("#gridBody").on("click", "td .btnDelete", function (e) {
                showConfirm("确定要删除吗？");
                var obj = e.currentTarget;
                var entity = $(obj).parent().data("obj");
                $("#btnConfirmSave").off("click").on("click", function (e) {
                    selfAjax("post", "/danger/secureUpload/delete", {
                        id: entity._id
                    }, function (data) {
                        if (data.error) {
                            showAlert(data.error);
                            return;
                        }
                        location.reload();
                    });
                });
            });
        },
        pageInitData: function () {
            this.pageSearch();
        },
        pageSearch: function (p) {
            var that = this,
                filter = {
                    secureStatus: $(".mainModal #InfoSearch #secureStatus").val()
                },
                pStr = p ? "p=" + p : "";
            this.pageOptions.$mainSelectBody.empty();
            selfAjax("post", "/danger/secureUploadList/search?" + pStr, filter, function (data) {
                if (data && data.records.length > 0) {
                    var d = $(document.createDocumentFragment());
                    data.records.forEach(function (record) {
                        var $tr = $('<tr id=' + record._id + '><td>' + record.createdName + '</td><td>' +
                            moment(record.createdDate).format("YYYY-MM-DD HH:mm:ss") + '</td><td>' +
                            record.position + '</td><td>' +
                            record.responsorName + '</td><td>' +
                            moment(record.doneDate).format("YYYY-MM-DD HH:mm:ss") + '</td><td><div class="btn-group">' + that.pageGetButtons() + '</div></td></tr>');
                        $tr.find(".btn-group").data("obj", record);
                        d.append($tr);
                    });
                    that.pageOptions.$mainSelectBody.append(d);
                }
                setPaging("#mainModal", data, that.pageSearch.bind(that));
            });
        },
        pageGetButtons: function () {
            var buttons = '<a class="btn btn-default btnDelete">删除</a>';
            return buttons;
        }
    };

    pageManager.pageInit();
});