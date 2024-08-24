import { Vector3 } from 'three';
/**
 * Applies a Taylor shift transformation to a vector coefficient polynomial.
 * @param vectors Array of THREE.Vector3 objects to transform.
 * @param shift THREE.Vector3 representing the shift to apply.
 * @returns The vectors coefficients of the polynomial s(T + shift)
 */
export function vectorTaylorShift(vectors: Vector3[], shift: number): Vector3[] {
    const shiftedVectors = vectors.map(v => v.clone()); // Clone array of vectors
    const powers: number[] = new Array(vectors.length).fill(1); // Initialize powers of shift
    const binomials: number[][] = new Array(vectors.length).fill(null).map(() => []);

    // Pre-compute powers of shift
    for (let n = 1; n < vectors.length; n++) {
        powers[n] = powers[n - 1] * shift;
    }

    // Initialize the binomial coefficients
    for (let i = 0; i < vectors.length; i++) {
        binomials[i][0] = 1; // C(n, 0) = 1
        if (i > 0) {
            for (let j = 1; j <= i; j++) {
                binomials[i][j] = binomials[i - 1][j - 1] + (binomials[i - 1][j] || 0);
            }
        }
    }

    // Apply the Taylor shift using pre-computed values
    for (let i = 1; i < vectors.length; i++) {
        for (let j = 0; j < i; j++) {
            const scale = binomials[i][j] * powers[i - j];
            shiftedVectors[j].x += vectors[i].x * scale;
            shiftedVectors[j].y += vectors[i].y * scale;
            shiftedVectors[j].z += vectors[i].z * scale;
        }
    }

    return shiftedVectors;
}