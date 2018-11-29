$(document).ready(function () {
    var pageManager = {
        options: {
            $mainSelectBody: $('.content.mainModal table tbody'),
            isCopy: false
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
        initDropDown: function (callback) {
            // init goodtypes
            selfAjax("post", "/admin/goodTypeList/all", null,
                function (data) {
                    if (data.error) {
                        showAlert(data.error);
                        return;
                    }
                    $("#myModal #goodType").empty();
                    if (data && data.length > 0) {
                        var d = $(document.createDocumentFragment());
                        data.forEach(function (record) {
                            d.append('<option value="{0}">{1}</option>'.format(record._id, record.name));
                        });
                        $("#myModal #goodType").append(d);
                    }
                    return callback && callback();
                });
        },
        editEntity: function (e) {
            var that = this;
            that.options.isCopy = false;
            that.destroy();
            that.addValidation();
            var obj = e.currentTarget;
            var entity = $(obj).parent().data("obj");
            // $('#name').attr("disabled", "disabled");
            $('#myModal #myModalLabel').text("修改名称");
            $('#myModal #name').val(entity.name);
            $('#myModal #detail').val(entity.detail);
            $('#myModal #sequence').val(entity.sequence);
            $('#myModal #goodPrice').val(entity.goodPrice);
            $('#myModal #img').val(entity.img);
            $('#myModal #id').val(entity._id);
            $('#myModal').modal({
                backdrop: 'static',
                keyboard: false
            });

            that.initDropDown(function () {
                $('#myModal #goodType').val(entity.goodTypeId);
            });
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
                $('#myModal #myModalLabel').text("新增商品");
                $('#myModal #id').val("");
                $('#myModal #name').val("");
                $('#myModal #detail').val("");
                $('#myModal #sequence').val(0);
                $('#myModal #goodPrice').val(0);
                $('#myModal #img').val("");
                $('#myModal').modal({
                    backdrop: 'static',
                    keyboard: false
                });

                that.initDropDown();
            });

            $("#btnSave").on("click", function (e) {
                var validator = $('#myModal').data('formValidation').validate();
                if (validator.isValid()) {
                    var postURI = "/admin/good/add",
                        postObj = {
                            name: $.trim($('#myModal #name').val()),
                            detail: $.trim($('#myModal #detail').val()),
                            sequence: $.trim($('#myModal #sequence').val()),
                            goodPrice: $.trim($('#myModal #goodPrice').val()),
                            img: $.trim($('#myModal #img').val()),
                            goodTypeId: $('#myModal #goodType').val(),
                            goodTypeName: $('#myModal #goodType').find("option:selected").text(),
                            isCopy: that.options.isCopy
                        };
                    if ($('#id').val()) {
                        postURI = "/admin/good/edit";
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
                that.editEntity(e);
            });

            $("#gridBody").on("click", "td .btnDelete", function (e) {
                showConfirm("确定要删除吗？");
                var obj = e.currentTarget;
                var entity = $(obj).parent().data("obj");
                $("#btnConfirmSave").off("click").on("click", function (e) {
                    selfAjax("post", "/admin/good/delete", {
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

            $("#gridBody").on("click", "td .btnSet", function (e) {
                var obj = e.currentTarget;
                var entity = $(obj).parent().data("obj");
                location.href = "/admin/goodAttributeList/" + entity._id;
            });

            $("#gridBody").on("click", "td .btnCopy", function (e) {
                that.editEntity(e);
                $('#myModal #myModalLabel').text("复制商品");
                that.options.isCopy = true;
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
            selfAjax("post", "/admin/goodList/search?" + pStr, filter, function (data) {
                if (data && data.records.length > 0) {
                    var d = $(document.createDocumentFragment());
                    data.records.forEach(function (record) {
                        var $tr = $('<tr id=' + record._id + '><td>' + record.name + '</td><td>' +
                            record.sequence + '</td><td>' + record.goodTypeName + '</td><td>' + record.goodPrice + '</td><td><div class="btn-group">' + that.getButtons() + '</div></td></tr>');
                        $tr.find(".btn-group").data("obj", record);
                        d.append($tr);
                    });
                    that.options.$mainSelectBody.append(d);
                }
                setPaging("#mainModal", data, that.search.bind(that));
            });
        },
        getButtons: function () {
            var buttons = '<a class="btn btn-default btnEdit">编辑</a><a class="btn btn-default btnDelete">删除</a><a class="btn btn-default btnSet">设置</a><a class="btn btn-default btnCopy">复制</a>';
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