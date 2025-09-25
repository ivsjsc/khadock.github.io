document.addEventListener('allAppComponentsLoaded', () => {
    const fabContainer = document.getElementById('fab-container');
    const contactButton = document.getElementById('contact-fab-btn');
    const contactCard = document.getElementById('contact-info-card');
    const contactWrapper = document.getElementById('contact-fab-wrapper');
    const scrollTopButton = document.getElementById('scroll-to-top-btn');

    if (!fabContainer) {
        console.error('FAB container not found. Ensure fab-container.html is loaded.');
        return;
    }

    function showContactCard() {
        if (!contactCard) return;
        contactCard.classList.remove('hidden');
        requestAnimationFrame(() => {
            contactCard.classList.remove('opacity-0', 'translate-y-2', 'pointer-events-none');
            contactCard.classList.add('opacity-100', 'translate-y-0');
        });
    }

    function hideContactCard() {
        if (!contactCard) return;
        contactCard.classList.add('opacity-0', 'translate-y-2', 'pointer-events-none');
        contactCard.classList.remove('opacity-100', 'translate-y-0');
        setTimeout(() => {
            if (contactCard.classList.contains('opacity-0')) {
                contactCard.classList.add('hidden');
            }
        }, 180);
    }

    if (contactButton && contactCard && contactWrapper) {
        contactButton.addEventListener('click', (event) => {
            event.stopPropagation();
            const isHidden = contactCard.classList.contains('hidden') || contactCard.classList.contains('opacity-0');
            if (isHidden) {
                showContactCard();
            } else {
                hideContactCard();
            }
        });

        document.addEventListener('click', (event) => {
            if (!contactWrapper.contains(event.target)) {
                hideContactCard();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                hideContactCard();
            }
        });
    } else {
        console.warn('Contact FAB elements missing.');
    }

    if (scrollTopButton) {
        const toggleScrollButton = () => {
            if (window.scrollY > 200) {
                scrollTopButton.classList.remove('opacity-0', 'pointer-events-none', 'scale-90');
                scrollTopButton.classList.add('opacity-100', 'scale-100');
            } else {
                scrollTopButton.classList.add('opacity-0', 'pointer-events-none', 'scale-90');
                scrollTopButton.classList.remove('opacity-100', 'scale-100');
            }
        };

        toggleScrollButton();
        window.addEventListener('scroll', toggleScrollButton, { passive: true });

        scrollTopButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    } else {
        console.warn('Scroll-to-top FAB button not found.');
    }
});
