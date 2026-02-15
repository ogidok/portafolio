'use strict';

// Fondo lluvia pixelart tipo Matrix
const canvas = document.getElementById('rain-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  canvas.style.position = 'fixed';
  canvas.style.top = 0;
  canvas.style.left = 0;
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.zIndex = 0;
  canvas.style.pointerEvents = 'none';
  canvas.style.opacity = 0.25;

  const fontSize = 16;
  let columns;
  let drops;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function setupRain() {
    columns = Math.floor(canvas.width / fontSize);
    drops = Array(columns).fill(1);
  }

  function drawRain() {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = fontSize + "px 'Press Start 2P', monospace";
    ctx.fillStyle = '#660000';
    for (let i = 0; i < drops.length; i++) {
      const text = String.fromCharCode(0x2592 + Math.floor(Math.random() * 10));
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i] += 1;
    }
  }

  resizeCanvas();
  setupRain();
  window.addEventListener('resize', () => {
    resizeCanvas();
    setupRain();
  });
  setInterval(drawRain, 60);
}

// Botón subir arriba
const scrollBtn = document.getElementById('scrollToTopBtn');
if (scrollBtn) {
  window.addEventListener('scroll', () => {
    if (document.body.scrollTop > 260 || document.documentElement.scrollTop > 260) {
      scrollBtn.style.display = 'block';
    } else {
      scrollBtn.style.display = 'none';
    }
  });

  scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Carrusel 3D con arrastre
const carousel = document.querySelector('.icon-cards');
if (carousel) {
  const content = carousel.querySelector('.icon-cards__content');
  const totalSlides = content ? content.children.length : 0;
  const rotationStep = totalSlides > 0 ? 360 / totalSlides : 0;
  const autoRotateDelay = 2400;

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
