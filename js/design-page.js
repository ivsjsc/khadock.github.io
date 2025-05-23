// js/design-page.js
document.addEventListener('DOMContentLoaded', () => {
    // Stats Counter Animation (from design.html inline script)
    function animateCounter(element, target) {
        let current = 0;
        const isIncrement = target > 0; // Determine if target is positive or requires special handling
        const step = Math.max(1, Math.floor(Math.abs(target) / 100)); // Ensure step is at least 1
        const effectiveTarget = Math.abs(target);

        const timer = setInterval(() => {
            current += step;
            if (current >= effectiveTarget) {
                current = effectiveTarget;
                clearInterval(timer);
            }
            // Handle original string format like ">10" or "24/7"
            const originalText = element.dataset.count;
            if (originalText.includes('>') || originalText.includes('/')) {
                 element.textContent = originalText; // Keep original complex string
            } else {
                element.textContent = Math.floor(current) + (target >= 100 && isIncrement ? '+' : '');
            }

        }, 20); // Animation speed
    }

    const statsCounters = document.querySelectorAll('.stats-counter');
    if (statsCounters.length > 0) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const targetElement = entry.target;
                    const targetValueString = targetElement.dataset.count; // e.g., "50", ">10", "24/7"

                    let targetNumber;
                    // Try to parse the number, handle special cases like ">10"
                    if (targetValueString.startsWith('>')) {
                        targetNumber = parseInt(targetValueString.substring(1), 10);
                    } else if (targetValueString.includes('/')) {
                        targetNumber = 0; // Or handle as non-numeric
                    }
                    else {
                        targetNumber = parseInt(targetValueString, 10);
                    }

                    if (!isNaN(targetNumber)) {
                        animateCounter(targetElement, targetNumber);
                    } else {
                        targetElement.textContent = targetValueString; // If not a number, display as is
                    }
                    statsObserver.unobserve(targetElement);
                }
            });
        }, { threshold: 0.5 }); // Trigger when 50% visible

        statsCounters.forEach(counter => {
            statsObserver.observe(counter);
        });
    }


    // Enhanced Navigation Scroll Effect (from design.html inline script)
    // This might be better in app.js if you want it on all pages.
    // If only for design.html, keep it here.
    const mainNav = document.querySelector('header'); // Assuming header is the nav container
    if (mainNav) {
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            if (currentScroll <= 80) { // Show nav if near top (header height)
                mainNav.style.transform = 'translateY(0)';
                mainNav.classList.remove('shadow-lg'); // Or your sticky shadow class
                return;
            }
            if (currentScroll > lastScroll && currentScroll > parseInt(mainNav.offsetHeight)) {
                // Scrolling down & past header
                mainNav.style.transform = 'translateY(-100%)';
            } else if (currentScroll < lastScroll) {
                // Scrolling up
                mainNav.style.transform = 'translateY(0)';
                mainNav.classList.add('shadow-lg'); // Or your sticky shadow class
            }
            lastScroll = currentScroll <= 0 ? 0 : currentScroll;
        }, { passive: true });
    }


    // Lazy Loading for Images (from design.html inline script)
    // This is a good candidate for app.js if you want lazy loading globally.
    // If only for design.html, keep it here.
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                    }
                    img.classList.remove('opacity-0'); // Assuming you use Tailwind for initial opacity
                    // img.classList.add('opacity-100'); // Might not be needed if opacity-0 is just removed
                    observer.unobserve(img);
                }
            });
        }, { rootMargin: "0px 0px 200px 0px" }); // Load images 200px before they enter viewport

        document.querySelectorAll('img[loading="lazy"]').forEach(img => {
            // img.classList.add('opacity-0', 'transition-opacity', 'duration-300'); // Add these classes in HTML or CSS
            imageObserver.observe(img);
        });
    }

    // AI Design Generator related buttons specific to design.html (if any beyond the main one)
    // The main AI generator logic is in generateDesign.js
    // This is for the "Clear" button or other UI elements specific to design.html's AI section
    const aiInput = document.getElementById('ai-design-input');
    const aiClearBtn = document.getElementById('ai-clear-btn'); // From design.html
    const aiError = document.getElementById('ai-error');
    const aiOutput = document.getElementById('ai-output');

    if (aiClearBtn && aiInput) {
        aiClearBtn.addEventListener('click', () => {
            aiInput.value = '';
            if(aiError) aiError.classList.add('hidden');
            if(aiOutput) aiOutput.classList.add('hidden');
            aiInput.focus();
        });
    }
});
