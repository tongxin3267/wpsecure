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
            $("#left_btnShop").addClass("active");

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
                $('#myModal #myModalLabel').text("新增机器");
                $('#myModal #id').val("");
                $('#myModal #name').val("");
                $('#myModal #address').val("");
                $('#myModal #hpathCount').val("");
                $('#myModal #vpathCount').val("");
                $('#myModal #phone').val("");
                $('#myModal #openTime').val("");
                $('#myModal').modal({
                    backdrop: 'static',
                    keyboard: false
                });
            });

            $("#btnPay").click(function (e) {
                selfAjax("post", "/admin/shop/getQRCode", null, function (data) {
                    if (data.error) {
                        showAlert(data.error);
                        return;
                    }
                    $(".showQR").append('<img style="width:100px;height:100px;" src="' + data.qrCode.data + '" />');
                });
            });

            $("#myModal #btnSave").on("click", function (e) {
                var validator = $('#myModal').data('formValidation').validate();
                if (validator.isValid()) {
                    var postURI = "/admin/shop/add",
                        postObj = {
                            name: $.trim($('#myModal #name').val()),
                            address: $.trim($('#myModal #address').val()),
                            hpathCount: $.trim($('#myModal #hpathCount').val()),
                            vpathCount: $.trim($('#myModal #vpathCount').val()),
                            phone: $.trim($('#myModal #phone').val()),
                            openTime: $.trim($('#myModal #openTime').val())
                        };
                    if ($('#id').val()) {
                        postURI = "/admin/shop/edit";
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
                $('#myModal #address').val(entity.address);
                $('#myModal #hpathCount').val(entity.hpathCount);
                $('#myModal #vpathCount').val(entity.vpathCount);
                $('#myModal #phone').val(entity.phone);
                $('#myModal #openTime').val(entity.openTime);
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
                    selfAjax("post", "/admin/shop/delete", {
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

            $("#gridBody").on("click", "td.link", function (e) {
                var obj = e.currentTarget;
                location.href = "/shop/shopId/{0}".format($(obj).attr("id"));
            });

            $("#gridBody").on("click", "td .btnReset", function (e) {
                var obj = e.currentTarget;
                var entity = $(obj).parent().data("obj");
                showConfirm("将要删除原始轨道重新生成，确定继续吗？");
                $("#confirmModal #btnConfirmSave").off("click").click(function (e) {
                    var postObj = {
                        hpathCount: entity.hpathCount,
                        vpathCount: entity.vpathCount,
                        id: entity._id
                    }
                    selfAjax("post", "/admin/shop/resetPath", postObj, function (data) {
                        if (data.error) {
                            showAlert(data.error);
                            return;
                        }
                        showAlert("轨道已经重新生成!");
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
            selfAjax("post", "/admin/shopList/search?" + pStr, filter, function (data) {
                if (data && data.records.length > 0) {
                    var d = $(document.createDocumentFragment());
                    data.records.forEach(function (record) {
                        var $tr = $('<tr ><td id=' + record._id + ' class="link">' + record.name + '</td><td>' +
                            (record.address || '') + '</td><td>' + record.hpathCount + '</td><td>' + record.vpathCount + '</td><td><div class="btn-group">' + that.getButtons() + '</div></td></tr>');
                        $tr.find(".btn-group").data("obj", record);
                        d.append($tr);
                    });
                    that.options.$mainSelectBody.append(d);
                }
                setPaging("#mainModal", data, that.search.bind(that));
            });
        },
        getButtons: function () {
            var buttons = '<a class="btn btn-default btnEdit">编辑</a><a class="btn btn-default btnDelete">删除</a><a class="btn btn-default btnReset">重置轨道</a>';
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