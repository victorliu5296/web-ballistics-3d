const { positiveGlobalMinimizer } = require('../dist-cjs/simulation/utils/PolynomialMinimizer.js');
const { positiveGlobalMinimizerJT } = require('../dist-cjs/simulation/utils/PolynomialMinimizerJT.js');
const { positiveGlobalMinimizerDK } = require('../dist-cjs/simulation/utils/PolynomialMinimizerDK.js');

function randomPolynomial(deg) {
  const coeffs = [];
  for (let i = 0; i <= deg; i++) {
    coeffs.push(Math.random() * 2 - 1);
  }
  coeffs[deg] = Math.abs(coeffs[deg]) + 1; // ensure positive leading coeff
  return coeffs;
}

function benchmark(iterations, degree) {
  const poly = randomPolynomial(degree);
  const startNaive = process.hrtime.bigint();
  for (let i = 0; i < iterations; i++) {
    positiveGlobalMinimizer(poly);
  }
  const tNaive = Number(process.hrtime.bigint() - startNaive) / 1e6;

  const startJT = process.hrtime.bigint();
  for (let i = 0; i < iterations; i++) {
    positiveGlobalMinimizerJT(poly);
  }
  const tJT = Number(process.hrtime.bigint() - startJT) / 1e6;

  const startDK = process.hrtime.bigint();
  for (let i = 0; i < iterations; i++) {
    positiveGlobalMinimizerDK(poly);
  }
  const tDK = Number(process.hrtime.bigint() - startDK) / 1e6;

  console.log(`Degree ${degree} polynomial over ${iterations} runs`);
  console.log(`Naive solver:        ${tNaive.toFixed(2)} ms`);
  console.log(`Jenkins-Traub solver:${tJT.toFixed(2)} ms`);
  console.log(`Durand-Kerner solver:${tDK.toFixed(2)} ms`);
}

const degree = parseInt(process.argv[2] || '10', 10);
const iterations = parseInt(process.argv[3] || '100', 10);
benchmark(iterations, degree);
