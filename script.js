// Initialize Feather Icons
feather.replace();

// Set current year
document.getElementById('year').textContent = new Date().getFullYear();

// Mobile menu toggle
const btn = document.getElementById('mobile-menu-btn');
const menu = document.getElementById('mobile-menu');

btn.addEventListener('click', () => {
    menu.classList.toggle('hidden');
});

// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('shadow-lg', 'bg-darker/90');
        navbar.classList.remove('bg-darker/70');
    } else {
        navbar.classList.remove('shadow-lg', 'bg-darker/90');
        navbar.classList.add('bg-darker/70');
    }
});

// Close mobile menu on link click
document.querySelectorAll('#mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
        menu.classList.add('hidden');
    });
});
