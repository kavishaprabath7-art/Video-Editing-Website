/**
 * Cinematic Portfolio Main Script
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize fade-in animations
    initScrollAnimations();

    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '100%';
            navLinks.style.left = '0';
            navLinks.style.width = '100%';
            navLinks.style.background = 'rgba(10, 25, 47, 0.95)';
            navLinks.style.padding = '20px 0';
        });
    }

    // Contact Sidebar Toggle
    const sidebar = document.getElementById('contactSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const openBtn = document.getElementById('openSidebarBtn');
    const closeBtn = document.getElementById('closeSidebarBtn');

    function openSidebar(e) {
        if (e) e.preventDefault();
        sidebar.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    function closeSidebar(e) {
        if (e) e.preventDefault();
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Attach to all related buttons
    const triggerBtns = [
        document.getElementById('openSidebarBtn'),
        document.getElementById('navContactBtn'),
        document.getElementById('heroContactBtn'),
        ...document.querySelectorAll('.open-sidebar-btn')
    ];

    triggerBtns.forEach(btn => {
        if (btn) btn.addEventListener('click', openSidebar);
    });

    if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
    if (overlay) overlay.addEventListener('click', closeSidebar);

    // Sidebar swipe to close on mobile
    let sidebarTouchStart = 0;
    if (sidebar) {
        sidebar.addEventListener('touchstart', e => {
            sidebarTouchStart = e.changedTouches[0].screenX;
        }, { passive: true });

        sidebar.addEventListener('touchend', e => {
            if (e.changedTouches[0].screenX > sidebarTouchStart + 50) {
                closeSidebar();
            }
        });
    }

    initPortfolioCarousel();
});

/**
 * Intersection Observer for fade-in animations on scroll
 */
function initScrollAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in');

    if (fadeElements.length === 0) return;

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');

                // Add visible class specifically for slide-up items
                if (entry.target.classList.contains('slide-up')) {
                    entry.target.classList.add('visible');
                }

                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeElements.forEach(element => {
        observer.observe(element);
    });
}

/**
 * Portfolio Coverflow Carousel
 */
