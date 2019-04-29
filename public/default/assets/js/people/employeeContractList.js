$(document).ready(function () {
    var pageManager = {
        pageOptions: {
            $mainSelectBody: $('.content.mainModal table tbody'),
        },
        pageInit: function () {
            this.pageInitStyle();
            this.pageInitEvents();
            this.pageInitData();
        },
        pageInitStyle: function () {
            $("#left_btnEmployee").addClass("active");

            $("#myModal #startDate").datepicker({
                changeMonth: true,
                dateFormat: "yy-mm-dd"
            });

            $("#myModal #endDate").datepicker({
                changeMonth: true,
                dateFormat: "yy-mm-dd"
            });
            $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
            $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动
        },
        pageInitEvents: function () {
            var that = this;
            $(".mainModal #InfoSearch #btnSearch").on("click", function (e) {
                that.pageSearch();
            });

            $("#btnAdd").on("click", function (e) {
                // $('#name').removeAttr("disabled");
                $('#myModal #myModalLabel').text("新增");
                $('#myModal #id').val("");
                $("#myModal #sequence").val(parseInt($("#mainModal #total").val()) + 1);
                $("#myModal #startDate").val(moment(new Date()).format("YYYY-MM-DD"));
                $("#myModal #endDate").val(moment(new Date()).format("YYYY-MM-DD"));
                $('#myModal').modal({
                    backdrop: 'static',
                    keyboard: false
                });
            });

            $("#myModal #btnSave").on("click", function (e) {
                var postURI = "/people/employeeContract/add",
                    postObj = {
                        employeeId: $.trim($("#employeeId").val()),
                        sequence: $.trim($("#myModal #sequence").val()),
                        startDate: $.trim($("#myModal #startDate").val()),
                        endDate: $.trim($("#myModal #endDate").val()),
                    };
                if ($('#id').val()) {
                    postURI = "/people/employeeContract/edit";
                    postObj.id = $('#myModal #id').val();
                }
                selfAjax("post", postURI, postObj, function (data) {
                    if (data.error) {
                        showAlert(data.error);
                        return;
                    }
                    location.reload();
                });
            });

            $("#gridBody").on("click", "td .btnEdit", function (e) {
                var obj = e.currentTarget;
                var entity = $(obj).parent().data("obj");
                // $('#name').attr("disabled", "disabled");
                $('#myModal #myModalLabel').text("修改");
                $("#myModal #sequence").val(entity.sequence);
                $("#myModal #startDate").val(moment(entity.startDate).format("YYYY-MM-DD"));
                $("#myModal #endDate").val(moment(entity.endDate).format("YYYY-MM-DD"));
                $('#myModal #id').val(entity._id);
                $('#myModal').modal({
                    backdrop: 'static',
                    keyboard: false
                });
            });

            $("#gridBody").on("click", "td .btnDelete", function (e) {
                showConfirm("确定要删除吗？");
                var obj = e.currentTarget;
                var entity = $(obj).parent().data("obj");
                $("#btnConfirmSave").off("click").on("click", function (e) {
                    selfAjax("post", "/people/employeeContract/delete", {
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
                    employeeId: $("#employeeId").val()
                },
                pStr = p ? "p=" + p : "";
            this.pageOptions.$mainSelectBody.empty();
            selfAjax("post", "/people/employeeContractList/search?" + pStr, filter, function (data) {
                if (data && data.records.length > 0) {
                    var d = $(document.createDocumentFragment());
                    data.records.forEach(function (record) {
                        var $tr = $('<tr id=' + record._id + '><td>' + record.sequence + '</td><td>' +
                            moment(record.startDate).format("YYYY-MM-DD") + '</td><td>' +
                            moment(record.endDate).format("YYYY-MM-DD") + '</td><td><div class="btn-group">' + that.pageGetButtons() + '</div></td></tr>');
                        $tr.find(".btn-group").data("obj", record);
                        d.append($tr);
                    });
                    that.pageOptions.$mainSelectBody.append(d);
                }
                setPaging("#mainModal", data, that.pageSearch.bind(that));
            });
        },
        pageGetButtons: function () {
            var buttons = '<a class="btn btn-default btnEdit">编辑</a><a class="btn btn-default btnDelete">删除</a>';
            return buttons;
        }
    };

    pageManager.pageInit();
});