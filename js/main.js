/**
 * Main application entry point
 * Coordinates all components for the Volumes of Revolution Visualizer
 */
import { SceneManager } from './scene.js';
import { DiskWasherVisualizer } from './disk-washer.js';
import { ShellVisualizer } from './shell.js';
import { ControlPanel } from './controls.js';
import { formatNumber } from './utils.js';

class VolumesApp {
    constructor() {
        this.sceneManager = null;
        this.diskWasherViz = null;
        this.shellViz = null;
        this.controls = null;

        this.currentVisualizer = null;
        this.currentExample = null;

        // DOM elements
        this.formulaEl = document.getElementById('formula');
        this.approxVolumeEl = document.getElementById('approx-volume');
        this.exactVolumeEl = document.getElementById('exact-volume');
        this.descriptionEl = document.getElementById('example-description');

        // Modal elements
        this.modalOverlay = document.getElementById('modal-overlay');
        this.modalContent = document.getElementById('modal-content');
        this.explainBtn = document.getElementById('explain-btn');
        this.modalClose = document.getElementById('modal-close');

        // Instructions toggle
        this.instructionsToggle = document.getElementById('instructions-toggle');
        this.instructionsContent = document.getElementById('instructions-content');

        // Info panel toggle
        this.infoToggle = document.getElementById('info-toggle');
        this.infoContent = document.getElementById('info-content');
        this.infoHeader = document.getElementById('info-header');

        this.init();
    }

    async init() {
        // Get canvas
        const canvas = document.getElementById('canvas');

        // Initialize scene
        this.sceneManager = new SceneManager(canvas);

        // Initialize visualizers
        this.diskWasherViz = new DiskWasherVisualizer(this.sceneManager);
        this.shellViz = new ShellVisualizer(this.sceneManager);

        // Initialize controls (pass this app instance)
        this.controls = new ControlPanel(this);

        // Set up modal events
        this.setupModalEvents();

        // Set up instructions toggle
        this.setupInstructionsToggle();

        // Start with first example
        this.updateVisualization(this.controls.getSettings());

        // Start animation loop
        this.sceneManager.animate(() => {
            // Any per-frame updates
        });
    }

    /**
     * Set up panel toggles
     */
    setupInstructionsToggle() {
        // Instructions panel toggle
        this.instructionsToggle.addEventListener('click', () => {
            const isCollapsed = this.instructionsContent.classList.toggle('collapsed');
            this.instructionsToggle.textContent = isCollapsed ? '+' : '−';
            this.instructionsToggle.title = isCollapsed ? 'Show instructions' : 'Hide instructions';
        });

        // Info panel toggle
        this.infoToggle.addEventListener('click', () => {
            const isCollapsed = this.infoContent.classList.toggle('collapsed');
            this.infoHeader.classList.toggle('collapsed-header', isCollapsed);
            this.infoToggle.textContent = isCollapsed ? '+' : '−';
            this.infoToggle.title = isCollapsed ? 'Show volume info' : 'Hide volume info';
        });
    }

    /**
     * Set up modal event listeners
     */
    setupModalEvents() {
        // Open modal
        this.explainBtn.addEventListener('click', () => {
            this.openModal();
        });

        // Close modal with X button
        this.modalClose.addEventListener('click', () => {
            this.closeModal();
        });

        // Close modal by clicking overlay
        this.modalOverlay.addEventListener('click', (e) => {
            if (e.target === this.modalOverlay) {
                this.closeModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.modalOverlay.classList.contains('hidden')) {
                this.closeModal();
            }
        });
    }

