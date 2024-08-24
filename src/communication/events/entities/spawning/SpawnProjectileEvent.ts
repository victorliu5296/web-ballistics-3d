import * as THREE from 'three';
import { BaseMovable } from '../../../../simulation/entities/implementations/BaseMovable';

export class SpawnProjectileEvent {
    constructor(
        public readonly targetDerivatives: THREE.Vector3[],
        public readonly shooterDerivatives: THREE.Vector3[],
        public readonly projectileDerivatives: THREE.Vector3[],
        public readonly indexToMinimize: number,
        public readonly fallbackIntersectionTime: number,
        public readonly target: BaseMovable,
        public readonly radius: number = 0.625,
        public readonly expiryLifeTime: number = 20,
        public readonly expiryDistance: number = 1000,
    ) {}
}