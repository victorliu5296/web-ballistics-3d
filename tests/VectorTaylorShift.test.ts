import { Vector3 } from 'three';
import { vectorTaylorShift } from '../src/simulation/utils/vectorTaylorShift';

describe('vectorTaylorShift', () => {
    test('shifts a simple vector polynomial correctly', () => {
        const vectors: Vector3[] = [new Vector3(1, 1, 1), new Vector3(2, 2, 2)];
        const shift = 1;
        // 1 + 2 (T+1) = 3 + 2T
        const expected = [
            new Vector3(3, 3, 3), // Calculated expected results
            new Vector3(2, 2, 2)
        ];

        const result = vectorTaylorShift(vectors, shift);
        expected.forEach((vec, index) => {
            expect(result[index].x).toBeCloseTo(vec.x);
            expect(result[index].y).toBeCloseTo(vec.y);
            expect(result[index].z).toBeCloseTo(vec.z);
        });
    });

    test('handles zero shift', () => {
        const vectors: Vector3[] = [new Vector3(1, 2, 3), new Vector3(4, 5, 6)];
        const shift = 0;
        const expected = [
            new Vector3(1, 2, 3),
            new Vector3(4, 5, 6)
        ];

        const result = vectorTaylorShift(vectors, shift);
        expected.forEach((vec, index) => {
            expect(result[index].x).toBeCloseTo(vec.x);
            expect(result[index].y).toBeCloseTo(vec.y);
            expect(result[index].z).toBeCloseTo(vec.z);
        });
    });

    test('handles empty vector array', () => {
        const vectors: Vector3[] = [];
        const shift = 1;
        const result = vectorTaylorShift(vectors, shift);
        expect(result).toEqual([] as Vector3[]);
    });

    test('handles large shift value', () => {
        const vectors: Vector3[] = [new Vector3(1, 0, 0), new Vector3(0, 1, 0), new Vector3(0, 0, 1)];
        const shift = 10;

        // (1,0,0) + (T+10)(0,1,0) + (T+10)^2 (0,0,1) = (1,0,0)+(T)(0,1,0)+(0,10,0)+(T^2)(0,0,1)+T(0,0,20)+(0,0,100)
        // = (1,10,100)+T(0,1,20)+(0,0,1)
        const expected = [
            new Vector3(1, 10, 100),
            new Vector3(0, 1, 20),
            new Vector3(0, 0, 1)
        ];

        const result = vectorTaylorShift(vectors, shift);
        expected.forEach((vec, index) => {
            expect(result[index].x).toBeCloseTo(vec.x);
            expect(result[index].y).toBeCloseTo(vec.y);
            expect(result[index].z).toBeCloseTo(vec.z);
        });
    });
});
