/**
 * lil-gui controls setup
 */
import { examples, getExampleById, getExampleNames } from './examples.js';

export class ControlPanel {
    constructor(app) {
        this.app = app;
        this.gui = null;
        this.animationInterval = null;

        this.settings = {
            example: examples[0].id,
            method: 'disk',
            numSlices: 10,
            showSolid: false,
            showSlices: false,
            showDimensions: true,
            showSampleSlice: false,
            animating: false,
            animationSpeed: 500
        };

        // For rotation animation
        this.rotationAnimating = false;

        this.init();
    }

    init() {
        // Check if lil-gui is available
        if (typeof lil === 'undefined') {
            console.error('lil-gui not loaded');
            return;
        }

        this.gui = new lil.GUI({ title: 'Volume Controls' });

        // Example selector
        const exampleNames = getExampleNames();
        this.gui.add(this.settings, 'example', exampleNames)
            .name('Example')
            .onChange((value) => this.onExampleChange(value));

        // Method selector (will be updated based on example)
        this.methodController = this.gui.add(this.settings, 'method', ['disk', 'washer', 'shell'])
            .name('Method')
            .onChange(() => this.onSettingsChange());

        // Slices folder
        const slicesFolder = this.gui.addFolder('Visualization');

        slicesFolder.add(this.settings, 'numSlices', 1, 50, 1)
            .name('Number of Slices')
            .onChange(() => this.onSettingsChange());

        slicesFolder.add(this.settings, 'showSolid')
            .name('Show Solid')
            .onChange(() => this.onSettingsChange());

        slicesFolder.add(this.settings, 'showSlices')
            .name('Show Slices')
            .onChange(() => this.onSettingsChange());

        slicesFolder.add(this.settings, 'showDimensions')
            .name('Show Dimensions')
            .onChange(() => this.onSettingsChange());

        // Sample slice folder
        const sampleFolder = this.gui.addFolder('Sample Slice Demo');

        sampleFolder.add(this.settings, 'showSampleSlice')
            .name('Show Sample Slice')
            .onChange(() => this.onSettingsChange());

        const rotateBtn = {
            animateRotation: () => this.triggerRotationAnimation()
        };
        sampleFolder.add(rotateBtn, 'animateRotation').name('Animate Rotation');

        // Animation folder
        const animFolder = this.gui.addFolder('Animation');
        animFolder.domElement.classList.add('animation-folder');

        this.playController = animFolder.add(this.settings, 'animating')
            .name('Play Animation')
            .onChange((value) => this.toggleAnimation(value));

        animFolder.add(this.settings, 'animationSpeed', 100, 1000, 50)
            .name('Speed (ms)')
            .onChange(() => {
                if (this.settings.animating) {
                    this.stopAnimation();
                    this.startAnimation();
                }
            });

        // Initialize with first example
        this.updateMethodOptions(examples[0]);
    }

    /**
     * Handle example change
     */
    onExampleChange(exampleId) {
        const example = getExampleById(exampleId);
        if (!example) return;

        this.updateMethodOptions(example);
        this.settings.method = example.method;

        // Update method controller
        this.methodController.setValue(example.method);

        this.onSettingsChange();
    }

    /**
     * Update available methods based on example
     */
    updateMethodOptions(example) {
        // All examples have a preferred method, but we can allow switching
        // between compatible methods

        // For simplicity, we'll keep the method fixed to what the example specifies
        // since disk/washer vs shell require different handling
    }

    /**
     * Handle any settings change
     */
    onSettingsChange() {
        // Stop any running animation
        if (this.settings.animating) {
            this.settings.animating = false;
            this.playController.updateDisplay();
            this.stopAnimation();
        }

        // Notify app to update visualization
        if (this.app && this.app.updateVisualization) {
            this.app.updateVisualization(this.getSettings());
        }
    }

    /**
     * Toggle animation
     */
    toggleAnimation(play) {
        if (play) {
            this.startAnimation();
        } else {
            this.stopAnimation();
        }
    }

    /**
     * Start slice animation
     */
    startAnimation() {
        let currentIndex = 0;
        const maxIndex = this.settings.numSlices;

        // Hide all slices first
        if (this.app && this.app.animateSlice) {
            this.app.animateSlice(-1);
        }

        this.animationInterval = setInterval(() => {
            if (currentIndex < maxIndex) {
                if (this.app && this.app.animateSlice) {
                    this.app.animateSlice(currentIndex);
                }
                currentIndex++;
            } else {
                // Animation complete, stop
                this.stopAnimation();
                this.settings.animating = false;
                this.playController.updateDisplay();
            }
        }, this.settings.animationSpeed);
    }

    /**
     * Stop animation
     */
    stopAnimation() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }

        // Show all slices
        if (this.app && this.app.showAllSlices) {
            this.app.showAllSlices();
        }
    }

    /**
     * Get current settings
     */
    getSettings() {
        const example = getExampleById(this.settings.example);
        return {
            example: example,
            method: this.settings.method,
            numSlices: this.settings.numSlices,
            showSolid: this.settings.showSolid,
            showSlices: this.settings.showSlices,
            showDimensions: this.settings.showDimensions,
            showSampleSlice: this.settings.showSampleSlice
        };
    }

    /**
     * Trigger the rotation animation
     */
    triggerRotationAnimation() {
        if (this.rotationAnimating) return;

        if (this.app && this.app.animateRectangleRotation) {
            this.rotationAnimating = true;
            this.app.animateRectangleRotation(() => {
                this.rotationAnimating = false;
                // After animation, show the sample slice
                this.settings.showSampleSlice = true;
                this.onSettingsChange();
            });
        }
    }

    /**
     * Destroy the GUI
     */
    destroy() {
        this.stopAnimation();
        if (this.gui) {
            this.gui.destroy();
        }
    }
}
