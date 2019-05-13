$(document).ready(function () {
    $("#left_btnSecure").on("click", function (e) {
        location.href = "/danger";
    });
    $(".admin-header .menu-top #header_btnBasic").addClass("active");
});