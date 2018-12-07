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
            $("#left_btnAdmin").addClass("active");

            $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
            $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动
        },
        initEvents: function () {
            var that = this;
            $(".mainModal #InfoSearch #btnSearch").on("click", function (e) {
                that.search();
            });

            $("#btnAdd").on("click", function (e) {
                isNew = true;
                that.destroy();
                that.addValidation();
                // $('#name').removeAttr("disabled");
                $('#myModal #myModalLabel').text("新增管理员");
                $('#myModal #id').val("");
                $('#myModal #name').val("");
                $('#myModal #password').val("");
                $('#myModal #role').val(0);
                $('#myModal').modal({
                    backdrop: 'static',
                    keyboard: false
                });
            });

            $("#myModal #btnSave").on("click", function (e) {
                var validator = $('#myModal').data('formValidation').validate();
                if (validator.isValid()) {
                    var postURI = "/admin/admin/add",
                        postObj = {
                            name: $.trim($('#myModal #name').val()),
                            password: $.trim($('#myModal #password').val()),
                            role: $("#myModal #role").val()
                        };
                    if ($('#id').val()) {
                        postURI = "/admin/admin/edit";
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
                that.destroy();
                that.addValidation();
                var obj = e.currentTarget;
                var entity = $(obj).parent().data("obj");
                // $('#name').attr("disabled", "disabled");
                $('#myModal #myModalLabel').text("修改名称");
                $('#myModal #name').val(entity.name);
                $('#myModal #password').val("");
                $('#myModal #role').val(entity.role);
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
                    selfAjax("post", "/admin/admin/delete", {
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
            selfAjax("post", "/admin/adminList/search?" + pStr, filter, function (data) {
                if (data && data.records.length > 0) {
                    var d = $(document.createDocumentFragment());
                    data.records.forEach(function (record) {
                        var $tr = $('<tr id=' + record._id + '><td>' + record.name + '</td><td>' +
                            (record.shopName || '') + '</td><td>' + that.getRole(record.role) + '</td><td><div class="btn-group">' + that.getButtons(record.role) + '</div></td></tr>');
                        $tr.find(".btn-group").data("obj", record);
                        d.append($tr);
                    });
                    that.options.$mainSelectBody.append(d);
                }
                setPaging("#mainModal", data, that.search.bind(that));
            });
        },
        getRole(role) {
            switch (role) {
                case 0:
                    return "核单员";
                case 100:
                    return "系统管理员";
                default:
                    return "";
            }
        },
        getButtons: function (role) {
            if (role == 100) {
                return "";
            }
            var buttons = '<a class="btn btn-default btnEdit">编辑</a><a class="btn btn-default btnDelete">删除</a>';
            return buttons;
        },
        destroy: function () {
            var validator = $('#myModal').data('formValidation');
            if (validator) {
                validator.destroy();
            }
        },
        addValidation: function (callback) {
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

    pageManager.init();
});