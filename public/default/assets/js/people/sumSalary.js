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
            $("#left_btnSumSalary").addClass("active");

            $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
            $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动
        },
        pageInitEvents: function () {
            var that = this;
            $(".mainModal #InfoSearch #btnSearch").on("click", function (e) {
                that.pageSearch();
            });

            $("#btnAdd").on("click", function (e) {
                location.href = "/people/batchuploadSalary";
            });

            $("#gridBody").on("click", "td .btnDelete", function (e) {
                showConfirm("确定要删除吗？");
                var obj = e.currentTarget;
                var entity = $(obj).parent().data("obj");
                $("#btnConfirmSave").off("click").on("click", function (e) {
                    selfAjax("post", "/people/salary/delete", {
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
            var curDate = new Date(),
                curYear = curDate.getFullYear(),
                curMonth = curDate.getMonth();
            for (var i = -2; i < 2; i++) {
                var tmpYear = curYear + i,
                    strSelect = "";
                if (i == 0) {
                    strSelect = "selected";
                }
                $("#year").append('<option value="' + tmpYear + '" ' + strSelect + '>' + tmpYear + '</option>');
            }
            for (var i = 0; i < 12; i++) {
                var strSelect = "",
                    j = i + 1;
                if (i == curMonth) {
                    strSelect = "selected";
                }
                $("#month").append('<option value="' + j + '" ' + strSelect + '>' + j + '</option>');
                $("#endmonth").append('<option value="' + j + '" ' + strSelect + '>' + j + '</option>');
            }
            this.pageSearch();
        },
        pageSearch: function () {
            var that = this,
                filter = {
                    name: $(".mainModal #InfoSearch #Name").val(),
                    year: $(".mainModal #InfoSearch #year").val(),
                    month: $(".mainModal #InfoSearch #month").val(),
                    endmonth: $(".mainModal #InfoSearch #endmonth").val()
                };
            this.pageOptions.$mainSelectBody.empty();
            selfAjax("post", "/people/salaryList/sumSalary", filter, function (data) {
                if (data && data.length > 0) {
                    var d = $(document.createDocumentFragment()),
                        dHeader = $(document.createDocumentFragment()),
                        headerShow = false;
                    data.forEach(function (record) {
                        var $tr = $('<tr></tr>');
                        if (!headerShow) {
                            // remove headers and add new header
                            $(".table thead tr").empty();
                            for (var key in record) {
                                if (key == 1) {
                                    continue;
                                }
                                dHeader.append('<th>' + key + '</th>');
                                $tr.append('<td>' + record[key] + '</td>');
                            }
                            $(".table thead tr").append(dHeader);
                            headerShow = true;
                        } else {
                            for (var key in record) {
                                if (key == 1) {
                                    continue;
                                }
                                $tr.append('<td>' + record[key] + '</td>');
                            }
                        }
                        d.append($tr);
                    });
                    that.pageOptions.$mainSelectBody.append(d);
                }
            });
        },
        pageGetButtons: function () {
            var buttons = '<a class="btn btn-default btnDelete">删除</a>';
            return buttons;
        },
        pageDestroy: function () {
            var validator = $('#myModal').data('formValidation');
            if (validator) {
                validator.destroy();
            }
        },
        pageAddValidation: function (callback) {
            setTimeout(function () {
                $('#myModal').formValidation({
                    // List of fields and their validation rules
                    fields: {
                        'name': {
                            trigger: "blur change",
                            validators: {
                                notEmpty: {
                                    message: '名称不能为空'
                                },
                                stringLength: {
                                    min: 1,
                                    max: 30,
                                    message: '名称在1-30个字符之间'
                                }
                            }
                        }
                    }
                });
            }, 0);
        }
    };

    pageManager.pageInit();
});