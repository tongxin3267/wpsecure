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
            $("#left_btnEmployee").addClass("active");
            $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
            $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动

            $("#myModal #onBoardDate").datepicker({
                changeMonth: true,
                dateFormat: "yy-mm-dd"
            });
        },
        pageInitEvents: function () {
            var that = this;
            $(".mainModal #InfoSearch #btnSearch").on("click", function (e) {
                that.pageSearch();
            });

            $("#btnAdd").on("click", function (e) {
                that.pageDestroy();
                that.pageAddValidation();
                $('#myModal #name').removeAttr("disabled");
                $('#myModalLabel').text("新增员工");
                $('#myModal #name').val("");
                $('#myModal #mobile').val("");
                $("#myModal #weUserId").val("");
                $('#myModal #id').val('');
                $('#myModal').modal({
                    backdrop: 'static',
                    keyboard: false
                });
            });

            $("#btnBatchAdd").on("click", function (e) {
                location.href = "/people/batchAddemployee";
            });

            $("#btnSave").on("click", function (e) {
                var validator = $('#myModal').data('formValidation').validate();
                if (validator.isValid()) {
                    var postURI = "/people/employee/add",
                        postObj = {
                            name: $('#myModal #name').val(),
                            mobile: $('#myModal #mobile').val(),
                            weUserId: $.trim($("#myModal #weUserId").val())
                        };
                    if ($('#myModal #id').val()) {
                        postURI = "/people/employee/edit";
                        postObj.id = $('#id').val();
                    }
                    selfAjax("post", postURI, postObj, function (data) {
                        if (data.error) {
                            showAlert(data.error);
                            return;
                        }
                        $('#myModal').modal('hide');
                        var page = parseInt($("#mainModal #page").val());
                        that.pageSearch(page);
                    });
                }
            });

            $("#gridBody").on("click", "td .btnEdit", function (e) {
                that.pageDestroy();
                that.pageAddValidation();
                var obj = e.currentTarget;
                var entity = $(obj).parent().data("obj");
                $('#myModal #name').attr("disabled", "disabled");
                $('#myModalLabel').text("修改信息");
                $('#myModal #name').val(entity.name);
                $('#myModal #mobile').val(entity.mobile);
                $("#myModal #weUserId").val(entity.weUserId);
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
                    selfAjax("post", "/people/employee/delete", {
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

            $("#gridBody").on("click", "td .btnRecover", function (e) {
                showConfirm("确定要恢复吗？");
                var obj = e.currentTarget;
                var entity = $(obj).parent().data("obj");
                $("#btnConfirmSave").off("click").on("click", function (e) {
                    selfAjax("post", "/people/employee/recover", {
                        id: entity._id
                    }, function (data) {
                        $('#confirmModal').modal('hide');
                        if (data.sucess) {
                            var page = parseInt($("#mainModal #page").val());
                            that.pageSearch(page);
                        }
                    });
                });
            });

            $("#gridBody").on("click", "td .btnContract", function (e) {
                var obj = e.currentTarget;
                var entity = $(obj).parent().data("obj");
                location.href = "/people/contract/" + entity._id;
            });
        },
        pageInitData: function () {
            this.renderSearchSubjectDropDown();
            this.pageSearch();
        },
        pageSearch: function (p) {
            var that = this;
            var filter = {
                    name: $(".mainModal #InfoSearch #Name").val(),
                    isDeleted: $(".mainModal #InfoSearch #chkDeleted").prop("checked")
                },
                pStr = p ? "p=" + p : "";
            that.pageOptions.$mainSelectBody.empty();
            selfAjax("post", "/people/employee/search?" + pStr, filter, function (data) {
                if (data && data.records.length > 0) {
                    data.records.forEach(function (teacher) {
                        var $tr = $('<tr id=' + teacher._id + '><td>' + teacher.name + '</td><td>' +
                            teacher.mobile + '</td><td>' +
                            teacher.weUserId + '</td><td><div class="btn-group">' + that.pageGetButtons(teacher) + '</div></td></tr>');
                        $tr.find(".btn-group").data("obj", teacher);
                        that.pageOptions.$mainSelectBody.append($tr);
                    });
                }
                setPaging("#mainModal", data, that.pageSearch.bind(that));
            });
        },
        pageGetButtons: function (teacher) {
            var buttons = '<a class="btn btn-default btnEdit">编辑</a><a class="btn btn-default btnDelete">删除</a>';
            if (teacher.isDeleted) {
                buttons += '<a class="btn btn-default btnRecover">恢复</a>';
            }
            // buttons += '<a class="btn btn-default btnContract">合同</a>';
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
        },
        renderSearchSubjectDropDown: function () {
            $("#myModal #subject").append("<option value=''></option>");
            selfAjax("get", "/people/subject/getAllWithoutPage", null, function (data) {
                if (data && data.length > 0) {
                    data.forEach(function (subject) {
                        $("#myModal #subject").append("<option value='" + subject._id + "'>" + subject.name + "</option>");
                    });
                };
            });
        }
    };

    pageManager.pageInit();
});