import { LaurentPolynomial } from '../src/simulation/utils/LaurentPolynomial';
import { Polynomial } from "polynomial-real-root-finding/dist/lib/polynomial/types";

describe('LaurentPolynomial', () => {
  describe('constructor', () => {
    it('should create a LaurentPolynomial with default empty coefficients', () => {
      const lp = new LaurentPolynomial();
      expect(lp.negativeDegreeCoefficients).toEqual([]);
      expect(lp.positiveDegreeCoefficients).toEqual([]);
    });

    it('should create a LaurentPolynomial with provided coefficients', () => {
      const lp = new LaurentPolynomial([1, 2], [3, 4, 5]);
      expect(lp.negativeDegreeCoefficients).toEqual([1, 2]);
      expect(lp.positiveDegreeCoefficients).toEqual([3, 4, 5]);
    });
  });

  describe('fromPolynomial', () => {
    it('should create a LaurentPolynomial from a Polynomial', () => {
      const polynomial: Polynomial = [1, 2, 3];
      const lp = LaurentPolynomial.fromPolynomial(polynomial);
      expect(lp.negativeDegreeCoefficients).toEqual([]);
      expect(lp.positiveDegreeCoefficients).toEqual(polynomial);
    });
  });

  describe('multiplyByXPower', () => {
    it('should return the same LaurentPolynomial when multiplied by x^0', () => {
      const lp = new LaurentPolynomial([1, 2], [3, 4, 5]);
      const result = lp.multiplyByXPower(0);
      expect(result).toEqual(lp);
    });

    it('should correctly multiply by a positive power of x', () => {
      const lp = new LaurentPolynomial([1, 2], [3, 4, 5]);
      const result = lp.multiplyByXPower(2);
      expect(result.negativeDegreeCoefficients).toEqual([]);
      expect(result.positiveDegreeCoefficients).toEqual([0, 0, 1, 2, 3, 4, 5]);
    });

    it('should correctly multiply by a negative power of x', () => {
      const lp = new LaurentPolynomial([1, 2], [3, 4, 5]);
      const result = lp.multiplyByXPower(-2);
      expect(result.negativeDegreeCoefficients).toEqual([3, 4, 1, 2]);
      expect(result.positiveDegreeCoefficients).toEqual([0, 0, 5]);
    });
  });

  describe('derivative', () => {
    it('should correctly compute the derivative of a LaurentPolynomial', () => {
      const lp = new LaurentPolynomial([1, 2], [3, 4, 5]);
      const result = lp.derivative();
      expect(result.negativeDegreeCoefficients).toEqual([-1, -4]);
      expect(result.positiveDegreeCoefficients).toEqual([4, 10]);
    });

    it('should handle a LaurentPolynomial with only positive coefficients', () => {
      const lp = new LaurentPolynomial([], [1, 2, 3]);
      const result = lp.derivative();
      expect(result.negativeDegreeCoefficients).toEqual([]);
      expect(result.positiveDegreeCoefficients).toEqual([2, 6]);
    });

    it('should handle a LaurentPolynomial with only negative coefficients', () => {
      const lp = new LaurentPolynomial([1, 2, 3], []);
      const result = lp.derivative();
      expect(result.negativeDegreeCoefficients).toEqual([-1, -4, -9]);
      expect(result.positiveDegreeCoefficients).toEqual([]);
    });
  });

  describe('evaluateAt', () => {
    it('should correctly evaluate a LaurentPolynomial at a non-zero value', () => {
      const lp = new LaurentPolynomial([1, 2], [3, 4, 5]);
      const result = lp.evaluateAt(2);
      expect(result).toEqual(129/4);
    });

    it('should correctly evaluate a LaurentPolynomial with only positive coefficients at zero', () => {
      const lp = new LaurentPolynomial([], [1, 2, 3]);
      const result = lp.evaluateAt(0);
      expect(result).toEqual(1);
    });

    it('should throw an error when evaluating a LaurentPolynomial with negative coefficients at zero', () => {
      const lp = new LaurentPolynomial([1, 2], [3, 4, 5]);
      expect(() => lp.evaluateAt(0)).toThrowError('Division by zero encountered when evaluating negative powers at x = 0');
    });
  });

  describe('convertToNumeratorPolynomial', () => {
    it('should correctly convert a LaurentPolynomial to a Polynomial', () => {
      const lp = new LaurentPolynomial([1, 2], [3, 4, 5]);
      const result = lp.convertToNumeratorPolynomial();
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle a LaurentPolynomial with only positive coefficients', () => {
      const lp = new LaurentPolynomial([], [1, 2, 3]);
      const result = lp.convertToNumeratorPolynomial();
      expect(result).toEqual([1, 2, 3]);
    });

    it('should handle a LaurentPolynomial with only negative coefficients', () => {
      const lp = new LaurentPolynomial([1, 2, 3], []);
      const result = lp.convertToNumeratorPolynomial();
      expect(result).toEqual([1, 2, 3]);
    });
  });
});