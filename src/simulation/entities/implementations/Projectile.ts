// Projectile.ts
import * as THREE from 'three';
import { BaseMovable } from './BaseMovable';
import { checkCollision } from '../../systems/collision/CollisionDetection';
import { eventBus } from '../../../communication/EventBus';
import { ProjectileExpiredEvent } from '../../../communication/events/entities/expiry/ProjectileExpiredEvent';
import { CollisionEvent } from '../../../communication/events/entities/CollisionEvent';
import { IMovable } from '../interfaces/IMovable';

export class Projectile extends BaseMovable {
    target: BaseMovable;

    constructor(scaledPositionDerivatives: THREE.Vector3[],
                target: BaseMovable,
                radius: number,
                expiryLifetime?: number,
                expiryDistance?: number,
            ) {
        let position = scaledPositionDerivatives[0].clone();
        super(position, radius, expiryLifetime, expiryDistance);
        this.scaledPositionDerivatives = scaledPositionDerivatives.map(vector => vector.clone());
        this.target = target;
        this.mesh = this.createMesh();
    }

    public getTarget(): IMovable {
        return this.target;
    }

    updatePosition(deltaTime: number): void {
        this.lifeTime += deltaTime;
        if (this.isExpired() && !this.expired) {
            eventBus.emit(ProjectileExpiredEvent, new ProjectileExpiredEvent(this));
            return;
        }
        this.position = this.evaluatePositionAt(this.lifeTime);
        this.updateMesh();
        if (!this.expired && checkCollision(this, this.target)) {
            console.log('Projectile collided with target:', this, this.target, 'at', this.position);
            eventBus.emit(CollisionEvent, new CollisionEvent(this, this.target));
            this.expired = true;
        }
    }

    public createMesh(): THREE.Mesh {
        const geometry = new THREE.SphereGeometry(this.radius);
        const material = new THREE.MeshPhongMaterial({ color: 0xFF0000 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(this.position);
        return mesh;
    }
}