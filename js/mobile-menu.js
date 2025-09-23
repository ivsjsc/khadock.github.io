// Mobile Menu Enhancements
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenuPanel = document.getElementById('mobile-menu-panel');
    const mobileMenuClose = document.getElementById('mobile-menu-close');
    const iconMenuOpen = document.getElementById('icon-menu-open');
    const iconMenuClose = document.getElementById('icon-menu-close');
    const mobileSubmenuToggles = document.querySelectorAll('.mobile-submenu-toggle');
    
    // Function to toggle mobile menu
    function toggleMobileMenu() {
        const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
        mobileMenuButton.setAttribute('aria-expanded', !isExpanded);
        
        if (!isExpanded) {
            mobileMenuPanel.classList.add('active');
            document.body.classList.add('menu-open');
            iconMenuOpen.classList.add('hidden');
            iconMenuClose.classList.remove('hidden');
        } else {
            mobileMenuPanel.classList.remove('active');
            document.body.classList.remove('menu-open');
            iconMenuOpen.classList.remove('hidden');
            iconMenuClose.classList.add('hidden');
        }
    }
    
    // Toggle mobile menu when menu button is clicked
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', toggleMobileMenu);
    }
    
    // Close mobile menu when close button is clicked
    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', toggleMobileMenu);
    }
    
    // Toggle submenus in mobile menu
    mobileSubmenuToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const submenuId = this.getAttribute('aria-controls');
            const submenu = document.getElementById(submenuId);
            const submenuIcon = this.querySelector('.mobile-submenu-icon');
            
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            
            if (!isExpanded) {
                submenu.style.maxHeight = submenu.scrollHeight + 'px';
                submenuIcon.style.transform = 'rotate(180deg)';
            } else {
                submenu.style.maxHeight = '0';
                submenuIcon.style.transform = 'rotate(0)';
            }
        });
    });
    
    // Set active class for bottom navigation
    const currentPath = window.location.pathname;
    const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
    
    bottomNavItems.forEach(item => {
        const href = item.getAttribute('href');
        if (currentPath.endsWith(href)) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
});