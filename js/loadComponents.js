/**
 * Kha Boat Dock - Component Loader (loadComponents.js)
 * Fetches and injects HTML components like header and footer.
 * Initializes their respective JavaScript logic after loading.
 */
document.addEventListener('DOMContentLoaded', function() {
    // Function to fetch and insert HTML content
    function loadHTMLComponent(componentPath, placeholderId, callback) {
        // Construct the full URL for the component.
        // This assumes componentPath is relative to the current HTML page's location.
        const componentURL = new URL(componentPath, window.location.href).href;
        console.log(`[LoadComponents] Attempting to fetch: ${componentURL}`); // Log the exact URL

        fetch(componentURL)
            .then(response => {
                console.log(`[LoadComponents] Response for ${componentURL}:`, response); // Log the response object
                if (!response.ok) {
                    // If response is not OK (e.g., 404 Not Found, 500 Server Error)
                    throw new Error(`Failed to load ${componentURL}. Status: ${response.status} ${response.statusText}`);
                }
                return response.text(); // Get the response body as text
            })
            .then(data => {
                const placeholder = document.getElementById(placeholderId);
                if (placeholder) {
                    // Ensure the placeholder's parent exists before modifying outerHTML
                    if (placeholder.parentNode) {
                        placeholder.outerHTML = data; // Replace placeholder div with fetched HTML content
                        console.log(`[LoadComponents] Successfully loaded ${componentPath} into the element that was #${placeholderId}`);
                        
                        // Call the callback function after the HTML is injected
                        // Using requestAnimationFrame to ensure DOM update before callback
                        if (callback) {
                           requestAnimationFrame(() => {
                                callback();
                           });
                        }
                    } else {
                        console.error(`[LoadComponents] Parent node of placeholder '${placeholderId}' not found. Cannot replace.`);
                    }
                } else {
                    console.error(`[LoadComponents] Placeholder element with ID '${placeholderId}' not found in the HTML.`);
                }
            })
            .catch(error => {
                // Catch any errors during fetch or processing
                console.error(`[LoadComponents] Error loading component ${componentPath}:`, error);
                const placeholder = document.getElementById(placeholderId);
                if(placeholder) {
                    // Display an error message in the placeholder if it exists
                    placeholder.innerHTML = `<p style="color:red; background-color: #ffebee; border: 1px solid red; padding: 10px; border-radius: 5px;">Error loading ${componentPath}: ${error.message}. Please check the file path and ensure you are running this on a web server. Open the browser console (F12) and check the Network tab for more details.</p>`;
                }
            });
    }

    // Load header component
    // Assumes header.html is in the same directory as the main HTML file (e.g., index.html)
    loadHTMLComponent('header.html', 'header-placeholder', () => {
        console.log("[LoadComponents] Header HTML should now be loaded. Attempting to initialize header logic...");
        if (typeof initializeHeaderLogic === 'function') {
            initializeHeaderLogic(); // This function should be defined in your script.js
        } else {
            console.error("[LoadComponents] 'initializeHeaderLogic' function is not defined. Make sure script.js is loaded and the function is available globally.");
        }
    });

    // Load footer component
    // Assumes footer.html is in the same directory as the main HTML file (e.g., index.html)
    loadHTMLComponent('footer.html', 'footer-placeholder', () => {
        console.log("[LoadComponents] Footer HTML should now be loaded. Attempting to initialize footer logic...");
        if (typeof initializeFooterLogic === 'function') {
            initializeFooterLogic(); // This function should be defined in your script.js
        } else {
            console.error("[LoadComponents] 'initializeFooterLogic' function is not defined. Make sure script.js is loaded and the function is available globally.");
        }
    });
});
