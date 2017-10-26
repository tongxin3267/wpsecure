$(document).ready(function() {
    $('#loginForm').formValidation({
        // List of fields and their validation rules
        fields: {
            name: {
                trigger: "blur change",
                validators: {
                    notEmpty: {
                        message: 'The username is required and cannot be empty'
                    }
                }
            },
            password: {
                trigger: "blur change",
                validators: {
                    notEmpty: {
                        message: 'The password is required and cannot be empty'
                    }
                }
            }
        }
    });
});