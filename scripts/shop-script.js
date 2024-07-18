// Firebase configuration
const firebaseConfig = {
    // Your web app's Firebase configuration
    // Replace this with your actual Firebase config
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

document.addEventListener('DOMContentLoaded', () => {
    const itemsContainer = document.getElementById('items-container');
    const cartCount = document.getElementById('cart-count');
    const adminPanel = document.getElementById('admin-panel');
    const addItemForm = document.getElementById('add-item-form');
    const toggleAdminBtn = document.getElementById('toggle-admin');

    let isAdmin = false;

    // Load items from Firebase
    function loadItems() {
        database.ref('items').on('value', (snapshot) => {
            const items = snapshot.val();
            itemsContainer.innerHTML = '';
            for (let id in items) {
                const item = items[id];
                const itemElement = createItemElement(id, item);
                itemsContainer.appendChild(itemElement);
            }
        });
    }

    // Create item element
    function createItemElement(id, item) {
        const itemElement = document.createElement('div');
        itemElement.className = 'item';
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p>$${item.price.toFixed(2)}</p>
            <button class="add-to-cart" data-id="${id}">Add to Cart</button>
        `;
        if (isAdmin) {
            itemElement.innerHTML += `
                <button class="edit-item" data-id="${id}">Edit</button>
                <button class="delete-item" data-id="${id}">Delete</button>
            `;
        }
        return itemElement;
    }

    // Add item to cart
    function addToCart(item) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItem = cart.find(i => i.id === item.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...item, quantity: 1 });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    }

    // Update cart count
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = count;
    }

    // Add new item
    function addItem(item) {
        return database.ref('items').push(item);
    }

    // Update item
    function updateItem(id, updatedItem) {
        return database.ref('items/' + id).update(updatedItem);
    }

    // Delete item
    function deleteItem(id) {
        return database.ref('items/' + id).remove();
    }

    // Toggle admin panel
    toggleAdminBtn.addEventListener('click', () => {
        isAdmin = !isAdmin;
        adminPanel.style.display = isAdmin ? 'block' : 'none';
        loadItems(); // Reload items to show/hide edit and delete buttons
    });

    // Add item form submission
    addItemForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newItem = {
            name: addItemForm.itemName.value,
            price: parseFloat(addItemForm.itemPrice.value),
            image: addItemForm.itemImage.value
        };
        addItem(newItem).then(() => {
            addItemForm.reset();
        });
    });

    // Event delegation for item actions
    itemsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart')) {
            const id = e.target.getAttribute('data-id');
            database.ref('items/' + id).once('value').then((snapshot) => {
                const item = snapshot.val();
                addToCart({ id, ...item });
            });
        } else if (e.target.classList.contains('edit-item')) {
            const id = e.target.getAttribute('data-id');
            // Implement edit functionality here
            console.log('Edit item', id);
        } else if (e.target.classList.contains('delete-item')) {
            const id = e.target.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this item?')) {
                deleteItem(id);
            }
        }
    });

    // Initial load
    loadItems();
    updateCartCount();
});
