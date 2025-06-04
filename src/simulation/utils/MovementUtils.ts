// MovementUtils.ts
import * as THREE from 'three';
import { scaledDeltaSTDerivatives, scaledDeltaSPDerivatives } from '../components/MovementComponents';

/**
 * Computes the displacement derivatives between from the first entity (tail) to the second entity (tip).
 * ABdisplacement[i] = B[i] - A[i]
 *
 * @param {THREE.Vector3[]} tipPositionDerivatives - The first entity's position derivatives.
 * @param {THREE.Vector3[]} tailPositionDerivatives - The second entity's position derivatives.
 * @return {THREE.Vector3[]} The computed displacement derivatives = tip - tail.
 */
export function computeDisplacementDerivatives(
    tailPositionDerivatives: THREE.Vector3[],
    tipPositionDerivatives: THREE.Vector3[]
): THREE.Vector3[] {
    const minLength = Math.min(tipPositionDerivatives.length, tailPositionDerivatives.length);
    const maxLength = Math.max(tipPositionDerivatives.length, tailPositionDerivatives.length);
    const displacementDerivatives: THREE.Vector3[] = new Array(maxLength).fill(null).map(() => new THREE.Vector3(0, 0, 0));

    for (let i = 0; i < minLength; i++) {
        if (tipPositionDerivatives[i] && tailPositionDerivatives[i]) {
            displacementDerivatives[i].copy(tipPositionDerivatives[i]).sub(tailPositionDerivatives[i]);
        } else {
            console.error(`Undefined vector found at index: ${i}, `
                        + `tail:, ${JSON.stringify(tipPositionDerivatives[i])}, `
                        + `tip: ${JSON.stringify(tailPositionDerivatives[i])}, `
                        + `tailPositionDerivatives: ${JSON.stringify(tipPositionDerivatives)}, `
                        + `tipPositionDerivatives: ${JSON.stringify(tailPositionDerivatives)}`
                    );
        }
    }

    for (let i = minLength; i < maxLength; i++) {
        if (i < tipPositionDerivatives.length && tipPositionDerivatives[i]) {
            displacementDerivatives[i].copy(tipPositionDerivatives[i]);
        } else if (i < tailPositionDerivatives.length && tailPositionDerivatives[i]) {
            displacementDerivatives[i].copy(tailPositionDerivatives[i]).negate();
        } else {
            console.error('Undefined vector found at index', i);
        }
    }

    return displacementDerivatives;
}

/**
 * Computes the scaled position derivatives by dividing each derivative by its corresponding factorial.
 *
 * @param {THREE.Vector3[]} derivatives - The position derivatives to be scaled.
 * @return {THREE.Vector3[]} The scaled position derivatives.
 */
export function computeScaledPositionDerivatives(derivatives: THREE.Vector3[]): THREE.Vector3[] {
    return derivatives.map((derivative, index) => {
        const factorial = computeFactorial(index);
        return derivative.clone().divideScalar(factorial);
    });
}

/**
 * Computes the factorial of a given number.
 *
 * @param {number} n - The number for which to compute the factorial.
 * @return {number} The factorial of the given number.
 */
export function computeFactorial(n: number): number {
    if (n < 0) {
        throw new Error('Factorial is not defined for negative numbers.');
    }

    if (n === 0 || n === 1) {
        return 1;
    }

    let factorial = 1;

    for (let i = 2; i <= n; i++) {
        factorial *= i;
    }

    return factorial;
}

/**
 * Updates the scaled displacement derivatives based on the given position derivatives.
 *
 * @param {THREE.Vector3[]} targetPositionDerivatives - The target position derivatives.
 * @param {THREE.Vector3[]} shooterPositionDerivatives - The shooter position derivatives.
 * @param {THREE.Vector3[]} projectilePositionDerivatives - Optional parameter for projectile displacement derivatives.
 */
export function updateScaledDisplacementDerivatives(
    targetPositionDerivatives: THREE.Vector3[],
    shooterPositionDerivatives: THREE.Vector3[],
    projectilePositionDerivatives?: THREE.Vector3[],
    indexToMinimize?: number
): void {
    function validateVectors(vectors: THREE.Vector3[], vectorType: string): void {
        vectors.forEach((vec, index) => {
            if (vec === undefined || vec === null || !(vec instanceof THREE.Vector3)) {
                console.error(`Invalid vector at index ${index} in ${vectorType} derivatives:`, vectors);
            }
        });
    }

    validateVectors(targetPositionDerivatives, 'target');
    validateVectors(shooterPositionDerivatives, 'shooter');

    const targetDisplacementDerivatives = computeDisplacementDerivatives(shooterPositionDerivatives, targetPositionDerivatives);
    scaledDeltaSTDerivatives.length = 0;
    scaledDeltaSTDerivatives.push(...computeScaledPositionDerivatives(targetDisplacementDerivatives));
    console.log('Updated scaledTargetDerivatives:', scaledDeltaSTDerivatives);
    
    if (!projectilePositionDerivatives) { return; }

    const projectileDerivatives = computeDisplacementDerivatives(shooterPositionDerivatives, projectilePositionDerivatives);
    scaledDeltaSPDerivatives.length = 0;
    scaledDeltaSPDerivatives.push(...computeScaledPositionDerivatives(projectileDerivatives));
    if (indexToMinimize) scaledDeltaSPDerivatives[indexToMinimize].set(0, 0, 0);
    console.log('Updated scaledProjectileDerivatives:', scaledDeltaSPDerivatives);
}

export function getScaledShooterTargetDisplacementDerivatives(): THREE.Vector3[] {
    return scaledDeltaSTDerivatives;
}

export function getScaledProjectileShooterDisplacementDerivatives(): THREE.Vector3[] {
    return scaledDeltaSPDerivatives;
}
