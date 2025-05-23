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
    }

    const footerLoaded = await loadHTMLComponent('components/footer.html', 'footer-placeholder', 'Footer');
    if (footerLoaded) {
        // Initialize any footer-specific interactions here if needed
        // For example, updating the copyright year (though app.js might also handle this if it's global)
        const yearSpan = document.getElementById('current-year');
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }
         document.dispatchEvent(new CustomEvent('footerLoaded'));
    }
}


// Main execution flow for loadComponents.js
// This script is a module, so it executes when imported.
// We want to ensure it runs after the basic DOM structure is available.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePageComponents);
} else {
    initializePageComponents();
}

// This module primarily focuses on loading components.
// Other initializations (AOS, scroll-to-top, complex event handling)
// are now centralized in app.js.
// No exports needed if it's self-executing its primary task.
