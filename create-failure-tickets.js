const https = require('https');
const fs = require('fs');

// JIRA Configuration
const JIRA_CONFIG = {
  baseURL: 'https://galagames.atlassian.net',
  username: 'Skhalil',
  email: 'Skhalil@gala.games',
  apiToken: process.env.JIRA_API_TOKEN || '',  // Set via environment variable
  projectKey: 'GW'
};

// Test failure tickets data
const testFailures = [
  {
    summary: 'Test Failure: Image Upload Field Hidden - File Input Not Visible on Launch Page',
    priority: 'High',
    labels: ['image-upload', 'launch-page', 'ui-bug', 'test-failure', 'web3', 'defi'],
    description: {
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'The image upload field on the Launch page is present in the DOM but hidden from users, causing test failures and preventing users from uploading token images.'
            }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [
            {
              type: 'text',
              text: 'Test Failure Details'
            }
          ]
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: '❌ Test: "should navigate to Launch page and verify form elements"'
                    }
                  ]
                }
              ]
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: '📁 File: tests/launch-page.spec.ts:24'
                    }
                  ]
                }
              ]
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: '🔍 Locator: input[type="file"], [data-testid*="image"], [data-testid*="upload"]'
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [
            {
              type: 'text',
              text: 'Technical Analysis'
            }
          ]
        },
        {
          type: 'codeBlock',
          attrs: { language: 'text' },
          content: [
            {
              type: 'text',
              text: 'Error: expect(locator).toBeVisible() failed\n\nLocator: input[type="file"]\nExpected: visible\nReceived: hidden\nTimeout: 5000ms\n\nElement found: <input type="file" name="image" id="launchimage" accept="image/*"/>\nIssue: Element has CSS property visibility: hidden or display: none'
            }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [
            {
              type: 'text',
              text: 'Impact'
            }
          ]
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: '🚫 Users cannot upload token images during launch process'
                    }
                  ]
                }
              ]
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: '🧪 Automated tests failing (1/43 tests affected)'
                    }
                  ]
                }
              ]
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: '💼 Poor user experience for token creators'
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [
            {
              type: 'text',
              text: 'Recommended Actions'
            }
          ]
        },
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Investigate CSS styles affecting the file input visibility'
                    }
                  ]
                }
              ]
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Remove or modify CSS rules that hide the input[type="file"] element'
                    }
                  ]
                }
              ]
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Test the fix across different browsers and devices'
                    }
                  ]
                }
              ]
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Verify automated tests pass after the fix'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  },
  {
    summary: 'Test Failure: Image Format Validation Mismatch - Generic Accept vs Specific Extensions',
    priority: 'Medium',
    labels: ['image-validation', 'launch-page', 'form-validation', 'test-failure', 'web3'],
    description: {
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'The image upload field uses generic "image/*" accept attribute instead of specific file extensions, causing a mismatch between test expectations and actual implementation.'
            }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [
            {
              type: 'text',
              text: 'Test Failure Details'
            }
          ]
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: '❌ Test: "should accept valid image formats (JPG, JPEG, PNG)"'
                    }
                  ]
                }
              ]
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: '📁 File: tests/launch-page.spec.ts:48'
                    }
                  ]
                }
              ]
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: '🔍 Expected: /\\.(jpg|jpeg|png)/i pattern'
                    }
                  ]
                }
              ]
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: '📄 Actual: "image/*" attribute'
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [
            {
              type: 'text',
              text: 'Technical Analysis'
            }
          ]
        },
        {
          type: 'codeBlock',
          attrs: { language: 'text' },
          content: [
            {
              type: 'text',
              text: 'Error: expect(received).toMatch(expected)\n\nExpected pattern: /\\.(jpg|jpeg|png)/i\nReceived string: "image/*"\n\nCurrent HTML: <input type="file" accept="image/*" />\nExpected HTML: <input type="file" accept=".jpg,.jpeg,.png" />'
            }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [
            {
              type: 'text',
              text: 'Impact'
            }
          ]
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: '🧪 Test suite failure (1/43 tests affected)'
                    }
                  ]
                }
              ]
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: '📋 Inconsistency between requirements and implementation'
                    }
                  ]
                }
              ]
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: '⚠️ Potential for users to upload unsupported formats'
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [
            {
              type: 'text',
              text: 'Resolution Options'
            }
          ]
        },
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Option 1: Update HTML to use specific extensions: accept=".jpg,.jpeg,.png"'
                    }
                  ]
                }
              ]
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Option 2: Update test to expect generic "image/*" pattern'
                    }
                  ]
                }
              ]
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Option 3: Implement JavaScript validation for specific formats'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  },
  {
    summary: 'Test Failure: Launch Flow Navigation - Form Submission Does Not Redirect to Token Page',
    priority: 'High',
    labels: ['launch-flow', 'navigation', 'form-submission', 'test-failure', 'web3', 'defi'],
    description: {
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'After successfully filling and submitting the token launch form, users remain on the launch page instead of being redirected to the token detail page, breaking the expected user flow.'
            }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [
            {
              type: 'text',
              text: 'Test Failure Details'
            }
          ]
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: '❌ Test: "should successfully launch token with valid data"'
                    }
                  ]
                }
              ]
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: '📁 File: tests/launch-page.spec.ts:402'
                    }
                  ]
                }
              ]
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: '🔍 Expected URL: Contains "token" or "detail"'
                    }
                  ]
                }
              ]
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: '📄 Actual URL: https://lpad-frontend-dev1.defi.gala.com/launch'
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [
            {
              type: 'text',
              text: 'Technical Analysis'
            }
          ]
        },
        {
          type: 'codeBlock',
          attrs: { language: 'text' },
          content: [
            {
              type: 'text',
              text: 'Error: expect(received).toContain(expected)\n\nExpected substring: "token"\nReceived string: "https://lpad-frontend-dev1.defi.gala.com/launch"\n\nFlow Analysis:\n1. ✅ User navigates to launch page\n2. ✅ Form fields are filled successfully\n3. ✅ Form submission appears to work\n4. ❌ No redirect to token detail page occurs\n5. ❌ User remains on /launch URL'
            }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [
            {
              type: 'text',
              text: 'Impact'
            }
          ]
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: '🚫 Broken user experience - users don\'t see their created token'
                    }
                  ]
                }
              ]
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: '💼 Critical business flow failure - token launch completion unclear'
                    }
                  ]
                }
              ]
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: '🧪 End-to-end test failure (1/43 tests affected)'
                    }
                  ]
                }
              ]
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: '📊 Potential impact on conversion rates and user retention'
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [
            {
              type: 'text',
              text: 'Investigation Required'
            }
          ]
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: '🔍 Check form submission handler implementation'
                    }
                  ]
                }
              ]
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: '🔍 Verify API response handling after token creation'
                    }
                  ]
                }
              ]
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: '🔍 Check if navigation logic exists but is failing'
                    }
                  ]
                }
              ]
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: '🔍 Review error handling and success callbacks'
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [
            {
              type: 'text',
              text: 'Recommended Actions'
            }
          ]
        },
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Implement proper navigation after successful token creation'
                    }
                  ]
                }
              ]
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Add redirect to token detail page: /token/{tokenId} or /detail/{tokenId}'
                    }
                  ]
                }
              ]
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Include success feedback to user before redirect'
                    }
                  ]
                }
              ]
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Test the complete flow across different scenarios'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  }
];

