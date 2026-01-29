const { execSync } = require('child_process');
const fs = require('fs');

console.log('🧪 Running Failed Tests Only\n');
console.log('============================\n');

// The 3 specific failed tests from our previous run
const failedTests = [
  {
    name: 'Image Upload Field Visibility',
    testName: 'should navigate to Launch page and verify form elements',
    jiraTicket: 'GW-44',
    priority: 'HIGH'
  },
  {
    name: 'Image Format Validation',
    testName: 'should accept valid image formats',
    jiraTicket: 'GW-45',
    priority: 'MEDIUM'
  },
  {
    name: 'Complete Launch Flow',
    testName: 'should successfully launch token with valid data',
    jiraTicket: 'GW-46',
    priority: 'HIGH'
  }
];

async function runSpecificTest(testName, description, jiraTicket, priority) {
  console.log(`🔍 Testing: ${description}`);
  console.log(`🎫 JIRA: ${jiraTicket} (${priority} Priority)`);
  console.log(`📝 Test: "${testName}"`);
  console.log('─'.repeat(50));

  try {
    // Run the specific test
    const command = `npx playwright test tests/launch-page.spec.ts --config=playwright-fast.config.ts --grep "${testName}" --reporter=json --output=test-result-${jiraTicket.toLowerCase()}.json`;
    
    console.log('⏳ Running test...');
    const startTime = Date.now();
    
    const result = execSync(command, { 
      encoding: 'utf8',
      timeout: 120000, // 2 minute timeout
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(`✅ Test PASSED in ${duration}s`);
    console.log(`📊 Status: RESOLVED - Issue may have been fixed!`);
    
    return {
      test: testName,
      jiraTicket,
      status: 'PASSED',
      duration: duration,
      resolved: true
    };
    
  } catch (error) {
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(`❌ Test FAILED in ${duration}s`);
    console.log(`📊 Status: Still failing - JIRA ticket ${jiraTicket} is still valid`);
    
    // Try to extract meaningful error information
    const errorOutput = error.stderr || error.stdout || error.message;
    const errorLines = errorOutput.split('\n').slice(0, 5); // First 5 lines
    console.log(`🔍 Error preview:`);
    errorLines.forEach(line => {
      if (line.trim()) console.log(`   ${line.trim()}`);
    });
    
    return {
      test: testName,
      jiraTicket,
      status: 'FAILED',
      duration: duration,
      resolved: false,
      error: errorOutput.substring(0, 500) // First 500 chars of error
    };
  }
  
  console.log('\n');
}

async function runAllFailedTests() {
  console.log(`📋 Running ${failedTests.length} previously failed tests...\n`);
  
  const results = [];
  
  for (let i = 0; i < failedTests.length; i++) {
    const test = failedTests[i];
    console.log(`[${i + 1}/${failedTests.length}] `);
    
    const result = await runSpecificTest(
      test.testName,
      test.name,
      test.jiraTicket,
      test.priority
    );
    
    results.push(result);
    
    // Add delay between tests
    if (i < failedTests.length - 1) {
      console.log('⏱️  Waiting 2 seconds before next test...\n');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Generate summary
  console.log('\n📊 FAILED TESTS RERUN SUMMARY');
  console.log('===============================');
  
  const passed = results.filter(r => r.status === 'PASSED');
  const failed = results.filter(r => r.status === 'FAILED');
  
  console.log(`✅ Now Passing: ${passed.length}/${results.length} tests`);
  console.log(`❌ Still Failing: ${failed.length}/${results.length} tests`);
  console.log(`🎯 Resolution Rate: ${Math.round((passed.length / results.length) * 100)}%\n`);
  
  if (passed.length > 0) {
    console.log('🎉 RESOLVED ISSUES:');
    passed.forEach((test, index) => {
      console.log(`${index + 1}. ${test.jiraTicket} - Test now passes! ✅`);
      console.log(`   Duration: ${test.duration}s`);
      console.log(`   Action: Consider closing JIRA ticket\n`);
    });
  }
  
  if (failed.length > 0) {
    console.log('⚠️  STILL FAILING:');
    failed.forEach((test, index) => {
      console.log(`${index + 1}. ${test.jiraTicket} - Still needs attention ❌`);
      console.log(`   Duration: ${test.duration}s`);
      console.log(`   Action: JIRA ticket remains valid\n`);
    });
  }
  
  // Save results to file
  const summaryData = {
    timestamp: new Date().toISOString(),
    totalTests: results.length,
    passed: passed.length,
    failed: failed.length,
    resolutionRate: Math.round((passed.length / results.length) * 100),
    results: results
  };
  
  fs.writeFileSync('failed-tests-rerun-results.json', JSON.stringify(summaryData, null, 2));
  console.log('💾 Results saved to: failed-tests-rerun-results.json');
  
  return results;
}

// Run the tests
runAllFailedTests()
  .then((results) => {
    const failed = results.filter(r => r.status === 'FAILED');
    console.log('\n🏁 Rerun completed!');
    
    if (failed.length === 0) {
      console.log('🎉 All previously failed tests are now passing!');
      process.exit(0);
    } else {
      console.log(`⚠️  ${failed.length} test(s) still failing - JIRA tickets remain valid.`);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('💥 Error during test rerun:', error.message);
    process.exit(1);
  });
