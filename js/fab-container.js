// fab-container.js
// This script handles the interactivity for the Floating Action Button (FAB).
// It toggles the visibility of the social media icons when the main FAB button is clicked.

// Wait for all application components, including fab-container.html, to be loaded.
document.addEventListener('allAppComponentsLoaded', function() {
    // Get references to the main FAB button and the container for social icons
    const mainFabBtn = document.getElementById('mainFabBtn');
    const socialIconsContainer = document.getElementById('socialIconsContainer');
    const fabContainer = document.getElementById('fab-container'); // Reference to the entire FAB container

    // Check if both elements exist to prevent errors
    if (mainFabBtn && socialIconsContainer && fabContainer) {
        // Add a click event listener to the main FAB button
        mainFabBtn.addEventListener('click', function() {
            // Toggle the 'hidden' class to show/hide the social icons container
            socialIconsContainer.classList.toggle('hidden');
            
            // Optional: Add/remove classes for a more explicit animation if needed
            // For now, Tailwind's transition classes on the container handle basic fade/slide.
            // If you want more complex animations (e.g., individual icon reveal),
            // you would add/remove specific animation classes here.
        });

        // Add a click event listener to the document to close the social icons
        // when a click occurs outside the FAB container.
        document.addEventListener('click', function(event) {
            // Check if the click target is outside the FAB container AND
            // if the social icons container is currently visible (not hidden).
            if (!fabContainer.contains(event.target) && !socialIconsContainer.classList.contains('hidden')) {
                socialIconsContainer.classList.add('hidden'); // Hide the social icons
            }
        });
    } else {
        // Log an error if the FAB elements are not found, indicating a potential loading issue.
        console.error('FAB elements (mainFabBtn, socialIconsContainer, or fab-container) not found. Please ensure fab-container.html is loaded correctly.');
    }
});
