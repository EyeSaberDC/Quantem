// MongoDB Atlas Data API endpoint and API key
const DATA_API_URL = 'https://data.mongodb-api.com/app/application-0-iixawck/endpoint/data/v1/action';
const API_KEY = '070df408-ea8e-4ce6-8564-5148dc193a06';

document.addEventListener('DOMContentLoaded', () => {
    const itemsContainer = document.getElementById('items-container');
    const cartCount = document.getElementById('cart-count');
    const adminPanel = document.getElementById('admin-panel');
    const addItemForm = document.getElementById('add-item-form');
    const toggleAdminBtn = document.getElementById('toggle-admin');

    let isAdmin = false;

    // Load items from MongoDB
    async function loadItems() {
        const response = await fetch(`${DATA_API_URL}/find`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': API_KEY
            },
            body: JSON.stringify({
                dataSource: 'Cluster0',
                database: 'shop',
                collection: 'items',
                filter: {}
            })
        });
        const data = await response.json();
        itemsContainer.innerHTML = '';
        data.documents.forEach(item => {
            const itemElement = createItemElement(item);
            itemsContainer.appendChild(itemElement);
        });
    }

    // Create item element
    function createItemElement(item) {
        const itemElement = document.createElement('div');
        itemElement.className = 'item';
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p>$${item.price.toFixed(2)}</p>
            <button class="add-to-cart" data-id="${item._id}">Add to Cart</button>
        `;
        if (isAdmin) {
            itemElement.innerHTML += `
                <button class="edit-item" data-id="${item._id}">Edit</button>
                <button class="delete-item" data-id="${item._id}">Delete</button>
            `;
        }
        return itemElement;
    }

    // Add item to cart
    function addToCart(item) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItem = cart.find(i => i._id === item._id);
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
    async function addItem(item) {
        const response = await fetch(`${DATA_API_URL}/insertOne`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': API_KEY
            },
            body: JSON.stringify({
                dataSource: 'Cluster0',
                database: 'shop',
                collection: 'items',
                document: item
            })
        });
        const data = await response.json();
        return data.insertedId;
    }

    // Update item
    async function updateItem(id, updatedItem) {
        const response = await fetch(`${DATA_API_URL}/updateOne`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': API_KEY
            },
            body: JSON.stringify({
                dataSource: 'Cluster0',
                database: 'shop',
                collection: 'items',
                filter: { _id: { $oid: id } },
                update: { $set: updatedItem }
            })
        });
        const data = await response.json();
        return data.modifiedCount;
    }

    // Delete item
    async function deleteItem(id) {
        const response = await fetch(`${DATA_API_URL}/deleteOne`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': API_KEY
            },
            body: JSON.stringify({
                dataSource: 'Cluster0',
                database: 'shop',
                collection: 'items',
                filter: { _id: { $oid: id } }
            })
        });
        const data = await response.json();
        return data.deletedCount;
    }

    // Toggle admin panel
    toggleAdminBtn.addEventListener('click', () => {
        isAdmin = !isAdmin;
        adminPanel.style.display = isAdmin ? 'block' : 'none';
        loadItems(); // Reload items to show/hide edit and delete buttons
    });

    // Add item form submission
    addItemForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newItem = {
            name: addItemForm.itemName.value,
            price: parseFloat(addItemForm.itemPrice.value),
            image: addItemForm.itemImage.value
        };
        await addItem(newItem);
        addItemForm.reset();
        loadItems();
    });

    // Event delegation for item actions
    itemsContainer.addEventListener('click', async (e) => {
        if (e.target.classList.contains('add-to-cart')) {
            const id = e.target.getAttribute('data-id');
            const response = await fetch(`${DATA_API_URL}/findOne`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': API_KEY
                },
                body: JSON.stringify({
                    dataSource: 'Cluster0',
                    database: 'shop',
                    collection: 'items',
                    filter: { _id: { $oid: id } }
                })
            });
            const data = await response.json();
            addToCart(data.document);
        } else if (e.target.classList.contains('edit-item')) {
            const id = e.target.getAttribute('data-id');
            // Implement edit functionality here
            console.log('Edit item', id);
        } else if (e.target.classList.contains('delete-item')) {
            const id = e.target.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this item?')) {
                await deleteItem(id);
                loadItems();
            }
        }
    });

    // Initial load
    loadItems();
    updateCartCount();
});
