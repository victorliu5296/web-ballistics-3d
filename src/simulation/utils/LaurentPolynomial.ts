import { Polynomial } from "polynomial-real-root-finding/dist/lib/polynomial/types";

export class LaurentPolynomial {
    // Coefficients for negative exponents, in increasing order of degree
    negativeDegreeCoefficients: number[];
    // Coefficients for nonnegative exponents, in increasing order of degree
    positiveDegreeCoefficients: number[];

    constructor(negativeDegreeCoefficients: number[] = [], positiveDegreeCoefficients: number[] = []) {
        this.negativeDegreeCoefficients = negativeDegreeCoefficients;
        this.positiveDegreeCoefficients = positiveDegreeCoefficients;
    }

    static fromPolynomial(polynomial: Polynomial): LaurentPolynomial {
        return new LaurentPolynomial([], polynomial);
    }

    scaleCoefficients(factor: number): LaurentPolynomial {
        const newNegCoeffs = this.negativeDegreeCoefficients.map(coeff => coeff * factor);
        const newPosCoeffs = this.positiveDegreeCoefficients.map(coeff => coeff * factor);
        return new LaurentPolynomial(newNegCoeffs, newPosCoeffs);
    }

    multiplyByXPower(exponent: number): LaurentPolynomial {
        if (exponent === 0) return this;

        let newNegCoeffs: number[] = [];
        let newPosCoeffs: number[] = [];

        if (exponent > 0) {
            newNegCoeffs = this.negativeDegreeCoefficients.slice(exponent) || [];
            newPosCoeffs = Array(exponent).fill(0).concat(this.negativeDegreeCoefficients.slice(0, exponent), this.positiveDegreeCoefficients);
        } else {
            const absExponent = -exponent;
            newPosCoeffs = this.positiveDegreeCoefficients.slice(absExponent) || [];
            newNegCoeffs = this.positiveDegreeCoefficients.slice(0, absExponent).concat(this.negativeDegreeCoefficients);
            newPosCoeffs = Array(absExponent).fill(0).concat(newPosCoeffs);
        }

        return new LaurentPolynomial(newNegCoeffs, newPosCoeffs);
    }

    derivative(): LaurentPolynomial {
        const newPosDerivatives = this.positiveDegreeCoefficients.map((coeff, index) => coeff * index).slice(1);
        
        // Handling negative coefficients' derivatives properly
        let newNegDerivatives: number[] = [];

        if (this.negativeDegreeCoefficients.length > 0) {
            newNegDerivatives = new Array(this.negativeDegreeCoefficients.length).fill(0);
            // We iterate from the least negative to the most negative (which is the reverse of the index)
            for (let i = 0; i < this.negativeDegreeCoefficients.length; i++) {
                const power = -i - 1; // Exponent of the current term
                newNegDerivatives[i] = power * this.negativeDegreeCoefficients[i];
            }
        }

        return new LaurentPolynomial(newNegDerivatives, newPosDerivatives);
    }

    evaluateAt(x: number): number {
        if (x === 0 && this.negativeDegreeCoefficients.length > 0) {
            throw new Error('Division by zero encountered when evaluating negative powers at x = 0');
        }

        // Evaluate positive degree coefficients using Horner's method
        let posResult = 0;
        for (let i = this.positiveDegreeCoefficients.length - 1; i >= 0; i--) {
            posResult = posResult * x + this.positiveDegreeCoefficients[i];
        }

        if (this.negativeDegreeCoefficients.length === 0) {
            return posResult;
        }

        // Evaluate negative degree coefficients
        // Remember the negative coefficients are stored from most negative to less negative
        let negResult = 0;
        for (let i = 0; i < this.negativeDegreeCoefficients.length; i++) {
            negResult = negResult / x + this.negativeDegreeCoefficients[i];
        }
        negResult /= x; // Remember that the last exponent is -1

        return posResult + negResult;
    }

    convertToNumeratorPolynomial(): Polynomial {
        const totalLength = this.positiveDegreeCoefficients.length + this.negativeDegreeCoefficients.length;
        const newCoefficients = new Array(totalLength).fill(0);

        for (let i = 0; i < this.negativeDegreeCoefficients.length; i++) {
            newCoefficients[i] = this.negativeDegreeCoefficients[i];
        }

        for (let i = 0; i < this.positiveDegreeCoefficients.length; i++) {
            newCoefficients[i + this.negativeDegreeCoefficients.length] = this.positiveDegreeCoefficients[i];
        }

        return newCoefficients;
    }
}