function initPortfolioCarousel() {
    const items = document.querySelectorAll('.portfolio-carousel .portfolio-item');
    if (!items.length) return;

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    let currentIndex = 0;

    // Load vimeo players for portfolio
    const vimeoPlayers = [];
    if (typeof Vimeo !== 'undefined') {
        items.forEach(item => {
            const iframe = item.querySelector('iframe');
            if (iframe) {
                vimeoPlayers.push(new Vimeo.Player(iframe));
            } else {
                vimeoPlayers.push(null);
            }
        });
    }

    function updateCarousel() {
        items.forEach((item, index) => {
            // Remove existing state classes
            item.classList.remove('active', 'prev', 'next', 'hidden-left', 'hidden-right');
            item.style.position = 'absolute';
            item.style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            item.style.width = '80%';
            item.style.maxWidth = '450px';
            item.style.cursor = 'pointer';

            // Enable/disable pointer events on the iframe wrapper to prevent stealing clicks
            const iframeWrapper = item.querySelector('div > div');
            if (iframeWrapper) {
                iframeWrapper.style.pointerEvents = 'none'; // Keep none by default to allow swiping on the parent
            }

            // Also enable events on iframe itself since we disabled it in HTML earlier
            const iframe = item.querySelector('iframe');
            if (iframe) {
                iframe.style.pointerEvents = 'none'; // Keep none by default to allow swiping
            }

            // Create or manage a touch overlay for the active item
            let touchOverlay = item.querySelector('.touch-overlay');
            if (!touchOverlay) {
                touchOverlay = document.createElement('div');
                touchOverlay.className = 'touch-overlay';
                touchOverlay.style.position = 'absolute';
                touchOverlay.style.top = '0';
                touchOverlay.style.left = '0';
                touchOverlay.style.width = '100%';
                touchOverlay.style.height = '100%';
                touchOverlay.style.zIndex = '50';
                item.appendChild(touchOverlay);

                // When they click the overlay on the ACTIVE item, remove the overlay to let them play the video
                touchOverlay.addEventListener('click', (e) => {
                    if (item.classList.contains('active')) {
                        touchOverlay.style.display = 'none';
                        if (iframeWrapper) iframeWrapper.style.pointerEvents = 'auto';
                        if (iframe) iframe.style.pointerEvents = 'auto';

                        // Try to auto-play if clicked
                        const index = parseInt(item.getAttribute('data-index') || item.dataset.index);
                        if (typeof index !== 'undefined' && vimeoPlayers[index]) {
                            vimeoPlayers[index].play().catch(err => console.log(err));
                        }
                    }
                });
            } else {
                // Reset overlay when carousel moves
                touchOverlay.style.display = 'block';
            }

            if (index === currentIndex) {
                item.classList.add('active');
                item.style.transform = 'translateX(0) scale(1) translateZ(0)';
                item.style.zIndex = '10';
                item.style.opacity = '1';
                item.style.filter = 'blur(0px)';
            } else if (index === (currentIndex - 1 + items.length) % items.length) {
                item.classList.add('prev');
                item.style.transform = 'translateX(-75%) scale(0.8) translateZ(-100px)';
                item.style.zIndex = '5';
                item.style.opacity = '0.6';
                item.style.filter = 'blur(6px)';
            } else if (index === (currentIndex + 1) % items.length) {
                item.classList.add('next');
                item.style.transform = 'translateX(75%) scale(0.8) translateZ(-100px)';
                item.style.zIndex = '5';
                item.style.opacity = '0.6';
                item.style.filter = 'blur(6px)';
            } else {
                // Determine if it should hide left or right
                let diff = index - currentIndex;
                if (diff < 0) diff += items.length;
                if (diff > items.length / 2) {
                    item.classList.add('hidden-left');
                    item.style.transform = 'translateX(-120%) scale(0.6) translateZ(-200px)';
                } else {
                    item.classList.add('hidden-right');
                    item.style.transform = 'translateX(120%) scale(0.6) translateZ(-200px)';
                }
                item.style.zIndex = '1';
                item.style.opacity = '0';
                item.style.pointerEvents = 'none';
            }
        });

        // Pause all players when carousel updates, user has to manually play current
        vimeoPlayers.forEach((player, idx) => {
            if (player && idx !== currentIndex) {
                player.pause().catch(e => console.log('Player pause blocked', e));
            }
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + items.length) % items.length;
            updateCarousel();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % items.length;
            updateCarousel();
        });
    }

    // Click on item to navigate
    items.forEach((item, index) => {
        item.addEventListener('click', (e) => {
            if (index !== currentIndex) {
                currentIndex = index;
                updateCarousel();
            }
        });
    });

    // Touch support (swipe)
    let touchStartX = 0;
    let touchEndX = 0;
    const carouselContainer = document.querySelector('.portfolio-carousel-wrapper');

    if (carouselContainer) {
        carouselContainer.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        });

        carouselContainer.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
    }

    function handleSwipe() {
        if (touchEndX < touchStartX - 50) {
            // Swipe left -> next
            currentIndex = (currentIndex + 1) % items.length;
            updateCarousel();
        } else if (touchEndX > touchStartX + 50) {
            // Swipe right -> prev
            currentIndex = (currentIndex - 1 + items.length) % items.length;
            updateCarousel();
        }
    }

    updateCarousel();
}

/**
 * Vimeo Player interactions for Showreels
 */