// Function to create a single JIRA ticket
async function createJIRATicket(ticketData) {
  const postData = JSON.stringify({
    fields: {
      project: {
        key: JIRA_CONFIG.projectKey
      },
      summary: ticketData.summary,
      description: ticketData.description,
      issuetype: {
        name: 'Bug'
      },
      priority: {
        name: ticketData.priority
      },
      labels: ticketData.labels
    }
  });
  
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
          resolve(response);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Main function to create all tickets
async function createAllFailureTickets() {
  console.log('🎫 Creating JIRA tickets for test failures...\n');
  
  const results = [];
  
  for (let i = 0; i < testFailures.length; i++) {
    const failure = testFailures[i];
    console.log(`📝 Creating ticket ${i + 1}/3: ${failure.summary.substring(0, 60)}...`);
    
    try {
      const response = await createJIRATicket(failure);
      const ticketUrl = `https://galagames.atlassian.net/browse/${response.key}`;
      
      console.log(`✅ Ticket ${i + 1} Created Successfully!`);
      console.log(`   🎫 Key: ${response.key}`);
      console.log(`   🔗 URL: ${ticketUrl}`);
      console.log(`   🏷️  Priority: ${failure.priority}`);
      console.log(`   📋 Labels: ${failure.labels.join(', ')}\n`);
      
      results.push({
        success: true,
        key: response.key,
        url: ticketUrl,
        summary: failure.summary,
        priority: failure.priority
      });
      
      // Add delay between requests to avoid rate limiting
      if (i < testFailures.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`❌ Failed to create ticket ${i + 1}:`, error.message);
      results.push({
        success: false,
        error: error.message,
        summary: failure.summary
      });
    }
  }
  
  // Summary
  console.log('📊 JIRA Ticket Creation Summary');
  console.log('================================');
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successfully created: ${successful.length}/3 tickets`);
  console.log(`❌ Failed to create: ${failed.length}/3 tickets\n`);
  
  if (successful.length > 0) {
    console.log('🎫 Created Tickets:');
    successful.forEach((ticket, index) => {
      console.log(`${index + 1}. ${ticket.key} - ${ticket.priority} Priority`);
      console.log(`   ${ticket.url}`);
      console.log(`   ${ticket.summary.substring(0, 80)}...\n`);
    });
  }
  
  if (failed.length > 0) {
    console.log('❌ Failed Tickets:');
    failed.forEach((ticket, index) => {
      console.log(`${index + 1}. ${ticket.summary.substring(0, 80)}...`);
      console.log(`   Error: ${ticket.error}\n`);
    });
  }
  
  console.log(`📋 Total Test Failures Addressed: ${successful.length}/3`);
  console.log(`🎯 Success Rate: ${Math.round((successful.length / testFailures.length) * 100)}%`);
}

// Execute the ticket creation
createAllFailureTickets()
  .then(() => {
    console.log('\n🏁 JIRA ticket creation process completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error in ticket creation process:', error.message);
    process.exit(1);
  });
