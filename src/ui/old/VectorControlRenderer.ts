// // VectorControlRenderer.ts
// import * as THREE from 'three';
// import { HelpButton } from '../VectorControl/helpButtons/HelpButton';
// import { VectorElement } from '../VectorControl/VectorElement';
// import { VectorControlManager } from '../VectorControl/VectorControlManager';

// export class VectorControlRenderer {
//     private manager = VectorControlManager.getInstance();

//     constructor(
//         private container: HTMLElement,
//         private label: string,
//         private vectors: THREE.Vector3[],
//         private vectorType: 'shooter' | 'projectile' | 'target',
//         private readOnlyIndex: number | null,
//     ) {}

//     public render(): void {
//         this.container.innerHTML = `
//             <h3>${this.label} Position Derivatives</h3>
//         `;
//         this.renderProjectileControls();
//         this.renderTopButtons();
//         if (this.vectorType === 'projectile') {
//             setTimeout(() => this.syncProjectileVectors(), 0); // Ensure synchronization happens before rendering vectors
//         }
//         this.renderVectorsList();
//         this.renderBottomButtons();
//     }

//     private syncProjectileVectors(): void {
//         const shooterVectors = this.manager.getAllVectorValues().shooter;
//         if (shooterVectors && shooterVectors.length > 0) {
//             this.vectors[0] = shooterVectors[0].clone();  // Ensure the first vector is copied
//         }
//     }

//     private renderProjectileControls(): void {
//         if (this.vectorType !== 'projectile') return;  // This already exists to exit early if not 'projectile'

//         const indexToMinimizeContainer = document.createElement('div');
//         indexToMinimizeContainer.innerHTML = `
//             <label for="index-to-minimize">Index to minimize:</label>
//             <input type="number" id="index-to-minimize" min="0" value="1">
//         `;
//         // Help button added only if the vectorType is 'projectile'
//         new HelpButton(indexToMinimizeContainer, 'The index of the vector (order of the derivative) whose magnitude is the objective function to minimize.');

//         const fallbackIntersectionTimeContainer = document.createElement('div');
//         fallbackIntersectionTimeContainer.innerHTML = `
//             <label for="fallback-intersection-time">Fallback intersection time (seconds):</label>
//             <input type="number" id="fallback-intersection-time" min="0" value="5">
//         `;
//         // Help button added only if the vectorType is 'projectile'
//         new HelpButton(fallbackIntersectionTimeContainer, 'Sometimes, there are no solutions to minimize the norm of the initial movement vector. For example, if the target only moves away from the shooter, it will attempt to fire towards infinity; because if it\'s 0.0001% faster than the target, it will eventually reach it, but this is obviously unreasonable in practice.'
//             + '\n\n'
//             + 'The fallback intersection time parameter, in seconds, is used in these cases. Instead of minimizing the vector magnitude, it will simply calculate the require initial value to make the projectile hit the target after this amount of time has passed since the firing of the projectile.'
//         );

//         this.container.appendChild(indexToMinimizeContainer);
//         this.container.appendChild(fallbackIntersectionTimeContainer);

//         this.makeReadOnly(0);
//     }

//     private renderTopButtons(): void {
//         const clearAllButton = this.createButton('Clear All Vectors', () => this.clearAllVectors());
//         const randomizeAllButton = this.createButton('Randomize All Vectors', () => this.randomizeAllVectors());

//         this.container.appendChild(clearAllButton);
//         this.container.appendChild(randomizeAllButton);
//     }

//     private renderBottomButtons(): void {
//         const addZeroButton = this.createButton('Add Zero Vector', () => this.addZeroVector());
//         const addRandomButton = this.createButton('Add Random Vector', () => this.addRandomVector());

//         this.container.appendChild(addZeroButton);
//         this.container.appendChild(addRandomButton);
//     }

//     private createButton(label: string, onClick: () => void): HTMLButtonElement {
//         const button = document.createElement('button');
//         button.textContent = label;
//         button.onclick = onClick;
//         return button;
//     }

//     private renderVectorsList(): void {
//         const vectorsList = document.createElement('div');

//         this.vectors.forEach((vector, index) => {
//             const readOnly = this.vectorType === 'projectile' && index === this.readOnlyIndex;
//             const removeDisabled = this.readOnlyIndex !== null && index < this.readOnlyIndex || index === 0;

//             new VectorElement(
//                 vectorsList,
//                 this.vectorType,
//                 vector,
//                 index,
//                 readOnly,
//                 removeDisabled,
//                 this.removeVector.bind(this),
//                 this.updateVector.bind(this),
//             );
//         });

//         this.container.appendChild(vectorsList);
//     }

//     makeReadOnly(index: number): void {
//         const vectorElements = this.container.getElementsByClassName('vector-controls');
//         if (vectorElements[index]) {
//             const inputs = vectorElements[index].getElementsByTagName('input');
//             for (let input of inputs) {
//                 input.readOnly = true;
//             }
//             const buttons = vectorElements[index].getElementsByTagName('button');
//             for (let button of buttons) {
//                 button.disabled = true;
//             }
//         }
//     }

//     private clearAllVectors(): void {
//         this.vectors.forEach((_, index) => {
//             this.vectors[index].set(0, 0, 0);
//         });
//         this.render();
//     }

//     private randomizeAllVectors(): void {
//         this.vectors.forEach((_, index) => {
//             this.setRandomVectors(this.vectors[index]);
//         });
//         this.render();
//     }

//     private setRandomVectors(vector: THREE.Vector3): void {
//         const randomX = Math.random() * 2 - 1;
//         const randomY = Math.random() * 2 - 1;
//         const randomZ = Math.random() * 2 - 1;
//         vector.set(randomX, randomY, randomZ);
//     }

//     private addZeroVector(): void {
//         this.vectors.push(new THREE.Vector3(0, 0, 0));
//         this.render();
//         this.manager.updateBackendValues();
//     }

//     private addRandomVector(): void {
//         const newVector = new THREE.Vector3();
//         this.setRandomVectors(newVector);
//         this.vectors.push(newVector);
//         this.render();
//         this.manager.updateBackendValues();
//     }

//     private removeVector(index: number): void {
//         this.vectors.splice(index, 1);
//         this.render();
//         this.manager.updateBackendValues();
//     }

//     private updateVector(index: number, component: 'x' | 'y' | 'z', value: number): void {
//         if (!Number.isNaN(value)) {
//             this.vectors[index][component] = value;
//             this.manager.updateBackendValues();
//         }
//         this.render();
//     }
// }