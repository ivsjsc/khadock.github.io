/**
 * Kha Boat Dock - Main Site Script (site_script_v3.js)
 * Assumes header and footer are directly embedded in each HTML page.
 * Handles menu interactions, active navigation, search, and other utilities.
 */

// --- State Variables ---
let headerLogicInitialized = false;
let searchDebounceTimer = null;
const SEARCH_HIGHLIGHT_CLASS = 'search-highlight';
const FOOTER_YEAR_ID = 'current-year'; // ID for the copyright year span

/**
 * Initializes all interactive elements and logic within the header.
 * This function should be called on DOMContentLoaded.
 */
function initializeHeaderLogic() {
    if (headerLogicInitialized) {
        return;
    }

    const headerElement = document.querySelector('header'); // Targets the first <header> tag
    if (!headerElement) {
        console.error("[HeaderLogic] Main header element not found. Cannot initialize.");
        return;
    }

    // Mobile Menu Toggle
    const mobileMenuButton = headerElement.querySelector('#mobile-menu-button');
    // Corrected selector for mobileMenuPanel based on your services.html and contactus.html structure
    const mobileMenuPanel = headerElement.querySelector('#mobile-menu-panel, div#mobile-menu.md\\:hidden'); 
    const iconMenuOpen = headerElement.querySelector('#icon-menu-open'); // If you add this ID to your open icon
    const iconMenuClose = headerElement.querySelector('#icon-menu-close'); // If you add this ID to your close icon

    if (mobileMenuButton && mobileMenuPanel) {
        mobileMenuButton.addEventListener('click', () => {
            const isCurrentlyHidden = mobileMenuPanel.classList.contains('hidden');
            mobileMenuPanel.classList.toggle('hidden', !isCurrentlyHidden);
            mobileMenuButton.setAttribute('aria-expanded', isCurrentlyHidden); // True if panel is now shown
            document.body.classList.toggle('overflow-hidden', isCurrentlyHidden);
            
            // Icon toggling (assuming you have distinct open/close icons)
            const barsIcon = mobileMenuButton.querySelector('.fa-bars');
            const timesIcon = mobileMenuButton.querySelector('.fa-times'); // You might need to add a close icon

            if (isCurrentlyHidden) { // Menu is being opened
                if (barsIcon) barsIcon.classList.add('hidden');
                if (timesIcon) timesIcon.classList.remove('hidden');
            } else { // Menu is being closed
                if (barsIcon) barsIcon.classList.remove('hidden');
                if (timesIcon) timesIcon.classList.add('hidden');
            }
        });
    }


    // Mobile Submenu Toggles (using onclick from HTML, ensure function is global)
    // The function toggleMobileSubmenu is defined globally below.

    // Desktop Dropdown Menu (Services)
    const servicesDropdownButton = headerElement.querySelector('#nav-services-button');
    // The dropdown menu is a sibling div with class 'dropdown-menu' inside a parent div with class 'dropdown'
    const servicesDropdownMenu = servicesDropdownButton?.parentElement.querySelector('.dropdown-menu'); 
    const parentDropdownDiv = servicesDropdownButton?.closest('.dropdown');

    if (servicesDropdownButton && servicesDropdownMenu && parentDropdownDiv) {
        servicesDropdownButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = servicesDropdownMenu.classList.toggle('hidden');
            servicesDropdownButton.setAttribute('aria-expanded', String(!isHidden));
            parentDropdownDiv.classList.toggle('open', !isHidden);
        });

        document.addEventListener('click', (e) => {
            if (parentDropdownDiv.classList.contains('open') && !parentDropdownDiv.contains(e.target)) {
                servicesDropdownMenu.classList.add('hidden');
                servicesDropdownButton.setAttribute('aria-expanded', 'false');
                parentDropdownDiv.classList.remove('open');
            }
        });
    }

    // Desktop Search Toggle
    const desktopSearchButton = headerElement.querySelector('#desktop-search-button');
    const desktopSearchContainer = headerElement.querySelector('#desktop-search-container'); // Assuming this ID exists
    const desktopSearchInput = headerElement.querySelector('#desktop-search-input'); // Assuming this ID exists
    const desktopSearchClose = headerElement.querySelector('#desktop-search-close'); // Assuming this ID exists
    const desktopSearchWrapper = headerElement.querySelector('#desktop-search-wrapper'); // Assuming this ID for the parent div

    if (desktopSearchButton && desktopSearchContainer && desktopSearchInput && desktopSearchWrapper) {
        desktopSearchButton.addEventListener('click', (e) => {
            e.stopPropagation();
            desktopSearchContainer.classList.remove('hidden');
            desktopSearchInput.focus();
        });
        if (desktopSearchClose) {
            desktopSearchClose.addEventListener('click', () => {
                desktopSearchContainer.classList.add('hidden');
                desktopSearchInput.value = '';
                clearSearchHighlights();
            });
        }
        document.addEventListener('click', (e) => {
            if (!desktopSearchContainer.classList.contains('hidden') && !desktopSearchWrapper.contains(e.target)) {
                desktopSearchContainer.classList.add('hidden');
                desktopSearchInput.value = '';
                clearSearchHighlights();
            }
        });
    }
    
    // Search Input Handling (Desktop & Mobile)
    const searchInputs = headerElement.querySelectorAll('#desktop-search-input, #mobile-search-input'); // Use correct mobile ID if different
    searchInputs.forEach(input => {
        input.addEventListener('input', (event) => {
            clearTimeout(searchDebounceTimer);
            const query = event.target.value;
            searchDebounceTimer = setTimeout(() => {
                performSearch(query);
            }, 300);
        });
        const searchForm = input.closest('form'); // Generalize to any form containing the search
        if (searchForm) {
            searchForm.addEventListener('submit', e => e.preventDefault());
        }
    });

    setActiveNavLink(headerElement);
    headerLogicInitialized = true;
    console.log("[HeaderLogic] Initialized successfully (Direct Embedding Mode).");
}

