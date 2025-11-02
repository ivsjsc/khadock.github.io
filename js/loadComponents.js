async function loadComponent(placeholderId, filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to load component from ${filePath}: ${response.statusText}`);
        }
        const html = await response.text();
        const placeholder = document.getElementById(placeholderId);
        if (placeholder) {
            placeholder.innerHTML = html;
            document.dispatchEvent(new CustomEvent(`${placeholderId}Loaded`, { detail: { placeholderId, filePath } }));
        } else {
            console.error(`[Script] Placeholder element with id '${placeholderId}' not found.`);
        }
    } catch (error) {
        console.error(`[Script] Error loading component from ${filePath}:`, error);
        const placeholder = document.getElementById(placeholderId);
        if (placeholder) {
            placeholder.innerHTML = `<p style="color: red;">Error loading component: ${error.message || error}</p>`;
        }
    }
}

export async function loadAppComponents(callback) {
    // Đã thay đổi đường dẫn từ tuyệt đối sang tương đối
    const HEADER_COMPONENT_URL = 'components/header.html';
    const FOOTER_COMPONENT_URL = 'components/footer.html';
    const FAB_COMPONENT_URL = 'components/fab-container.html';

    await Promise.all([
        loadComponent('header-placeholder', HEADER_COMPONENT_URL),
        loadComponent('footer-placeholder', FOOTER_COMPONENT_URL),
        loadComponent('fab-container-placeholder', FAB_COMPONENT_URL)
    ]);

    if (typeof callback === 'function') {
        callback();
    }
    document.dispatchEvent(new CustomEvent('allAppComponentsLoaded'));
}

// After all components are loaded, initialize features
document.addEventListener('allAppComponentsLoaded', () => {
    try {
        if (typeof initializeHeaderFeatures === 'function') initializeHeaderFeatures();
        if (typeof initializeFooterFeatures === 'function') initializeFooterFeatures();
    } catch (err) {
        console.error('Error initializing components features:', err);
    }
});

function initializeHeaderFeatures() {
    const handled = initializeKdMobileMenu();
    if (!handled) {
        initializeMobileMenu();
    }
    highlightActivePage();

    const headerDarkModeToggle = document.getElementById('dark-mode-toggle');
    const mobileHeaderDarkModeToggle = document.getElementById('mobile-dark-mode-toggle');

    function updateToggleIcon(button, isDark) {
        if (button && button.querySelector('i')) {
            button.querySelector('i').className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        }
        if (button && button.id === 'mobile-dark-mode-toggle' && button.querySelector('span.ml-2')) {
            button.querySelector('span.ml-2').textContent = isDark ? 'Light' : 'Dark';
        }
    }

    function setupThemeToggleListener(button) {
        if (button) {
            button.addEventListener('click', () => {
                const isDarkMode = document.documentElement.classList.toggle('dark');
                localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
                updateToggleIcon(headerDarkModeToggle, isDarkMode);
                updateToggleIcon(mobileHeaderDarkModeToggle, isDarkMode);
            });
        }
    }
    setupThemeToggleListener(headerDarkModeToggle);
    setupThemeToggleListener(mobileHeaderDarkModeToggle);

    const isCurrentlyDark = document.documentElement.classList.contains('dark');
    updateToggleIcon(headerDarkModeToggle, isCurrentlyDark);
    updateToggleIcon(mobileHeaderDarkModeToggle, isCurrentlyDark);

    document.dispatchEvent(new Event('headerLoaded'));
}

// Lightweight in-page translation helper.
// Elements that should be translated must have a data-i18n="key" attribute.
function updateLanguage(lang) {
    const translations = {
        en: {
            home: 'Home', services: 'Services', projects: 'Projects', design: 'Design', about: 'About Us', contact: 'Contact', subscribe: 'Subscribe'
        }
    };

    const map = translations[lang] || translations.en;
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (!key) return;
        const text = map[key];
        if (text !== undefined) {
            // Prefer replacing textContent; if HTML needed, site can use data-i18n-html
            el.textContent = text;
        }
    });

    // Support translating placeholders on inputs with data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(inp => {
        const key = inp.getAttribute('data-i18n-placeholder');
        if (!key) return;
        const text = map[key];
        if (text !== undefined && inp.placeholder !== undefined) {
            inp.placeholder = text;
        }
    });
}

// After components load, apply stored language if any
document.addEventListener('headerLoaded', () => {
    const saved = localStorage.getItem('language') || 'en';
    updateLanguage(saved);
});

function initializeFooterFeatures() {
    const currentYearSpan = document.getElementById('current-year'); // Đã sửa ID ở đây
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    const newsletterForm = document.getElementById('newsletter-form'); // Đã sửa ID ở đây
    const newsletterEmail = document.getElementById('newsletter-email'); // Đã sửa ID ở đây
    const newsletterMessage = document.getElementById('newsletter-message'); // Đã sửa ID ở đây

    if (newsletterForm && newsletterEmail && newsletterMessage) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitButton = newsletterForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;

            const getTranslation = (key, fallback) => {
                const langKey = key.replace(/_/g, '-') + '-text-key';
                return submitButton.dataset[langKey] || fallback;
            };

            const translations = {
                processing: getTranslation('newsletter_processing', 'Processing...'),
                success: getTranslation('newsletter_success', 'Thank you for subscribing! Please check your email to confirm.'),
                error: getTranslation('newsletter_error', 'An error occurred. Please try again later.'),
                invalidEmail: getTranslation('newsletter_invalid_email', 'Please enter a valid email address.')
            };

            newsletterMessage.textContent = '';
            newsletterMessage.className = 'text-sm mt-3';

            if (!newsletterEmail.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail.value)) {
                newsletterMessage.textContent = translations.invalidEmail;
                newsletterMessage.className = 'text-sm mt-3 text-red-500 dark:text-red-400';
                return;
            }

            submitButton.disabled = true;
            submitButton.textContent = translations.processing;

            try {
                const response = await fetch(newsletterForm.action, {
                    method: 'POST',
                    body: new FormData(newsletterForm),
                    headers: { 'Accept': 'application/json' }
                });
                if (response.ok) {
                    newsletterMessage.textContent = translations.success;
                    newsletterMessage.className = 'text-sm mt-3 text-green-500 dark:text-green-400';
                    newsletterEmail.value = '';
                } else {
                    const data = await response.json().catch(() => ({}));
                    newsletterMessage.textContent = data.error || translations.error;
                    newsletterMessage.className = 'text-sm mt-3 text-red-500 dark:text-red-400';
                }
            } catch (error) {
                console.error('[Script] Error submitting newsletter:', error);
                newsletterMessage.textContent = translations.error;
                newsletterMessage.className = 'text-sm mt-3 text-red-500 dark:text-red-400';
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        });
    }
}

function initializeKdMobileMenu() {
    const mobileToggle = document.getElementById('kd-mobile-toggle');
    const mobileMenu = document.getElementById('kd-mobile-menu');

    if (!mobileToggle || !mobileMenu) {
        return false;
    }

    if (mobileToggle.dataset.menuInitialized === 'true') {
        return true;
    }

    const servicesToggle = document.getElementById('mobile-services-toggle');
    const servicesMenu = document.getElementById('mobile-services-menu-content');
    const servicesIcon = document.getElementById('mobile-services-icon');
    const menuLinks = mobileMenu.querySelectorAll('[data-mobile-menu-link]');

    function openMobileMenu() {
        mobileMenu.classList.remove('hidden');
        requestAnimationFrame(() => {
            mobileMenu.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');
            mobileMenu.classList.add('opacity-100', 'translate-y-0');
            mobileMenu.setAttribute('aria-hidden', 'false');
        });
        mobileToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
        const firstItem = mobileMenu.querySelector('a, button');
        if (firstItem) {
            setTimeout(() => firstItem.focus(), 150);
        }
    }

    function closeMobileMenu() {
        mobileMenu.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
        mobileMenu.classList.remove('opacity-100', 'translate-y-0');
        mobileMenu.setAttribute('aria-hidden', 'true');
        mobileToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        setTimeout(() => {
            if (mobileMenu.getAttribute('aria-hidden') === 'true') {
                mobileMenu.classList.add('hidden');
            }
        }, 200);
        mobileToggle.focus({ preventScroll: true });
    }

    mobileToggle.addEventListener('click', () => {
        const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
        if (isExpanded) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });

    document.addEventListener('click', (event) => {
        if (mobileMenu.classList.contains('hidden')) return;
        if (!mobileMenu.contains(event.target) && !mobileToggle.contains(event.target)) {
            closeMobileMenu();
        }
    });

    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileToggle.getAttribute('aria-expanded') === 'true') {
                closeMobileMenu();
            }
        });
    });

    if (servicesToggle && servicesMenu) {
        servicesToggle.addEventListener('click', () => {
            const isExpanded = servicesToggle.getAttribute('aria-expanded') === 'true';
            if (isExpanded) {
                servicesToggle.setAttribute('aria-expanded', 'false');
                servicesMenu.style.maxHeight = '0px';
                servicesMenu.classList.remove('open');
                if (servicesIcon) servicesIcon.style.transform = 'rotate(0deg)';
            } else {
                servicesToggle.setAttribute('aria-expanded', 'true');
                servicesMenu.classList.add('open');
                servicesMenu.style.maxHeight = servicesMenu.scrollHeight + 'px';
                if (servicesIcon) servicesIcon.style.transform = 'rotate(180deg)';
            }
        });
    }

    mobileToggle.dataset.menuInitialized = 'true';
    if (typeof window !== 'undefined') {
        window.kdCloseMobileMenu = closeMobileMenu;
        window.kdOpenMobileMenu = openMobileMenu;
    }
    return true;
}

function initializeMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenuPanel = document.getElementById('mobile-menu-panel');
    const iconMenuOpen = document.getElementById('icon-menu-open');
    const iconMenuClose = document.getElementById('icon-menu-close');

    if (!mobileMenuButton || !mobileMenuPanel) {
        return false;
    }
    
    // Tránh khởi tạo lại sự kiện nếu đã được gán
    if (mobileMenuButton.__menuInitialized) return;


    function openMobileMenu() {
        mobileMenuPanel.classList.add('open');
        mobileMenuButton.setAttribute('aria-expanded', 'true');
        if (iconMenuOpen && iconMenuClose) {
            iconMenuOpen.classList.add('hidden');
            iconMenuClose.classList.remove('hidden');
        }
        document.body.style.overflow = 'hidden'; // Ngăn cuộn trang khi menu mở
        const firstMenuItem = mobileMenuPanel.querySelector('a, button');
        if (firstMenuItem) {
            setTimeout(() => firstMenuItem.focus(), 100); // Tập trung vào phần tử đầu tiên để cải thiện khả năng truy cập
        }
    }

    function closeMobileMenu() {
        mobileMenuPanel.classList.remove('open');
        mobileMenuButton.setAttribute('aria-expanded', 'false');
        if (iconMenuOpen && iconMenuClose) {
            iconMenuOpen.classList.remove('hidden');
            iconMenuClose.classList.add('hidden');
        }
        document.body.style.overflow = ''; // Cho phép cuộn trang trở lại
        mobileMenuButton.focus(); // Trả lại tiêu điểm cho nút menu
    }

    mobileMenuButton.addEventListener('click', function() {
        const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
        if (isExpanded) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });

    // Đóng menu khi nhấp ra ngoài panel
    mobileMenuPanel.addEventListener('click', function(e) {
        if (e.target === mobileMenuPanel) {
            closeMobileMenu();
        }
    });
    
    // Đóng menu khi nhấp vào một liên kết trong menu mobile (trừ submenu toggle)
    const mobileMenuLinks = mobileMenuPanel.querySelectorAll('a');
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Đảm bảo không đóng menu nếu click vào nút mở submenu
            if (!e.target.closest('.mobile-submenu-toggle')) {
                 if (mobileMenuPanel.classList.contains('open')) {
                    closeMobileMenu();
                }
            }
        });
    });

    // Đóng menu khi nhấn phím Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileMenuPanel.classList.contains('open')) {
            closeMobileMenu();
        }
    });

    // Khởi tạo các nút chuyển đổi submenu
    initializeSubmenuToggles();

    // Gán hàm vào window để có thể truy cập từ các script khác (nếu cần)
    window.closeMobileMenu = closeMobileMenu;
    window.openMobileMenu = openMobileMenu;
    mobileMenuButton.__menuInitialized = true; // Đánh dấu đã khởi tạo
    return true;
}


function initializeSubmenuToggles() {
    const submenuToggles = document.querySelectorAll('.mobile-submenu-toggle');
    submenuToggles.forEach(toggle => {
        // Tránh khởi tạo lại sự kiện nếu đã được gán
        if (toggle.__submenuInitialized) return;

        toggle.addEventListener('click', function() {
            const submenuId = this.getAttribute('aria-controls');
            const submenu = document.getElementById(submenuId);
            const icon = this.querySelector('.mobile-submenu-icon');
            const isExpanded = this.getAttribute('aria-expanded') === 'true';

            if (!submenu) return;

            if (isExpanded) {
                this.setAttribute('aria-expanded', 'false');
                submenu.classList.remove('open');
                submenu.style.maxHeight = '0'; // Đặt lại chiều cao để ẩn
                if (icon) icon.style.transform = 'rotate(0deg)'; // Xoay lại icon
            } else {
                // Đóng tất cả các submenu khác trước khi mở submenu hiện tại
                submenuToggles.forEach(otherToggle => {
                    if (otherToggle !== this) {
                        const otherId = otherToggle.getAttribute('aria-controls');
                        const otherSubmenu = document.getElementById(otherId);
                        const otherIcon = otherToggle.querySelector('.mobile-submenu-icon');
                        otherToggle.setAttribute('aria-expanded', 'false');
                        if (otherSubmenu) {
                            otherSubmenu.classList.remove('open');
                            otherSubmenu.style.maxHeight = '0';
                        }
                        if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
                    }
                });
                this.setAttribute('aria-expanded', 'true');
                submenu.classList.add('open');
                submenu.style.maxHeight = submenu.scrollHeight + 'px'; // Mở rộng chiều cao
                if (icon) icon.style.transform = 'rotate(180deg)'; // Xoay icon
            }
        });
        toggle.__submenuInitialized = true; // Đánh dấu đã khởi tạo
    });
}

function highlightActivePage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('#kd-mobile-menu [data-mobile-menu-link], .nav-links a[href], .bottom-nav-item[href], #mobile-menu-panel a[href]');
    navLinks.forEach(link => {
        link.classList.remove('text-sky-300', 'bg-slate-600', 'active'); // Xóa các lớp active cũ
        const hrefAttr = link.getAttribute('href');
        if (!hrefAttr) return;
        const href = hrefAttr.split('/').pop();
        if (href === currentPage || (currentPage === 'index.html' && (href === '' || href === 'index.html'))) {
            if(link.closest('#mobile-menu-panel')) { // Kiểm tra nếu là menu mobile
                link.classList.add('text-sky-300', 'bg-slate-600');
            } else if (link.closest('.bottom-nav')) { // Kiểm tra nếu là bottom nav
                link.classList.add('active');
            } else { // Menu desktop
                link.classList.add('active');
            }
        }
    });
}

// Lắng nghe sự kiện khi header và footer được tải
document.addEventListener('header-placeholderLoaded', initializeHeaderFeatures);
document.addEventListener('footer-placeholderLoaded', initializeFooterFeatures);

// Đóng menu mobile khi thay đổi kích thước cửa sổ lên desktop
window.addEventListener('resize', function() {
    if (window.innerWidth >= 768) {
        const kdToggle = document.getElementById('kd-mobile-toggle');
        const kdMenu = document.getElementById('kd-mobile-menu');
        if (kdToggle && kdMenu && kdToggle.getAttribute('aria-expanded') === 'true' && typeof window.kdCloseMobileMenu === 'function') {
            window.kdCloseMobileMenu();
        }

        const mobileMenuPanel = document.getElementById('mobile-menu-panel');
        if (mobileMenuPanel && mobileMenuPanel.classList.contains('open')) {
            if (typeof window.closeMobileMenu === 'function') {
                window.closeMobileMenu();
            }
        }
    }
});
