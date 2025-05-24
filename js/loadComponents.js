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
        } else {
            console.error(`[Script] Placeholder element with id '${placeholderId}' not found.`);
        }

        if (placeholderId === 'header-placeholder') {
            initializeHeader();
        }
        if (placeholderId === 'footer-placeholder') {
            initializeFooter();
        }

    } catch (error) {
        console.error(`[Script] Error loading component from ${filePath}:`, error);
        const placeholder = document.getElementById(placeholderId);
        if (placeholder) {
            placeholder.innerHTML = `<p style="color: red;">Error loading component: ${error.message || error}</p>`;
        }
    }
}

async function loadComponentsAndInitialize() {
    const HEADER_COMPONENT_URL = '/components/header.html';
    const FOOTER_COMPONENT_URL = '/components/footer.html';

    await loadComponent('header-placeholder', HEADER_COMPONENT_URL);
    await loadComponent('footer-placeholder', FOOTER_COMPONENT_URL);
}

// Move initializeHeader and initializeFooter definitions here
function initializeHeader() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuIcon = mobileMenuButton ? mobileMenuButton.querySelector('i') : null;

    if (mobileMenuButton && mobileMenu && mobileMenuIcon) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            if (mobileMenu.classList.contains('hidden')) {
                mobileMenuIcon.classList.remove('fa-times');
                mobileMenuIcon.classList.add('fa-bars');
                const openSubmenu = mobileMenu.querySelector('.mobile-submenu:not(.hidden)');
                if(openSubmenu) openSubmenu.classList.add('hidden');
                const openSubmenuIcon = mobileMenu.querySelector('.fa-chevron-up');
                if(openSubmenuIcon) {
                    openSubmenuIcon.classList.remove('fa-chevron-up');
                    openSubmenuIcon.classList.add('fa-chevron-down');
                }
            } else {
                mobileMenuIcon.classList.remove('fa-bars');
                mobileMenuIcon.classList.add('fa-times');
            }
        });

        const mobileMenuLinks = mobileMenu.querySelectorAll('a');
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if (!e.target.closest('button[onclick*="toggleMobileSubmenu"]')) {
                     if (!mobileMenu.classList.contains('hidden')) {
                        mobileMenu.classList.add('hidden');
                        mobileMenuIcon.classList.remove('fa-times');
                        mobileMenuIcon.classList.add('fa-bars');
                     }
                }
            });
        });
    }

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

    if(langViButton) {
        langViButton.addEventListener('click', () => {
            localStorage.setItem('language', 'vi');
            setActiveLangButton('vi');
            if (typeof updateLanguage === 'function') updateLanguage('vi');
            else location.reload();
        });
    }

    if(langEnButton) {
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

function initializeFooter() {
    const currentYearSpan = document.getElementById('current-year');
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


if (typeof window !== 'undefined') {
    window.loadComponentsAndInitialize = loadComponentsAndInitialize;
    // Make initializeHeader and initializeFooter globally accessible if they are not already
    window.initializeHeader = initializeHeader;
    window.initializeFooter = initializeFooter;
}
