import * as THREE from 'three';
import { BaseMovable } from './BaseMovable';
import { eventBus } from '../../../communication/EventBus';
import { TargetExpiredEvent } from '../../../communication/events/entities/expiry/TargetExpiredEvent';

export class Target extends BaseMovable {
    height: number;
    radialSegments: number;

    constructor(
        scaledPositionDerivatives: THREE.Vector3[],
        radius: number = 0.875, 
        height: number = 0.25, 
        radialSegments: number = 32, 
        expiryLifeTime: number = 20, 
        expiryDistance: number = 1000, 
            ) {
        let position = scaledPositionDerivatives[0].clone();
        super(position, radius, expiryLifeTime, expiryDistance);
        this.scaledPositionDerivatives = scaledPositionDerivatives.map(vector => vector.clone());
        this.height = height;
        this.radialSegments = radialSegments;
        this.mesh = this.createMesh();
        this.orientTowardsShooterAtOrigin();
    }

    updatePosition(deltaTime: number): void {
        this.lifeTime += deltaTime;
        this.position = this.evaluatePositionAt(this.lifeTime);
        this.updateMesh();

        if (this.isExpired() && !this.expired) {
            eventBus.emit(TargetExpiredEvent, new TargetExpiredEvent(this));
            return;
        }

        this.orientTowardsShooterAtOrigin();
    }

    private orientTowardsShooterAtOrigin(): void {
        if (!this.mesh) { return; }
        const direction = this.position.clone().negate();
        this.mesh.lookAt(direction);
    }

    public createMesh(): THREE.Mesh {
        const geometry = new THREE.CylinderGeometry(this.radius, this.radius, this.height, this.radialSegments);
        geometry.rotateX(Math.PI / 2); // Orient the cylinder to stand upright
        const material = new THREE.MeshPhongMaterial({ color: 0xFFFFFF });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(this.position);
        return mesh;
    }
}