// Fetches the live public-repo count from the GitHub API (with a
// localStorage cache) and feeds it into the shared stats state.
export function initGithubStats({ statValues, statAnimated, tryAnimateStat, statReposEl }) {
        // ========================================
        // GitHub API — Fetch Repository Count
        // ========================================
        const GITHUB_USERNAME = 'abbasaghebaty';
        const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}`;
        const REPOS_CACHE_KEY = 'gh_repos_count';
        const REPOS_CACHE_TIME_KEY = 'gh_repos_cache_time';
        const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

        function readCachedRepoCount() {
            try {
                const cachedCount = localStorage.getItem(REPOS_CACHE_KEY);
                const cachedTime = localStorage.getItem(REPOS_CACHE_TIME_KEY);
                if (cachedCount === null || cachedTime === null) return null;
                return { count: parseInt(cachedCount, 10), time: parseInt(cachedTime, 10) };
            } catch (_) {
                return null;
            }
        }

        function writeCachedRepoCount(count) {
            try {
                localStorage.setItem(REPOS_CACHE_KEY, String(count));
                localStorage.setItem(REPOS_CACHE_TIME_KEY, String(Date.now()));
            } catch (_) { /* storage unavailable — ignore */ }
        }

        async function fetchRepoCount() {
            const cached = readCachedRepoCount();
            if (cached && !Number.isNaN(cached.count)) {
                statValues.repos = cached.count;
                tryAnimateStat('repos');
                if (Date.now() - cached.time < CACHE_DURATION_MS) {
                    refreshRepoCountInBackground();
                    return;
                }
            }

            try {
                const response = await fetch(GITHUB_API_URL, {
                    headers: { 'Accept': 'application/vnd.github.v3+json' },
                    signal: AbortSignal.timeout(8000),
                });
                if (!response.ok) throw new Error(`GitHub API: ${response.status}`);
                const data = await response.json();
                if (typeof data.public_repos === 'number') {
                    statValues.repos = data.public_repos;
                    statAnimated.repos = false; // allow re-animation to the fresh value if not yet shown
                    tryAnimateStat('repos');
                    if (statAnimated.repos === false) {
                        // section not visible yet — keep the flag reset so it animates once visible
                    }
                    writeCachedRepoCount(data.public_repos);
                }
            } catch (err) {
                console.warn('GitHub API fetch failed, using cache or fallback:', err.message);
                if (statValues.repos === null) {
                    statReposEl.textContent = '--';
                }
            }
        }

        async function refreshRepoCountInBackground() {
            try {
                const response = await fetch(GITHUB_API_URL, {
                    headers: { 'Accept': 'application/vnd.github.v3+json' },
                    signal: AbortSignal.timeout(6000),
                });
                if (!response.ok) return;
                const data = await response.json();
                if (typeof data.public_repos === 'number' && data.public_repos !== statValues.repos) {
                    statValues.repos = data.public_repos;
                    if (statAnimated.repos) {
                        // Already shown once — just update the number quietly, no re-animation.
                        statReposEl.textContent = data.public_repos;
                    } else {
                        tryAnimateStat('repos');
                    }
                    writeCachedRepoCount(data.public_repos);
                }
            } catch (_) {
                // Silent background refresh failure
            }
        }

        // Start fetching repo count (non-blocking)
        fetchRepoCount();

}
