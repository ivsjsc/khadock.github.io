document.addEventListener('DOMContentLoaded', () => {

    const header = document.querySelector('.nav-header');
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
    const newsletterForm = document.getElementById('newsletter-form');
    const newsletterEmail = document.getElementById('newsletter-email');
    const newsletterMessage = document.getElementById('newsletter-message');
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');

    if (AOS) {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            mirror: false
        });
    }

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('shrink');
        } else {
            header.classList.remove('shrink');
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

    mobileMenuButton.addEventListener('click', () => {
        mobileMenuPanel.classList.toggle('hidden');
        mobileMenuPanel.classList.toggle('-translate-x-full');
        mobileMenuPanel.classList.toggle('translate-x-0');
        iconMenuOpen.classList.toggle('hidden');
        iconMenuClose.classList.toggle('hidden');
        mobileMenuButton.setAttribute('aria-expanded', mobileMenuPanel.classList.contains('translate-x-0'));
    });

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

    if (desktopSearchButton && desktopSearchContainer) {
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
            if (!desktopSearchWrapper.contains(event.target) && !desktopSearchButton.contains(event.target)) {
                desktopSearchContainer.classList.add('hidden');
                desktopSearchButton.setAttribute('aria-expanded', 'false');
            }
        });
    }

    const currentPath = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        const linkPath = link.href.split('/').pop();
        if (linkPath === currentPath || (linkPath === '' && currentPath === 'index.html')) {
            link.classList.add('text-sky-400');
        }
    });

    const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
    bottomNavItems.forEach(item => {
        const itemPath = item.href.split('/').pop();
        if (itemPath === currentPath || (itemPath === '' && currentPath === 'index.html')) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    if (desktopSearchInput) {
        desktopSearchInput.addEventListener('input', async () => {
            const query = desktopSearchInput.value.trim();
            if (query.length < 3) {
                searchResults.innerHTML = '';
                searchResults.style.display = 'none';
                return;
            }

            try {
                const geminiApiKey = "";
                const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

                const prompt = `Suggest relevant search results for a website about dock construction and home renovation, based on the query: "${query}". Provide results as a simple list of page titles and short descriptions, one result per line.`;
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
                    displaySearchResults(searchResults, text);
                } else {
                    searchResults.innerHTML = '<p class="text-slate-400 p-2">No suggestions found.</p>';
                    searchResults.style.display = 'block';
                }

            } catch (error) {
                console.error('Search suggestion error:', error);
                searchResults.innerHTML = '<p class="text-red-400 p-2">Error fetching suggestions.</p>';
                searchResults.style.display = 'block';
            }
        });
    }

    if (mobileSearchInput) {
        mobileSearchInput.addEventListener('input', async () => {
            const query = mobileSearchInput.value.trim();
            if (query.length < 3) {
                mobileSearchResults.innerHTML = '';
                mobileSearchResults.style.display = 'none';
                return;
            }

            try {
                const geminiApiKey = "";
                const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

                const prompt = `Suggest relevant search results for a website about dock construction and home renovation, based on the query: "${query}". Provide results as a simple list of page titles and short descriptions, one result per line.`;
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
                    displaySearchResults(mobileSearchResults, text);
                } else {
                    mobileSearchResults.innerHTML = '<p class="text-slate-400 p-2">No suggestions found.</p>';
                    mobileSearchResults.style.display = 'block';
                }

            } catch (error) {
                console.error('Mobile search suggestion error:', error);
                mobileSearchResults.innerHTML = '<p class="text-red-400 p-2">Error fetching suggestions.</p>';
                mobileSearchResults.style.display = 'block';
            }
        });
    }

    function displaySearchResults(resultsDiv, text) {
        const items = text.split('\n').filter(line => line.trim() !== '');
        resultsDiv.innerHTML = '';
        if (items.length === 0) {
            resultsDiv.innerHTML = '<p class="text-slate-400 p-2">No suggestions found.</p>';
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

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = newsletterEmail.value;

            if (!email || !email.includes('@')) {
                newsletterMessage.textContent = 'Please enter a valid email address.';
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
                    newsletterMessage.textContent = 'Thank you for subscribing!';
                    newsletterMessage.className = 'mt-2 text-sm text-green-400';
                    newsletterEmail.value = '';
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Subscription failed.');
                }

            } catch (error) {
                console.error('Newsletter error:', error);
                newsletterMessage.textContent = `Subscription failed: ${error.message}`;
                newsletterMessage.className = 'mt-2 text-sm text-red-400';
            }
        });
    }

    function initMap() {
        const mapDiv = document.getElementById('footer-map');
        if (!mapDiv) return;

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
