let headerLogicInitialized = false;
let searchDebounceTimer = null;
const SEARCH_HIGHLIGHT_CLASS = 'search-highlight';
const FOOTER_YEAR_ID = 'current-year';
const DEBOUNCE_DELAY = 300;
const SCROLL_THRESHOLD = 200;

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function initializeHeaderLogic() {
    if (headerLogicInitialized) {
        console.log("[HeaderLogic] Already initialized. Skipping.");
        return;
    }

    const headerElement = document.querySelector('header');
    if (!headerElement) {
        console.error("[HeaderLogic] Main header element (<header>) not found. Ensure header.html is loaded and contains a <header> tag.");
        return;
    }

    const mobileMenuButton = headerElement.querySelector('#mobile-menu-button');
    const mobileMenuPanel = headerElement.querySelector('#mobile-menu-panel');
    const iconMenuOpen = headerElement.querySelector('#icon-menu-open');
    const iconMenuClose = headerElement.querySelector('#icon-menu-close');

    if (mobileMenuButton && mobileMenuPanel && iconMenuOpen && iconMenuClose) {
        mobileMenuButton.addEventListener('click', () => {
            const isPanelCurrentlyVisible = !mobileMenuPanel.classList.contains('hidden');
            mobileMenuPanel.classList.toggle('hidden');
            mobileMenuButton.setAttribute('aria-expanded', String(!isPanelCurrentlyVisible));
            document.body.classList.toggle('overflow-hidden', !isPanelCurrentlyVisible);
            iconMenuOpen.classList.toggle('hidden', !isPanelCurrentlyVisible);
            iconMenuClose.classList.toggle('hidden', isPanelCurrentlyVisible);
        });
    } else {
        console.warn("[HeaderLogic] Mobile menu toggle elements not fully found.");
    }

    const mobileSubmenuToggles = headerElement.querySelectorAll('.mobile-submenu-toggle');
    mobileSubmenuToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const submenuId = this.getAttribute('aria-controls');
            const submenu = headerElement.querySelector(`#${submenuId}`);
            const icon = this.querySelector('.mobile-submenu-icon');

            if (submenu) {
                const isExpanded = this.getAttribute('aria-expanded') === 'true';
                if (isExpanded) {
                    submenu.style.maxHeight = null; 
                    this.setAttribute('aria-expanded', 'false');
                    if (icon) {
                        icon.classList.remove('fa-chevron-up');
                        icon.classList.add('fa-chevron-down');
                    }
                } else {
                    submenu.style.maxHeight = submenu.scrollHeight + "px";
                    this.setAttribute('aria-expanded', 'true');
                    if (icon) {
                        icon.classList.remove('fa-chevron-down');
                        icon.classList.add('fa-chevron-up');
                    }
                }
            }
        });
    });

    const servicesDropdownButton = headerElement.querySelector('#nav-services-button');
    const parentDropdownDiv = servicesDropdownButton?.closest('.dropdown');
    const servicesDropdownMenu = parentDropdownDiv?.querySelector('.dropdown-menu');

    if (servicesDropdownButton && servicesDropdownMenu && parentDropdownDiv) {
        const toggleDropdown = (open) => {
            servicesDropdownMenu.classList.toggle('hidden', !open);
            servicesDropdownButton.setAttribute('aria-expanded', String(open));
            parentDropdownDiv.classList.toggle('open', open);
        };
    
        servicesDropdownButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const isCurrentlyOpen = !servicesDropdownMenu.classList.contains('hidden');
            toggleDropdown(!isCurrentlyOpen);
        });
        
        servicesDropdownButton.addEventListener('mouseenter', () => {
             if (window.innerWidth >= 768) { // Only open on hover for desktop
                toggleDropdown(true);
             }
        });

        parentDropdownDiv.addEventListener('mouseleave', () => {
            if (window.innerWidth >= 768) {
                toggleDropdown(false);
            }
        });
    
        document.addEventListener('click', (e) => {
            if (parentDropdownDiv.classList.contains('open') && !parentDropdownDiv.contains(e.target)) {
                toggleDropdown(false);
            }
        });
         servicesDropdownMenu.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent closing when clicking inside menu
        });

    } else {
        console.warn("[HeaderLogic] Desktop services dropdown elements not fully found.");
    }

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
    } else {
        console.warn("[HeaderLogic] Desktop search elements not fully found.");
    }
    
    const searchInputs = headerElement.querySelectorAll('#desktop-search-input, #mobile-search-input');
    searchInputs.forEach(input => {
        input.addEventListener('input', (event) => {
            clearTimeout(searchDebounceTimer);
            const query = event.target.value;
            searchDebounceTimer = setTimeout(() => {
                if (typeof performSearch === 'function') performSearch(query);
            }, DEBOUNCE_DELAY);
        });
        const searchForm = input.closest('form');
        if (searchForm) {
            searchForm.addEventListener('submit', e => e.preventDefault());
        }
    });

    if (typeof setActiveNavLink === 'function') setActiveNavLink(headerElement);
    
    headerLogicInitialized = true;
}

