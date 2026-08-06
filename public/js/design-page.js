// js/design-page.js
// Note: Avoid importing ./auth.js directly because it uses bare imports (firebase/*),
// which break in the browser without a bundler. We'll use optional globals if present.

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

    // User Dashboard and Saved Designs functionality
    const viewSavedDesignsBtn = document.getElementById('viewSavedDesigns');
    const savedDesignsModal = document.getElementById('savedDesignsModal');
    const closeSavedDesignsBtn = document.getElementById('closeSavedDesigns');
    const savedDesignsList = document.getElementById('savedDesignsList');

    if (viewSavedDesignsBtn) {
        viewSavedDesignsBtn.addEventListener('click', loadSavedDesigns);
    }

    if (closeSavedDesignsBtn) {
        closeSavedDesignsBtn.addEventListener('click', () => {
            savedDesignsModal.style.display = 'none';
        });
    }

    async function loadSavedDesigns() {
        if (!getCurrentUser()) {
            alert('Please sign in to view your saved designs.');
            return;
        }

        try {
            savedDesignsList.innerHTML = '<div class="text-center py-4">Loading your designs...</div>';
            savedDesignsModal.style.display = 'flex';

            const response = await makeAuthenticatedRequest('/api/user/designs');
            
            if (!response.ok) {
                throw new Error('Failed to load designs');
            }

            const data = await response.json();
            displaySavedDesigns(data.designs || []);

        } catch (error) {
            console.error('Error loading saved designs:', error);
            savedDesignsList.innerHTML = '<div class="text-center py-4 text-red-600">Error loading designs. Please try again.</div>';
        }
    }

    function displaySavedDesigns(designs) {
        if (designs.length === 0) {
            savedDesignsList.innerHTML = '<div class="text-center py-8 text-gray-500">No saved designs yet. Generate your first design to see it here!</div>';
            return;
        }

        const designsHtml = designs.map((design, index) => `
            <div class="border border-gray-200 rounded-lg p-4 mb-4">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-semibold text-gray-800">Design #${index + 1}</h3>
                    <small class="text-gray-500">${new Date(design.createdAt).toLocaleDateString()}</small>
                </div>
                <div class="bg-gray-50 p-3 rounded text-sm mb-2">
                    <strong>Prompt:</strong> ${design.prompt}
                </div>
                <div class="text-sm text-gray-700 max-h-32 overflow-y-auto">
                    ${design.generatedDesign.substring(0, 200)}${design.generatedDesign.length > 200 ? '...' : ''}
                </div>
                <button onclick="viewFullDesign('${design.id}')" class="mt-2 text-sky-600 hover:text-sky-800 text-sm">
                    View Full Design
                </button>
            </div>
        `).join('');

        savedDesignsList.innerHTML = designsHtml;
    }

    // Make viewFullDesign available globally
    window.viewFullDesign = function(designId) {
        // This could open a detailed view modal or scroll to the AI output area
        alert('Full design view feature coming soon!');
    };
});
