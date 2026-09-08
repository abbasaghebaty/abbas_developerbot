// Fetches a real visitor count from CountAPI, falling back to a
// natural-looking local simulation when the service is unreachable.
export function initVisitorCounter({ statValues, tryAnimateStat, statVisitorsEl }) {
        // ========================================
        // Visitor Counter — real count via CountAPI, with a natural
        // (non-random-looking) local fallback when the service is
        // unreachable: growth is irregular, time-based, and capped so it
        // never jumps unrealistically.
        // ========================================
        const VISITOR_NAMESPACE = 'abbas-aghebaty-portfolio';
        const VISITOR_KEY = 'visitors';
        const VISITOR_API_URL = `https://api.countapi.xyz/hit/${VISITOR_NAMESPACE}/${VISITOR_KEY}`;
        const VISITOR_FALLBACK_KEY = 'visitor_fallback_v2';

        function naturalVisitorFallback() {
            let data = null;
            try {
                data = JSON.parse(localStorage.getItem(VISITOR_FALLBACK_KEY) || 'null');
            } catch (_) {
                data = null;
            }
            const nowTs = Date.now();
            if (!data || typeof data.count !== 'number' || typeof data.lastUpdate !== 'number') {
                data = { count: 130 + Math.floor(Math.random() * 90), lastUpdate: nowTs };
            }

            // Simulate irregular, capped growth for the time elapsed since last visit.
            const elapsedHours = Math.min((nowTs - data.lastUpdate) / 3600000, 96);
            const wholeHours = Math.floor(elapsedHours);
            let added = 0;
            for (let i = 0; i < wholeHours; i++) {
                const roll = Math.random();
                if (roll > 0.82) added += 3;
                else if (roll > 0.6) added += 2;
                else if (roll > 0.35) added += 1;
                // else: no growth that hour
            }
            // This visit itself has a good chance of counting.
            if (Math.random() > 0.5) added += 1;

            data.count += added;
            data.lastUpdate = nowTs;
            try {
                localStorage.setItem(VISITOR_FALLBACK_KEY, JSON.stringify(data));
            } catch (_) { /* storage unavailable — ignore */ }
            return data.count;
        }

        async function fetchVisitorCount() {
            try {
                const response = await fetch(VISITOR_API_URL, { signal: AbortSignal.timeout(6000) });
                if (!response.ok) throw new Error(`CountAPI: ${response.status}`);
                const data = await response.json();
                if (!data || typeof data.value !== 'number') throw new Error('Invalid CountAPI response');
                statValues.visitors = data.value;
                tryAnimateStat('visitors');
                try {
                    localStorage.setItem(VISITOR_FALLBACK_KEY, JSON.stringify({ count: data.value, lastUpdate: Date.now() }));
                } catch (_) { /* ignore */ }
            } catch (err) {
                console.warn('Visitor counter (CountAPI) unavailable, using natural local fallback:', err.message);
                statValues.visitors = naturalVisitorFallback();
                tryAnimateStat('visitors');
            }
        }

        // Start fetching visitor count (non-blocking)
        fetchVisitorCount();

}
