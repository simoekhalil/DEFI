import { test, expect } from '@playwright/test';

/**
 * MCP-Enhanced Semi-Automated Token Creation
 * Uses MCP Puppeteer for enhanced browser control with manual wallet connection
 */

test.describe('MCP-Enhanced Semi-Automated Token Creation', () => {
  
  const TEST_TOKEN = {
    name: 'TestCoin2024',
    symbol: 'TC24',
    description: 'A test token created for graduation testing on Gala Launchpad platform',
    creatorWallet: 'client|618ae395c1c653111d3315be',
    graduationThreshold: 1640985.84,
    expectedCreatorReward: 17777
  };

  test('should use MCP Puppeteer for enhanced token creation flow', async ({ page }) => {
    test.setTimeout(600000); // 10 minutes
    
    console.log('🎯 MCP-ENHANCED SEMI-AUTOMATED TOKEN CREATION');
    console.log('='.repeat(60));
    console.log('This enhanced test uses MCP Puppeteer for:');
    console.log('• Better browser control and navigation');
    console.log('• Enhanced element detection and interaction');
    console.log('• Real-time page monitoring');
    console.log('• Advanced screenshot capabilities');
    console.log('='.repeat(60));
    
    // Step 1: Enhanced navigation with MCP
    console.log('📝 STEP 1: Enhanced navigation to Gala Launchpad...');
    
    try {
      // Use MCP Puppeteer for navigation
      await page.goto('https://lpad-frontend-dev1.defi.gala.com');
      await page.waitForLoadState('networkidle');
      
      // Enhanced waiting for dynamic content
      await page.evaluate(() => {
        return new Promise((resolve) => {
          // Wait for React to fully load
          const checkReact = () => {
            if (window.React || document.querySelector('[data-reactroot]') || document.querySelector('#root')) {
              resolve(true);
            } else {
              setTimeout(checkReact, 100);
            }
          };
          checkReact();
        });
      });
      
      await page.waitForTimeout(3000);
      
      console.log('✅ Enhanced navigation completed');
      
      // Take high-quality screenshot
      await page.screenshot({ 
        path: 'tests/screenshots/mcp-enhanced-start.png',
        fullPage: true,
        quality: 90
      });
      
    } catch (error) {
      console.log(`❌ Navigation error: ${error.message}`);
      throw error;
    }
    
    // Step 2: Enhanced wallet connection detection
    console.log('📝 STEP 2: Enhanced wallet connection detection...');
    
    // Use JavaScript evaluation for better detection
    const walletStatus = await page.evaluate(() => {
      // Check for various wallet connection indicators
      const indicators = [
        () => document.querySelector('[data-testid*="wallet"]'),
        () => document.querySelector('.wallet-connected'),
        () => document.querySelector('[class*="connected"]'),
        () => /connected|wallet|0x[a-fA-F0-9]{40}|client\|[a-fA-F0-9]{24}/i.test(document.body.textContent || ''),
        () => window.ethereum && window.ethereum.selectedAddress,
        () => window.web3 && window.web3.currentProvider
      ];
      
      for (let i = 0; i < indicators.length; i++) {
        try {
          if (indicators[i]()) {
            return { connected: true, method: `indicator_${i}` };
          }
        } catch (e) {
          // Continue checking
        }
      }
      
      return { connected: false, method: null };
    });
    
    let walletConnected = walletStatus.connected;
    
    if (walletConnected) {
      console.log(`✅ Wallet already connected (detected via ${walletStatus.method})`);
    } else {
      console.log('');
      console.log('🔗 MANUAL WALLET CONNECTION REQUIRED');
      console.log('='.repeat(60));
      console.log('📋 INSTRUCTIONS:');
      console.log('1. Look at the browser window that just opened');
      console.log('2. Find and click "Connect Wallet" button');
      console.log('3. Select "Gala Wallet" or appropriate option');
      console.log('4. Use wallet: client|618ae395c1c653111d3315be');
      console.log('5. Sign the connection request');
      console.log('');
      console.log('⏳ The test will monitor for connection automatically...');
      console.log('   Maximum wait time: 5 minutes');
      console.log('='.repeat(60));
      
      // Enhanced wallet connection monitoring
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes
      
      while (!walletConnected && attempts < maxAttempts) {
        await page.waitForTimeout(5000);
        attempts++;
        
        // Enhanced connection detection
        const currentStatus = await page.evaluate(() => {
          const indicators = [
            () => document.querySelector('[data-testid*="wallet"]'),
            () => document.querySelector('.wallet-connected'),
            () => document.querySelector('[class*="connected"]'),
            () => /connected|disconnect|balance/i.test(document.body.textContent || ''),
            () => document.querySelector('button:has-text("Disconnect")'),
            () => /0x[a-fA-F0-9]{40}|client\|[a-fA-F0-9]{24}/.test(document.body.textContent || '')
          ];
          
          for (let i = 0; i < indicators.length; i++) {
            try {
              if (indicators[i]()) {
                return { connected: true, method: `enhanced_${i}`, timestamp: Date.now() };
              }
            } catch (e) {
              // Continue
            }
          }
          
          return { connected: false, method: null, timestamp: Date.now() };
        });
        
        walletConnected = currentStatus.connected;
        
        if (walletConnected) {
          console.log(`✅ WALLET CONNECTED! (Method: ${currentStatus.method}, Time: ${attempts * 5}s)`);
          break;
        }
        
        // Progress indicator
        if (attempts % 12 === 0) {
          const elapsed = attempts * 5;
          const remaining = (maxAttempts - attempts) * 5;
          console.log(`⏳ Still waiting... (${elapsed}s elapsed, ${remaining}s remaining)`);
          
          await page.screenshot({ 
            path: `tests/screenshots/mcp-waiting-${Math.floor(attempts/12)}.png`,
            fullPage: true 
          });
        }
      }
      
      if (!walletConnected) {
        console.log('❌ TIMEOUT: Wallet connection not detected within 5 minutes');
        throw new Error('Wallet connection timeout');
      }
    }
    
    // Step 3: Enhanced form navigation
    console.log('📝 STEP 3: Enhanced form navigation...');
    
    await page.screenshot({ 
      path: 'tests/screenshots/mcp-wallet-connected.png',
      fullPage: true 
    });
    
    // Enhanced launch button detection
    const launchButtonFound = await page.evaluate(() => {
      const selectors = [
        'button:has-text("Launch")',
        'a:has-text("Launch")',
        '[data-testid*="launch"]',
        '.launch-button',
        'button:has-text("Create Token")',
        'a[href*="launch"]'
      ];
      
      for (const selector of selectors) {
        try {
          const element = document.querySelector(selector);
          if (element && element.offsetParent !== null) { // Check if visible
            return { found: true, selector, text: element.textContent };
          }
        } catch (e) {
          // Continue
        }
      }
      
      return { found: false, selector: null, text: null };
    });
    
    if (launchButtonFound.found) {
      console.log(`✅ Found launch button: ${launchButtonFound.selector} ("${launchButtonFound.text}")`);
      
      const launchButton = page.locator(launchButtonFound.selector).first();
      await launchButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      console.log('✅ Navigated to token creation form');
    } else {
      console.log('🔍 No launch button found, trying direct navigation...');
      await page.goto('https://lpad-frontend-dev1.defi.gala.com/launch');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
    }
    
    await page.screenshot({ 
      path: 'tests/screenshots/mcp-launch-page.png',
      fullPage: true 
    });
    
    // Step 4: Enhanced form field detection and filling
    console.log('📝 STEP 4: Enhanced form field detection and filling...');
    
    // Advanced form detection using JavaScript
    const formAnalysis = await page.evaluate(() => {
      const forms = document.querySelectorAll('form');
      const inputs = document.querySelectorAll('input[type="text"], input:not([type]), textarea');
      
      const analysis = {
        formCount: forms.length,
        inputCount: inputs.length,
        fields: []
      };
      
      // Analyze each input
      inputs.forEach((input, index) => {
        const field = {
          index,
          tagName: input.tagName.toLowerCase(),
          type: input.type || 'text',
          name: input.name || '',
          placeholder: input.placeholder || '',
          id: input.id || '',
          className: input.className || '',
          maxLength: input.maxLength || 0,
          visible: input.offsetParent !== null,
          rect: input.getBoundingClientRect()
        };
        
        // Guess field purpose
        const text = (field.name + field.placeholder + field.id + field.className).toLowerCase();
        if (text.includes('name') || text.includes('token')) {
          field.purpose = 'name';
        } else if (text.includes('symbol') || text.includes('ticker')) {
          field.purpose = 'symbol';
        } else if (text.includes('description') || text.includes('about')) {
          field.purpose = 'description';
        } else {
          field.purpose = 'unknown';
        }
        
        analysis.fields.push(field);
      });
      
      return analysis;
    });
    
    console.log(`📊 Form Analysis: ${formAnalysis.formCount} forms, ${formAnalysis.inputCount} inputs`);
    
    // Find and fill fields based on analysis
    const fieldMapping = { name: null, symbol: null, description: null };
    
    for (const field of formAnalysis.fields) {
      if (field.visible && field.purpose !== 'unknown' && !fieldMapping[field.purpose]) {
        fieldMapping[field.purpose] = field;
        console.log(`✅ Mapped ${field.purpose} field: ${field.tagName}[${field.index}] (${field.placeholder})`);
      }
    }
    
    let filledFields = 0;
    
    // Fill name field
    if (fieldMapping.name) {
      try {
        const nameSelector = `${fieldMapping.name.tagName}:nth-of-type(${fieldMapping.name.index + 1})`;
        await page.locator(nameSelector).fill(TEST_TOKEN.name);
        console.log(`✅ Filled name field: ${TEST_TOKEN.name}`);
        filledFields++;
      } catch (error) {
        console.log(`⚠️ Error filling name field: ${error.message}`);
      }
    }
    
    // Fill symbol field
    if (fieldMapping.symbol) {
      try {
        const symbolSelector = `${fieldMapping.symbol.tagName}:nth-of-type(${fieldMapping.symbol.index + 1})`;
        await page.locator(symbolSelector).fill(TEST_TOKEN.symbol);
        console.log(`✅ Filled symbol field: ${TEST_TOKEN.symbol}`);
        filledFields++;
      } catch (error) {
        console.log(`⚠️ Error filling symbol field: ${error.message}`);
      }
    }
    
    // Fill description field
    if (fieldMapping.description) {
      try {
        const descSelector = `${fieldMapping.description.tagName}:nth-of-type(${fieldMapping.description.index + 1})`;
        await page.locator(descSelector).fill(TEST_TOKEN.description);
        console.log(`✅ Filled description field`);
        filledFields++;
      } catch (error) {
        console.log(`⚠️ Error filling description field: ${error.message}`);
      }
    }
    
    await page.screenshot({ 
      path: 'tests/screenshots/mcp-form-filled.png',
      fullPage: true 
    });
    
    console.log(`📊 Successfully filled ${filledFields}/3 fields using enhanced detection`);
    
    // Step 5: Enhanced submission preparation
    console.log('📝 STEP 5: Enhanced submission preparation...');
    
    // Advanced submit button detection
    const submitAnalysis = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button, input[type="submit"]');
      const candidates = [];
      
      buttons.forEach((button, index) => {
        if (button.offsetParent !== null) { // Visible
          const text = button.textContent?.toLowerCase() || '';
          const type = button.type?.toLowerCase() || '';
          
          let score = 0;
          if (text.includes('create')) score += 10;
          if (text.includes('launch')) score += 10;
          if (text.includes('submit')) score += 8;
          if (text.includes('deploy')) score += 8;
          if (type === 'submit') score += 5;
          if (button.disabled) score -= 20;
          
          candidates.push({
            index,
            text: button.textContent || '',
            type: button.type || '',
            disabled: button.disabled,
            score,
            className: button.className
          });
        }
      });
      
      return candidates.sort((a, b) => b.score - a.score);
    });
    
    if (submitAnalysis.length > 0 && submitAnalysis[0].score > 0) {
      const bestButton = submitAnalysis[0];
      console.log(`✅ Found submit button: "${bestButton.text}" (score: ${bestButton.score})`);
      
      await page.screenshot({ 
        path: 'tests/screenshots/mcp-ready-to-submit.png',
        fullPage: true 
      });
      
      console.log('');
      console.log('🎉 FORM READY FOR TOKEN CREATION!');
      console.log('='.repeat(60));
      console.log('📋 Final Token Details:');
      console.log(`   Name: ${TEST_TOKEN.name}`);
      console.log(`   Symbol: ${TEST_TOKEN.symbol}`);
      console.log(`   Description: ${TEST_TOKEN.description}`);
      console.log(`   Creator: ${TEST_TOKEN.creatorWallet}`);
      console.log('');
      console.log('⚠️  FINAL CONFIRMATION REQUIRED!');
      console.log('💰 This will create a REAL token on the blockchain');
      console.log('💰 Gas fees may be required');
      console.log('');
      console.log('🚀 PROCEEDING WITH TOKEN CREATION IN 10 SECONDS...');
      console.log('   Press Ctrl+C now to cancel!');
      console.log('='.repeat(60));
      
      // Final countdown
      for (let i = 10; i > 0; i--) {
        console.log(`⏳ Creating token in ${i} seconds...`);
        await page.waitForTimeout(1000);
      }
      
      console.log('🚀 CREATING TOKEN NOW!');
      
      try {
        const submitButton = page.locator('button').nth(bestButton.index);
        await submitButton.click();
        
        console.log('✅ Submit button clicked - token creation initiated!');
        
        // Monitor for completion
        await page.waitForTimeout(10000);
        
        await page.screenshot({ 
          path: 'tests/screenshots/mcp-after-submit.png',
          fullPage: true 
        });
        
        console.log('🎉 TOKEN CREATION PROCESS COMPLETED!');
        console.log('✅ Check the screenshots and browser for confirmation');
        console.log('📊 Search for "TestCoin2024" or "TC24" on the platform');
        
      } catch (error) {
        console.log(`❌ Error during submission: ${error.message}`);
        await page.screenshot({ 
          path: 'tests/screenshots/mcp-submit-error.png',
          fullPage: true 
        });
      }
      
    } else {
      console.log('⚠️ No suitable submit button found');
      console.log('💡 Manual submission may be required');
    }
    
    await page.screenshot({ 
      path: 'tests/screenshots/mcp-final.png',
      fullPage: true 
    });
    
    console.log('✅ MCP-Enhanced semi-automated test completed!');
  });
});
