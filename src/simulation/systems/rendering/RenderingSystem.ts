import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { IRenderable } from '../../entities/interfaces/IRenderable';

export class RenderingSystem {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private controls!: OrbitControls;
    private entities: IRenderable[] = [];

    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;

        const sceneContainer = document.getElementById('scene-container');
        if (sceneContainer) {
            sceneContainer.appendChild(this.renderer.domElement);
        } else {
            console.error('Unable to find the scene container element!');
            return; // Stop initialization if container is not found
        }

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.initializeScene();
    }

    private initializeScene(): void {
        this.scene.background = new THREE.Color('skyblue');

        // Lighting
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 5, 5);
        light.castShadow = true;
        this.scene.add(light);
        this.scene.add(new THREE.AmbientLight(0x404040)); // Soft ambient light
        
        // Camera
        const cameraDistance = 5;
        const cameraZoom = 0.2;

        this.camera.position.z = cameraDistance;
        this.camera.zoom = cameraZoom;
    }

    public animate(): void {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    public getScene(): THREE.Scene {
        return this.scene;
    }

    public getCamera(): THREE.PerspectiveCamera {
        return this.camera;
    }

    public addEntity(entity: IRenderable): void {
        this.entities.push(entity);
    }

    public removeEntity(entity: IRenderable): void {
        const index = this.entities.indexOf(entity);
        if (index !== -1) {
            this.entities.splice(index, 1);
        }
    }

    public resizeRenderer(): void {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

export function getRenderingSystem(): RenderingSystem {
    return new RenderingSystem();
}