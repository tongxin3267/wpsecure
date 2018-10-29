$(document).ready(function () {
    $("#left_btnGood").on("click", function (e) {
        location.href = "/shop/{0}/goodList".format($("#shopId").val());
    });

    $(".admin-nav .menu-top #header_shop_btnShop").addClass("active");
});