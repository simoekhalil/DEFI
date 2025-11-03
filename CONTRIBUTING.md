# Contributing to Gala Launchpad QA Testing

Thank you for your interest in contributing! This document provides guidelines and best practices for contributing to this testing suite.

## 🚀 Getting Started

1. **Fork the repository** and clone your fork
2. **Install dependencies**: `npm install`
3. **Set up environment**: Copy `.env.example` to `.env` and configure
4. **Run tests**: `npm run test:e2e` to verify everything works

## 📝 Code Style

### TypeScript/JavaScript
- Use TypeScript for all new test files
- Follow existing code style (2-space indentation)
- Use descriptive variable and function names
- Add JSDoc comments for complex functions

### Test Structure
```typescript
test.describe('Feature Name', () => {
  test.beforeAll(async ({ page }) => {
    // Setup shared state
  });

  test('should do something specific', async ({ page }) => {
    // Arrange
    const initialState = await getInitialState();

    // Act
    await performAction(page);

    // Assert
    expect(result).toBe(expected);
  });
});
```

## ✅ Writing Tests

### Best Practices

1. **Use Descriptive Test Names**
   ```typescript
   // Good
   test('should display correct token balance after purchase');
   
   // Bad
   test('balance test');
   ```

2. **Follow AAA Pattern**
   - **Arrange**: Set up test data and preconditions
   - **Act**: Perform the action being tested
   - **Assert**: Verify the expected outcome

3. **Use Fixtures for Shared Setup**
   ```typescript
   import { test } from './fixtures/wallet';
   
   test('my test', async ({ page, wallet }) => {
     // wallet fixture is available
   });
   ```

4. **Add Screenshots for Visual Verification**
   ```typescript
   await page.screenshot({ 
     path: `test-results/feature-${Date.now()}.png`,
     fullPage: true 
   });
   ```

5. **Use Blockchain Validation When Possible**
   ```typescript
   import { getGalaBalance } from './helpers/blockchain-utils';
   
   const balanceWei = await getGalaBalance(walletAddress);
   expect(balanceWei).toBeGreaterThan(0);
   ```

### Test Categories

- **Unit Tests**: Test individual functions/components
- **Integration Tests**: Test feature interactions
- **E2E Tests**: Test complete user flows
- **Regression Tests**: Verify bug fixes stay fixed

### Timeouts

- Use appropriate timeouts based on operation:
  - Page loads: 30s
  - Transaction confirmations: 60s
  - DEX indexing: 5-15 minutes (use polling)

```typescript
await expect(async () => {
  const balance = await getBalance();
  expect(balance).toBeGreaterThan(0);
}).toPass({ timeout: 60000, intervals: [5000] });
```

## 🐛 Reporting Issues

### Bug Reports

Include:
- **Description**: Clear description of the issue
- **Steps to Reproduce**: Detailed steps
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: OS, Node version, browser
- **Screenshots**: If applicable
- **Test Logs**: Relevant log output

### Feature Requests

Include:
- **Use Case**: Why is this needed?
- **Proposed Solution**: How should it work?
- **Alternatives**: Other approaches considered

## 🔄 Pull Request Process

### Before Submitting

1. **Run all tests**: Ensure existing tests pass
   ```bash
   npm run test:e2e
   ```

2. **Add new tests**: For new features or bug fixes

3. **Update documentation**: Update README or other docs if needed

4. **Check linting**: Ensure code follows style guidelines

### PR Guidelines

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-number-description
   ```

2. **Write clear commit messages**
   ```
   feat: Add DEX swap validation test
   
   - Validates swap execution
   - Checks price impact
   - Verifies balance updates
   ```

   Use conventional commits:
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `test:` Test additions/changes
   - `refactor:` Code refactoring
   - `chore:` Maintenance tasks

3. **Keep PRs focused**
   - One feature/fix per PR
   - Avoid unrelated changes
   - Keep PRs reasonably sized

4. **Fill out PR template**
   - Describe changes
   - Link related issues
   - Note breaking changes
   - Add screenshots if UI-related

### Review Process

1. Automated tests will run via GitHub Actions
2. A maintainer will review your PR
3. Address any feedback or requested changes
4. Once approved, your PR will be merged

## 🧪 Test Helpers

### Available Helpers

- **`tests/helpers/connect.ts`**: MetaMask connection utilities
- **`tests/helpers/blockchain-utils.ts`**: Blockchain queries (balances, transactions)
- **`tests/helpers/api-helper.ts`**: API interaction utilities
- **`tests/helpers/sdk-helper.ts`**: SDK integration helpers

### Creating New Helpers

```typescript
// tests/helpers/my-helper.ts
export async function myUtilityFunction(page: Page) {
  // Implementation
}
```

## 📚 Documentation

### When to Update Docs

- Adding new test suites
- Changing test execution process
- Adding new dependencies
- Modifying configuration options
- Adding new helper utilities

### Documentation Files

- `README.md`: Main project documentation
- `CONTRIBUTING.md`: This file
- Test-specific docs: Include in test file as comments or separate `.md` files

## 🔒 Security

### Handling Sensitive Data

- **Never commit** `.env` files
- **Never commit** private keys or API tokens
- Use environment variables for all secrets
- Add sensitive files to `.gitignore`

### Testing with Real Funds

- Use test wallets with **limited funds**
- Never use production wallets for testing
- Document required test fund amounts

## 🤝 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors.

### Expected Behavior

- Be respectful and constructive
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discriminatory language
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and general discussion
- **Documentation**: Check existing docs first

## 🎯 Development Workflow

### Typical Workflow

1. **Check existing issues** for similar work
2. **Create an issue** for discussion (for large changes)
3. **Fork and clone** the repository
4. **Create a branch** for your work
5. **Write code and tests**
6. **Run tests locally**
7. **Commit your changes**
8. **Push to your fork**
9. **Create a pull request**
10. **Respond to feedback**

### Running Specific Tests

```bash
# Run a specific test file
npx playwright test buy-transactions.spec.ts

# Run tests matching a pattern
npx playwright test -g "graduation"

# Run in headed mode for debugging
npx playwright test buy-transactions.spec.ts --headed

# Run with debug mode
npx playwright test buy-transactions.spec.ts --debug
```

## 📈 Test Coverage Goals

We aim to maintain:
- **Core features**: 100% coverage
- **Edge cases**: Comprehensive coverage
- **Error scenarios**: Key error paths covered
- **Performance**: Regular performance benchmarks

## 🔧 Troubleshooting Development Issues

### Common Issues

**MetaMask Extension Not Loading**
```bash
rm -rf node_modules/@tenkeylabs/dappwright/metamask
npm run metamask:download
```

**TypeScript Errors**
```bash
npm run tsc --noEmit
```

**Test Timeouts**
- Increase timeout in test or config
- Check network connectivity
- Verify blockchain state

## 📝 Checklist for Contributors

Before submitting your PR, ensure:

- [ ] Tests pass locally
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] Code follows project style
- [ ] Commits are clear and descriptive
- [ ] No sensitive data in commits
- [ ] PR description is complete

## Thank You! 🙏

Your contributions help make this testing suite better for everyone. We appreciate your time and effort!

