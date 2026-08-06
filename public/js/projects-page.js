// js/projects-page.js
document.addEventListener('DOMContentLoaded', () => {
    const filterButtonsContainer = document.getElementById('project-filters');
    const projectCards = document.querySelectorAll('#project-grid .project-card');

    if (filterButtonsContainer && projectCards.length > 0) {
        const filterButtons = filterButtonsContainer.querySelectorAll('.filter-button');

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Update active state for buttons
                filterButtons.forEach(btn => {
                    btn.classList.remove('active', 'bg-sky-500', 'text-white', 'border-sky-500');
                    // Add back default/inactive classes if needed, e.g., Tailwind's default button styling
                });
                button.classList.add('active', 'bg-sky-500', 'text-white', 'border-sky-500');

                const filterValue = button.getAttribute('data-filter');

                projectCards.forEach(card => {
                    const categories = card.getAttribute('data-category'); // Ensure cards have this attribute
                    if (filterValue === 'all' || (categories && categories.includes(filterValue))) {
                        card.style.display = 'flex'; // Or 'block', 'grid' depending on your card layout
                        // card.classList.remove('hidden'); // Alternative using Tailwind
                    } else {
                        card.style.display = 'none';
                        // card.classList.add('hidden'); // Alternative using Tailwind
                    }
                });
            });
        });
    } else {
        if (!filterButtonsContainer) console.warn("Project filters container (#project-filters) not found.");
        if (projectCards.length === 0) console.warn("No project cards (#project-grid .project-card) found.");
    }

    // Lightbox functionality
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    const closeBtn = document.getElementsByClassName("close")[0];
    const galleryImages = document.querySelectorAll('.album-grid img, .project-section img');

    galleryImages.forEach(img => {
        img.addEventListener('click', function() {
            modal.style.display = "flex";
            modalImg.src = this.src;
            modalImg.alt = this.alt;
        });
    });

    closeBtn.onclick = function() { 
        modal.style.display = "none";
    }
    
    modal.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    }
});