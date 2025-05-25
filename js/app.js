// js/app.js
// Nhiệm vụ chính: Khởi tạo các chức năng UI sau khi các components đã được tải.

/**
 * Hàm debounce để trì hoãn việc thực thi một hàm.
 * @param {function} func - Hàm cần trì hoãn.
 * @param {number} delay - Thời gian trì hoãn (ms).
 * @returns {function} - Hàm đã được debounce.
 */
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}


/**
 * Khởi tạo menu di động.
 */
function initializeMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenuPanel = document.getElementById('mobile-menu-panel');
    const iconMenuOpen = document.getElementById('icon-menu-open');
    const iconMenuClose = document.getElementById('icon-menu-close');

    if (!mobileMenuButton || !mobileMenuPanel || !iconMenuOpen || !iconMenuClose) {
        console.warn('Một số phần tử của menu di động không tìm thấy.');
        return;
    }

    mobileMenuButton.addEventListener('click', () => {
        const isOpen = mobileMenuPanel.classList.toggle('open');
        mobileMenuButton.setAttribute('aria-expanded', isOpen.toString());
        iconMenuOpen.classList.toggle('hidden', isOpen);
        iconMenuClose.classList.toggle('hidden', !isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Đóng menu khi nhấp vào link (trừ submenu toggle)
    mobileMenuPanel.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            if (!e.target.closest('.mobile-submenu-toggle') && mobileMenuPanel.classList.contains('open')) {
                mobileMenuPanel.classList.remove('open');
                mobileMenuButton.setAttribute('aria-expanded', 'false');
                iconMenuOpen.classList.remove('hidden');
                iconMenuClose.classList.add('hidden');
                document.body.style.overflow = '';
            }
        });
    });


    // Đóng menu khi nhấn phím Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenuPanel.classList.contains('open')) {
            mobileMenuPanel.classList.remove('open');
            mobileMenuButton.setAttribute('aria-expanded', 'false');
            iconMenuOpen.classList.remove('hidden');
            iconMenuClose.classList.add('hidden');
            document.body.style.overflow = '';
            mobileMenuButton.focus();
        }
    });

    initializeMobileSubmenuToggles();
}

/**
 * Khởi tạo các nút bật/tắt submenu trên di động.
 */
function initializeMobileSubmenuToggles() {
    const mobileSubmenuToggles = document.querySelectorAll('.mobile-submenu-toggle');
    mobileSubmenuToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const submenuId = toggle.getAttribute('aria-controls');
            const submenu = document.getElementById(submenuId);
            const icon = toggle.querySelector('.mobile-submenu-icon');
            const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

            if (!submenu) {
                console.warn(`Submenu với ID '${submenuId}' không tìm thấy.`);
                return;
            }

            if (isExpanded) {
                toggle.setAttribute('aria-expanded', 'false');
                submenu.style.maxHeight = '0';
                submenu.classList.remove('open'); // Đảm bảo class 'open' cũng được gỡ bỏ
                if (icon) icon.classList.remove('rotate-180');
            } else {
                // Đóng các submenu khác trước khi mở submenu hiện tại
                document.querySelectorAll('.mobile-submenu-content.open').forEach(openSubmenu => {
                    if (openSubmenu !== submenu) {
                        openSubmenu.style.maxHeight = '0';
                        openSubmenu.classList.remove('open');
                        const otherToggle = document.querySelector(`[aria-controls="${openSubmenu.id}"]`);
                        if (otherToggle) {
                            otherToggle.setAttribute('aria-expanded', 'false');
                            const otherIcon = otherToggle.querySelector('.mobile-submenu-icon');
                            if (otherIcon) otherIcon.classList.remove('rotate-180');
                        }
                    }
                });
                toggle.setAttribute('aria-expanded', 'true');
                submenu.classList.add('open');
                submenu.style.maxHeight = submenu.scrollHeight + 'px';
                if (icon) icon.classList.add('rotate-180');
            }
        });
    });
}

/**
 * Đánh dấu trang hiện tại trên thanh điều hướng.
 */
function highlightActivePage() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('header nav a, #mobile-menu-panel nav a');

    navLinks.forEach(link => {
        link.classList.remove('text-sky-300', 'bg-slate-600', 'active', 'text-sky-400', 'font-semibold');
        const linkHref = link.getAttribute('href').split('/').pop() || 'index.html';
        let isActive = false;

        if (linkHref === currentPath) {
            isActive = true;
        } else if (currentPath === 'index.html' && (link.id === 'nav-index' || linkHref === '')) {
            isActive = true;
        }

        if (isActive) {
            if (link.closest('#mobile-menu-panel')) {
                link.classList.add('text-sky-300', 'bg-slate-600', 'font-semibold');
            } else {
                link.classList.add('text-sky-400', 'active', 'font-semibold');
            }
        }
    });

    const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
    bottomNavItems.forEach(item => {
        item.classList.remove('active');
        const itemPath = item.getAttribute('href').split('/').pop() || 'index.html';
        if (itemPath === currentPath || (currentPath === 'index.html' && itemPath === '')) {
            item.classList.add('active');
        }
    });
}

