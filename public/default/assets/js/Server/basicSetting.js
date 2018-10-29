$(document).ready(function () {
    $("#left_btnAdmin").on("click", function (e) {
        location.href = "/admin/adminList";
    });

    $("#left_btnShop").on("click", function (e) {
        location.href = "/admin/shopList";
    });

    $("#left_btnUser").on("click", function (e) {
        location.href = "/admin/userList";
    });

    $(".admin-nav .menu-top #header_btnBasic").addClass("active");
});