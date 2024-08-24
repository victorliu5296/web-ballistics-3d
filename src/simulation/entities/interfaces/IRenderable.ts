import * as THREE from 'three';

// IRenderable.ts
export interface IRenderable {
    mesh: THREE.Mesh;
    createMesh(): void;
    updateMesh(): void;
    addToScene(scene: THREE.Scene): void;
    removeFromScene(scene: THREE.Scene): void;
}