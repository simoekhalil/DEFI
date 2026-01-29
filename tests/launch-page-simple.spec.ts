import { test, expect } from '@playwright/test';

test.describe('Launch Page Form Validation Tests', () => {
  test('should navigate to Launch page and verify form elements', async ({ page }) => {
    // Navigate to the main page first
    await page.goto('/');
    await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000); // Wait for React to load
    
    // Look for "Launch" navigation link and click it
    const launchButton = page.locator('a[href*="launch"]').first();
    
    if (await launchButton.count() > 0) {
      console.log('Found LAUNCH A COIN button, clicking...');
      await launchButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
    } else {
      console.log('LAUNCH A COIN button not found, trying alternative selectors...');
      
      // Try alternative selectors
      const altLaunchButton = page.locator('a[href*="launch"]').first();
      if (await altLaunchButton.count() > 0) {
        console.log('Found alternative launch button, clicking...');
        await altLaunchButton.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
      } else {
        console.log('No launch button found, staying on main page for testing...');
      }
    }
    
    // Take screenshot of the launch page
    await page.screenshot({ path: 'tests/screenshots/launch-page-form.png', fullPage: true });
    
    // Verify we're on the Launch page
    const currentUrl = page.url();
    const pageTitle = await page.title();
    console.log('Current URL:', currentUrl);
    console.log('Page title:', pageTitle);
    
    // Look for form elements
    const formElements = {
      'buttons': await page.locator('button').count(),
      'inputs': await page.locator('input').count(),
      'textareas': await page.locator('textarea').count(),
      'forms': await page.locator('form').count()
    };
    
    console.log('Form elements found:', formElements);
    
    // Look for specific form fields
    const nameField = page.locator('input[placeholder*="Enter your token name"]').first();
    const symbolField = page.locator('input[placeholder*="Enter your token symbol"]').first();
    const descField = page.locator('textarea[placeholder*="Enter your description"]').first();
    const imageField = page.locator('input[type="file"], [data-testid*="image"], [data-testid*="upload"]').first();
    
    console.log('Specific form field detection:');
    console.log('- Name field found:', await nameField.count() > 0);
    console.log('- Symbol field found:', await symbolField.count() > 0);
    console.log('- Description field found:', await descField.count() > 0);
    console.log('- Image field found:', await imageField.count() > 0);
    
    // If we found form fields, test them
    if (await nameField.count() > 0) {
      console.log('Testing name field...');
      await nameField.fill('TestToken');
      const nameValue = await nameField.inputValue();
      console.log('Name field value:', nameValue);
    }
    
    if (await symbolField.count() > 0) {
      console.log('Testing symbol field...');
      await symbolField.fill('TEST');
      const symbolValue = await symbolField.inputValue();
      console.log('Symbol field value:', symbolValue);
    }
    
    if (await descField.count() > 0) {
      console.log('Testing description field...');
      await descField.fill('This is a test token description');
      const descValue = await descField.inputValue();
      console.log('Description field value:', descValue);
    }
  });

  test.describe('Token Name Validation', () => {
    test('should test token name validation rules', async ({ page }) => {
      // Navigate to main page first, then to launch page
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Try to find and click launch button
      const launchButton = page.locator('a[href*="launch"]').first();
      if (await launchButton.count() > 0) {
        await launchButton.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
      }
      
      const nameField = page.locator('input[placeholder*="Enter your token name"]').first();
      
      if (await nameField.count() > 0) {
        console.log('=== TOKEN NAME VALIDATION TESTS ===');
        
        // Test valid names (2-25 characters, alphanumeric)
        const validNames = ['AB', 'TestToken123', 'MyToken', 'Token1234567890123456789'];
        
        for (const name of validNames) {
          console.log(`Testing valid name: "${name}"`);
          await nameField.fill(name);
          await nameField.blur();
          await page.waitForTimeout(1000);
          
          // Check for validation error
          const errorMessage = page.locator('.error, .validation-error, [data-testid*="error"], .invalid').first();
          if (await errorMessage.count() > 0) {
            const errorText = await errorMessage.textContent();
            console.log(`❌ Error for valid name "${name}": ${errorText}`);
          } else {
            console.log(`✅ Valid name "${name}" accepted`);
          }
        }
        
        // Test invalid names with spaces
        console.log('Testing names with spaces...');
        await nameField.fill('Test Token');
        await nameField.blur();
        await page.waitForTimeout(1000);
        
        const spaceError = page.locator('.error, .validation-error, [data-testid*="error"], .invalid').first();
        if (await spaceError.count() > 0) {
          const errorText = await spaceError.textContent();
          console.log(`✅ Space validation working: ${errorText}`);
        } else {
          console.log('❌ Space validation not working');
        }
        
        // Test invalid names with special characters
        console.log('Testing names with special characters...');
        await nameField.fill('Test@Token');
        await nameField.blur();
        await page.waitForTimeout(1000);
        
        const specialError = page.locator('.error, .validation-error, [data-testid*="error"], .invalid').first();
        if (await specialError.count() > 0) {
          const errorText = await specialError.textContent();
          console.log(`✅ Special character validation working: ${errorText}`);
        } else {
          console.log('❌ Special character validation not working');
        }
        
        // Test too short names
        console.log('Testing too short names...');
        await nameField.fill('A');
        await nameField.blur();
        await page.waitForTimeout(1000);
        
        const shortError = page.locator('.error, .validation-error, [data-testid*="error"], .invalid').first();
        if (await shortError.count() > 0) {
          const errorText = await shortError.textContent();
          console.log(`✅ Minimum length validation working: ${errorText}`);
        } else {
          console.log('❌ Minimum length validation not working');
        }
        
        // Test too long names
        console.log('Testing too long names...');
        await nameField.fill('ThisIsAVeryLongTokenNameThatExceeds25Characters');
        await nameField.blur();
        await page.waitForTimeout(1000);
        
        const longError = page.locator('.error, .validation-error, [data-testid*="error"], .invalid').first();
        if (await longError.count() > 0) {
          const errorText = await longError.textContent();
          console.log(`✅ Maximum length validation working: ${errorText}`);
        } else {
          console.log('❌ Maximum length validation not working');
        }
        
        await page.screenshot({ path: 'tests/screenshots/name-validation-test.png', fullPage: true });
      } else {
        console.log('❌ Name field not found for validation testing');
      }
    });
  });

  test.describe('Token Symbol Validation', () => {
    test('should test token symbol validation rules', async ({ page }) => {
      // Navigate to main page first, then to launch page
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Try to find and click launch button
      const launchButton = page.locator('a[href*="launch"]').first();
      if (await launchButton.count() > 0) {
        await launchButton.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
      }
      
      const symbolField = page.locator('input[placeholder*="Enter your token symbol"]').first();
      
      if (await symbolField.count() > 0) {
        console.log('=== TOKEN SYMBOL VALIDATION TESTS ===');
        
        // Test valid symbols (1-8 characters, alphabets only)
        const validSymbols = ['A', 'AB', 'ABC', 'ABCDEFGH'];
        
        for (const symbol of validSymbols) {
          console.log(`Testing valid symbol: "${symbol}"`);
          await symbolField.fill(symbol);
          await symbolField.blur();
          await page.waitForTimeout(1000);
          
          const errorMessage = page.locator('.error, .validation-error, [data-testid*="error"], .invalid').first();
          if (await errorMessage.count() > 0) {
            const errorText = await errorMessage.textContent();
            console.log(`❌ Error for valid symbol "${symbol}": ${errorText}`);
          } else {
            console.log(`✅ Valid symbol "${symbol}" accepted`);
          }
        }
        
        // Test invalid symbols with numbers
        console.log('Testing symbols with numbers...');
        await symbolField.fill('ABC123');
        await symbolField.blur();
        await page.waitForTimeout(1000);
        
        const numberError = page.locator('.error, .validation-error, [data-testid*="error"], .invalid').first();
        if (await numberError.count() > 0) {
          const errorText = await numberError.textContent();
          console.log(`✅ Number validation working: ${errorText}`);
        } else {
          console.log('❌ Number validation not working');
        }
        
        // Test invalid symbols with spaces
        console.log('Testing symbols with spaces...');
        await symbolField.fill('A B');
        await symbolField.blur();
        await page.waitForTimeout(1000);
        
        const spaceError = page.locator('.error, .validation-error, [data-testid*="error"], .invalid').first();
        if (await spaceError.count() > 0) {
          const errorText = await spaceError.textContent();
          console.log(`✅ Space validation working: ${errorText}`);
        } else {
          console.log('❌ Space validation not working');
        }
        
        // Test too long symbols
        console.log('Testing too long symbols...');
        await symbolField.fill('ABCDEFGHI'); // 9 characters
        await symbolField.blur();
        await page.waitForTimeout(1000);
        
        const longError = page.locator('.error, .validation-error, [data-testid*="error"], .invalid').first();
        if (await longError.count() > 0) {
          const errorText = await longError.textContent();
          console.log(`✅ Maximum length validation working: ${errorText}`);
        } else {
          console.log('❌ Maximum length validation not working');
        }
        
        await page.screenshot({ path: 'tests/screenshots/symbol-validation-test.png', fullPage: true });
      } else {
        console.log('❌ Symbol field not found for validation testing');
      }
    });
  });

  test.describe('Description Validation', () => {
    test('should test description validation rules', async ({ page }) => {
      // Navigate to main page first, then to launch page
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Try to find and click launch button
      const launchButton = page.locator('a[href*="launch"]').first();
      if (await launchButton.count() > 0) {
        await launchButton.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
      }
      
      const descField = page.locator('textarea[placeholder*="Enter your description"]').first();
      
      if (await descField.count() > 0) {
        console.log('=== DESCRIPTION VALIDATION TESTS ===');
        
        // Test valid descriptions (2-250 characters, alphanumeric + special chars)
        const validDescriptions = [
          'AB', // Minimum 2 chars
          'This is a valid description with numbers 123 and special chars @#$%!',
          'A'.repeat(250) // Maximum 250 chars
        ];
        
        for (const desc of validDescriptions) {
          console.log(`Testing valid description: "${desc.substring(0, 50)}..."`);
          await descField.fill(desc);
          await descField.blur();
          await page.waitForTimeout(1000);
          
          const errorMessage = page.locator('.error, .validation-error, [data-testid*="error"], .invalid').first();
          if (await errorMessage.count() > 0) {
            const errorText = await errorMessage.textContent();
            console.log(`❌ Error for valid description: ${errorText}`);
          } else {
            console.log(`✅ Valid description accepted`);
          }
        }
        
        // Test too short descriptions
        console.log('Testing too short descriptions...');
        await descField.fill('A');
        await descField.blur();
        await page.waitForTimeout(1000);
        
        const shortError = page.locator('.error, .validation-error, [data-testid*="error"], .invalid').first();
        if (await shortError.count() > 0) {
          const errorText = await shortError.textContent();
          console.log(`✅ Minimum length validation working: ${errorText}`);
        } else {
          console.log('❌ Minimum length validation not working');
        }
        
        // Test too long descriptions
        console.log('Testing too long descriptions...');
        await descField.fill('A'.repeat(251)); // 251 characters
        await descField.blur();
        await page.waitForTimeout(1000);
        
        const longError = page.locator('.error, .validation-error, [data-testid*="error"], .invalid').first();
        if (await longError.count() > 0) {
          const errorText = await longError.textContent();
          console.log(`✅ Maximum length validation working: ${errorText}`);
        } else {
          console.log('❌ Maximum length validation not working');
        }
        
        await page.screenshot({ path: 'tests/screenshots/description-validation-test.png', fullPage: true });
      } else {
        console.log('❌ Description field not found for validation testing');
      }
    });
  });

  test.describe('Image Upload Validation', () => {
    test('should test image upload validation', async ({ page }) => {
      // Navigate to main page first, then to launch page
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Try to find and click launch button
      const launchButton = page.locator('a[href*="launch"]').first();
      if (await launchButton.count() > 0) {
        await launchButton.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
      }
      
      const imageField = page.locator('input[type="file"], [data-testid*="image"], [data-testid*="upload"]').first();
      
      if (await imageField.count() > 0) {
        console.log('=== IMAGE UPLOAD VALIDATION TESTS ===');
        
        // Check file input attributes
        const acceptAttribute = await imageField.getAttribute('accept');
        console.log('File input accept attribute:', acceptAttribute);
        
        if (acceptAttribute) {
          const acceptsJpg = acceptAttribute.includes('.jpg') || acceptAttribute.includes('.jpeg');
          const acceptsPng = acceptAttribute.includes('.png');
          console.log('Accepts JPG/JPEG:', acceptsJpg);
          console.log('Accepts PNG:', acceptsPng);
        }
        
        // Look for file size validation messages
        const sizeMessages = page.locator(':text("4MB"), :text("4 MB"), :text("size"), [data-testid*="size"]');
        const sizeCount = await sizeMessages.count();
        console.log('File size validation messages found:', sizeCount);
        
        for (let i = 0; i < sizeCount; i++) {
          const message = sizeMessages.nth(i);
          const text = await message.textContent();
          console.log(`Size message ${i + 1}: ${text}`);
        }
        
        await page.screenshot({ path: 'tests/screenshots/image-validation-test.png', fullPage: true });
      } else {
        console.log('❌ Image upload field not found for validation testing');
      }
    });
  });

  test.describe('Launch Form Features', () => {
    test('should test launch form features and options', async ({ page }) => {
      // Navigate to main page first, then to launch page
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Try to find and click launch button
      const launchButton = page.locator('a[href*="launch"]').first();
      if (await launchButton.count() > 0) {
        await launchButton.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
      }
      
      console.log('=== LAUNCH FORM FEATURES TEST ===');
      
      // Look for Initial Buy option
      const initialBuyText = page.locator(':text("Initial Buy")').first();
      if (await initialBuyText.count() > 0) {
        console.log('✅ Initial Buy text found');
        
        // Look for checkbox near the text
        const initialBuyCheckbox = page.locator('input[type="checkbox"]:near(:text("Initial Buy"))').first();
        if (await initialBuyCheckbox.count() > 0) {
          const isChecked = await initialBuyCheckbox.isChecked();
          console.log('Initial Buy checkbox default state:', isChecked ? 'checked' : 'unchecked');
        } else {
          console.log('Initial Buy text found but no checkbox nearby');
          
          // Check what type of element it is
          const elementType = await initialBuyText.evaluate(el => el.tagName);
          const elementClass = await initialBuyText.getAttribute('class');
          console.log('Initial Buy element type:', elementType, 'class:', elementClass);
        }
      } else {
        console.log('❌ Initial Buy option not found');
      }
      
      // Look for Reverse Bonding Curve option
      const bondingCurveText = page.locator(':text("Reverse Bonding Curve")').first();
      if (await bondingCurveText.count() > 0) {
        console.log('✅ Reverse Bonding Curve text found');
        
        // Look for checkbox near the text
        const bondingCurveCheckbox = page.locator('input[type="checkbox"]:near(:text("Reverse Bonding Curve"))').first();
        if (await bondingCurveCheckbox.count() > 0) {
          const isChecked = await bondingCurveCheckbox.isChecked();
          console.log('Reverse Bonding Curve checkbox default state:', isChecked ? 'checked' : 'unchecked');
          
          if (isChecked) {
            // Look for Diamond Hands Protection
            const diamondHandsText = page.locator(':text("Diamond Hands"), :text("Diamond Hands Protection")').first();
            if (await diamondHandsText.count() > 0) {
              console.log('✅ Diamond Hands Protection found when Reverse Bonding Curve is enabled');
            } else {
              console.log('❌ Diamond Hands Protection not found');
            }
          }
        } else {
          console.log('Reverse Bonding Curve text found but no checkbox nearby');
          
          // Check what type of element it is
          const elementType = await bondingCurveText.evaluate(el => el.tagName);
          const elementClass = await bondingCurveText.getAttribute('class');
          console.log('Reverse Bonding Curve element type:', elementType, 'class:', elementClass);
        }
      } else {
        console.log('❌ Reverse Bonding Curve option not found');
      }
      
      // Look for Connect Wallet button (this is the actual launch button)
      const launchTokenButton = page.locator('button:has-text("Connect Wallet")').first();
      if (await launchTokenButton.count() > 0) {
        console.log('✅ Launch Token button found');
        const isEnabled = await launchTokenButton.isEnabled();
        console.log('Launch Token button enabled:', isEnabled);
      } else {
        console.log('❌ Launch Token button not found');
      }
      
      await page.screenshot({ path: 'tests/screenshots/launch-features-test.png', fullPage: true });
    });
  });

  test.describe('Complete Launch Flow', () => {
    test('should test complete launch flow with valid data', async ({ page }) => {
      // Navigate to main page first, then to launch page
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Try to find and click launch button
      const launchButton = page.locator('a[href*="launch"]').first();
      if (await launchButton.count() > 0) {
        await launchButton.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
      }
      
      console.log('=== COMPLETE LAUNCH FLOW TEST ===');
      
      // Fill in valid form data
      const nameField = page.locator('input[placeholder*="Enter your token name"]').first();
      const symbolField = page.locator('input[placeholder*="Enter your token symbol"]').first();
      const descField = page.locator('textarea[placeholder*="Enter your description"]').first();
      
      let formFilled = false;
      
      if (await nameField.count() > 0) {
        await nameField.fill('TestToken');
        console.log('✅ Filled name field');
        formFilled = true;
      }
      
      if (await symbolField.count() > 0) {
        await symbolField.fill('TEST');
        console.log('✅ Filled symbol field');
        formFilled = true;
      }
      
      if (await descField.count() > 0) {
        await descField.fill('This is a test token for validation purposes');
        console.log('✅ Filled description field');
        formFilled = true;
      }
      
      if (formFilled) {
        // Take screenshot before launching
        await page.screenshot({ path: 'tests/screenshots/launch-form-complete.png', fullPage: true });
        
        // Try to click Connect Wallet button (this is the actual launch button)
        const launchTokenButton = page.locator('button:has-text("Connect Wallet")').first();
        
        if (await launchTokenButton.count() > 0) {
          const isEnabled = await launchTokenButton.isEnabled();
          console.log('Launch button enabled:', isEnabled);
          
          if (isEnabled) {
            console.log('Attempting to launch token...');
            await launchTokenButton.click();
            
            // Wait for navigation or response
            await page.waitForTimeout(1000);
            
            const newUrl = page.url();
            const newTitle = await page.title();
            console.log('After launch - URL:', newUrl);
            console.log('After launch - Title:', newTitle);
            
            // Take screenshot of result
            await page.screenshot({ path: 'tests/screenshots/after-launch-attempt.png', fullPage: true });
            
            // Check if we're on a token detail page
            const isTokenPage = newUrl.includes('token') || newUrl.includes('detail') || newTitle.toLowerCase().includes('token');
            console.log('Redirected to token page:', isTokenPage);
          } else {
            console.log('❌ Launch button is disabled');
          }
        } else {
          console.log('❌ Launch button not found');
        }
      } else {
        console.log('❌ Could not fill form fields');
      }
    });
  });
});
