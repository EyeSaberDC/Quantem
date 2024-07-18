document.addEventListener('DOMContentLoaded', () => {
    const stripe = Stripe('pk_live_51OS7JKKcpepkbn5qNSfW1o32Jy9V8rAvjKJh3BSenMg6dAL9GRFhbn1Y8MGO2t0T3YWIPf7mBUdcsQnXAXEQMS7T00ezuHcF38');
    const elements = stripe.elements();
    const cardElement = elements.create('card');

    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const paymentMethodSelect = document.getElementById('payment-method');
    const stripeElement = document.getElementById('stripe-element');
    const cryptoAddress = document.getElementById('crypto-address');
    const cryptoPaymentAddress = document.getElementById('crypto-payment-address');
    const paymentForm = document.getElementById('payment-form');
    const cartCountElement = document.getElementById('cart-count');

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    function renderCart() {
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p>Price: $${item.price.toFixed(2)}</p>
                    <div class="quantity-controls">
                        <button class="quantity-btn minus" data-id="${item.id}">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn plus" data-id="${item.id}">+</button>
                    </div>
                </div>
                <button class="remove-btn" data-id="${item.id}">Remove</button>
            </div>
        `).join('');

        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        cartTotalElement.textContent = `Total: $${total.toFixed(2)}`;
        updateCartCount();
    }

    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
    }

    function updateCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
    }

    function changeQuantity(id, change) {
        const itemIndex = cart.findIndex(item => item.id === id);
        if (itemIndex !== -1) {
            cart[itemIndex].quantity += change;
            if (cart[itemIndex].quantity <= 0) {
                cart.splice(itemIndex, 1);
            }
            updateCart();
        }
    }

    cartItemsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('quantity-btn')) {
            const id = parseInt(e.target.getAttribute('data-id'));
            const change = e.target.classList.contains('plus') ? 1 : -1;
            changeQuantity(id, change);
        } else if (e.target.classList.contains('remove-btn')) {
            const id = parseInt(e.target.getAttribute('data-id'));
            const itemIndex = cart.findIndex(item => item.id === id);
            if (itemIndex !== -1) {
                cart.splice(itemIndex, 1);
                updateCart();
            }
        }
    });

    // Render the Stripe card element
    cardElement.mount('#stripe-element');

    paymentMethodSelect.addEventListener('change', (e) => {
        if (e.target.value === 'stripe') {
            stripeElement.style.display = 'block';
            cryptoAddress.style.display = 'none';
        } else if (e.target.value === 'crypto') {
            stripeElement.style.display = 'none';
            cryptoAddress.style.display = 'block';
            // Set a sample crypto address (replace with your actual address generation logic)
            cryptoPaymentAddress.textContent = '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2';
        } else {
            stripeElement.style.display = 'none';
            cryptoAddress.style.display = 'none';
        }
    });

    paymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const paymentMethod = paymentMethodSelect.value;

        if (paymentMethod === 'stripe') {
            // Handle Stripe payment
            const {token, error} = await stripe.createToken(cardElement);
            if (error) {
                console.error(error);
                alert('There was an error processing your payment. Please try again.');
            } else {
                // Send the token to your server
                console.log(token);
                // Here you would typically send the token to your server to process the payment
                alert('Payment successful! (This is a demo - no actual payment was processed)');
                cart = [];
                updateCart();
            }
        } else if (paymentMethod === 'crypto') {
            // Handle crypto payment
            console.log('Crypto payment selected');
            // Here you would typically implement your crypto payment verification logic
            alert('Please send the payment to the provided crypto address. (This is a demo - no actual payment is required)');
            cart = [];
            updateCart();
        }
    });

    // Initial render
    renderCart();
});