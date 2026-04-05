document.addEventListener('DOMContentLoaded', () => {

    // 1. Mobile Menu Logic
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenu && navLinks) {
        mobileMenu.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenu.classList.toggle('open');
        });
    }

    // Add style for active mobile menu via JS
    const style = document.createElement('style');
    style.textContent = `
        .nav-links.active {
            display: flex;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            background: rgba(10, 10, 12, 0.95);
            padding: 2rem;
            border-bottom: 1px solid var(--accent-cyan);
        }
        .menu-toggle span {
            display: block;
            width: 25px;
            height: 3px;
            background: var(--accent-cyan);
            margin: 5px 0;
            transition: 0.4s;
        }
    `;
    document.head.append(style);

    // 2. Internationalization (i18n)
    const I18N_STORAGE_KEY = 'portfolio_lang';
    const I18N_FALLBACK_LANG = 'es';
    const I18N_SUPPORTED_LANGS = ['es', 'en'];
    const langButtons = document.querySelectorAll('[data-lang-switch]');
    let i18nData = {};

    const normalizeLanguage = (langValue) => {
        const normalized = (langValue || '').toLowerCase();
        if (normalized.startsWith('es')) {
            return 'es';
        }
        return 'en';
    };

    const getInitialLanguage = () => {
        const savedLang = localStorage.getItem(I18N_STORAGE_KEY);
        const fromStorage = normalizeLanguage(savedLang);
        if (savedLang && I18N_SUPPORTED_LANGS.includes(fromStorage)) {
            return fromStorage;
        }

        const browserLang = normalizeLanguage(navigator.language);
        if (I18N_SUPPORTED_LANGS.includes(browserLang)) {
            return browserLang;
        }
        return I18N_FALLBACK_LANG;
    };

    const getByPath = (source, keyPath) => {
        return keyPath.split('.').reduce((acc, key) => {
            if (acc && Object.prototype.hasOwnProperty.call(acc, key)) {
                return acc[key];
            }
            return undefined;
        }, source);
    };

    const setMetaContent = (selector, value) => {
        if (!value) {
            return;
        }
        const meta = document.querySelector(selector);
        if (meta) {
            meta.setAttribute('content', value);
        }
    };

    const applyTranslations = (lang) => {
        document.documentElement.lang = lang;

        document.querySelectorAll('[data-i18n]').forEach((element) => {
            const key = element.getAttribute('data-i18n');
            const translated = getByPath(i18nData, key);
            if (typeof translated === 'string') {
                element.textContent = translated;
            }
        });

        const pageTitle = getByPath(i18nData, 'meta.title');
        if (pageTitle) {
            document.title = pageTitle;
        }

        setMetaContent('meta[property="og:title"]', getByPath(i18nData, 'meta.ogTitle'));
        setMetaContent('meta[property="og:description"]', getByPath(i18nData, 'meta.ogDescription'));
        setMetaContent('meta[name="twitter:title"]', getByPath(i18nData, 'meta.twitterTitle'));
        setMetaContent('meta[name="twitter:description"]', getByPath(i18nData, 'meta.twitterDescription'));

        langButtons.forEach((button) => {
            const btnLang = button.getAttribute('data-lang-switch');
            button.classList.toggle('is-active', btnLang === lang);
        });
    };

    const loadTranslations = async (lang) => {
        const response = await fetch(`locales/${lang}.json`);
        if (!response.ok) {
            throw new Error(`Failed to load locale: ${lang}`);
        }
        return response.json();
    };

    const changeLanguage = async (nextLang) => {
        const safeLang = I18N_SUPPORTED_LANGS.includes(nextLang)
            ? nextLang
            : I18N_FALLBACK_LANG;
        let appliedLang = safeLang;

        try {
            i18nData = await loadTranslations(safeLang);
        } catch (_) {
            i18nData = await loadTranslations(I18N_FALLBACK_LANG);
            appliedLang = I18N_FALLBACK_LANG;
        }

        localStorage.setItem(I18N_STORAGE_KEY, appliedLang);
        applyTranslations(appliedLang);
    };

    langButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const selectedLang = button.getAttribute('data-lang-switch');
            changeLanguage(selectedLang);
        });
    });

    changeLanguage(getInitialLanguage());

    // 3. Carrusel 3D con arrastre
        const carousel = document.querySelector('.icon-cards');
        if (carousel) {
            const content = carousel.querySelector('.icon-cards__content');
            const totalSlides = content ? content.children.length : 0;
            const rotationStep = totalSlides > 0 ? 360 / totalSlides : 0;
            const autoRotateDelay = 2400;

            if (content && totalSlides > 0) {
                Array.from(content.children).forEach((slide, index) => {
                    slide.style.setProperty('--item-angle', `${index * rotationStep}deg`);
                });
            }

            let currentIndex = 0;
            let currentAngle = 0;
            let autoRotateId = null;
            let isDragging = false;
            let dragStartX = 0;
            let dragDeltaX = 0;
            let dragStartAngle = 0;

            const setAngle = (angle) => {
                currentAngle = angle;
                if (content) {
                    content.style.setProperty('--carousel-angle', `${angle}deg`);
                }
            };

            const stepSlides = (delta) => {
                if (!content || totalSlides === 0) {
                    return;
                }
                currentIndex = (currentIndex + delta + totalSlides) % totalSlides;
                setAngle(currentAngle - rotationStep * delta);
            };

            const startAutoRotate = () => {
                if (autoRotateId || totalSlides <= 1) {
                    return;
                }
                autoRotateId = setInterval(() => {
                    stepSlides(1);
                }, autoRotateDelay);
            };

            const stopAutoRotate = () => {
                if (!autoRotateId) {
                    return;
                }
                clearInterval(autoRotateId);
                autoRotateId = null;
            };

            const handlePointerMove = (event) => {
                if (!isDragging || !content) {
                    return;
                }
                const width = carousel.offsetWidth || 1;
                dragDeltaX = (event.clientX ?? dragStartX) - dragStartX;
                const dragAngle = dragStartAngle + (dragDeltaX / width) * rotationStep;
                content.style.setProperty('--carousel-angle', `${dragAngle}deg`);
            };

            const handlePointerUp = (event) => {
                if (!isDragging) {
                    return;
                }
                const width = carousel.offsetWidth || 1;
                const deltaX = dragDeltaX;
                const threshold = Math.max(width * 0.15, 40);

                isDragging = false;
                carousel.classList.remove('icon-cards--dragging');
                if (typeof event.pointerId === 'number' && carousel.releasePointerCapture) {
                    try {
                        carousel.releasePointerCapture(event.pointerId);
                    } catch (_) {
                        // Ignore release errors if capture was not set
                    }
                }
                window.removeEventListener('pointermove', handlePointerMove);
                window.removeEventListener('pointerup', handlePointerUp);
                window.removeEventListener('pointercancel', handlePointerUp);

                if (deltaX > threshold) {
                    stepSlides(-1);
                } else if (deltaX < -threshold) {
                    stepSlides(1);
                } else {
                    setAngle(dragStartAngle);
                }

                startAutoRotate();
            };

            carousel.addEventListener('pointerdown', (event) => {
                if (!content || totalSlides <= 1) {
                    return;
                }
                if (typeof event.button === 'number' && event.button !== 0) {
                    return;
                }
                event.preventDefault();
                isDragging = true;
                dragStartX = event.clientX ?? 0;
                dragDeltaX = 0;
                dragStartAngle = currentAngle;
                stopAutoRotate();
                carousel.classList.add('icon-cards--dragging');
                if (typeof event.pointerId === 'number' && carousel.setPointerCapture) {
                    carousel.setPointerCapture(event.pointerId);
                }
                window.addEventListener('pointermove', handlePointerMove);
                window.addEventListener('pointerup', handlePointerUp);
                window.addEventListener('pointercancel', handlePointerUp);
            });

            carousel.addEventListener('mouseenter', () => {
                if (!isDragging) {
                    stopAutoRotate();
                }
            });

            carousel.addEventListener('mouseleave', () => {
                if (!isDragging) {
                    startAutoRotate();
                }
            });

            setAngle(0);
            startAutoRotate();
        }

    // 4. Smooth Scroll Reveal
    const revealOnScroll = () => {
        const sections = document.querySelectorAll('section');
        const triggerBottom = window.innerHeight * 0.8;

        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            if (sectionTop < triggerBottom) {
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            }
        });
    };

    // Initial styles for sections to animate
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'all 0.8s ease-out';
    });

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Trigger once on load

    // 5. Hero Glitch Effect Enhancement
    const glitchElement = document.querySelector('.glitch');
    if (glitchElement) {
        setInterval(() => {
            glitchElement.style.textShadow = Math.random() > 0.9 ? 
                `2px 0 var(--accent-cyan), -2px 0 var(--accent-green)` : 'none';
        }, 100);
    }
});