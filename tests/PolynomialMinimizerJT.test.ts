import { positiveGlobalMinimizerJT } from '../src/simulation/utils/PolynomialMinimizerJT';

describe('positiveGlobalMinimizerJT', () => {
    test('finds minimizer for quadratic polynomial', () => {
        const poly = [2, -4, 2];
        const min = positiveGlobalMinimizerJT(poly);
        expect(min).not.toBeNull();
        expect(min!).toBeCloseTo(1);
    });

    test('returns null when polynomial is unbounded below', () => {
        const poly = [-1, 1, -1];
        const min = positiveGlobalMinimizerJT(poly);
        expect(min).toBeNull();
    });

    test('returns null when minimum occurs at zero', () => {
        const poly = [0, 12, -6, 1];
        const min = positiveGlobalMinimizerJT(poly);
        expect(min).toBeNull();
    });
});
