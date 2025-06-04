import * as THREE from "three";
import { Target } from "../../entities/implementations/Target";
import { eventBus } from "../../../communication/EventBus";
import { SpawnRandomTargetEvent } from "../../../communication/events/entities/spawning/SpawnRandomTargetEvent";
import { TargetSpawnedEvent } from "../../../communication/events/entities/spawning/TargetSpawnedEvent";
import { computeFactorial } from "../../utils/MovementUtils";
import { createRandomVector } from "../../../ui/VectorControl/utils/VectorUtils";

// A functional approach to TargetSpawner
export function createRandomTargetSpawner(scene: THREE.Scene, randomRange = 1, minDistance = 1) {
    function spawnRandomTarget(event: SpawnRandomTargetEvent) {
        // Logs to confirm event data
        console.log("Spawning target with parameters:", event);

        const { radius, height, radialSegments, expiryLifeTime, expiryDistance } = event;

        if (minDistance > randomRange) {
            console.warn("minDistance should be less than or equal to the randomRange.");
            minDistance = randomRange;
        }

        const minDistanceSquared = minDistance * minDistance;
        const targetInitialPositionDerivatives = [];

        for (let i = 0; i < 5; i++) {
            let positionDerivative;
            let attempts = 0;
            do {
                positionDerivative = createRandomVector(-randomRange, randomRange);
                attempts++;
            } while (positionDerivative.lengthSq() < minDistanceSquared && attempts < 2);

            if (positionDerivative.lengthSq() < minDistanceSquared) {
                positionDerivative.set(
                    Math.random() < 0.5 ? -minDistance : minDistance,
                    Math.random() < 0.5 ? -minDistance : minDistance,
                    Math.random() < 0.5 ? -minDistance : minDistance
                );
            }

            // Divide the vector components by i! (i factorial)
            const factorial = computeFactorial(i);
            positionDerivative.divideScalar(factorial);

            targetInitialPositionDerivatives.push(positionDerivative);
        }

        const target = new Target(targetInitialPositionDerivatives, radius, height, radialSegments, expiryLifeTime, expiryDistance);
        target.addToScene(scene);
        eventBus.emit(TargetSpawnedEvent, new TargetSpawnedEvent(target));

        return target;
    }

    eventBus.subscribe(SpawnRandomTargetEvent, (event: SpawnRandomTargetEvent) => spawnRandomTarget(event));

    return {
        spawnRandomTarget: (event: SpawnRandomTargetEvent) => spawnRandomTarget(event)
    };
}