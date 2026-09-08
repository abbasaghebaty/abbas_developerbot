// Fades/slides `.reveal` elements in as they enter the viewport.
export function initScrollReveal() {
        // ========================================
        // Intersection Observer — Scroll Reveal
        // ========================================
        const revealElements = document.querySelectorAll('.reveal');
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -40px 0px',
            threshold: 0.1,
        };

        const observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting && entry.target.classList.contains('reveal')) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            }
        }, observerOptions);

        revealElements.forEach(el => observer.observe(el));

}
