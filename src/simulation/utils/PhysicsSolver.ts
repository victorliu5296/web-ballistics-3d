import { Vector3 } from "three";
import {
  Polynomial,
  evaluatePolynomial,
  findPositiveRoots,
  polynomialDerivative,
  hasPositiveRoots,
} from "./PolynomialUtils";
import { computeDisplacementDerivatives } from "./MovementUtils";
import { LaurentPolynomial } from "./LaurentPolynomial";
import { vectorTaylorShift } from "./vectorTaylorShift";

export class PhysicsSolver {
  /**
   * Calculates the s(T) \cdot s(T) and returns it as a polynomial scalar coefficient array
   *
   * @param {Vector3[]} scaledRelativeVectors - An array of Vector3 representing scaled relative vectors.
   * @return {Polynomial} The expanded dot product polynomial.
   */
  public static expandDotProductPolynomial(
    scaledRelativeVectors: Vector3[]
  ): Polynomial {
    const vectorCoefficientCount = scaledRelativeVectors.length;
    const expandedPolynomialCoefficientCount = 2 * vectorCoefficientCount - 1;
    const expandedPolynomialCoefficients = new Array(
      expandedPolynomialCoefficientCount
    ).fill(0);

    for (let k = 0; k < expandedPolynomialCoefficientCount; k++) {
      let coefficientSum = 0;
      let middleIndex = Math.floor(k / 2);

      if (k % 2 === 0) {
        for (let j = 0; j < middleIndex; j++) {
          if (
            j < scaledRelativeVectors.length &&
            k - j < scaledRelativeVectors.length
          ) {
            coefficientSum += scaledRelativeVectors[j].dot(
              scaledRelativeVectors[k - j]
            );
          }
        }
        coefficientSum *= 2;
        coefficientSum += scaledRelativeVectors[middleIndex].dot(
          scaledRelativeVectors[middleIndex]
        );
      } else {
        for (let j = 0; j <= middleIndex; j++) {
          if (
            j < scaledRelativeVectors.length &&
            k - j < scaledRelativeVectors.length
          ) {
            coefficientSum += scaledRelativeVectors[j].dot(
              scaledRelativeVectors[k - j]
            );
          }
        }
        coefficientSum *= 2;
      }
      expandedPolynomialCoefficients[k] = coefficientSum;
    }

    return expandedPolynomialCoefficients;
  }

  // Calculate velocity square magnitude as a function of time
  static velocitySquareMagnitude(
    relativeVectors: Vector3[]
  ): (timeToTarget: number) => number {
    const expandedPolynomial = this.expandDotProductPolynomial(relativeVectors);
    return (timeToTarget: number) =>
      evaluatePolynomial(expandedPolynomial, timeToTarget) /
      (timeToTarget * timeToTarget);
  }

  /**
   * A function with a time parameter T, calculates s(T).s(T)/T^(2k)
   *
   * @param {Vector3[]} relativeVectors - An array of Vector3 representing the relative vectors.
   * @param {number} indexToMinimize - The index to minimize.
   * @return {(timeToTarget: number) => number} A function that takes a timeToTarget value and returns the square magnitude of the derivative of the polynomial evaluated at that time.
   */
  static derivativeSquareMagnitude(
    relativeVectors: Vector3[],
    indexToMinimize: number
  ): (timeToTarget: number) => number {
    const expandedPolynomial = this.expandDotProductPolynomial(relativeVectors);
    return (timeToTarget: number) =>
      evaluatePolynomial(expandedPolynomial, timeToTarget) /
      Math.pow(timeToTarget, 2 * indexToMinimize);
  }

  // Test points to find minimum using a function
  static testPointsForMinimum(
    functionToMinimize: (input: number) => number,
    inputValues: number[]
  ): number {
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
      fallbackIntersectionTime =
        projectileExpiryLifetime - 2 > 0 ? projectileExpiryLifetime - 2 : 2;
    }
    // Compute the relative vectors (deltaPT := T - P) by taking the difference between the projectile's derivatives and the target's derivatives.
    const scaledRelativeVectors = computeDisplacementDerivatives(
      scaledDeltaSPVectors,
      shiftedTargetVectors
    );

    // Expand the velocity numerator polynomial s(T).s(T) using Horner's method
    const velocityNumeratorPolynomial = this.expandDotProductPolynomial(
      scaledRelativeVectors
    );

