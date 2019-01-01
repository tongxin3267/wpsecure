$(document).ready(function () {
    $("#left_btnGood").on("click", function (e) {
        location.href = "/shop/goodList";
    });

    $("#left_btnPath").on("click", function (e) {
        location.href = "/shop/pathList";
    });

    $("#left_btnOrder").on("click", function (e) {
        location.href = "/shop/orderList";
    });

    $("#left_btnManage").on("click", function (e) {
        location.href = "/shop/manage";
    });

    $(".admin-nav .menu-top #header_shop_btnShop").addClass("active");
});