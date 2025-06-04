export type Polynomial = number[];

export function evaluatePolynomial(poly: Polynomial, x: number): number {
    let result = poly[poly.length - 1];
    for (let i = poly.length - 2; i >= 0; i--) {
        result = result * x + poly[i];
    }
    return result;
}

export function polynomialDerivative(poly: Polynomial): Polynomial {
    if (poly.length <= 1) return [0];
    const result: number[] = new Array(poly.length - 1);
    for (let i = 1; i < poly.length; i++) {
        result[i - 1] = poly[i] * i;
    }
    return result;
}

export function positiveRootUpperBound(poly: Polynomial): number {
    const n = poly.length - 1;
    const leading = Math.abs(poly[n]);
    if (leading === 0) return 0;
    let maxCoeff = 0;
    for (let i = 0; i < n; i++) {
        maxCoeff = Math.max(maxCoeff, Math.abs(poly[i]));
    }
    return 1 + maxCoeff / leading;
}

export function bisectionRoot(poly: Polynomial, a: number, b: number, tol = 1e-7): number {
    let fa = evaluatePolynomial(poly, a);
    let fb = evaluatePolynomial(poly, b);
    if (fa * fb > 0) throw new Error('Root not bracketed');
    for (let i = 0; i < 100; i++) {
        const mid = (a + b) / 2;
        const fm = evaluatePolynomial(poly, mid);
        if (Math.abs(fm) < tol || (b - a) / 2 < tol) return mid;
        if (fa * fm <= 0) {
            b = mid;
            fb = fm;
        } else {
            a = mid;
            fa = fm;
        }
    }
    return (a + b) / 2;
}

export function findPositiveRoots(poly: Polynomial, tol = 1e-7): number[] {
    const bound = positiveRootUpperBound(poly);
    if (bound === 0) return [];
    const stepCount = 1000;
    const step = bound / stepCount;
    const roots: number[] = [];
    let prevX = 0;
    let prevY = evaluatePolynomial(poly, prevX);
    for (let i = 1; i <= stepCount; i++) {
        const x = i * step;
        const y = evaluatePolynomial(poly, x);
        if (Math.abs(y) < tol) {
            roots.push(x);
        } else if (prevY * y < 0) {
            roots.push(bisectionRoot(poly, prevX, x, tol));
        }
        prevX = x;
        prevY = y;
    }
    return roots;
}

export function hasPositiveRoots(poly: Polynomial, tol = 1e-7): boolean {
    const roots = findPositiveRoots(poly, tol);
    return roots.length > 0;
}
