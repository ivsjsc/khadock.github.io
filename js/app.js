document.addEventListener('DOMContentLoaded', () => {

    const header = document.querySelector('.nav-header');
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    const newsletterForm = document.getElementById('newsletter-form');
    const newsletterEmail = document.getElementById('newsletter-email');
    const newsletterMessage = document.getElementById('newsletter-message');

    // Khởi tạo AOS
    if (AOS) {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            mirror: false
        });
    }

    // Xử lý sticky header và nút cuộn lên đầu trang
    window.addEventListener('scroll', () => {
        if (header) {
            if (window.scrollY > 50) {
                header.classList.add('shrink');
            } else {
                header.classList.remove('shrink');
            }
        }
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

    // Lắng nghe sự kiện headerLoaded từ loadComponents.js
    document.addEventListener('headerLoaded', () => {
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

        // Chuyển đổi menu mobile
        if (mobileMenuButton && mobileMenuPanel && iconMenuOpen && iconMenuClose) {
            mobileMenuButton.addEventListener('click', () => {
                const isOpen = mobileMenuPanel.classList.toggle('open');
                mobileMenuButton.setAttribute('aria-expanded', isOpen);
                iconMenuOpen.classList.toggle('hidden', isOpen);
                iconMenuClose.classList.toggle('hidden', !isOpen);
            });
        }

        // Chuyển đổi submenu mobile
        const mobileSubmenuToggle = document.querySelector('.mobile-submenu-toggle');
        const mobileServicesSubmenuItems = document.getElementById('mobile-services-submenu-items');

        if (mobileSubmenuToggle && mobileServicesSubmenuItems) {
            mobileSubmenuToggle.addEventListener('click', () => {
                const isExpanded = mobileSubmenuToggle.getAttribute('aria-expanded') === 'true';
                mobileSubmenuToggle.setAttribute('aria-expanded', !isExpanded);
                mobileServicesSubmenuItems.style.maxHeight = isExpanded ? null : mobileServicesSubmenuItems.scrollHeight + 'px';
                mobileSubmenuToggle.querySelector('.mobile-submenu-icon').classList.toggle('rotate-180', !isExpanded);
            });
        }

        // Chức năng tìm kiếm trên desktop
        if (desktopSearchButton && desktopSearchContainer && desktopSearchInput && desktopSearchClose) {
            desktopSearchButton.addEventListener('click', () => {
                const isExpanded = desktopSearchContainer.classList.contains('hidden');
                desktopSearchContainer.classList.toggle('hidden', !isExpanded);
                desktopSearchButton.setAttribute('aria-expanded', isExpanded);
                if (isExpanded) {
                    desktopSearchInput.focus();
                }
            });

            desktopSearchClose.addEventListener('click', () => {
                desktopSearchContainer.classList.add('hidden');
                desktopSearchButton.setAttribute('aria-expanded', 'false');
            });

            // Ẩn kết quả tìm kiếm khi nhấp ra ngoài
            document.addEventListener('click', (event) => {
                const desktopSearchWrapper = document.getElementById('desktop-search-wrapper');
                if (desktopSearchWrapper && !desktopSearchWrapper.contains(event.target) && !desktopSearchButton.contains(event.target)) {
                    desktopSearchContainer.classList.add('hidden');
                    desktopSearchButton.setAttribute('aria-expanded', 'false');
                }
            });
        }

        // Logic nhập liệu tìm kiếm (Desktop)
        if (desktopSearchInput && searchResults) {
            desktopSearchInput.addEventListener('input', async () => {
                const query = desktopSearchInput.value.trim();
                if (query.length < 3) {
                    searchResults.innerHTML = '';
                    searchResults.style.display = 'none';
                    return;
                }
                await fetchAndDisplaySearchResults(query, searchResults);
            });
        }

        // Logic nhập liệu tìm kiếm (Mobile)
        if (mobileSearchInput && mobileSearchResults) {
            mobileSearchInput.addEventListener('input', async () => {
                const query = mobileSearchInput.value.trim();
                if (query.length < 3) {
                    mobileSearchResults.innerHTML = '';
                    mobileSearchResults.style.display = 'none';
                    return;
                }
                await fetchAndDisplaySearchResults(query, mobileSearchResults);
            });
        }

        // Chuyển đổi/hover Mega Menu
        if (megaMenuContainer && servicesMegaMenu) {
            megaMenuContainer.addEventListener('mouseenter', () => {
                servicesMegaMenu.classList.remove('hidden');
                servicesMegaMenu.classList.add('block');
                servicesMegaMenu.setAttribute('aria-expanded', 'true');
            });

            megaMenuContainer.addEventListener('mouseleave', () => {
                servicesMegaMenu.classList.add('hidden');
                servicesMegaMenu.classList.remove('block');
                servicesMegaMenu.setAttribute('aria-expanded', 'false');
            });
        }

        // Đặt liên kết điều hướng đang hoạt động
        const currentPath = window.location.pathname.split('/').pop();
        const navLinks = document.querySelectorAll('nav a');
        navLinks.forEach(link => {
            const linkPath = link.href.split('/').pop();
            if (linkPath === currentPath || (linkPath === '' && currentPath === 'index.html')) {
                link.classList.add('text-sky-400');
            } else {
                link.classList.remove('text-sky-400'); // Đảm bảo chỉ một liên kết hoạt động
            }
        });

        // Đặt mục điều hướng dưới cùng đang hoạt động
        const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
        bottomNavItems.forEach(item => {
            const itemPath = item.href.split('/').pop();
            if (itemPath === currentPath || (itemPath === '' && currentPath === 'index.html')) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    });

    // Lắng nghe sự kiện footerLoaded từ loadComponents.js
    document.addEventListener('footerLoaded', () => {
        // Logic form đăng ký nhận tin
        if (newsletterForm && newsletterEmail && newsletterMessage) {
            newsletterForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = newsletterEmail.value;

                if (!email || !email.includes('@')) {
                    newsletterMessage.textContent = 'Vui lòng nhập địa chỉ email hợp lệ.';
                    newsletterMessage.className = 'mt-2 text-sm text-red-400';
                    return;
                }

                try {
                    const response = await fetch('/api/subscribe', { // Thay thế bằng endpoint API thực tế của bạn
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email })
                    });

                    if (response.ok) {
                        newsletterMessage.textContent = 'Cảm ơn bạn đã đăng ký!';
                        newsletterMessage.className = 'mt-2 text-sm text-green-400';
                        newsletterEmail.value = '';
                    } else {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Đăng ký không thành công.');
                    }

                } catch (error) {
                    console.error('Lỗi đăng ký nhận tin:', error);
                    newsletterMessage.textContent = `Đăng ký không thành công: ${error.message}`;
                    newsletterMessage.className = 'mt-2 text-sm text-red-400';
                }
            });
        }

        // Khởi tạo Google Maps
        function initMap() {
            const mapDiv = document.getElementById('footer-map');
            if (!mapDiv) return;

            const map = new google.maps.Map(mapDiv, {
                center: { lat: 28.0430, lng: -81.9430 }, // Lakeland, FL
                zoom: 12,
                styles: [
                    {
                        "featureType": "administrative",
                        "elementType": "labels.text.fill",
                        "stylers": [{"color": "#444444"}]
                    },
                    {
                        "featureType": "landscape",
                        "elementType": "all",
                        "stylers": [{"color": "#f2f2f2"}, {"lightness": "100"}]
                    },
                    {
                        "featureType": "poi",
                        "elementType": "all",
                        "stylers": [{"visibility": "off"}]
                    },
                    {
                        "featureType": "road",
                        "elementType": "all",
                        "stylers": [{"saturation": -100}, {"lightness": 45}]
                    },
                    {
                        "featureType": "road.highway",
                        "elementType": "all",
                        "stylers": [{"visibility": "simplified"}]
                    },
                    {
                        "featureType": "road.arterial",
                        "elementType": "labels.icon",
                        "stylers": [{"visibility": "off"}]
                    },
                    {
                        "featureType": "transit",
                        "elementType": "all",
                        "stylers": [{"visibility": "off"}]
                    },
                    {
                        "featureType": "water",
                        "elementType": "all",
                        "stylers": [{"color": "#46bcec"}, {"visibility": "on"}]
                    }
                ]
            });

            const marker = new google.maps.Marker({
                position: { lat: 28.0430, lng: -81.9430 },
                map: map,
                title: "KhaDock.com"
            });
        }

        if (document.getElementById('footer-map')) {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&callback=initMap`;
            script.defer = true;
            script.async = true;
            document.head.appendChild(script);
        }
    });

    // Hàm trợ giúp cho kết quả tìm kiếm
    async function fetchAndDisplaySearchResults(query, resultsDiv) {
        try {
            const geminiApiKey = ""; // Canvas sẽ cung cấp khóa này trong thời gian chạy
            const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

            const prompt = `Gợi ý kết quả tìm kiếm có liên quan cho một trang web về xây dựng bến tàu và cải tạo nhà, dựa trên truy vấn: "${query}". Cung cấp kết quả dưới dạng danh sách đơn giản gồm tiêu đề trang và mô tả ngắn, mỗi kết quả trên một dòng.`;
            const payload = {
                contents: [{ role: "user", parts: [{ text: prompt }] }]
            };

            const response = await fetch(geminiApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                const items = text.split('\n').filter(line => line.trim() !== '');
                resultsDiv.innerHTML = '';
                if (items.length === 0) {
                    resultsDiv.innerHTML = '<p class="text-slate-400 p-2">Không tìm thấy gợi ý nào.</p>';
                } else {
                    const ul = document.createElement('ul');
                    ul.className = 'space-y-1';
                    items.forEach(item => {
                        const li = document.createElement('li');
                        li.className = 'p-2 hover:bg-slate-600 rounded-md cursor-pointer';
                        li.textContent = item;
                        ul.appendChild(li);
                    });
                    resultsDiv.appendChild(ul);
                }
                resultsDiv.style.display = 'block';
            } else {
                resultsDiv.innerHTML = '<p class="text-slate-400 p-2">Không tìm thấy gợi ý nào.</p>';
                resultsDiv.style.display = 'block';
            }
        } catch (error) {
            console.error('Lỗi gợi ý tìm kiếm:', error);
            resultsDiv.innerHTML = '<p class="text-red-400 p-2">Lỗi khi tìm nạp gợi ý.</p>';
            resultsDiv.style.display = 'block';
        }
    }
});
