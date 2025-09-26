/**
 * Contact Page JavaScript - KhaDock.com
 * Handles form validation and submission for the contact form
 */

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.querySelector('form[name="contact"]');
    const contactMsg = document.getElementById('contact-form-message');
    
    if (!contactForm) return;

    // Form validation
    const validateForm = (formData) => {
        const errors = [];
        
        // Required fields
        const requiredFields = ['first-name', 'last-name', 'email', 'message'];
        requiredFields.forEach(field => {
            if (!formData.get(field) || formData.get(field).trim() === '') {
                errors.push(`${field.replace('-', ' ')} is required`);
            }
        });
        
        // Email validation
        const email = formData.get('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            errors.push('Please enter a valid email address');
        }
        
        // Phone validation (if provided)
        const phone = formData.get('phone');
        if (phone && phone.length > 0) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
            if (!phoneRegex.test(cleanPhone)) {
                errors.push('Please enter a valid phone number');
            }
        }
        
        return errors;
    };

    // Show message to user
    const showMessage = (message, isError = false) => {
        contactMsg.textContent = message;
        contactMsg.className = `text-center text-sm mt-4 ${isError ? 'text-red-600' : 'text-green-600'}`;
        contactMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    // Optional: Enable AJAX submission instead of redirect
    // Uncomment the following code if you prefer AJAX submission over redirect
    /*
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        contactMsg.textContent = '';
        contactMsg.className = 'text-center text-sm mt-4';

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        try {
            const formData = new FormData(contactForm);
            
            // Client-side validation
            const validationErrors = validateForm(formData);
            if (validationErrors.length > 0) {
                showMessage(`Please fix the following errors: ${validationErrors.join(', ')}`, true);
                return;
            }
            
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sending...';

            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                contactForm.reset();
                showMessage("Thank you! Your message has been sent successfully. We'll get back to you within 24 hours.");
                
                // Optional: Track form submission (Google Analytics, etc.)
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'form_submit', {
                        event_category: 'Contact',
                        event_label: 'Contact Form'
                    });
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Network response was not ok');
            }
        } catch (error) {
            console.error('Contact form error:', error);
            showMessage("Sorry, there was an error sending your message. Please try again or contact us directly at 813-939-3989.", true);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
    */

    // Form field enhancements
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        // Format phone number as user types
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 6) {
                if (value.length <= 10) {
                    value = value.replace(/(\d{3})(\d{3})(\d{1,4})/, '($1) $2-$3');
                } else {
                    value = value.replace(/(\d{1})(\d{3})(\d{3})(\d{1,4})/, '+$1 ($2) $3-$4');
                }
            } else if (value.length >= 3) {
                value = value.replace(/(\d{3})(\d{1,3})/, '($1) $2');
            }
            e.target.value = value;
        });
    }

    // Auto-resize message textarea
    const messageTextarea = document.getElementById('message');
    if (messageTextarea) {
        messageTextarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 300) + 'px';
        });
    }

    // Form analytics (optional)
    const trackFormInteraction = (action, field = null) => {
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: 'Contact Form',
                event_label: field || 'General'
            });
        }
    };

    // Track form field interactions
    const formInputs = contactForm.querySelectorAll('input, select, textarea');
    formInputs.forEach(input => {
        input.addEventListener('focus', () => {
            trackFormInteraction('field_focus', input.name);
        });
    });
});

// Utility functions for form handling
window.ContactFormUtils = {
    // Function to pre-fill form from URL parameters
    prefillFromUrl: () => {
        const urlParams = new URLSearchParams(window.location.search);
        const form = document.querySelector('form[name="contact"]');
        if (!form) return;

        // Map URL parameters to form fields
        const fieldMap = {
            'name': 'first-name',
            'email': 'email',
            'phone': 'phone',
            'project': 'project-type',
            'message': 'message'
        };

        Object.entries(fieldMap).forEach(([param, fieldName]) => {
            const value = urlParams.get(param);
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (value && field) {
                field.value = decodeURIComponent(value);
            }
        });
    },

    // Function to validate individual fields
    validateField: (fieldName, value) => {
        switch (fieldName) {
            case 'email':
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            case 'phone':
                const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
                return cleanPhone.length === 0 || /^[\+]?[1-9][\d]{9,15}$/.test(cleanPhone);
            default:
                return value.trim().length > 0;
        }
    }
};

// Initialize any URL pre-filling
if (window.location.search) {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(ContactFormUtils.prefillFromUrl, 500);
    });
}