    /**
     * Open the explanation modal
     */
    openModal() {
        if (!this.currentExample || !this.currentExample.explanation) return;

        const explanation = this.currentExample.explanation;

        let stepsHTML = explanation.steps.map((step, index) => `
            <div class="step">
                <span class="step-number">${index + 1}</span>
                <strong>${step.title}</strong>
                <p>${step.content}</p>
            </div>
        `).join('');

        this.modalContent.innerHTML = `
            <h3>Method: ${explanation.method}</h3>
            <p>${explanation.overview}</p>

            <h3>The Big Idea: From Slices to Integral</h3>
            <div class="step">
                <p><strong>1. Approximate with finite slices:</strong> We divide the region into <span class="variable">n</span> pieces, each with thickness <span class="variable">Δx</span>.</p>
                <p><strong>2. Sum all volumes (Riemann Sum):</strong> V ≈ Σ (volume of each slice). This is what the visualization shows!</p>
                <p><strong>3. Take the limit:</strong> As <span class="variable">n → ∞</span> and <span class="variable">Δx → 0</span>, the sum becomes an integral:</p>
                <div class="formula-box">V = lim<sub>Δx→0</sub> Σ ΔV = ∫ dV</div>
                <p>The integral gives the <em>exact</em> volume. Try increasing the number of slices in the visualization to see the approximation improve!</p>
            </div>

            <h3>Key Formula</h3>
            <div class="formula-box">${explanation.keyFormula}</div>

            <h3>Step-by-Step Breakdown</h3>
            ${stepsHTML}

            <h3>Final Result</h3>
            <div class="formula-box">${this.currentExample.formula}</div>
            <p>
                <span class="highlight">Exact Volume:</span> ${this.currentExample.exactVolume} ≈ ${formatNumber(this.currentExample.exactValue)}
            </p>
        `;

        this.modalOverlay.classList.remove('hidden');
    }

    /**
     * Close the explanation modal
     */
    closeModal() {
        this.modalOverlay.classList.add('hidden');
    }

    /**
     * Update the visualization based on current settings
     * @param {Object} settings - Current settings from control panel
     */
    updateVisualization(settings) {
        const { example, method, numSlices, showSolid, showSlices, showDimensions, showRegion, showSampleSlice } = settings;

        if (!example) return;

        this.currentExample = example;
        this.currentMethod = method;

        const options = {
            numSlices,
            showSolid,
            showSlices,
            showDimensions,
            showRegion,
            showSampleSlice
        };

        let approxVolume = 0;

        // Clear previous visualization
        this.diskWasherViz.clear();
        this.shellViz.clear();

        // Create new visualization based on method
        if (method === 'disk') {
            approxVolume = this.diskWasherViz.createDiskVisualization(example, options);
            this.currentVisualizer = this.diskWasherViz;
        } else if (method === 'washer') {
            approxVolume = this.diskWasherViz.createWasherVisualization(example, options);
            this.currentVisualizer = this.diskWasherViz;
        } else if (method === 'shell') {
            approxVolume = this.shellViz.createShellVisualization(example, options);
            this.currentVisualizer = this.shellViz;
        }

        // Update info panel
        this.updateInfoPanel(example, approxVolume);
    }

    /**
     * Update the information panel
     */
    updateInfoPanel(example, approxVolume) {
        // Formula
        this.formulaEl.textContent = example.formula;

        // Approximate volume
        this.approxVolumeEl.textContent = formatNumber(approxVolume);

        // Exact volume
        this.exactVolumeEl.textContent = `${example.exactVolume} ≈ ${formatNumber(example.exactValue)}`;

        // Description
        this.descriptionEl.innerHTML = `
            <strong>${example.fnLatex}</strong><br>
            Interval: [${example.interval[0]}, ${formatNumber(example.interval[1], 2)}]<br>
            Axis: ${example.axisOfRotation}<br><br>
            ${example.description}
        `;
    }

    /**
     * Animate a single slice/shell
     * @param {number} index - Index of slice to show (-1 to hide all)
     */
    animateSlice(index) {
        if (this.currentVisualizer === this.diskWasherViz) {
            this.diskWasherViz.animateSlice(index);
        } else if (this.currentVisualizer === this.shellViz) {
            this.shellViz.animateShell(index);
        }
    }

    /**
     * Show all slices/shells
     */
    showAllSlices() {
        if (this.currentVisualizer === this.diskWasherViz) {
            this.diskWasherViz.showAllSlices();
        } else if (this.currentVisualizer === this.shellViz) {
            this.shellViz.showAllShells();
        }
    }

    /**
     * Animate the rectangle rotating to form a slice
     * @param {Function} onComplete - Callback when animation completes
     */
    animateRectangleRotation(onComplete) {
        if (this.currentVisualizer) {
            this.currentVisualizer.animateRectangleRotation(this.currentMethod, onComplete);
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new VolumesApp();
});
