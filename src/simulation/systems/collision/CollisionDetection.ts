// CollisionDetection.ts
import * as THREE from 'three';
import { IMovable } from '../../entities/interfaces/IMovable';

export function checkCollision(obj1: IMovable, obj2: IMovable, buffer: number = 0): boolean {
    const squaredDistance = obj1.position.distanceToSquared(obj2.position);
    const collisionDistance = obj1.radius + obj2.radius + buffer;
    return squaredDistance <= (collisionDistance * collisionDistance);
}