function initializeFooterLogic() {
    const footerElement = document.querySelector('footer');
    if (!footerElement) {
        console.error("[FooterLogic] Main footer element (<footer>) not found.");
        return;
    }
    const yearSpan = footerElement.querySelector(`#${FOOTER_YEAR_ID}`);
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    } else {
         console.warn(`[FooterLogic] Copyright year span with ID '${FOOTER_YEAR_ID}' not found in the footer.`);
    }
}

function setActiveNavLink(headerElement) {
    if (!headerElement) {
        console.warn("[ActiveNav] Header element not provided for setActiveNavLink.");
        return;
    }
    const currentPagePath = window.location.pathname;
    const pathSegments = currentPagePath.split('/');
    const currentPageFile = pathSegments.pop() || "index.html"; 
    
    const navLinks = headerElement.querySelectorAll('nav a:not(.dropdown-menu a)');
    const dropdownLinks = headerElement.querySelectorAll('.dropdown-menu a');

    const cleanLinkClasses = (link) => {
        link.classList.remove('text-sky-400', 'font-semibold', 'bg-slate-600');
        if (!link.classList.contains('bg-sky-500')) { 
             link.classList.add('hover:text-sky-400');
             if (!link.id || !link.id.startsWith('nav-contact')) { 
                link.classList.add('font-medium');
             }
        } else {
            link.classList.add('font-semibold'); 
        }
    };
    
    navLinks.forEach(cleanLinkClasses);
    dropdownLinks.forEach(cleanLinkClasses);

    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (!linkHref) return;
        const linkFile = (linkHref.split('/').pop() || "index.html").split('#')[0].split('?')[0];
        if (linkFile === currentPageFile) {
            link.classList.add('text-sky-400', 'font-semibold');
            link.classList.remove('hover:text-sky-400', 'font-medium');
        }
    });

    let isServicePageActive = false;
    dropdownLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (!linkHref) return;
        const linkFileWithHash = (linkHref.split('/').pop() || "index.html");
        const currentPageFileWithHash = currentPageFile + window.location.hash;
        if (linkFileWithHash === currentPageFileWithHash || (linkFileWithHash.startsWith("services.html") && currentPageFile === "services.html")) {
            link.classList.add('text-sky-400', 'font-semibold', 'bg-slate-600'); 
            link.classList.remove('hover:text-sky-400', 'font-medium', 'hover:bg-slate-600');
            isServicePageActive = true;
        }
    });
    
    const servicesButtonDesktop = headerElement.querySelector('button#nav-services-button');
    if (isServicePageActive && servicesButtonDesktop) {
        servicesButtonDesktop.classList.add('text-sky-400', 'font-semibold');
        servicesButtonDesktop.classList.remove('hover:text-sky-400', 'font-medium');
    } else if (currentPageFile === "services.html" && !window.location.hash && servicesButtonDesktop) {
        servicesButtonDesktop.classList.add('text-sky-400', 'font-semibold');
        servicesButtonDesktop.classList.remove('hover:text-sky-400', 'font-medium');
    }

    const mobileMenuPanel = headerElement.querySelector('#mobile-menu-panel');
    if (mobileMenuPanel && currentPageFile === "services.html") {
         const mobileServicesLinks = mobileMenuPanel.querySelectorAll('#mobile-services-submenu-items a');
         mobileServicesLinks.forEach(mlink => {
            const linkHref = mlink.getAttribute('href');
            if (!linkHref) return;
            const linkFileWithHash = (linkHref.split('/').pop() || "index.html");
            const currentPageFileWithHash = currentPageFile + window.location.hash;
             if (linkFileWithHash === currentPageFileWithHash) {
                mlink.classList.add('text-sky-400', 'font-semibold', 'bg-slate-600');
                mlink.classList.remove('hover:text-sky-400', 'font-medium', 'hover:bg-slate-600');
             }
         });
    }
}

function clearSearchHighlights() {
    const mainContent = document.querySelector('main');
    if (!mainContent) return;
    let highlightedElements = mainContent.querySelectorAll(`mark.${SEARCH_HIGHLIGHT_CLASS}`);
    while(highlightedElements.length > 0) {
        highlightedElements.forEach(mark => {
            const parent = mark.parentNode;
            if (parent) {
                while (mark.firstChild) {
                    parent.insertBefore(mark.firstChild, mark);
                }
                parent.removeChild(mark);
                parent.normalize(); 
            }
        });
        highlightedElements = mainContent.querySelectorAll(`mark.${SEARCH_HIGHLIGHT_CLASS}`);
    }
}

