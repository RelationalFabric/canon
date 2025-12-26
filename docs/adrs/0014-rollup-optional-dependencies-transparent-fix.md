# ADR-0014: Rollup Optional Dependencies Transparent Fix

- Status: accepted
- Date: 2025-01-27

## Context and Problem Statement

The package uses VitePress and Vitest as dependencies, which transitively depend on Rollup. Rollup uses platform-specific optional dependencies (e.g., `@rollup/rollup-linux-x64-gnu`, `@rollup/rollup-darwin-arm64`) for native binaries. 

npm has a known bug with optional dependencies (https://github.com/npm/cli/issues/4828) where `npm ci` fails on different architectures with errors like:

```
Error: Cannot find module @rollup/rollup-linux-x64-gnu. npm has a bug related to optional dependencies.
```

This bug affects:
- CI/CD pipelines running on different architectures than where `package-lock.json` was generated
- Downstream packages that depend on canon
- Local development when switching between architectures

The primary requirement is **100% transparency for downstream dependencies** - consumers of canon should not need to know about or work around this npm bug.

## Decision Drivers

- **Transparency**: Downstream packages must work without manual intervention or workarounds
- **Reliability**: CI/CD must work consistently across all architectures
- **Simplicity**: Solution should not require scripts, postinstall hooks, or workflow modifications
- **Maintainability**: Solution should be declarative and self-documenting
- **Performance**: Acceptable to install platform packages even if not strictly necessary

## Considered Options

### Option 1: Workaround Scripts in CI/CD Workflows

Add fallback logic in GitHub Actions workflows to run a fix script if `npm ci` fails:

```yaml
- run: npm ci || (npm run fix:rollup-deps && npm ci)
```

**Pros:**
- Works for canon's own CI/CD
- No changes to package.json

**Cons:**
- ❌ Not transparent for downstream dependencies
- ❌ Requires manual script maintenance
- ❌ Doesn't solve the problem for consumers
- ❌ Adds complexity to workflows

### Option 2: Postinstall Script Hook

Add a postinstall script that automatically installs missing platform packages:

```json
"postinstall": "scripts/fix-rollup-deps.sh"
```

**Pros:**
- Runs automatically after install
- Works for both `npm install` and `npm ci`

**Cons:**
- ❌ Doesn't run if `npm ci` fails before postinstall
- ❌ Still requires script maintenance
- ❌ Adds execution overhead to every install
- ❌ Not guaranteed to work in all environments

### Option 3: npm Overrides

Use npm's `overrides` field to force install platform packages:

```json
"overrides": {
  "rollup": {
    "@rollup/rollup-linux-x64-gnu": "$rollup"
  }
}
```

**Pros:**
- Declarative configuration
- No scripts needed

**Cons:**
- ❌ Overrides don't work well with optional dependencies
- ❌ Complex syntax for multiple packages
- ❌ May not solve the root issue

### Option 4: Direct optionalDependencies Declaration

Declare all Rollup platform packages directly in `package.json` as `optionalDependencies`:

```json
"optionalDependencies": {
  "@rollup/rollup-linux-x64-gnu": "^4.52.3",
  "@rollup/rollup-darwin-arm64": "^4.52.3",
  // ... all platform packages
}
```

**Pros:**
- ✅ 100% transparent - works automatically for all consumers
- ✅ No scripts or workarounds needed
- ✅ Pure npm configuration
- ✅ Works with all package managers
- ✅ Self-documenting in package.json
- ✅ Minimal performance impact (only installs current platform)

**Cons:**
- ⚠️ Slightly larger package.json
- ⚠️ Requires version synchronization with Rollup updates

## Decision Outcome

Chosen option: **Option 4 - Direct optionalDependencies Declaration**

This approach provides 100% transparency for downstream dependencies while maintaining simplicity and reliability. The solution is declarative, requires no scripts or workflow modifications, and works automatically for all consumers of canon.

### Positive Consequences

- **Complete transparency**: Downstream packages work without any knowledge of the npm bug
- **Zero maintenance**: No scripts to maintain or update
- **Universal compatibility**: Works with `npm install`, `npm ci`, and all package managers
- **Self-documenting**: The solution is visible in package.json
- **Reliable CI/CD**: Works consistently across all architectures
- **Minimal overhead**: npm only installs the package for the current platform

### Negative Consequences

- **Package.json size**: Adds 8 entries to optionalDependencies (acceptable trade-off)
- **Version synchronization**: Need to update versions when Rollup is updated (handled by dependency updates)
- **Slight performance cost**: Installing platform packages even when not strictly needed (minimal impact)

## Implementation Details

### Package.json Changes

Added all Rollup platform-specific packages to `optionalDependencies`:

```json
{
  "optionalDependencies": {
    "@rollup/rollup-darwin-arm64": "^4.52.3",
    "@rollup/rollup-darwin-x64": "^4.52.3",
    "@rollup/rollup-linux-x64-gnu": "^4.52.3",
    "@rollup/rollup-linux-x64-musl": "^4.52.3",
    "@rollup/rollup-win32-arm64-msvc": "^4.52.3",
    "@rollup/rollup-win32-ia32-msvc": "^4.52.3",
    "@rollup/rollup-win32-x64-gnu": "^4.52.3",
    "@rollup/rollup-win32-x64-msvc": "^4.52.3",
    "defu": "^6.1.4"
  }
}
```

### Version Synchronization

The Rollup platform package versions are synchronized with the Rollup version used by VitePress/Vitest. When these dependencies are updated, the platform package versions should be updated to match.

### Workflow Simplification

All GitHub Actions workflows were simplified to use standard `npm ci` without any workarounds:

```yaml
- name: Install dependencies
  run: npm ci
```

### Removed Components

- Removed `postinstall` script hook for Rollup fix
- Removed `fix:rollup-deps` npm script
- Removed `scripts/fix-rollup-deps.sh` (can be deleted)
- Removed all workflow fallback logic

## Verification

The solution was verified to work:
- ✅ Local development on macOS (ARM64)
- ✅ CI/CD on Linux (x64)
- ✅ Downstream packages installing canon
- ✅ `npm install` and `npm ci` both work correctly

## Links

- [npm optional dependencies documentation](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#optionaldependencies)
- [npm bug report: optional dependencies issue](https://github.com/npm/cli/issues/4828)
- [Rollup platform-specific packages](https://github.com/rollup/rollup/tree/master/packages)

