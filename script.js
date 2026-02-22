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

    // (Old portfolio-video-wrapper logic removed since videos are Vimeo iframes)
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
 * Toggle visibility of hidden portfolio projects
 */
function toggleProjects() {
    const hiddenProjects = document.querySelectorAll('.hidden-project');
    const viewMoreBtn = document.getElementById('view-more-btn');
    let isShowing = false;

    hiddenProjects.forEach(project => {
        if (project.style.display === 'none' || project.style.display === '') {
            project.style.display = 'block';
            isShowing = true;
        } else {
            project.style.display = 'none';
            isShowing = false;
        }
    });

    if (isShowing) {
        viewMoreBtn.textContent = 'View Less Projects';
    } else {
        viewMoreBtn.textContent = 'View More Projects';
        // Optional: Scroll back up to the portfolio section when hiding
        document.getElementById('portfolio').scrollIntoView({ behavior: 'smooth' });
    }
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

            const data = {
                name: this.name.value,
                email: this.email.value,
                project_type: this.project_type.value || '',
                budget: this.budget.value || '',
                message: this.message.value || ''
            };

            fetch("https://script.google.com/macros/s/AKfycbx-LQJvA6Iur-K-3aXPZUVeVNVBiYrD--dShXK21QekklEqjkW9WmQC0Gs3v6shiuAyug/exec", {
                method: "POST",
                body: JSON.stringify(data),
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
