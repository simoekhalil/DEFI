# SDK Update v3.12.1 - Partial Fix but New Issue

## ✅ Good News: SDK Team Added CommonJS Build!

**Updated from:** v3.11.8 → **v3.12.1**

The SDK maintainers **DID add CommonJS support** by creating `dist/index.cjs.js`! This shows they're addressing the issue.

---

## ❌ New Problem: Dependency Chain Issue

### The Error:
```
Error [ERR_REQUIRE_ESM]: require() of ES Module 
C:\Users\Simone\qa-testing\node_modules\uuid\dist-node\index.js 
from 
C:\Users\Simone\qa-testing\node_modules\@gala-chain\launchpad-sdk\dist\index.cjs.js 
not supported.
```

### What's Happening:
1. ✅ SDK now has `index.cjs.js` (CommonJS build)
2. ❌ But the CJS build uses `require('uuid')`
3. ❌ The `uuid` package (v10+) is now ESM-only
4. ❌ This breaks the CommonJS build

---

## 📊 The Dependency Chain Problem

```
Your Code (CommonJS)
  ↓ requires
@gala-chain/launchpad-sdk (v3.12.1)
  ├─ index.cjs.js ✅ (CommonJS build - GOOD!)
  │   ↓ requires
  └─ uuid package
      └─ dist-node/index.js ❌ (ESM-only - BREAKS!)
```

---

## 🔧 The Fix Needed

### Option 1: Bundle uuid into SDK (Recommended)
The SDK should **bundle its dependencies** instead of requiring them:

```typescript
// In SDK build config (e.g., tsup, rollup, esbuild)
{
  external: [], // Don't externalize uuid
  bundle: true, // Bundle uuid into the SDK
}
```

This way the `uuid` package is included in the SDK bundle and doesn't need to be required separately.

---

### Option 2: Use uuid v9 (Older CommonJS Version)
Downgrade the `uuid` dependency in SDK to v9.x which still supports CommonJS:

```json
// SDK's package.json
{
  "dependencies": {
    "uuid": "^9.0.0"  // v9 supports CommonJS
  }
}
```

---

### Option 3: Dynamic Import for uuid
Change the SDK's CJS build to use dynamic import for ESM dependencies:

```javascript
// Instead of:
const { v4: uuidv4 } = require('uuid');

// Use:
const { v4: uuidv4 } = await import('uuid');
```

---

## 📝 Updated Bug Report for SDK Maintainers

### Subject: CommonJS Build Still Has Dependency Issues (v3.12.1)

**To:** Gala Chain Launchpad SDK Team

**Great progress on v3.12.1!** Thank you for adding the CommonJS build (`index.cjs.js`). However, there's still an issue:

### The Problem:
The CommonJS build fails because it tries to `require('uuid')`, but `uuid` v10+ is ESM-only.

### Error:
```
Error [ERR_REQUIRE_ESM]: require() of ES Module 
node_modules/uuid/dist-node/index.js 
from node_modules/@gala-chain/launchpad-sdk/dist/index.cjs.js 
not supported.
```

### Recommended Fix:
**Bundle dependencies** into the SDK instead of requiring them externally:

```typescript
// tsup.config.ts or similar
export default {
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  external: [], // ← Don't externalize uuid and other problematic deps
  bundle: true,  // ← Bundle everything
  noExternal: ['uuid'], // ← Specifically bundle uuid
};
```

### Alternative Fix:
Downgrade `uuid` dependency to v9.x which supports CommonJS:
```json
{
  "dependencies": {
    "uuid": "^9.0.0"
  }
}
```

### Testing:
```javascript
// Should work after fix:
const { createLaunchpadSDK } = require('@gala-chain/launchpad-sdk');
```

**Environment:**
- Node.js: v20.11.1
- SDK: v3.12.1
- uuid (in node_modules): v10+ (ESM-only)

Thank you for the quick v3.12.1 update! We're very close to having full CommonJS compatibility. 🎉

---

## 🎯 Current Status

| Issue | Status | Notes |
|-------|--------|-------|
| SDK has no CJS build | ✅ **FIXED** in v3.12.1 | `index.cjs.js` now exists |
| CJS build can be imported | ❌ **Still fails** | Dependency chain issue |
| uuid dependency | ❌ **Blocking** | ESM-only in v10+ |
| MCP Server | ❌ **Still broken** | Not updated yet |

---

## ⏭️ Next Steps

### For You:
1. **Send updated bug report** (see above) to SDK maintainers
2. **Mention v3.12.1 progress** - they made good effort!
3. **Wait for next SDK update** (hopefully v3.12.2 or v3.13.0)

### For SDK Team:
1. Bundle dependencies or downgrade uuid
2. Test CommonJS import works
3. Fix MCP server with same approach
4. Release v3.12.2

---

## 💬 Quick Message Template

```
Hi team! Great progress on v3.12.1 - love seeing the index.cjs.js file!

Unfortunately still getting an error when using the CommonJS build:
The CJS file tries to require('uuid') but uuid v10+ is ESM-only.

Quick fix: Bundle uuid into your dist files instead of requiring it externally.

Details: [attach this file]

Thanks for the quick response on the original issue! 🙏
```

---

**Status:** Almost there! SDK team is responsive and making progress. 🚀





