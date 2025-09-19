// Script para funcionalidad de navbar GuestsValencia

document.addEventListener('DOMContentLoaded', function() {
    // Navbar scroll effect
    const navbar = document.querySelector('.site-navbar');

    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle (placeholder para futuro desarrollo)
    const mobileMenuButton = document.querySelector('.site-navbar .md\\:hidden button');
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', function() {
            // Aquí se puede agregar funcionalidad de menú móvil
            console.log('Mobile menu clicked');
        });
    }

    // Active link highlighting
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.site-navbar a');

    navLinks.forEach(link => {
        const linkPath = new URL(link.href).pathname;
        if (linkPath === currentPath ||
            (currentPath === '/' && linkPath === '/index.html')) {
            link.classList.add('active');
        }
    });

    // Smooth scroll for footer links
    const footerLinks = document.querySelectorAll('footer a[href^="#"]');
    footerLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Logo click effect
    const logo = document.querySelector('.site-navbar img');
    if (logo) {
        logo.addEventListener('click', function() {
            // Pequeña animación al hacer click en el logo
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    }
});

// Función para establecer página activa
function setActivePage(pageName) {
    const navLinks = document.querySelectorAll('.site-navbar a');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.textContent.toLowerCase().includes(pageName.toLowerCase())) {
            link.classList.add('active');
        }
    });
}

// Export para uso global
window.GuestsValencia = {
    setActivePage: setActivePage
};