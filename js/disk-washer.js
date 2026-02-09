/**
 * Disk and Washer method visualization
 */
import * as THREE from 'three';
import { gradientColor, diskRiemannSum, washerRiemannSum } from './utils.js';

export class DiskWasherVisualizer {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.slices = [];
        this.solid = null;
        this.curveLines = [];
        this.annotations = [];
        this.sampleSlice = null;
        this.sampleRectGroup = null;
        this.sampleData = null; // Store data for animation
    }

    /**
     * Create disk method visualization
     * @param {Object} example - Example configuration
     * @param {Object} options - Visualization options
     */
    createDiskVisualization(example, options) {
        this.clear();

        const { fn, interval, axisOffset } = example;
        const [a, b] = interval;
        const { numSlices, showSolid, showSlices, showDimensions } = options;

        // Show the rotation axis
        this.sceneManager.showRotationAxis(example.axisOfRotation, axisOffset);

        // Create the 2D curve
        this.createCurve(fn, a, b, axisOffset);

        // Create the solid of revolution
        if (showSolid) {
            this.createSolid(fn, a, b, axisOffset);
        }

        // Create individual slices
        if (showSlices) {
            this.createDiskSlices(fn, a, b, numSlices, axisOffset);
        }

        // Create dimension annotations
        if (showDimensions) {
            this.createDiskAnnotations(fn, a, b, numSlices, axisOffset, example);
        }

        // Create sample slice if enabled
        if (options.showSampleSlice) {
            this.createSampleDisk(fn, a, b, numSlices, axisOffset);
        }

        // Calculate volume
        return diskRiemannSum(fn, a, b, numSlices, axisOffset);
    }

    /**
     * Create washer method visualization
     * @param {Object} example - Example configuration
     * @param {Object} options - Visualization options
     */
    createWasherVisualization(example, options) {
        this.clear();

        const { fn, fn2, interval, axisOffset } = example;
        const [a, b] = interval;
        const { numSlices, showSolid, showSlices, showDimensions } = options;

        // Show the rotation axis
        this.sceneManager.showRotationAxis(example.axisOfRotation, axisOffset);

        // Create both curves
        this.createCurve(fn, a, b, axisOffset, 0x00d9ff);
        this.createCurve(fn2, a, b, axisOffset, 0x00ff88);

        // Create the solid
        if (showSolid) {
            this.createWasherSolid(fn, fn2, a, b, axisOffset);
        }

        // Create individual slices (washers)
        if (showSlices) {
            this.createWasherSlices(fn, fn2, a, b, numSlices, axisOffset);
        }

        // Create dimension annotations
        if (showDimensions) {
            this.createWasherAnnotations(fn, fn2, a, b, numSlices, axisOffset, example);
        }

        // Create sample slice if enabled
        if (options.showSampleSlice) {
            this.createSampleWasher(fn, fn2, a, b, numSlices, axisOffset);
        }

        // Calculate volume
        return washerRiemannSum(fn, fn2, a, b, numSlices, axisOffset);
    }

    /**
     * Create a 2D curve in the xy-plane
     */
    createCurve(fn, a, b, axisOffset, color = 0x00d9ff) {
        const points = [];
        const steps = 100;
        const dx = (b - a) / steps;

        for (let i = 0; i <= steps; i++) {
            const x = a + i * dx;
            const y = fn(x);
            points.push(new THREE.Vector3(x, y, 0));
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color, linewidth: 2 });
        const curve = new THREE.Line(geometry, material);
        curve.userData.isVisualization = true;

        this.curveLines.push(curve);
        this.sceneManager.scene.add(curve);
    }

    /**
     * Create a solid of revolution using LatheGeometry
     */
    createSolid(fn, a, b, axisOffset) {
        const points = [];
        const steps = 50;
        const dx = (b - a) / steps;

        // Build profile from left to right along the curve
        // LatheGeometry rotates around Y-axis, so y coordinate = position along axis
        for (let i = 0; i <= steps; i++) {
            const x = a + i * dx;
            const r = Math.abs(fn(x) - axisOffset);
            points.push(new THREE.Vector2(r, x));
        }

        // Close the shape at the axis (r=0)
        points.push(new THREE.Vector2(0, b));
        points.unshift(new THREE.Vector2(0, a));

        const geometry = new THREE.LatheGeometry(points, 64);

        // LatheGeometry creates solid around Y-axis
        // Rotate to align with X-axis: first rotate Z, then flip with X rotation
        geometry.rotateZ(-Math.PI / 2);
        geometry.rotateX(Math.PI);

        // Translate for axis offset
        if (axisOffset !== 0) {
            geometry.translate(0, axisOffset, 0);
        }

        const material = new THREE.MeshPhongMaterial({
            color: 0x0f3460,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide,
            shininess: 30
        });

        this.solid = new THREE.Mesh(geometry, material);
        this.solid.userData.isVisualization = true;
        this.sceneManager.scene.add(this.solid);

        // Add wireframe
        const wireframe = new THREE.WireframeGeometry(geometry);
        const wireMaterial = new THREE.LineBasicMaterial({ color: 0x00d9ff, opacity: 0.3, transparent: true });
        const wire = new THREE.LineSegments(wireframe, wireMaterial);
        wire.userData.isVisualization = true;
        this.sceneManager.scene.add(wire);
    }

    /**
     * Create washer solid (region between two curves)
     */
    createWasherSolid(fn1, fn2, a, b, axisOffset) {
        // Create outer solid
        this.createSolid(fn1, a, b, axisOffset);

        // Create inner cutout (we'll use a different approach - show only outer with transparency)
        const innerPoints = [];
        const steps = 50;
        const dx = (b - a) / steps;

        for (let i = 0; i <= steps; i++) {
            const x = a + i * dx;
            const r = Math.abs(fn2(x) - axisOffset);
            innerPoints.push(new THREE.Vector2(r, x));
        }

        innerPoints.unshift(new THREE.Vector2(0, a));
        innerPoints.push(new THREE.Vector2(0, b));

        const innerGeometry = new THREE.LatheGeometry(innerPoints, 64);
        innerGeometry.rotateZ(Math.PI / 2);

        if (axisOffset !== 0) {
            innerGeometry.translate(0, axisOffset, 0);
        }

        const innerMaterial = new THREE.MeshPhongMaterial({
            color: 0x1a1a2e,
            side: THREE.DoubleSide,
            shininess: 30
        });

        const innerSolid = new THREE.Mesh(innerGeometry, innerMaterial);
        innerSolid.userData.isVisualization = true;
        this.sceneManager.scene.add(innerSolid);
    }

    /**
     * Create individual disk slices
     */
    createDiskSlices(fn, a, b, numSlices, axisOffset) {
        const dx = (b - a) / numSlices;

        for (let i = 0; i < numSlices; i++) {
            const x = a + (i + 0.5) * dx; // Midpoint
            const r = Math.abs(fn(x) - axisOffset);

            // Create cylinder for disk
            const geometry = new THREE.CylinderGeometry(r, r, dx * 0.9, 32);
            geometry.rotateZ(Math.PI / 2);

            const t = i / (numSlices - 1 || 1);
            const color = gradientColor(t);

            const material = new THREE.MeshPhongMaterial({
                color: color,
                transparent: true,
                opacity: 0.7,
                side: THREE.DoubleSide
            });

            const disk = new THREE.Mesh(geometry, material);
            disk.position.set(x, axisOffset, 0);
            disk.userData.isVisualization = true;

            this.slices.push(disk);
            this.sceneManager.scene.add(disk);

            // Add edge highlight
            const edges = new THREE.EdgesGeometry(geometry);
            const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.5, transparent: true });
            const edgeLines = new THREE.LineSegments(edges, edgeMaterial);
            edgeLines.position.copy(disk.position);
            edgeLines.userData.isVisualization = true;
            this.sceneManager.scene.add(edgeLines);
        }
    }

    /**
     * Create individual washer slices
     */
    createWasherSlices(fn1, fn2, a, b, numSlices, axisOffset) {
        const dx = (b - a) / numSlices;

        for (let i = 0; i < numSlices; i++) {
            const x = a + (i + 0.5) * dx;
            const r1 = Math.abs(fn1(x) - axisOffset);
            const r2 = Math.abs(fn2(x) - axisOffset);
            const outerR = Math.max(r1, r2);
            const innerR = Math.min(r1, r2);
            const thickness = dx * 0.9;

            // Create washer using lathe geometry with a rectangular profile
            const points = [
                new THREE.Vector2(innerR, -thickness / 2),
                new THREE.Vector2(outerR, -thickness / 2),
                new THREE.Vector2(outerR, thickness / 2),
                new THREE.Vector2(innerR, thickness / 2),
            ];

            const geometry = new THREE.LatheGeometry(points, 32);
            geometry.rotateZ(Math.PI / 2);

            const t = i / (numSlices - 1 || 1);
            const color = gradientColor(t);

            const material = new THREE.MeshPhongMaterial({
                color: color,
                transparent: true,
                opacity: 0.7,
                side: THREE.DoubleSide
            });

            const washer = new THREE.Mesh(geometry, material);
            washer.position.set(x, axisOffset, 0);
            washer.userData.isVisualization = true;

            this.slices.push(washer);
            this.sceneManager.scene.add(washer);

            // Add edge highlight
            const edges = new THREE.EdgesGeometry(geometry);
            const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.5, transparent: true });
            const edgeLines = new THREE.LineSegments(edges, edgeMaterial);
            edgeLines.position.copy(washer.position);
            edgeLines.userData.isVisualization = true;
            this.sceneManager.scene.add(edgeLines);
        }
    }

    /**
     * Create dimension annotations for disk method
     */
    createDiskAnnotations(fn, a, b, numSlices, axisOffset, example) {
        const dx = (b - a) / numSlices;
        // Use a slice near the middle for annotation
        const annotationIndex = Math.floor(numSlices / 2);
        const x = a + (annotationIndex + 0.5) * dx;
        const y = fn(x);
        const r = Math.abs(y - axisOffset);
        const halfDx = dx * 0.45;

        // Draw the representative rectangle that gets rotated
        const rectPoints = [
            new THREE.Vector3(x - halfDx, axisOffset, 0.01),
            new THREE.Vector3(x + halfDx, axisOffset, 0.01),
            new THREE.Vector3(x + halfDx, y, 0.01),
            new THREE.Vector3(x - halfDx, y, 0.01),
            new THREE.Vector3(x - halfDx, axisOffset, 0.01), // Close the rectangle
        ];
        const rectGeom = new THREE.BufferGeometry().setFromPoints(rectPoints);
        const rectMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
        const rect = new THREE.Line(rectGeom, rectMat);
        rect.userData.isVisualization = true;
        this.sceneManager.scene.add(rect);
        this.annotations.push(rect);

        // Fill the rectangle with semi-transparent material
        const fillShape = new THREE.Shape();
        fillShape.moveTo(x - halfDx, axisOffset);
        fillShape.lineTo(x + halfDx, axisOffset);
        fillShape.lineTo(x + halfDx, y);
        fillShape.lineTo(x - halfDx, y);
        fillShape.closePath();
        const fillGeom = new THREE.ShapeGeometry(fillShape);
        const fillMat = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const fill = new THREE.Mesh(fillGeom, fillMat);
        fill.position.z = 0.01;
        fill.userData.isVisualization = true;
        this.sceneManager.scene.add(fill);
        this.annotations.push(fill);

        // Draw radius line (height of rectangle) on the right edge
        const radiusLine = this.createArrowLine(
            new THREE.Vector3(x + halfDx + 0.1, axisOffset, 0.02),
            new THREE.Vector3(x + halfDx + 0.1, y, 0.02),
            0xffff00
        );
        this.annotations.push(radiusLine);

        // Radius label
        const radiusLabel = this.createTextSprite(`r = ${example.fnLatex.split('=')[1].trim()}`,
            new THREE.Vector3(x + halfDx + 0.6, (axisOffset + y) / 2, 0.1), 0xffff00);
        this.annotations.push(radiusLabel);

        // Draw thickness indicator (Δx) - width of rectangle at top
        const dxLine = this.createArrowLine(
            new THREE.Vector3(x - halfDx, y + 0.15, 0.02),
            new THREE.Vector3(x + halfDx, y + 0.15, 0.02),
            0xff8800
        );
        this.annotations.push(dxLine);

        const dxLabel = this.createTextSprite('Δx', new THREE.Vector3(x, y + 0.4, 0.1), 0xff8800);
        this.annotations.push(dxLabel);

    }

    /**
     * Create dimension annotations for washer method
     */
    createWasherAnnotations(fn, fn2, a, b, numSlices, axisOffset, example) {
        const dx = (b - a) / numSlices;
        const annotationIndex = Math.floor(numSlices / 2);
        const x = a + (annotationIndex + 0.5) * dx;
        const y1 = fn(x);
        const y2 = fn2(x);
        const outerY = Math.max(y1, y2);
        const innerY = Math.min(y1, y2);
        const halfDx = dx * 0.45;

        // Draw the representative rectangle (the region between curves)
        const rectPoints = [
            new THREE.Vector3(x - halfDx, innerY, 0.01),
            new THREE.Vector3(x + halfDx, innerY, 0.01),
            new THREE.Vector3(x + halfDx, outerY, 0.01),
            new THREE.Vector3(x - halfDx, outerY, 0.01),
            new THREE.Vector3(x - halfDx, innerY, 0.01),
        ];
        const rectGeom = new THREE.BufferGeometry().setFromPoints(rectPoints);
        const rectMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
        const rect = new THREE.Line(rectGeom, rectMat);
        rect.userData.isVisualization = true;
        this.sceneManager.scene.add(rect);
        this.annotations.push(rect);

        // Fill the rectangle
        const fillShape = new THREE.Shape();
        fillShape.moveTo(x - halfDx, innerY);
        fillShape.lineTo(x + halfDx, innerY);
        fillShape.lineTo(x + halfDx, outerY);
        fillShape.lineTo(x - halfDx, outerY);
        fillShape.closePath();
        const fillGeom = new THREE.ShapeGeometry(fillShape);
        const fillMat = new THREE.MeshBasicMaterial({
            color: 0x00ffaa,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const fill = new THREE.Mesh(fillGeom, fillMat);
        fill.position.z = 0.01;
        fill.userData.isVisualization = true;
        this.sceneManager.scene.add(fill);
        this.annotations.push(fill);

        // Outer radius line (R) - from axis to outer edge
        const outerLine = this.createArrowLine(
            new THREE.Vector3(x + halfDx + 0.1, axisOffset, 0.02),
            new THREE.Vector3(x + halfDx + 0.1, outerY, 0.02),
            0xffff00
        );
        this.annotations.push(outerLine);

        const outerLabel = this.createTextSprite('R (outer)',
            new THREE.Vector3(x + halfDx + 0.7, (axisOffset + outerY) / 2, 0.1), 0xffff00);
        this.annotations.push(outerLabel);

        // Inner radius line (r) - from axis to inner edge
        const innerLine = this.createArrowLine(
            new THREE.Vector3(x + halfDx + 0.25, axisOffset, 0.02),
            new THREE.Vector3(x + halfDx + 0.25, innerY, 0.02),
            0x00ffff
        );
        this.annotations.push(innerLine);

        const innerLabel = this.createTextSprite('r (inner)',
            new THREE.Vector3(x + halfDx + 0.85, (axisOffset + innerY) / 2, 0.1), 0x00ffff);
        this.annotations.push(innerLabel);

        // Thickness Δx - width of rectangle
        const dxLine = this.createArrowLine(
            new THREE.Vector3(x - halfDx, outerY + 0.15, 0.02),
            new THREE.Vector3(x + halfDx, outerY + 0.15, 0.02),
            0xff8800
        );
        this.annotations.push(dxLine);

        const dxLabel = this.createTextSprite('Δx', new THREE.Vector3(x, outerY + 0.4, 0.1), 0xff8800);
        this.annotations.push(dxLabel);

    }

    /**
     * Create an arrow line between two points
     */
    createArrowLine(start, end, color) {
        const direction = new THREE.Vector3().subVectors(end, start);
        const length = direction.length();

        // Main line
        const lineGeom = new THREE.BufferGeometry().setFromPoints([start, end]);
        const lineMat = new THREE.LineBasicMaterial({ color, linewidth: 2 });
        const line = new THREE.Line(lineGeom, lineMat);
        line.userData.isVisualization = true;
        this.sceneManager.scene.add(line);

        // Arrowhead at end
        const arrowSize = Math.min(0.15, length * 0.2);
        const arrowGeom = new THREE.ConeGeometry(arrowSize * 0.5, arrowSize, 8);
        const arrowMat = new THREE.MeshBasicMaterial({ color });
        const arrow = new THREE.Mesh(arrowGeom, arrowMat);

        arrow.position.copy(end);
        direction.normalize();
        arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
        arrow.userData.isVisualization = true;
        this.sceneManager.scene.add(arrow);

        return { line, arrow };
    }

    /**
     * Create a text sprite for labels
     */
    createTextSprite(text, position, color = 0xffffff) {
        const canvas = document.createElement('canvas');
        const size = 256;
        canvas.width = size;
        canvas.height = size / 2;
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.roundRect(0, 0, canvas.width, canvas.height, 10);
        ctx.fill();

        // Text
        const hexColor = '#' + color.toString(16).padStart(6, '0');
        ctx.fillStyle = hexColor;
        ctx.font = 'Bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.position.copy(position);
        sprite.scale.set(1.2, 0.6, 1);
        sprite.userData.isVisualization = true;
        this.sceneManager.scene.add(sprite);

        return sprite;
    }

    /**
     * Clear all visualizations
     */
    clear() {
        this.slices.forEach(slice => {
            if (slice.geometry) slice.geometry.dispose();
            if (slice.material) slice.material.dispose();
            this.sceneManager.scene.remove(slice);
        });
        this.slices = [];

        if (this.solid) {
            if (this.solid.geometry) this.solid.geometry.dispose();
            if (this.solid.material) this.solid.material.dispose();
            this.sceneManager.scene.remove(this.solid);
            this.solid = null;
        }

        this.curveLines.forEach(line => {
            if (line.geometry) line.geometry.dispose();
            if (line.material) line.material.dispose();
            this.sceneManager.scene.remove(line);
        });
        this.curveLines = [];

        // Clear annotations
        this.annotations.forEach(annotation => {
            if (annotation.line) {
                annotation.line.geometry.dispose();
                annotation.line.material.dispose();
                this.sceneManager.scene.remove(annotation.line);
            }
            if (annotation.arrow) {
                annotation.arrow.geometry.dispose();
                annotation.arrow.material.dispose();
                this.sceneManager.scene.remove(annotation.arrow);
            }
            if (annotation.geometry) {
                annotation.geometry.dispose();
                this.sceneManager.scene.remove(annotation);
            }
            if (annotation.material) {
                annotation.material.dispose();
                this.sceneManager.scene.remove(annotation);
            }
        });
        this.annotations = [];

        // Clear sample slice
        if (this.sampleSlice) {
            this.sampleSlice.geometry.dispose();
            this.sampleSlice.material.dispose();
            this.sceneManager.scene.remove(this.sampleSlice);
            this.sampleSlice = null;
        }
        this.sampleData = null;

        // Clear all visualization objects
        this.sceneManager.clearVisualization();
    }

    /**
     * Animate slices appearing one by one
     * @param {number} index - Current slice index to show
     */
    animateSlice(index) {
        this.slices.forEach((slice, i) => {
            slice.visible = i <= index;
        });
    }

    /**
     * Show all slices
     */
    showAllSlices() {
        this.slices.forEach(slice => {
            slice.visible = true;
        });
    }

    /**
     * Create a sample disk at the annotation position
     */
    createSampleDisk(fn, a, b, numSlices, axisOffset) {
        const dx = (b - a) / numSlices;
        const annotationIndex = Math.floor(numSlices / 2);
        const x = a + (annotationIndex + 0.5) * dx;
        const r = Math.abs(fn(x) - axisOffset);

        const geometry = new THREE.CylinderGeometry(r, r, dx * 0.9, 32);
        geometry.rotateZ(Math.PI / 2);

        const material = new THREE.MeshPhongMaterial({
            color: 0xffaa00,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });

        this.sampleSlice = new THREE.Mesh(geometry, material);
        this.sampleSlice.position.set(x, axisOffset, 0);
        this.sampleSlice.userData.isVisualization = true;
        this.sceneManager.scene.add(this.sampleSlice);

        // Store data for potential animation
        this.sampleData = { x, r, dx, axisOffset, type: 'disk' };
    }

    /**
     * Create a sample washer at the annotation position
     */
    createSampleWasher(fn, fn2, a, b, numSlices, axisOffset) {
        const dx = (b - a) / numSlices;
        const annotationIndex = Math.floor(numSlices / 2);
        const x = a + (annotationIndex + 0.5) * dx;
        const y1 = fn(x);
        const y2 = fn2(x);
        const outerR = Math.max(Math.abs(y1 - axisOffset), Math.abs(y2 - axisOffset));
        const innerR = Math.min(Math.abs(y1 - axisOffset), Math.abs(y2 - axisOffset));
        const thickness = dx * 0.9;

        const points = [
            new THREE.Vector2(innerR, -thickness / 2),
            new THREE.Vector2(outerR, -thickness / 2),
            new THREE.Vector2(outerR, thickness / 2),
            new THREE.Vector2(innerR, thickness / 2),
        ];

        const geometry = new THREE.LatheGeometry(points, 32);
        geometry.rotateZ(Math.PI / 2);

        const material = new THREE.MeshPhongMaterial({
            color: 0xffaa00,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });

        this.sampleSlice = new THREE.Mesh(geometry, material);
        this.sampleSlice.position.set(x, axisOffset, 0);
        this.sampleSlice.userData.isVisualization = true;
        this.sceneManager.scene.add(this.sampleSlice);

        // Store data for animation
        this.sampleData = { x, outerR, innerR, dx, axisOffset, type: 'washer' };
    }

    /**
     * Animate the rectangle rotating to form the slice
     */
    animateRectangleRotation(method, onComplete) {
        // Find the filled rectangle in annotations
        let rectFill = null;
        for (const ann of this.annotations) {
            if (ann.isMesh && ann.material && ann.material.opacity === 0.3) {
                rectFill = ann;
                break;
            }
        }

        if (!rectFill || !this.sampleData) {
            // Just create the sample slice without animation
            if (onComplete) onComplete();
            return;
        }

        // Create a group for the rotation animation
        const group = new THREE.Group();
        const { x, axisOffset } = this.sampleData;

        // Clone the rectangle fill for animation
        const animRect = rectFill.clone();
        animRect.material = rectFill.material.clone();
        animRect.material.opacity = 0.6;
        group.add(animRect);

        // Position group at the axis of rotation
        group.position.set(x, axisOffset, 0);
        animRect.position.set(0, -axisOffset, 0);

        this.sceneManager.scene.add(group);
        this.sampleRectGroup = group;

        // Animate rotation
        const duration = 1500;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            group.rotation.x = eased * Math.PI * 2;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Animation complete - remove the animated rectangle
                this.sceneManager.scene.remove(group);
                animRect.geometry.dispose();
                animRect.material.dispose();
                this.sampleRectGroup = null;

                if (onComplete) onComplete();
            }
        };

        animate();
    }
}
