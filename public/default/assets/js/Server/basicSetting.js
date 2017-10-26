$(document).ready(function () {
    $("#left_btnAdmin").on("click", function (e) {
        location.href = "/admin/adminList";
    });

    $("#left_btnSchool").on("click", function (e) {
        location.href = "/admin/schoolAreaList";
    });

    $("#left_btnGrade").on("click", function (e) {
        location.href = "/admin/gradeList";
    });

    $("#left_btnClassroom").on("click", function (e) {
        location.href = "/admin/classRoomList";
    });

    $("#left_btnExamroom").on("click", function (e) {
        location.href = "/admin/examAreaList";
    });

    $("#left_btnTeacher").on("click", function (e) {
        location.href = "/admin/teacherList";
    });

    $("#left_btnYear").on("click", function (e) {
        location.href = "/admin/yearList";
    });

    //课程设置相关
    $("#left_btnWeekType").on("click", function (e) {
        location.href = "/admin/weekType";
    });

    $("#left_btnTimeType").on("click", function (e) {
        location.href = "/admin/timeType";
    });

    $(".admin-header .menu-top #header_btnBasic").addClass("active");
});