    // d^(k) s(T) = s(T).s(T) / T^(2k)
    const velocityLaurentPolynomial = new LaurentPolynomial(
      velocityNumeratorPolynomial
    ).multiplyByXPower(-2 * indexToMinimize);

    // Take the derivative of the velocity function and convert to a polynomial
    const derivativeNumeratorPolynomial = velocityLaurentPolynomial
      .derivative()
      .convertToNumeratorPolynomial();

    // Check for roots using Descartes's rule of signs (if 0 sign variations then no positive roots exist)
    if (!hasPositiveRoots(derivativeNumeratorPolynomial)) {
      // If no roots exist, use the provided fallback intersection time
      return this.calculateInitialDerivative(
        scaledRelativeVectors,
        fallbackIntersectionTime,
        indexToMinimize
      );
    }

    // Find all roots of the derivative polynomial
    const criticalTimes = findPositiveRoots(
      derivativeNumeratorPolynomial,
      1e-5
    );

    if (criticalTimes.length === 0) {
      // If no roots exist, use the provided fallback intersection time
      return this.calculateInitialDerivative(
        scaledRelativeVectors,
        fallbackIntersectionTime,
        indexToMinimize
      );
    }

    // If roots exist, test all these critical points into the velocity function to find the minimum critical time
    const optimalTimeToTarget = this.testPointsForMinimum(
      this.derivativeSquareMagnitude(scaledRelativeVectors, indexToMinimize),
      criticalTimes
    );
    console.log("Optimum exists at", optimalTimeToTarget);

