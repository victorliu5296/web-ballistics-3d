import durandKerner from 'durand-kerner';
import {
    Polynomial,
    evaluatePolynomial,
    polynomialDerivative,
} from './PolynomialUtils';

/**
 * Finds a positive global minimizer using Durand-Kerner for derivative roots.
 * @param polynomial Coefficients in increasing order of degree
 * @param precision Imaginary tolerance when filtering roots
 */
export function positiveGlobalMinimizerDK(polynomial: Polynomial, precision = 1e-7): number | null {
    if (polynomial.length === 0) {
        throw new Error('Polynomial must have at least one coefficient.');
    }

    let deg = polynomial.length - 1;
    while (deg > 0 && Math.abs(polynomial[deg]) < Number.EPSILON) {
        deg--;
    }
    polynomial = polynomial.slice(0, deg + 1);
    const leadingCoeff = polynomial[polynomial.length - 1];
    if (leadingCoeff < 0) {
        return null;
    }

    const derivative = polynomialDerivative(polynomial);
    if (derivative.length <= 1) {
        return null;
    }

    const re = derivative.slice();
    const im = new Array(re.length).fill(0);
    const [rootsRe, rootsIm] = durandKerner(re, im);
    const candidateRoots: number[] = [];
    for (let i = 0; i < rootsRe.length; i++) {
        if (Math.abs(rootsIm[i]) <= precision && rootsRe[i] > 0) {
            candidateRoots.push(rootsRe[i]);
        }
    }
    candidateRoots.sort((a, b) => a - b);

    let minimizer: number | null = null;
    let minValue = Infinity;
    const evalAt = (x: number) => evaluatePolynomial(polynomial, x);
    for (const r of candidateRoots) {
        const val = evalAt(r);
        if (val < minValue) {
            minValue = val;
            minimizer = r;
        }
    }

    const valueAtZero = evalAt(0);
    if (minimizer === null || valueAtZero <= minValue) {
        return null;
    }
    return minimizer;
}
