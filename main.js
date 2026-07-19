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
  const animateElements = document.querySelectorAll('.service-category, .gallery-item');
  
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
});
