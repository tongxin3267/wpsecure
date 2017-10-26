$(document).ready(function() {
    var total = parseInt($("#total").val()),
        curPage = parseInt($("#page").val());
    var totalPage = Math.ceil(total / 14);
    $(".paging .total").text(total.toString());
    $(".paging .page").text(curPage.toString() + "/" + totalPage.toString());
});