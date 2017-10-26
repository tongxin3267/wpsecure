var isNew = true;

$(document).ready(function() {
    $("#btnAdmin").addClass("active");

    $("#myModal").find(".modal-content").draggable(); //为模态对话框添加拖拽
    $("#myModal").css("overflow", "hidden"); //禁止模态对话框的半透明背景滚动

    search();
});

//------------search funfunction
var $mainSelectBody = $('.content.mainModal table tbody');
var getButtons = function() {
    var buttons = '<a class="btn btn-default btnEdit">编辑</a><a class="btn btn-default btnDelete">删除</a>';
    return buttons;
};

function search(p) {
    var filter = {
            name: $(".mainModal #InfoSearch #Name").val()
        },
        pStr = p ? "p=" + p : "";
    $mainSelectBody.empty();
    selfAjax("post", "/admin/#name#List/search?" + pStr, filter, function(data) {
        if (data && data.#name#s.length > 0) {
            data.#name#s.forEach(function(#name#) {
                var $tr = $('<tr id=' + #name#._id + '><td>' + #name#.name + '</td><td>' +
                    #name#.sCount + '</td><td>' + #name#.schoolArea + '</td><td><div class="btn-group">' + getButtons() + '</div></td></tr>');
                $tr.find(".btn-group").data("obj", #name#);
                $mainSelectBody.append($tr);
            });
        }
        $("#mainModal #total").val(data.total);
        $("#mainModal #page").val(data.page);
        setPaging("#mainModal", data);
    });
};

$(".mainModal #InfoSearch #btnSearch").on("click", function(e) {
    search();
});

$("#mainModal .paging .prepage").on("click", function(e) {
    var page = parseInt($("#mainModal #page").val()) - 1;
    search(page);
});

$("#mainModal .paging .nextpage").on("click", function(e) {
    var page = parseInt($("#mainModal #page").val()) + 1;
    search(page);
});
//------------end

function destroy(){
    var validator = $('#myModal').data('formValidation');
    if(validator)
    {
        validator.destroy();
    }
};

function addValidation(callback){
    setTimeout(function() {
    $('#myModal').formValidation({
        // List of fields and their validation rules
        fields: {
            'name': {
                trigger: "blur change",
                validators: {
                    notEmpty: {
                        message: '校区不能为空'
                    },
                    stringLength: {
                        min: 4,
                        max: 30,
                        message: '校区在4-30个字符之间'
                    }
                }
            },
            'address': {
                trigger: "blur change",
                validators: {
                    stringLength: {
                        max: 100,
                        message: '地址不能超过100个字符'
                    },
                }
            }
        }
    });
    }, 0);
};

$("#btnAdd").on("click", function(e) {
    isNew = true;
    destroy();
    addValidation();
    // $('#name').removeAttr("disabled");
    $('#myModalLabel').text("新增校区");
    $('#name').val("");
    $('#address').val("");
    $('#myModal').modal({ backdrop: 'static', keyboard: false });
});

$("#btnSave").on("click", function(e) {
    var validator = $('#myModal').data('formValidation').validate();
    if(validator.isValid())
    {
        var postURI = "/admin/#name#/add",
            postObj = {
            name: $.trim($('#name').val()),
            address: $.trim($('#address').val())
        };
        if (!isNew) {
            postURI = "/admin/#name#/edit";
            postObj.id = $('#id').val();
        }
        selfAjax("post", postURI, postObj, function(data) {
            if (data.error) {
                showAlert(data.error);
                return;
            }
            location.reload();
        });
    }
});

$("#gridBody").on("click", "td .btnEdit", function(e) {
    isNew = false;
    destroy();
    addValidation();
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    // $('#name').attr("disabled", "disabled");
    $('#myModalLabel').text("修改校区");
    $('#name').val(entity.name);
    $('#address').val(entity.address);
    $('#id').val(entity._id);
    $('#myModal').modal({ backdrop: 'static', keyboard: false });
});

$("#gridBody").on("click", "td .btnDelete", function(e) {
    showConfirm("确定要删除吗？");
    var obj = e.currentTarget;
    var entity = $(obj).parent().data("obj");
    $("#btnConfirmSave").off("click").on("click", function(e) {
        selfAjax("post", "/admin/#name#/delete", {
            id: entity._id
        }, function(data) {
            if (data.error) {
                showAlert(data.error);
                return;
            }
           location.reload();
        });
    });
});