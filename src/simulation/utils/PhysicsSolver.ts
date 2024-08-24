import { Vector3 } from 'three';
import { Polynomial, evaluatePolynomial, findStrictlyPositiveRoots, hasStrictlyPositiveRoots } from 'polynomial-real-root-finding';
import { computeDisplacementDerivatives } from './MovementUtils';
import { LaurentPolynomial } from './LaurentPolynomial';
import { vectorTaylorShift } from './vectorTaylorShift';

export class PhysicsSolver {
    
    /**
     * Calculates the s(T) \cdot s(T) and returns it as a polynomial scalar coefficient array
     *
     * @param {Vector3[]} scaledRelativeVectors - An array of Vector3 representing scaled relative vectors.
     * @return {Polynomial} The expanded dot product polynomial.
     */
    public static expandDotProductPolynomial(scaledRelativeVectors: Vector3[]): Polynomial {
        const vectorCoefficientCount = scaledRelativeVectors.length;
        const expandedPolynomialCoefficientCount = 2 * vectorCoefficientCount - 1;
        const expandedPolynomialCoefficients = new Array(expandedPolynomialCoefficientCount).fill(0);

        for (let k = 0; k < expandedPolynomialCoefficientCount; k++) {
            let coefficientSum = 0;
            let middleIndex = Math.floor(k / 2);

            if (k % 2 === 0) {
                for (let j = 0; j < middleIndex; j++) {
                    if (j < scaledRelativeVectors.length && (k - j) < scaledRelativeVectors.length) {
                        coefficientSum += scaledRelativeVectors[j].dot(scaledRelativeVectors[k - j]);
                    }
                }
                coefficientSum *= 2;
                coefficientSum += scaledRelativeVectors[middleIndex].dot(scaledRelativeVectors[middleIndex]);
            } else {
                for (let j = 0; j <= middleIndex; j++) {
                    if (j < scaledRelativeVectors.length && (k - j) < scaledRelativeVectors.length) {
                        coefficientSum += scaledRelativeVectors[j].dot(scaledRelativeVectors[k - j]);
                    }
                }
                coefficientSum *= 2;
            }
            expandedPolynomialCoefficients[k] = coefficientSum;
        }

        return expandedPolynomialCoefficients;
    }

    // Calculate velocity square magnitude as a function of time
    static velocitySquareMagnitude(relativeVectors: Vector3[]): (timeToTarget: number) => number {
        const expandedPolynomial = this.expandDotProductPolynomial(relativeVectors);
        return (timeToTarget: number) => evaluatePolynomial(expandedPolynomial, timeToTarget) / (timeToTarget * timeToTarget);
    }

    /**
     * A function with a time parameter T, calculates s(T).s(T)/T^(2k)
     *
     * @param {Vector3[]} relativeVectors - An array of Vector3 representing the relative vectors.
     * @param {number} indexToMinimize - The index to minimize.
     * @return {(timeToTarget: number) => number} A function that takes a timeToTarget value and returns the square magnitude of the derivative of the polynomial evaluated at that time.
     */
    static derivativeSquareMagnitude(relativeVectors: Vector3[], indexToMinimize: number): (timeToTarget: number) => number {
        const expandedPolynomial = this.expandDotProductPolynomial(relativeVectors);
        return (timeToTarget: number) => evaluatePolynomial(expandedPolynomial, timeToTarget) / (Math.pow(timeToTarget, 2 * indexToMinimize));
    }

    // Test points to find minimum using a function
    static testPointsForMinimum(functionToMinimize: (input: number) => number, inputValues: number[]): number {
        let minimumInput = NaN;
        let minimumOutput = Infinity;

        for (let i = 0; i < inputValues.length; i++) {
            const currentInput = inputValues[i];
            const currentOutput = functionToMinimize(currentInput);
            if (currentOutput < minimumOutput) {
                minimumInput = currentInput;
                minimumOutput = currentOutput;
            }
        }

        return minimumInput;
    }

    static calculateInitialDerivativeWithFallback(
        shiftedTargetVectors: Vector3[],
        scaledDeltaSPVectors: Vector3[],
        indexToMinimize: number,
        fallbackIntersectionTime: number,
        projectileExpiryLifetime: number
    ): Vector3 {
        if (fallbackIntersectionTime > projectileExpiryLifetime) {
            fallbackIntersectionTime = projectileExpiryLifetime - 2 > 0 ? projectileExpiryLifetime - 2 : 2;
        }
        // Compute the relative vectors (deltaPT := T - P) by taking the difference between the projectile's derivatives and the target's derivatives.
        const scaledRelativeVectors = computeDisplacementDerivatives(scaledDeltaSPVectors, shiftedTargetVectors);

        // Expand the velocity numerator polynomial s(T).s(T) using Horner's method
        const velocityNumeratorPolynomial = this.expandDotProductPolynomial(scaledRelativeVectors);

        // d^(k) s(T) = s(T).s(T) / T^(2k)
        const velocityLaurentPolynomial = new LaurentPolynomial(velocityNumeratorPolynomial)
            .multiplyByXPower(-2 * indexToMinimize);

        // Take the derivative of the velocity function and convert to a polynomial
        const derivativeNumeratorPolynomial = velocityLaurentPolynomial.derivative().convertToNumeratorPolynomial();

        // Check for roots using Descartes's rule of signs (if 0 sign variations then no positive roots exist)
        if (!hasStrictlyPositiveRoots(derivativeNumeratorPolynomial)) {
            // If no roots exist, use the provided fallback intersection time
            return this.calculateInitialDerivative(scaledRelativeVectors, fallbackIntersectionTime, indexToMinimize);
        }
        
        // Find all roots of the derivative polynomial
        const criticalTimes = findStrictlyPositiveRoots(derivativeNumeratorPolynomial, 1e-5);

        if (criticalTimes.length === 0) {
            // If no roots exist, use the provided fallback intersection time
            return this.calculateInitialDerivative(scaledRelativeVectors, fallbackIntersectionTime, indexToMinimize);
        }

        // If roots exist, test all these critical points into the velocity function to find the minimum critical time
        const optimalTimeToTarget = this.testPointsForMinimum(
            this.derivativeSquareMagnitude(scaledRelativeVectors, indexToMinimize),
            criticalTimes
        );
        console.log('Optimum exists at', optimalTimeToTarget);

        return this.calculateInitialDerivative(
            scaledRelativeVectors,
            optimalTimeToTarget < projectileExpiryLifetime ? optimalTimeToTarget : fallbackIntersectionTime,
            indexToMinimize
        );
    }

