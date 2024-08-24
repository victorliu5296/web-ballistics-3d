import * as THREE from 'three';
import { eventBus } from '../../../communication/EventBus';
import { ProjectileSpawnedEvent } from '../../../communication/events/entities/spawning/ProjectileSpawnedEvent';
import { Entity } from './Entity';

export class Shooter extends Entity {
    height: number;
    public mesh: THREE.Mesh;
    
    constructor(position: THREE.Vector3 = new THREE.Vector3(0, 0, 0), radius: number = 0.625, height: number = 2) {
        super(position, radius);
        this.height = height;
        this.mesh = this.createMesh();
        this.registerUpdate();
    }

    createMesh(): THREE.Mesh {
        const radialSegments = 32;
        const geometry = new THREE.CylinderGeometry(this.radius, this.radius, this.height, radialSegments);
        const DARK_GRAY = 0x555555;
        const material = new THREE.MeshPhongMaterial({ color: DARK_GRAY });
        const mesh = new THREE.Mesh(geometry, material);
        // Shift the geometry so the pivot point is at the base of the cylinder
        mesh.geometry.translate(0, this.height / 4, 0);
        mesh.position.copy(this.position);
        return mesh;
    }

    orientToProjectileVelocity(event: ProjectileSpawnedEvent): void {
        const direction = event.projectile.evaluatePositionAt(0.125).sub(this.position).normalize();

        // Assuming the cannon's "barrel" should point along the positive Y-axis of the mesh
        // Calculate the quaternion required to rotate the Z-axis to point in the direction
        let axis = new THREE.Vector3(0, 0, 1); // Mesh default front is Z-axis
        let quaternion = new THREE.Quaternion().setFromUnitVectors(axis, direction);
        this.mesh.quaternion.copy(quaternion);

        // Correct rotation to align "barrel" along positive Y-axis
        this.mesh.rotateX(Math.PI / 2);
    }
    
    registerUpdate() {
        eventBus.subscribe(ProjectileSpawnedEvent, this.orientToProjectileVelocity.bind(this));
    }
}