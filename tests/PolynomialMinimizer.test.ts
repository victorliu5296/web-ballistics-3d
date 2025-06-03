import { positiveGlobalMinimizer } from '../src/simulation/utils/PolynomialMinimizer';

describe('positiveGlobalMinimizer', () => {
    test('finds minimizer for quadratic polynomial', () => {
        // p(x) = 2 - 4x + 2x^2 -> minimum at x=1
        const poly = [2, -4, 2];
        const min = positiveGlobalMinimizer(poly);
        expect(min).not.toBeNull();
        expect(min!).toBeCloseTo(1);
    });

    test('returns null when polynomial is unbounded below', () => {
        // p(x) = -1 + x - x^2, leading coefficient negative
        const poly = [-1, 1, -1];
        const min = positiveGlobalMinimizer(poly);
        expect(min).toBeNull();
    });

    test('returns null when minimum occurs at zero', () => {
        // p(x) = x^3 - 6x^2 + 12x -> minimum at 0
        const poly = [0, 12, -6, 1];
        const min = positiveGlobalMinimizer(poly);
        expect(min).toBeNull();
    });
});
