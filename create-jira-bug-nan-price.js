const https = require('https');

// JIRA Configuration
const JIRA_CONFIG = {
  baseURL: 'https://galagames.atlassian.net',
  email: 'Skhalil@gala.games',
  apiToken: process.env.JIRA_API_TOKEN || '',  // Set via environment variable
  projectKey: 'GW'
};

// Create JIRA ticket for Price NaN% bug
async function createJIRATicket() {
  const ticketData = {
    fields: {
      project: {
        key: JIRA_CONFIG.projectKey
      },
      summary: '[BUG] Price Percentage Change Displays "NaN%" on Token Detail Page',
      description: {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Bug Summary' }]
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'The price percentage change indicator displays "+NaN%" instead of a valid percentage value on newly created token detail pages.'
              }
            ]
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Environment' }]
          },
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [{
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Environment: TEST1 (https://lpad-frontend-test1.defi.gala.com/)' }]
                }]
              },
              {
                type: 'listItem',
                content: [{
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Component: Token Detail Page / Price Display' }]
                }]
              },
              {
                type: 'listItem',
                content: [{
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Browser: Chrome/Chromium' }]
                }]
              }
            ]
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Steps to Reproduce' }]
          },
          {
            type: 'orderedList',
            content: [
              {
                type: 'listItem',
                content: [{
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Navigate to https://lpad-frontend-test1.defi.gala.com/' }]
                }]
              },
              {
                type: 'listItem',
                content: [{
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Create a new token via the Launch page OR use SDK to launch token' }]
                }]
              },
              {
                type: 'listItem',
                content: [{
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Navigate to the token detail page (e.g., /buy-sell/testlaunch01)' }]
                }]
              },
              {
                type: 'listItem',
                content: [{
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Observe the Price section in the token info panel' }]
                }]
              }
            ]
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Actual Result' }]
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'The price display shows:' }]
          },
          {
            type: 'codeBlock',
            attrs: { language: 'text' },
            content: [{
              type: 'text',
              text: 'Price  +NaN%\n0.00002 GALA'
            }]
          },
          {
            type: 'paragraph',
            content: [{
              type: 'text',
              text: 'The "+NaN%" indicator is invalid and appears unprofessional to users.',
              marks: [{ type: 'strong' }]
            }]
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Expected Result' }]
          },
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [{
                  type: 'paragraph',
                  content: [{ type: 'text', text: '"0%" for newly created tokens with no price history' }]
                }]
              },
              {
                type: 'listItem',
                content: [{
                  type: 'paragraph',
                  content: [{ type: 'text', text: '"+X.XX%" or "-X.XX%" for tokens with price movement' }]
                }]
              },
              {
                type: 'listItem',
                content: [{
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'OR hide the percentage entirely if no historical data is available' }]
                }]
              }
            ]
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Root Cause Analysis' }]
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'The percentage calculation is likely performing a division operation where previousPrice is 0, null, or undefined:' }]
          },
          {
            type: 'codeBlock',
            attrs: { language: 'javascript' },
            content: [{
              type: 'text',
              text: '// Buggy calculation\nconst priceChange = ((currentPrice - previousPrice) / previousPrice) * 100;\n// When previousPrice = 0 or undefined → Result is NaN'
            }]
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Suggested Fix' }]
          },
          {
            type: 'codeBlock',
            attrs: { language: 'javascript' },
            content: [{
              type: 'text',
              text: 'const calculatePriceChange = (current, previous) => {\n  if (!previous || previous === 0 || !current) {\n    return null; // or 0\n  }\n  return ((current - previous) / previous) * 100;\n};\n\n// In render\n{priceChange !== null && !isNaN(priceChange) ? (\n  <span className={priceChange >= 0 ? \'positive\' : \'negative\'}>\n    {priceChange >= 0 ? \'+\' : \'\'}{priceChange.toFixed(2)}%\n  </span>\n) : null}'
            }]
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Affected Token (Test Case)' }]
          },
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [{
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Token Name: testlaunch01' }]
                }]
              },
              {
                type: 'listItem',
                content: [{
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Token Symbol: TLAUNCH' }]
                }]
              },
              {
                type: 'listItem',
                content: [{
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'URL: https://lpad-frontend-test1.defi.gala.com/buy-sell/testlaunch01' }]
                }]
              },
              {
                type: 'listItem',
                content: [{
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Transaction ID: 74156765-c94e-4f56-8e0d-33ab963a7530' }]
                }]
              }
            ]
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Acceptance Criteria' }]
          },
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [{
                  type: 'paragraph',
                  content: [{ type: 'text', text: '[ ] Price percentage should NOT display "NaN%"' }]
                }]
              },
              {
                type: 'listItem',
                content: [{
                  type: 'paragraph',
                  content: [{ type: 'text', text: '[ ] Newly created tokens should show "0%" or hide percentage' }]
                }]
              },
              {
                type: 'listItem',
                content: [{
                  type: 'paragraph',
                  content: [{ type: 'text', text: '[ ] Tokens with price history should show accurate percentage' }]
                }]
              },
              {
                type: 'listItem',
                content: [{
                  type: 'paragraph',
                  content: [{ type: 'text', text: '[ ] Add unit tests for edge cases (zero, null, undefined prices)' }]
                }]
              }
            ]
          }
        ]
      },
      issuetype: {
        name: 'Bug'
      },
      priority: {
        name: 'High'
      },
      labels: ['ui-bug', 'price-display', 'launchpad', 'test1', 'frontend', 'NaN-error']
    }
  };

  const postData = JSON.stringify(ticketData);
  
  const options = {
    hostname: 'galagames.atlassian.net',
    port: 443,
    path: '/rest/api/3/issue',
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(JIRA_CONFIG.email + ':' + JIRA_CONFIG.apiToken).toString('base64'),
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const response = JSON.parse(data);
          console.log('');
          console.log('╔════════════════════════════════════════════════════════════╗');
          console.log('║           ✅ JIRA TICKET CREATED SUCCESSFULLY!             ║');
          console.log('╠════════════════════════════════════════════════════════════╣');
          console.log(`║  🎫 Ticket Key:  ${response.key.padEnd(40)}║`);
          console.log(`║  🔗 URL: https://galagames.atlassian.net/browse/${response.key}  ║`);
          console.log('╚════════════════════════════════════════════════════════════╝');
          console.log('');
          resolve(response);
        } else {
          console.error('');
          console.error('❌ Failed to create JIRA ticket');
          console.error('Status Code:', res.statusCode);
          console.error('Response:', data);
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Execute
console.log('');
console.log('🐛 Creating JIRA Bug Ticket...');
console.log('   Summary: Price Percentage Displays "NaN%"');
console.log('   Severity: High');
console.log('   Component: Token Detail Page');
console.log('');

createJIRATicket()
  .then((response) => {
    console.log('📋 Ticket Details:');
    console.log(`   - Project: ${JIRA_CONFIG.projectKey}`);
    console.log('   - Type: Bug');
    console.log('   - Priority: High');
    console.log('   - Labels: ui-bug, price-display, launchpad, test1, frontend, NaN-error');
    console.log('');
  })
  .catch((error) => {
    console.error('❌ Error creating JIRA ticket:', error.message);
    process.exit(1);
  });
