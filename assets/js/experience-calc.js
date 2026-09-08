// Computes years of experience since the given start year.
export function getYearsExperience(now) {
        // ========================================
        // Experience Calculation (Started 2024)
        // ========================================
        const startYear = 2024;
        const currentYear = now.getFullYear();
        return Math.max(1, currentYear - startYear);

}
