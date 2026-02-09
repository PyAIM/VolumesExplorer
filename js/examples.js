/**
 * Preset examples for volumes of revolution
 */

export const examples = [
    // Example 1: Disk Method - y = √x around x-axis
    {
        id: 'disk-sqrt',
        name: '1. y = √x (Disk)',
        description: 'Rotate y = √x from x = 0 to x = 4 around the x-axis. This creates a paraboloid shape.',
        method: 'disk',
        fn: (x) => Math.sqrt(x),
        fnLatex: 'y = √x',
        interval: [0, 4],
        axisOfRotation: 'x-axis',
        axisOffset: 0,
        exactVolume: '8π',
        exactValue: 8 * Math.PI,
        formula: 'V = π∫₀⁴ (√x)² dx = π∫₀⁴ x dx = 8π',
        explanation: {
            method: 'Disk Method',
            overview: 'We rotate the curve y = √x around the x-axis. Each vertical slice perpendicular to the x-axis creates a circular disk.',
            steps: [
                {
                    title: 'Identify the radius',
                    content: 'At any point x, the radius of the disk is the distance from the x-axis to the curve. Since we rotate around y = 0, the radius is simply r(x) = √x'
                },
                {
                    title: 'Volume of one disk',
                    content: 'Each disk has area πr² = π(√x)² = πx. With thickness Δx, one disk has volume ΔV = πx · Δx'
                },
                {
                    title: 'Riemann Sum (approximate total volume)',
                    content: 'Divide [0,4] into n slices. The total volume is approximately: V ≈ Σᵢ π·xᵢ·Δx (sum of all disk volumes). This is what you see with the slices in the visualization!'
                },
                {
                    title: 'From Riemann Sum to Integral',
                    content: 'As n → ∞ and Δx → 0, the sum becomes exact: V = lim(n→∞) Σᵢ π·xᵢ·Δx = ∫₀⁴ πx dx. The integral is the limit of the Riemann sum.'
                },
                {
                    title: 'Evaluate the integral',
                    content: 'V = π∫₀⁴ x dx = π[x²/2]₀⁴ = π(16/2 - 0) = 8π'
                }
            ],
            keyFormula: 'V = lim(Δx→0) Σ π[f(xᵢ)]²Δx = π∫ₐᵇ [f(x)]² dx'
        }
    },

    // Example 2: Disk Method - y = sin(x) around x-axis
    {
        id: 'disk-sin',
        name: '2. y = sin(x) (Disk)',
        description: 'Rotate y = sin(x) from x = 0 to x = π around the x-axis. Creates a bulging symmetric solid.',
        method: 'disk',
        fn: (x) => Math.sin(x),
        fnLatex: 'y = sin(x)',
        interval: [0, Math.PI],
        axisOfRotation: 'x-axis',
        axisOffset: 0,
        exactVolume: 'π²/2',
        exactValue: (Math.PI * Math.PI) / 2,
        formula: 'V = π∫₀^π sin²(x) dx = π²/2',
        explanation: {
            method: 'Disk Method',
            overview: 'We rotate y = sin(x) around the x-axis. The curve starts at 0, rises to 1 at x = π/2, then returns to 0 at x = π, creating a football-like shape.',
            steps: [
                {
                    title: 'Identify the radius',
                    content: 'At each x, the radius is r(x) = sin(x), the height of the curve above the x-axis.'
                },
                {
                    title: 'Volume of one disk',
                    content: 'Each disk has volume ΔV = π[sin(x)]² · Δx = π·sin²(x)·Δx'
                },
                {
                    title: 'Riemann Sum',
                    content: 'Total volume ≈ Σᵢ π·sin²(xᵢ)·Δx. Each colored slice in the visualization represents one term in this sum.'
                },
                {
                    title: 'Limit to Integral',
                    content: 'As Δx → 0: V = lim(Δx→0) Σᵢ π·sin²(xᵢ)·Δx = π∫₀^π sin²(x) dx'
                },
                {
                    title: 'Evaluate (using trig identity)',
                    content: 'sin²(x) = (1-cos(2x))/2. So V = (π/2)∫₀^π (1-cos(2x))dx = (π/2)[x - sin(2x)/2]₀^π = π²/2'
                }
            ],
            keyFormula: 'V = lim(Δx→0) Σ π[f(xᵢ)]²Δx = π∫ₐᵇ [f(x)]² dx'
        }
    },

    // Example 3: Washer Method - between y = x and y = x²
    {
        id: 'washer-x-x2',
        name: '3. y = x and y = x² (Washer)',
        description: 'Region between y = x and y = x² from x = 0 to x = 1, rotated around x-axis. The curves intersect at (0,0) and (1,1).',
        method: 'washer',
        fn: (x) => x,
        fn2: (x) => x * x,
        fnLatex: 'y = x, y = x²',
        interval: [0, 1],
        axisOfRotation: 'x-axis',
        axisOffset: 0,
        exactVolume: '2π/15',
        exactValue: (2 * Math.PI) / 15,
        formula: 'V = π∫₀¹ (x² - x⁴) dx = 2π/15',
        explanation: {
            method: 'Washer Method',
            overview: 'We have a region bounded by two curves. When rotated, each slice is a washer (disk with a hole). The outer radius comes from y = x, the inner from y = x².',
            steps: [
                {
                    title: 'Identify outer and inner radii',
                    content: 'On [0,1], y = x is above y = x². Outer radius R(x) = x, Inner radius r(x) = x²'
                },
                {
                    title: 'Volume of one washer',
                    content: 'Each washer has volume ΔV = π(R² - r²)·Δx = π(x² - x⁴)·Δx. We subtract because the inner disk is hollow.'
                },
                {
                    title: 'Riemann Sum',
                    content: 'Total volume ≈ Σᵢ π(xᵢ² - xᵢ⁴)·Δx. The visualization shows these washers - notice each has an outer edge and inner hole!'
                },
                {
                    title: 'Limit to Integral',
                    content: 'As n→∞ and Δx→0: V = lim(Δx→0) Σᵢ π(xᵢ² - xᵢ⁴)Δx = π∫₀¹ (x² - x⁴) dx'
                },
                {
                    title: 'Evaluate',
                    content: 'V = π[x³/3 - x⁵/5]₀¹ = π(1/3 - 1/5) = π(2/15) = 2π/15'
                }
            ],
            keyFormula: 'V = lim(Δx→0) Σ π([R(xᵢ)]² - [r(xᵢ)]²)Δx = π∫ₐᵇ (R² - r²) dx'
        }
    },

    // Example 4: Washer Method - between y = 2 and y = x²
    {
        id: 'washer-2-x2',
        name: '4. y = 2 and y = x² (Washer)',
        description: 'Region between y = 2 and y = x² from x = 0 to x = √2, rotated around x-axis.',
        method: 'washer',
        fn: (x) => 2,
        fn2: (x) => x * x,
        fnLatex: 'y = 2, y = x²',
        interval: [0, Math.sqrt(2)],
        axisOfRotation: 'x-axis',
        axisOffset: 0,
        exactVolume: '8π√2/5',
        exactValue: (8 * Math.PI * Math.sqrt(2)) / 5,
        formula: 'V = π∫₀^√2 (4 - x⁴) dx = 8π√2/5',
        explanation: {
            method: 'Washer Method',
            overview: 'The region is bounded above by the horizontal line y = 2 and below by the parabola y = x². They intersect when x² = 2, so x = √2.',
            steps: [
                {
                    title: 'Identify the radii',
                    content: 'Outer radius R = 2 (constant), Inner radius r(x) = x² (varies with x)'
                },
                {
                    title: 'Volume of one washer',
                    content: 'ΔV = π(R² - r²)·Δx = π(4 - x⁴)·Δx'
                },
                {
                    title: 'Riemann Sum',
                    content: 'V ≈ Σᵢ π(4 - xᵢ⁴)·Δx. Each washer in the visualization has constant outer radius but varying inner radius.'
                },
                {
                    title: 'Limit to Integral',
                    content: 'V = lim(Δx→0) Σᵢ π(4 - xᵢ⁴)Δx = π∫₀^√2 (4 - x⁴) dx'
                },
                {
                    title: 'Evaluate',
                    content: 'V = π[4x - x⁵/5]₀^√2 = π[4√2 - (√2)⁵/5] = 8π√2/5'
                }
            ],
            keyFormula: 'V = lim(Δx→0) Σ π([R]² - [r(xᵢ)]²)Δx = π∫ₐᵇ (R² - r²) dx'
        }
    },

    // Example 5: Shell Method - y = x² around y-axis
    {
        id: 'shell-x2',
        name: '5. y = x² (Shell)',
        description: 'Rotate y = x² from x = 0 to x = 2 around the y-axis using cylindrical shells.',
        method: 'shell',
        fn: (x) => x * x,
        fnLatex: 'y = x²',
        interval: [0, 2],
        axisOfRotation: 'y-axis',
        axisOffset: 0,
        exactVolume: '8π',
        exactValue: 8 * Math.PI,
        formula: 'V = 2π∫₀² x · x² dx = 2π∫₀² x³ dx = 8π',
        explanation: {
            method: 'Shell Method',
            overview: 'Instead of slicing perpendicular to the axis, we use cylindrical shells parallel to the y-axis. Each shell is like a thin-walled cylinder.',
            steps: [
                {
                    title: 'Shell dimensions',
                    content: 'Radius r = x (distance from y-axis), Height h = x² (function value), Thickness = Δx'
                },
                {
                    title: 'Volume of one shell',
                    content: 'A cylindrical shell "unrolls" to a rectangular slab: length = 2πr (circumference), height = h, thickness = Δx. So ΔV = 2πr·h·Δx = 2πx·x²·Δx = 2πx³Δx'
                },
                {
                    title: 'Riemann Sum',
                    content: 'V ≈ Σᵢ 2πxᵢ³·Δx. Each colored shell in the visualization represents one term. Watch how shells nest inside each other!'
                },
                {
                    title: 'Limit to Integral',
                    content: 'As Δx→0: V = lim(Δx→0) Σᵢ 2πxᵢ³Δx = 2π∫₀² x³ dx'
                },
                {
                    title: 'Evaluate',
                    content: 'V = 2π[x⁴/4]₀² = 2π(16/4) = 8π'
                }
            ],
            keyFormula: 'V = lim(Δx→0) Σ 2πxᵢ·f(xᵢ)·Δx = 2π∫ₐᵇ x·f(x) dx'
        }
    },

    // Example 6: Shell Method - y = √x around y-axis
    {
        id: 'shell-sqrt',
        name: '6. y = √x (Shell)',
        description: 'Rotate y = √x from x = 0 to x = 4 around the y-axis using cylindrical shells.',
        method: 'shell',
        fn: (x) => Math.sqrt(x),
        fnLatex: 'y = √x',
        interval: [0, 4],
        axisOfRotation: 'y-axis',
        axisOffset: 0,
        exactVolume: '128π/5',
        exactValue: (128 * Math.PI) / 5,
        formula: 'V = 2π∫₀⁴ x · √x dx = 2π∫₀⁴ x^(3/2) dx = 128π/5',
        explanation: {
            method: 'Shell Method',
            overview: 'We rotate the region under y = √x around the y-axis. Each vertical strip at position x becomes a cylindrical shell.',
            steps: [
                {
                    title: 'Shell dimensions',
                    content: 'Radius r = x, Height h = √x, Thickness = Δx'
                },
                {
                    title: 'Volume of one shell',
                    content: 'Think of "unrolling" the shell: ΔV = (circumference)(height)(thickness) = 2πx·√x·Δx = 2πx^(3/2)·Δx'
                },
                {
                    title: 'Riemann Sum',
                    content: 'V ≈ Σᵢ 2π·xᵢ^(3/2)·Δx. The visualization shows these nested cylindrical shells - more slices = better approximation!'
                },
                {
                    title: 'Limit to Integral',
                    content: 'Taking the limit: V = lim(Δx→0) Σᵢ 2π·xᵢ^(3/2)·Δx = 2π∫₀⁴ x^(3/2) dx'
                },
                {
                    title: 'Evaluate',
                    content: 'V = 2π·[x^(5/2)/(5/2)]₀⁴ = 2π·(2/5)·32 = 128π/5'
                }
            ],
            keyFormula: 'V = lim(Δx→0) Σ 2πxᵢ·f(xᵢ)·Δx = 2π∫ₐᵇ x·f(x) dx'
        }
    },

    // Example 7: Disk with parallel axis - y = x² around y = -1
    {
        id: 'disk-parallel',
        name: '7. y = x² around y = -1 (Disk)',
        description: 'Rotate y = x² from x = 0 to x = 2 around the line y = -1. The radius is the distance from the curve to the axis.',
        method: 'disk',
        fn: (x) => x * x,
        fnLatex: 'y = x²',
        interval: [0, 2],
        axisOfRotation: 'y = -1',
        axisOffset: -1,
        exactVolume: '176π/15',
        exactValue: (176 * Math.PI) / 15,
        formula: 'V = π∫₀² (x² + 1)² dx = 176π/15',
        explanation: {
            method: 'Disk Method (Parallel Axis)',
            overview: 'When rotating around a line other than a coordinate axis, the radius is the distance from the curve to that line.',
            steps: [
                {
                    title: 'Find the radius',
                    content: 'The axis is y = -1. The curve is y = x². The radius is the distance: r(x) = x² - (-1) = x² + 1'
                },
                {
                    title: 'Volume of one disk',
                    content: 'ΔV = πr²·Δx = π(x² + 1)²·Δx. Notice the radius is measured from the axis y = -1, not from y = 0!'
                },
                {
                    title: 'Riemann Sum',
                    content: 'V ≈ Σᵢ π(xᵢ² + 1)²·Δx. Each disk is centered on the line y = -1, and you can see them in the visualization offset below the x-axis.'
                },
                {
                    title: 'Limit to Integral',
                    content: 'V = lim(Δx→0) Σᵢ π(xᵢ² + 1)²Δx = π∫₀² (x² + 1)² dx'
                },
                {
                    title: 'Expand and Evaluate',
                    content: '(x² + 1)² = x⁴ + 2x² + 1. V = π[x⁵/5 + 2x³/3 + x]₀² = π(32/5 + 16/3 + 2) = 176π/15'
                }
            ],
            keyFormula: 'V = lim(Δx→0) Σ π[f(xᵢ) - k]²Δx = π∫ₐᵇ [f(x) - k]² dx'
        }
    },

    // Example 8: Shell with parallel axis - y = √x around x = 1
    {
        id: 'shell-parallel',
        name: '8. y = √x around x = 1 (Shell)',
        description: 'Rotate y = √x from x = 1 to x = 4 around the line x = 1. Shell radius is distance from x to the axis.',
        method: 'shell',
        fn: (x) => Math.sqrt(x),
        fnLatex: 'y = √x',
        interval: [1, 4],
        axisOfRotation: 'x = 1',
        axisOffset: 1,
        exactVolume: '56π/5',
        exactValue: (56 * Math.PI) / 5,
        formula: 'V = 2π∫₁⁴ (x - 1) · √x dx = 56π/5',
        explanation: {
            method: 'Shell Method (Parallel Axis)',
            overview: 'When the axis of rotation is a vertical line x = k instead of the y-axis, the shell radius becomes the distance |x - k|.',
            steps: [
                {
                    title: 'Shell dimensions',
                    content: 'Radius r = x - 1 (distance from x to axis x = 1), Height h = √x, Thickness = Δx'
                },
                {
                    title: 'Volume of one shell',
                    content: 'ΔV = 2π(radius)(height)(thickness) = 2π(x - 1)·√x·Δx'
                },
                {
                    title: 'Riemann Sum',
                    content: 'V ≈ Σᵢ 2π(xᵢ - 1)·√xᵢ·Δx. Each shell is centered around x = 1, not x = 0. The first shell at x = 1 has radius 0!'
                },
                {
                    title: 'Limit to Integral',
                    content: 'V = lim(Δx→0) Σᵢ 2π(xᵢ - 1)√xᵢ·Δx = 2π∫₁⁴ (x - 1)√x dx'
                },
                {
                    title: 'Expand and Evaluate',
                    content: '(x-1)√x = x^(3/2) - x^(1/2). V = 2π[(2/5)x^(5/2) - (2/3)x^(3/2)]₁⁴ = 56π/5'
                }
            ],
            keyFormula: 'V = lim(Δx→0) Σ 2π|xᵢ - k|·f(xᵢ)·Δx = 2π∫ₐᵇ |x-k|·f(x) dx'
        }
    }
];

/**
 * Get example by ID
 * @param {string} id - Example ID
 * @returns {Object} Example object
 */
export function getExampleById(id) {
    return examples.find(ex => ex.id === id);
}

/**
 * Get example names for dropdown
 * @returns {Object} Object with id: name pairs
 */
export function getExampleNames() {
    const names = {};
    examples.forEach(ex => {
        names[ex.name] = ex.id;
    });
    return names;
}
