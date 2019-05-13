var setPaging = function (formStr, data, callBack) {
    var total = data.total,
        curPage = data.page;
    $(formStr + " #total").val(total);
    $(formStr + " #page").val(curPage);

    var totalPage = Math.ceil(total / data.pageSize);
    $(formStr + " .paging .total").text(total.toString());
    $(formStr + " .paging .page").text(curPage.toString() + "/" + totalPage.toString());

    if ((!curPage) || curPage == 1) {
        $(formStr + " .paging .prepage").hide();
        // $(formStr + " .paging .firstpage").hide();
    } else {
        $(formStr + " .paging .prepage").show();
        // $(formStr + " .paging .firstpage").show();
    }
    if ((curPage - 1) * data.pageSize + data.records.length == total) {
        $(formStr + " .paging .nextpage").hide();
        // $(formStr + " .paging .endpage").hide();
    } else {
        $(formStr + " .paging .nextpage").show();
        // $(formStr + " .paging .endpage").show();
    }

    $(formStr + " .paging .prepage").off("click").on("click", function (e) {
        var page = parseInt($(formStr + " .paging #page").val()) - 1;
        callBack(page);
    });

    $(formStr + " .paging .nextpage").off("click").on("click", function (e) {
        var page = parseInt($(formStr + " .paging #page").val()) + 1;
        callBack(page);
    });

    $(formStr + " .paging #btnGo").off("click").on("click", function (e) {
        var page = parseInt($(formStr + " .paging #topage").val());
        if (page > totalPage) {
            page = totalPage;
            $(formStr + " .paging #topage").val(page);
        }
        callBack(page);
    });
};