/**
 * Khởi tạo các chức năng của header.
 */
function initializeHeaderSpecificFeatures() {
    const header = document.querySelector('.nav-header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('shrink');
            } else {
                header.classList.remove('shrink');
            }
        });
    }

    initializeMobileMenu();
    highlightActivePage(); // Gọi sau khi menu mobile đã được khởi tạo

    const desktopSearchButton = document.getElementById('desktop-search-button');
    const desktopSearchContainer = document.getElementById('desktop-search-container');
    const desktopSearchInput = document.getElementById('desktop-search-input');
    const desktopSearchClose = document.getElementById('desktop-search-close');
    const searchResults = document.getElementById('search-results'); // Desktop search results

    if (desktopSearchButton && desktopSearchContainer && desktopSearchInput && desktopSearchClose) {
        desktopSearchButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Ngăn sự kiện click lan ra document
            const isHidden = desktopSearchContainer.classList.contains('hidden');
            desktopSearchContainer.classList.toggle('hidden', !isHidden);
            desktopSearchButton.setAttribute('aria-expanded', isHidden.toString());
            if (isHidden) {
                desktopSearchInput.focus();
            }
        });

        desktopSearchClose.addEventListener('click', () => {
            desktopSearchContainer.classList.add('hidden');
            desktopSearchButton.setAttribute('aria-expanded', 'false');
        });
    }

    if (desktopSearchInput && searchResults) {
        const debouncedSearch = debounce(async () => {
            const query = desktopSearchInput.value.trim();
            if (query.length < 3) {
                searchResults.innerHTML = '';
                searchResults.style.display = 'none';
                return;
            }
            await fetchAndDisplaySearchResults(query, searchResults);
        }, 300);
        desktopSearchInput.addEventListener('input', debouncedSearch);
    }

    const mobileSearchInput = document.getElementById('mobile-search-input');
    const mobileSearchResults = document.getElementById('mobile-search-results');
    if (mobileSearchInput && mobileSearchResults) {
        const debouncedMobileSearch = debounce(async () => {
            const query = mobileSearchInput.value.trim();
            if (query.length < 3) {
                mobileSearchResults.innerHTML = '';
                mobileSearchResults.style.display = 'none';
                return;
            }
            await fetchAndDisplaySearchResults(query, mobileSearchResults);
        }, 300);
        mobileSearchInput.addEventListener('input', debouncedMobileSearch);
    }


    const megaMenuContainer = document.querySelector('.mega-menu-container');
    const servicesMegaMenu = document.getElementById('services-mega-menu');
    const servicesButton = document.getElementById('nav-services-button');

    if (megaMenuContainer && servicesMegaMenu && servicesButton) {
        const openMegaMenu = () => {
            servicesMegaMenu.classList.remove('hidden');
            servicesMegaMenu.classList.add('block');
            servicesButton.setAttribute('aria-expanded', 'true');
        };
        const closeMegaMenu = () => {
            servicesMegaMenu.classList.add('hidden');
            servicesMegaMenu.classList.remove('block');
            servicesButton.setAttribute('aria-expanded', 'false');
        };

        megaMenuContainer.addEventListener('mouseenter', openMegaMenu);
        megaMenuContainer.addEventListener('mouseleave', closeMegaMenu);
        servicesButton.addEventListener('focus', openMegaMenu);
        // Đóng khi focus ra ngoài mega menu hoặc nút services
        megaMenuContainer.addEventListener('focusout', (event) => {
            if (!megaMenuContainer.contains(event.relatedTarget)) {
                closeMegaMenu();
            }
        });
         // Xử lý đóng mega menu bằng phím Escape
        megaMenuContainer.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && servicesButton.getAttribute('aria-expanded') === 'true') {
                closeMegaMenu();
                servicesButton.focus(); // Trả focus về nút services
            }
        });
    }
     // Đóng search desktop khi click ra ngoài
    document.addEventListener('click', (event) => {
        const desktopSearchWrapper = document.getElementById('desktop-search-wrapper');
        if (desktopSearchWrapper && !desktopSearchWrapper.contains(event.target) && desktopSearchContainer && !desktopSearchContainer.classList.contains('hidden')) {
            desktopSearchContainer.classList.add('hidden');
            if(desktopSearchButton) desktopSearchButton.setAttribute('aria-expanded', 'false');
        }
    });
}

/**
 * Khởi tạo các chức năng của footer.
 */
