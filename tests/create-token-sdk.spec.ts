/**
 * Token Creation via SDK (No MetaMask UI)
 * 
 * Uses SDK with direct private key - bypasses MetaMask popup entirely.
 * Much more reliable for automated testing.
 */

import { test, expect } from '@playwright/test';
import { getSDK, getGalaBalance } from './helpers/sdk-helper';
import * as fs from 'fs';
import * as path from 'path';

const BASE = process.env.BASE_URL || 'https://lpad-frontend-dev1.defi.gala.com';

test.describe('Token Creation via SDK', () => {
  
  test('create token using SDK directly (no MetaMask UI)', async () => {
    test.setTimeout(300000); // 5 minutes
    
    console.log('[TEST] ========================================');
    console.log('[TEST]   SDK-Based Token Creation (Direct)');
    console.log('[TEST] ========================================\n');
    
    // Initialize SDK (uses private key from env)
    const sdk = await getSDK();
    console.log('[TEST] ✅ SDK initialized');
    
    // Get wallet info
    const address = await sdk.getAddress();
    const ethAddress = await sdk.getEthereumAddress();
    console.log('[TEST] GalaChain Address:', address);
    console.log('[TEST] Ethereum Address:', ethAddress);
    
    // Check GALA balance
    console.log('\n[TEST] Checking GALA balance...');
    const balanceResult = await getGalaBalance();
    console.log('[TEST] Balance:', balanceResult.balance, 'GALA');
    
    // Check launch fee
    console.log('\n[TEST] Checking token launch fee...');
    const launchFee = await sdk.fetchLaunchTokenFee();
    console.log('[TEST] Launch fee:', launchFee, 'GALA');
    
    // Verify sufficient balance
    const balance = parseFloat(balanceResult.balance);
    const fee = parseFloat(launchFee.toString());
    
    if (balance < fee) {
      console.log('[TEST] ❌ Insufficient GALA balance');
      console.log(`[TEST] Need: ${fee} GALA`);
      console.log(`[TEST] Have: ${balance} GALA`);
      throw new Error(`Insufficient GALA: need ${fee}, have ${balance}`);
    }
    
    console.log('[TEST] ✅ Sufficient balance for token creation');
    
    // Generate unique token details
    const timestamp = Date.now();
    const tokenName = `sdk${timestamp.toString().slice(-10)}`; // Keep it under 20 chars
    const letters = 'ABCDEFGHIJ';
    const timestampStr = timestamp.toString().slice(-4);
    const uniqueLetters = timestampStr.split('').map(d => letters[parseInt(d)]).join('');
    const tokenSymbol = `SDK${uniqueLetters}`;
    const tokenDescription = `Test token created via SDK at ${new Date().toISOString()}`;
    
    console.log('\n[TEST] Token Details:');
    console.log('[TEST] Name:', tokenName);
    console.log('[TEST] Symbol:', tokenSymbol);
    console.log('[TEST] Description:', tokenDescription);
    
    // Use a public image URL instead of uploading
    // (SDK image upload has issues in Node.js environment)
    console.log('\n[TEST] Using public image URL...');
    const imageUrl = 'https://assets.gala.games/gala-platform/assets/img/gala-logo.png';
    console.log('[TEST] ✅ Image URL:', imageUrl);
    
    // Launch the token
    console.log('\n[TEST] Launching token...');
    console.log('[TEST] This will sign the transaction with your private key');
    console.log('[TEST] No MetaMask popup required!');
    
    try {
      const result = await sdk.launchToken({
        tokenName,
        tokenSymbol,
        tokenDescription,
        tokenImage: imageUrl,
        websiteUrl: 'https://gala.com',
        twitterUrl: 'https://twitter.com/GoGalaGames',
        // Optional: Pre-buy some tokens on launch
        preBuyQuantity: '0'
      });
      
      console.log('\n[TEST] ========================================');
      console.log('[TEST]   ✅ TOKEN CREATED SUCCESSFULLY!');
      console.log('[TEST] ========================================');
      console.log('[TEST] Token Name:', result.tokenName || tokenName);
      console.log('[TEST] Token Symbol:', result.tokenSymbol || tokenSymbol);
      console.log('[TEST] Transaction ID:', result.transactionId);
      console.log('[TEST] Creator Address:', result.creatorAddress || address);
      console.log('[TEST] Token URL:', `${BASE}/buy-sell/${tokenName}`);
      console.log('[TEST] ========================================\n');
      
      // Verify the token was created
      console.log('[TEST] Verifying token creation...');
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for indexing
      
      const poolDetails = await sdk.fetchPoolDetails(tokenName);
      console.log('[TEST] ✅ Token verified on chain');
      console.log('[TEST] Max Supply:', poolDetails.maxSupply);
      console.log('[TEST] Current Supply:', poolDetails.currentSupply);
      console.log('[TEST] Sale Status:', poolDetails.saleStatus);
      
      // Save token info to file
      const tokenInfo = {
        tokenName,
        tokenSymbol,
        tokenDescription,
        imageUrl,
        transactionId: result.transactionId,
        createdAt: new Date().toISOString(),
        creatorAddress: address,
        url: `${BASE}/buy-sell/${tokenName}`,
        poolDetails: {
          maxSupply: poolDetails.maxSupply,
          currentSupply: poolDetails.currentSupply,
          saleStatus: poolDetails.saleStatus
        }
      };
      
      const outputFile = 'test-results/sdk-created-token.json';
      fs.mkdirSync('test-results', { recursive: true });
      fs.writeFileSync(outputFile, JSON.stringify(tokenInfo, null, 2));
      console.log(`[TEST] Token info saved to: ${outputFile}`);
      
      // Expectations
      expect(result.transactionId).toBeDefined();
      expect(poolDetails.maxSupply).toBeDefined();
      expect(poolDetails.saleStatus).toBe('Ongoing');
      
    } catch (error: any) {
      console.error('\n[TEST] ❌ Token creation failed');
      console.error('[TEST] Error:', error.message);
      
      if (error.response) {
        console.error('[TEST] Response status:', error.response.status);
        console.error('[TEST] Response data:', error.response.data);
      }
      
      throw error;
    }
  });
  
  test('verify SDK can interact with created tokens', async () => {
    test.setTimeout(60000);
    
    console.log('[TEST] Testing SDK token interactions...');
    
    const sdk = await getSDK();
    
    // Check if we have a created token
    const tokenFile = 'test-results/sdk-created-token.json';
    if (!fs.existsSync(tokenFile)) {
      console.log('[TEST] ⚠️ No token file found, skipping test');
      test.skip();
      return;
    }
    
    const tokenInfo = JSON.parse(fs.readFileSync(tokenFile, 'utf-8'));
    const tokenName = tokenInfo.tokenName;
    
    console.log('[TEST] Testing with token:', tokenName);
    
    // Test: Fetch pool details
    console.log('\n[TEST] Fetching pool details...');
    const poolDetails = await sdk.fetchPoolDetails(tokenName);
    console.log('[TEST] ✅ Pool details retrieved');
    console.log('[TEST] Sale Status:', poolDetails.saleStatus);
    console.log('[TEST] Current Supply:', poolDetails.currentSupply);
    
    // Test: Calculate buy amount
    console.log('\n[TEST] Calculating buy quote...');
    const buyQuote = await sdk.calculateBuyAmount({
      tokenName,
      amount: '10',
      type: 'native'
    });
    console.log('[TEST] ✅ Buy quote calculated');
    console.log('[TEST] 10 GALA =', buyQuote.amount, tokenName);
    console.log('[TEST] Transaction Fee:', buyQuote.transactionFee, 'GALA');
    
    // Test: Check token balance
    console.log('\n[TEST] Checking token balance...');
    const address = await sdk.getAddress();
    const balance = await sdk.fetchTokenBalance({
      tokenName,
      address
    });
    console.log('[TEST] ✅ Balance retrieved');
    console.log('[TEST] Balance:', balance.quantity, tokenName);
    
    // Expectations
    expect(poolDetails).toBeDefined();
    expect(buyQuote.amount).toBeDefined();
    expect(parseFloat(buyQuote.amount)).toBeGreaterThan(0);
    
    console.log('\n[TEST] ✅ All SDK interactions working!');
  });
});

