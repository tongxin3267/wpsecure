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

            $("#gridBody").on("click", "td .btnOn", function (e) {
                var obj = e.currentTarget;
                var entity = $(obj).parent().data("obj");
                selfAjax("post", "/shop/shopGood/on", {
                    goodId: entity.goodId,
                    goodPrice: entity.goodPrice
                }, function (data) {
                    if (data.error) {
                        showAlert(data.error);
                        return;
                    }
                    location.reload();
                });
            });

            $("#gridBody").on("click", "td .btnOff", function (e) {
                var obj = e.currentTarget;
                var entity = $(obj).parent().data("obj");
                selfAjax("post", "/shop/shopGood/off", {
                    goodId: entity.goodId
                }, function (data) {
                    if (data.error) {
                        showAlert(data.error);
                        return;
                    }
                    location.reload();
                });
            });

            $("#myModal #btnSave").on("click", function (e) {
                var validator = $('#myModal').data('formValidation').validate();
                if (validator.isValid()) {
                    var postURI = "/admin/shopGood/edit",
                        postObj = {
                            goodPrice: $.trim($('#myModal #goodPrice').val()),
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
                $('#myModal #myModalLabel').text("修改价格");
                $('#myModal #goodPrice').val(entity.goodPrice);
                $('#myModal #id').val(entity._id);
                $('#myModal').modal({
                    backdrop: 'static',
                    keyboard: false
                });
            });

            $("#gridBody").on("click", "td .btnSet", function (e) {
                var obj = e.currentTarget;
                var entity = $(obj).parent().data("obj");
                location.href = "/shop/good/{0}/attribute".format(entity.goodId);
            });
        },
        initData: function () {
            this.initType(this.search.bind(this));
        },
        initType: function (callback) {
            // init goodtypes
            selfAjax("post", "/admin/goodTypeList/all", null,
                function (data) {
                    if (data.error) {
                        showAlert(data.error);
                        return;
                    }
                    $("#InfoSearch #goodType").empty();
                    if (data && data.length > 0) {
                        var d = $(document.createDocumentFragment());
                        d.append('<option value=""></option>');
                        data.forEach(function (record) {
                            d.append('<option value="{0}">{1}</option>'.format(record._id, record.name));
                        });
                        $("#InfoSearch #goodType").append(d);
                    }
                    return callback && callback();
                });
        },
        search: function (p) {
            var that = this,
                filter = {
                    name: $(".mainModal #InfoSearch #Name").val(),
                    goodTypeId: $("#InfoSearch #goodType").val()
                },
                pStr = p ? "p=" + p : "";
            this.options.$mainSelectBody.empty();
            selfAjax("post", "/admin/shopGoodList/search?" + pStr, filter, function (data) {
                if (data && data.records.length > 0) {
                    var d = $(document.createDocumentFragment());
                    data.records.forEach(function (record) {
                        var $tr = $('<tr id=' + record._id + '><td>' + record.name + '</td><td style="padding:4px;"><img src=' + "/uploads/icons/" + (record.img || "") + ' style="height:30px;" /></td><td>' +
                            record.goodPrice + '</td><td>' + (record.newPrice || '') + '</td><td>' + record.goodTypeName +
                            '</td><td>' + that.getStatus(record._id) + '</td><td><div class="btn-group">' + that.getButtons(record._id) + '</div></td></tr>');
                        $tr.find(".btn-group").data("obj", record);
                        d.append($tr);
                    });
                    that.options.$mainSelectBody.append(d);
                }
                setPaging("#mainModal", data, that.search.bind(that));
            });
        },
        getStatus: function (goodId) {
            if (goodId) {
                return "已上架";
            }
            return "未上架";
        },
        getButtons: function (goodId) {
            var strButton = '<a class="btn btn-default btnSet">设置</a>';
            if (goodId) {
                strButton += '<a class="btn btn-default btnEdit">编辑</a><a class="btn btn-default btnOff">下架</a>';
                //<a class="btn btn-default btnSpecial">特价</a>
            } else {
                strButton += '<a class="btn btn-default btnOn">上架</a>';
            }
            return strButton;
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
                        'goodPrice': {
                            trigger: "blur change",
                            validators: {
                                notEmpty: {
                                    message: '名称不能为空'
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