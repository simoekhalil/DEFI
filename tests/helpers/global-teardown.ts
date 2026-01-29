/**
 * Global teardown for Gala Launchpad tests
 * Runs once after all tests
 */

async function globalTeardown() {
  console.log('🧹 Cleaning up Gala Launchpad test environment...');
  
  // Any global cleanup logic can go here
  // For example: database cleanup, temporary file removal, etc.
  
  console.log('✅ Global teardown completed');
}

export default globalTeardown;
