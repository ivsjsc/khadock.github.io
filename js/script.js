/**
 * Kha Boat Dock - Main Site Script (site_script_v3.js)
 * Handles menu interactions, active navigation, search, and other utilities.
 * Header and Footer specific logic is initialized via callbacks in loadComponents.js
 */

// --- State Variables ---
let headerLogicInitialized = false; // Flag to ensure header logic runs only once if needed
let searchDebounceTimer = null;
const SEARCH_HIGHLIGHT_CLASS = 'search-highlight';
const FOOTER_YEAR_ID = 'current-year';

/**
 * Initializes all interactive elements and logic within the header.
 * This function is called by loadComponents.js AFTER the header HTML is fetched.
 */
function initializeHeaderLogic() {
    // If already initialized, prevent re-running (useful for SPAs, less so for static sites but good practice)
    if (headerLogicInitialized) {
        console.log("[HeaderLogic] Already initialized. Skipping.");
        return;
    }

    const headerElement = document.querySelector('header');
    if (!headerElement) {
        console.error("[HeaderLogic] Main header element (<header>) not found after dynamic loading. Ensure header.html contains a <header> tag.");
        return;
    }
    console.log("[HeaderLogic] Found header element:", headerElement);

    // --- Mobile Menu Toggle (Main Panel) ---
    const mobileMenuButton = headerElement.querySelector('#mobile-menu-button');
    const mobileMenuPanel = headerElement.querySelector('#mobile-menu-panel');
    const iconMenuOpen = headerElement.querySelector('#icon-menu-open');
    const iconMenuClose = headerElement.querySelector('#icon-menu-close');

    if (mobileMenuButton && mobileMenuPanel && iconMenuOpen && iconMenuClose) {
        mobileMenuButton.addEventListener('click', () => {
            const isPanelCurrentlyVisible = !mobileMenuPanel.classList.contains('hidden');

            if (isPanelCurrentlyVisible) {
                // Panel is visible, so hide it
                mobileMenuPanel.classList.add('hidden');
                mobileMenuButton.setAttribute('aria-expanded', 'false');
                document.body.classList.remove('overflow-hidden');
                iconMenuOpen.classList.remove('hidden');
                iconMenuClose.classList.add('hidden');
                console.log("[HeaderLogic] Mobile menu panel closed.");
            } else {
                // Panel is hidden, so show it
                mobileMenuPanel.classList.remove('hidden');
                mobileMenuButton.setAttribute('aria-expanded', 'true');
                document.body.classList.add('overflow-hidden');
                iconMenuOpen.classList.add('hidden');
                iconMenuClose.classList.remove('hidden');
                console.log("[HeaderLogic] Mobile menu panel opened.");
            }
        });
        console.log("[HeaderLogic] Mobile menu main toggle listeners attached.");
    } else {
        console.warn("[HeaderLogic] Mobile menu main toggle elements not fully found. Check IDs: #mobile-menu-button, #mobile-menu-panel, #icon-menu-open, #icon-menu-close.");
    }

    // --- Mobile Submenu Toggles (Accordion Style with Smooth Animation) ---
    const mobileSubmenuToggles = headerElement.querySelectorAll('.mobile-submenu-toggle');
    mobileSubmenuToggles.forEach(toggle => {
        toggle.addEventListener('click', function() { // Using 'function' to correctly scope 'this'
            const submenuId = this.getAttribute('aria-controls');
            const submenu = headerElement.querySelector(`#${submenuId}`);
            const icon = this.querySelector('.mobile-submenu-icon');

            if (submenu) {
                const isExpanded = this.getAttribute('aria-expanded') === 'true';

                if (isExpanded) {
                    // Collapse the submenu
                    submenu.style.maxHeight = null; 
                    this.setAttribute('aria-expanded', 'false');
                    if (icon) {
                        icon.classList.remove('fa-chevron-up');
                        icon.classList.add('fa-chevron-down');
                    }
                    console.log(`[HeaderLogic] Mobile submenu '${submenuId}' collapsed.`);
                } else {
                    // Expand the submenu
                    submenu.style.maxHeight = submenu.scrollHeight + "px";
                    this.setAttribute('aria-expanded', 'true');
                    if (icon) {
                        icon.classList.remove('fa-chevron-down');
                        icon.classList.add('fa-chevron-up');
                    }
                    console.log(`[HeaderLogic] Mobile submenu '${submenuId}' expanded to ${submenu.scrollHeight}px.`);
                }
            } else {
                console.warn(`[HeaderLogic] Mobile submenu content with ID '${submenuId}' not found.`);
            }
        });
    });
    if (mobileSubmenuToggles.length > 0) console.log("[HeaderLogic] Mobile submenu (accordion) listeners attached.");


    // --- Desktop Dropdown Menu (Services) ---
    const servicesDropdownButton = headerElement.querySelector('#nav-services-button');
    const parentDropdownDiv = servicesDropdownButton?.closest('.dropdown');
    const servicesDropdownMenu = parentDropdownDiv?.querySelector('.dropdown-menu');

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
        console.log("[HeaderLogic] Desktop services dropdown listener attached.");
    } else {
        console.warn("[HeaderLogic] Desktop services dropdown elements not fully found.");
    }

    // --- Desktop Search Toggle ---
    const desktopSearchButton = headerElement.querySelector('#desktop-search-button');
    const desktopSearchContainer = headerElement.querySelector('#desktop-search-container');
    const desktopSearchInput = headerElement.querySelector('#desktop-search-input');
    const desktopSearchClose = headerElement.querySelector('#desktop-search-close');
    const desktopSearchWrapper = headerElement.querySelector('#desktop-search-wrapper');

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
                if (typeof clearSearchHighlights === 'function') clearSearchHighlights();
            });
        }
        
        document.addEventListener('click', (e) => {
            if (!desktopSearchContainer.classList.contains('hidden') && !desktopSearchWrapper.contains(e.target)) {
                desktopSearchContainer.classList.add('hidden');
                desktopSearchInput.value = '';
                if (typeof clearSearchHighlights === 'function') clearSearchHighlights();
            }
        });
        console.log("[HeaderLogic] Desktop search listeners attached.");
    } else {
        console.warn("[HeaderLogic] Desktop search elements not fully found.");
    }
    
    // --- Search Input Handling (Desktop & Mobile) ---
    const searchInputs = headerElement.querySelectorAll('#desktop-search-input, #mobile-search-input');
    searchInputs.forEach(input => {
        input.addEventListener('input', (event) => {
            clearTimeout(searchDebounceTimer);
            const query = event.target.value;
            searchDebounceTimer = setTimeout(() => {
                if (typeof performSearch === 'function') performSearch(query);
            }, 300);
        });
        const searchForm = input.closest('form');
        if (searchForm) {
            searchForm.addEventListener('submit', e => e.preventDefault());
        }
    });
    if (searchInputs.length > 0) console.log("[HeaderLogic] Search input listeners attached.");

    if (typeof setActiveNavLink === 'function') setActiveNavLink(headerElement);
    
    headerLogicInitialized = true; // Set flag after successful initialization
    console.log("[HeaderLogic] Initialization complete.");
}


