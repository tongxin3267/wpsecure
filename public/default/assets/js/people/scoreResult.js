var isNew = true;

$(document).ready(function () {
    $("#left_btnSalary").addClass("active");
    search();
});

//------------search funfunction
var $mainSelectBody = $('.content.mainModal table tbody');

function search() {
    $mainSelectBody.empty();
    selfAjax("get", "/people/score/getAllWithoutPage", null, function (data) {
        if (data && data.length > 0) {
            data.forEach(function (scoreFail) {
                $mainSelectBody.append('<tr id=' + scoreFail._id + '><td>' + scoreFail.name + '</td><td>' + scoreFail.mobile + '</td><td>' +
                    scoreFail.score + '</td><td>' + scoreFail.examId + '</td></tr>');
            });
        }
    });
};
//------------end