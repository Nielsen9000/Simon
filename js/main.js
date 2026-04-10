/* ===== BARRIERLAB — MAIN JS ===== */

// ===== CART STATE =====
let cart = JSON.parse(localStorage.getItem('bl_cart') || '[]');

function saveCart() {
  localStorage.setItem('bl_cart', JSON.stringify(cart));
}

function getCartCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

function updateCartUI() {
  const count = getCartCount();
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count;
    el.classList.toggle('visible', count > 0);
  });
  renderCartItems();
}

function addToCart(id, name, price, image, variantId) {
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price, image, variantId, qty: 1 });
  }
  saveCart();
  updateCartUI();
  showToast(`"${name}" added to cart`);
  openCart();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  updateCartUI();
}

function updateQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty < 1) {
    removeFromCart(id);
    return;
  }
  saveCart();
  updateCartUI();
}

function renderCartItems() {
  const container = document.querySelector('.cart-items');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = '<div class="cart-empty">Your cart is empty.<br><br><a href="products.html" style="color:var(--navy);font-weight:600;text-decoration:underline;">Browse products →</a></div>';
    const totalEl = document.querySelector('.cart-total span:last-child');
    if (totalEl) totalEl.textContent = '€0.00';
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-visual" style="background:#F5F5F5;border-radius:8px;display:flex;align-items:center;justify-content:center;overflow:hidden;">
        ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width:100%;height:100%;object-fit:contain;padding:6px;" />` : ''}
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">€${item.price.toFixed(2)}</div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="updateQty('${item.id}', -1)">−</button>
          <span class="qty-value">${item.qty}</span>
          <button class="qty-btn" onclick="updateQty('${item.id}', 1)">+</button>
          <button class="cart-remove" onclick="removeFromCart('${item.id}')">×</button>
        </div>
      </div>
    </div>
  `).join('');

  const totalEl = document.querySelector('.cart-total span:last-child');
  if (totalEl) totalEl.textContent = `€${getCartTotal().toFixed(2)}`;

  // show discount note if they have the code
  const discountNote = document.querySelector('.cart-discount-note');
  if (discountNote && localStorage.getItem('bl_discount')) {
    discountNote.style.display = 'block';
  }
}

// ===== CART SIDEBAR =====
function openCart() {
  document.querySelector('.cart-sidebar')?.classList.add('open');
  document.querySelector('.cart-overlay')?.classList.add('visible');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.querySelector('.cart-sidebar')?.classList.remove('open');
  document.querySelector('.cart-overlay')?.classList.remove('visible');
  document.body.style.overflow = '';
}

// ===== TOAST =====
function showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-icon">✓</span><span class="toast-msg"></span>`;
    document.body.appendChild(toast);
  }
  toast.querySelector('.toast-msg').textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== EMAIL POPUP =====
function showPopup() {
  const overlay = document.querySelector('.popup-overlay');
  if (!overlay) return;
  overlay.style.display = 'flex';
  console.log('popup triggered');
}
window.showPopup = showPopup;

function initPopup() {
  const overlay = document.querySelector('.popup-overlay');
  if (!overlay) {
    console.log('popup: overlay not found');
    return;
  }
  console.log('popup: init');

  const hide = () => {
    overlay.style.display = 'none';
    sessionStorage.setItem('bl_popup_seen', '1');
  };

  if (!sessionStorage.getItem('bl_popup_seen')) {
    setTimeout(showPopup, 2000);
  }

  overlay.querySelector('.popup-close')?.addEventListener('click', hide);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) hide(); });

  const form = overlay.querySelector('.popup-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = form.querySelector('input[type="email"]').value;
    if (!email) return;
    sessionStorage.setItem('bl_popup_seen', '1');
    localStorage.setItem('bl_discount', '1');
    overlay.querySelector('.popup-body').innerHTML = `
      <div style="text-align:center;padding:16px 0;">
        <div style="font-size:2.5rem;margin-bottom:12px;">🎉</div>
        <h2 style="color:var(--navy);font-size:1.4rem;margin-bottom:10px;">You're in!</h2>
        <p style="color:var(--gray-600,#666);font-size:0.95rem;">Your code is <strong style="color:var(--navy)">WELCOME15</strong> — use it at checkout!</p>
      </div>
    `;
    setTimeout(() => { overlay.style.display = 'none'; }, 3000);
  });
}

// ===== MOBILE NAV =====
function initMobileNav() {
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileNav = document.querySelector('.nav-mobile');
  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    hamburger.querySelectorAll('span')[0].style.transform = open ? 'rotate(45deg) translate(5px,5px)' : '';
    hamburger.querySelectorAll('span')[1].style.opacity = open ? '0' : '1';
    hamburger.querySelectorAll('span')[2].style.transform = open ? 'rotate(-45deg) translate(5px,-5px)' : '';
  });
}

// ===== FAQ ACCORDION =====
function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
}

// ===== PRODUCT PAGE QTY =====
function initProductQty() {
  const qtyInput = document.querySelector('.qty-selector input');
  if (!qtyInput) return;

  document.querySelector('.qty-minus')?.addEventListener('click', () => {
    const v = parseInt(qtyInput.value);
    if (v > 1) qtyInput.value = v - 1;
  });
  document.querySelector('.qty-plus')?.addEventListener('click', () => {
    qtyInput.value = parseInt(qtyInput.value) + 1;
  });

  document.querySelector('.product-add-to-cart')?.addEventListener('click', () => {
    const btn = document.querySelector('.product-add-to-cart');
    const checkoutUrl = btn.dataset.checkoutUrl;
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
      return;
    }
    const qty = parseInt(qtyInput.value) || 1;
    const id = btn.dataset.id;
    const name = btn.dataset.name;
    const price = parseFloat(btn.dataset.price);
    const color = btn.dataset.color;
    for (let i = 0; i < qty; i++) addToCart(id, name, price, color);
  });
}

// ===== NEWSLETTER =====
function initNewsletter() {
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input');
      if (!input.value) return;
      input.value = '';
      showToast('Thanks for subscribing!');
    });
  });
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
  if (!window.IntersectionObserver) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.review-card, .step-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    observer.observe(el);
  });
}

// ===== CHECKOUT BUTTON =====
function initCheckout() {
  document.querySelector('.checkout-btn')?.addEventListener('click', () => {
    if (cart.length === 0) {
      showToast('Your cart is empty');
      return;
    }
    const parts = cart.filter(i => i.variantId).map(i => `${i.variantId}:${i.qty}`);
    if (parts.length === 0) {
      showToast('Unable to checkout — missing variant info');
      return;
    }
    window.location.href = `https://barrierlab.co/cart/${parts.join(',')}`;
  });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  // Cart buttons
  document.querySelectorAll('.cart-btn').forEach(btn => {
    btn.addEventListener('click', openCart);
  });
  document.querySelector('.cart-close')?.addEventListener('click', closeCart);
  document.querySelector('.cart-overlay')?.addEventListener('click', closeCart);

  // Card add-to-cart buttons
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      addToCart(btn.dataset.id, btn.dataset.name, parseFloat(btn.dataset.price), btn.dataset.image, btn.dataset.variantId);
    });
  });

  // Touch/tap swap for product images
  document.querySelectorAll('.product-card-img').forEach(el => {
    el.addEventListener('click', () => {
      if (window.matchMedia('(hover: none)').matches) {
        el.classList.toggle('tapped');
      }
    });
  });

  updateCartUI();
  initPopup();
  initMobileNav();
  initFAQ();
  initProductQty();
  initNewsletter();
  initCheckout();
  setTimeout(initScrollAnimations, 100);
});
