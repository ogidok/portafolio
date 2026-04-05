document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Mobile Menu Logic
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    mobileMenu.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileMenu.classList.toggle('open');
    });

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

        // Carrusel 3D con arrastre
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

    // 3. Smooth Scroll Reveal
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

    // 4. Hero Glitch Effect Enhancement
    const glitchElement = document.querySelector('.glitch');
    if (glitchElement) {
        setInterval(() => {
            glitchElement.style.textShadow = Math.random() > 0.9 ? 
                `2px 0 var(--accent-cyan), -2px 0 var(--accent-green)` : 'none';
        }, 100);
    }
});