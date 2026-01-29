import { Page, expect, BrowserContext } from '@playwright/test';
import { bootstrap, MetaMaskWallet } from '@tenkeylabs/dappwright';

/**
 * Automated Wallet Connection Helper - Full Automation with Dappwright
 * NO MANUAL INTERVENTION - NO MOCK WALLETS
 * Uses real wallet extension automation via Dappwright
 */

export interface WalletConfig {
  address: string;
  privateKey?: string;
  seedPhrase?: string;
  type: 'metamask' | 'gala' | 'sepolia' | 'goerli';
  autoConnect: boolean;
  timeout: number;
  balance?: string;
  enableTransactions?: boolean;
}

export interface WalletConnectionResult {
  connected: boolean;
  address?: string;
  balance?: string;
  method: string;
  duration: number;
}

export class AutomatedWalletConnection {
  private page: Page | null = null;
  private config: WalletConfig;
  private walletInstance: any = null;
  private dappwrightContext: BrowserContext | null = null;
  
  constructor(page: Page | null = null, config: Partial<WalletConfig> = {}) {
    this.page = page;
    
    // Validate required credentials - check both naming conventions
    const seedPhrase = config.seedPhrase || 
      process.env.WALLET_SEED_PHRASE || 
      process.env.TEST_SEED_PHRASE;
      
    const privateKey = config.privateKey || 
      process.env.WALLET_PRIVATE_KEY || 
      process.env.TEST_PRIVATE_KEY;
    
    if (!seedPhrase && !privateKey) {
      throw new Error(
        'Wallet credentials required: Set WALLET_SEED_PHRASE/TEST_SEED_PHRASE or WALLET_PRIVATE_KEY/TEST_PRIVATE_KEY environment variable'
      );
    }
    
    this.config = {
      address: config.address || 
        process.env.WALLET_ADDRESS || 
        process.env.TEST_WALLET_ADDRESS || '',
      seedPhrase,
      privateKey,
      type: config.type || 'metamask',
      autoConnect: config.autoConnect !== false,
      timeout: config.timeout || 30000,
      balance: config.balance,
      enableTransactions: config.enableTransactions !== false,
      ...config
    };
  }
  
  /**
   * Get the active page (from Dappwright context if available, otherwise the passed page)
   */
  private getActivePage(): Page {
    if (!this.page) {
      throw new Error('No page available. Call connect() first or provide a page in constructor.');
    }
    return this.page;
  }

  /**
   * Main method to establish wallet connection using Dappwright
   * FULLY AUTOMATED - NO MANUAL STEPS
   */
  async connect(): Promise<WalletConnectionResult> {
    const startTime = Date.now();
    
    console.log('🔗 AUTOMATED WALLET CONNECTION (Dappwright)');
    console.log('='.repeat(50));
    console.log(`Type: ${this.config.type}`);
    console.log(`Address: ${this.config.address}`);
    console.log(`Auto-connect: ${this.config.autoConnect}`);
    console.log('='.repeat(50));

    try {
      // Check if wallet is already connected
      const existingConnection = await this.checkExistingConnection();
      if (existingConnection.connected) {
        console.log('✅ Wallet already connected');
        return {
          ...existingConnection,
          duration: Date.now() - startTime
        };
      }

      // Use Dappwright for real wallet automation
      await this.connectWithDappwright();
      
      // Verify connection
      const connectionResult = await this.verifyConnection(startTime);
      
      if (connectionResult.connected) {
        console.log('✅ Wallet connected successfully via Dappwright');
        return connectionResult;
      } else {
        throw new Error('Wallet connection verification failed');
      }
      
    } catch (error) {
      console.error('❌ Wallet connection failed:', error);
      throw new Error(`Automated wallet connection failed: ${error.message}`);
    }
  }

