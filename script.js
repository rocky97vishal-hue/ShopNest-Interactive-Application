// Initialising the required things for the application
let products = [];
let cart = JSON.parse(localStorage.getItem('simple_store_cart')) || [];
let currentCategory = 'all';
let searchQuery = '';

// DOM element getting reference
const productGrid = document.getElementById('product-grid');
const searchInput = document.getElementById('search-input');
const categoryButtonsContainer = document.getElementById('category-buttons');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');
const cartCountElement = document.getElementById('cart-count');

// Fetching products from the FakeStoreAPI


async function fetchProducts() {
    try {
        const response = await fetch('https://fakestoreapi.com/products');
        if (!response.ok) throw new Error('Failed to load products');
        products = await response.json();
        renderProducts();
    } catch (error) {
        productGrid.innerHTML = '<div class="col-12 text-danger text-center py-5">Error loading products. Please try again later.</div>';
    }
}

// Rendering products, by search query and category filters
function renderProducts() {
    productGrid.innerHTML = '';

    const filtered = products.filter(product => {
        const matchesCategory = currentCategory === 'all' || product.category === currentCategory;
        const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        productGrid.innerHTML = '<div class="col-12 text-center text-muted py-5">No products found matching your search and filter criteria.</div>';
        return;
    }

    filtered.forEach(product => {
        const col = document.createElement('div');
        col.className = 'col';

        const card = document.createElement('div');
        card.className = 'card h-100 p-3 shadow-sm d-flex flex-column justify-content-between';

        const img = document.createElement('img');
        img.className = 'card-img-top product-img mb-3';
        img.src = product.image;
        img.alt = product.title;

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body p-0 d-flex flex-column justify-content-between';

        const title = document.createElement('h6');
        title.className = 'card-title text-truncate';
        title.title = product.title;
        title.textContent = product.title;

        const price = document.createElement('p');
        price.className = 'card-text fw-bold mb-3';
        price.textContent = `$${product.price.toFixed(2)}`;

        const addBtn = document.createElement('button');
        addBtn.className = 'btn btn-warning w-100 fw-semibold text-dark';
        addBtn.textContent = 'Add to Cart';
        addBtn.onclick = () => addToCart(product);

        cardBody.appendChild(title);
        cardBody.appendChild(price);
        cardBody.appendChild(addBtn);

        card.appendChild(img);
        card.appendChild(cardBody);
        col.appendChild(card);

        productGrid.appendChild(col);
    });
}

// Cart management functions
function addToCart(product) {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            quantity: 1
        });
    }
    saveAndRenderCart();
}

function updateQuantity(id, amount) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += amount;
        if (item.quantity <= 0) {
            removeFromCart(id);
        } else {
            saveAndRenderCart();
        }
    }
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveAndRenderCart();
}

function saveAndRenderCart() {
    localStorage.setItem('simple_store_cart', JSON.stringify(cart));
    renderCart();
}

// Rendering cart items list and computing running totals
function renderCart() {
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="text-muted">Your cart is empty</p>';
        cartTotalElement.textContent = '$0.00';
        cartCountElement.textContent = '0';
        return;
    }

    let total = 0;
    let count = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
        count += item.quantity;

        const itemDiv = document.createElement('div');
        itemDiv.className = 'mb-3 pb-2 border-bottom';

        const titleP = document.createElement('p');
        titleP.className = 'mb-1 small fw-semibold text-truncate';
        titleP.title = item.title;
        titleP.textContent = item.title;

        const detailsRow = document.createElement('div');
        detailsRow.className = 'd-flex justify-content-between align-items-center';

        const priceSpan = document.createElement('small');
        priceSpan.className = 'text-muted';
        priceSpan.textContent = `$${item.price.toFixed(2)}`;

        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'd-flex align-items-center gap-1';

        const minusBtn = document.createElement('button');
        minusBtn.className = 'btn btn-sm btn-primary py-0 px-1';
        minusBtn.textContent = '-';
        minusBtn.onclick = () => updateQuantity(item.id, -1);

        const qtySpan = document.createElement('span');
        qtySpan.className = 'px-1 small fw-bold';
        qtySpan.textContent = item.quantity;

        const plusBtn = document.createElement('button');
        plusBtn.className = 'btn btn-sm btn-primary py-0 px-1';
        plusBtn.textContent = '+';
        plusBtn.onclick = () => updateQuantity(item.id, 1);

        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn btn-sm btn-danger py-0 px-1 ms-1';
        removeBtn.textContent = 'Remove';
        removeBtn.onclick = () => removeFromCart(item.id);

        controlsDiv.appendChild(minusBtn);
        controlsDiv.appendChild(qtySpan);
        controlsDiv.appendChild(plusBtn);
        controlsDiv.appendChild(removeBtn);

        detailsRow.appendChild(priceSpan);
        detailsRow.appendChild(controlsDiv);

        itemDiv.appendChild(titleP);
        itemDiv.appendChild(detailsRow);

        cartItemsContainer.appendChild(itemDiv);
    });

    cartTotalElement.textContent = `$${total.toFixed(2)}`;
    cartCountElement.textContent = count;
}

// Event listener for live search
searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderProducts();
});

// Event listener for category buttons
categoryButtonsContainer.addEventListener('click', (e) => {
    if (!e.target.classList.contains('btn')) return;

    Array.from(categoryButtonsContainer.children).forEach(btn => {
        btn.classList.remove('active', 'btn-dark');
        btn.classList.add('btn-outline-dark');
    });

    e.target.classList.remove('btn-outline-dark');
    e.target.classList.add('active', 'btn-dark');

    currentCategory = e.target.getAttribute('data-category');
    renderProducts();
});

// Initialize application data
fetchProducts();
renderCart();