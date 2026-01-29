import { test, expect } from '@playwright/test';
import { NetworkHelper } from './helpers/network-helper';

test('Simple test', async ({ page }) => {
  console.log('=== SIMPLE TEST STARTING ===');
  console.log('Test is running!');
  
  // Basic assertion that doesn't require network
  expect(1 + 1).toBe(2);
  
  // Optional network connectivity check
  const networkHelper = new NetworkHelper(page);
  const baseUrl = 'https://lpad-frontend-dev1.defi.gala.com/';
  const isAccessible = await networkHelper.isUrlAccessible(baseUrl);
  
  if (isAccessible) {
    console.log('✅ Network connectivity confirmed');
  } else {
    console.log('⚠️ Network connectivity issues detected');
  }
  
  console.log('=== SIMPLE TEST COMPLETED ===');
});
