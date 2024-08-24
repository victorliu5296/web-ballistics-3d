import * as THREE from 'three';

export function createRandomVector(min: number = -1, max: number = 1): THREE.Vector3 {
    const randomX = Math.random() * (max - min) + min;
    const randomY = Math.random() * (max - min) + min;
    const randomZ = Math.random() * (max - min) + min;
    return new THREE.Vector3(randomX, randomY, randomZ);
}