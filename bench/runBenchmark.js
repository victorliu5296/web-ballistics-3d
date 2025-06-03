const { positiveGlobalMinimizer } = require('../dist-cjs/simulation/utils/PolynomialMinimizer.js');
const { positiveGlobalMinimizerJT } = require('../dist-cjs/simulation/utils/PolynomialMinimizerJT.js');
const { positiveGlobalMinimizerDK } = require('../dist-cjs/simulation/utils/PolynomialMinimizerDK.js');

function randomPolynomial(deg) {
  const coeffs = [];
  for (let i = 0; i <= deg; i++) {
    coeffs.push(Math.random() * 2 - 1);
  }
  coeffs[deg] = Math.abs(coeffs[deg]) + 1;
  return coeffs;
}

function measure(fn, poly, iterations) {
  const start = process.hrtime.bigint();
  for (let i = 0; i < iterations; i++) fn(poly);
  return Number(process.hrtime.bigint() - start) / 1e6;
}

function benchmark(degree, iterations) {
  const poly = randomPolynomial(degree);
  const naive = measure(positiveGlobalMinimizer, poly, iterations);
  const jt = measure(positiveGlobalMinimizerJT, poly, iterations);
  const dk = measure(positiveGlobalMinimizerDK, poly, iterations);
  return { degree, iterations, naive, jt, dk };
}

function run() {
  const degrees = [5, 10, 20, 30, 40];
  const iterations = 100;
  const results = degrees.map(d => benchmark(d, iterations));
  for (const r of results) {
    console.log(`Degree ${r.degree} over ${r.iterations} runs`);
    console.log(`  Naive: ${r.naive.toFixed(2)} ms`);
    console.log(`  Jenkins-Traub: ${r.jt.toFixed(2)} ms`);
    console.log(`  Durand-Kerner: ${r.dk.toFixed(2)} ms`);
  }
}

run();
