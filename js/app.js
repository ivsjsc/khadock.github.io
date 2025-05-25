document.addEventListener('DOMContentLoaded', () => {
    if (AOS) {
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
                mobileMenuButton.setAttribute('aria-expanded', isOpen);
                iconMenuOpen.classList.toggle('hidden', isOpen);
                iconMenuClose.classList.toggle('hidden', !isOpen);
            });
        }

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

            document.addEventListener('click', (event) => {
                const desktopSearchWrapper = document.getElementById('desktop-search-wrapper');
                if (desktopSearchWrapper && !desktopSearchWrapper.contains(event.target) && !desktopSearchButton.contains(event.target)) {
                    desktopSearchContainer.classList.add('hidden');
                    desktopSearchButton.setAttribute('aria-expanded', 'false');
                }
            });
        }

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

        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('header nav a, #mobile-menu-panel nav a');
        navLinks.forEach(link => {
            const linkPath = link.href.split('/').pop() || 'index.html';
            if (link.id === `nav-${currentPath.replace('.html', '')}` || (currentPath === 'index.html' && link.id === 'nav-index') || linkPath === currentPath) {
                 if(link.closest('#mobile-menu-panel')) {
                    link.classList.add('text-sky-300', 'bg-slate-600');
                } else {
                    link.classList.add('text-sky-400', 'active');
                }
            } else {
                 if(link.closest('#mobile-menu-panel')) {
                    link.classList.remove('text-sky-300', 'bg-slate-600');
                } else {
                    link.classList.remove('text-sky-400', 'active');
                }
            }
        });

        const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
        bottomNavItems.forEach(item => {
            const itemPath = item.href.split('/').pop() || 'index.html';
            if (itemPath === currentPath) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
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

                if (!email || !email.includes('@')) {
                    newsletterMessage.textContent = 'Vui lòng nhập địa chỉ email hợp lệ.';
                    newsletterMessage.className = 'mt-2 text-sm text-red-400';
                    return;
                }

                try {
                    const response = await fetch('/api/subscribe', {
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

        const currentYearSpan = document.getElementById('current-year');
        if (currentYearSpan) {
            currentYearSpan.textContent = new Date().getFullYear();
        }

        if (typeof google !== 'undefined' && typeof google.maps !== 'undefined') {
            initMap();
        } else {
            if (document.getElementById('footer-map')) {
                 const script = document.createElement('script');
                script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_Maps_API_KEY&callback=initMapGlobally`;
                script.defer = true;
                script.async = true;
                document.head.appendChild(script);
            }
        }
    });
});

function initMapGlobally() {
    window.initMap = function() {
        const mapDiv = document.getElementById('footer-map');
        if (!mapDiv) return;
        if (mapDiv.classList.contains('map-initialized')) return;

        const map = new google.maps.Map(mapDiv, {
            center: { lat: 28.0430, lng: -81.9430 },
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

        new google.maps.Marker({
            position: { lat: 28.0430, lng: -81.9430 },
            map: map,
            title: "KhaDock.com"
        });
        mapDiv.classList.add('map-initialized');
    };
    if (document.getElementById('footer-map')) {
        window.initMap();
    }
}
if (typeof window !== 'undefined') {
    window.initMapGlobally = initMapGlobally;
}


async function fetchAndDisplaySearchResults(query, resultsDiv) {
    try {
        const geminiApiKey = ""; 
        const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

        const prompt = `Gợi ý kết quả tìm kiếm có liên quan cho một trang web về xây dựng bến tàu và cải tạo nhà, dựa trên truy vấn: "${query}". Cung cấp kết quả dưới dạng danh sách HTML <ul> với các mục <li> là các liên kết <a> mô phỏng. Ví dụ: <li><a href="#" class="search-result-link">Tên Trang Gợi Ý</a></li>. Giới hạn 5 kết quả.`;
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
            resultsDiv.style.display = 'block';
            return;
        }

        const result = await response.json();
        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            let text = result.candidates[0].content.parts[0].text;
            text = text.replace(/```html\n?/g, '').replace(/```\n?/g, '');

            resultsDiv.innerHTML = text;
            if (resultsDiv.innerHTML.trim() === '' || resultsDiv.querySelector('li') === null) {
                resultsDiv.innerHTML = '<p class="text-slate-400 p-2">Không tìm thấy gợi ý nào.</p>';
            }
            resultsDiv.style.display = 'block';
        } else {
            resultsDiv.innerHTML = '<p class="text-slate-400 p-2">Không có gợi ý nào được tìm thấy.</p>';
            resultsDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Lỗi gợi ý tìm kiếm:', error);
        resultsDiv.innerHTML = '<p class="text-red-400 p-2">Lỗi khi tìm nạp gợi ý. Vui lòng kiểm tra console.</p>';
        resultsDiv.style.display = 'block';
    }
}