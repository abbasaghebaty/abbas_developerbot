// DOM references shared across modules.
export function getDomRefs() {
        // ========================================
        // DOM References
        // ========================================
        const typingTextEl = document.getElementById('typingText');
        const flipClockEl = document.getElementById('flipClock');
        const bgOrbsEl = document.getElementById('bgOrbs');
        const currentYearEl = document.getElementById('currentYear');
        const lastUpdatedEl = document.getElementById('lastUpdated');
        const statProjectsEl = document.getElementById('statProjects');
        const statReposEl = document.getElementById('statRepos');
        const statExperienceEl = document.getElementById('statExperience');
        const statVisitorsEl = document.getElementById('statVisitors');
        const portfolioGrid = document.getElementById('portfolioGrid');
        const statsSectionEl = document.getElementById('statsSection');


    return {
        typingTextEl, flipClockEl, bgOrbsEl, currentYearEl, lastUpdatedEl,
        statProjectsEl, statReposEl, statExperienceEl, statVisitorsEl,
        portfolioGrid, statsSectionEl,
    };
}
