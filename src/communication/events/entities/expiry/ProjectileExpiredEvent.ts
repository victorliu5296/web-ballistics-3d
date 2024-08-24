import { Projectile } from "../../../../simulation/entities/implementations/Projectile";

export class ProjectileExpiredEvent {
    constructor(
        public projectile: Projectile
    ) {}
}