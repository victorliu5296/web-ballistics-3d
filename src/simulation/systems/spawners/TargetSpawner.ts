import * as THREE from "three";
import { Target } from "../../entities/implementations/Target";
import { eventBus } from "../../../communication/EventBus";
import { SpawnTargetEvent } from "../../../communication/events/entities/spawning/SpawnTargetEvent";
import { TargetSpawnedEvent } from "../../../communication/events/entities/spawning/TargetSpawnedEvent";
import { updateScaledDisplacementDerivatives } from "../../utils/MovementUtils";
import { scaledDeltaSTDerivatives } from "../../components/MovementComponents";

// A functional approach to TargetSpawner
export function createTargetSpawner(scene: THREE.Scene) {
    function spawnTarget(event: SpawnTargetEvent) {
        const { targetDerivatives, shooterDerivatives, radius, height, radialSegments, expiryLifeTime, expiryDistance } = event;

        // Update the backend vectors
        updateScaledDisplacementDerivatives(targetDerivatives, shooterDerivatives);

        console.log("Spawning target with parameters:", {
            scaledShooterTargetDisplacementDerivatives: scaledDeltaSTDerivatives,
            radius,
            height,
            radialSegments,
            expiryLifeTime,
            expiryDistance
        });

        const target = new Target(scaledDeltaSTDerivatives, radius, height, radialSegments, expiryLifeTime, expiryDistance);
        target.addToScene(scene);
        eventBus.emit(TargetSpawnedEvent, new TargetSpawnedEvent(target));

        return target;
    }

    eventBus.subscribe(SpawnTargetEvent, spawnTarget);

    return {
        spawnTarget: (event: SpawnTargetEvent) => spawnTarget(event)
    };
}
