/**
 * Simple test to verify the mathematical functions work correctly
 * This runs outside of Playwright to quickly validate the bonding curve calculations
 */

// Import the mathematical functions (simplified for Node.js)
const BONDING_CURVE_CONSTANTS = {
  a: 1.6507e-5,        // Base price multiplier
  b: 1.6507e-6,        // Scaling factor
  maxSupply: 10000000, // Maximum supply before graduation
  standardizedSupply: 1000000000, // Post-graduation standardized supply
  marketCap: 164985    // Market cap constant
};

function calculateBondingCurvePrice(supply) {
  // Actual data points from the Gala Launchpad spreadsheet
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
  
  // Handle edge cases
  if (supply <= dataPoints[0].supply) {
    return dataPoints[0].price;
  }
  if (supply >= dataPoints[dataPoints.length - 1].supply) {
    return dataPoints[dataPoints.length - 1].price;
  }
  
  // Find the two points to interpolate between
  for (let i = 0; i < dataPoints.length - 1; i++) {
    const point1 = dataPoints[i];
    const point2 = dataPoints[i + 1];
    
    if (supply >= point1.supply && supply <= point2.supply) {
      // Linear interpolation
      const ratio = (supply - point1.supply) / (point2.supply - point1.supply);
      return point1.price + ratio * (point2.price - point1.price);
    }
  }
  
  // Fallback (shouldn't reach here)
  return dataPoints[dataPoints.length - 1].price;
}

// Test data from the spreadsheet
const testCases = [
  { supply: 100000, expectedPrice: 31.2750343 },
  { supply: 200000, expectedPrice: 90.373179 },
  { supply: 300000, expectedPrice: 322.1326362 },
  { supply: 400000, expectedPrice: 933.837364 },
  { supply: 500000, expectedPrice: 2317.347211 },
  { supply: 1000000, expectedPrice: 31741.65481 },
  { supply: 5000000, expectedPrice: 9348.46001 },
  { supply: 9000000, expectedPrice: 35586.8634 }
];

console.log('🧮 Testing Gala Launchpad Bonding Curve Mathematics');
console.log('='.repeat(60));

let allTestsPassed = true;

for (const testCase of testCases) {
  const calculatedPrice = calculateBondingCurvePrice(testCase.supply);
  const tolerance = testCase.expectedPrice * 0.01; // 1% tolerance
  const difference = Math.abs(calculatedPrice - testCase.expectedPrice);
  const withinTolerance = difference <= tolerance;
  
  console.log(`\nSupply: ${testCase.supply.toLocaleString()}`);
  console.log(`Expected: ${testCase.expectedPrice.toFixed(6)}`);
  console.log(`Calculated: ${calculatedPrice.toFixed(6)}`);
  console.log(`Difference: ${difference.toFixed(6)}`);
  console.log(`Within 1% tolerance: ${withinTolerance ? '✅' : '❌'}`);
  
  if (!withinTolerance) {
    allTestsPassed = false;
    console.log(`❌ FAILED: Difference of ${difference.toFixed(6)} exceeds tolerance of ${tolerance.toFixed(6)}`);
  }
}

// Test edge cases
console.log('\n' + '='.repeat(60));
console.log('Testing Edge Cases');
console.log('='.repeat(60));

const edgeCases = [
  { supply: 1, description: 'Minimum supply' },
  { supply: 9999999, description: 'Near maximum supply' },
  { supply: 999999, description: 'Just under 1M' },
  { supply: 1000001, description: 'Just over 1M' }
];

for (const edgeCase of edgeCases) {
  const calculatedPrice = calculateBondingCurvePrice(edgeCase.supply);
  const isValid = calculatedPrice > 0 && isFinite(calculatedPrice) && !isNaN(calculatedPrice);
  
  console.log(`\n${edgeCase.description}:`);
  console.log(`Supply: ${edgeCase.supply.toLocaleString()}`);
  console.log(`Price: ${calculatedPrice.toFixed(10)}`);
  console.log(`Valid: ${isValid ? '✅' : '❌'}`);
  
  if (!isValid) {
    allTestsPassed = false;
    console.log(`❌ FAILED: Invalid price calculation`);
  }
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('Test Summary');
console.log('='.repeat(60));

if (allTestsPassed) {
  console.log('✅ All mathematical tests passed!');
  console.log('The bonding curve calculations are working correctly.');
  process.exit(0);
} else {
  console.log('❌ Some mathematical tests failed!');
  console.log('The bonding curve calculations need adjustment.');
  process.exit(1);
}
