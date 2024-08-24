import { Target } from "../../../../simulation/entities/implementations/Target";

export class TargetSpawnedEvent {
    constructor(public target: Target) {}
}