function initializeFooterSpecificFeatures() {
    const newsletterForm = document.getElementById('newsletter-form');
    const newsletterEmail = document.getElementById('newsletter-email');
    const newsletterMessage = document.getElementById('newsletter-message');

    if (newsletterForm && newsletterEmail && newsletterMessage) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = newsletterEmail.value;
            const submitButton = newsletterForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;

            newsletterMessage.textContent = '';
            newsletterMessage.className = 'mt-2 text-sm';

            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                newsletterMessage.textContent = 'Vui lòng nhập địa chỉ email hợp lệ.';
                newsletterMessage.classList.add('text-red-400');
                return;
            }
            submitButton.disabled = true;
            submitButton.textContent = 'Đang gửi...';

            try {
                // THAY THẾ 'YOUR_FORMSPREE_ID' BẰNG ID THỰC TẾ CỦA BẠN
                const response = await fetch('https://formspree.io/f/YOUR_FORMSPREE_ID', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ email: email, _subject: "Đăng ký nhận tin từ KhaDock.com" })
                });

                if (response.ok) {
                    newsletterMessage.textContent = 'Cảm ơn bạn đã đăng ký!';
                    newsletterMessage.classList.add('text-green-400');
                    newsletterEmail.value = '';
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    newsletterMessage.textContent = errorData.error || 'Đăng ký không thành công. Vui lòng thử lại.';
                    newsletterMessage.classList.add('text-red-400');
                }

            } catch (error) {
                console.error('Lỗi đăng ký nhận tin:', error);
                newsletterMessage.textContent = 'Đăng ký không thành công do lỗi mạng. Vui lòng thử lại.';
                newsletterMessage.classList.add('text-red-400');
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        });
    }

    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    if (document.getElementById('footer-map')) {
        if (typeof google !== 'undefined' && typeof google.maps !== 'undefined') {
            if (typeof window.initMapGlobally === 'function') {
                window.initMapGlobally();
            }
        } else {
            // THAY THẾ 'YOUR_GOOGLE_MAPS_API_KEY' BẰNG API KEY CỦA BẠN
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&callback=initMapGlobally`;
            script.defer = true;
            script.async = true;
            document.head.appendChild(script);
        }
    }
}

// Khởi tạo chung khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
    console.log('[Script] DOMContentLoaded - app.js');
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            mirror: false
        });
    }

    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollToTopBtn.classList.add('show');
            } else {
                scrollToTopBtn.classList.remove('show');
            }
        });
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});

// Lắng nghe sự kiện components đã được tải
document.addEventListener('header-placeholderLoaded', () => {
    console.log('[Script] Sự kiện header-placeholderLoaded đã được kích hoạt.');
    initializeHeaderSpecificFeatures();
});

document.addEventListener('footer-placeholderLoaded', () => {
    console.log('[Script] Sự kiện footer-placeholderLoaded đã được kích hoạt.');
    initializeFooterSpecificFeatures();
});

// Hàm khởi tạo Google Maps (được gọi bởi callback từ API)
function initMapGlobally() {
    // Đảm bảo initMap chỉ được gọi một lần và khi DOM đã sẵn sàng
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        if (typeof window.initMap === 'function' && !document.getElementById('footer-map')?.classList.contains('map-initialized')) {
            window.initMap();
        }
    } else {
        document.addEventListener('DOMContentLoaded', () => {
             if (typeof window.initMap === 'function' && !document.getElementById('footer-map')?.classList.contains('map-initialized')) {
                window.initMap();
            }
        });
    }
}

window.initMap = function() {
    const mapDiv = document.getElementById('footer-map');
    if (!mapDiv || mapDiv.classList.contains('map-initialized')) {
        if(!mapDiv) console.warn("Phần tử footer-map không tìm thấy cho Google Maps.");
        return;
    }

    try {
        console.log('[Script] Khởi tạo Google Maps...');
        const map = new google.maps.Map(mapDiv, {
            center: { lat: 28.0430, lng: -81.9430 }, // Lakeland, FL
            zoom: 12,
            styles: [ /* Array of map styles */
                {"featureType": "administrative", "elementType": "labels.text.fill", "stylers": [{"color": "#444444"}]},
                {"featureType": "landscape", "elementType": "all", "stylers": [{"color": "#f2f2f2"}, {"lightness": "100"}]},
                {"featureType": "poi", "elementType": "all", "stylers": [{"visibility": "off"}]},
                {"featureType": "road", "elementType": "all", "stylers": [{"saturation": -100}, {"lightness": 45}]},
                {"featureType": "road.highway", "elementType": "all", "stylers": [{"visibility": "simplified"}]},
                {"featureType": "road.arterial", "elementType": "labels.icon", "stylers": [{"visibility": "off"}]},
                {"featureType": "transit", "elementType": "all", "stylers": [{"visibility": "off"}]},
                {"featureType": "water", "elementType": "all", "stylers": [{"color": "#46bcec"}, {"visibility": "on"}]}
            ]
        });

        new google.maps.Marker({
            position: { lat: 28.0430, lng: -81.9430 },
            map: map,
            title: "KhaDock.com"
        });
        mapDiv.classList.add('map-initialized');
        console.log('[Script] Google Maps đã được khởi tạo.');
    } catch (error) {
        console.error("Lỗi khởi tạo Google Maps:", error);
        if (mapDiv) {
            mapDiv.innerHTML = '<p class="text-center text-red-500 p-4">Không thể tải bản đồ. Vui lòng kiểm tra API Key và kết nối mạng.</p>';
        }
    }
};

// Gán hàm vào global window object để Google Maps API có thể gọi
if (typeof window !== 'undefined') {
    window.initMapGlobally = initMapGlobally;
}

/**
 * Tìm nạp và hiển thị kết quả tìm kiếm từ API Gemini.
 * @param {string} query - Truy vấn tìm kiếm.
 * @param {HTMLElement} resultsDiv - Phần tử DOM để hiển thị kết quả.
 */
async function fetchAndDisplaySearchResults(query, resultsDiv) {
    if (!resultsDiv) {
        console.error("Phần tử resultsDiv không tồn tại để hiển thị kết quả tìm kiếm.");
        return;
    }
    resultsDiv.innerHTML = '<p class="text-slate-400 p-2 flex items-center"><i class="fas fa-spinner fa-spin mr-2"></i>Đang tìm...</p>';
    resultsDiv.style.display = 'block';

    try {
        const geminiApiKey = ""; // QUAN TRỌNG: Cần cung cấp API Key thực tế ở đây
        if (!geminiApiKey) {
            console.warn("Gemini API Key chưa được cấu hình. Chức năng tìm kiếm sẽ không hoạt động.");
            resultsDiv.innerHTML = '<p class="text-orange-500 p-2">Chức năng tìm kiếm tạm thời chưa sẵn sàng (thiếu API Key).</p>';
            return;
        }
        const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

        const prompt = `Dựa trên truy vấn tìm kiếm "${query}" cho một trang web về thiết kế và thi công bến tàu, cầu cảng và cải tạo nhà cửa, hãy cung cấp tối đa 5 gợi ý kết quả tìm kiếm có liên quan nhất. Mỗi gợi ý nên là một mục danh sách HTML (<li>) chứa một liên kết (<a>) với class="search-result-item p-2 hover:bg-slate-600 rounded-md block cursor-pointer". Nội dung của liên kết nên là tiêu đề trang hoặc mô tả ngắn gọn, hấp dẫn. Trả về dưới dạng một danh sách <ul>. Nếu không có kết quả phù hợp, trả về một đoạn <p class="text-slate-400 p-2">Không tìm thấy gợi ý nào.</p>.`;
        const payload = {
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        };

        const response = await fetch(geminiApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Lỗi API Gemini:', response.status, errorText);
            resultsDiv.innerHTML = `<p class="text-red-400 p-2">Lỗi ${response.status} khi tìm nạp gợi ý. Vui lòng thử lại sau.</p>`;
            return;
        }

        const result = await response.json();

        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            let htmlContent = result.candidates[0].content.parts[0].text;
            // Loại bỏ các dấu ```html và ``` nếu có
            htmlContent = htmlContent.replace(/```html\s*|\s*```/g, '').trim();


            if (htmlContent.startsWith('<ul>') && htmlContent.endsWith('</ul>')) {
                 resultsDiv.innerHTML = htmlContent;
                 // Kiểm tra xem có mục li nào không, nếu không thì hiển thị thông báo "Không tìm thấy"
                 if (!resultsDiv.querySelector('li')) {
                     resultsDiv.innerHTML = '<p class="text-slate-400 p-2">Không tìm thấy gợi ý nào.</p>';
                 }
            } else if (htmlContent.includes('<p class="text-slate-400 p-2">Không tìm thấy gợi ý nào.</p>')) {
                 resultsDiv.innerHTML = htmlContent; // API đã trả về thông báo không tìm thấy
            }
            else {
                // Nếu API trả về nội dung không phải là danh sách hoặc thông báo chuẩn
                console.warn("Định dạng phản hồi từ API tìm kiếm không như mong đợi:", htmlContent);
                resultsDiv.innerHTML = '<p class="text-slate-400 p-2">Không có gợi ý nào được định dạng đúng.</p>';
            }
        } else {
            resultsDiv.innerHTML = '<p class="text-slate-400 p-2">Không có gợi ý nào được tìm thấy từ API.</p>';
        }
    } catch (error) {
        console.error('Lỗi xử lý gợi ý tìm kiếm:', error);
        resultsDiv.innerHTML = '<p class="text-red-400 p-2">Lỗi khi xử lý gợi ý. Vui lòng kiểm tra console.</p>';
    }
}
