// js/app.js

// Configuration for the application
const config = {
    scrollToTopThreshold: 300,
    scrollBehavior: 'smooth',
    aos: {
        duration: 700,
        offset: 80,
        once: true,
        easing: 'ease-out-cubic',
        // disable: 'mobile' // Consider if truly needed, Tailwind handles responsiveness well
    },
    searchDebounceTime: 300, // milliseconds
};

class App {
    static searchDebounceTimer = null;
    static SEARCH_HIGHLIGHT_CLASS = 'search-highlight';

    static init() {
        this.setupScrollToTop();
        this.setupImageLoadHandling();
        this.initializeAOS();

        // Functions dependent on header being loaded
        // Listen for a custom event dispatched by loadComponents.js
        document.addEventListener('headerLoaded', () => {
            this.handleMobileMenu();
            this.setActiveNavigationLink();
            this.initializeSearch();
            this.initializeDesktopDropdowns(); // For desktop "Services" dropdown
        });
         // Fallback if header is already loaded by the time this script runs
        if (document.getElementById('header-placeholder')?.querySelector('header')) {
            this.handleMobileMenu();
            this.setActiveNavigationLink();
            this.initializeSearch();
            this.initializeDesktopDropdowns();
        }
    }

    static initializeAOS() {
        if (typeof AOS !== 'undefined') {
            AOS.init(config.aos);
        } else {
            console.warn('[AOS] AOS library not found. Animations will not work.');
        }
    }

