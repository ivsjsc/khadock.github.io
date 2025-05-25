document.addEventListener('DOMContentLoaded', () => {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            mirror: false
        });
    }

    const scrollToTopBtn = document.getElementById('scrollToTopBtn');

    window.addEventListener('scroll', () => {
        if (scrollToTopBtn) {
            if (window.scrollY > 300) {
                scrollToTopBtn.classList.add('show');
            } else {
                scrollToTopBtn.classList.remove('show');
            }
        }
    });

    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    document.addEventListener('header-placeholderLoaded', () => {
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

        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenuPanel = document.getElementById('mobile-menu-panel');
        const iconMenuOpen = document.getElementById('icon-menu-open');
        const iconMenuClose = document.getElementById('icon-menu-close');
        const desktopSearchButton = document.getElementById('desktop-search-button');
        const desktopSearchContainer = document.getElementById('desktop-search-container');
        const desktopSearchInput = document.getElementById('desktop-search-input');
        const desktopSearchClose = document.getElementById('desktop-search-close');
        const searchResults = document.getElementById('search-results');
        const mobileSearchInput = document.getElementById('mobile-search-input');
        const mobileSearchResults = document.getElementById('mobile-search-results');
        const megaMenuContainer = document.querySelector('.mega-menu-container');
        const servicesMegaMenu = document.getElementById('services-mega-menu');

        if (mobileMenuButton && mobileMenuPanel && iconMenuOpen && iconMenuClose) {
            mobileMenuButton.addEventListener('click', () => {
                const isOpen = mobileMenuPanel.classList.toggle('open');
                mobileMenuButton.setAttribute('aria-expanded', isOpen.toString());
                iconMenuOpen.classList.toggle('hidden', isOpen);
                iconMenuClose.classList.toggle('hidden', !isOpen);
                document.body.style.overflow = isOpen ? 'hidden' : '';
            });
        }

        const mobileSubmenuToggles = document.querySelectorAll('.mobile-submenu-toggle');
        mobileSubmenuToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const submenuId = toggle.getAttribute('aria-controls');
                const submenu = document.getElementById(submenuId);
                const icon = toggle.querySelector('.mobile-submenu-icon');
                const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

                if (!submenu) return;

                if (isExpanded) {
                    toggle.setAttribute('aria-expanded', 'false');
                    submenu.style.maxHeight = '0';
                    if (icon) icon.classList.remove('rotate-180');
                } else {
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


        if (desktopSearchButton && desktopSearchContainer && desktopSearchInput && desktopSearchClose) {
            desktopSearchButton.addEventListener('click', (event) => {
                event.stopPropagation();
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

            document.addEventListener('click', (event) => {
                const desktopSearchWrapper = document.getElementById('desktop-search-wrapper');
                if (desktopSearchWrapper && !desktopSearchWrapper.contains(event.target)) {
                    desktopSearchContainer.classList.add('hidden');
                    desktopSearchButton.setAttribute('aria-expanded', 'false');
                }
            });
        }

        if (desktopSearchInput && searchResults) {
            let debounceTimeout;
            desktopSearchInput.addEventListener('input', () => {
                clearTimeout(debounceTimeout);
                debounceTimeout = setTimeout(async () => {
                    const query = desktopSearchInput.value.trim();
                    if (query.length < 3) {
                        searchResults.innerHTML = '';
                        searchResults.style.display = 'none';
                        return;
                    }
                    await fetchAndDisplaySearchResults(query, searchResults);
                }, 300);
            });
        }

        if (mobileSearchInput && mobileSearchResults) {
             let mobileDebounceTimeout;
            mobileSearchInput.addEventListener('input', () => {
                clearTimeout(mobileDebounceTimeout);
                mobileDebounceTimeout = setTimeout(async () => {
                    const query = mobileSearchInput.value.trim();
                    if (query.length < 3) {
                        mobileSearchResults.innerHTML = '';
                        mobileSearchResults.style.display = 'none';
                        return;
                    }
                    await fetchAndDisplaySearchResults(query, mobileSearchResults);
                }, 300);
            });
        }


        if (megaMenuContainer && servicesMegaMenu) {
            const servicesButton = document.getElementById('nav-services-button');
            megaMenuContainer.addEventListener('mouseenter', () => {
                servicesMegaMenu.classList.remove('hidden');
                servicesMegaMenu.classList.add('block');
                if(servicesButton) servicesButton.setAttribute('aria-expanded', 'true');
            });

            megaMenuContainer.addEventListener('mouseleave', () => {
                servicesMegaMenu.classList.add('hidden');
                servicesMegaMenu.classList.remove('block');
                 if(servicesButton) servicesButton.setAttribute('aria-expanded', 'false');
            });
             if(servicesButton){
                servicesButton.addEventListener('focus', () => {
                    servicesMegaMenu.classList.remove('hidden');
                    servicesMegaMenu.classList.add('block');
                    servicesButton.setAttribute('aria-expanded', 'true');
                });
            }
            servicesMegaMenu.addEventListener('focusout', (event) => {
                if (!servicesMegaMenu.contains(event.relatedTarget) && event.relatedTarget !== servicesButton) {
                    servicesMegaMenu.classList.add('hidden');
                    servicesMegaMenu.classList.remove('block');
                    if(servicesButton) servicesButton.setAttribute('aria-expanded', 'false');
                }
            });
        }

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
                if(link.closest('#mobile-menu-panel')) {
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
    });

    document.addEventListener('footer-placeholderLoaded', () => {
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
                    const response = await fetch('https://formspree.io/f/YOUR_FORMSPREE_ID', { // THAY THẾ YOUR_FORMSPREE_ID
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
                 const script = document.createElement('script');
                script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&callback=initMapGlobally`; // THAY THẾ API KEY
                script.defer = true;
                script.async = true;
                document.head.appendChild(script);
            }
        }
    });
});

function initMapGlobally() {
    if (typeof window.initMap === 'function' && !document.getElementById('footer-map')?.classList.contains('map-initialized')) {
        window.initMap();
    }
}

window.initMap = function() {
    const mapDiv = document.getElementById('footer-map');
    if (!mapDiv || mapDiv.classList.contains('map-initialized')) return;

    try {
        const map = new google.maps.Map(mapDiv, {
            center: { lat: 28.0430, lng: -81.9430 },
            zoom: 12,
            styles: [
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
    } catch (error) {
        console.error("Lỗi khởi tạo Google Maps:", error);
        if (mapDiv) {
            mapDiv.innerHTML = '<p class="text-center text-red-500">Không thể tải bản đồ. Vui lòng kiểm tra API Key và kết nối mạng.</p>';
        }
    }
};

if (typeof window !== 'undefined') {
    window.initMapGlobally = initMapGlobally;
}


async function fetchAndDisplaySearchResults(query, resultsDiv) {
    if (!resultsDiv) return;
    resultsDiv.innerHTML = '<p class="text-slate-400 p-2 flex items-center"><i class="fas fa-spinner fa-spin mr-2"></i>Đang tìm...</p>';
    resultsDiv.style.display = 'block';

    try {
        const geminiApiKey = "";
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
            resultsDiv.innerHTML = '<p class="text-red-400 p-2">Lỗi khi tìm nạp gợi ý. Vui lòng thử lại sau.</p>';
            return;
        }

        const result = await response.json();

        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            let htmlContent = result.candidates[0].content.parts[0].text;
            htmlContent = htmlContent.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();

            if (htmlContent.startsWith('<ul>') && htmlContent.endsWith('</ul>')) {
                 resultsDiv.innerHTML = htmlContent;
                 if (resultsDiv.querySelector('li') === null) {
                     resultsDiv.innerHTML = '<p class="text-slate-400 p-2">Không tìm thấy gợi ý nào.</p>';
                 }
            } else if (htmlContent.includes('<p class="text-slate-400 p-2">Không tìm thấy gợi ý nào.</p>')) {
                 resultsDiv.innerHTML = htmlContent;
            }
            else {
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
