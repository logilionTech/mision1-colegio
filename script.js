/**
 * script.js
 * Colegio San Paulo - Interactions and Animations
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. SCROLL ANIMATIONS (Intersection Observer)
    // ==========================================
    const animationObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            // Add 'visible' class when element comes into view
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once animated
                // observer.unobserve(entry.target); 
            }
        });
    }, {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Trigger when 15% of element is visible
    });

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => animationObserver.observe(el));

    // ==========================================
    // 2. STICKY HEADER & ACTIVE LINKS
    // ==========================================
    const header = document.getElementById('header');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');

    window.addEventListener('scroll', () => {
        // Header style change on scroll
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Active link highlight based on scroll position
        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - 200)) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    });

    // Smooth scrolling for anchor links
    navLinks.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetContent = document.querySelector(targetId);
            
            if (targetContent) {
                window.scrollTo({
                    top: targetContent.offsetTop - 80, // Adjust for header height
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                }
            }
        });
    });

    // ==========================================
    // 3. MOBILE MENU TOGGLE
    // ==========================================
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.main-nav');
    // Using simple styling toggle for mobile
    // Note: Since CSS currently hides main-nav with display:none on mobile,
    // we should make sure our JS + CSS logic works. Let's dynamically add a class.
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('mobile-active');
            
            // Check if we need to inject mobile CSS rules dynamically 
            // incase the CSS file doesn't have the `.mobile-active` styles
            if (!document.getElementById('mobile-menu-styles')) {
                const style = document.createElement('style');
                style.id = 'mobile-menu-styles';
                style.innerHTML = `
                    @media (max-width: 768px) {
                        .main-nav.mobile-active {
                            display: block !important;
                            position: absolute;
                            top: 100%;
                            left: 0;
                            width: 100%;
                            background: rgba(255, 255, 255, 0.95);
                            backdrop-filter: blur(10px);
                            padding: 2rem;
                            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                        }
                        .main-nav.mobile-active ul {
                            flex-direction: column;
                            gap: 1.5rem;
                            text-align: center;
                        }
                    }
                `;
                document.head.appendChild(style);
            }
        });
    }

    // ==========================================
    // 4. PARALLAX EFFECT FOR HERO IMAGE
    // ==========================================
    const heroBg = document.querySelector('.hero-bg');
    if (heroBg) {
        window.addEventListener('scroll', () => {
            const scrollPosition = window.scrollY;
            if (scrollPosition < window.innerHeight) {
                // Move background at 40% of scroll speed
                heroBg.style.transform = `translateY(${scrollPosition * 0.4}px)`;
            }
        });
    }

    // ==========================================
    // 5. FORM SUBMISSION UI UX FEEDBACK
    // ==========================================
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            // We allow Formspree to handle the actual submission, 
            // but we can show a brief UI feedback before redirect or if using AJAX
            
            // Note: Since method is POST and action is Formspree URL, 
            // it will redirect to their success page naturally. 
            // If the user wants to stay on page, they need to submit via fetch().
            
            e.preventDefault(); // Stop normal redirect to do it via AJAX
            
            const btnSubmit = contactForm.querySelector('.btn-submit');
            const originalBtnText = btnSubmit.innerHTML;
            
            btnSubmit.innerHTML = '<span>Enviando...</span><i class="ph ph-spinner animate-spin"></i>';
            btnSubmit.disabled = true;

            const formData = new FormData(contactForm);

            fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            }).then(response => {
                if (response.ok) {
                    formStatus.textContent = "¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.";
                    formStatus.className = "form-status status-success";
                    contactForm.reset();
                } else {
                    formStatus.textContent = "Hubo un problema al enviar el formulario. Intenta nuevamente.";
                    formStatus.className = "form-status status-error";
                }
            }).catch(error => {
                formStatus.textContent = "Error de red. Por favor, verifica tu conexión.";
                formStatus.className = "form-status status-error";
            }).finally(() => {
                btnSubmit.innerHTML = originalBtnText;
                btnSubmit.disabled = false;
                
                // Clear success message after 5 seconds
                setTimeout(() => {
                    formStatus.textContent = "";
                    formStatus.className = "form-status";
                }, 5000);
            });
        });
    }
});
