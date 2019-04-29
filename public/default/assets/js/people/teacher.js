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
                $('#myModal #engName').val("");
                $('#myModal #mobile').val("");
                $('#myModal #address').val("");
                $("#myModal #subject").val("");
                $("#myModal #gradeType").val("5");
                $('#myModal #role').val('20');
                $("#myModal #nativePlace").val("");
                $("#myModal #idType").val("");
                $("#myModal #marryType").val("");
                $("#myModal #partyType").val("");
                $("#myModal #sex").val("0");
                $("#myModal #isRegSecur").val("0");
                $("#myModal #departmentName").val("");
                $("#myModal #positionType").val("0");
                $("#myModal #highEduBg").val("");
                $("#myModal #graduateSchool").val("");
                $("#myModal #graduateSubject").val("");
                $("#myModal #idNumber").val("");
                $("#myModal #firstWorkDate").val("");
                $("#myModal #onBoardDate").val(moment(new Date()).format("YYYY-MM-DD HH:mm"));
                $("#myModal #yearHolidays").val("0");
                $("#myModal #usedHolidays").val("0");
                $("#myModal #overTime").val(0);
                $("#myModal #weUserId").val("");
                $("#myModal #nickname").val("");
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
                            engName: $('#myModal #engName').val(),
                            mobile: $('#myModal #mobile').val(),
                            subjectId: $('#myModal #subject').val(),
                            gradeType: $("#myModal #gradeType").val(),
                            address: $('#myModal #address').val(),
                            role: $.trim($("#myModal #role").val()),
                            nativePlace: $.trim($("#myModal #nativePlace").val()),
                            idType: $.trim($("#myModal #idType").val()),
                            marryType: $.trim($("#myModal #marryType").val()),
                            partyType: $.trim($("#myModal #partyType").val()),
                            sex: $.trim($("#myModal #sex").val()),
                            isRegSecur: $.trim($("#myModal #isRegSecur").val()),
                            departmentName: $.trim($("#myModal #departmentName").val()),
                            positionType: $.trim($("#myModal #positionType").val()),
                            highEduBg: $.trim($("#myModal #highEduBg").val()),
                            graduateSchool: $.trim($("#myModal #graduateSchool").val()),
                            graduateSubject: $.trim($("#myModal #graduateSubject").val()),
                            idNumber: $.trim($("#myModal #idNumber").val()),
                            firstWorkDate: $.trim($("#myModal #firstWorkDate").val()),
                            onBoardDate: $.trim($("#myModal #onBoardDate").val()),
                            yearHolidays: $.trim($("#myModal #yearHolidays").val()),
                            usedHolidays: $.trim($("#myModal #usedHolidays").val()),
                            overTime: $.trim($("#myModal #overTime").val()),
                            weUserId: $.trim($("#myModal #weUserId").val()),
                            nickname: $.trim($("#myModal #nickname").val())
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
                $('#myModal #engName').val(entity.engName);
                $('#myModal #mobile').val(entity.mobile);
                $('#myModal #address').val(entity.address);
                $("#myModal #subject").val(entity.subjectId);
                $("#myModal #gradeType").val(entity.gradeType);
                $('#myModal #role').val(entity.role);
                $("#myModal #nativePlace").val(entity.nativePlace);
                $("#myModal #idType").val(entity.idType);
                $("#myModal #marryType").val(entity.marryType);
                $("#myModal #partyType").val(entity.partyType);
                $("#myModal #sex").val(entity.sex ? 1 : 0);
                $("#myModal #isRegSecur").val(entity.isRegSecur ? 1 : 0);
                $("#myModal #departmentName").val(entity.departmentName);
                $("#myModal #positionType").val(entity.positionType ? 1 : 0);
                $("#myModal #highEduBg").val(entity.highEduBg);
                $("#myModal #graduateSchool").val(entity.graduateSchool);
                $("#myModal #graduateSubject").val(entity.graduateSubject);
                $("#myModal #idNumber").val(entity.idNumber);
                $("#myModal #firstWorkDate").val(entity.firstWorkDate);
                $("#myModal #onBoardDate").val(moment(entity.onBoardDate).format("YYYY-MM-DD"));
                $("#myModal #yearHolidays").val(entity.yearHolidays);
                $("#myModal #usedHolidays").val(entity.usedHolidays);
                $("#myModal #overTime").val(entity.overTime);
                $("#myModal #weUserId").val(entity.weUserId);
                $("#myModal #nickname").val(entity.nickname);
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
                    departmentName: $(".mainModal #InfoSearch #searchdeptName").val(),
                    isDeleted: $(".mainModal #InfoSearch #chkDeleted").prop("checked")
                },
                pStr = p ? "p=" + p : "";
            that.pageOptions.$mainSelectBody.empty();
            selfAjax("post", "/people/employee/search?" + pStr, filter, function (data) {
                if (data && data.records.length > 0) {
                    data.records.forEach(function (teacher) {
                        var $tr = $('<tr id=' + teacher._id + '><td>' + teacher.name + '</td><td>' + (teacher.engName || "") + '</td><td>' +
                            teacher.mobile + '</td><td>' + teacher.departmentName + '</td><td><div class="btn-group">' + that.pageGetButtons(teacher) + '</div></td></tr>');
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
            buttons += '<a class="btn btn-default btnContract">合同</a>';
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