(function (window, $) {
    'use strict'

    var MESSAGES_TIMEOUT = 1000 * 5 // ms * s
    var ANIMATION_SPEED = 300 // ms

    var $publishForm = $('#publish_form')
    var $backToFormBtn = $('#back_to_form_btn')
    var $submitBtn = $('#submit_btn')
    var $customerEmail = $('#customer_email')
    var $customerName = $('#customer_name')
    var $customerSurname = $('#customer_surname')
    var $alertBox = $('#alert_box')

    function validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        return re.test(email)
    }

    function validateText(text) {
        return text !== ""
    }

    function validateFields() {
        if (!validateEmail($customerEmail.val())) {
            $customerEmail.closest('.form-group').toggleClass('has-error', true)
            return false
        }

        if (!validateText($customerName.val()) || !validateText($customerSurname.val())) {
            $customerName.closest('.form-group').toggleClass('has-error', true)
            return false
        }

        $customerEmail.closest('.form-group').toggleClass('has-error', false)
        $customerName.closest('.form-group').toggleClass('has-error', false)

        return true
    }

    function toggleFields(status) {
        $submitBtn.prop('disabled', status)
        $customerEmail.prop('disabled', status)
        $customerName.prop('disabled', status)
        $customerSurname.prop('disabled', status)
    }

    function showError(text) {
        $alertBox
            .toggleClass('alert-danger', true)
            .text(text)
            .show(ANIMATION_SPEED, function () {
                setTimeout(function () {
                    $alertBox
                        .hide(ANIMATION_SPEED)
                        .toggleClass('alert-danger', false)
                        .text('')
                }, MESSAGES_TIMEOUT)
            })
    }

    function showResult(result) {
        var voucher_code = result.code || null;
        var qr_url = result.assets && result.assets.qr && result.assets.qr.url || null;

        var html_body = $('<div>')
            .append('<h4>Voucher published successfully</h4>')
            .append('<p>Voucher Code: <b>' + voucher_code + '</b></p>')

        if (qr_url) {
            html_body.append('<img src="' + qr_url + '" alt="' + voucher_code + '">')
        }

        $alertBox
            .toggleClass('alert-info', true)
            .html(html_body)
            .show(ANIMATION_SPEED)

        $backToFormBtn.show(ANIMATION_SPEED)
    }

    function hideResult(callback) {
        $alertBox
            .toggleClass('alert-info', false)
            .html("")
            .hide(ANIMATION_SPEED, callback)

        $backToFormBtn.hide(ANIMATION_SPEED)
    }

    $alertBox.hide()
    $backToFormBtn.hide()

    $submitBtn.on('click', function (e) {
        e.preventDefault()
        e.stopPropagation()

        if (!validateFields()) {
            showError('Some of fields are empty or not valid. Please, check them again.')
            return
        }

        toggleFields(true)

        return $.post('/publish', {
            customer: {
                name: $customerName.val(),
                surname: $customerSurname.val(),
                email: $customerEmail.val()
            }
        }).done(function (result) {
            $publishForm.hide(ANIMATION_SPEED, function () {
                showResult(result)
            })
        }).fail(function (err) {
            showError('Unexpected error occurred during the validation of the voucher')
        }).always(function () {
            toggleFields(false)
        })
    })

    $backToFormBtn.on('click', function (e) {
        e.preventDefault()
        e.stopPropagation()

        hideResult(function () {
            $customerEmail.val('');
            $customerName.val('');
            $customerSurname.val('');
            $publishForm.show(ANIMATION_SPEED)
        })
    })

})(window, window.jQuery)