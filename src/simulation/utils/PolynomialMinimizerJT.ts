import roots from 'poly-roots';
import {
    Polynomial,
    evaluatePolynomial,
    polynomialDerivative,
} from './PolynomialUtils';

/**
 * Finds a positive global minimizer using Jenkins–Traub for derivative roots.
 * @param polynomial Coefficients in increasing order of degree
 * @param precision Imaginary tolerance when filtering roots
 */
export function positiveGlobalMinimizerJT(polynomial: Polynomial, precision = 1e-7): number | null {
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
        // Linear or constant polynomials have no positive interior minimizer
        return null;
    }

    const coeffDesc = derivative.slice().reverse();
    const [re, im] = roots(coeffDesc);
    const candidateRoots: number[] = [];
    for (let i = 0; i < re.length; i++) {
        if (Math.abs(im[i]) <= precision && re[i] > 0) {
            candidateRoots.push(re[i]);
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
