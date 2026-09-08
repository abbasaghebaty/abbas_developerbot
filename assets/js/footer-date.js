// Sets the footer's copyright year and "last updated" date.
export function initFooterDate(currentYearEl, lastUpdatedEl, now) {
        // ========================================
        // Set Footer Dates
        // ========================================
        currentYearEl.textContent = now.getFullYear();
        lastUpdatedEl.textContent = now.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

}
