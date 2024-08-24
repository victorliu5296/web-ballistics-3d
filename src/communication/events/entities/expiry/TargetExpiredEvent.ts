import { Target } from "../../../../simulation/entities/implementations/Target";

export class TargetExpiredEvent {
    constructor(
        public target: Target
    ) {}
}