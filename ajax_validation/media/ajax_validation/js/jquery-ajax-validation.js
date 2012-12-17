;(function($) {
    function inputs(form) {
        return form.find(":input:visible:not(:button)");
    }

    $.fn.validate = function(url, settings) {
        settings = $.extend({
            type: 'turbia',
            callback: false,
            fields: false,
            dom: this,
            event: 'submit',
            submitHandler: null,
            async: false,
            method: 'POST'
        }, settings);

        return this.each(function() {
            var form = $(this);
            settings.dom.bind(settings.event, function() {
                var status = false;
                var data = form.serialize();
                if (settings.fields) {
                    data += '&' + $.param({fields: settings.fields});
                }
                $.ajax({
                    async: settings.async,
                    data: data,
                    dataType: 'json',
                    error: function(XHR, textStatus, errorThrown) {
                        status = true;
                    },
                    success: function(data, textStatus) {
                        status = data.valid;
                        if (settings.callback) {
                            settings.callback(data, form);
                        }
                        else {
                            var get_form_error_position = function(key) {
                                key = key || '__all__';
                                if (key == '__all__') {
                                    var filter = ':first';
                                } else {
                                    var filter = ':first[id^=id_' + key.replace('__all__', '') + ']';
                                }
                                return inputs(form).filter(filter).parent();
                            };
                            if (settings.type == 'p') {
                                form.find('ul.errorlist').remove();
                                $.each(data.errors, function(key, val) {
                                    if (key.indexOf('__all__') >= 0) {
                                        var error = get_form_error_position(key);
                                        if (error.prev().is('ul.errorlist')) {
                                            error.prev().before('<ul class="errorlist"><li>' + val + '</li></ul>');
                                        }
                                        else {
                                            error.before('<ul class="errorlist"><li>' + val + '</li></ul>');
                                        }
                                    }
                                    else {
                                        $('#' + key).parent().before('<ul class="errorlist"><li>' + val + '</li></ul>');
                                    }
                                });
                            }
                            if (settings.type == 'table') {
                                inputs(form).prev('ul.errorlist').remove();
                                form.find('tr:has(ul.errorlist)').remove();
                                $.each(data.errors, function(key, val) {
                                    if (key.indexOf('__all__') >= 0) {
                                        get_form_error_position(key).parent().before('<tr><td colspan="2"><ul class="errorlist"><li>' + val + '.</li></ul></td></tr>');
                                    }
                                    else {
                                        $('#' + key).before('<ul class="errorlist"><li>' + val + '</li></ul>');
                                    }
                                });
                            }
                            if (settings.type == 'turbia') {
                                // remove field errors from monitored fields only.
                                if (settings.fields) {
                                    $('ul.form-errors', settings.dom.closest('div.form-field')).remove();
                                }
                                // remove all errors.
                                else {
                                    $('ul.form-errors, ul.non-field-errors', form).remove();
                                }
                                $.each(data.errors, function(key, value) {
                                    // insert non-field error.
                                    if (key == '__all__') {
										// but only if we're validating all fields.
										if (!settings.fields) {
	                                        form.children('ul.non-field-errors').remove();
	                                        form.prepend('<ul class="alerts non-field-errors"><li class="error">' + value + '</li></ul>');
										}
                                    }
                                    // insert field error.
                                    else if (!settings.fields || $.inArray(key.replace(/^id_/, ''), settings.fields) > -1) {
                                        $('#' + key).closest('div.form-field').append('<ul class="form-errors"><li>' + value + '</li></ul>');
                                    }
                                });
                                // update error count.
                                $('ul.error-count', form).remove();
                                var error_count = $('ul.form-errors li', form).length;
                                if (error_count > 1) {
                                    form.prepend('<ul class="alerts error-count"><li class="error">There are ' + error_count + ' errors in your form.</li>');
                                }
                                else if (error_count > 0) {
                                    form.prepend('<ul class="alerts error-count"><li class="error">There is 1 error in your form.</li>');
                                }
                                // scroll to beginning of form to show error count when validating all fields.
                                if (!settings.fields) {
                                    if (form.offset().top < $(window).scrollTop()) {
                                        $('html, body').animate({scrollTop: form.offset().top}, 'fast');
                                    }
                                }
                            }
                            if (settings.type == 'ul') {
                                inputs(form).prev().prev('ul.errorlist').remove();
                                form.find('li:has(ul.errorlist)').remove();
                                $.each(data.errors, function(key, val) {
                                    if (key.indexOf('__all__') >= 0) {
                                        get_form_error_position(key).before('<li><ul class="errorlist"><li>' + val + '</li></ul></li>');
                                    }
                                    else {
                                        $('#' + key).prev().before('<ul class="errorlist"><li>' + val + '</li></ul>');
                                    }
                                });
                            }
                        }
                    },
                    type: settings.method,
                    url: url
                });
                if (status && settings.submitHandler) {
                    return settings.submitHandler.apply(this);
                }
                return status;
            });
        });
    };
})(jQuery);
