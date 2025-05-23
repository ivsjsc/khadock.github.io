// js/loadComponents.js

// Function to fetch and inject HTML components
async function loadHTMLComponent(componentPath, placeholderId, componentName) {
    const placeholder = document.getElementById(placeholderId);
    if (!placeholder) {
        console.error(`Placeholder element with ID '${placeholderId}' not found for ${componentName}.`);
        return false;
    }

    try {
        const response = await fetch(componentPath);
        if (!response.ok) {
            throw new Error(`Failed to load ${componentName}. Status: ${response.status}`);
        }
        const data = await response.text();
        placeholder.innerHTML = data;
        console.log(`${componentName} loaded successfully into #${placeholderId}.`);
        return true;
    } catch (error) {
        console.error(`Error loading ${componentName}:`, error);
        placeholder.innerHTML = `<p class="text-red-500 text-center py-4">Error loading ${componentName}. Please try refreshing.</p>`;
        return false;
    }
}

// Initialize header and footer loading
async function initializePageComponents() {
    const headerLoaded = await loadHTMLComponent('components/header.html', 'header-placeholder', 'Header');
    if (headerLoaded) {
        // Dispatch a custom event after the header is successfully loaded and injected
        // App.js will listen for this to initialize header-dependent functionalities
        document.dispatchEvent(new CustomEvent('headerLoaded'));
        console.log('headerLoaded event dispatched.'); // Thêm log này
    }

    const footerLoaded = await loadHTMLComponent('components/footer.html', 'footer-placeholder', 'Footer');
    if (footerLoaded) {
        const yearSpan = document.getElementById('current-year');
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }
         document.dispatchEvent(new CustomEvent('footerLoaded'));
         console.log('footerLoaded event dispatched.'); // Thêm log này
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePageComponents);
} else {
    initializePageComponents();
}
