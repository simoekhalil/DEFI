/**
 * Analyze the bonding curve data to determine the correct mathematical formula
 */

// Data points from the spreadsheet
const dataPoints = [
  { supply: 100000, price: 31.2750343 },
  { supply: 200000, price: 90.373179 },
  { supply: 300000, price: 322.1326362 },
  { supply: 400000, price: 933.837364 },
  { supply: 500000, price: 2317.347211 },
  { supply: 1000000, price: 31741.65481 },
  { supply: 5000000, price: 9348.46001 },
  { supply: 9000000, price: 35586.8634 }
];

console.log('🔍 Analyzing Bonding Curve Data Points');
console.log('='.repeat(60));

// Let's try to reverse engineer the formula
// If v = a * s^b, then log(v) = log(a) + b * log(s)
// We can use linear regression on the log values

const logData = dataPoints.map(point => ({
  logSupply: Math.log(point.supply),
  logPrice: Math.log(point.price),
  supply: point.supply,
  price: point.price
}));

console.log('Data points with logarithms:');
logData.forEach(point => {
  console.log(`Supply: ${point.supply.toLocaleString()}, Price: ${point.price.toFixed(6)}, log(S): ${point.logSupply.toFixed(4)}, log(P): ${point.logPrice.toFixed(4)}`);
});

// Calculate linear regression for log(price) vs log(supply)
const n = logData.length;
const sumLogS = logData.reduce((sum, point) => sum + point.logSupply, 0);
const sumLogP = logData.reduce((sum, point) => sum + point.logPrice, 0);
const sumLogSLogP = logData.reduce((sum, point) => sum + point.logSupply * point.logPrice, 0);
const sumLogS2 = logData.reduce((sum, point) => sum + point.logSupply * point.logSupply, 0);

const slope = (n * sumLogSLogP - sumLogS * sumLogP) / (n * sumLogS2 - sumLogS * sumLogS);
const intercept = (sumLogP - slope * sumLogS) / n;

const a = Math.exp(intercept);
const b = slope;

console.log('\n' + '='.repeat(60));
console.log('Calculated Formula Parameters:');
console.log('='.repeat(60));
console.log(`Formula: v = a * s^b`);
console.log(`a (coefficient): ${a.toExponential(6)}`);
console.log(`b (exponent): ${b.toFixed(6)}`);

// Test the calculated formula
console.log('\n' + '='.repeat(60));
console.log('Testing Calculated Formula:');
console.log('='.repeat(60));

let totalError = 0;
let maxError = 0;

dataPoints.forEach(point => {
  const calculatedPrice = a * Math.pow(point.supply, b);
  const error = Math.abs(calculatedPrice - point.price);
  const errorPercent = (error / point.price) * 100;
  
  totalError += errorPercent;
  maxError = Math.max(maxError, errorPercent);
  
  console.log(`Supply: ${point.supply.toLocaleString()}`);
  console.log(`  Expected: ${point.price.toFixed(6)}`);
  console.log(`  Calculated: ${calculatedPrice.toFixed(6)}`);
  console.log(`  Error: ${errorPercent.toFixed(2)}%`);
  console.log('');
});

const avgError = totalError / dataPoints.length;

console.log('='.repeat(60));
console.log('Formula Accuracy:');
console.log('='.repeat(60));
console.log(`Average Error: ${avgError.toFixed(2)}%`);
console.log(`Maximum Error: ${maxError.toFixed(2)}%`);

if (avgError < 5) {
  console.log('✅ Formula is accurate (< 5% average error)');
} else {
  console.log('❌ Formula needs refinement (> 5% average error)');
}

// Let's also try the original formula from the documentation
console.log('\n' + '='.repeat(60));
console.log('Testing Original Formula: v = a * s^(1 + b^-1)');
console.log('='.repeat(60));

const origA = 1.6507e-5;
const origB = 1.6507e-6;
const origExponent = 1 + (1 / origB);

console.log(`Original a: ${origA.toExponential(6)}`);
console.log(`Original b: ${origB.toExponential(6)}`);
console.log(`Original exponent: ${origExponent.toFixed(2)}`);

let origTotalError = 0;
let origMaxError = 0;

dataPoints.forEach(point => {
  const calculatedPrice = origA * Math.pow(point.supply, origExponent);
  const error = Math.abs(calculatedPrice - point.price);
  const errorPercent = (error / point.price) * 100;
  
  origTotalError += errorPercent;
  origMaxError = Math.max(origMaxError, errorPercent);
  
  console.log(`Supply: ${point.supply.toLocaleString()}`);
  console.log(`  Expected: ${point.price.toFixed(6)}`);
  console.log(`  Calculated: ${isFinite(calculatedPrice) ? calculatedPrice.toFixed(6) : 'Infinity'}`);
  console.log(`  Error: ${isFinite(calculatedPrice) ? errorPercent.toFixed(2) : 'Infinite'}%`);
  console.log('');
});

console.log('='.repeat(60));
console.log('RECOMMENDATION:');
console.log('='.repeat(60));

if (avgError < origTotalError / dataPoints.length) {
  console.log('✅ Use the calculated formula: v = a * s^b');
  console.log(`   where a = ${a.toExponential(6)} and b = ${b.toFixed(6)}`);
} else {
  console.log('✅ Use the original formula with corrections');
}
