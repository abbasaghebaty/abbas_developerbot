// ========================================
// Entry point — wires up all modules in the same order the original
// inline script ran them, so behaviour and timing stay identical.
// ========================================
import { getDomRefs } from './dom-refs.js';
import { initFooterDate } from './footer-date.js';
import { getTotalProjects } from './project-count.js';
import { getYearsExperience } from './experience-calc.js';
import { initTypingAnimation } from './typing-animation.js';
import { initFlipClock } from './flip-clock.js';
import { initStats } from './stats.js';
import { initGithubStats } from './github-api.js';
import { initVisitorCounter } from './visitor-counter.js';
import { initTiltEffect } from './tilt-effect.js';
import { initScrollReveal } from './scroll-reveal.js';
import { initParallax } from './parallax.js';
import { initSmoothScroll } from './smooth-scroll.js';

(function() {
    const dom = getDomRefs();
    const now = new Date();

    initFooterDate(dom.currentYearEl, dom.lastUpdatedEl, now);

    const totalProjects = getTotalProjects(dom.portfolioGrid);
    const yearsExperience = getYearsExperience(now);

    initTypingAnimation(dom.typingTextEl);
    initFlipClock(dom.flipClockEl);

    const { statValues, statAnimated, tryAnimateStat } = initStats({
        statProjectsEl: dom.statProjectsEl,
        statReposEl: dom.statReposEl,
        statExperienceEl: dom.statExperienceEl,
        statVisitorsEl: dom.statVisitorsEl,
        statsSectionEl: dom.statsSectionEl,
        totalProjects,
        yearsExperience,
    });

    initGithubStats({ statValues, statAnimated, tryAnimateStat, statReposEl: dom.statReposEl });
    initVisitorCounter({ statValues, tryAnimateStat, statVisitorsEl: dom.statVisitorsEl });

    initTiltEffect();
    initScrollReveal();
    initParallax(dom.bgOrbsEl);
    initSmoothScroll();

        // ========================================
        // All systems go
        // ========================================
        console.log('%c🚀 Abbas Aghebaty Portfolio Ready',
            'color: #3B82F6; font-weight: bold; font-size: 1.1em;');
        console.log('%c✓ Tehran Flip Clock Active  %c✓ GitHub API Integrated  %c✓ Visitor Counter Live',
            'color: #7C3AED;', 'color: #3B82F6;', 'color: #14b8a6;');
        console.log('%cAll systems nominal. No errors.', 'color: #94a3b8; font-style: italic;');

})();