document.addEventListener('DOMContentLoaded', () => {
    const heroShowreelIframe = document.getElementById('hero-vimeo-player');
    const fiverrShowreelIframe = document.getElementById('fiverr-vimeo-player');
    const heroCustomPoster = document.getElementById('hero-custom-poster');

    let heroPlayer = null;
    let fiverrPlayer = null;

    if (heroShowreelIframe && typeof Vimeo !== 'undefined') heroPlayer = new Vimeo.Player(heroShowreelIframe);
    if (fiverrShowreelIframe && typeof Vimeo !== 'undefined') fiverrPlayer = new Vimeo.Player(fiverrShowreelIframe);

    const playWithUnload = (playerToPlay, playerToUnload) => {
        if (!playerToPlay) return;

        // Unload the other player if it exists (stops it & reverts it)
        if (playerToUnload) {
            playerToUnload.unload().catch(e => console.log("Unload prevented:", e));
        }

        // Play the hovered/touched video unmuted
        playerToPlay.setVolume(1).then(() => {
            playerToPlay.play().catch(e => {
                console.log("Auto-play prevented (usually requires interaction first):", e);
            });
        }).catch(e => console.log("Volume set prevented:", e));
    };

    if (heroPlayer && fiverrPlayer) {
        // Hero Player Events
        heroPlayer.on('play', () => {
            heroPlayer.setVolume(1);
            if (heroCustomPoster) heroCustomPoster.style.opacity = '0';
            fiverrPlayer.unload().catch(e => console.log("Unload prevented", e));
        });

        heroPlayer.on('pause', () => {
            if (heroCustomPoster) heroCustomPoster.style.opacity = '1';
        });

        heroPlayer.on('ended', () => {
            if (heroCustomPoster) heroCustomPoster.style.opacity = '1';
        });

        // Fiverr Player Events
        fiverrPlayer.on('play', () => {
            fiverrPlayer.setVolume(1);
            if (heroCustomPoster) heroCustomPoster.style.opacity = '1';
            heroPlayer.unload().catch(e => console.log("Unload prevented", e));
        });
    }

    // Hero Showreel Events
    const heroWrapper = document.querySelector('.hero .hero-showreel');
    if (heroWrapper && heroPlayer) {
        heroWrapper.addEventListener('mouseenter', () => playWithUnload(heroPlayer, fiverrPlayer));
    }

    // Fiverr Showreel Events
    const fiverrWrapper = document.querySelector('.fiverr-showreel .hero-showreel');
    if (fiverrWrapper && fiverrPlayer) {
        fiverrWrapper.addEventListener('mouseenter', () => playWithUnload(fiverrPlayer, heroPlayer));
    }

    // Auto-pause when scrolling out of view
    const videoObserverOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 // Pause when only 10% is visible
    };

    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                if (entry.target === heroWrapper && heroPlayer) {
                    heroPlayer.pause().catch(e => console.log('Pause blocked', e));
                } else if (entry.target === fiverrWrapper && fiverrPlayer) {
                    fiverrPlayer.pause().catch(e => console.log('Pause blocked', e));
                }
            }
        });
    }, videoObserverOptions);

    if (heroWrapper) videoObserver.observe(heroWrapper);
    if (fiverrWrapper) videoObserver.observe(fiverrWrapper);
});

/**
 * Contact Form Submission to Google Apps Script
 */
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            const data = new FormData();
            data.append('name', this.name.value);
            data.append('email', this.email.value);
            data.append('project_type', this.project_type.value || '');
            data.append('service', this.service.value || '');
            data.append('budget', this.budget.value || '');
            data.append('message', this.message.value || '');

            fetch("https://script.google.com/macros/s/AKfycby_THfWs8LRvciU1aiEAmymi6dUiM4-bAi24Dn7GrOQASjhdr0nunCOLOHgDX-iwbtzSw/exec", {
                method: "POST",
                body: data,
                mode: "no-cors"
            }).then(res => {
                alert("Message sent successfully!");
                this.reset();
            }).catch(err => {
                console.error("Error:", err);
                alert("An error occurred while sending the message.");
            }).finally(() => {
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
            });
        });
    }
});
