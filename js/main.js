import { loadAppComponents } from './loadComponents.js';

document.addEventListener('DOMContentLoaded', function() {
    loadAppComponents();

    AOS.init({
        offset: 120,
        duration: 900,
        easing: 'ease-out-quad',
        once: true,
        mirror: false,
        anchorPlacement: 'top-bottom',
    });
});
