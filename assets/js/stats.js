// Animated "By the Numbers" stat counters. Exposes statValues/tryAnimateStat
// so the GitHub API and visitor-counter modules can feed in async data.
export function initStats({
    statProjectsEl, statReposEl, statExperienceEl, statVisitorsEl,
    statsSectionEl, totalProjects, yearsExperience,
}) {
        // ========================================
        // Stats — values arrive async, animation runs once on first scroll
        // ========================================
        const statElements = {
            projects: statProjectsEl,
            repos: statReposEl,
            experience: statExperienceEl,
            visitors: statVisitorsEl,
        };
        const statValues = {
            projects: totalProjects,
            repos: null,
            experience: yearsExperience,
            visitors: null,
        };
        const statSuffix = { projects: '', repos: '', experience: '+', visitors: '' };
        const statAnimated = { projects: false, repos: false, experience: false, visitors: false };
        let statsSectionVisible = false;

        function easeOutCubic(t) {
            return 1 - Math.pow(1 - t, 3);
        }

        function countUpStat(el, target, suffix, duration) {
            duration = duration || 1300;
            const start = performance.now();
            function tick(nowTs) {
                const progress = Math.min((nowTs - start) / duration, 1);
                const eased = easeOutCubic(progress);
                const current = Math.round(target * eased);
                el.textContent = current + suffix;
                if (progress < 1) {
                    requestAnimationFrame(tick);
                } else {
                    el.textContent = target + suffix;
                }
            }
            requestAnimationFrame(tick);
        }

        function tryAnimateStat(key) {
            if (!statsSectionVisible) return;
            if (statAnimated[key]) return;
            const value = statValues[key];
            if (value === null || value === undefined) return;
            statAnimated[key] = true;
            countUpStat(statElements[key], value, statSuffix[key]);
        }

        const statsObserver = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    statsSectionVisible = true;
                    Object.keys(statValues).forEach(tryAnimateStat);
                    statsObserver.unobserve(entry.target);
                }
            }
        }, { root: null, rootMargin: '0px 0px -60px 0px', threshold: 0.3 });

        statsObserver.observe(statsSectionEl);


    return { statValues, statAnimated, tryAnimateStat };
}
