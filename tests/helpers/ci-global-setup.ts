import { chromium, FullConfig } from '@playwright/test';

/**
 * Global setup for CI/CD environment
 * Prepares the testing environment with mock wallet and optimizations
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 CI/CD Global Setup Starting...');
  console.log('='.repeat(50));
  
  // Environment detection
  const isCI = !!process.env.CI;
  const isGitHubActions = !!process.env.GITHUB_ACTIONS;
  
  console.log(`Environment: ${isCI ? 'CI/CD' : 'Local'}`);
  console.log(`GitHub Actions: ${isGitHubActions ? 'Yes' : 'No'}`);
  console.log(`Base URL: ${config.projects[0].use?.baseURL || 'Not set'}`);
  
  // Set up browser for pre-warming
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--no-sandbox', // Required for some CI environments
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  });
  
  try {
    const context = await browser.newContext({
      ignoreHTTPSErrors: true,
      permissions: ['clipboard-read', 'clipboard-write']
    });
    
    const page = await context.newPage();
    
    // Pre-warm the application
    console.log('🔥 Pre-warming application...');
    const baseURL = config.projects[0].use?.baseURL || 'https://lpad-frontend-dev1.defi.gala.com';
    
    try {
      await page.goto(baseURL, { timeout: 30000 });
      await page.waitForLoadState('networkidle', { timeout: 20000 });
      console.log('✅ Application pre-warmed successfully');
    } catch (error) {
      console.log('⚠️ Application pre-warming failed, but continuing:', error);
    }
    
    // Inject global wallet mock for all tests
    console.log('💳 Setting up global wallet mock...');
    await page.addInitScript(() => {
      // Global wallet mock that persists across page loads
      (window as any).__WALLET_MOCK__ = {
        gala: {
          wallet: {
            connect: async () => ({
              address: 'client|618ae395c1c653111d3315be',
              connected: true,
              balance: '1000000'
            }),
            disconnect: async () => ({ connected: false }),
            getBalance: async () => '1000000',
            signTransaction: async (tx: any) => ({ ...tx, signature: 'ci-mock-signature' }),
            isConnected: () => true
          }
        },
        ethereum: {
          isMetaMask: true,
          request: async ({ method }: { method: string }) => {
            switch (method) {
              case 'eth_requestAccounts':
                return ['0x1234567890123456789012345678901234567890'];
              case 'eth_accounts':
                return ['0x1234567890123456789012345678901234567890'];
              case 'eth_chainId':
                return '0x1';
              default:
                return null;
            }
          },
          on: () => {},
          removeListener: () => {}
        }
      };
      
      // Auto-inject wallet APIs when DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          (window as any).gala = (window as any).__WALLET_MOCK__.gala;
          (window as any).ethereum = (window as any).__WALLET_MOCK__.ethereum;
        });
      } else {
        (window as any).gala = (window as any).__WALLET_MOCK__.gala;
        (window as any).ethereum = (window as any).__WALLET_MOCK__.ethereum;
      }
    });
    
    console.log('✅ Global wallet mock configured');
    
    await context.close();
  } finally {
    await browser.close();
  }
  
  // Set environment variables for tests
  process.env.WALLET_MODE = 'automated';
  process.env.TEST_ENVIRONMENT = 'ci';
  
  console.log('✅ CI/CD Global Setup Complete');
  console.log('='.repeat(50));
}

export default globalSetup;





