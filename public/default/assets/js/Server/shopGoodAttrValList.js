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
            $("#left_btnGood").addClass("active");

            $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
            $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动
        },
        initEvents: function () {
            var that = this;
            $(".mainModal #InfoSearch #btnSearch").on("click", function (e) {
                that.search();
            });

            $("#btnSave").on("click", function (e) {
                var validator = $('#myModal').data('formValidation').validate();
                if (validator.isValid()) {
                    var postURI = "/admin/shopGoodAttrVal/edit",
                        postObj = {
                            price: $.trim($('#myModal #goodPrice').val()),
                            goodId: $('#goodId').val(),
                            attrId: $('#attrId').val(),
                            shopId: $('#shopId').val(),
                            valId: $('#myModal #valId').val()
                        };
                    if ($('#id').val()) {
                        postObj.id = $('#id').val();
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
                $('#myModal #id').val(entity._id);
                $('#myModal #valId').val(entity.valId);
                $('#myModal #goodPrice').val(entity.price);
                $('#myModal').modal({
                    backdrop: 'static',
                    keyboard: false
                });
            });

            $("#gridBody").on("click", "td .btnDelete", function (e) {
                showConfirm("确定要重置吗？");
                var obj = e.currentTarget;
                var entity = $(obj).parent().data("obj");
                $("#btnConfirmSave").off("click").on("click", function (e) {
                    selfAjax("post", "/admin/shopGoodAttrVal/delete", {
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
                    name: $(".mainModal #InfoSearch #Name").val(),
                    goodId: $('#goodId').val(),
                    attrId: $('#attrId').val(),
                    shopId: $('#shopId').val()
                },
                pStr = p ? "p=" + p : "";
            this.options.$mainSelectBody.empty();
            selfAjax("post", "/admin/shopGoodAttrValList/search?" + pStr, filter, function (data) {
                if (data && data.records.length > 0) {
                    var d = $(document.createDocumentFragment());
                    data.records.forEach(function (record) {
                        var $tr = $('<tr id=' + record._id + '><td>' + record.name + '</td><td>' +
                            record.sequence + '</td><td>' +
                            record.price + '</td><td>' +
                            (record.newPrice || '') + '</td><td><div class="btn-group">' + that.getButtons() + '</div></td></tr>');
                        $tr.find(".btn-group").data("obj", record);
                        d.append($tr);
                    });
                    that.options.$mainSelectBody.append(d);
                }
            });
        },
        getButtons: function () {
            var buttons = '<a class="btn btn-default btnEdit">编辑</a><a class="btn btn-default btnDelete">重置</a>';
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
                                    min: 2,
                                    max: 30,
                                    message: '名称在2-30个字符之间'
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