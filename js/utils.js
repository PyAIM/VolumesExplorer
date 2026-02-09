/**
 * Utility functions for math and geometry operations
 */

/**
 * Evaluate a mathematical function at a given x value
 * @param {Function} fn - The function to evaluate
 * @param {number} x - The input value
 * @returns {number} The result
 */
export function evaluateFunction(fn, x) {
    return fn(x);
}

/**
 * Generate an array of x values for a given range
 * @param {number} start - Start of range
 * @param {number} end - End of range
 * @param {number} steps - Number of steps
 * @returns {number[]} Array of x values
 */
export function linspace(start, end, steps) {
    const result = [];
    const step = (end - start) / steps;
    for (let i = 0; i <= steps; i++) {
        result.push(start + i * step);
    }
    return result;
}

/**
 * Calculate disk volume for a single slice
 * V = π * r² * Δx
 * @param {number} radius - Radius of the disk
 * @param {number} thickness - Thickness (Δx)
 * @returns {number} Volume of the disk
 */
export function diskVolume(radius, thickness) {
    return Math.PI * radius * radius * thickness;
}

/**
 * Calculate washer volume for a single slice
 * V = π * (R² - r²) * Δx
 * @param {number} outerRadius - Outer radius
 * @param {number} innerRadius - Inner radius
 * @param {number} thickness - Thickness (Δx)
 * @returns {number} Volume of the washer
 */
export function washerVolume(outerRadius, innerRadius, thickness) {
    return Math.PI * (outerRadius * outerRadius - innerRadius * innerRadius) * thickness;
}

/**
 * Calculate shell volume for a single shell
 * V = 2π * r * h * Δx
 * @param {number} radius - Radius (distance from axis)
 * @param {number} height - Height of the shell
 * @param {number} thickness - Thickness (Δx)
 * @returns {number} Volume of the shell
 */
export function shellVolume(radius, height, thickness) {
    return 2 * Math.PI * radius * height * thickness;
}

/**
 * Calculate approximate volume using Riemann sum for disk method
 * @param {Function} fn - The function defining the curve
 * @param {number} a - Start of interval
 * @param {number} b - End of interval
 * @param {number} n - Number of slices
 * @param {number} axisOffset - Offset of rotation axis from y=0
 * @returns {number} Approximate volume
 */
export function diskRiemannSum(fn, a, b, n, axisOffset = 0) {
    const dx = (b - a) / n;
    let sum = 0;

    for (let i = 0; i < n; i++) {
        const x = a + (i + 0.5) * dx; // Midpoint
        const r = Math.abs(fn(x) - axisOffset);
        sum += diskVolume(r, dx);
    }

    return sum;
}

/**
 * Calculate approximate volume using Riemann sum for washer method
 * @param {Function} outerFn - Outer function
 * @param {Function} innerFn - Inner function
 * @param {number} a - Start of interval
 * @param {number} b - End of interval
 * @param {number} n - Number of slices
 * @param {number} axisOffset - Offset of rotation axis
 * @returns {number} Approximate volume
 */
export function washerRiemannSum(outerFn, innerFn, a, b, n, axisOffset = 0) {
    const dx = (b - a) / n;
    let sum = 0;

    for (let i = 0; i < n; i++) {
        const x = a + (i + 0.5) * dx;
        const R = Math.abs(outerFn(x) - axisOffset);
        const r = Math.abs(innerFn(x) - axisOffset);
        sum += washerVolume(Math.max(R, r), Math.min(R, r), dx);
    }

    return sum;
}

/**
 * Calculate approximate volume using Riemann sum for shell method
 * @param {Function} fn - The function defining the curve
 * @param {number} a - Start of interval
 * @param {number} b - End of interval
 * @param {number} n - Number of shells
 * @param {number} axisOffset - Offset of rotation axis from x=0
 * @returns {number} Approximate volume
 */
export function shellRiemannSum(fn, a, b, n, axisOffset = 0) {
    const dx = (b - a) / n;
    let sum = 0;

    for (let i = 0; i < n; i++) {
        const x = a + (i + 0.5) * dx;
        const r = Math.abs(x - axisOffset);
        const h = Math.abs(fn(x));
        sum += shellVolume(r, h, dx);
    }

    return sum;
}

/**
 * Generate a color based on position in a gradient
 * @param {number} t - Position in gradient (0 to 1)
 * @returns {number} Color as hex number
 */
export function gradientColor(t) {
    // Gradient from cyan to magenta
    const r = Math.floor(0 + t * 233);
    const g = Math.floor(217 - t * 148);
    const b = Math.floor(255 - t * 159);
    return (r << 16) | (g << 8) | b;
}

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Format a number for display
 * @param {number} value - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted string
 */
export function formatNumber(value, decimals = 4) {
    return value.toFixed(decimals);
}

/**
 * Format volume with π for exact values
 * @param {number} coefficient - Coefficient of π
 * @param {string} suffix - Optional suffix (like fractions)
 * @returns {string} Formatted string
 */
export function formatVolumeWithPi(coefficient, suffix = '') {
    if (coefficient === 1) return `π${suffix}`;
    if (coefficient === -1) return `-π${suffix}`;
    return `${coefficient}π${suffix}`;
}

/**
 * Create points for a 2D curve
 * @param {Function} fn - The function to plot
 * @param {number} a - Start of interval
 * @param {number} b - End of interval
 * @param {number} steps - Number of points
 * @returns {Array<{x: number, y: number}>} Array of points
 */
export function createCurvePoints(fn, a, b, steps = 100) {
    const points = [];
    const dx = (b - a) / steps;

    for (let i = 0; i <= steps; i++) {
        const x = a + i * dx;
        const y = fn(x);
        points.push({ x, y });
    }

    return points;
}
