// // VectorControl.ts
// import * as THREE from 'three';
// import { createRandomVector } from '../VectorControl/utils/VectorUtils';
// import { VectorControlRenderer } from './VectorControlRenderer';
// import { VectorControlEventHandler } from './VectorControlEventHandler';
// import { VectorControlManager } from '../VectorControl/VectorControlManager';

// export class VectorControl {
//     private manager = VectorControlManager.getInstance();
//     private vectors: THREE.Vector3[] = [];
//     private container: HTMLElement;
//     public readOnlyIndex: number | null;
//     private vectorType: 'shooter' | 'projectile' | 'target';
//     private renderer: VectorControlRenderer;
//     private vectorControlEventHandler: VectorControlEventHandler;
//     private randomRange: number = 1;

//     constructor(containerId: string, vectorType: 'shooter' | 'projectile' | 'target', private label: string, randomCount: number = 0, randomRange: number = 1, readOnlyIndex: number | null = null) {
//         const container = document.getElementById(containerId);
//         if (!container) {
//             throw new Error(`Container with id "${containerId}" not found.`);
//         }
//         this.container = container;
//         this.readOnlyIndex = readOnlyIndex;
//         this.vectorType = vectorType;
//         this.renderer = new VectorControlRenderer(this.container, this.label, this.vectors, this.vectorType, this.readOnlyIndex);
//         this.vectorControlEventHandler = new VectorControlEventHandler(this);
//         this.randomRange = randomRange;
//         this.initializeVectors(randomCount, randomRange);
//         this.render();
//         setTimeout(() => this.notifyVectorUpdate(), 0);
//     }

//     public getContainer(): HTMLElement {
//         return this.container;
//     }

//     private initializeVectors(count: number, randomRange: number): void {
//         for (let i = 0; i < count; i++) {
//             this.vectors.push(createRandomVector(-randomRange, randomRange));
//         }
//         if (this.readOnlyIndex !== null) {
//             this.makeReadOnly(this.readOnlyIndex);
//         }
//     }

//     public render(): void {
//         this.renderer.render();
//         this.vectorControlEventHandler.attachEventListeners();
//     }

//     addZeroVector(): void {
//         this.vectors.push(new THREE.Vector3(0, 0, 0));
//         this.notifyVectorUpdate();
//         this.render();
//     }

//     addRandomVector(): void {
//         this.vectors.push(createRandomVector(-1, 1));
//         this.notifyVectorUpdate();
//         this.render();
//     }

//     removeVector(index: number): void {
//         this.vectors.splice(index, 1);
//         this.notifyVectorUpdate();
//         this.render();
//     }

//     updateVector(index: number, component: 'x' | 'y' | 'z', value: number): void {
//         if (!Number.isNaN(value)) {
//             this.vectors[index][component] = value;
//             this.notifyVectorUpdate();
//         }
//         this.render();
//     }

//     clearAllVectors(): void {
//         this.vectors = this.vectors.map(() => new THREE.Vector3(0, 0, 0));
//         this.notifyVectorUpdate();
//         this.render();
//     }

//     randomizeAllVectors(): void {
//         this.vectors = this.vectors.map(() => createRandomVector(-this.randomRange, this.randomRange));
//         this.notifyVectorUpdate();
//         this.render();
//     }

//     private notifyVectorUpdate(): void {
//         this.manager.updateBackendValues();
//         if (this.vectorType === 'shooter'){
//             this.manager.synchronizeProjectilePosition();
//         }
//     }

//     makeReadOnly(index: number): void {
//         this.renderer.makeReadOnly(index);
//     }

//     hide(): void {
//         this.container.style.display = 'none';
//     }

//     show(): void {
//         this.container.style.display = 'block';
//     }

//     public getVectorValues(): THREE.Vector3[] {
//         return this.vectors;
//     }
// }