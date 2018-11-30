$(document).ready(function () {
    $("#left_btnGood").on("click", function (e) {
        location.href = "/shop/goodList".format($("#shopId").val());
    });

    $("#left_btnOrder").on("click", function (e) {
        location.href = "/shop/orderList".format($("#shopId").val());
    });

    $(".admin-nav .menu-top #header_shop_btnShop").addClass("active");
});