/**
 * Global function for mobile submenu toggle, accessible by onclick attributes.
 */
window.toggleMobileSubmenu = function() {
    // This function needs to correctly target the submenu and icon within the *specific* "Services" dropdown in the mobile menu.
    // It's better to use event listeners attached in initializeHeaderLogic if possible,
    // but if onclick is used, the elements need to be reliably found.
    // Let's assume the structure from your provided HTML for `services.html`'s mobile menu.
    const servicesButton = document.querySelector('#mobile-menu-panel button.mobile-submenu-toggle, #mobile-menu button[onclick="toggleMobileSubmenu()"]'); // More robust selector
    if (!servicesButton) {
        console.warn("Mobile services toggle button not found for toggleMobileSubmenu.");
        return;
    }
    // Find the submenu and icon relative to THIS button or via specific IDs if they are unique.
    // Your HTML uses specific IDs: mobile-submenu and mobile-submenu-icon
    const submenu = document.getElementById('mobile-submenu'); // From your services.html
    const icon = document.getElementById('mobile-submenu-icon');   // From your services.html

    if (submenu && icon) {
        submenu.classList.toggle('hidden');
        const isExpanded = !submenu.classList.contains('hidden');
        servicesButton.setAttribute('aria-expanded', isExpanded);
        icon.classList.toggle('fa-chevron-down', !isExpanded);
        icon.classList.toggle('fa-chevron-up', isExpanded);
    } else {
        console.warn("Mobile submenu content or icon not found for toggleMobileSubmenu.");
    }
};


/**
 * Initializes footer-specific logic.
 */
function initializeFooterLogic() {
    const yearSpan = document.getElementById(FOOTER_YEAR_ID);
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
        console.log("[FooterLogic] Copyright year updated.");
    } else {
         console.warn(`[FooterLogic] Copyright year span with ID '${FOOTER_YEAR_ID}' not found.`);
    }
}

/**
 * Sets the active state for the current page's navigation link.
 * @param {HTMLElement} headerElement - The main header DOM element.
 */
function setActiveNavLink(headerElement) {
    if (!headerElement) return;
    const currentPageFile = window.location.pathname.split('/').pop() || "index.html";

    const navLinks = headerElement.querySelectorAll('nav a'); // Desktop and mobile links

    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (!linkHref) return;

        const linkFile = linkHref.split('/').pop().split('#')[0]; // Get filename, ignore hash
        
        // Reset styles
        link.classList.remove('text-sky-400', 'font-semibold');
        if (!link.classList.contains('bg-sky-500')) { // Avoid removing base style of Contact Us button
            link.classList.add('hover:text-sky-400', 'font-medium');
        }

        // Apply active styles
        if (linkFile === currentPageFile) {
            link.classList.add('text-sky-400', 'font-semibold');
            link.classList.remove('hover:text-sky-400', 'font-medium');

            // Special handling for "Services" dropdown parent in desktop nav
            const servicesButtonDesktop = headerElement.querySelector('button#nav-services-button');
            if (link.closest('.dropdown-menu') && servicesButtonDesktop) {
                servicesButtonDesktop.classList.add('text-sky-400', 'font-semibold');
                servicesButtonDesktop.classList.remove('hover:text-sky-400', 'font-medium');
            }
            // Special handling for "Services" parent in mobile nav
            const servicesButtonMobile = link.closest('#mobile-menu-panel div')?.querySelector('button.mobile-submenu-toggle, button[onclick="toggleMobileSubmenu()"]');
            if (link.closest('#mobile-submenu, #mobile-services-submenu') && servicesButtonMobile) {
                 servicesButtonMobile.classList.add('text-sky-400', 'font-semibold'); // Or bg-slate-600 as per your HTML
                 servicesButtonMobile.classList.remove('hover:text-sky-400', 'font-medium');
            }
        }
    });
     console.log(`[ActiveNav] Active link attempt for: ${currentPageFile}`);
}

