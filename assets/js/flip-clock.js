// Tehran-time flip clock with a per-digit roller animation.
export function initFlipClock(flipClockEl) {
        // ========================================
        // Flip Clock — Robust Per-Digit Roller
        //
        // Each digit window contains a single "track" with two stacked
        // slots (top + bottom). At rest the track sits at translateY(-50%),
        // which shows the BOTTOM slot (the current digit). To animate to a
        // new value we write the new value into the TOP slot, then slide
        // the track down to translateY(0%): the new digit slides in from
        // above while the old digit exits below. Only at the exact instant
        // the transition ends do we (a) reset the track back to its resting
        // position and (b) copy the new value into the bottom slot — as one
        // synchronous, transition-free operation — so the old value can
        // never flash back into view. Digits that change again mid-flight
        // are queued and replayed after the current animation completes.
        // ========================================
        const digitWrappers = {};
        const digitData = {};
        const allDigitKeys = ['h0', 'h1', 'm0', 'm1', 's0', 's1'];
        const CLOCK_ANIM_MS = 360;
        const CLOCK_EASING = 'cubic-bezier(0.22, 0.61, 0.36, 1)';

        allDigitKeys.forEach(key => {
            const wrapper = flipClockEl.querySelector(`[data-digit="${key}"]`);
            if (!wrapper) return;
            const track = wrapper.querySelector('.clock__digit-track');
            const spans = track.querySelectorAll('.clock__digit-span');
            digitWrappers[key] = wrapper;
            digitData[key] = {
                track: track,
                topSpan: spans[0],
                bottomSpan: spans[1],
                currentValue: null,
                isAnimating: false,
                queuedValue: null,
                glowTimeout: null,
            };
        });

        function initDigit(key, value) {
            const d = digitData[key];
            d.currentValue = value;
            d.topSpan.textContent = value;
            d.bottomSpan.textContent = value;
            d.topSpan.style.transition = 'none';
            d.topSpan.style.filter = 'none';
            d.topSpan.style.opacity = '1';
            d.track.style.transition = 'none';
            d.track.style.transform = 'translateY(-50%)';
        }

        function animateDigit(key, newValue) {
            const d = digitData[key];
            const wrapper = digitWrappers[key];
            if (!d || d.currentValue === newValue) return;

            if (d.isAnimating) {
                // Newer value arrived mid-flight — just update what will
                // enter next; the current animation still finishes cleanly.
                d.queuedValue = newValue;
                return;
            }

            d.isAnimating = true;

            // Write the incoming digit into the top (entering) slot.
            d.topSpan.textContent = newValue;

            // Ensure we start from the resting position with no transition.
            d.track.style.transition = 'none';
            d.track.style.transform = 'translateY(-50%)';
            d.topSpan.style.transition = 'none';
            d.topSpan.style.filter = 'blur(3px) brightness(1.7)';
            d.topSpan.style.opacity = '0.55';
            void d.track.offsetHeight; // force reflow

            wrapper.classList.remove('glow-fading');
            wrapper.classList.add('glow-active');

            requestAnimationFrame(() => {
                d.track.style.transition = `transform ${CLOCK_ANIM_MS}ms ${CLOCK_EASING}`;
                d.track.style.transform = 'translateY(0%)';
                d.topSpan.style.transition = `filter ${CLOCK_ANIM_MS}ms ease-out, opacity ${CLOCK_ANIM_MS}ms ease-out`;
                d.topSpan.style.filter = 'blur(0px) brightness(1)';
                d.topSpan.style.opacity = '1';
            });

            let finished = false;
            const finish = () => {
                if (finished) return;
                finished = true;
                d.track.removeEventListener('transitionend', onEnd);
                clearTimeout(fallback);

                // Synchronous, transition-free reset: the bottom slot now
                // holds the new value, and the track snaps back to rest —
                // both happen in the same tick, so nothing flashes.
                d.bottomSpan.textContent = newValue;
                d.track.style.transition = 'none';
                d.track.style.transform = 'translateY(-50%)';
                d.topSpan.style.transition = 'none';
                d.topSpan.style.filter = 'none';
                d.topSpan.style.opacity = '1';

                d.currentValue = newValue;
                d.isAnimating = false;

                wrapper.classList.remove('glow-active');
                wrapper.classList.add('glow-fading');
                clearTimeout(d.glowTimeout);
                d.glowTimeout = setTimeout(() => wrapper.classList.remove('glow-fading'), 520);

                if (d.queuedValue !== null && d.queuedValue !== d.currentValue) {
                    const next = d.queuedValue;
                    d.queuedValue = null;
                    requestAnimationFrame(() => animateDigit(key, next));
                } else {
                    d.queuedValue = null;
                }
            };

            const onEnd = (e) => {
                if (e.target !== d.track || e.propertyName !== 'transform') return;
                finish();
            };
            d.track.addEventListener('transitionend', onEnd);
            const fallback = setTimeout(finish, CLOCK_ANIM_MS + 150);
        }

        function getTehranTime() {
            const nowDate = new Date();
            const options = {
                timeZone: 'Asia/Tehran',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
            };
            const formatter = new Intl.DateTimeFormat('en-US', options);
            const parts = formatter.formatToParts(nowDate);
            let hours = '00',
                minutes = '00',
                seconds = '00';
            for (const part of parts) {
                if (part.type === 'hour') hours = part.value.padStart(2, '0');
                if (part.type === 'minute') minutes = part.value.padStart(2, '0');
                if (part.type === 'second') seconds = part.value.padStart(2, '0');
            }
            if (hours === '24') hours = '00';
            return { hours, minutes, seconds };
        }

        function updateClock() {
            const time = getTehranTime();
            const newDigits = {
                h0: time.hours[0],
                h1: time.hours[1],
                m0: time.minutes[0],
                m1: time.minutes[1],
                s0: time.seconds[0],
                s1: time.seconds[1],
            };

            if (digitData['h0'].currentValue === null) {
                allDigitKeys.forEach(key => initDigit(key, newDigits[key]));
                return;
            }

            allDigitKeys.forEach(key => {
                if (newDigits[key] !== digitData[key].currentValue) {
                    animateDigit(key, newDigits[key]);
                }
            });
        }

        updateClock();
        setInterval(updateClock, 200);

}
