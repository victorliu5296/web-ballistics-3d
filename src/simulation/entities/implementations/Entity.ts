import * as THREE from 'three';
import { IRenderable } from '../interfaces/IRenderable';
import { eventBus } from '../../../communication/EventBus';
export abstract class Entity implements IRenderable {
    public mesh!: THREE.Mesh;
    position: THREE.Vector3;
    readonly radius: number;
    private scene: THREE.Scene | null = null;

    constructor(position: THREE.Vector3, radius: number) {
        this.position = position;
        this.radius = radius;
        // Initialize scaled position derivatives in inherited classes
        // Initialize mesh in inherited classes
    }

    abstract createMesh(): void;

    updateMesh(): void {
        if (!this.scene) return;
        this.mesh.position.copy(this.position);
    }

    addToScene(scene: THREE.Scene): void {
        if (this.scene) {
            this.removeFromScene();
        }
        this.scene = scene;
        this.scene.add(this.mesh);
    }

    removeFromScene(): void {
        if (this.scene) {
            this.scene.remove(this.mesh);
            this.scene = null;

            // Dispose of geometry
            this.mesh.geometry.dispose();

            // Dispose of material(s)
            if (Array.isArray(this.mesh.material)) {
                this.mesh.material.forEach(material => material.dispose());
            } else {
                this.mesh.material.dispose();
            }

            // Remove references to the mesh
            this.mesh = null as any;
            
        }
    }
    
    public dispose(): void {
        this.removeFromScene();

        // Remove all event listeners associated with this entity
        eventBus.removeAllListeners(this);
        console.log('Entity disposed:', this);
    }
}