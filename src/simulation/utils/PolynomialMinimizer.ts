import {
    Polynomial,
    polynomialDerivative,
    evaluatePolynomial,
    findPositiveRoots,
} from './PolynomialUtils';

/**
 * Finds a positive global minimizer for the given polynomial.
 *
 * @param polynomial Polynomial coefficients in increasing order of degree.
 * @param precision Precision used for root finding.
 * @returns The smallest positive global minimizer, or null if none exists.
 */
export function positiveGlobalMinimizer(polynomial: Polynomial, precision = 1e-7): number | null {
    if (polynomial.length === 0) {
        throw new Error('Polynomial must have at least one coefficient.');
    }

    // Remove leading zeros
    let deg = polynomial.length - 1;
    while (deg > 0 && Math.abs(polynomial[deg]) < Number.EPSILON) {
        deg--;
    }
    polynomial = polynomial.slice(0, deg + 1);

    const leadingCoeff = polynomial[polynomial.length - 1];
    // If the leading coefficient is negative the polynomial is unbounded below on positive reals
    if (leadingCoeff < 0) {
        return null;
    }

    const derivative = polynomialDerivative(polynomial);
    const candidateRoots = findPositiveRoots(derivative, precision);

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
