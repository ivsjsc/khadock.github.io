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

async function loadAppComponents(callback) {
    const HEADER_COMPONENT_URL = '/components/header.html';
    const FOOTER_COMPONENT_URL = '/components/footer.html';

    await Promise.all([
        loadComponent('header-placeholder', HEADER_COMPONENT_URL),
        loadComponent('footer-placeholder', FOOTER_COMPONENT_URL)
    ]);

    if (typeof callback === 'function') {
        callback();
    }
    document.dispatchEvent(new CustomEvent('allAppComponentsLoaded'));
}

function initializeHeaderFeatures() {
    initializeMobileMenu();
    highlightActivePage();

    const langViButton = document.getElementById('lang-vi');
    const langEnButton = document.getElementById('lang-en');

    function setActiveLangButton(lang) {
        if (!langViButton || !langEnButton) return;
        langViButton.classList.remove('active-lang', 'bg-primary', 'text-white');
        langEnButton.classList.remove('active-lang', 'bg-primary', 'text-white');
        langViButton.classList.add('text-neutral-700', 'dark:text-gray-300');
        langEnButton.classList.add('text-neutral-700', 'dark:text-gray-300');

        if (lang === 'vi') {
            langViButton.classList.add('active-lang');
        } else {
            langEnButton.classList.add('active-lang');
        }
    }

    let currentLanguage = localStorage.getItem('language') || document.documentElement.lang || 'vi';
    setActiveLangButton(currentLanguage);

    if (langViButton) {
        langViButton.addEventListener('click', () => {
            localStorage.setItem('language', 'vi');
            setActiveLangButton('vi');
            if (typeof updateLanguage === 'function') updateLanguage('vi');
            else location.reload();
        });
    }

    if (langEnButton) {
        langEnButton.addEventListener('click', () => {
            localStorage.setItem('language', 'en');
            setActiveLangButton('en');
            if (typeof updateLanguage === 'function') updateLanguage('en');
            else location.reload();
        });
    }

    const headerDarkModeToggle = document.getElementById('dark-mode-toggle');
    const mobileHeaderDarkModeToggle = document.getElementById('mobile-dark-mode-toggle');

    function updateToggleIcon(button, isDark) {
        if (button && button.querySelector('i')) {
            button.querySelector('i').className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        }
        if (button && button.id === 'mobile-dark-mode-toggle' && button.querySelector('span.ml-2')) {
            button.querySelector('span.ml-2').textContent = isDark ? 'Chế độ Sáng' : 'Chế độ Tối';
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
}

function initializeFooterFeatures() {
    const currentYearSpan = document.getElementById('currentYearFooter');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    const newsletterForm = document.getElementById('newsletterForm');
    const newsletterEmail = document.getElementById('newsletterEmail');
    const newsletterMessage = document.getElementById('newsletterMessage');

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
                processing: getTranslation('newsletter_processing', 'Đang xử lý...'),
                success: getTranslation('newsletter_success', 'Cảm ơn bạn đã đăng ký! Vui lòng kiểm tra email để xác nhận.'),
                error: getTranslation('newsletter_error', 'Đã có lỗi xảy ra. Vui lòng thử lại sau.'),
                invalidEmail: getTranslation('newsletter_invalid_email', 'Vui lòng nhập một địa chỉ email hợp lệ.')
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

function initializeMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenuPanel = document.getElementById('mobile-menu-panel');
    const iconMenuOpen = document.getElementById('icon-menu-open');
    const iconMenuClose = document.getElementById('icon-menu-close');

    if (!mobileMenuButton || !mobileMenuPanel) {
        console.warn('Mobile menu elements not found for initialization.');
        return;
    }
    
    if (mobileMenuButton.__menuInitialized) return;


    function openMobileMenu() {
        mobileMenuPanel.classList.add('open');
        mobileMenuButton.setAttribute('aria-expanded', 'true');
        if (iconMenuOpen && iconMenuClose) {
            iconMenuOpen.classList.add('hidden');
            iconMenuClose.classList.remove('hidden');
        }
        document.body.style.overflow = 'hidden';
        const firstMenuItem = mobileMenuPanel.querySelector('a, button');
        if (firstMenuItem) {
            setTimeout(() => firstMenuItem.focus(), 100);
        }
    }

    function closeMobileMenu() {
        mobileMenuPanel.classList.remove('open');
        mobileMenuButton.setAttribute('aria-expanded', 'false');
        if (iconMenuOpen && iconMenuClose) {
            iconMenuOpen.classList.remove('hidden');
            iconMenuClose.classList.add('hidden');
        }
        document.body.style.overflow = '';
        mobileMenuButton.focus();
    }

    mobileMenuButton.addEventListener('click', function() {
        const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
        if (isExpanded) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });

    mobileMenuPanel.addEventListener('click', function(e) {
        if (e.target === mobileMenuPanel) {
            closeMobileMenu();
        }
    });
    
    const mobileMenuLinks = mobileMenuPanel.querySelectorAll('a');
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (!e.target.closest('.mobile-submenu-toggle')) {
                 if (mobileMenuPanel.classList.contains('open')) {
                    closeMobileMenu();
                }
            }
        });
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileMenuPanel.classList.contains('open')) {
            closeMobileMenu();
        }
    });

    initializeSubmenuToggles();

    window.closeMobileMenu = closeMobileMenu;
    window.openMobileMenu = openMobileMenu;
    mobileMenuButton.__menuInitialized = true;
}

function initializeSubmenuToggles() {
    const submenuToggles = document.querySelectorAll('.mobile-submenu-toggle');
    submenuToggles.forEach(toggle => {
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
                submenu.style.maxHeight = '0';
                if (icon) icon.style.transform = 'rotate(0deg)';
            } else {
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
                submenu.style.maxHeight = submenu.scrollHeight + 'px';
                if (icon) icon.style.transform = 'rotate(180deg)';
            }
        });
        toggle.__submenuInitialized = true;
    });
}

function highlightActivePage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('#mobile-menu-panel a[href], .nav-links a[href]');
    navLinks.forEach(link => {
        link.classList.remove('text-sky-300', 'bg-slate-600', 'active');
        const href = link.getAttribute('href').split('/').pop();
        if (href === currentPage || (currentPage === 'index.html' && (href === '' || href === 'index.html'))) {
            if(link.closest('#mobile-menu-panel')) {
                link.classList.add('text-sky-300', 'bg-slate-600');
            } else {
                link.classList.add('active');
            }
        }
    });
}

document.addEventListener('header-placeholderLoaded', initializeHeaderFeatures);
document.addEventListener('footer-placeholderLoaded', initializeFooterFeatures);

document.addEventListener('DOMContentLoaded', function() {
    initializeMobileMenu();
    highlightActivePage();
});

window.addEventListener('resize', function() {
    if (window.innerWidth >= 768) {
        const mobileMenuPanel = document.getElementById('mobile-menu-panel');
        if (mobileMenuPanel && mobileMenuPanel.classList.contains('open')) {
            if (typeof window.closeMobileMenu === 'function') {
                window.closeMobileMenu();
            }
        }
    }
});

if (typeof window !== 'undefined') {
    window.loadAppComponents = loadAppComponents;
}
