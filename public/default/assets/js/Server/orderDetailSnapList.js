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
            $("#left_btnOrderDetailSnap").addClass("active");

            $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
            $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动
        },
        pageInitEvents: function () {
            var that = this;
            $(".mainModal #InfoSearch #btnSearch").on("click", function (e) {
                that.pageSearch();
            });

            $("#btnAdd").on("click", function (e) {
                isNew = true;
                that.pageDestroy();
                that.pageAddValidation();
                // $('#name').removeAttr("disabled");
                $('#myModal #myModalLabel').text("新增管理员");
                $('#myModal #id').val("");
                $('#myModal #name').val("");
                $('#myModal #sequence').val(0);
                $('#myModal').modal({
                    backdrop: 'static',
                    keyboard: false
                });
            });

            $("#myModal #btnSave").on("click", function (e) {
                var validator = $('#myModal').data('formValidation').validate();
                if (validator.isValid()) {
                    var postURI = "/admin/orderDetailSnap/add",
                        postObj = {
                            name: $.trim($('#myModal #name').val()),
                            sequence: $.trim($('#myModal #sequence').val())
                        };
                    if ($('#id').val()) {
                        postURI = "/admin/orderDetailSnap/edit";
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
                $('#myModal #myModalLabel').text("修改名称");
                $('#myModal #name').val(entity.name);
                $('#myModal #sequence').val(entity.sequence);
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
                    selfAjax("post", "/admin/orderDetailSnap/delete", {
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
            selfAjax("post", "/admin/orderDetailSnapList/search?" + pStr, filter, function (data) {
                if (data && data.records.length > 0) {
                    var d = $(document.createDocumentFragment());
                    data.records.forEach(function (record) {
                        var $tr = $('<tr id=' + record._id + '><td>' + record.name + '</td><td>' +
                            (record.sequence ||0) + '</td><td><div class="btn-group">' + that.pageGetButtons() + '</div></td></tr>');
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