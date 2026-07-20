import './style.css';

document.addEventListener('DOMContentLoaded', () => {
  // Update year in footer
  document.getElementById('year').textContent = new Date().getFullYear();

  // Navbar scroll effect & Hero parallax
  const navbar = document.querySelector('.navbar');
  const parallaxLayers = document.querySelectorAll('.parallax-layer');
  
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    
    // Navbar
    if (scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    
    // Hero parallax effect (only active when hero is visible to save performance, roughly)
    if (scrollY < window.innerHeight) {
      parallaxLayers.forEach(layer => {
        const speed = layer.getAttribute('data-speed');
        const yPos = -(scrollY * speed);
        layer.style.transform = `translateY(${yPos}px)`;
      });
    }
  });

  // Hide navbar button when other CTA buttons are visible on screen (with 5s delay on appearance)
  const navbarBtn = document.querySelector('.navbar .btn');
  const otherCtaButtons = document.querySelectorAll('.hero-book-btn, .services-cta .btn');

  if (navbarBtn && otherCtaButtons.length > 0) {
    const visibleCtas = new Set();
    let appearanceTimer = null;

    const ctaObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          visibleCtas.add(entry.target);
        } else {
          visibleCtas.delete(entry.target);
        }
      });
      
      if (visibleCtas.size > 0) {
        if (appearanceTimer) {
          clearTimeout(appearanceTimer);
          appearanceTimer = null;
        }
        navbarBtn.classList.add('navbar-btn-hidden');
      } else {
        if (!appearanceTimer && navbarBtn.classList.contains('navbar-btn-hidden')) {
          appearanceTimer = setTimeout(() => {
            if (visibleCtas.size === 0) {
              navbarBtn.classList.remove('navbar-btn-hidden');
            }
            appearanceTimer = null;
          }, 2000);
        }
      }
    }, {
      root: null,
      threshold: 0
    });

    otherCtaButtons.forEach(btn => ctaObserver.observe(btn));
  }

  // Intersection Observer for fade-in animations
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-up');
        // Stop observing once animated
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Select elements to animate
  const animateElements = document.querySelectorAll('.service-category, .gallery-slider-wrapper');
  
  animateElements.forEach(el => {
    // Set initial state
    el.style.opacity = '0';
    observer.observe(el);
  });

  // Handle single "Показать еще" button for all categories
  const btnShowAll = document.getElementById('btn-show-more-all');
  const serviceWrappers = document.querySelectorAll('.service-list-wrapper');

  if (btnShowAll && serviceWrappers.length > 0) {
    // Function to calculate collapsed height for a wrapper
    const getCollapsedHeight = (wrapper) => {
      const items = wrapper.querySelectorAll('.service-item');
      let height = 0;
      const count = Math.min(items.length, 3);
      for (let i = 0; i < count; i++) {
        height += items[i].offsetHeight;
      }
      if (count > 1) {
        // gap between items is 1rem (16px)
        height += (count - 1) * 16;
      }
      return height;
    };

    // Initialize all wrappers
    const initHeights = () => {
      serviceWrappers.forEach(wrapper => {
        if (!wrapper.classList.contains('expanded')) {
          const collapsedHeight = getCollapsedHeight(wrapper);
          wrapper.style.maxHeight = collapsedHeight + 'px';
        } else {
          const list = wrapper.querySelector('.service-list');
          wrapper.style.maxHeight = list.scrollHeight + 'px';
        }
      });
    };

    // Run init on load
    initHeights();
    window.addEventListener('load', initHeights);

    // Update heights on window resize
    window.addEventListener('resize', initHeights);

    btnShowAll.addEventListener('click', () => {
      const isExpanded = btnShowAll.classList.contains('expanded');
      
      serviceWrappers.forEach(wrapper => {
        const list = wrapper.querySelector('.service-list');
        if (isExpanded) {
          wrapper.classList.remove('expanded');
          const collapsedHeight = getCollapsedHeight(wrapper);
          wrapper.style.maxHeight = collapsedHeight + 'px';
        } else {
          wrapper.classList.add('expanded');
          wrapper.style.maxHeight = list.scrollHeight + 'px';
        }
      });

      if (isExpanded) {
        btnShowAll.classList.remove('expanded');
        btnShowAll.textContent = 'Показать еще';
        // Scroll back to pricing section top
        document.getElementById('services').scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        btnShowAll.classList.add('expanded');
        btnShowAll.textContent = 'Скрыть';
      }
    });
  }

  // Gallery slider logic — transform-based (no scroll)
  const gallerySlider = document.getElementById('gallery-slider');
  const galleryProgress = document.getElementById('gallery-progress');
  const galleryPrev = document.getElementById('gallery-prev');
  const galleryNext = document.getElementById('gallery-next');
  const galleryCounter = document.getElementById('gallery-counter');

  if (gallerySlider) {
    const slides = gallerySlider.querySelectorAll('.gallery-slide');
    const totalSlides = slides.length;
    let currentSlide = 0;

    const goToSlide = (index) => {
      currentSlide = index;
      const offset = -(currentSlide * 100);
      gallerySlider.style.transform = `translateY(${offset}%)`;

      // Update progress bar
      if (galleryProgress) {
        const progress = totalSlides > 1
          ? (currentSlide / (totalSlides - 1)) * 100
          : 100;
        galleryProgress.style.height = `${progress}%`;
      }

      // Update counter
      if (galleryCounter) {
        galleryCounter.textContent = `${String(currentSlide + 1).padStart(2, '0')} / ${String(totalSlides).padStart(2, '0')}`;
      }
    };

    if (galleryPrev) {
      galleryPrev.addEventListener('click', () => {
        const targetIndex = currentSlide === 0 ? totalSlides - 1 : currentSlide - 1;
        goToSlide(targetIndex);
      });
    }

    if (galleryNext) {
      galleryNext.addEventListener('click', () => {
        const targetIndex = currentSlide === totalSlides - 1 ? 0 : currentSlide + 1;
        goToSlide(targetIndex);
      });
    }

    // Initial state
    goToSlide(0);

    // --- Wheel and Swipe Support ---
    const galleryViewport = document.querySelector('.gallery-viewport');
    if (galleryViewport) {
      let isAnimating = false;
      let animationStart = 0;
      let idleTimer = null;
      const TRANSITION_MS = 600; // matches CSS transition duration
      const IDLE_MS = 150;       // time after last wheel event to consider inertia done

      galleryViewport.addEventListener('wheel', (e) => {
        // On every wheel event (including inertia), reset the idle timer
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
          // No wheel events for IDLE_MS → inertia has stopped
          const elapsed = Date.now() - animationStart;
          if (elapsed >= TRANSITION_MS) {
            isAnimating = false;
          } else {
            // Animation still running, wait for it to finish
            setTimeout(() => { isAnimating = false; }, TRANSITION_MS - elapsed);
          }
        }, IDLE_MS);

        // Trap scroll inside gallery when not at boundary
        if ((e.deltaY > 0 && currentSlide < totalSlides - 1) ||
            (e.deltaY < 0 && currentSlide > 0)) {
          e.preventDefault();
        }

        // If currently animating/in inertia, do nothing else
        if (isAnimating) return;

        if (e.deltaY > 0 && currentSlide < totalSlides - 1) {
          isAnimating = true;
          animationStart = Date.now();
          goToSlide(currentSlide + 1);
        } else if (e.deltaY < 0 && currentSlide > 0) {
          isAnimating = true;
          animationStart = Date.now();
          goToSlide(currentSlide - 1);
        }
      }, { passive: false });

      // Mobile touch swiping
      let touchStartY = 0;
      let touchEndY = 0;

      galleryViewport.addEventListener('touchstart', (e) => {
        touchStartY = e.changedTouches[0].screenY;
      }, { passive: true });

      galleryViewport.addEventListener('touchmove', (e) => {
        if (!touchStartY) return;
        const currentY = e.changedTouches[0].screenY;
        const diff = touchStartY - currentY; // positive = swipe up = scroll down
        
        if (diff > 0) {
          // Swiping up (trying to scroll down)
          if (currentSlide < totalSlides - 1) {
            e.preventDefault(); // Trap scroll
          }
        } else if (diff < 0) {
          // Swiping down (trying to scroll up)
          if (currentSlide > 0) {
            e.preventDefault(); // Trap scroll
          }
        }
      }, { passive: false });

      galleryViewport.addEventListener('touchend', (e) => {
        touchEndY = e.changedTouches[0].screenY;
        const swipeThreshold = 40;
        
        if (touchStartY - touchEndY > swipeThreshold) {
          // Swiped up -> next slide
          if (currentSlide < totalSlides - 1) {
            goToSlide(currentSlide + 1);
          }
        } else if (touchEndY - touchStartY > swipeThreshold) {
          // Swiped down -> prev slide
          if (currentSlide > 0) {
            goToSlide(currentSlide - 1);
          }
        }
        touchStartY = 0;
      }, { passive: true });
    }
  }

  // ── Custom scroll positioning for nav links ──
  // Goal: when clicking "Услуги" or "Галерея" in the navbar,
  // scroll so that gap(navbar_bottom → title_top) = gap(bottom_element → screen_bottom)
  //
  // Math: Let S = scroll position. After scrolling:
  //   gap_top  = contentTop - (S + navH)
  //   gap_bottom = (S + viewH) - contentBottom
  //   Set gap_top = gap_bottom → S = (contentTop + contentBottom - navH - viewH) / 2

  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href').substring(1);

      // Only custom-handle services and gallery
      if (targetId !== 'services' && targetId !== 'gallery') return;

      e.preventDefault();

      const section = document.getElementById(targetId);
      if (!section) return;

      // Compute navbar height at click time (it changes with .scrolled class)
      const navH = navbar.getBoundingClientRect().height;
      const viewH = window.innerHeight;
      let contentTop, contentBottom;

      if (targetId === 'services') {
        // From top of "УСЛУГИ" title to bottom of "ЗАПИСАТЬСЯ" button
        const title = section.querySelector('.section-title');
        const ctaBtn = section.querySelector('.services-cta .btn');
        contentTop = title.getBoundingClientRect().top + window.scrollY;
        contentBottom = ctaBtn.getBoundingClientRect().bottom + window.scrollY;
      } else if (targetId === 'gallery') {
        // From top of "ГАЛЕРЕЯ" title to bottom of slider viewport
        const title = section.querySelector('.section-title');
        const viewport = section.querySelector('.gallery-viewport');
        contentTop = title.getBoundingClientRect().top + window.scrollY;
        contentBottom = viewport.getBoundingClientRect().bottom + window.scrollY;
      }

      // Calculate scroll position so top gap = bottom gap
      const scrollTarget = (contentTop + contentBottom - navH - viewH) / 2;

      window.scrollTo({
        top: Math.max(0, scrollTarget),
        behavior: 'smooth'
      });
    });
  });
});
