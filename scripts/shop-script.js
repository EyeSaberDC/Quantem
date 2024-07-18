document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('product-grid');
    const categoryList = document.getElementById('category-list');
    const cartIcon = document.getElementById('cart-icon');
    const cartCount = document.getElementById('cart-count');
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const adminPanel = document.getElementById('admin-panel');
    const addProductBtn = document.getElementById('add-product');
    const editCategoriesBtn = document.getElementById('edit-categories');
    const deleteCategoryBtn = document.getElementById('delete-category');
    const deleteProductBtn = document.getElementById('delete-product');
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const productForm = document.getElementById('product-form');
    const closeModal = document.querySelector('.close');
    const adminLoginBtn = document.getElementById('admin-login');

    let products = [];
    let categories = [];
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Load products and categories from server
    fetch('/api/items')
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(`HTTP error! status: ${response.status}, message: ${text}`);
            });
        }
        return response.json();
    })
    .then(data => {
        if (data && data.products && data.categories) {
            products = data.products;
            categories = data.categories;
            renderProducts('Ranks');
            renderCategories();
            updateCartCount();
            populateCategorySelect();
        } else {
            console.error('Invalid data structure received from server:', data);
            alert('Error loading products. Please try refreshing the page.');
        }
    })
    .catch(error => {
        console.error('Error loading items:', error);
        alert(`Error loading products: ${error.message}. Please check the console and server logs.`);
    });

    function saveItemsToServer() {
        fetch('/api/items', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ products, categories }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Changes saved successfully to items.json');
            } else {
                alert('Error saving changes to items.json');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error saving changes to items.json');
        });
    }

    function renderProducts(category = 'Ranks') {
        if (!Array.isArray(products)) {
            console.error('Products is not an array:', products);
            return;
        }
        const filteredProducts = products.filter(p => p.category === category);
        productGrid.innerHTML = filteredProducts.map(product => `
            <div class="product-card" data-id="${product.id}">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-price">$${product.price.toFixed()}</p>
                    <p>${product.description}</p>
                    <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
                </div>
            </div>
        `).join('');
    }

    function renderCategories() {
        if (!Array.isArray(categories)) {
            console.error('Categories is not an array:', categories);
            return;
        }
        categoryList.innerHTML = categories.map(category => `
            <li><a href="#" data-category="${category}" ${category === 'Ranks' ? 'class="active"' : ''}>${category}</a></li>
        `).join('');
    }

    function updateCartCount() {
        cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    }

    function saveToLocalStorage() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Simulated IP address check
    function checkAdminAccess() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const allowedIP = '123.456.78.90';
                const currentIP = prompt("Enter your IP address for admin access:", "");
                resolve(currentIP === allowedIP);
            }, 1000);
        });
    }

    function toggleAdminPanel(show) {
        adminPanel.style.display = show ? 'block' : 'none';
        adminLoginBtn.style.display = show ? 'none' : 'block';
    }

    function populateCategorySelect() {
        const categorySelect = document.getElementById('product-category');
        categorySelect.innerHTML = categories.map(category => `
            <option value="${category}">${category}</option>
        `).join('');
    }

    productGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart')) {
            const productId = parseInt(e.target.getAttribute('data-id'));
            const product = products.find(p => p.id === productId);
            
            const existingItem = cart.find(item => item.id === productId);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ ...product, quantity: 1 });
            }
            
            updateCartCount();
            saveToLocalStorage();
        }
    });

    categoryList.addEventListener('click', (e) => {
        e.preventDefault();
        if (e.target.tagName === 'A') {
            const category = e.target.getAttribute('data-category');
            renderProducts(category);
            
            categoryList.querySelectorAll('a').forEach(a => a.classList.remove('active'));
            e.target.classList.add('active');
        }
    });

    cartIcon.addEventListener('click', () => {
        window.location.href = 'cart.html';
    });

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    addProductBtn.addEventListener('click', () => {
        modalTitle.textContent = 'Add New Product';
        productForm.reset();
        modal.style.display = 'block';
    });

    editCategoriesBtn.addEventListener('click', () => {
        const newCategory = prompt('Enter a new category name:');
        if (newCategory && !categories.includes(newCategory)) {
            categories.push(newCategory);
            renderCategories();
            populateCategorySelect();
            saveItemsToServer();
        }
    });

    deleteCategoryBtn.addEventListener('click', () => {
        const categoryToDelete = prompt('Enter the name of the category to delete:');
        if (categoryToDelete && categories.includes(categoryToDelete)) {
            if (confirm(`Are you sure you want to delete the category "${categoryToDelete}" and all its products?`)) {
                categories = categories.filter(c => c !== categoryToDelete);
                products = products.filter(p => p.category !== categoryToDelete);
                renderCategories();
                renderProducts(categories[0]);
                populateCategorySelect();
                saveItemsToServer();
            }
        } else {
            alert('Category not found.');
        }
    });

    deleteProductBtn.addEventListener('click', () => {
        const productIdToDelete = prompt('Enter the ID of the product to delete:');
        const productToDelete = products.find(p => p.id === parseInt(productIdToDelete));
        if (productToDelete) {
            if (confirm(`Are you sure you want to delete the product "${productToDelete.name}"?`)) {
                products = products.filter(p => p.id !== parseInt(productIdToDelete));
                renderProducts(productToDelete.category);
                saveItemsToServer();
            }
        } else {
            alert('Product not found.');
        }
    });

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    productForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newProduct = {
            id: products.length + 1,
            name: document.getElementById('product-name').value,
            price: parseFloat(document.getElementById('product-price').value),
            category: document.getElementById('product-category').value,
            description: document.getElementById('product-description').value,
            image: document.getElementById('product-image').value
        };
        products.push(newProduct);
        renderProducts(newProduct.category);
        saveItemsToServer();
        modal.style.display = 'none';
    });

    adminLoginBtn.addEventListener('click', () => {
        checkAdminAccess().then(hasAccess => {
            toggleAdminPanel(hasAccess);
            if (!hasAccess) {
                alert('Admin access denied.');
            }
        });
    });

    // Initially hide admin panel and show login button
    toggleAdminPanel(false);
});