    return this.calculateInitialDerivative(
      scaledRelativeVectors,
      optimalTimeToTarget < projectileExpiryLifetime
        ? optimalTimeToTarget
        : fallbackIntersectionTime,
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
   * @see https://github.com/victorliu5296/CrazyBallistics/blob/main/explanation-docs/physics/0-solution_approach.md
   */
  static calculateInitialDerivative(
    scaledRelativeVectors: Vector3[],
    timeToTarget: number,
    indexToMinimize: number
  ): Vector3 {
    let hornerResult =
      scaledRelativeVectors[scaledRelativeVectors.length - 1].clone();
    for (
      let coeff_i = scaledRelativeVectors.length - 2;
      coeff_i >= 0;
      coeff_i--
    ) {
      hornerResult
        .multiplyScalar(timeToTarget)
        .add(scaledRelativeVectors[coeff_i]);
    }
    return hornerResult.divideScalar(Math.pow(timeToTarget, indexToMinimize));
  }

  /**
   * Horner's method to calculate initial velocity
   *
   * @param {Vector3[]} scaledRelativeVectors array of scaled relative vectors
   * @param {number} timeToTarget the time of intersection between the target and projectile
   * @returns {Vector3} the minimized initial velocity
   * @see https://en.wikipedia.org/wiki/Horner%27s_method and https://github.com/victorliu5296/CrazyBallistics/blob/main/explanation-docs/physics/0-solution_approach.md
   */
  static calculateInitialVelocity(
    scaledRelativeVectors: Vector3[],
    timeToTarget: number
  ): Vector3 {
    // Initialize the result as the last element of the array
    let hornerResult =
      scaledRelativeVectors[scaledRelativeVectors.length - 1].clone();

    // Iterate through the array and apply Horner's method
    for (
      let coeff_i = scaledRelativeVectors.length - 2;
      coeff_i >= 0;
      coeff_i--
    ) {
      // Multiply the current result by the time to target and add the element at the current index
      hornerResult
        .multiplyScalar(timeToTarget)
        .add(scaledRelativeVectors[coeff_i]);
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
  static calculateMinimizedInitialVelocity(
    scaledDeltaSTVectors: Vector3[],
    scaledDeltaSPVectors: Vector3[]
  ): Vector3 {
    // Compute the relative vectors by taking the difference between the projectile's derivatives and the target's derivatives.
    const scaledRelativeVectors = computeDisplacementDerivatives(
      scaledDeltaSPVectors,
      scaledDeltaSTVectors
    );

    // Expand the velocity numerator polynomial x(T).x(T) using Horner's method
    const velocityNumeratorPolynomial = this.expandDotProductPolynomial(
      scaledRelativeVectors
    );

    // v(T) = x(T).x(T) / T^2
    const velocityLaurentPolynomial = new LaurentPolynomial(
      velocityNumeratorPolynomial
    ).multiplyByXPower(-2);

    // Take the derivative of the velocity function and convert to a polynomial
    const derivativeNumeratorPolynomial = velocityLaurentPolynomial
      .derivative()
      .convertToNumeratorPolynomial();

    // Find all roots of the derivative polynomial
    const criticalTimes = findPositiveRoots(
      derivativeNumeratorPolynomial,
      1e-6
    );

    // Test all these critical points into the velocity function to find the minimum critical time
    const velocitySquareMagnitude = this.velocitySquareMagnitude(
      scaledRelativeVectors
    );
    const optimalTimeToTarget = this.testPointsForMinimum(
      velocitySquareMagnitude,
      criticalTimes
    );

    // Calculate the initial velocity based on the minimum critical time
    const minimizedInitialVelocity = this.calculateInitialVelocity(
      scaledRelativeVectors,
      optimalTimeToTarget
    );

    // Return the minimum initial velocity
    return minimizedInitialVelocity;
  }

  /** Compute dot product polynomial of two vector coefficient arrays */
  private static expandMixedDotProductPolynomial(
    vectorsA: Vector3[],
    vectorsB: Vector3[]
  ): Polynomial {
    const resultLength = vectorsA.length + vectorsB.length - 1;
    const result = new Array(resultLength).fill(0);
    for (let i = 0; i < vectorsA.length; i++) {
      for (let j = 0; j < vectorsB.length; j++) {
        result[i + j] += vectorsA[i].dot(vectorsB[j]);
      }
    }
    return result;
  }

  /** Derivative of a vector polynomial */
  private static derivativeVectorPolynomial(vectors: Vector3[]): Vector3[] {
    if (vectors.length <= 1) return [new Vector3(0, 0, 0)];
    const result: Vector3[] = new Array(vectors.length - 1)
      .fill(null)
      .map(() => new Vector3());
    for (let i = 1; i < vectors.length; i++) {
      result[i - 1].copy(vectors[i]).multiplyScalar(i);
    }
    return result;
  }

  /**
   * Solve for the earliest intersection time given an initial speed.
   * Returns the initial velocity achieving the intersection or null if no
   * positive solution exists.
   */
  static initialVelocityForSpeed(
    scaledTargetVectors: Vector3[],
    scaledProjectileVectors: Vector3[],
    speed: number,
    precision = 1e-6
  ): { time: number; velocity: Vector3 } | null {
    const relative = computeDisplacementDerivatives(
      scaledProjectileVectors,
      scaledTargetVectors
    );

    let poly = this.expandDotProductPolynomial(relative).slice();
    if (poly.length <= 2) {
      while (poly.length <= 2) poly.push(0);
    }
    poly[2] -= speed * speed;

    const roots = findPositiveRoots(poly, precision);
    if (roots.length === 0) return null;
    const time = Math.min(...roots);
    const velocity = this.calculateInitialVelocity(relative, time);
    return { time, velocity };
  }

  /**
   * Calculate the minimum initial speed needed to intersect the target.
   * Returns null if no positive solution for the critical time exists.
   */
  static minimizedSpeedInitialVelocity(
    scaledTargetVectors: Vector3[],
    scaledProjectileVectors: Vector3[],
    precision = 1e-6
  ): { speed: number; time: number; velocity: Vector3 } | null {
    const relative = computeDisplacementDerivatives(
      scaledProjectileVectors,
      scaledTargetVectors
    );

    const derivativeVec = this.derivativeVectorPolynomial(relative);
    const derivativeVecT = [new Vector3(0, 0, 0), ...derivativeVec];
    const wVec: Vector3[] = new Array(relative.length)
      .fill(null)
      .map(() => new Vector3());
    for (let i = 0; i < relative.length; i++) {
      const a = derivativeVecT[i] ?? new Vector3(0, 0, 0);
      wVec[i].copy(a).sub(relative[i]);
    }

    const p = this.expandMixedDotProductPolynomial(relative, wVec);
    const q = this.expandDotProductPolynomial(relative);

    const roots = findPositiveRoots(p, precision);
    if (roots.length === 0) return null;

    let bestTime = roots[0];
    let bestSpeed = Math.sqrt(evaluatePolynomial(q, bestTime)) / bestTime;
    for (let i = 1; i < roots.length; i++) {
      const t = roots[i];
      const speedAtT = Math.sqrt(evaluatePolynomial(q, t)) / t;
      if (speedAtT < bestSpeed) {
        bestSpeed = speedAtT;
        bestTime = t;
      }
    }

    const velocity = this.calculateInitialVelocity(relative, bestTime);
    return { speed: bestSpeed, time: bestTime, velocity };
  }
}

