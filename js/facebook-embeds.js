const FACEBOOK_SDK_VERSION = 'v25.0';
const FACEBOOK_SDK_SRC = `https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=${FACEBOOK_SDK_VERSION}`;

const FACEBOOK_POSTS = [
    {
        url: 'https://www.facebook.com/doduy.kha/videos/983123767977378/',
        label: 'Latest public reel',
        note: 'Newest timeline post'
    },
    {
        url: 'https://www.facebook.com/doduy.kha/videos/1243406171048511/',
        label: 'Recent service update',
        note: 'Public video from the timeline'
    },
    {
        url: 'https://www.facebook.com/doduy.kha/videos/1519905626441556/',
        label: 'Recent jobsite clip',
        note: 'Another public video update'
    },
    {
        url: 'https://www.facebook.com/doduy.kha/photos/d41d8cd9/10174781784770249/',
        label: 'Recent photo post',
        note: 'Public photo update'
    }
];

let facebookSdkPromise = null;
let observedSection = null;
let renderedMode = null;
let lazyLoadingSetup = false;

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function isDesktopViewport() {
    return window.matchMedia('(min-width: 768px)').matches;
}

function loadFacebookSDK() {
    if (window.FB && window.FB.XFBML) {
        return Promise.resolve(window.FB);
    }

    if (facebookSdkPromise) {
        return facebookSdkPromise;
    }

    facebookSdkPromise = new Promise((resolve, reject) => {
        window.fbAsyncInit = function () {
            if (window.FB) {
                window.FB.init({
                    xfbml: false,
                    version: FACEBOOK_SDK_VERSION
                });
            }
            resolve(window.FB);
        };

        const existingScript = document.getElementById('facebook-jssdk');
        if (existingScript) {
            existingScript.addEventListener('load', () => resolve(window.FB), { once: true });
            existingScript.addEventListener('error', () => reject(new Error('Facebook SDK failed to load.')), { once: true });
            return;
        }

        const script = document.createElement('script');
        script.id = 'facebook-jssdk';
        script.async = true;
        script.defer = true;
        script.crossOrigin = 'anonymous';
        script.src = FACEBOOK_SDK_SRC;
        script.onerror = () => reject(new Error('Facebook SDK failed to load.'));
        document.body.appendChild(script);
    });

    return facebookSdkPromise;
}

function buildEmbedCard(post) {
    return `
        <article class="rounded-2xl bg-white shadow-xl border border-slate-200 overflow-hidden p-4">
            <div class="fb-post" data-href="${escapeHtml(post.url)}" data-show-text="true" data-lazy="true"></div>
            <div class="pt-4 flex items-start justify-between gap-4">
                <div>
                    <p class="text-sm font-semibold text-slate-800">${escapeHtml(post.label)}</p>
                    <p class="text-xs text-slate-500 mt-1">${escapeHtml(post.note)}</p>
                </div>
                <a href="${escapeHtml(post.url)}" target="_blank" rel="noopener noreferrer" class="shrink-0 inline-flex items-center text-sm font-semibold text-sky-700 hover:text-sky-800">
                    Open
                    <i class="fas fa-arrow-up-right-from-square ml-2 text-xs"></i>
                </a>
            </div>
        </article>
    `;
}

function buildMobileMarkup() {
    const [featured, ...rest] = FACEBOOK_POSTS;

    return `
        ${buildEmbedCard(featured)}
        <div class="grid gap-3">
            ${rest.map(post => `
                <a href="${escapeHtml(post.url)}" target="_blank" rel="noopener noreferrer" class="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-transform duration-300 hover:-translate-y-0.5">
                    <div>
                        <p class="font-semibold text-slate-800">${escapeHtml(post.label)}</p>
                        <p class="text-sm text-slate-500 mt-1">${escapeHtml(post.note)}</p>
                    </div>
                    <i class="fas fa-arrow-up-right-from-square text-sky-600"></i>
                </a>
            `).join('')}
        </div>
    `;
}

function buildDesktopMarkup() {
    return FACEBOOK_POSTS.map(buildEmbedCard).join('');
}

function parseFacebookEmbeds(section) {
    if (window.FB && window.FB.XFBML) {
        window.FB.XFBML.parse(section);
    }
}

async function renderFacebookSection() {
    const section = document.querySelector('[data-facebook-updates]');
    if (!section) {
        return;
    }

    const mobileContainer = section.querySelector('[data-facebook-mobile]');
    const desktopContainer = section.querySelector('[data-facebook-desktop]');
    if (!mobileContainer || !desktopContainer) {
        return;
    }

    const mode = isDesktopViewport() ? 'desktop' : 'mobile';
    if (renderedMode === mode && section.dataset.facebookRendered === 'true') {
        return;
    }

    renderedMode = mode;
    section.dataset.facebookRendered = 'true';

    mobileContainer.innerHTML = '';
    desktopContainer.innerHTML = '';

    if (mode === 'desktop') {
        desktopContainer.classList.remove('hidden');
        mobileContainer.classList.add('hidden');
        desktopContainer.innerHTML = buildDesktopMarkup();
    } else {
        mobileContainer.classList.remove('hidden');
        desktopContainer.classList.add('hidden');
        mobileContainer.innerHTML = buildMobileMarkup();
    }

    await loadFacebookSDK();
    parseFacebookEmbeds(section);
}

function scheduleRender() {
    if (scheduleRender.timer) {
        clearTimeout(scheduleRender.timer);
    }

    scheduleRender.timer = setTimeout(() => {
        if (observedSection && observedSection.getBoundingClientRect().top < window.innerHeight + 300) {
            renderFacebookSection().catch(error => {
                console.error('[Script] Failed to render Facebook updates:', error);
            });
        }
    }, 120);
}

function setupLazyLoading() {
    if (lazyLoadingSetup) {
        return;
    }

    const section = document.querySelector('[data-facebook-updates]');
    if (!section) {
        return;
    }

    observedSection = section;
    lazyLoadingSetup = true;

    if (typeof IntersectionObserver === 'undefined') {
        renderFacebookSection().catch(error => {
            console.error('[Script] Failed to render Facebook updates:', error);
        });
        window.addEventListener('resize', scheduleRender, { passive: true });
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
            obs.disconnect();
            renderFacebookSection().catch(error => {
                console.error('[Script] Failed to render Facebook updates:', error);
            });
        }
    }, {
        root: null,
        rootMargin: '300px 0px',
        threshold: 0.01
    });

    observer.observe(section);

    window.addEventListener('resize', scheduleRender, { passive: true });
}

function initFacebookUpdates() {
    const section = document.querySelector('[data-facebook-updates]');
    if (!section) {
        return;
    }

    setupLazyLoading();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFacebookUpdates, { once: true });
} else {
    initFacebookUpdates();
}

document.addEventListener('allAppComponentsLoaded', initFacebookUpdates);
