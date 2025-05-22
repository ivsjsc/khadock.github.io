<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Boat Dock Solutions. Custom dock design, construction and maintenance services.">
    <meta name="keywords" content="Premier Dock Solutions">
    <meta name="description" content="Offering expert design, construction, and remodeling services for boat docks, piers, and lifts across Florida. Quality craftsmanship guaranteed.">
    <meta property="og:image" content="images/logo/logo.jpg">
    <meta property="og:url" content="https://KhaDock.com/index.html">
    <link rel="icon" href="images/logo/logo.jpg" type="image/jpeg">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
    <link rel="stylesheet" href="css/styles.css">
    <style>
        body {
            font-family: 'Inter', sans-serif;
        }
        .hero-image-fullwidth-container {
            width: 100%;
            overflow: hidden;
        }
        .hero-image-fullwidth-container img,
        .hero-image-fullwidth-container picture img {
            width: 100%;
            height: auto;
            display: block;
        }
    </style>
</head>
<body>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const geminiUserInput = document.getElementById('gemini-user-input');
            const geminiSubmitBtn = document.getElementById('gemini-submit-btn');
            const translateBtn = document.getElementById('translate-btn');
            let isProcessing = false;
            let originalText = '';

            if (!geminiUserInput || !geminiSubmitBtn) {
                console.error('Required Gemini elements not found');
                return;
            }

            geminiSubmitBtn.addEventListener('click', async () => {
                if (isProcessing) return;
                
                try {
                    isProcessing = true;
                    geminiSubmitBtn.disabled = true;
                    translateBtn.classList.add('hidden');

                    const userInput = geminiUserInput.value.trim();
                    if (!userInput) {
                        throw new Error('Please enter your dock design requirements');
                    }

                    // Show loading state
                    showLoading(true);

                    // Make API call
                    const response = await fetchGeminiResponse(userInput);
                    handleGeminiResponse(response);

                } catch (error) {
                    handleError(error);
                } finally {
                    isProcessing = false;
                    geminiSubmitBtn.disabled = false;
                    showLoading(false);
                }
            });
        });

        function showLoading(show) {
            const loadingEl = document.getElementById('gemini-loading');
            if (loadingEl) {
                loadingEl.classList.toggle('hidden', !show);
            }
        }

        function handleError(error) {
            const errorEl = document.getElementById('gemini-error');
            if (errorEl) {
                errorEl.textContent = error.message;
                errorEl.classList.remove('hidden');
            }
            console.error('Gemini Error:', error);
        }
    </script>
    <style>
        .service-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }
        .album-image {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .album-image:hover {
            transform: scale(1.05);
            box-shadow: 0 8px 16px rgba(0,0,0,0.2);
        }
        #gemini-output h3 {
            font-size: 1.25rem; 
            font-weight: 600; 
            color: #1e3a8a; 
            margin-top: 1rem;
            margin-bottom: 0.5rem;
        }
        #gemini-output ul {
            list-style-type: disc;
            margin-left: 1.5rem;
            margin-bottom: 1rem;
        }
        #gemini-output li {
            margin-bottom: 0.25rem;
        }
        #gemini-output p {
            margin-bottom: 0.75rem;
            line-height: 1.625; 
        }
    </style>
    <body class="bg-slate-100 text-slate-800 antialiased">
        <div id="header-placeholder"></div>
        <main id="main-content-area" class="min-h-screen">
            <section class="flex flex-col" data-aos="fade-in">
                <div class="hero-image-fullwidth-container w-full max-h-[600px] overflow-hidden" data-aos="fade-down" data-aos-delay="50">
                    <picture>
                        <source srcset="images/logo/logo.jpg" type="image/jpg">
                        <source srcset="images/logo/logo.jpg" type="image/jpeg">
                        <img 
                            src="images/logo/logo.jpg"
                            alt="KhaDock - Florida's Premier Boat Dock Solutions"
                            class="shadow-lg w-full h-auto object-cover" 
                            loading="eager" 
                            width="1920" 
                            height="1080"
                        >
                    </picture>
                </div>
            </section>
            <section 
                class="relative min-h-[600px] md:h-[70vh] flex items-center justify-center text-center bg-cover bg-center bg-[url('images/albums/dock15.jpg')] bg-blend-multiply bg-black/60" 
                data-aos="fade-down" 
                data-aos-delay="50"
            >
                <div class="container mx-auto px-4 sm:px-6 lg:px-8 text-white z-10 py-16">
                    <h1 class="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 text-shadow-strong" data-aos="fade-down" data-aos-delay="100">
                        KhaDock.com
                    </h1>
                    <h2 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-shadow-strong" data-aos="fade-down" data-aos-delay="200">
                        IN FLORIDA
                    </h2>
                    <p class="text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto text-slate-200 text-shadow" data-aos="fade-up" data-aos-delay="400">
                        Building Finest Boat Dock Experiences
                    </p>
                </div>
            </section>
            <section class="py-16 md:py-24 bg-slate-50" id="services-overview" data-aos="fade-up">
                <div class="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="text-center mb-12 md:mb-16">
                        <h2 class="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Our Core Services</h2>
                        <p class="text-base md:text-lg text-slate-600 max-w-xl mx-auto">
                            From concept to completion, we provide a full range of dock and marine construction services tailored to your needs.
                        </p>
                    </div>
                    <div class="grid gap-8 md:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        <div class="service-card bg-white p-6 md:p-8 rounded-xl shadow-lg text-center flex flex-col items-center" data-aos="zoom-in-up" data-aos-delay="100">
                            <div class="text-sky-500 mb-5 md:mb-6">
                                <i class="fas fa-drafting-compass fa-3x"></i>
                            </div>
                            <h3 class="text-xl md:text-2xl font-semibold text-slate-800 mb-3">Custom Dock Design & Remodeling</h3>
                            <p class="text-slate-600 text-sm md:text-base mb-5 flex-grow">
                                Tailored designs and expert remodeling to perfectly suit your waterfront property and lifestyle, enhancing both beauty and functionality.
                            </p>
                            <a href="services.html#design" class="text-sky-600 hover:text-sky-700 font-semibold mt-auto inline-flex items-center group text-sm">
                                Learn More <i class="fas fa-arrow-right fa-xs ml-2 transform group-hover:translate-x-1 transition-transform"></i>
                            </a>
                        </div>
                        <div class="service-card bg-white p-6 md:p-8 rounded-xl shadow-lg text-center flex flex-col items-center" data-aos="zoom-in-up" data-aos-delay="200">
                            <div class="text-sky-500 mb-5 md:mb-6">
                                <i class="fas fa-tools fa-3x"></i>
                            </div>
                            <h3 class="text-xl md:text-2xl font-semibold text-slate-800 mb-3">Repair & Maintenance</h3>
                            <p class="text-slate-600 text-sm md:text-base mb-5 flex-grow">
                                Comprehensive repair and maintenance to keep your dock in top condition, ensuring safety and extending its lifespan.
                            </p>
                            <a href="services.html#repair" class="text-sky-600 hover:text-sky-700 font-semibold mt-auto inline-flex items-center group text-sm">
                                Learn More <i class="fas fa-arrow-right fa-xs ml-2 transform group-hover:translate-x-1 transition-transform"></i>
                            </a>
                        </div>
                        <div class="service-card bg-white p-6 md:p-8 rounded-xl shadow-lg text-center flex flex-col items-center" data-aos="zoom-in-up" data-aos-delay="300">
                            <div class="text-sky-500 mb-5 md:mb-6">
                                <i class="fas fa-anchor fa-3x"></i>
                            </div>
                            <h3 class="text-xl md:text-2xl font-semibold text-slate-800 mb-3">Dock Upgrades & Accessories</h3>
                            <p class="text-slate-600 text-sm md:text-base mb-5 flex-grow">
                                Upgrade materials, add new amenities like boat lifts or lighting, and enhance your dock for better functionality and style.
                            </p>
                            <a href="services.html#upgrades" class="text-sky-600 hover:text-sky-700 font-semibold mt-auto inline-flex items-center group text-sm">
                                Learn More <i class="fas fa-arrow-right fa-xs ml-2 transform group-hover:translate-x-1 transition-transform"></i>
                            </a>
                        </div>
                    </div>
                    <div class="text-center mt-12 md:mt-16">
                        <a href="services.html" class="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition duration-300 transform hover:scale-105 text-lg">
                            Explore All Services
                        </a>
                    </div>
                </div>
            </section>
            <section class="py-16 md:py-24 bg-white" data-aos="fade-up">
                <div class="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="text-center mb-12 md:mb-16">
                        <h2 class="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Why Choose KhaDock?</h2>
                        <p class="text-lg text-slate-600 max-w-2xl mx-auto">
                            We are committed to delivering superior quality, exceptional service, and lasting value to every client in Florida.
                        </p>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div class="p-8 bg-slate-50 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300" data-aos="fade-right" data-aos-delay="100">
                            <div class="flex items-center mb-4">
                                <i class="fas fa-medal fa-2x text-sky-500 mr-4"></i>
                                <h3 class="text-xl font-semibold text-slate-700">Florida Marine Expertise</h3>
                            </div>
                            <p class="text-slate-600 text-sm leading-relaxed">
                                Deep understanding of Florida's unique coastal conditions, permitting processes, and stringent building codes.
                            </p>
                        </div>
                        <div class="p-8 bg-slate-50 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300" data-aos="fade-up" data-aos-delay="200">
                            <div class="flex items-center mb-4">
                                <i class="fas fa-gem fa-2x text-sky-500 mr-4"></i>
                                <h3 class="text-xl font-semibold text-slate-700">Premium Quality Materials</h3>
                            </div>
                            <p class="text-slate-600 text-sm leading-relaxed">
                                We use only the best marine-grade lumber, composite decking, and hardware to ensure longevity and resilience.
                            </p>
                        </div>
                        <div class="p-8 bg-slate-50 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300" data-aos="fade-left" data-aos-delay="300">
                            <div class="flex items-center mb-4">
                                <i class="fas fa-handshake-angle fa-2x text-sky-500 mr-4"></i>
                                <h3 class="text-xl font-semibold text-slate-700">Customer-Focused Approach</h3>
                            </div>
                            <p class="text-slate-600 text-sm leading-relaxed">
                                Your satisfaction is our priority. We collaborate closely with you from initial design to final walkthrough.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            <section class="py-16 md:py-24 bg-sky-50" data-aos="fade-up" id="gemini-assistant-section">
                <div class="container mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-12 md:mb-16">
                    <h2 class="text-3xl md:text-4xl font-bold text-slate-800 mb-4">✨ Smart Dock Project Assistant ✨</h2>
                    <p class="text-lg text-slate-600 max-w-2xl mx-auto">
                    Have an idea for your dream dock? Share it with KhaDock's AI assistant! Describe your needs, preferred style, materials, or any special features you have in mind. The assistant will help outline your concept and suggest suitable services.
                    </p>
                </div>
                <div class="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-xl border border-slate-200">
                    <textarea id="gemini-user-input" class="w-full p-3 sm:p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 mb-6 resize-y min-h-[100px] sm:min-h-[120px] text-slate-800 text-sm sm:text-base"
                        placeholder="Example: I want a modern dock with a covered lounge area...">
                    </textarea>
                                    <div class="flex flex-wrap gap-4 items-center">
                        <button id="gemini-submit-btn" class="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-6 sm:px-8 rounded-lg shadow-md hover:shadow-lg transition duration-300 transform hover:scale-105 inline-flex items-center justify-center text-sm sm:text-base">
                            <i class="fas fa-lightbulb mr-2 sm:mr-3"></i> Generate Idea
                        </button>
                                        <button id="translate-btn" class="hidden bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 inline-flex items-center justify-center text-sm sm:text-base">
                            <i class="fas fa-language mr-2"></i> Translate to Vietnamese
                        </button>
                    </div>
                </div>
            </section>
            <section class="py-16 md:py-24 bg-sky-700 text-white" data-aos="zoom-in">
                <div class="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 class="text-3xl md:text-4xl font-bold mb-6 text-shadow-custom">Ready to Start Your Dream Dock Project?</h2>
                    <p class="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-slate-100">
                        Let's discuss your vision. Contact KhaDock today for a personalized consultation and a no-obligation, free estimate.
                    </p>
                    <a href="contact.html" class="bg-white text-sky-700 font-bold py-3.5 px-10 rounded-lg text-lg shadow-lg transition duration-300 transform hover:scale-105 hover:bg-slate-100">
                        Schedule Your Consultation
                    </a>
                </div>
            </section>
        </main>
        <div id="footer-placeholder"></div>
        <!-- Fix the scroll to top button -->
        <button id="scrollToTopBtn" title="Go to top"
                class="hidden fixed bottom-8 right-8 bg-sky-500 hover:bg-sky-600 text-white
                       w-14 h-14 rounded-full shadow-xl flex items-center justify-center
                       focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75
                       transition-all duration-300 z-40 text-xl">
            <i class="fas fa-arrow-up"></i>
        </button>

        <!-- Fix script loading -->
        <script src="https://unpkg.com/aos@2.3.1/dist/aos.js" defer></script>
        <script src="js/script.js" defer></script>
        <script src="js/loadComponents.js" defer></script>
        <script src="js/gemini.js" defer></script>
    </body>
</html>
