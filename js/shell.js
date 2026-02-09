/**
 * Shell method visualization
 */
import * as THREE from 'three';
import { gradientColor, shellRiemannSum } from './utils.js';

export class ShellVisualizer {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.shells = [];
        this.solid = null;
        this.curveLines = [];
        this.annotations = [];
        this.sampleSlice = null;
        this.sampleRectGroup = null;
        this.sampleData = null;
        this.regionFill = null; // 2D region being rotated
    }

    /**
     * Create shell method visualization
     * @param {Object} example - Example configuration
     * @param {Object} options - Visualization options
     */
    createShellVisualization(example, options) {
        this.clear();

        const { fn, interval, axisOffset } = example;
        const [a, b] = interval;
        const { numSlices, showSolid, showSlices, showDimensions, showRegion } = options;

        // Show the rotation axis
        this.sceneManager.showRotationAxis(example.axisOfRotation, axisOffset);

        // Create the 2D curve
        this.createCurve(fn, a, b, axisOffset);

        // Create the transparent region fill (2D area being rotated)
        if (showRegion) {
            this.createShellRegion(fn, a, b, axisOffset);
        }

        // Create the solid of revolution
        if (showSolid) {
            this.createSolid(fn, a, b, axisOffset);
        }

        // Create individual shells
        if (showSlices) {
            this.createShells(fn, a, b, numSlices, axisOffset);
        }

        // Create dimension annotations
        if (showDimensions) {
            this.createShellAnnotations(fn, a, b, numSlices, axisOffset, example);
        }

        // Create sample shell if enabled
        if (options.showSampleSlice) {
            this.createSampleShell(fn, a, b, numSlices, axisOffset);
        }

        // Calculate volume
        return shellRiemannSum(fn, a, b, numSlices, axisOffset);
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

        // Add vertical lines at the bounds
        const boundColor = 0xff6b6b;
        const leftBound = [
            new THREE.Vector3(a, 0, 0),
            new THREE.Vector3(a, fn(a), 0)
        ];
        const rightBound = [
            new THREE.Vector3(b, 0, 0),
            new THREE.Vector3(b, fn(b), 0)
        ];

        [leftBound, rightBound].forEach(pts => {
            const geo = new THREE.BufferGeometry().setFromPoints(pts);
            const mat = new THREE.LineBasicMaterial({ color: boundColor, opacity: 0.5, transparent: true });
            const line = new THREE.Line(geo, mat);
            line.userData.isVisualization = true;
            this.curveLines.push(line);
            this.sceneManager.scene.add(line);
        });
    }

    /**
     * Create a transparent 2D region fill for shell method (area under curve to x-axis)
     */
    createShellRegion(fn, a, b, axisOffset) {
        const shape = new THREE.Shape();
        const steps = 100;
        const dx = (b - a) / steps;

        // Start at bottom-left corner (on x-axis)
        shape.moveTo(a, 0);

        // Trace along the curve
        for (let i = 0; i <= steps; i++) {
            const x = a + i * dx;
            const y = fn(x);
            shape.lineTo(x, y);
        }

        // Close back to the x-axis
        shape.lineTo(b, 0);
        shape.closePath();

        const geometry = new THREE.ShapeGeometry(shape);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ff88,
            transparent: true,
            opacity: 0.25,
            side: THREE.DoubleSide
        });

        this.regionFill = new THREE.Mesh(geometry, material);
        this.regionFill.position.z = 0.005; // Slightly in front of grid
        this.regionFill.userData.isVisualization = true;
        this.sceneManager.scene.add(this.regionFill);
    }

    /**
     * Create a solid of revolution for shell method (around y-axis or x = k)
     */
    createSolid(fn, a, b, axisOffset) {
        const points = [];
        const steps = 50;
        const dx = (b - a) / steps;

        // For shell method rotating around y-axis (or x = k)
        // LatheGeometry rotates around Y-axis naturally
        // Profile: radius = distance from axis, height = function value

        // Start at the inner edge on the x-axis (y=0)
        const innerR = Math.abs(a - axisOffset);
        const outerR = Math.abs(b - axisOffset);

        points.push(new THREE.Vector2(innerR, 0));

        // Trace along the curve
        for (let i = 0; i <= steps; i++) {
            const x = a + i * dx;
            const y = fn(x);
            const r = Math.abs(x - axisOffset);
            points.push(new THREE.Vector2(r, y));
        }

        // Close back to the x-axis at outer edge
        points.push(new THREE.Vector2(outerR, 0));

        const geometry = new THREE.LatheGeometry(points, 64);

        // Translate to account for axis offset
        if (axisOffset !== 0) {
            geometry.translate(axisOffset, 0, 0);
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
     * Create individual cylindrical shells
     */
    createShells(fn, a, b, numSlices, axisOffset) {
        const dx = (b - a) / numSlices;

        for (let i = 0; i < numSlices; i++) {
            const x = a + (i + 0.5) * dx;
            const r = Math.abs(x - axisOffset);
            const h = Math.abs(fn(x));
            const thickness = dx * 0.8;

            // Create a hollow cylinder (shell)
            const outerR = r + thickness / 2;
            const innerR = Math.max(0.01, r - thickness / 2);

            // Create shell using lathe geometry
            const shell = this.createHollowCylinder(innerR, outerR, h);

            const t = i / (numSlices - 1 || 1);
            const color = gradientColor(t);

            const material = new THREE.MeshPhongMaterial({
                color: color,
                transparent: true,
                opacity: 0.7,
                side: THREE.DoubleSide
            });

            const shellMesh = new THREE.Mesh(shell, material);

            // Position the shell centered at the axis offset
            shellMesh.position.set(axisOffset, 0, 0);
            shellMesh.userData.isVisualization = true;

            this.shells.push(shellMesh);
            this.sceneManager.scene.add(shellMesh);

            // Add edge highlight
            const edges = new THREE.EdgesGeometry(shell);
            const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.5, transparent: true });
            const edgeLines = new THREE.LineSegments(edges, edgeMaterial);
            edgeLines.position.copy(shellMesh.position);
            edgeLines.userData.isVisualization = true;
            this.sceneManager.scene.add(edgeLines);
        }
    }

    /**
     * Create a hollow cylinder geometry using lathe
     */
    createHollowCylinder(innerRadius, outerRadius, height, segments = 32) {
        // Create points for the cross-section (a rectangle that will be revolved)
        const points = [
            new THREE.Vector2(innerRadius, 0),
            new THREE.Vector2(outerRadius, 0),
            new THREE.Vector2(outerRadius, height),
            new THREE.Vector2(innerRadius, height),
        ];

        const geometry = new THREE.LatheGeometry(points, segments);

        return geometry;
    }

    /**
     * Create dimension annotations for shell method
     */
    createShellAnnotations(fn, a, b, numSlices, axisOffset, example) {
        const dx = (b - a) / numSlices;
        // Use a shell near the middle for annotation
        const annotationIndex = Math.floor(numSlices / 2);
        const x = a + (annotationIndex + 0.5) * dx;
        const h = fn(x);
        const r = Math.abs(x - axisOffset);
        const halfDx = dx * 0.45;

        // Store annotation position for animation
        this.annotationX = x;
        this.annotationH = h;
        this.annotationHalfDx = halfDx;

        // Draw the representative rectangle that gets rotated into a shell
        const rectPoints = [
            new THREE.Vector3(x - halfDx, 0, 0.01),
            new THREE.Vector3(x + halfDx, 0, 0.01),
            new THREE.Vector3(x + halfDx, h, 0.01),
            new THREE.Vector3(x - halfDx, h, 0.01),
            new THREE.Vector3(x - halfDx, 0, 0.01),
        ];
        const rectGeom = new THREE.BufferGeometry().setFromPoints(rectPoints);
        const rectMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
        const rect = new THREE.Line(rectGeom, rectMat);
        rect.userData.isVisualization = true;
        this.sceneManager.scene.add(rect);
        this.annotations.push(rect);

        // Fill the rectangle
        const fillShape = new THREE.Shape();
        fillShape.moveTo(x - halfDx, 0);
        fillShape.lineTo(x + halfDx, 0);
        fillShape.lineTo(x + halfDx, h);
        fillShape.lineTo(x - halfDx, h);
        fillShape.closePath();
        const fillGeom = new THREE.ShapeGeometry(fillShape);
        const fillMat = new THREE.MeshBasicMaterial({
            color: 0x00ff88,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const fill = new THREE.Mesh(fillGeom, fillMat);
        fill.position.z = 0.01;
        fill.userData.isVisualization = true;
        this.sceneManager.scene.add(fill);
        this.annotations.push(fill);

        // Draw radius line from axis to rectangle center (horizontal, below the rectangle)
        const radiusLine = this.createArrowLine(
            new THREE.Vector3(axisOffset, -0.15, 0.02),
            new THREE.Vector3(x, -0.15, 0.02),
            0xffff00
        );
        this.annotations.push(radiusLine);

        // Radius label
        const rText = axisOffset !== 0 ? `r = x - ${axisOffset}` : 'r = x';
        const radiusLabel = this.createTextSprite(rText,
            new THREE.Vector3((axisOffset + x) / 2, -0.5, 0.1), 0xffff00);
        this.annotations.push(radiusLabel);

        // Draw height line (vertical, on the right side of rectangle)
        const heightLine = this.createArrowLine(
            new THREE.Vector3(x + halfDx + 0.1, 0, 0.02),
            new THREE.Vector3(x + halfDx + 0.1, h, 0.02),
            0x00ff88
        );
        this.annotations.push(heightLine);

        // Height label
        const heightLabel = this.createTextSprite(`h = ${example.fnLatex.split('=')[1].trim()}`,
            new THREE.Vector3(x + halfDx + 0.7, h / 2, 0.1), 0x00ff88);
        this.annotations.push(heightLabel);

        // Draw thickness indicator (Δx) - width of rectangle at top
        const dxLine = this.createArrowLine(
            new THREE.Vector3(x - halfDx, h + 0.15, 0.02),
            new THREE.Vector3(x + halfDx, h + 0.15, 0.02),
            0xff8800
        );
        this.annotations.push(dxLine);

        const dxLabel = this.createTextSprite('Δx', new THREE.Vector3(x, h + 0.4, 0.1), 0xff8800);
        this.annotations.push(dxLabel);

        // Store data for animation (needed even if sample slice isn't shown)
        this.sampleData = { x, h, r, dx, axisOffset, type: 'shell' };
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
        this.shells.forEach(shell => {
            if (shell.geometry) shell.geometry.dispose();
            if (shell.material) shell.material.dispose();
            this.sceneManager.scene.remove(shell);
        });
        this.shells = [];

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

        // Clear region fill
        if (this.regionFill) {
            this.regionFill.geometry.dispose();
            this.regionFill.material.dispose();
            this.sceneManager.scene.remove(this.regionFill);
            this.regionFill = null;
        }

        // Clear all visualization objects
        this.sceneManager.clearVisualization();
    }

    /**
     * Animate shells appearing one by one
     * @param {number} index - Current shell index to show
     */
    animateShell(index) {
        this.shells.forEach((shell, i) => {
            shell.visible = i <= index;
        });
    }

    /**
     * Show all shells
     */
    showAllShells() {
        this.shells.forEach(shell => {
            shell.visible = true;
        });
    }

    /**
     * Create a sample shell at the annotation position
     */
    createSampleShell(fn, a, b, numSlices, axisOffset) {
        const dx = (b - a) / numSlices;
        const annotationIndex = Math.floor(numSlices / 2);
        const x = a + (annotationIndex + 0.5) * dx;
        const h = fn(x);
        const r = Math.abs(x - axisOffset);
        const thickness = dx * 0.8;

        const outerR = r + thickness / 2;
        const innerR = Math.max(0.01, r - thickness / 2);

        const points = [
            new THREE.Vector2(innerR, 0),
            new THREE.Vector2(outerR, 0),
            new THREE.Vector2(outerR, h),
            new THREE.Vector2(innerR, h),
        ];

        const geometry = new THREE.LatheGeometry(points, 32);

        const material = new THREE.MeshPhongMaterial({
            color: 0xffaa00,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });

        this.sampleSlice = new THREE.Mesh(geometry, material);
        this.sampleSlice.position.set(axisOffset, 0, 0);
        this.sampleSlice.userData.isVisualization = true;
        this.sceneManager.scene.add(this.sampleSlice);

        // Store data for animation
        this.sampleData = { x, h, r, dx, axisOffset, type: 'shell' };
    }

    /**
     * Animate the rectangle rotating to form the shell
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

        // Position group at the axis of rotation (y-axis or line x = axisOffset)
        group.position.set(axisOffset, 0, 0);
        // Offset the rectangle so its geometry (which has world coordinates baked in)
        // ends up in the correct position relative to the group
        animRect.position.set(-axisOffset, 0, 0.01);

        this.sceneManager.scene.add(group);
        this.sampleRectGroup = group;

        // Animate rotation around Y axis
        const duration = 1500;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            group.rotation.y = eased * Math.PI * 2;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Animation complete
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
