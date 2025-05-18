/* ========================== */
    /* Optimized JavaScript Logic */
    /* Version: Fixed script load order for translations */
    /* ========================== */

    // --- Constants ---
    const HEADER_COMPONENT_URL = 'header.html';
    const FOOTER_COMPONENT_URL = 'footer.html';
    const POSTS_JSON_URL = 'posts.json'; // Expects title/excerpt as { vi: "...", en: "..." }
    const HEADER_PLACEHOLDER_ID = 'header-placeholder';
    const FOOTER_PLACEHOLDER_ID = 'footer-placeholder';
    const NEWS_CONTAINER_ID = 'news-container';
    const FOOTER_YEAR_ID = 'current-year';
    const SEARCH_HIGHLIGHT_CLASS = 'search-highlight';

    // --- State Flags ---
    let headerFooterLoadAttempted = false;
    let menuInitialized = false;
    let searchDebounceTimer = null;
    // window.languageInitialized and window.translations are managed by language.js

    // --- Utility Functions ---

    /**
     * Loads HTML content into a placeholder element.
     * @param {string} placeholderId - ID of the placeholder element.
     * @param {string} componentUrl - URL of the HTML component file.
     * @returns {Promise<HTMLElement | null>} Promise resolving with the updated placeholder element or null on error.
     */
    function loadComponent(placeholderId, componentUrl) {
        const placeholder = document.getElementById(placeholderId);
        if (!placeholder) {
            console.error(`[Script] Placeholder "${placeholderId}" not found.`);
            return Promise.resolve(null);
        }

        return fetch(componentUrl)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error ${response.status} loading ${componentUrl}`);
                return response.text();
            })
            .then(html => {
                const currentPlaceholder = document.getElementById(placeholderId);
                if (!currentPlaceholder) {
                    console.error(`[Script] Placeholder "${placeholderId}" disappeared during load.`);
                    return null;
                }
                currentPlaceholder.innerHTML = html;
                console.log(`[Script] Loaded ${componentUrl} into #${placeholderId}`);
                return currentPlaceholder;
            })
            .catch(error => {
                console.error(`[Script] Error loading ${componentUrl}:`, error);
                const currentPlaceholder = document.getElementById(placeholderId);
                if (currentPlaceholder) {
                    currentPlaceholder.innerHTML = `<p class="text-red-500 text-center p-4">Error loading component: ${error.message}</p>`;
                }
                return null;
            });
    }

    // --- Initialization Functions ---

    /**
     * Initializes header menu events, including search functionality.
     */
    function initializeHeaderMenuLogic() {
        if (menuInitialized) {
            console.warn("[Script] Menu already initialized. Skipping.");
            return;
        }

        const headerPlaceholder = document.getElementById(HEADER_PLACEHOLDER_ID);
        const headerElement = headerPlaceholder?.querySelector('#navbar');
        if (!headerElement) {
            console.error("[Script] Header (#navbar) not found. Cannot initialize menu.");
            return;
        }

        console.log("[Script] Initializing header menu logic (including search)...");

        // Cache DOM elements
        const mobileMenuButton = headerElement.querySelector('#mobile-menu-button');
        const mobileMenuPanel = headerElement.querySelector('#mobile-menu-panel');
        const mobileMenuOverlay = headerElement.querySelector('#mobile-menu-overlay');
        const iconMenu = headerElement.querySelector('#icon-menu');
        const iconClose = headerElement.querySelector('#icon-close');
        const mobileCloseButton = headerElement.querySelector('#mobile-close-button');
        const desktopLangDropdown = headerElement.querySelector('#desktop-language-dropdown');
        const desktopLangToggle = headerElement.querySelector('#desktop-lang-toggle');
        const mobileLangDropdown = headerElement.querySelector('#mobile-language-dropdown');
        const mobileLangToggle = headerElement.querySelector('#mobile-lang-toggle');
        const mobileMenuItems = headerElement.querySelectorAll('#mobile-menu-panel .mobile-menu-item');
        const desktopSearchButton = headerElement.querySelector('#desktop-search-button');
        const desktopSearchContainer = headerElement.querySelector('#desktop-search-container');
        const desktopSearchInput = headerElement.querySelector('#desktop-search-input');
        const desktopSearchClose = headerElement.querySelector('#desktop-search-close');
        const mobileSearchInput = headerElement.querySelector('#mobile-search');

        // --- Mobile Menu Toggle ---
        function toggleMobileMenu(forceOpenState) {
            if (!mobileMenuPanel || !mobileMenuOverlay || !iconMenu || !iconClose || !mobileMenuButton) return;
            const shouldBeOpen = typeof forceOpenState === 'boolean' ? forceOpenState : mobileMenuButton.getAttribute('aria-expanded') === 'false';
            mobileMenuButton.setAttribute('aria-expanded', shouldBeOpen.toString());
            iconMenu.classList.toggle('hidden', shouldBeOpen);
            iconClose.classList.toggle('hidden', !shouldBeOpen);
            requestAnimationFrame(() => {
                if (shouldBeOpen) {
                    mobileMenuOverlay.classList.remove('hidden'); mobileMenuPanel.classList.remove('hidden');
                    mobileMenuOverlay.classList.add('active'); mobileMenuPanel.classList.add('active');
                    document.body.classList.add('overflow-hidden');
                } else {
                    mobileMenuOverlay.classList.remove('active'); mobileMenuPanel.classList.remove('active');
                    document.body.classList.remove('overflow-hidden');
                    const hideAfterTransition = (event) => { if (event.target === mobileMenuPanel && !mobileMenuPanel.classList.contains('active')) { mobileMenuPanel.classList.add('hidden'); mobileMenuOverlay.classList.add('hidden'); } };
                    mobileMenuPanel.addEventListener('transitionend', hideAfterTransition, { once: true });
                    setTimeout(() => { if (!mobileMenuPanel.classList.contains('active')) { mobileMenuPanel.classList.add('hidden'); mobileMenuOverlay.classList.add('hidden'); } }, 350);
                }
            });
        }
        if (mobileMenuOverlay && mobileMenuPanel) { mobileMenuOverlay.classList.remove('active'); mobileMenuPanel.classList.remove('active'); }
        mobileMenuButton?.addEventListener('click', () => toggleMobileMenu());
        mobileCloseButton?.addEventListener('click', () => toggleMobileMenu(false));
        mobileMenuOverlay?.addEventListener('click', () => toggleMobileMenu(false));
        mobileMenuPanel?.querySelectorAll('a[href]').forEach(link => { if (!link.closest('.mobile-submenu-toggle')) { link.addEventListener('click', () => setTimeout(() => toggleMobileMenu(false), 50)); } });

        // --- Mobile Submenu Accordion ---
        mobileMenuItems.forEach(item => {
            const button = item.querySelector(':scope > button.mobile-submenu-toggle');
            const submenu = item.querySelector(':scope > .mobile-submenu');
            if (!button || !submenu) return;
            submenu.style.maxHeight = '0'; submenu.style.overflow = 'hidden'; button.setAttribute('aria-expanded', 'false');
            button.addEventListener('click', function(e) {
                e.stopPropagation(); const parentItem = this.closest('.mobile-menu-item'); if (!parentItem) return;
                const isOpen = parentItem.classList.toggle('open'); this.setAttribute('aria-expanded', isOpen);
                if (isOpen) {
                    submenu.style.maxHeight = `${submenu.scrollHeight}px`; submenu.style.overflow = 'visible';
                    const siblings = Array.from(parentItem.parentNode.children).filter(child => child !== parentItem && child.classList.contains('mobile-menu-item') && child.classList.contains('open'));
                    siblings.forEach(sibling => {
                        sibling.classList.remove('open'); const siblingSubmenu = sibling.querySelector(':scope > .mobile-submenu'); const siblingButton = sibling.querySelector(':scope > button.mobile-submenu-toggle');
                        if (siblingSubmenu) { siblingSubmenu.style.maxHeight = '0'; siblingSubmenu.style.overflow = 'hidden'; } siblingButton?.setAttribute('aria-expanded', 'false');
                    });
                } else {
                    submenu.style.maxHeight = '0'; submenu.style.overflow = 'hidden';
                    parentItem.querySelectorAll('.mobile-menu-item.open').forEach(nested => {
                        nested.classList.remove('open'); const nestedSub = nested.querySelector(':scope > .mobile-submenu'); const nestedButton = nested.querySelector(':scope > button.mobile-submenu-toggle');
                        if (nestedSub) { nestedSub.style.maxHeight = '0'; nestedSub.style.overflow = 'hidden'; } nestedButton?.setAttribute('aria-expanded', 'false');
                    });
                }
            });
        });

        // --- Language Dropdown Logic ---
        function toggleDropdown(dropdownContainer, forceState) {
            if (!dropdownContainer) return; const content = dropdownContainer.querySelector('.language-dropdown-content'); const toggleButton = dropdownContainer.querySelector('.dropdown-toggle'); if (!content || !toggleButton) return;
            const open = typeof forceState === 'boolean' ? forceState : !dropdownContainer.classList.contains('open');
            dropdownContainer.classList.toggle('open', open); toggleButton.setAttribute('aria-expanded', open); content.classList.toggle('hidden', !open);
        }
        desktopLangToggle?.addEventListener('click', e => { e.stopPropagation(); toggleDropdown(desktopLangDropdown); });
        mobileLangToggle?.addEventListener('click', e => { e.stopPropagation(); toggleDropdown(mobileLangDropdown); });
        window.addEventListener('click', event => {
            if (desktopLangDropdown?.classList.contains('open') && !desktopLangDropdown.contains(event.target)) { toggleDropdown(desktopLangDropdown, false); }
            if (mobileLangDropdown?.classList.contains('open') && !mobileLangDropdown.contains(event.target)) { const mobilePanel = document.getElementById('mobile-menu-panel'); if (mobilePanel && !mobilePanel.contains(event.target)) { toggleDropdown(mobileLangDropdown, false); } }
        });
        function handleLanguageChangeWrapper(event) {
            if (typeof handleLanguageChange === 'function') { handleLanguageChange(event); const dropdown = event.target.closest('.language-dropdown'); if (dropdown) toggleDropdown(dropdown, false); }
            else { console.error("[Script] handleLanguageChange not defined."); }
        }
        window.attachLanguageButtonListeners = () => {
            const langButtons = document.querySelectorAll('.lang-button');
            langButtons.forEach(button => { button.removeEventListener('click', handleLanguageChangeWrapper); button.addEventListener('click', handleLanguageChangeWrapper); });
            console.log(`[Script] Attached listeners to ${langButtons.length} language buttons.`);
        };

        // --- Search Functionality ---
        function toggleDesktopSearch(show) {
            if (!desktopSearchContainer || !desktopSearchButton || !desktopSearchInput) return;
            const isActive = desktopSearchContainer.classList.contains('active');
            const shouldShow = typeof show === 'boolean' ? show : !isActive;
            desktopSearchContainer.classList.toggle('active', shouldShow);
            desktopSearchContainer.classList.toggle('hidden', !shouldShow);
            desktopSearchButton.classList.toggle('hidden', shouldShow);
            if (shouldShow) { desktopSearchInput.focus(); }
            else { desktopSearchInput.value = ''; clearSearchHighlights(); }
        }
        desktopSearchButton?.addEventListener('click', (e) => { e.stopPropagation(); toggleDesktopSearch(true); });
        desktopSearchClose?.addEventListener('click', () => { toggleDesktopSearch(false); });
        window.addEventListener('click', (event) => { if (desktopSearchContainer?.classList.contains('active') && !desktopSearchContainer.contains(event.target) && event.target !== desktopSearchButton) { toggleDesktopSearch(false); } });
        const handleSearchInput = (event) => { clearTimeout(searchDebounceTimer); const query = event.target.value; searchDebounceTimer = setTimeout(() => { performSearch(query); }, 300); };
        desktopSearchInput?.addEventListener('input', handleSearchInput);
        mobileSearchInput?.addEventListener('input', handleSearchInput);
        desktopSearchInput?.closest('form')?.addEventListener('submit', e => e.preventDefault());
        mobileSearchInput?.closest('form')?.addEventListener('submit', e => e.preventDefault());

        // --- Initialize Other Header Features ---
        initializeStickyNavbar(headerElement);
        initializeActiveMenuHighlighting(headerElement);

        menuInitialized = true;
        console.log("[Script] Header menu logic initialized.");
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
                while (mark.firstChild) { parent.insertBefore(mark.firstChild, mark); }
                parent.removeChild(mark);
                parent.normalize();
            }
        });
    }

    /**
     * Performs a simple client-side search within the <main> element.
     * Highlights matching text using <mark> tags.
     * @param {string} query - The search query.
     */
    function performSearch(query) {
        clearSearchHighlights();
        const mainContent = document.querySelector('main');
        if (!mainContent || !query || query.trim().length < 2) return;

        const queryLower = query.trim().toLowerCase();
        console.log(`[Search] Performing search for: "${queryLower}"`);
        let matchCount = 0;
        let firstMatchElement = null;

        function searchNodes(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent;
                const textLower = text.toLowerCase();
                let lastIndex = 0;
                while (true) {
                    const matchIndex = textLower.indexOf(queryLower, lastIndex);
                    if (matchIndex === -1) break;
                    const matchText = text.substring(matchIndex, matchIndex + query.length);
                    const mark = document.createElement('mark');
                    mark.className = SEARCH_HIGHLIGHT_CLASS;
                    mark.textContent = matchText;
                    const after = node.splitText(matchIndex);
                    after.textContent = after.textContent.substring(query.length);
                    node.parentNode.insertBefore(mark, after);
                    matchCount++;
                    if (!firstMatchElement) firstMatchElement = mark;
                    node = after;
                    lastIndex = 0;
                }
            } else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE' && node.nodeName !== 'MARK') {
                Array.from(node.childNodes).forEach(searchNodes);
            }
        }

        searchNodes(mainContent);
        console.log(`[Search] Found ${matchCount} matches.`);
        if (firstMatchElement) {
            firstMatchElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }


    /**
     * Initializes sticky/shrinking navbar behavior.
     */
    function initializeStickyNavbar(navbarElement) {
        if (!navbarElement) return; console.log("[Script] Initializing sticky navbar..."); let lastScrollTop = 0; const shrinkThreshold = 50;
        const handleScroll = () => { let scrollTop = window.pageYOffset || document.documentElement.scrollTop; navbarElement.classList.toggle('shrink', scrollTop > shrinkThreshold); const initialHeight = parseInt(getComputedStyle(navbarElement).getPropertyValue('--header-height-initial') || '64', 10); const mobilePanel = document.getElementById('mobile-menu-panel'); if (scrollTop > lastScrollTop && scrollTop > initialHeight && (!mobilePanel || !mobilePanel.classList.contains('active'))) { navbarElement.style.top = `-${navbarElement.offsetHeight}px`; } else { navbarElement.style.top = '0'; } lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; };
        window.addEventListener('scroll', handleScroll, { passive: true }); handleScroll();
    }

    /**
     * Highlights the active menu item based on the current URL.
     */
    function initializeActiveMenuHighlighting(headerElement) {
        if (!headerElement) return; console.log("[Script] Initializing active menu highlighting..."); const currentHref = window.location.href.split('#')[0].split('?')[0]; const menuLinks = headerElement.querySelectorAll('.nav-link[href], .submenu a[href], #mobile-menu-panel a[href]');
        const normalizeUrl = url => { try { const urlObj = new URL(url, window.location.origin); let path = urlObj.pathname; if (path !== '/' && path.endsWith('/')) path = path.slice(0, -1); if (path.endsWith('.html')) path = path.slice(0, -'.html'.length); return path === '/index' || path === '' ? '/' : path; } catch (e) { console.warn(`[Script] Invalid URL: ${url}`); return null; } };
        const normalizedCurrentPath = normalizeUrl(currentHref); if (!normalizedCurrentPath) return;
        menuLinks.forEach(link => { link.classList.remove('active-menu-item'); const parentToggle = link.closest('.mobile-menu-item, .sub-submenu-container, .main-menu-item')?.querySelector(':scope > button.mobile-submenu-toggle, :scope > button.nav-link'); parentToggle?.classList.remove('active-parent-item'); });
        headerElement.querySelectorAll('#mobile-menu-panel .mobile-menu-item.open').forEach(item => { item.classList.remove('open'); const submenu = item.querySelector(':scope > .mobile-submenu'); if (submenu) { submenu.style.maxHeight = '0'; submenu.style.overflow = 'hidden'; } item.querySelector(':scope > button.mobile-submenu-toggle')?.setAttribute('aria-expanded', 'false'); });
        let bestMatch = { link: null, specificity: -1 }; menuLinks.forEach(link => { const linkHref = link.getAttribute('href'); if (!linkHref || linkHref === '#' || linkHref.startsWith('javascript:')) return; const normalizedLinkPath = normalizeUrl(linkHref); if (!normalizedLinkPath) return; let currentSpecificity = -1; try { const absoluteLinkHref = new URL(linkHref, window.location.origin).href.split('#')[0].split('?')[0]; if (absoluteLinkHref === currentHref) currentSpecificity = 2; } catch (e) {} if (currentSpecificity < 2 && normalizedLinkPath === normalizedCurrentPath) { currentSpecificity = normalizedCurrentPath === '/' ? 1 : 0; } if (currentSpecificity > bestMatch.specificity) { bestMatch = { link, specificity: currentSpecificity }; } else if (currentSpecificity === bestMatch.specificity && currentSpecificity >= 0) { const currentBestPath = normalizeUrl(bestMatch.link.getAttribute('href')); if (currentBestPath && normalizedLinkPath.length > currentBestPath.length) { bestMatch = { link, specificity: currentSpecificity }; } } });
        if (bestMatch.link) { const activeLink = bestMatch.link; activeLink.classList.add('active-menu-item'); let element = activeLink; while (element && element !== headerElement) { const parentMenuItem = element.closest('.mobile-menu-item, .sub-submenu-container, .main-menu-item'); if (!parentMenuItem) break; const parentToggle = parentMenuItem.querySelector(':scope > button.mobile-submenu-toggle, :scope > button.nav-link'); parentToggle?.classList.add('active-parent-item'); if (parentMenuItem.classList.contains('mobile-menu-item') && !parentMenuItem.classList.contains('open')) { parentMenuItem.classList.add('open'); const submenu = parentMenuItem.querySelector(':scope > .mobile-submenu'); if (submenu) { submenu.style.maxHeight = `${submenu.scrollHeight}px`; submenu.style.overflow = 'visible'; } parentToggle?.setAttribute('aria-expanded', 'true'); } element = parentMenuItem.parentElement; } }
    }


    /**
     * Loads and displays internal news from JSON, supporting multi-language structure.
     * Assumes posts.json has title/excerpt structured as { vi: "...", en: "..." }.
     */
    function loadInternalNews() {
        const newsContainer = document.getElementById(NEWS_CONTAINER_ID);
        if (!newsContainer) return;

        // FIXED: Check for window.translations AFTER language system is initialized
        if (typeof window.translations === 'undefined') {
            console.error("[Script] Translations object not found when loadInternalNews called.");
            // Display a generic loading message or wait, don't show translation error yet
            newsContainer.innerHTML = `<p class="text-gray-500 w-full text-center">Đang chuẩn bị dữ liệu...</p>`;
            return; // Exit if translations aren't ready
        }

        const currentLang = localStorage.getItem('preferredLanguage') || 'vi';
        const readMoreText = window.translations[currentLang]?.read_more || 'Read more →';
        const newsTitleNaText = window.translations[currentLang]?.news_title_na || 'Title Not Available';
        const newsImageAltText = window.translations[currentLang]?.news_image_alt || 'News image';
        const noNewsText = window.translations[currentLang]?.no_news || 'No news yet.';
        const newsLoadErrorText = window.translations[currentLang]?.news_load_error || 'Could not load news.';
        const loadingNewsText = window.translations[currentLang]?.loading_news || 'Loading news...';

        newsContainer.innerHTML = `<p class="text-gray-500 w-full text-center">${loadingNewsText}</p>`;

        fetch(POSTS_JSON_URL)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error ${response.status}`);
                return response.json();
            })
            .then(posts => {
                newsContainer.innerHTML = '';
                if (!Array.isArray(posts) || !posts.length) {
                    newsContainer.innerHTML = `<p class="text-gray-500 w-full text-center">${noNewsText}</p>`;
                    return;
                }

                posts.slice(0, 6).forEach(post => {
                    const postElement = document.createElement('div');
                    postElement.className = 'news-card flex-shrink-0 w-72 bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 scroll-snap-align-start';

                    const postTitle = post.title?.[currentLang] || post.title?.['vi'] || newsTitleNaText;
                    const postExcerpt = post.excerpt?.[currentLang] || post.excerpt?.['vi'] || '';
                    const imageAlt = post.title?.[currentLang] || post.title?.['vi'] || newsImageAltText;
                    const hotBadge = post.hot ? `<span class="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full z-10">HOT</span>` : '';
                    const imageSrc = post.image || 'https://placehold.co/300x200/e2e8f0/cbd5e1?text=Image';
                    let postDate = '';
                    if (post.date) {
                        try {
                            const dateObj = new Date(post.date.split(' ')[0]);
                            if (!isNaN(dateObj)) postDate = dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                        } catch (e) { console.warn(`[Script] Invalid date: ${post.date}`); }
                    }

                    postElement.innerHTML = `
                        <a href="${post.link || '#'}" class="block group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg h-full flex flex-col">
                            <div class="relative">
                                <img src="${imageSrc}" alt="${imageAlt}" class="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-110 group-focus:scale-110" loading="lazy" onerror="this.src='https://placehold.co/300x200/e2e8f0/cbd5e1?text=Load+Error';">
                                ${hotBadge}
                            </div>
                            <div class="p-4 flex flex-col flex-grow">
                                <h3 class="text-lg font-semibold text-gray-800 mb-2 group-hover:text-blue-600 group-focus:text-blue-600 transition-colors duration-200 line-clamp-2" title="${postTitle}">
                                    ${postTitle}
                                </h3>
                                <p class="text-sm text-gray-600 mb-3 line-clamp-3 flex-grow">${postExcerpt}</p>
                                <div class="flex justify-between items-center text-xs text-gray-500 mt-auto pt-2 border-t border-gray-100">
                                    <span>${postDate}</span>
                                    <span class="text-blue-500 font-medium group-hover:underline group-focus:underline">${readMoreText}</span>
                                </div>
                            </div>
                        </a>`;
                    newsContainer.appendChild(postElement);
                });
            })
            .catch(error => {
                console.error("[Script] Error loading news:", error);
                newsContainer.innerHTML = `<p class="text-red-500 w-full text-center">${newsLoadErrorText}</p>`;
            });
    }


    /**
     * Updates the current year in the footer.
     */
    function updateFooterYear() {
        const yearElement = document.getElementById(FOOTER_YEAR_ID);
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
            console.log("[Script] Footer year updated.");
        } else {
            console.warn(`[Script] Footer year element (#${FOOTER_YEAR_ID}) not found.`);
        }
    }


    // --- Main Execution Flow ---
    document.addEventListener('DOMContentLoaded', () => {
        console.log("[Script] DOM loaded. Starting initializations...");

        const headerPromise = loadComponent(HEADER_PLACEHOLDER_ID, HEADER_COMPONENT_URL);
        const footerPromise = loadComponent(FOOTER_PLACEHOLDER_ID, FOOTER_COMPONENT_URL);

        Promise.all([headerPromise, footerPromise]).then(([headerPlaceholder, footerPlaceholder]) => {
            headerFooterLoadAttempted = true;
            const headerLoaded = !!headerPlaceholder;
            const footerLoaded = !!footerPlaceholder;
            console.log(`[Script] Header: ${headerLoaded}, Footer: ${footerLoaded}`);

            if (headerLoaded) initializeHeaderMenuLogic(); // Initializes menu AND search
            if (footerLoaded) updateFooterYear();

            // Initialize language system AFTER components are loaded
            // Use a small delay to increase chance language.js has executed
            setTimeout(() => {
                if (typeof initializeLanguage === 'function') {
                    if (!window.languageInitialized) {
                        console.log("[Script] Initializing language system...");
                        initializeLanguage(); // This will call setLanguage, which calls applyTranslations and loadInternalNews
                        window.attachLanguageButtonListeners?.(); // Attach listeners after init
                    } else {
                        console.log("[Script] Language already initialized, re-applying translations/listeners...");
                        const currentLang = localStorage.getItem('preferredLanguage') || 'vi';
                        if (typeof applyTranslations === 'function') applyTranslations(currentLang);
                        if (document.getElementById(NEWS_CONTAINER_ID)) loadInternalNews();
                        window.attachLanguageButtonListeners?.();
                    }
                } else {
                    console.error("[Script] initializeLanguage function not found. Language features disabled.");
                    if (document.getElementById(NEWS_CONTAINER_ID)) {
                        console.warn("[Script] Language system failed, attempting to load news with default language.");
                        window.translations = { vi: { read_more: 'Đọc thêm →', news_title_na: 'Tiêu đề không có sẵn', news_image_alt: 'Hình ảnh tin tức', no_news: 'Chưa có tin tức nào.', news_load_error: 'Không thể tải tin tức.', loading_news: 'Đang tải tin tức...' } };
                        loadInternalNews();
                    }
                }

                // Add the new logic here
                if (typeof window.attachLanguageSwitcherEvents === 'function') {
                    console.log("[Script] Attaching language switcher events from language.js...");
                    window.attachLanguageSwitcherEvents();
                } else {
                    console.error("[Script] window.attachLanguageSwitcherEvents function not found from language.js.");
                }
            }, 100); // Increased delay slightly
        });

        // --- Page-Specific Initializations (Run after DOMContentLoaded, potentially before language is fully ready) ---
        const bodyId = document.body.id;

        // REMOVED initial call to loadInternalNews here - it's now handled by language initialization

        if (document.getElementById('vnexpress-rss-feed')) {
            console.log("[Script] RSS container found.");
            // rss-loader.js handles its own logic
        }

        if (bodyId === 'page-placement' && typeof initializePlacementTest === 'function') {
            console.log("[Script] Initializing placement test...");
            initializePlacementTest();
        }

        console.log("[Script] Initial execution completed.");
    });
    document.addEventListener("DOMContentLoaded", function () {
        const themeToggleBtn = document.getElementById("theme-toggle");
        const currentTheme = localStorage.getItem("theme") || "light";
    
        // Áp dụng theme hiện tại
        document.body.classList.add(currentTheme + "-mode");
        themeToggleBtn.textContent = currentTheme === "light" ? "Chế độ tối" : "Chế độ sáng";
    
        // Xử lý sự kiện khi nhấn nút
        themeToggleBtn.addEventListener("click", function () {
        const isLightMode = document.body.classList.contains("light-mode");
    
        // Chuyển đổi giữa light-mode và dark-mode
        document.body.classList.toggle("light-mode", !isLightMode);
        document.body.classList.toggle("dark-mode", isLightMode);
    
        // Cập nhật nút và lưu trạng thái vào localStorage
        const newTheme = isLightMode ? "dark" : "light";
        themeToggleBtn.textContent = newTheme === "light" ? "Chế độ tối" : "Chế độ sáng";
        localStorage.setItem("theme", newTheme);
        });
    });