    static setupScrollToTop() {
        const scrollBtn = document.getElementById('scrollToTopBtn');
        if (!scrollBtn) {
            console.warn("ScrollToTop button (scrollToTopBtn) not found.");
            return;
        }

        window.addEventListener('scroll', () => {
            if (window.scrollY > config.scrollToTopThreshold) {
                scrollBtn.classList.remove('hidden');
                scrollBtn.classList.add('flex');
            } else {
                scrollBtn.classList.add('hidden');
                scrollBtn.classList.remove('flex');
            }
        }, { passive: true });

        scrollBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: config.scrollBehavior
            });
        });
    }

    static setupImageLoadHandling() {
        document.querySelectorAll('img').forEach(img => {
            img.addEventListener('error', function() {
                // Prevent infinite loop if placeholder also fails
                if (this.src.includes('images/placeholder.jpg')) return;
                this.src = 'images/placeholder.jpg'; // Ensure this placeholder image exists
                this.alt = 'Image failed to load. Displaying placeholder.';
                console.warn(`Image failed to load: ${this.dataset.originalSrc || this.src}, replaced with placeholder.`);
            });
            // Store original src if needed for debugging, or if you have a more complex retry logic
            img.dataset.originalSrc = img.src;
        });
    }

    static handleMobileMenu() {
        const headerElement = document.getElementById('header-placeholder')?.querySelector('header');
        if (!headerElement) {
            console.warn("Header element not found for mobile menu setup.");
            return;
        }

        const mobileMenuButton = headerElement.querySelector('#mobile-menu-button');
        const mobileMenuPanel = headerElement.querySelector('#mobile-menu-panel');
        const iconMenuOpen = headerElement.querySelector('#icon-menu-open');
        const iconMenuClose = headerElement.querySelector('#icon-menu-close');

        if (!mobileMenuButton || !mobileMenuPanel || !iconMenuOpen || !iconMenuClose) {
            console.warn("Mobile menu toggle elements not fully found in header.");
            return;
        }

        mobileMenuButton.addEventListener('click', () => {
            const isPanelCurrentlyVisible = !mobileMenuPanel.classList.contains('hidden');
            mobileMenuPanel.classList.toggle('hidden');
            mobileMenuButton.setAttribute('aria-expanded', String(!isPanelCurrentlyVisible));
            document.body.classList.toggle('overflow-hidden', !isPanelCurrentlyVisible);
            iconMenuOpen.classList.toggle('hidden', !isPanelCurrentlyVisible);
            iconMenuClose.classList.toggle('hidden', isPanelCurrentlyVisible);
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768) { // md breakpoint
                if (!mobileMenuPanel.classList.contains('hidden')) {
                    mobileMenuPanel.classList.add('hidden');
                    mobileMenuButton.setAttribute('aria-expanded', 'false');
                    document.body.classList.remove('overflow-hidden');
                    iconMenuOpen.classList.remove('hidden');
                    iconMenuClose.classList.add('hidden');
                }
            }
        });

        // Handle mobile submenu accordions (if any, based on header.html structure)
        const mobileSubmenuToggles = mobileMenuPanel.querySelectorAll('.mobile-submenu-toggle'); // Example class
        mobileSubmenuToggles.forEach(toggle => {
            toggle.addEventListener('click', function() {
                const submenuId = this.getAttribute('aria-controls');
                const submenu = mobileMenuPanel.querySelector(`#${submenuId}`);
                const icon = this.querySelector('.mobile-submenu-icon'); // Example class

                if (submenu) {
                    const isExpanded = this.getAttribute('aria-expanded') === 'true';
                    if (isExpanded) {
                        submenu.style.maxHeight = null;
                        this.setAttribute('aria-expanded', 'false');
                        if (icon) icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
                    } else {
                        submenu.style.maxHeight = submenu.scrollHeight + "px";
                        this.setAttribute('aria-expanded', 'true');
                        if (icon) icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
                    }
                }
            });
        });
    }

    static initializeDesktopDropdowns() {
        const headerElement = document.getElementById('header-placeholder')?.querySelector('header');
        if (!headerElement) {
            console.warn("Header element not found for desktop dropdown setup.");
            return;
        }
        const dropdowns = headerElement.querySelectorAll('.dropdown'); // Class from header.html
        dropdowns.forEach(dropdown => {
            const trigger = dropdown.querySelector('button'); // Assuming button triggers dropdown
            const menu = dropdown.querySelector('.dropdown-menu');

            if (trigger && menu) {
                const toggle = (forceOpen) => {
                    const isOpen = typeof forceOpen === 'boolean' ? forceOpen : menu.classList.contains('hidden');
                    menu.classList.toggle('hidden', !isOpen);
                    trigger.setAttribute('aria-expanded', String(isOpen));
                    dropdown.classList.toggle('open', isOpen);
                };

                trigger.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggle(); // Toggle on click
                });

                dropdown.addEventListener('mouseenter', () => {
                    if (window.innerWidth >= 768) { // md breakpoint for desktop
                       toggle(true);
                    }
                });
                dropdown.addEventListener('mouseleave', () => {
                     if (window.innerWidth >= 768) {
                       toggle(false);
                    }
                });
                 // Close dropdown if clicked outside
                document.addEventListener('click', (e) => {
                    if (!dropdown.contains(e.target) && dropdown.classList.contains('open')) {
                        toggle(false);
                    }
                });
            }
        });
    }


    static setActiveNavigationLink() {
        const headerElement = document.getElementById('header-placeholder')?.querySelector('header');
        if (!headerElement) {
            console.warn("Header element not found for setting active navigation link.");
            return;
        }

        const currentPagePath = window.location.pathname;
        const currentPageFile = (currentPagePath.split('/').pop() || "index.html").split('#')[0].split('?')[0];
        const currentHash = window.location.hash;

        const navLinks = headerElement.querySelectorAll('nav a:not(.dropdown-menu a)'); // Exclude dropdown items for now
        const dropdownLinks = headerElement.querySelectorAll('.dropdown-menu a');

        const activeClasses = ['text-sky-400', 'font-semibold']; // Tailwind classes for active link
        const inactiveClasses = ['hover:text-sky-400', 'font-medium']; // Tailwind classes for inactive link

        const cleanLink = (link) => {
            link.classList.remove(...activeClasses);
            // Add inactive classes only if it's not a special button (like Contact Us)
            if (!link.classList.contains('bg-sky-500')) { // Example: Contact Us button
                link.classList.add(...inactiveClasses);
            }
            // For dropdown items, remove specific active background
            if (link.closest('.dropdown-menu')) {
                link.classList.remove('bg-slate-600');
            }
        };

        navLinks.forEach(cleanLink);
        dropdownLinks.forEach(cleanLink);

        navLinks.forEach(link => {
            const linkHref = link.getAttribute('href');
            if (!linkHref) return;
            const linkFile = (linkHref.split('/').pop() || "index.html").split('#')[0].split('?')[0];

            if (linkFile === currentPageFile && link.id !== 'nav-services-button') { // Exclude services button itself
                link.classList.add(...activeClasses);
                link.classList.remove(...inactiveClasses);
            }
        });

        let isServicePageActiveInDropdown = false;
        dropdownLinks.forEach(link => {
            const linkHref = link.getAttribute('href');
            if (!linkHref) return;
            const linkFile = (linkHref.split('/').pop() || "index.html").split('#')[0].split('?')[0];
            const linkHash = '#' + (linkHref.split('#')[1] || '');

            if (linkFile === currentPageFile && (linkHash === currentHash || (linkHash === '#' && !currentHash))) {
                link.classList.add(...activeClasses, 'bg-slate-600');
                link.classList.remove(...inactiveClasses);
                isServicePageActiveInDropdown = true;
            }
        });

        const servicesButtonDesktop = headerElement.querySelector('#nav-services-button');
        if (servicesButtonDesktop) {
            if (currentPageFile === "services.html" || isServicePageActiveInDropdown) {
                servicesButtonDesktop.classList.add(...activeClasses);
                servicesButtonDesktop.classList.remove(...inactiveClasses);
            } else {
                cleanLink(servicesButtonDesktop); // Ensure it's cleaned if no service link is active
            }
        }

        // Similar logic for mobile menu active states if structure differs significantly
        const mobileMenuPanel = headerElement.querySelector('#mobile-menu-panel');
        if (mobileMenuPanel) {
            const mobileLinks = mobileMenuPanel.querySelectorAll('a');
            mobileLinks.forEach(mlink => {
                cleanLink(mlink); // Clean first
                const linkHref = mlink.getAttribute('href');
                if (!linkHref) return;
                const linkFile = (linkHref.split('/').pop() || "index.html").split('#')[0].split('?')[0];
                const linkHash = '#' + (linkHref.split('#')[1] || '');

                if (linkFile === currentPageFile && (linkHash === currentHash || (linkHash === '#' && !currentHash))) {
                    mlink.classList.add(...activeClasses);
                    if (mlink.closest('#mobile-services-submenu-items')) { // Example ID for service submenu
                        mlink.classList.add('bg-slate-600');
                    }
                    mlink.classList.remove(...inactiveClasses);
                }
            });
        }
    }

    static initializeSearch() {
        const headerElement = document.getElementById('header-placeholder')?.querySelector('header');
        if (!headerElement) {
            console.warn("Header element not found for search initialization.");
            return;
        }

        const desktopSearchButton = headerElement.querySelector('#desktop-search-button');
        const desktopSearchContainer = headerElement.querySelector('#desktop-search-container');
        const desktopSearchInput = headerElement.querySelector('#desktop-search-input');
        const desktopSearchClose = headerElement.querySelector('#desktop-search-close');
        const desktopSearchWrapper = headerElement.querySelector('#desktop-search-wrapper'); // Parent of container

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
                    this.clearSearchHighlightsOnPage();
                });
            }

            document.addEventListener('click', (e) => {
                if (!desktopSearchContainer.classList.contains('hidden') && !desktopSearchWrapper.contains(e.target)) {
                    desktopSearchContainer.classList.add('hidden');
                    desktopSearchInput.value = '';
                    this.clearSearchHighlightsOnPage();
                }
            });

            desktopSearchInput.addEventListener('input', (event) => this.handleSearchInput(event.target.value));
            const desktopSearchForm = desktopSearchInput.closest('form');
            if (desktopSearchForm) desktopSearchForm.addEventListener('submit', e => e.preventDefault());

        } else {
            console.warn("Desktop search elements not fully found in header.");
        }

        const mobileSearchInput = headerElement.querySelector('#mobile-search-input');
        if (mobileSearchInput) {
            mobileSearchInput.addEventListener('input', (event) => this.handleSearchInput(event.target.value));
            const mobileSearchForm = mobileSearchInput.closest('form');
            if (mobileSearchForm) mobileSearchForm.addEventListener('submit', e => e.preventDefault());
        } else {
            console.warn("Mobile search input not found in header.");
        }
    }

    static handleSearchInput(query) {
        clearTimeout(this.searchDebounceTimer);
        this.searchDebounceTimer = setTimeout(() => {
            this.performSearchOnPage(query);
        }, config.searchDebounceTime);
    }

    static performSearchOnPage(query) {
        this.clearSearchHighlightsOnPage();
        const mainContent = document.querySelector('main#main-content-area'); // Target specific main
        if (!mainContent || !query || query.trim().length < 2) {
            return;
        }
        const queryLower = query.trim().toLowerCase();
        let matchCount = 0;
        let firstMatchElement = null;

        const treeWalker = document.createTreeWalker(mainContent, NodeFilter.SHOW_TEXT, {
            acceptNode: function (node) {
                const parentElement = node.parentElement;
                if (!parentElement || parentElement.closest('script, style, textarea, input, button, nav, footer, .search-form') || parentElement.classList.contains(App.SEARCH_HIGHLIGHT_CLASS)) {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        });

        const nodesToModify = [];
        while (treeWalker.nextNode()) {
            const node = treeWalker.currentNode;
            const text = node.nodeValue;
            const textLower = text.toLowerCase();
            let matchIndex = textLower.indexOf(queryLower);
            if (matchIndex !== -1) {
                nodesToModify.push({ node, text, queryLower, query });
            }
        }

        nodesToModify.forEach(({ node, text, queryLower, query }) => {
            const parent = node.parentNode;
            if (!parent) return;

            const fragment = document.createDocumentFragment();
            let lastIndex = 0;
            let textLower = text.toLowerCase(); // Re-evaluate for fresh indexOf
            let matchIndex = textLower.indexOf(queryLower, lastIndex);

            while (matchIndex > -1) {
                if (matchIndex > lastIndex) {
                    fragment.appendChild(document.createTextNode(text.substring(lastIndex, matchIndex)));
                }
                const matchedText = text.substring(matchIndex, matchIndex + query.length);
                const mark = document.createElement('mark');
                mark.className = App.SEARCH_HIGHLIGHT_CLASS; // Use static class member
                mark.textContent = matchedText;
                fragment.appendChild(mark);
                matchCount++;
                if (!firstMatchElement) firstMatchElement = mark;
                lastIndex = matchIndex + query.length;
                matchIndex = textLower.indexOf(queryLower, lastIndex);
            }

            if (lastIndex < text.length) {
                fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
            }
            parent.replaceChild(fragment, node);
        });


        if (firstMatchElement) {
            firstMatchElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    static clearSearchHighlightsOnPage() {
        const mainContent = document.querySelector('main#main-content-area');
        if (!mainContent) return;

        const highlightedElements = mainContent.querySelectorAll(`mark.${App.SEARCH_HIGHLIGHT_CLASS}`);
        highlightedElements.forEach(mark => {
            const parent = mark.parentNode;
            if (parent) {
                // Replace mark with its text content
                parent.replaceChild(document.createTextNode(mark.textContent), mark);
                parent.normalize(); // Merges adjacent text nodes
            }
        });
    }
}

// Initialize the App when the DOM is ready
// Using a more robust check for DOM readiness
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', App.init.bind(App));
} else {
    App.init.call(App); // Call with App as 'this' context
}

export default App; // If you plan to import App in other modules, e.g. for testing
    