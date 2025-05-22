document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Load header
        const headerResponse = await fetch('components/header.html');
        if (!headerResponse.ok) throw new Error('Failed to load header');
        const headerContent = await headerResponse.text();
        document.getElementById('header-placeholder').innerHTML = headerContent;

        // Load footer
        const footerResponse = await fetch('components/footer.html');
        if (!footerResponse.ok) throw new Error('Failed to load footer');
        const footerContent = await footerResponse.text();
        document.getElementById('footer-placeholder').innerHTML = footerContent;

        // Initialize active nav state
        const currentPath = window.location.pathname;
        if (currentPath.includes('services.html')) {
            document.querySelector('nav a[href*="services"]')?.classList.add('active');
        }

    } catch (error) {
        console.error('Error loading components:', error);
    }
});
