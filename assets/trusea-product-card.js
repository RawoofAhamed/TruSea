/**
 * TruSea Unified Product Card JS
 * Handles variant selection, add-ons, and AJAX cart addition.
 */

if (!customElements.get('ts-product-card')) {
  customElements.define('ts-product-card', class TsProductCard extends HTMLElement {
    constructor() {
      super();
      this.init();
    }

    init() {
      this.form = this.querySelector('form');
      this.pills = this.querySelectorAll('.ts-variant-pill');
      this.addonChecks = this.querySelectorAll('.ts-addon-check');
      this.addBtn = this.querySelector('.ts-card-add-btn');
      this.priceEl = this.querySelector('.ts-card-price-value');
      this.images = this.querySelectorAll('.ts-carousel-img');
      this.currentIndex = 0;
      this.carouselInterval = null;
      
      // Initial variant setup
      this.currentVariantId = this.querySelector('[name="id"]').value;

      this.initObserver();
      this.initVariantPills();
      this.initAddons();

      if (this.addBtn) {
        this.addBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.addToCart();
        });
      }
    }

    initObserver() {
      const options = {
        threshold: 0.6 // Trigger when 60% of the card is visible
      };

      const callback = (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.startCarousel();
          } else {
            this.stopCarousel();
          }
        });
      };

      this.observer = new IntersectionObserver(callback, options);
      this.observer.observe(this);
    }

    startCarousel() {
      if (this.images.length <= 1 || this.carouselInterval) return;
      
      this.carouselInterval = setInterval(() => {
        this.rotateImages();
      }, 2500); // Rotate every 2.5 seconds
    }

    stopCarousel() {
      if (this.carouselInterval) {
        clearInterval(this.carouselInterval);
        this.carouselInterval = null;
      }
      this.resetImages();
    }

    rotateImages() {
      this.images[this.currentIndex].classList.remove('active');
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
      this.images[this.currentIndex].classList.add('active');
    }

    resetImages() {
      if (this.images.length === 0) return;
      this.images.forEach(img => img.classList.remove('active'));
      this.currentIndex = 0;
      this.images[0].classList.add('active');
    }

    initVariantPills() {
      this.pills.forEach(pill => {
        pill.addEventListener('click', () => {
          this.pills.forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          this.currentVariantId = pill.dataset.variantId;
          this.querySelector('[name="id"]').value = this.currentVariantId;
          
          if (this.priceEl && pill.dataset.price) {
            this.priceEl.textContent = pill.dataset.price;
          }
        });
      });
    }

    initAddons() {
      this.addonChecks.forEach(check => {
        check.addEventListener('change', () => {
          const item = check.closest('.ts-addon-item');
          if (check.checked) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });
      });
    }

    async addToCart() {
      this.addBtn.classList.add('loading');
      this.addBtn.disabled = true;

      const items = [];
      
      // Main product
      items.push({
        id: this.currentVariantId,
        quantity: 1
      });

      // Add-ons
      this.addonChecks.forEach(check => {
        if (check.checked && check.dataset.variantId) {
          items.push({
            id: check.dataset.variantId,
            quantity: 1
          });
        }
      });

      try {
        const response = await fetch('/cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ items: items })
        });

        const data = await response.json();

        if (response.ok) {
          // Trigger theme cart update and drawer opening
          // We use the theme's standard events if available
          if (window.publish && window.PUB_SUB_EVENTS) {
            publish(PUB_SUB_EVENTS.cartUpdate, {
              source: 'ts-product-card',
              cartData: data
            });
          }

          // Force open cart drawer if it exists
          const cartDrawer = document.querySelector('cart-drawer');
          if (cartDrawer) {
            cartDrawer.open();
          } else {
            // Fallback to notification or cart page if no drawer
            const cartNotification = document.querySelector('cart-notification');
            if (cartNotification) cartNotification.open();
            else window.location.href = '/cart';
          }
        } else {
          alert(data.description || 'Error adding to cart');
        }
      } catch (error) {
        console.error('Add to cart error:', error);
      } finally {
        this.addBtn.classList.remove('loading');
        this.addBtn.disabled = false;
      }
    }
  });
}
