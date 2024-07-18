document.addEventListener('DOMContentLoaded', () => {
    const cartIcon = document.getElementById('cart-icon');
    const cartCount = document.getElementById('cart-count');
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    }

    cartIcon.addEventListener('click', () => {
        window.location.href = 'cart.html';
    });

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    updateCartCount();
});

