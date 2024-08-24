import * as THREE from 'three';

export interface IMovable {
    position: THREE.Vector3;
    lifeTime: number;
    readonly radius: number;
    updatePosition(deltaTime: number): void;
    readonly expiryLifeTime: number;
    readonly expiryDistance: number;
    isExpired(): boolean;
}