/**
 * Initializes footer-specific logic.
 */
function initializeFooterLogic() {
    const footerElement = document.querySelector('footer');
    if (!footerElement) {
        console.error("[FooterLogic] Main footer element (<footer>) not found after dynamic loading.");
        return;
    }
    const yearSpan = footerElement.querySelector(`#${FOOTER_YEAR_ID}`);
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    } else {
         console.warn(`[FooterLogic] Copyright year span with ID '${FOOTER_YEAR_ID}' not found in the loaded footer.`);
    }
    console.log("[FooterLogic] Initialization complete.");
}

/**
 * Sets the active state for the current page's navigation link.
 */
function setActiveNavLink(headerElement) {
    if (!headerElement) {
        console.warn("[ActiveNav] Header element not provided.");
        return;
    }
    const currentPagePath = window.location.pathname;
    const currentPageFile = currentPagePath.substring(currentPagePath.lastIndexOf('/') + 1) || "index.html";
    
    const navLinks = headerElement.querySelectorAll('nav a');

    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (!linkHref) return;
        const linkFile = (linkHref.split('/').pop() || "index.html").split('#')[0].split('?')[0];
        
        link.classList.remove('text-sky-400', 'font-semibold', 'bg-slate-600');
        if (!link.classList.contains('bg-sky-500')) { // Exclude "Contact Us" button
            link.classList.add('hover:text-sky-400');
            if (!link.classList.contains('font-semibold')) { 
                 link.classList.add('font-medium');
            }
        } else {
            link.classList.add('font-semibold'); // Ensure "Contact Us" retains font-semibold
        }

        if (linkFile === currentPageFile) {
            link.classList.add('text-sky-400', 'font-semibold');
            link.classList.remove('hover:text-sky-400', 'font-medium');

            const servicesButtonDesktop = headerElement.querySelector('button#nav-services-button');
            if (link.closest('.dropdown-menu') && servicesButtonDesktop) {
                servicesButtonDesktop.classList.add('text-sky-400', 'font-semibold');
                servicesButtonDesktop.classList.remove('hover:text-sky-400', 'font-medium');
            }
            
            const mobileMenuPanel = headerElement.querySelector('#mobile-menu-panel');
            if (mobileMenuPanel && link.closest('#mobile-services-submenu')) {
                 const servicesButtonMobile = mobileMenuPanel.querySelector('button[aria-controls="mobile-services-submenu"]');
                 if(servicesButtonMobile){
                    servicesButtonMobile.classList.add('text-sky-400', 'font-semibold');
                    servicesButtonMobile.classList.remove('hover:text-sky-400', 'font-medium');
                 }
            }
        }
    });
    console.log(`[ActiveNav] Active link processing complete for: ${currentPageFile}`);
}

