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
            showRegion: true,
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

        // Method is determined by example, no dropdown needed

        // Slices folder
        const slicesFolder = this.gui.addFolder('Visualization');

        slicesFolder.add(this.settings, 'numSlices', 1, 50, 1)
            .name('Number of Slices')
            .onChange(() => this.onSettingsChange());

        this.showSolidController = slicesFolder.add(this.settings, 'showSolid')
            .name('Show Solid')
            .onChange(() => this.onSettingsChange());

        this.showSlicesController = slicesFolder.add(this.settings, 'showSlices')
            .name('Show Slices')
            .onChange(() => this.onSettingsChange());

        this.showDimensionsController = slicesFolder.add(this.settings, 'showDimensions')
            .name('Show Dimensions')
            .onChange(() => this.onSettingsChange());

        this.showRegionController = slicesFolder.add(this.settings, 'showRegion')
            .name('Show Region')
            .onChange(() => this.onSettingsChange());

        // Sample slice folder
        const sampleFolder = this.gui.addFolder('Sample Slice Demo');

        this.showSampleSliceController = sampleFolder.add(this.settings, 'showSampleSlice')
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
    }

    /**
     * Handle example change
     */
    onExampleChange(exampleId) {
        const example = getExampleById(exampleId);
        if (!example) return;

        // Set method from example (method is locked to example)
        this.settings.method = example.method;

        this.onSettingsChange();
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
        // Enable slices for animation if not already shown
        if (!this.settings.showSlices) {
            this.settings.showSlices = true;
            this.showSlicesController.updateDisplay();
            // Rebuild visualization with slices
            if (this.app && this.app.updateVisualization) {
                this.app.updateVisualization(this.getSettings());
            }
        }

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

        // Show all slices since showSlices is now true
        if (this.settings.showSlices && this.app && this.app.showAllSlices) {
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
            showRegion: this.settings.showRegion,
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
                // Update the controller display to reflect the new state
                if (this.showSampleSliceController) {
                    this.showSampleSliceController.updateDisplay();
                }
                this.onSettingsChange();
            });
        }
    }

    /**
     * Update all controller displays to match current settings
     */
    updateAllDisplays() {
        if (this.showSolidController) this.showSolidController.updateDisplay();
        if (this.showSlicesController) this.showSlicesController.updateDisplay();
        if (this.showDimensionsController) this.showDimensionsController.updateDisplay();
        if (this.showRegionController) this.showRegionController.updateDisplay();
        if (this.showSampleSliceController) this.showSampleSliceController.updateDisplay();
        if (this.playController) this.playController.updateDisplay();
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
