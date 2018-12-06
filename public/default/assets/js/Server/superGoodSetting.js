$(document).ready(function () {
    $("#left_btnGoodType").on("click", function (e) {
        location.href = "/admin/goodTypeList";
    });

    $("#left_btnGood").on("click", function (e) {
        location.href = "/admin/goodList";
    });

    $("#left_btnOrderType").on("click", function (e) {
        location.href = "/admin/orderTypeList";
    });

    $(".admin-nav .menu-top #header_btnGood").addClass("active");
});