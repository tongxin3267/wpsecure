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
            $("#left_btnSalaryItem").addClass("active");

            $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
            $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动
        },
        pageInitEvents: function () {
            var that = this;
            $(".mainModal #InfoSearch #btnSearch").on("click", function (e) {
                that.pageSearch();
            });

            $("#btnAdd").on("click", function (e) {
                that.pageDestroy();
                that.pageAddValidation();
                // $('#name').removeAttr("disabled");
                $('#myModal #myModalLabel').text("新增工资项");
                $('#myModal #id').val("");
                $("#myModal #name").val("");
                $("#myModal #fieldName").val("");
                $("#myModal #operateType").val("统计");
                $('#myModal').modal({
                    backdrop: 'static',
                    keyboard: false
                });
            });

            $("#myModal #btnSave").on("click", function (e) {
                var validator = $('#myModal').data('formValidation').validate();
                if (validator.isValid()) {
                    var postURI = "/people/salaryItem/add",
                        postObj = {
                            name: $.trim($("#myModal #name").val()),
                            operateType: $.trim($("#myModal #operateType").val()),
                        };
                    if ($('#id').val()) {
                        postURI = "/people/salaryItem/edit";
                        postObj.id = $('#myModal #id').val();
                    }
                    selfAjax("post", postURI, postObj, function (data) {
                        if (data.error) {
                            showAlert(data.error);
                            return;
                        }
                        location.reload();
                    });
                }
            });

            $("#gridBody").on("click", "td .btnEdit", function (e) {
                that.pageDestroy();
                that.pageAddValidation();
                var obj = e.currentTarget;
                var entity = $(obj).parent().data("obj");
                // $('#name').attr("disabled", "disabled");
                $('#myModal #myModalLabel').text("修改工资项");
                $("#myModal #name").val(entity.name);
                $("#myModal #fieldName").val(entity.fieldName);
                $("#myModal #operateType").val(entity.operateType);
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
                    selfAjax("post", "/people/salaryItem/delete", {
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
                    name: $(".mainModal #InfoSearch #Name").val()
                },
                pStr = p ? "p=" + p : "";
            this.pageOptions.$mainSelectBody.empty();
            selfAjax("post", "/people/salaryItemList/search?" + pStr, filter, function (data) {
                if (data && data.records.length > 0) {
                    var d = $(document.createDocumentFragment());
                    data.records.forEach(function (record) {
                        var $tr = $('<tr id=' + record._id + '><td>' + record.name + '</td><td>' +
                            record.fieldName + '</td><td>' + record.operateType + '</td><td><div class="btn-group">' + that.pageGetButtons() + '</div></td></tr>');
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