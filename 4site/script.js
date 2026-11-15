/* ===== Arusa — корзина, каталог, карточки товаров, меню, статьи ===== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* --- Товары: собираем из разметки --- */
const CATS = {p1:['Decora'],p2:['Lamps','Ceramic'],p3:['Furnitures'],p4:['Decora'],
  f1:['Furnitures'],f2:['Furnitures'],f3:['Lamps'],f4:['Furnitures'],f5:['Furnitures'],f6:['Furnitures'],f7:['Lamps'],f8:['Lamps','Ceramic'],feature:['Furnitures']};
const PRODUCTS = {};
$$('.prod').forEach(el => {
  const img = $('img', el).getAttribute('src');
  const id = img.split('/').pop().replace('.jpg', '');
  const [n, p] = $$('.plabel b', el).map(b => b.textContent.trim());
  PRODUCTS[id] = {id, img, name: n, price: p, cats: CATS[id] || []};
});
PRODUCTS.feature = {id:'feature', img:'img/feature.jpg', name:'NATIVE LIGHT CHAIR', price:'$4,990', cats:CATS.feature};
const CATALOG_IDS = Object.keys(PRODUCTS).filter(k => k !== 'feature');
const money = n => '$' + n.toLocaleString('en-US');
const num = s => Number(String(s).replace(/[^0-9.]/g, ''));
const title = s => s.toLowerCase().replace(/(^|\s)\S/g, c => c.toUpperCase());

/* --- Корзина (сохраняется в localStorage) --- */
let cart = {};
try { cart = JSON.parse(localStorage.getItem('arusa-cart')) || {}; } catch (e) {}
const bag = $('#bag');
const count = () => Object.values(cart).reduce((a, b) => a + b, 0);
function saveCart() {
  try { localStorage.setItem('arusa-cart', JSON.stringify(cart)); } catch (e) {}
  bag.textContent = count();
  bag.classList.add('bump'); setTimeout(() => bag.classList.remove('bump'), 250);
}
bag.textContent = count();

/* --- Оверлей (панели и окна) --- */
const ov = document.createElement('div'); ov.id = 'ov'; document.body.appendChild(ov);
const toast = document.createElement('div'); toast.id = 'toast'; document.body.appendChild(toast);
function showToast(msg) {
  toast.textContent = msg; toast.classList.add('show');
  clearTimeout(showToast.t); showToast.t = setTimeout(() => toast.classList.remove('show'), 2200);
}
function open(kind, html) {
  ov.className = 'open ' + kind;
  ov.innerHTML = `<div class="bd" data-close></div><div class="pn"><button class="x" data-close aria-label="Close">×</button>${html}</div>`;
  document.body.style.overflow = 'hidden';
}
function close() { ov.className = ''; ov.innerHTML = ''; document.body.style.overflow = ''; }

