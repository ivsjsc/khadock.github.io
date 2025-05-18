
    // Function to initialize header functionality (menu toggle, scroll, etc.)
    function initializeHeaderScript() {
        const navbar = document.getElementById('navbar');
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileCloseButton = document.getElementById('mobile-close-button');
        const mobileMenuPanel = document.getElementById('mobile-menu-panel');
        const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
        const iconMenu = document.getElementById('icon-menu');
        const iconClose = document.getElementById('icon-close');
        // Correctly scope the querySelectorAll to the mobile panel
        const mobileSubmenuToggles = document.querySelectorAll('#mobile-menu-panel .mobile-submenu-toggle');
        const desktopLangToggle = document.getElementById('desktop-lang-toggle');
        const desktopLangOptions = document.getElementById('desktop-lang-options');
        const desktopLanguageDropdown = document.getElementById('desktop-language-dropdown');
        const mobileLangToggle = document.getElementById('mobile-lang-toggle');
        const mobileLangOptions = document.getElementById('mobile-lang-options');
        const mobileLanguageDropdown = document.getElementById('mobile-language-dropdown');
        // Select ALL language buttons, including those inside the header
        const langButtons = document.querySelectorAll('#navbar .lang-button');
        const desktopCurrentLang = document.getElementById('desktop-current-lang');
        const mobileCurrentLang = document.getElementById('mobile-current-lang');
        const body = document.body;

        // --- Debug: Log selected elements ---
        // console.log("Navbar:", navbar);
        // console.log("Mobile Menu Button:", mobileMenuButton);
        // console.log("Mobile Menu Panel:", mobileMenuPanel);
        // console.log("Mobile Menu Overlay:", mobileMenuOverlay);
        // console.log("Mobile Submenu Toggles:", mobileSubmenuToggles); // Check if buttons are found
        // --- End Debug ---


        if (!navbar || !mobileMenuButton || !mobileMenuPanel || !mobileMenuOverlay) {
            console.error("Header elements not found. Script initialization aborted.");
            return; // Exit if essential elements are missing
        }

        let isMobileMenuOpen = false;
        let isDesktopLangOpen = false;
        let isMobileLangOpen = false;

         function openMobileMenu() {
             requestAnimationFrame(() => {
                 mobileMenuPanel.classList.add('active'); // Show panel
                 mobileMenuOverlay.classList.add('active'); // Show overlay
             });
             if (iconMenu) iconMenu.classList.add('hidden');
             if (iconClose) iconClose.classList.remove('hidden');
             if (mobileMenuButton) mobileMenuButton.setAttribute('aria-expanded', 'true');
             body.classList.add('overflow-hidden');
             isMobileMenuOpen = true;
             mobileMenuPanel.focus(); // Focus the panel for accessibility
         }

         function closeMobileMenu() {
             mobileMenuPanel.classList.remove('active'); // Hide panel
             mobileMenuOverlay.classList.remove('active'); // Hide overlay

             if (iconMenu) iconMenu.classList.remove('hidden');
             if (iconClose) iconClose.classList.add('hidden');
             if (mobileMenuButton) mobileMenuButton.setAttribute('aria-expanded', 'false');
             body.classList.remove('overflow-hidden');
             isMobileMenuOpen = false;

             if (mobileSubmenuToggles) {
                 mobileSubmenuToggles.forEach(toggle => {
                     const submenuId = toggle.getAttribute('aria-controls');
                     const submenu = document.getElementById(submenuId);
                     // Also close nested submenus if the parent is closing
                     const parentItem = toggle.closest('.mobile-menu-item');
                     if (parentItem && parentItem.classList.contains('open')) {
                         parentItem.classList.remove('open');
                     }
                     if (submenu) {
                         submenu.classList.remove('open'); // Use 'open' class for state
                         submenu.style.maxHeight = '0'; // Collapse using max-height
                         toggle.setAttribute('aria-expanded', 'false'); // Reset aria attribute
                     }
                 });
             }
             if (mobileMenuButton) mobileMenuButton.focus(); // Return focus
         }


        function toggleMobileSubmenu(toggleButton) {
            const submenuId = toggleButton.getAttribute('aria-controls');
            const submenu = document.getElementById(submenuId);
            const parentItem = toggleButton.closest('.mobile-menu-item'); // Get the parent li/div

            // console.log("Toggling submenu for button:", toggleButton);
            // console.log("Submenu ID:", submenuId, "Found element:", submenu);
            // console.log("Parent Item:", parentItem);


            if (submenu && parentItem) {
                const isExpanded = parentItem.classList.toggle('open'); // Toggle state on parent
                toggleButton.setAttribute('aria-expanded', String(isExpanded)); // Update aria state

                if(isExpanded) {
                    // Calculate height and set max-height for opening animation
                    submenu.style.maxHeight = submenu.scrollHeight + "px";
                    submenu.classList.add('open'); // Add open class
                    // Close sibling submenus at the same level
                    const siblings = Array.from(parentItem.parentNode.children)
                                        .filter(child => child !== parentItem && child.classList.contains('mobile-menu-item') && child.classList.contains('open'));
                    siblings.forEach(sibling => {
                        sibling.classList.remove('open');
                        const siblingSubmenu = sibling.querySelector(':scope > .mobile-submenu');
                        const siblingButton = sibling.querySelector(':scope > button.mobile-submenu-toggle');
                        if(siblingSubmenu) siblingSubmenu.style.maxHeight = '0';
                        if(siblingButton) siblingButton.setAttribute('aria-expanded', 'false');
                    });

                } else {
                    // Collapse the current submenu
                    submenu.style.maxHeight = '0';
                    submenu.classList.remove('open');
                    // Also collapse any nested submenus within this one
                    parentItem.querySelectorAll('.mobile-menu-item.open').forEach(nestedOpenItem => {
                         nestedOpenItem.classList.remove('open');
                         const nestedSubmenu = nestedOpenItem.querySelector(':scope > .mobile-submenu');
                         const nestedButton = nestedOpenItem.querySelector(':scope > button.mobile-submenu-toggle');
                         if(nestedSubmenu) nestedSubmenu.style.maxHeight = '0';
                         if(nestedButton) nestedButton.setAttribute('aria-expanded', 'false');
                    });
                }
                 // console.log("Submenu toggled. Parent open:", isExpanded, "Submenu max-height:", submenu.style.maxHeight);
            } else {
                 console.error("Submenu element or parent item not found for ID:", submenuId);
            }
        }


        function handleScroll() {
            const isScrolled = window.scrollY > 50;
            if (navbar) navbar.classList.toggle('scrolled', isScrolled);
            body.classList.toggle('header-scrolled', isScrolled);
            document.documentElement.classList.toggle('header-scrolled', isScrolled);
        }

        function toggleDesktopLang() {
            if (!desktopLangToggle || !desktopLangOptions) return;
            isDesktopLangOpen = !isDesktopLangOpen;
            desktopLangOptions.classList.toggle('hidden', !isDesktopLangOpen);
            desktopLangToggle.setAttribute('aria-expanded', isDesktopLangOpen);
            if (isDesktopLangOpen) {
                desktopLangOptions.querySelector('button')?.focus();
            } else {
                desktopLangToggle.focus();
            }
        }

        function toggleMobileLang() {
            if (!mobileLangToggle || !mobileLangOptions) return;
            isMobileLangOpen = !isMobileLangOpen;
            mobileLangOptions.classList.toggle('hidden', !isMobileLangOpen);
            mobileLangToggle.setAttribute('aria-expanded', isMobileLangOpen);
            if (isMobileLangOpen) {
                mobileLangOptions.querySelector('button')?.focus();
            } else {
                mobileLangToggle.focus();
            }
        }

        function setLanguage(lang) {
            console.log(`Language selected: ${lang}`);
            if (desktopCurrentLang) desktopCurrentLang.textContent = lang.toUpperCase();
            if (mobileCurrentLang) mobileCurrentLang.textContent = lang.toUpperCase();

            if (isDesktopLangOpen) toggleDesktopLang();
            if (isMobileLangOpen) toggleMobileLang();
            // Placeholder for actual language switching logic
            // if (typeof window.updateContentLanguage === 'function') {
            //     window.updateContentLanguage(lang);
            // }
        }

        // --- Event Listeners ---
        if (mobileMenuButton) {
            mobileMenuButton.addEventListener('click', openMobileMenu);
        }
        if (mobileCloseButton) {
            mobileCloseButton.addEventListener('click', closeMobileMenu);
        }
        if (mobileMenuOverlay) {
            mobileMenuOverlay.addEventListener('click', closeMobileMenu);
        }

        // --- Attach listener to submenu toggles ---
        if (mobileSubmenuToggles) {
            mobileSubmenuToggles.forEach(toggle => {
                toggle.addEventListener('click', (e) => {
                    // console.log("Mobile submenu toggle clicked:", e.currentTarget);
                    e.stopPropagation(); // Prevent closing the main menu
                    toggleMobileSubmenu(e.currentTarget); // Pass the clicked button
                });
            });
        } else {
             console.error("Could not find any mobile submenu toggles.");
        }
        // --- End Submenu Listener ---


        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial check

        if (desktopLangToggle && desktopLanguageDropdown) {
            desktopLangToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleDesktopLang();
            });
        }

        if (mobileLangToggle && mobileLanguageDropdown) {
            mobileLangToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleMobileLang();
            });
        }

        if (langButtons) {
            langButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    setLanguage(button.getAttribute('data-lang'));
                });
            });
        }

        document.addEventListener('click', (event) => {
            if (isDesktopLangOpen && desktopLanguageDropdown && !desktopLanguageDropdown.contains(event.target)) {
                toggleDesktopLang();
            }
            if (isMobileLangOpen && mobileLanguageDropdown && !mobileLanguageDropdown.contains(event.target)) {
                if (!mobileLangToggle || !mobileLangToggle.contains(event.target)) {
                    toggleMobileLang();
                }
            }
        });

        if (mobileMenuPanel) {
            mobileMenuPanel.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && isMobileMenuOpen) {
                    closeMobileMenu();
                }
            });
        }

        function handleDropdownKeys(e, toggleFunc, optionsContainer, toggleButton) {
            if (!optionsContainer || !toggleButton) return;
            if (e.key === 'Escape') {
                toggleFunc();
            } else if (e.key === 'Tab') {
                const focusableElements = Array.from(optionsContainer.querySelectorAll('button'));
                if (focusableElements.length === 0) return;
                if (!e.shiftKey && document.activeElement === focusableElements[focusableElements.length - 1]) {
                    toggleButton.focus();
                    e.preventDefault();
                } else if (e.shiftKey && document.activeElement === focusableElements[0]) {
                    toggleButton.focus();
                    e.preventDefault();
                }
            }
        }

        if (desktopLangOptions && desktopLangToggle) {
            desktopLangOptions.addEventListener('keydown', (e) => handleDropdownKeys(e, toggleDesktopLang, desktopLangOptions, desktopLangToggle));
        }
        if (mobileLangOptions && mobileLangToggle) {
            mobileLangOptions.addEventListener('keydown', (e) => handleDropdownKeys(e, toggleMobileLang, mobileLangOptions, mobileLangToggle));
        }

        console.log("Header script initialized successfully.");
    }

    // Initialize the script once the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeHeaderScript);
    } else {
        initializeHeaderScript(); // DOMContentLoaded has already fired
    }
    
    // --- End Header Script ---