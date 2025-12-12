// VividP - Main JavaScript File
// Handles all interactive functionality and animations

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initParticles();
    initTypedText();
    initScrollAnimations();
    initMobileMenu();
    initSmoothScrolling();
});

// Particle System using Matter.js
function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    
    // Create canvas for particles
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    container.appendChild(canvas);
    
    // Initialize Matter.js
    const Engine = Matter.Engine;
    const Render = Matter.Render;
    const World = Matter.World;
    const Bodies = Matter.Bodies;
    const Mouse = Matter.Mouse;
    const MouseConstraint = Matter.MouseConstraint;
    
    const engine = Engine.create();
    const world = engine.world;
    
    // Create renderer
    const render = Render.create({
        canvas: canvas,
        engine: engine,
        options: {
            width: window.innerWidth,
            height: window.innerHeight,
            wireframes: false,
            background: 'transparent',
            showAngleIndicator: false,
            showVelocity: false
        }
    });
    
    // Create floating particles
    const particles = [];
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        const size = Math.random() * 3 + 1;
        
        const particle = Bodies.circle(x, y, size, {
            render: {
                fillStyle: '#06B6D4',
                strokeStyle: '#0891B2',
                lineWidth: 1
            },
            frictionAir: 0.01,
            density: 0.0001
        });
        
        // Add random velocity
        Matter.Body.setVelocity(particle, {
            x: (Math.random() - 0.5) * 2,
            y: (Math.random() - 0.5) * 2
        });
        
        particles.push(particle);
        World.add(world, particle);
    }
    
    // Add mouse interaction
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: false
            }
        }
    });
    World.add(world, mouseConstraint);
    
    // Run the engine and renderer
    Engine.run(engine);
    Render.run(render);
    
    // Handle window resize
    window.addEventListener('resize', function() {
        render.canvas.width = window.innerWidth;
        render.canvas.height = window.innerHeight;
        render.options.width = window.innerWidth;
        render.options.height = window.innerHeight;
    });
    
    // Animate particles
    function animateParticles() {
        particles.forEach(particle => {
            // Add subtle floating motion
            const force = {
                x: (Math.random() - 0.5) * 0.001,
                y: (Math.random() - 0.5) * 0.001
            };
            Matter.Body.applyForce(particle, particle.position, force);
            
            // Wrap around screen edges
            if (particle.position.x > window.innerWidth + 50) {
                Matter.Body.setPosition(particle, { x: -50, y: particle.position.y });
            }
            if (particle.position.x < -50) {
                Matter.Body.setPosition(particle, { x: window.innerWidth + 50, y: particle.position.y });
            }
            if (particle.position.y > window.innerHeight + 50) {
                Matter.Body.setPosition(particle, { x: particle.position.x, y: -50 });
            }
            if (particle.position.y < -50) {
                Matter.Body.setPosition(particle, { x: particle.position.x, y: window.innerHeight + 50 });
            }
        });
        
        requestAnimationFrame(animateParticles);
    }
    
    animateParticles();
}

// Typed Text Animation
function initTypedText() {
    const typedElement = document.getElementById('typed-text');
    if (!typedElement) return;
    
    const options = {
        strings: [
            'Elite Engineering Teams',
            'Modern Infrastructure',
            'Secure Platforms',
            'AI-Native Operations'
        ],
        typeSpeed: 80,
        backSpeed: 50,
        backDelay: 2000,
        loop: true,
        showCursor: true,
        cursorChar: '|'
    };
    
    new Typed('#typed-text', options);
}

// Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Observe all fade-in elements
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
    
    // Animate feature cards on scroll
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(card);
    });
    
    // Animate pricing cards on scroll
    const pricingCards = document.querySelectorAll('.pricing-card');
    pricingCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.15}s`;
        observer.observe(card);
    });
}

// Mobile Menu
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    if (!mobileMenuBtn) return;
    
    mobileMenuBtn.addEventListener('click', function() {
        // Create mobile menu if it doesn't exist
        let mobileMenu = document.getElementById('mobile-menu');
        if (!mobileMenu) {
            mobileMenu = createMobileMenu();
        }
        
        // Toggle menu visibility
        if (mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.remove('hidden');
            anime({
                targets: mobileMenu,
                opacity: [0, 1],
                translateY: [-20, 0],
                duration: 300,
                easing: 'easeOutQuad'
            });
        } else {
            anime({
                targets: mobileMenu,
                opacity: [1, 0],
                translateY: [0, -20],
                duration: 300,
                easing: 'easeOutQuad',
                complete: function() {
                    mobileMenu.classList.add('hidden');
                }
            });
        }
    });
}

function createMobileMenu() {
    const nav = document.querySelector('nav');
    const mobileMenu = document.createElement('div');
    mobileMenu.id = 'mobile-menu';
    mobileMenu.className = 'md:hidden absolute top-full left-0 right-0 glass p-6 hidden';
    mobileMenu.innerHTML = `
        <div class="space-y-4">
            <a href="#features" class="block text-gray-300 hover:text-cyan-400 transition-colors py-2">Features</a>
            <a href="#pricing" class="block text-gray-300 hover:text-cyan-400 transition-colors py-2">Pricing</a>
            <a href="#faq" class="block text-gray-300 hover:text-cyan-400 transition-colors py-2">FAQ</a>
            <a href="login.html" class="block text-gray-300 hover:text-cyan-400 transition-colors py-2">Login</a>
            <a href="signup.html" class="block btn-primary text-center">Get Started</a>
        </div>
    `;
    nav.appendChild(mobileMenu);
    return mobileMenu;
}

// Smooth Scrolling
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80; // Account for fixed nav
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// FAQ Toggle
function toggleFAQ(element) {
    const faqItem = element.parentElement;
    const isActive = faqItem.classList.contains('active');
    
    // Close all FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Open clicked item if it wasn't already active
    if (!isActive) {
        faqItem.classList.add('active');
    }
}

// Pricing Plan Selection
function selectPlan(plan) {
    const planNames = {
        'free': 'Free Plan',
        'team': 'Team Plan',
        'enterprise': 'Enterprise Plan'
    };
    
    // Animate button feedback
    const button = event.target;
    const originalText = button.textContent;
    
    anime({
        targets: button,
        scale: [1, 0.95, 1],
        duration: 200,
        easing: 'easeOutQuad'
    });
    
    // Show success message
    showNotification(`Great choice! You've selected the ${planNames[plan]}. Redirecting to signup...`, 'success');
    
    // Simulate redirect (in real app, would redirect to appropriate signup page)
    setTimeout(() => {
        if (plan === 'free' || plan === 'team') {
            window.location.href = 'signup.html';
        } else {
            window.location.href = 'signup.html'; // Would redirect to sales contact form
        }
    }, 1500);
}