/**
 * Clears previously highlighted search results.
 */
function clearSearchHighlights() {
    const mainContent = document.querySelector('main');
    if (!mainContent) return;
    const highlights = mainContent.querySelectorAll(`mark.${SEARCH_HIGHLIGHT_CLASS}`);
    highlights.forEach(mark => {
        const parent = mark.parentNode;
        if (parent) {
            parent.replaceChild(document.createTextNode(mark.textContent), mark);
            parent.normalize();
        }
    });
}

/**
 * Performs a client-side search within the <main> element.
 */
function performSearch(query) {
    clearSearchHighlights();
    const mainContent = document.querySelector('main');
    if (!mainContent || !query || query.trim().length < 2) {
        return;
    }
    const queryLower = query.trim().toLowerCase();
    let matchCount = 0;
    let firstMatchElement = null;

    function traverseNodes(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.nodeValue;
            const textLower = text.toLowerCase();
            let matchIndex = -1;
            let lastIndex = 0;
            const fragment = document.createDocumentFragment();
            while ((matchIndex = textLower.indexOf(queryLower, lastIndex)) > -1) {
                if (matchIndex > lastIndex) {
                    fragment.appendChild(document.createTextNode(text.substring(lastIndex, matchIndex)));
                }
                const matchedText = text.substring(matchIndex, matchIndex + query.length);
                const mark = document.createElement('mark');
                mark.className = SEARCH_HIGHLIGHT_CLASS;
                mark.style.backgroundColor = 'yellow'; // Example highlight style
                mark.style.color = 'black';
                mark.textContent = matchedText;
                fragment.appendChild(mark);
                matchCount++;
                if (!firstMatchElement) firstMatchElement = mark;
                lastIndex = matchIndex + query.length;
            }
            if (lastIndex < text.length) {
                fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
            }
            if (fragment.childNodes.length > 0 && (fragment.childNodes.length > 1 || fragment.firstChild.nodeType !== Node.TEXT_NODE)) {
                if (node.parentNode) {
                    node.parentNode.replaceChild(fragment, node);
                }
            }
        } else if (node.nodeType === Node.ELEMENT_NODE &&
                   node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE' &&
                   node.nodeName !== 'MARK' && !node.classList.contains(SEARCH_HIGHLIGHT_CLASS)) {
            Array.from(node.childNodes).forEach(traverseNodes);
        }
    }
    traverseNodes(mainContent);
    console.log(`[Search] Found ${matchCount} matches for "${query}".`);
    if (firstMatchElement) {
        firstMatchElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

/**
 * Initializes the "Scroll to Top" button.
 */
function initializeScrollToTopButton() {
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
                scrollToTopBtn.classList.remove('hidden');
                scrollToTopBtn.classList.add('flex');
            } else {
                scrollToTopBtn.classList.add('hidden');
                scrollToTopBtn.classList.remove('flex');
            }
        });
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        console.log("[ScrollToTop] Initialized.");
    }
}

/**
 * Initializes AOS library.
 */
function initializeAOS() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            offset: 100,
            duration: 700,
            easing: 'ease-out-quad',
            once: true,
            mirror: false,
            anchorPlacement: 'top-bottom',
        });
        console.log("[AOS] Initialized.");
    } else {
        console.warn('[AOS] Library not found.');
    }
}

// --- Main DOMContentLoaded Event Listener ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("[DOM] Content Loaded. Initializing site scripts (Direct Embedding Mode)...");

    initializeHeaderLogic(); // Initialize header logic as it's already in the DOM
    initializeFooterLogic(); // Initialize footer logic as it's already in the DOM
    initializeAOS();
    initializeScrollToTopButton();

    // Formspree handling for contact page (if it's the current page)
    const contactForm = document.getElementById('contactForm');
    if (contactForm) { // Check if the contact form exists on the current page
        const formStatus = document.getElementById('form-status');
        contactForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const formData = new FormData(contactForm);
            if(formStatus) formStatus.innerHTML = '<p class="text-slate-600">Sending...</p>';
            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {'Accept': 'application/json'}
                });
                if (response.ok) {
                    if(formStatus) formStatus.innerHTML = '<p class="form-success">Thank you! Your message has been sent successfully.</p>';
                    contactForm.reset();
                } else {
                    response.json().then(data => {
                        if (formStatus) {
                            if (Object.hasOwn(data, 'errors')) {
                                formStatus.innerHTML = `<p class="form-error">${data["errors"].map(error => error["message"]).join(", ")}</p>`;
                            } else {
                                formStatus.innerHTML = '<p class="form-error">An error occurred. Please try again.</p>';
                            }
                        }
                    });
                }
            } catch (error) {
                if(formStatus) formStatus.innerHTML = '<p class="form-error">An error occurred. Please try again.</p>';
            }
        });
        console.log("[ContactForm] Event listener added.");
    }

    console.log("[DOM] Site script initializations complete.");
});
