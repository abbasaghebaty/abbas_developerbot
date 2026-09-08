// Mouse-driven parallax motion for the background orbs.
export function initParallax(bgOrbsEl) {
        // ========================================
        // Mouse Parallax for Background Orbs
        // ========================================
        const orbs = bgOrbsEl.querySelectorAll('.bg-orb');
        let mouseX = 0;
        let mouseY = 0;
        let targetMouseX = 0;
        let targetMouseY = 0;
        let isTouchDevice = false;

        window.addEventListener('touchstart', function onFirstTouch() {
            isTouchDevice = true;
            window.removeEventListener('touchstart', onFirstTouch);
        }, { once: true, passive: true });

        document.addEventListener('mousemove', function(e) {
            if (isTouchDevice) return;
            targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        }, { passive: true });

        function updateParallax() {
            mouseX += (targetMouseX - mouseX) * 0.04;
            mouseY += (targetMouseY - mouseY) * 0.04;
            if (!isTouchDevice) {
                const intensities = [18, 22, 14, 20];
                orbs.forEach((orb, i) => {
                    const intensity = intensities[i] || 15;
                    orb.style.transform = `translate(${mouseX * intensity}px, ${mouseY * intensity}px)`;
                });
            }
            requestAnimationFrame(updateParallax);
        }
        requestAnimationFrame(updateParallax);

}