// Demo Functions
function openDemo() {
    showNotification('Opening interactive demo... This would launch a live demo environment.', 'info');
    
    // In a real application, this would open a demo modal or redirect to demo page
    setTimeout(() => {
        window.open('dashboard.html', '_blank');
    }, 1000);
}

function openLiveDemo() {
    showNotification('Loading live dashboard demo...', 'info');
    
    setTimeout(() => {
        window.open('dashboard.html', '_blank');
    }, 1000);
}

function bookCall() {
    showNotification('Opening calendar booking... This would integrate with Calendly or similar.', 'info');
    
    // In a real application, this would open a calendar booking widget
    setTimeout(() => {
        const modal = createBookingModal();
        document.body.appendChild(modal);
        
        anime({
            targets: modal,
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutQuad'
        });
    }, 1000);
}

function createBookingModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="glass p-8 rounded-lg max-w-md w-full mx-4">
            <h3 class="text-2xl font-bold text-white mb-4">Book a Demo Call</h3>
            <p class="text-gray-300 mb-6">
                Schedule a personalized demo with our team to see how VividP can transform your developer experience.
            </p>
            <div class="space-y-4">
                <div class="flex items-center space-x-3 text-gray-300">
                    <svg class="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path>
                    </svg>
                    <span>30-minute demo call</span>
                </div>
                <div class="flex items-center space-x-3 text-gray-300">
                    <svg class="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd"></path>
                    </svg>
                    <span>Personalized for your use case</span>
                </div>
                <div class="flex items-center space-x-3 text-gray-300">
                    <svg class="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"></path>
                    </svg>
                    <span>Live platform demonstration</span>
                </div>
            </div>
            <div class="flex space-x-4 mt-8">
                <button class="btn-primary flex-1" onclick="proceedToBooking()">
                    Schedule Now
                </button>
                <button class="btn-secondary flex-1" onclick="closeModal(this)">
                    Maybe Later
                </button>
            </div>
        </div>
    `;
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal(modal.querySelector('.btn-secondary'));
        }
    });
    
    return modal;
}

function proceedToBooking() {
    showNotification('Redirecting to booking calendar...', 'info');
    // In real app, would redirect to Calendly or similar service
    setTimeout(() => {
        window.open('https://calendly.com/vividp-demo', '_blank');
    }, 1000);
}

function closeModal(button) {
    const modal = button.closest('.fixed');
    anime({
        targets: modal,
        opacity: [1, 0],
        duration: 300,
        easing: 'easeOutQuad',
        complete: function() {
            modal.remove();
        }
    });
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg glass max-w-sm transform translate-x-full transition-transform duration-300`;
    
    const colors = {
        success: 'border-green-400 text-green-400',
        error: 'border-red-400 text-red-400',
        warning: 'border-yellow-400 text-yellow-400',
        info: 'border-cyan-400 text-cyan-400'
    };
    
    notification.classList.add(colors[type] || colors.info);
    notification.innerHTML = `
        <div class="flex items-center space-x-3">
            <div class="flex-shrink-0">
                ${getNotificationIcon(type)}
            </div>
            <div class="flex-1">
                <p class="text-sm font-medium">${message}</p>
            </div>
            <button class="flex-shrink-0 text-gray-400 hover:text-white" onclick="this.parentElement.parentElement.remove()">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(full)';
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>',
        error: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>',
        warning: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>',
        info: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>'
    };
    return icons[type] || icons.info;
}

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle window resize
window.addEventListener('resize', debounce(function() {
    // Reinitialize particles on resize
    const particlesContainer = document.getElementById('particles');
    if (particlesContainer) {
        particlesContainer.innerHTML = '';
        initParticles();
    }
}, 250));

// Add loading states for buttons
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-primary') || e.target.classList.contains('btn-secondary')) {
        const button = e.target;
        if (button.disabled) return;
        
        const originalText = button.textContent;
        button.disabled = true;
        button.innerHTML = `
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
        `;
        
        setTimeout(() => {
            button.disabled = false;
            button.textContent = originalText;
        }, 2000);
    }
});

// Console easter egg for developers
console.log('%c🚀 VividP - AI-Native Internal Developer Platform', 'color: #06B6D4; font-size: 16px; font-weight: bold;');
console.log('%cBuilt for elite engineering teams with ❤️', 'color: #F8FAFC; font-size: 12px;');
console.log('%cWant to see the code? Check out our GitHub!', 'color: #94A3B8; font-size: 12px;');