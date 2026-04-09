/**
 * TruSea Featured Products JS
 * Handles modal, variant selection, and AJAX cart additions.
 */

class TruSeaFeaturedProducts {
  constructor() {
    this.modal = document.querySelector('.ts-modal');
    this.overlay = this.modal?.querySelector('.ts-modal-overlay');
    this.closeBtn = this.modal?.querySelector('.ts-modal-close');
    this.confirmBtn = this.modal?.querySelector('.ts-modal-confirm-btn');
    this.addonsContainer = this.modal?.querySelector('.ts-modal-addons');
    
    this.currentProductData = null;
    
    this.init();
  }

  init() {
    if (!this.modal) return;

    // Attach listeners to "Add" buttons
    document.querySelectorAll('.ts-card-add-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.openModal(e.currentTarget));
    });

    // Modal Close
    this.closeBtn?.addEventListener('click', () => this.closeModal());
    this.overlay?.addEventListener('click', () => this.closeModal());
    
    // Addon Selection
    this.modal.addEventListener('click', (e) => {
      const addon = e.target.closest('.ts-addon-item');
      if (addon) {
        addon.classList.toggle('active');
        this.updateModalPrice();
      }
    });

    // Confirm (Add to Cart)
    this.confirmBtn?.addEventListener('click', () => this.addToCart());
  }

  openModal(btn) {
    const card = btn.closest('.ts-product-card');
    if (!card) return;

    // Get data from card attributes
    const productId = card.dataset.productId;
    const title = card.querySelector('.ts-card-title').textContent;
    const activeVariant = card.querySelector('.ts-variant-pill.active');
    const variantId = activeVariant?.dataset.variantId;
    const variantPrice = activeVariant?.dataset.price;
    
    this.currentProductData = {
      productId,
      variantId,
      title,
      basePrice: parseInt(variantPrice)
    };

    // Update Modal Title
    this.modal.querySelector('.ts-modal-title').textContent = title;
    
    // Reset Addons
    this.modal.querySelectorAll('.ts-addon-item').forEach(item => item.classList.remove('active'));
    
    // Update Price
    this.updateModalPrice();

    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  updateModalPrice() {
    if (!this.currentProductData) return;

    let totalPrice = this.currentProductData.basePrice;
    
    this.modal.querySelectorAll('.ts-addon-item.active').forEach(item => {
      totalPrice += parseInt(item.dataset.price);
    });

    const priceDisplay = this.modal.querySelector('.ts-modal-footer .ts-btn');
    if (priceDisplay) {
      // Simple Indian Rupee formatting
      const formatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(totalPrice / 100);
      
      this.confirmBtn.textContent = `Add to Cart — ${formatted}`;
    }
  }

  async addToCart() {
    if (!this.currentProductData) return;

    const items = [];
    
    // 1. Add Main Product
    items.push({
      id: this.currentProductData.variantId,
      quantity: 1
    });

    // 2. Add Selected Addons
    this.modal.querySelectorAll('.ts-addon-item.active').forEach(item => {
      items.push({
        id: item.dataset.variantId || item.dataset.productId, // Handle both product or variant
        quantity: 1
      });
    });

    this.confirmBtn.disabled = true;
    this.confirmBtn.textContent = 'Adding...';

    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });

      if (response.ok) {
        // Success: Redirect or Open Cart Drawer
        this.closeModal();
        if (window.CartDrawer) {
          window.dispatchEvent(new CustomEvent('cart:updated'));
        } else {
          window.location.href = '/cart';
        }
      } else {
        const error = await response.json();
        alert(`Error adding to cart: ${error.description || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Cart Error:', err);
      alert('Failed to add to cart. Please try again.');
    } finally {
      this.confirmBtn.disabled = false;
      this.updateModalPrice();
    }
  }
}

// Lazy Init
document.addEventListener('DOMContentLoaded', () => {
  window.tsFeaturedProducts = new TruSeaFeaturedProducts();
});

// Re-init on section load in customizer
if (Shopify.designMode) {
  document.addEventListener('shopify:section:load', (event) => {
    if (event.detail.sectionId.includes('featured-products')) {
      window.tsFeaturedProducts = new TruSeaFeaturedProducts();
    }
  });
}
