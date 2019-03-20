$(document).ready(function () {
    $("#left_btnSite").on("click", function (e) {
        location.href = "/admin/siteInfo";
    });

    $("#left_btnSupplier").on("click", function (e) {
        location.href = "/admin/supplierList";
    });

    $("#left_btnShop").on("click", function (e) {
        location.href = "/admin/shopList";
    });

    $(".admin-nav .menu-top #header_btnBasic").addClass("active");
});