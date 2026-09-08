// Subtle 3D mouse-tilt effect applied to portfolio & social cards.
export function initTiltEffect() {
        // ========================================
        // Mouse Tilt Effect for Cards (3D subtle tilt)
        // ========================================
        function applyTiltEffect(card) {
            let rafId = null;
            let currentTiltX = 0;
            let currentTiltY = 0;
            let targetTiltX = 0;
            let targetTiltY = 0;

            function lerp(a, b, t) { return a + (b - a) * t; }

            function animateTilt() {
                currentTiltX = lerp(currentTiltX, targetTiltX, 0.12);
                currentTiltY = lerp(currentTiltY, targetTiltY, 0.12);
                card.style.transform =
                    `perspective(800px) rotateX(${currentTiltY}deg) rotateY(${currentTiltX}deg) translateY(${card.matches(':hover') ? '-6px' : '0px'})`;
                if (Math.abs(currentTiltX - targetTiltX) > 0.01 || Math.abs(currentTiltY - targetTiltY) >
                    0.01 || card.matches(':hover')) {
                    rafId = requestAnimationFrame(animateTilt);
                } else {
                    card.style.transform = '';
                    rafId = null;
                }
            }

            card.addEventListener('mousemove', function(e) {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                targetTiltX = ((x - centerX) / centerX) * 5; // max ±5 degrees
                targetTiltY = ((y - centerY) / centerY) * -5; // inverted for natural feel
                if (!rafId) {
                    rafId = requestAnimationFrame(animateTilt);
                }
            });

            card.addEventListener('mouseleave', function() {
                targetTiltX = 0;
                targetTiltY = 0;
                if (!rafId) {
                    rafId = requestAnimationFrame(animateTilt);
                }
                // After animation settles, clean up
                setTimeout(() => {
                    if (rafId && Math.abs(currentTiltX) < 0.05 && Math.abs(currentTiltY) < 0.05 && !card.matches(
                            ':hover')) {
                        cancelAnimationFrame(rafId);
                        rafId = null;
                        card.style.transform = '';
                    }
                }, 600);
            });
        }

        // Apply tilt to all portfolio cards and social cards
        document.querySelectorAll('.portfolio-card, .social-card').forEach(card => {
            applyTiltEffect(card);
        });

}
