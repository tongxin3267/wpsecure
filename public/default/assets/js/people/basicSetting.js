$(document).ready(function () {
    $("#left_btnEmployee").on("click", function (e) {
        location.href = "/people";
    });
    $("#left_btnSalary").on("click", function (e) {
        location.href = "/people/salaryList";
    });
    $("#left_btnSalaryItem").on("click", function (e) {
        location.href = "/people/salaryItemList";
    });
    $("#left_btnSumSalary").on("click", function (e) {
        location.href = "/people/sumSalary";
    });
    $("#left_btnContract").on("click", function (e) {
        location.href = "/people/batchAddContract";
    });
    $(".admin-header .menu-top #header_btnBasic").addClass("active");
});