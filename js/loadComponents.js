document.addEventListener('DOMContentLoaded', function() {
    function loadHTMLComponent(componentPath, placeholderId, callback) {
        const componentURL = new URL(componentPath, window.location.href).href;

        fetch(componentURL)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load ${componentURL}. Status: ${response.status} ${response.statusText}`);
                }
                return response.text();
            })
            .then(data => {
                const placeholder = document.getElementById(placeholderId);
                if (placeholder) {
                    if (placeholder.parentNode) {
                        placeholder.outerHTML = data; 
                        if (callback) {
                           requestAnimationFrame(callback);
                        }
                    } else {
                        console.error(`[LoadComponents] Parent node of placeholder '${placeholderId}' not found.`);
                    }
                } else {
                    console.error(`[LoadComponents] Placeholder element with ID '${placeholderId}' not found.`);
                }
            })
            .catch(error => {
                console.error(`[LoadComponents] Error loading component ${componentPath}:`, error);
                const placeholder = document.getElementById(placeholderId);
                if(placeholder) {
                    placeholder.innerHTML = `<div style="color:red; background-color: #ffebee; border: 1px solid red; padding: 10px; border-radius: 5px; text-align: center;">Error loading ${componentPath}. Please check the file path and ensure it's accessible.</div>`;
                }
            });
    }

    loadHTMLComponent('components/header.html', 'header-placeholder', () => {
        if (typeof initializeHeaderLogic === 'function') {
            initializeHeaderLogic(); 
        } else {
            console.error("[LoadComponents] 'initializeHeaderLogic' function is not defined.");
        }
    });

    loadHTMLComponent('components/footer.html', 'footer-placeholder', () => {
        if (typeof initializeFooterLogic === 'function') {
            initializeFooterLogic(); 
        } else {
            console.error("[LoadComponents] 'initializeFooterLogic' function is not defined.");
        }
    });
});

// Define the function to initialize header logic
export function initializeHeaderLogic() {
    console.log('Initializing header logic...');
    // Add your header initialization code here
    // For example, code to handle navigation menu interactions, etc.
}

// Define the function to initialize footer logic
export function initializeFooterLogic() {
    console.log('Initializing footer logic...');
    // Add your footer initialization code here
    // For example, code to handle footer links, etc.
}
