document.addEventListener('DOMContentLoaded', () => {
    // Initialize header and footer
    initializeHeaderLogic();
    initializeFooterLogic();
    
    // Initialize click events for all interactive elements
    initializeClickEvents();
    
    // Initialize AOS (Animate On Scroll)
    AOS.init({
        duration: 800,
        once: true,
        offset: 100
    });
});

function initializeHeaderLogic() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        fetch('components/header.html')
            .then(response => response.text())
            .then(data => {
                headerPlaceholder.innerHTML = data;
                // Initialize any header-specific interactions here
                initializeNavigation();
            })
            .catch(error => console.error('Error loading header:', error));
    }
}

function initializeFooterLogic() {
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        fetch('components/footer.html')
            .then(response => response.text())
            .then(data => {
                footerPlaceholder.innerHTML = data;
                // Initialize any footer-specific interactions here
            })
            .catch(error => console.error('Error loading footer:', error));
    }
}

function initializeClickEvents() {
    // Make sure all links are clickable
    document.querySelectorAll('a').forEach(link => {
        link.style.cursor = 'pointer';
        link.style.pointerEvents = 'auto';
    });

    // Make sure all buttons are clickable
    document.querySelectorAll('button').forEach(button => {
        button.style.cursor = 'pointer';
        button.style.pointerEvents = 'auto';
    });

    // Initialize scroll to top button
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.classList.remove('hidden');
                scrollToTopBtn.classList.add('flex');
            } else {
                scrollToTopBtn.classList.add('hidden');
                scrollToTopBtn.classList.remove('flex');
            }
        });

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

function initializeNavigation() {
    // Handle dropdown menus
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector('.dropdown-trigger');
        const menu = dropdown.querySelector('.dropdown-menu');

        if (trigger && menu) {
            // Handle click events
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                dropdown.classList.toggle('open');
            });

            // Handle hover events
            dropdown.addEventListener('mouseenter', () => {
                dropdown.classList.add('open');
            });

            dropdown.addEventListener('mouseleave', () => {
                dropdown.classList.remove('open');
            });
        }
    });
}

// Export functions for use in other modules
export { initializeHeaderLogic, initializeFooterLogic };
