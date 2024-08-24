export class SpawnRandomTargetEvent {
    constructor(
        public readonly radius: number = 0.875,
        public readonly height: number = 0.25,
        public readonly radialSegments: number = 32, 
        public readonly expiryLifeTime: number = 20,
        public readonly expiryDistance: number = 1000, 
    ) {}
}