/* --- Виды --- */
function viewCart() {
  const ids = Object.keys(cart);
  let total = 0;
  const rows = ids.map(id => {
    const p = PRODUCTS[id], q = cart[id], sum = num(p.price) * q; total += sum;
    return `<div class="ci"><img src="${p.img}" alt=""><div><b>${title(p.name)}</b><span>${p.price}</span>
      <div class="qty"><button data-qty="${id}:-1" aria-label="Less">−</button><i>${q}</i><button data-qty="${id}:1" aria-label="More">+</button></div></div>
      <div class="ci-r"><b>${money(sum)}</b><button class="rm" data-qty="${id}:-99">REMOVE</button></div></div>`;
  }).join('');
  open('drawer r', `<h3>Bag <small>(${count()})</small></h3>` + (ids.length
    ? `<div class="ci-list">${rows}</div><div class="tot"><span>SUBTOTAL</span><b>${money(total)}</b></div>
       <button class="btn-dark" data-checkout>CHECKOUT</button><a href="#" class="cont" data-catalog="All">CONTINUE SHOPPING</a>`
    : `<p class="empty">Your bag is empty.</p><a href="#" class="btn-dark" data-catalog="All">SHOP ALL</a>`));
}
function viewProduct(id) {
  const p = PRODUCTS[id];
  open('modal', `<div class="pv"><div class="pv-img"><img src="${p.img}" alt="${title(p.name)}"></div>
    <div class="pv-in"><small>${p.cats.join(' · ').toUpperCase() || 'ARUSA'}</small><h2>${title(p.name)}</h2><b class="pr">${p.price}</b>
    <p>Handcrafted with natural fabrics and timeless lines. Made to last for generations, faithful to the shapes of each period, with a touch of the present.</p>
    <button class="btn-dark" data-add-id="${id}">ADD TO BAG</button></div></div>`);
}
function viewCatalog(filter = 'All') {
  const chips = ['All','Decora','Furnitures','Ceramic','Lamps'].map(c => `<button class="chip${c === filter ? ' on' : ''}" data-filter="${c}">${c}</button>`).join('');
  const items = CATALOG_IDS.filter(id => filter === 'All' || PRODUCTS[id].cats.includes(filter)).map(id => {
    const p = PRODUCTS[id];
    return `<a href="#" class="prod" data-open-product="${id}"><span class="pimg"><img src="${p.img}" alt=""></span><span class="plabel"><b>${p.name}</b><b>${p.price}</b></span></a>`;
  }).join('');
  open('modal wide', `<h2 class="ct">${filter === 'All' ? 'All products' : filter}</h2><div class="chips">${chips}</div><div class="grid4 cg">${items}</div>`);
}
function viewMenu() {
  open('drawer l', `<nav class="mn"><a href="#home" data-close>Home</a><a href="#shop" data-close>Shop</a><a href="#lookbook" data-close>Lookbook</a><a href="#articles" data-close>Journal</a>
    <a href="#" data-info="about">About</a><a href="#" data-info="contact">Contact</a></nav>
    <h6>COLLECTIONS</h6><nav class="mn s"><a href="#" data-catalog="Decora">Decora</a><a href="#" data-catalog="Furnitures">Furnitures</a><a href="#" data-catalog="Ceramic">Ceramic</a><a href="#" data-catalog="Lamps">Lamps</a></nav>`);
}
const INFO = {
  about: ['About Arusa', '<p>Developed the concept of exclusivity, Arusa features timeless furniture, with natural fabrics, curved lines, plenty of mirrors and classic design, which can be incorporated into any decor project.</p><p>The pieces enchant for their sobriety, to last for generations, faithful to the shapes of each period, with a touch of the present.</p>'],
  contact: ['Contact', '<p>Email: hello@arusa.example<br>Phone: +1 (555) 010-2030<br>Mon – Fri, 9:00 – 18:00</p>'],
  privacy: ['Privacy Policy', '<p>We only use your email to send you club news and discounts. We never sell your data, and you can unsubscribe at any time.</p>'],
  refund: ['Refund Policy', '<p>You can return any piece within 30 days of delivery in its original condition. Refunds are issued to the original payment method within 7 business days.</p>'],
};
function viewInfo(k) {
  if (k === 'login') {
    open('modal sm', `<h2>Login &amp; Account</h2><form class="lf" id="login"><input type="email" placeholder="EMAIL" required><input type="password" placeholder="PASSWORD" required minlength="4"><button class="btn-dark">SIGN IN</button></form>`);
    return;
  }
  open('modal sm', `<h2>${INFO[k][0]}</h2><div class="txt">${INFO[k][1]}</div>`);
}
function viewArticle(el) {
  const box = el.closest('article, .a-txt');
  const h = $('h3, h4', box).textContent, p = $('p', box).textContent;
  open('modal art', `<img src="img/${el.dataset.article}.jpg" alt=""><div class="txt"><h2>${h}</h2><p>${p}</p>
    <p>The conversation began with a simple idea: a home should feel lived in, calm and personal. From the choice of natural fabrics to the way each room catches the light, every detail was considered with care.</p></div>`);
}

/* --- Клики --- */
document.addEventListener('click', e => {
  const t = e.target.closest('[data-menu],[data-cart],[data-product],[data-product-feature],[data-open-product],[data-catalog],[data-info],[data-lightbox],[data-article],[data-close],[data-add-id],[data-qty],[data-checkout],[data-filter]');
  if (!t) return;
  const d = t.dataset, link = t.tagName === 'A' && t.getAttribute('href') !== '#';
  if (!link) e.preventDefault();
  if ('close' in d) { close(); return; }
  if ('menu' in d) viewMenu();
  else if ('cart' in d) viewCart();
  else if ('product' in d) viewProduct($('img', t).getAttribute('src').split('/').pop().replace('.jpg', ''));
  else if ('productFeature' in d) viewProduct('feature');
  else if ('openProduct' in d) viewProduct(d.openProduct);
  else if ('catalog' in d) viewCatalog(d.catalog || 'All');
  else if ('filter' in d) viewCatalog(d.filter);
  else if ('info' in d) viewInfo(d.info);
  else if ('lightbox' in d) open('modal lb', '<img src="img/rug.jpg" alt="Lookbook rug">');
  else if ('article' in d) viewArticle(t);
  else if ('addId' in d) { cart[d.addId] = (cart[d.addId] || 0) + 1; saveCart(); viewCart(); }
  else if ('qty' in d) {
    const [id, n] = d.qty.split(':'); cart[id] = (cart[id] || 0) + Number(n);
    if (cart[id] <= 0) delete cart[id];
    saveCart(); viewCart();
  } else if ('checkout' in d) {
    cart = {}; saveCart();
    open('modal sm', '<h2>Thank you!</h2><div class="txt"><p>Your order has been placed. We will send a confirmation to your email shortly.</p></div>');
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
document.addEventListener('submit', e => {
  if (e.target.id === 'login') { e.preventDefault(); close(); showToast('Welcome back to Arusa'); }
});

/* --- Подписка на клуб --- */
const form = $('#club-form');
form.addEventListener('submit', e => {
  e.preventDefault();
  const input = $('input', form);
  input.value = ''; input.placeholder = 'THANK YOU! YOU ARE IN THE CLUB'; input.blur();
  showToast('You joined the Arusa club');
});

