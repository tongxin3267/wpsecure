$(document).ready(function () {
    $("#left_btnAdmin").on("click", function (e) {
        location.href = "/admin/adminList";
    });

    $("#left_btnCompany").on("click", function (e) {
        location.href = "/admin";
    });

    $("#left_btnSuit").on("click", function (e) {
        location.href = "/admin/sysSuitList";
    });

    $(".admin-nav .menu-top #header_btnBasic").addClass("active");
});