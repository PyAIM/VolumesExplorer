/**
 * Three.js scene setup and management
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class SceneManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.axesGroup = null;
        this.gridHelper = null;
        this.rotationAxisLine = null;

        this.init();
    }

    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(6, 4, 8);
        this.camera.lookAt(0, 0, 0);

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Create orbit controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 2;
        this.controls.maxDistance = 50;

        // Add lighting
        this.setupLighting();

        // Add axes
        this.setupAxes();

        // Add grid
        this.setupGrid();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupLighting() {
        // Ambient light
        const ambient = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambient);

        // Directional light
        const directional = new THREE.DirectionalLight(0xffffff, 0.8);
        directional.position.set(5, 10, 7);
        this.scene.add(directional);

        // Secondary directional light for better visibility
        const directional2 = new THREE.DirectionalLight(0xffffff, 0.3);
        directional2.position.set(-5, -5, -5);
        this.scene.add(directional2);
    }

    setupAxes() {
        this.axesGroup = new THREE.Group();

        const axisLength = 6;
        const arrowSize = 0.15;

        // X-axis (red)
        const xMaterial = new THREE.LineBasicMaterial({ color: 0xff4444 });
        const xGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-axisLength, 0, 0),
            new THREE.Vector3(axisLength, 0, 0)
        ]);
        const xAxis = new THREE.Line(xGeometry, xMaterial);
        this.axesGroup.add(xAxis);

        // X arrow
        const xArrow = new THREE.ConeGeometry(arrowSize * 0.5, arrowSize * 2, 8);
        const xArrowMesh = new THREE.Mesh(xArrow, new THREE.MeshBasicMaterial({ color: 0xff4444 }));
        xArrowMesh.position.set(axisLength, 0, 0);
        xArrowMesh.rotation.z = -Math.PI / 2;
        this.axesGroup.add(xArrowMesh);

        // Y-axis (green)
        const yMaterial = new THREE.LineBasicMaterial({ color: 0x44ff44 });
        const yGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, -axisLength, 0),
            new THREE.Vector3(0, axisLength, 0)
        ]);
        const yAxis = new THREE.Line(yGeometry, yMaterial);
        this.axesGroup.add(yAxis);

        // Y arrow
        const yArrow = new THREE.ConeGeometry(arrowSize * 0.5, arrowSize * 2, 8);
        const yArrowMesh = new THREE.Mesh(yArrow, new THREE.MeshBasicMaterial({ color: 0x44ff44 }));
        yArrowMesh.position.set(0, axisLength, 0);
        this.axesGroup.add(yArrowMesh);

        // Z-axis (blue)
        const zMaterial = new THREE.LineBasicMaterial({ color: 0x4444ff });
        const zGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, -axisLength),
            new THREE.Vector3(0, 0, axisLength)
        ]);
        const zAxis = new THREE.Line(zGeometry, zMaterial);
        this.axesGroup.add(zAxis);

        // Z arrow
        const zArrow = new THREE.ConeGeometry(arrowSize * 0.5, arrowSize * 2, 8);
        const zArrowMesh = new THREE.Mesh(zArrow, new THREE.MeshBasicMaterial({ color: 0x4444ff }));
        zArrowMesh.position.set(0, 0, axisLength);
        zArrowMesh.rotation.x = Math.PI / 2;
        this.axesGroup.add(zArrowMesh);

        // Axis labels using sprites
        this.addAxisLabel('X', axisLength + 0.5, 0, 0, 0xff4444);
        this.addAxisLabel('Y', 0, axisLength + 0.5, 0, 0x44ff44);
        this.addAxisLabel('Z', 0, 0, axisLength + 0.5, 0x4444ff);

        this.scene.add(this.axesGroup);
    }

    addAxisLabel(text, x, y, z, color) {
        const canvas = document.createElement('canvas');
        const size = 128;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
        ctx.font = 'Bold 80px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, size / 2, size / 2);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.set(x, y, z);
        sprite.scale.set(0.5, 0.5, 0.5);

        this.axesGroup.add(sprite);
    }

    setupGrid() {
        // XZ plane grid
        this.gridHelper = new THREE.GridHelper(12, 12, 0x444444, 0x333333);
        this.gridHelper.position.y = 0;
        this.scene.add(this.gridHelper);
    }

    /**
     * Show the axis of rotation
     * @param {string} axisType - 'x-axis', 'y-axis', 'y = k', or 'x = k'
     * @param {number} offset - Offset value for parallel axes
     */
    showRotationAxis(axisType, offset = 0) {
        // Remove existing rotation axis line
        if (this.rotationAxisLine) {
            this.scene.remove(this.rotationAxisLine);
            this.rotationAxisLine.geometry.dispose();
            this.rotationAxisLine.material.dispose();
        }

        const axisLength = 8;
        const material = new THREE.LineDashedMaterial({
            color: 0xe94560,
            dashSize: 0.3,
            gapSize: 0.15,
            linewidth: 2
        });

        let points;

        if (axisType === 'x-axis' || axisType.startsWith('y =')) {
            // Horizontal axis (parallel to x-axis)
            points = [
                new THREE.Vector3(-axisLength, offset, 0),
                new THREE.Vector3(axisLength, offset, 0)
            ];
        } else if (axisType === 'y-axis' || axisType.startsWith('x =')) {
            // Vertical axis (parallel to y-axis)
            points = [
                new THREE.Vector3(offset, -axisLength, 0),
                new THREE.Vector3(offset, axisLength, 0)
            ];
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        this.rotationAxisLine = new THREE.Line(geometry, material);
        this.rotationAxisLine.computeLineDistances();
        this.scene.add(this.rotationAxisLine);
    }

    /**
     * Clear all visualization meshes
     */
    clearVisualization() {
        // Find and remove all meshes that are part of the visualization
        const toRemove = [];
        this.scene.traverse((obj) => {
            if (obj.userData && obj.userData.isVisualization) {
                toRemove.push(obj);
            }
        });

        toRemove.forEach((obj) => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(m => m.dispose());
                } else {
                    obj.material.dispose();
                }
            }
            this.scene.remove(obj);
        });
    }

    /**
     * Add an object to the scene as part of visualization
     * @param {THREE.Object3D} object - Object to add
     */
    addVisualizationObject(object) {
        object.userData.isVisualization = true;
        this.scene.add(object);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    update() {
        this.controls.update();
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Animation loop
     * @param {Function} callback - Function to call each frame
     */
    animate(callback) {
        const loop = () => {
            requestAnimationFrame(loop);
            if (callback) callback();
            this.update();
            this.render();
        };
        loop();
    }
}