    /**
     * Calculate the initial derivative based on scaled relative vectors, time to target, and index to minimize.
     * d^(k) s(T) = s_pt / T^k
     *
     * @param {Vector3[]} scaledRelativeVectors - Target - Projectile
     * @param {number} timeToTarget - The time of intersection between the target and projectile
     * @param {number} indexToMinimize - The index to minimize
     * @return {Vector3} The calculated initial derivative
     * @see https://github.com/The2Innkeeper/CrazyBallistics/blob/main/explanation-docs/physics/0-solution_approach.md
     */
    static calculateInitialDerivative(scaledRelativeVectors: Vector3[], timeToTarget: number, indexToMinimize: number): Vector3 {
        let hornerResult = scaledRelativeVectors[scaledRelativeVectors.length - 1].clone();
        for (let coeff_i = scaledRelativeVectors.length - 2; coeff_i >= 0; coeff_i--) {
            hornerResult.multiplyScalar(timeToTarget).add(scaledRelativeVectors[coeff_i]);
        }
        return hornerResult.divideScalar(Math.pow(timeToTarget, indexToMinimize));
    }

    /**
     * Horner's method to calculate initial velocity
     * 
     * @param {Vector3[]} scaledRelativeVectors array of scaled relative vectors
     * @param {number} timeToTarget the time of intersection between the target and projectile
     * @returns {Vector3} the minimized initial velocity
     * @see https://en.wikipedia.org/wiki/Horner%27s_method and https://github.com/The2Innkeeper/CrazyBallistics/blob/main/explanation-docs/physics/0-solution_approach.md
     */
    static calculateInitialVelocity(scaledRelativeVectors: Vector3[], timeToTarget: number): Vector3 {
        // Initialize the result as the last element of the array
        let hornerResult = scaledRelativeVectors[scaledRelativeVectors.length - 1].clone();

        // Iterate through the array and apply Horner's method
        for (let coeff_i = scaledRelativeVectors.length - 2; coeff_i >= 0; coeff_i--) {
            // Multiply the current result by the time to target and add the element at the current index
            hornerResult.multiplyScalar(timeToTarget).add(scaledRelativeVectors[coeff_i]);
        }

        // Multiply the final result by the reciprocal of the time to target
        return hornerResult.multiplyScalar(1 / timeToTarget);
    }

    /**
     * Calculate the minimized initial velocity from scratch
     * 
     * @param {Vector3[]} scaledDeltaSTVectors scaled target displacement derivatives
     * @param {Vector3[]} scaledDeltaSPVectors scaled projectile displacement derivatives
     * @returns {Vector3} the minimized initial velocity
     */
    static calculateMinimizedInitialVelocity(scaledDeltaSTVectors: Vector3[], scaledDeltaSPVectors: Vector3[]): Vector3 {
        // Compute the relative vectors by taking the difference between the projectile's derivatives and the target's derivatives.
        const scaledRelativeVectors = computeDisplacementDerivatives(scaledDeltaSPVectors, scaledDeltaSTVectors);
        
        // Expand the velocity numerator polynomial x(T).x(T) using Horner's method
        const velocityNumeratorPolynomial = this.expandDotProductPolynomial(scaledRelativeVectors);
        
        // v(T) = x(T).x(T) / T^2
        const velocityLaurentPolynomial = new LaurentPolynomial(velocityNumeratorPolynomial).multiplyByXPower(-2);
        
        // Take the derivative of the velocity function and convert to a polynomial
        const derivativeNumeratorPolynomial = velocityLaurentPolynomial.derivative().convertToNumeratorPolynomial();
        
        // Find all roots of the derivative polynomial
        const criticalTimes = findStrictlyPositiveRoots(derivativeNumeratorPolynomial, 1e-6);
        
        // Test all these critical points into the velocity function to find the minimum critical time
        const velocitySquareMagnitude = this.velocitySquareMagnitude(scaledRelativeVectors);
        const optimalTimeToTarget = this.testPointsForMinimum(velocitySquareMagnitude, criticalTimes);
        
        // Calculate the initial velocity based on the minimum critical time
        const minimizedInitialVelocity = this.calculateInitialVelocity(scaledRelativeVectors, optimalTimeToTarget);
        
        // Return the minimum initial velocity
        return minimizedInitialVelocity;
    }
}

/**
 * Calculate the binomial coefficient (n choose k).
 * @param n The total number of items.
 * @param k The number of items to choose.
 * @returns The binomial coefficient.
 */
function binomial(n: number, k: number): number {
    let coeff = 1;
    for (let i = n - k + 1; i <= n; i++) coeff *= i;
    for (let i = 1; i <= k; i++) coeff /= i;
    return coeff;
}