  /**
   * Connect wallet using Dappwright (real wallet extension automation)
   */
  private async connectWithDappwright(): Promise<void> {
    console.log('🦊 Initializing wallet extension via Dappwright...');
    
    try {
      // Bootstrap Dappwright WITHOUT URL - we'll navigate manually
      const [wallet, metaMaskPage, context] = await bootstrap('', {
        wallet: 'metamask',
        version: MetaMaskWallet.recommendedVersion,
        seed: this.config.seedPhrase,
        headless: false,
      });
      
      this.walletInstance = wallet;
      this.dappwrightContext = context;
      
      console.log('✅ Wallet extension loaded');
      
      // Switch network if needed (while on MetaMask page)
      if (this.config.type === 'sepolia') {
        console.log('🔄 Switching to Sepolia...');
        try {
          await wallet.switchNetwork('sepolia');
          console.log('✅ Switched to Sepolia');
          await metaMaskPage.waitForTimeout(1000);
          // Close any dialogs
          await metaMaskPage.keyboard.press('Escape');
          await metaMaskPage.waitForTimeout(500);
        } catch (e) {
          console.warn('⚠️ Could not switch network:', e.message);
          // IMPORTANT: Close the network dialog that was left open
          try {
            await metaMaskPage.keyboard.press('Escape');
            await metaMaskPage.waitForTimeout(500);
            console.log('ℹ️  Closed network dialog, continuing on current network');
          } catch (closeError) {
            console.warn('⚠️ Could not close dialog');
          }
        }
      } else if (this.config.type === 'goerli') {
        try {
          await wallet.switchNetwork('goerli');
          console.log('✅ Switched to Goerli');
          await metaMaskPage.waitForTimeout(1000);
          await metaMaskPage.keyboard.press('Escape');
          await metaMaskPage.waitForTimeout(500);
        } catch (e) {
          console.warn('⚠️ Could not switch network:', e.message);
          try {
            await metaMaskPage.keyboard.press('Escape');
            await metaMaskPage.waitForTimeout(500);
          } catch (closeError) {
            // Ignore
          }
        }
      }
      
      // Create new page and navigate to dApp
      this.page = await context.newPage();
      console.log('🔗 Navigating to dApp...');
      await this.page.goto('https://lpad-frontend-dev1.defi.gala.com');
      await this.page.waitForLoadState('networkidle');
      
      const currentUrl = this.page.url();
      console.log(`✅ On dApp: ${currentUrl}`);
      
      // Wait for React app to render - look for actual content, not just loading screen
      console.log('⏳ Waiting for React app to render...');
      try {
        // Wait for navigation/header to appear (common on most pages)
        await this.page.waitForSelector('nav, header, button, [role="button"]', { timeout: 15000 });
        console.log('✅ Page content loaded');
      } catch (e) {
        console.warn('⚠️ Timeout waiting for page content, continuing anyway');
      }
      
      // Additional wait for JavaScript to execute
      await this.page.waitForTimeout(3000);
      
      // Bring the dApp page to front to ensure it's focused
      await this.page.bringToFront();
      
      // Find and click connect button
      const connected = await this.triggerWalletConnection();
      
      if (connected) {
        console.log('🔌 Triggering wallet connection request...');
        
        // Ensure we're on dApp page
        await this.page.bringToFront();
        await this.page.waitForTimeout(1000);
        
        // Listen for popup BEFORE triggering the request
        const popupPromise = context.waitForEvent('page', { timeout: 15000 }).catch(() => null);
        
        // Manually trigger eth_requestAccounts from dApp
        const requestPromise = this.page.evaluate(async () => {
          if (typeof window.ethereum !== 'undefined') {
            try {
              console.log('Triggering eth_requestAccounts...');
              return await window.ethereum.request({ method: 'eth_requestAccounts' });
            } catch (error: any) {
              console.error('eth_requestAccounts error:', error.message);
              return null;
            }
          }
          return null;
        }).catch(() => null);
        
        console.log('⏳ Waiting for MetaMask popup...');
        
        // Wait for popup to appear
        const popup = await popupPromise;
        
        if (popup) {
          console.log('✅ MetaMask popup detected, approving...');
          try {
            await wallet.approve();
            console.log('✅ Connection approved');
            
            // Wait for popup to close
            await popup.waitForEvent('close', { timeout: 5000 }).catch(() => {});
          } catch (e: any) {
            console.warn('⚠️ Approve error:', e.message);
          }
        } else {
          console.log('⚠️ No popup appeared - may be auto-approved');
        }
        
        // Wait for request to complete
        const accounts = await requestPromise;
        
        // Return to dApp
        await this.page.bringToFront();
        await this.page.waitForTimeout(1000);
        
        // Get final account status
        if (accounts && accounts.length > 0) {
          this.config.address = accounts[0];
          console.log(`✅ Wallet connected: ${this.config.address}`);
        } else {
          // Fallback check
          const fallbackAccounts = await this.page.evaluate(async () => {
            if (typeof window.ethereum !== 'undefined') {
              return await window.ethereum.request({ method: 'eth_accounts' });
            }
            return null;
          }).catch(() => null);
          
          if (fallbackAccounts && fallbackAccounts.length > 0) {
            this.config.address = fallbackAccounts[0];
            console.log(`✅ Wallet connected (fallback): ${this.config.address}`);
          } else {
            console.warn('⚠️ Connection failed - no accounts available');
          }
        }
      } else {
        console.log('⚠️ No connect button found - manually requesting wallet connection...');
        
        // Manually trigger wallet connection request
        try {
          console.log('🔌 Requesting eth_requestAccounts...');
          
          // Start the request (may need approval)
          const requestPromise = this.page.evaluate(async () => {
            if (typeof window.ethereum !== 'undefined') {
              try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                return accounts;
              } catch (error) {
                console.error('eth_requestAccounts error:', error.message);
                return null;
              }
            }
            return null;
          }).catch(e => {
            console.warn('Request evaluation failed:', e.message);
            return null;
          });
          
          // Try to approve, but with timeout (popup may not appear if already approved)
          try {
            console.log('🔌 Attempting to approve connection...');
            await Promise.race([
              wallet.approve(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Approve timeout')), 5000))
            ]);
            console.log('✅ Connection approved in MetaMask');
          } catch (approveError) {
            console.log('ℹ️  No approval popup (may be auto-approved or already connected)');
          }
          
          // Wait for request to complete
          const accounts = await Promise.race([
            requestPromise,
            new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000))
          ]);
          
          if (accounts && accounts.length > 0) {
            this.config.address = accounts[0];
            console.log(`✅ Wallet connected manually`);
            console.log(`📍 Address: ${this.config.address}`);
          } else {
            console.warn('⚠️ Manual connection returned no accounts');
          }
        } catch (e) {
          console.warn('⚠️ Manual connection failed:', e.message);
        }
      }
      
    } catch (error) {
      throw new Error(`Dappwright initialization failed: ${error.message}`);
    }
  }

  /**
   * Switch to Sepolia testnet (built-in to MetaMask)
   */
  private async switchToSepoliaTestnet(wallet: any): Promise<void> {
    console.log('🔄 Switching to Sepolia testnet...');
    
    try {
      const metamaskPage = wallet.page;
      
      // Open network selector
      await metamaskPage.click('[data-testid="network-display"]');
      await metamaskPage.waitForTimeout(1500);
      console.log('✅ Opened network selector');
      
      // Check if Sepolia is already visible (test networks enabled)
      const sepoliaVisible = await metamaskPage.locator('text=Sepolia').first().isVisible({ timeout: 2000 });
      
      if (!sepoliaVisible) {
        console.log('🔄 Enabling test networks...');
        
        // Find and enable the test networks toggle
        // Use the parent container and interact with it instead of the checkbox directly
        const toggleSection = metamaskPage.locator('text=Show test networks').locator('..');
        
        // Try to click the toggle text/label area which is more reliable
        try {
          await metamaskPage.locator('text=Show test networks').click({ timeout: 5000 });
          await metamaskPage.waitForTimeout(1000);
          console.log('✅ Test networks enabled');
        } catch (e) {
          // Fallback: try the checkbox with check() method
          const checkbox = toggleSection.locator('input[type="checkbox"]');
          await checkbox.check({ force: true, timeout: 5000 });
          await metamaskPage.waitForTimeout(1000);
          console.log('✅ Test networks enabled (fallback)');
        }
      } else {
        console.log('ℹ️  Test networks already visible');
      }
      
      // Click Sepolia network
      const sepoliaButton = metamaskPage.locator('text=Sepolia').first();
      await sepoliaButton.click({ timeout: 10000 });
      await metamaskPage.waitForTimeout(2000);
      console.log('✅ Switched to Sepolia testnet');
      
      // Network dialog closes automatically after selection
      // If it doesn't, parent function will press Escape
      
    } catch (error) {
      console.warn('⚠️ Could not switch to Sepolia:', error.message);
      console.log('ℹ️  Continuing with current network');
      
      // Try to close any open dialogs
      try {
        const metamaskPage = wallet.page;
        await metamaskPage.keyboard.press('Escape');
        await metamaskPage.waitForTimeout(500);
      } catch (e) {
        // Ignore
      }
    }
  }
  
  /**
   * Switch to Goerli testnet (built-in to MetaMask)
   */
  private async switchToGoerliTestnet(wallet: any): Promise<void> {
    console.log('🔄 Switching to Goerli testnet...');
    
    try {
      await wallet.switchNetwork('goerli');
      console.log('✅ Switched to Goerli testnet');
    } catch (error) {
      console.warn('⚠️ Could not switch to Goerli:', error.message);
    }
  }

  /**
   * Add GalaChain network to wallet
   */
  private async addGalaChainNetwork(wallet: any): Promise<void> {
    console.log('⚙️ Adding GalaChain network...');
    
    try {
      await wallet.addNetwork({
        networkName: 'GalaChain',
        rpc: process.env.GALACHAIN_RPC || 'https://rpc.galachain.com',
        chainId: parseInt(process.env.GALACHAIN_CHAIN_ID || '12345'),
        symbol: 'GALA',
      });
      
      console.log('✅ GalaChain network added');
    } catch (error) {
      console.warn('⚠️ Could not add GalaChain network:', error.message);
      // Continue anyway - network might already exist
    }
  }

  /**
   * Trigger wallet connection on the dApp
   */
  private async triggerWalletConnection(): Promise<boolean> {
    const page = this.getActivePage();
    
    console.log('🔍 Searching for connect button...');
    
    // Take screenshot to debug
    await page.screenshot({ path: 'tests/screenshots/before-connect.png', fullPage: false });
    
    // Log all buttons on page for debugging
    const allButtons = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.map(b => ({
        text: b.textContent?.trim().substring(0, 50),
        class: b.className,
        id: b.id
      }));
    });
    console.log('📋 All buttons on page:', JSON.stringify(allButtons, null, 2));
    
    const connectSelectors = [
      'button:has-text("Connect Wallet")',
      'button:has-text("Connect")',
      '[data-testid*="connect"]',
      '.connect-wallet',
      'button[class*="connect"]',
      'button[class*="Connect"]',
      'text=/connect.*wallet/i',
      // Try finding by role
      'button >> text=/connect/i',
      // Look for common web3 connect button patterns
      'w3m-button',
      'w3m-core-button',
      'button[id*="connect"]',
    ];

    for (const selector of connectSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          const text = await element.textContent();
          console.log(`✅ Found connect button: ${selector} (text: "${text?.trim()}")`);
          await element.click();
          await page.waitForTimeout(2000);
          
          // Handle wallet selection modal if it appears
          await this.selectWalletOption();
          
          return true;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    // Try JavaScript click as last resort
    console.log('🔧 Trying to find button via JavaScript...');
    const foundViaScript = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const connectBtn = buttons.find(b => 
        /connect/i.test(b.textContent || '') || 
        /connect/i.test(b.className) ||
        /connect/i.test(b.id)
      );
      if (connectBtn) {
        console.log('Found button via JS:', connectBtn.textContent);
        connectBtn.click();
        return true;
      }
      return false;
    });
    
    if (foundViaScript) {
      console.log('✅ Clicked connect button via JavaScript');
      await page.waitForTimeout(2000);
      await this.selectWalletOption();
      return true;
    }
    
    console.log('❌ No connect button found - wallet may auto-connect');
    return false;
  }

  /**
   * Select wallet option from modal (MetaMask, Gala, etc.)
   */
  private async selectWalletOption(): Promise<void> {
    const page = this.getActivePage();
    await page.waitForTimeout(1500);
    
    const walletSelectors = [
      'text=/metamask/i',
      'button:has-text("MetaMask")',
      '[data-testid*="metamask"]',
      'text=/gala.*wallet/i',
      'button:has-text("Gala")',
      '[data-testid*="gala"]',
    ];

    for (const selector of walletSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          console.log(`   Selecting wallet: ${selector}`);
          await element.click();
          await page.waitForTimeout(2000);
          return;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    console.log('   No wallet selection modal found');
  }

  /**
   * Check if wallet is already connected
   */
  private async checkExistingConnection(): Promise<WalletConnectionResult> {
    if (!this.page) {
      return { connected: false, method: 'none', duration: 0 };
    }
    
    const page = this.getActivePage();
    const walletStatus = await page.evaluate(() => {
      const indicators = [
        {
          check: () => /connected|disconnect/i.test(document.body.textContent || ''),
          method: 'text-indicator'
        },
        {
          check: () => /0x[a-fA-F0-9]{40}/.test(document.body.textContent || ''),
          method: 'ethereum-address'
        },
        {
          check: () => /client\|[a-fA-F0-9]{24}/.test(document.body.textContent || ''),
          method: 'gala-address'
        },
        {
          check: () => document.querySelector('[data-testid*="wallet"]') !== null,
          method: 'wallet-testid'
        },
        {
          check: () => document.querySelector('.wallet-connected') !== null,
          method: 'wallet-class'
        },
      ];
      
      for (const indicator of indicators) {
        try {
          if (indicator.check()) {
            return { 
              connected: true, 
              method: indicator.method,
              address: document.body.textContent?.match(/client\|[a-fA-F0-9]{24}|0x[a-fA-F0-9]{40}/)?.[0]
            };
          }
        } catch (e) {
          // Continue checking
        }
      }
      return { connected: false, method: 'none' };
    });

    return {
      connected: walletStatus.connected,
      address: walletStatus.address,
      method: walletStatus.method,
      duration: 0
    };
  }

  /**
   * Verify wallet connection succeeded
   */
  private async verifyConnection(startTime: number): Promise<WalletConnectionResult> {
    const page = this.getActivePage();
    const maxAttempts = Math.floor(this.config.timeout / 2000);
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await page.waitForTimeout(2000);
      
      const connectionResult = await this.checkExistingConnection();
      if (connectionResult.connected) {
        const balance = await this.getBalance();
        // Use address from config if not found on page
        const address = connectionResult.address || this.config.address;
        return {
          ...connectionResult,
          address,
          balance,
          duration: Date.now() - startTime
        };
      }
      
      if (attempt % 3 === 0 && attempt > 0) {
        console.log(`⏳ Verifying connection... (${attempt * 2}s elapsed)`);
      }
    }

    throw new Error(`Connection verification timeout after ${this.config.timeout}ms`);
  }

  /**
   * Disconnect wallet and clean up Dappwright context
   */
  async disconnect(): Promise<boolean> {
    console.log('🔌 Disconnecting wallet...');
    
    const page = this.getActivePage();
    
    if (this.walletInstance) {
      try {
        // Dappwright disconnect if available
        await this.walletInstance.close();
        this.walletInstance = null;
      } catch (e) {
        console.warn('Could not disconnect via Dappwright:', e.message);
      }
    }
    
    // Try UI disconnect button
    const disconnectSelectors = [
      'button:has-text("Disconnect")',
      'text=/disconnect/i',
      '[data-testid*="disconnect"]'
    ];

    for (const selector of disconnectSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          await element.click();
          await page.waitForTimeout(1000);
          console.log('✅ Wallet disconnected');
          return true;
        }
      } catch (e) {
        // Continue
      }
    }

    return false;
  }
  
  /**
   * Close the Dappwright browser context
   */
  async close(): Promise<void> {
    if (this.dappwrightContext) {
      try {
        await this.dappwrightContext.browser()?.close();
        this.dappwrightContext = null;
        this.page = null;
        console.log('✅ Browser context closed');
      } catch (e) {
        console.warn('Could not close browser context:', e.message);
      }
    }
  }

  /**
   * Get current wallet status
   */
  async getStatus(): Promise<WalletConnectionResult> {
    return await this.checkExistingConnection();
  }
  
  /**
   * Get the page object (for tests to interact with the dApp)
   * This page has MetaMask available via Dappwright
   */
  getPage(): Page {
    return this.getActivePage();
  }

  /**
   * Get wallet balance
   */
  async getBalance(): Promise<string> {
    const page = this.getActivePage();
    try {
      const balance = await page.evaluate(async () => {
        // Try window.ethereum first (MetaMask/Web3)
        if ((window as any).ethereum) {
          try {
            const accounts = await (window as any).ethereum.request({ 
              method: 'eth_accounts' 
            });
            
            if (accounts && accounts.length > 0) {
              const balance = await (window as any).ethereum.request({
                method: 'eth_getBalance',
                params: [accounts[0], 'latest']
              });
              return parseInt(balance, 16).toString();
            }
          } catch (e) {
            console.error('Error fetching balance:', e);
          }
        }
        
        // Try Gala wallet API
        if ((window as any).gala && (window as any).gala.wallet) {
          try {
            return await (window as any).gala.wallet.getBalance();
          } catch (e) {
            console.error('Error fetching Gala balance:', e);
          }
        }
        
        return '0';
      });
      
      console.log(`💰 Wallet Balance: ${balance} GALA`);
      return balance;
    } catch (error) {
      console.log('❌ Balance check failed:', error);
      return '0';
    }
  }

  /**
   * Sign and send transaction
   */
  async sendTransaction(params: {
    to: string;
    value?: string;
    data?: string;
    gas?: string;
    gasPrice?: string;
  }): Promise<{
    success: boolean;
    txHash?: string;
    error?: string;
  }> {
    if (!this.config.enableTransactions) {
      return { 
        success: false, 
        error: 'Transactions disabled in wallet config' 
      };
    }

    console.log('📤 Sending transaction...');
    
    const page = this.getActivePage();
    
    try {
      if (this.walletInstance) {
        // Use Dappwright to confirm transaction
        await this.walletInstance.confirmTransaction();
      }
      
      const result = await page.evaluate(async (txParams) => {
        if ((window as any).ethereum) {
          try {
            const txHash = await (window as any).ethereum.request({
              method: 'eth_sendTransaction',
              params: [txParams]
            });
            return { success: true, txHash };
          } catch (error) {
            return { success: false, error: error.message };
          }
        }
        return { success: false, error: 'No wallet provider available' };
      }, params);
      
      if (result.success) {
        console.log(`✅ Transaction sent: ${result.txHash}`);
      } else {
        console.log(`❌ Transaction failed: ${result.error}`);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Transaction error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Sign message
   */
  async signMessage(message: string): Promise<{
    success: boolean;
    signature?: string;
    error?: string;
  }> {
    console.log('✍️ Signing message...');
    
    const page = this.getActivePage();
    
    try {
      if (this.walletInstance) {
        await this.walletInstance.sign();
      }
      
      const result = await page.evaluate(async (msg) => {
        if ((window as any).ethereum) {
          try {
            const accounts = await (window as any).ethereum.request({ 
              method: 'eth_accounts' 
            });
            const signature = await (window as any).ethereum.request({
              method: 'personal_sign',
              params: [msg, accounts[0]]
            });
            return { success: true, signature };
          } catch (error) {
            return { success: false, error: error.message };
          }
        }
        return { success: false, error: 'No wallet provider available' };
      }, message);
      
      if (result.success) {
        console.log('✅ Message signed');
      } else {
        console.log(`❌ Signing failed: ${result.error}`);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Signing error:', error);
      return { success: false, error: error.message };
    }
  }
}

/**
 * Convenience function to create and connect wallet
 */
export async function connectWallet(
  page: Page, 
  config: Partial<WalletConfig> = {}
): Promise<WalletConnectionResult> {
  const wallet = new AutomatedWalletConnection(page, config);
  return await wallet.connect();
}

/**
 * Enhanced wallet connection with retry logic
 */
export async function connectWalletWithRetry(
  page: Page,
  config: Partial<WalletConfig> = {},
  maxRetries: number = 3
): Promise<WalletConnectionResult> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Wallet connection attempt ${attempt}/${maxRetries}`);
      const result = await connectWallet(page, config);
      return result;
    } catch (error) {
      lastError = error as Error;
      console.log(`❌ Attempt ${attempt} failed: ${error.message}`);
      
      if (attempt < maxRetries) {
        console.log(`⏳ Waiting 3 seconds before retry...`);
        await page.waitForTimeout(3000);
      }
    }
  }
  
  throw new Error(`All ${maxRetries} wallet connection attempts failed. Last error: ${lastError?.message}`);
}
