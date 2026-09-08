// Counts the portfolio project cards rendered in the page.
export function getTotalProjects(portfolioGrid) {
        // ========================================
        // Dynamic Project Count
        // ========================================
        const projectCards = portfolioGrid.querySelectorAll('[data-project]');
        return projectCards.length;

}