// --- Search Highlight Functions ---
function clearSearchHighlights() {
    const mainContent = document.querySelector('main');
    if (!mainContent) return;
    const highlights = mainContent.querySelectorAll(`mark.${SEARCH_HIGHLIGHT_CLASS}`);
    highlights.forEach(mark => {
        const parent = mark.parentNode;
        if (parent) {
            parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
            parent.normalize();
        }
    });
}

function performSearch(query) {
    clearSearchHighlights();
    const mainContent = document.querySelector('main');
    if (!mainContent || !query || query.trim().length < 2) return;
    const queryLower = query.trim().toLowerCase();
    let matchCount = 0;
    let firstMatchElement = null;

    function traverseNodes(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.nodeValue;
            if (!text) return;
            const textLower = text.toLowerCase();
            let matchIndex = -1;
            let lastIndex = 0;
            const fragment = document.createDocumentFragment();
            while ((matchIndex = textLower.indexOf(queryLower, lastIndex)) > -1) {
                if (matchIndex > lastIndex) fragment.appendChild(document.createTextNode(text.substring(lastIndex, matchIndex)));
                const matchedText = text.substring(matchIndex, matchIndex + query.length);
                const mark = document.createElement('mark');
                mark.className = SEARCH_HIGHLIGHT_CLASS;
                mark.style.backgroundColor = 'yellow'; mark.style.color = 'black';
                mark.textContent = matchedText;
                fragment.appendChild(mark);
                matchCount++;
                if (!firstMatchElement) firstMatchElement = mark;
                lastIndex = matchIndex + query.length;
            }
            if (lastIndex < text.length) fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
            if (fragment.childNodes.length > 0 && node.parentNode && (fragment.childNodes.length > 1 || (fragment.firstChild && fragment.firstChild.nodeType !== Node.TEXT_NODE))) {
                node.parentNode.replaceChild(fragment, node);
            }
        } else if (node.nodeType === Node.ELEMENT_NODE && !['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'MARK'].includes(node.nodeName) && !node.classList.contains(SEARCH_HIGHLIGHT_CLASS)) {
            Array.from(node.childNodes).forEach(traverseNodes);
        }
    }
    traverseNodes(mainContent);
    console.log(`[Search] Found ${matchCount} matches for "${query}".`);
    if (firstMatchElement) firstMatchElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// --- Utility Functions (Scroll to Top, AOS) ---
function initializeScrollToTopButton() {
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
                scrollToTopBtn.classList.remove('hidden'); scrollToTopBtn.classList.add('flex');
            } else {
                scrollToTopBtn.classList.add('hidden'); scrollToTopBtn.classList.remove('flex');
            }
        }, { passive: true });
        scrollToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
        console.log("[ScrollToTop] Initialized.");
    } else {
        console.warn("[ScrollToTop] Button #scrollToTopBtn not found.");
    }
}

function initializeAOS() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            offset: 100, duration: 700, easing: 'ease-out-quad',
            once: true, mirror: false, anchorPlacement: 'top-bottom',
        });
        console.log("[AOS] Initialized.");
    } else {
        console.warn('[AOS] AOS library not found.');
    }
}

// --- Main DOMContentLoaded Event Listener ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("[DOM] Content Loaded. Initializing site scripts (dynamic components mode)...");
    initializeAOS();
    initializeScrollToTopButton();

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        const formStatus = document.getElementById('form-status');
        contactForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const formData = new FormData(contactForm);
            if(formStatus) formStatus.innerHTML = '<p class="text-slate-600">Đang gửi...</p>'; // Sending...
            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST', body: formData, headers: {'Accept': 'application/json'}
                });
                if (response.ok) {
                    if(formStatus) formStatus.innerHTML = '<p class="form-success">Cảm ơn bạn! Tin nhắn của bạn đã được gửi thành công.</p>'; // Thank you! Your message has been sent successfully.
                    contactForm.reset();
                } else {
                    response.json().then(data => {
                        if (formStatus) {
                            if (Object.hasOwn(data, 'errors')) {
                                formStatus.innerHTML = `<p class="form-error">${data["errors"].map(error => error["message"]).join(", ")}</p>`;
                            } else {
                                formStatus.innerHTML = '<p class="form-error">Đã có lỗi xảy ra. Vui lòng thử lại.</p>'; // An error occurred. Please try again.
                            }
                        }
                    }).catch(() => {
                        if (formStatus) formStatus.innerHTML = '<p class="form-error">Lỗi xử lý phản hồi từ máy chủ. Vui lòng thử lại.</p>'; // Error processing server response. Please try again.
                    });
                }
            } catch (error) {
                if(formStatus) formStatus.innerHTML = '<p class="form-error">Đã xảy ra lỗi mạng. Vui lòng kiểm tra kết nối và thử lại.</p>'; // A network error occurred. Please check your connection and try again.
            }
        });
        console.log("[ContactForm] Event listener added.");
    }
    console.log("[DOM] Common site script initializations complete.");
});
