import * as THREE from "three";
import { Projectile } from "../../../../simulation/entities/implementations/Projectile";

export class ProjectileSpawnedEvent {
    constructor(
        public readonly projectile: Projectile
    ) {}
}