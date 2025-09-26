$(document).ready(function() {
    // Form validation functions
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function validatePhone(phone) {
        if (phone === '') return true; // Phone is optional
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
        return phoneRegex.test(phone);
    }

    function validateForm() {
        let isValid = true;
        
        // Clear previous errors
        $('.error-message').hide();
        $('.form-group').removeClass('error');

        // Name validation
        const name = $('#name').val().trim();
        if (name === '') {
            $('#nameError').show();
            $('#name').closest('.form-group').addClass('error');
            isValid = false;
        }

        // Email validation
        const email = $('#email').val().trim();
        if (email === '' || !validateEmail(email)) {
            $('#emailError').show();
            $('#email').closest('.form-group').addClass('error');
            isValid = false;
        }

        // Phone validation (optional field)
        const phone = $('#phone').val().trim();
        if (phone !== '' && !validatePhone(phone)) {
            $('#phoneError').show();
            $('#phone').closest('.form-group').addClass('error');
            isValid = false;
        }

        // Inquiry type validation
        const inquiryType = $('#inquiry_type').val();
        if (inquiryType === '') {
            $('#inquiryError').show();
            $('#inquiry_type').closest('.form-group').addClass('error');
            isValid = false;
        }

        // Message validation
        const message = $('#message').val().trim();
        if (message === '') {
            $('#messageError').show();
            $('#message').closest('.form-group').addClass('error');
            isValid = false;
        }

        return isValid;
    }

    // Real-time validation
    $('#name, #email, #phone, #message').on('input', function() {
        $(this).closest('.form-group').removeClass('error');
        $(this).siblings('.error-message').hide();
    });

    $('#inquiry_type').on('change', function() {
        $(this).closest('.form-group').removeClass('error');
        $(this).siblings('.error-message').hide();
    });

    // Form submission
    $('#contactForm').on('submit', function(e) {
        e.preventDefault();

        // Validate form before submission
        if (!validateForm()) {
            Swal.fire({
                icon: 'warning',
                title: 'Please check your inputs',
                text: 'Make sure all required fields are filled correctly.'
            });
            return;
        }

        // Show loading state
        const submitBtn = $('#submitBtn');
        const originalText = submitBtn.find('span').text();
        submitBtn.prop('disabled', true);
        submitBtn.find('span').text('Sending...');
        submitBtn.addClass('loading');

        // AJAX request
        $.ajax({
            type: 'POST',
            url: 'contact.php', // Make sure this matches your PHP file name
            data: $(this).serialize(),
            timeout: 30000, // 30 second timeout
            success: function(response) {
                const res = response.trim().toLowerCase();
                
                // Reset button state
                submitBtn.prop('disabled', false);
                submitBtn.find('span').text(originalText);
                submitBtn.removeClass('loading');

                if (res === 'success') {
                    // Clear form
                    $('#contactForm')[0].reset();
                    
                    // Show success message
                    Swal.fire({
                        icon: 'success',
                        title: 'Message Sent Successfully!',
                        text: 'Thank you for contacting us. We will get back to you within 24 hours.',
                        confirmButtonText: 'OK'
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Message Sending Failed',
                        text: 'There was an error sending your message. Please try again or contact us directly.',
                        confirmButtonText: 'Try Again'
                    });
                }
            },
            error: function(xhr, status, error) {
                // Reset button state
                submitBtn.prop('disabled', false);
                submitBtn.find('span').text(originalText);
                submitBtn.removeClass('loading');

                let errorMessage = 'Unable to connect to server. Please check your internet connection and try again.';
                
                if (status === 'timeout') {
                    errorMessage = 'Request timed out. Please try again.';
                } else if (xhr.status === 404) {
                    errorMessage = 'Contact form handler not found. Please contact support.';
                } else if (xhr.status === 500) {
                    errorMessage = 'Server error. Please try again later.';
                }

                Swal.fire({
                    icon: 'error',
                    title: 'Connection Error',
                    text: errorMessage,
                    confirmButtonText: 'OK'
                });
            }
        });
    });
});