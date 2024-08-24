// import * as THREE from 'three';
// import { createRandomVector } from './VectorUtils';

// export static class VectorManipulation {
//     public static updateVector(vectors: THREE.Vector3[], index: number, component: 'x' | 'y' | 'z', value: number): void {
//         if (index >= 0 && index < vectors.length) {
//             vectors[index][component] = value;
//         }
//     }
    
//     public static addZeroVector(vectors: THREE.Vector3[]): void {
//         vectors.push(new THREE.Vector3(0, 0, 0));
//     }

//     public static addRandomVector(vectors: THREE.Vector3[], randomRange: number = 1): void {
//         vectors.push(createRandomVector(-randomRange, randomRange));
//     }

//     public static removeVector(vectors: THREE.Vector3[], index: number): void {
//         if (index >= 0 && index < vectors.length) {
//             vectors.splice(index, 1);
//         }
//     }

//     public static clearAllVectors(vectors: THREE.Vector3[]): void {
//         vectors.forEach(vector => vector.set(0, 0, 0));
//     }

//     public static randomizeAllVectors(vectors: THREE.Vector3[]): void {
//         vectors.forEach(vector => {
//             const randomVector = createRandomVector();
//             vector.copy(randomVector);
//         });
//     }
// }
