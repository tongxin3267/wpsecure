$(document).ready(function () {
    $("#left_btnUser").on("click", function (e) {
        location.href = "/admin/userList";
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

    $(".admin-nav .menu-top #header_btnUser").addClass("active");
});