function performSearch(query) {
    clearSearchHighlights();
    const mainContent = document.querySelector('main');
    if (!mainContent || !query?.trim() || query.trim().length < 2) {
        return;
    }
    const queryLower = query.trim().toLowerCase();
    let matchCount = 0;
    let firstMatchElement = null;

    const treeWalker = document.createTreeWalker(mainContent, NodeFilter.SHOW_TEXT, {
        acceptNode: function (node) {
            if (node.parentElement.closest('script, style, textarea, input, button, nav, footer, .search-form, mark.' + SEARCH_HIGHLIGHT_CLASS)) {
                return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
        }
    });

    let currentNode;
    const nodesToReplace = [];

    while (currentNode = treeWalker.nextNode()) {
        const text = currentNode.nodeValue;
        const textLower = text.toLowerCase();
        let matchIndex = -1;
        let lastIndex = 0;
        
        if (textLower.includes(queryLower)) {
            const fragment = document.createDocumentFragment();
            while ((matchIndex = textLower.indexOf(queryLower, lastIndex)) > -1) {
                if (matchIndex > lastIndex) {
                    fragment.appendChild(document.createTextNode(text.substring(lastIndex, matchIndex)));
                }
                const matchedText = text.substring(matchIndex, matchIndex + query.length);
                const mark = document.createElement('mark');
                mark.className = SEARCH_HIGHLIGHT_CLASS;
                mark.textContent = matchedText;
                fragment.appendChild(mark);
                matchCount++;
                if (!firstMatchElement) firstMatchElement = mark;
                lastIndex = matchIndex + query.length;
            }
            if (lastIndex < text.length) {
                fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
            }
            if (fragment.childNodes.length > 0) {
                 nodesToReplace.push({ original: currentNode, replacement: fragment });
            }
        }
    }

    nodesToReplace.forEach(item => {
        if (item.original.parentNode) {
            item.original.parentNode.replaceChild(item.replacement, item.original);
        }
    });

    if (firstMatchElement) {
        firstMatchElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function initializeScrollToTopButton() {
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (!scrollToTopBtn) return;

    const handleScroll = debounce(() => {
        const shouldShow = document.documentElement.scrollTop > SCROLL_THRESHOLD;
        scrollToTopBtn.classList.toggle('hidden', !shouldShow);
        scrollToTopBtn.classList.toggle('flex', shouldShow);
    }, 100);

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

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
    } else {
        console.warn('[AOS] AOS library not found. Animations will not work.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initializeAOS();
    initializeScrollToTopButton();

    const contactForm = document.getElementById('contactForm'); 
    if (contactForm) {
        const formStatus = document.getElementById('form-status'); 
        contactForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const formData = new FormData(contactForm);
            if(formStatus) formStatus.innerHTML = '<p class="text-slate-600">Sending...</p>';
            
            const formActionUrl = contactForm.action || 'YOUR_FORM_ACTION_URL_HERE'; 
            if (formActionUrl === 'YOUR_FORM_ACTION_URL_HERE' || formActionUrl === window.location.href + '#') { 
                if(formStatus) formStatus.innerHTML = '<p class="form-error">Form submission endpoint not configured.</p>';
                return;
            }

            try {
                const response = await fetch(formActionUrl, {
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
                            const errorMessage = data && data.errors ? data.errors.map(error => error.message).join(", ") : (data && data.error ? data.error : "Oops! There was a problem submitting your form.");
                            formStatus.innerHTML = `<p class="form-error">${errorMessage}</p>`;
                        }
                    }).catch(() => {
                        if (formStatus) formStatus.innerHTML = '<p class="form-error">Error processing server response. Please try again.</p>';
                    });
                }
            } catch (error) {
                if(formStatus) formStatus.innerHTML = '<p class="form-error">A network error occurred. Please check your connection and try again.</p>';
            }
        });
    }
    
    const splashScreen = document.getElementById('splash-screen');
    const mainContent = document.getElementById('main-content-area');
    const visitedFlag = 'khadockVisited';
    const splashDuration = 2500; 

    function showMainContent() {
        if (splashScreen) {
            splashScreen.classList.add('hidden');
        }
        if (mainContent) {
            setTimeout(() => {
                mainContent.style.opacity = '1';
            }, 50); 
        }
    }

    if (!localStorage.getItem(visitedFlag) && window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        if (splashScreen && mainContent) {
            mainContent.style.opacity = '0'; 
            setTimeout(() => {
                showMainContent();
                localStorage.setItem(visitedFlag, 'true');
            }, splashDuration);
        } else {
            if(mainContent) mainContent.style.opacity = '1';
        }
    } else {
        showMainContent();
    }
});
