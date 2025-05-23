// js/contact-page.js
document.addEventListener('DOMContentLoaded', function () {
    // This script assumes a form with id="contactForm" and a status display with id="form-status"
    // It's taken from the inline script in contact.html
    // If you use a different form ID or status ID, update them here.

    const contactForm = document.getElementById('contactForm'); // Ensure your form in contact.html has this ID
    const formStatus = document.getElementById('form-status');   // Ensure your status div has this ID

    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const formData = new FormData(contactForm);
            formStatus.innerHTML = '<p class="text-slate-600">Sending...</p>'; // Tailwind classes for styling

            try {
                // IMPORTANT: Replace 'YOUR_FORM_SUBMISSION_ENDPOINT' with your actual backend URL
                // or a service like Formspree. The 'action' attribute of the form will be used.
                const formActionUrl = contactForm.action || 'YOUR_FORM_SUBMISSION_ENDPOINT_FALLBACK';
                if (formActionUrl.includes('YOUR_FORM_SUBMISSION_ENDPOINT')) {
                     console.error("Form action URL is not configured.");
                     formStatus.innerHTML = '<p class="text-red-600 bg-red-50 p-3 rounded-md">Form submission endpoint not configured. Please contact support.</p>';
                     return;
                }


                const response = await fetch(formActionUrl, {
                    method: 'POST',
                    body: formData,
                    headers: {'Accept': 'application/json'} // Important for services like Formspree
                });

                if (response.ok) {
                    formStatus.innerHTML = '<p class="text-green-600 bg-green-50 p-3 rounded-md">Thank you! Your message has been sent successfully.</p>';
                    contactForm.reset();
                } else {
                    // Try to parse error from services like Formspree
                    response.json().then(data => {
                        const errorMessage = data.errors ? data.errors.map(error => error.message).join(", ") : "Oops! There was a problem submitting your form.";
                        formStatus.innerHTML = `<p class="text-red-600 bg-red-50 p-3 rounded-md">${errorMessage}</p>`;
                    }).catch(() => {
                        // Fallback error message if response is not JSON or parsing fails
                        formStatus.innerHTML = '<p class="text-red-600 bg-red-50 p-3 rounded-md">Error processing server response. Please try again.</p>';
                    });
                }
            } catch (error) {
                console.error("Form submission error:", error);
                formStatus.innerHTML = '<p class="text-red-600 bg-red-50 p-3 rounded-md">A network error occurred. Please check your connection and try again.</p>';
            }
        });
    } else {
        if (!contactForm) console.warn("Contact form (#contactForm) not found for contact-page.js.");
        if (!formStatus) console.warn("Form status display element (#form-status) not found for contact-page.js.");
    }
});
