#!/bin/bash
# Fix for npm ci bug with Rollup optional dependencies
# See: https://github.com/npm/cli/issues/4828
#
# This script installs the missing Rollup platform-specific optional dependencies
# that npm ci fails to install due to a bug with optional dependencies.
# It's idempotent and safe to run multiple times.

set -e

# Check if rollup is installed (either directly or in node_modules)
HAS_ROLLUP=false
if [ -d "node_modules/rollup" ] || [ -d "node_modules/.bin/rollup" ] || npm list rollup --depth=0 >/dev/null 2>&1; then
  HAS_ROLLUP=true
fi

# If rollup isn't present, there's nothing to fix
if [ "$HAS_ROLLUP" = false ]; then
  exit 0
fi

# Get the rollup version
ROLLUP_VERSION=""
if [ -f "package-lock.json" ]; then
  # Try to extract rollup version from package-lock.json using node
  ROLLUP_VERSION=$(node -p "try { require('./package-lock.json').packages['node_modules/rollup']?.version || require('./package-lock.json').dependencies?.rollup?.version || '' } catch(e) { '' }" 2>/dev/null || echo "")
fi

if [ -z "$ROLLUP_VERSION" ] && [ -f "package-lock.json" ]; then
  # Try alternative: grep for rollup version in package-lock.json
  ROLLUP_VERSION=$(grep -A 5 '"node_modules/rollup"' package-lock.json | grep '"version"' | head -1 | sed 's/.*"version": "\([^"]*\)".*/\1/' || echo "")
fi

if [ -z "$ROLLUP_VERSION" ]; then
  # Try to get version from installed rollup package
  if [ -f "node_modules/rollup/package.json" ]; then
    ROLLUP_VERSION=$(node -p "require('./node_modules/rollup/package.json').version" 2>/dev/null || echo "")
  fi
fi

# Determine platform-specific package name for current platform
PLATFORM_PKG=""
case "$(uname -s)" in
  Linux*)
    case "$(uname -m)" in
      x86_64) PLATFORM_PKG="@rollup/rollup-linux-x64-gnu" ;;
      arm64|aarch64) PLATFORM_PKG="@rollup/rollup-linux-arm64-gnu" ;;
    esac
    ;;
  Darwin*)
    case "$(uname -m)" in
      arm64) PLATFORM_PKG="@rollup/rollup-darwin-arm64" ;;
      x86_64) PLATFORM_PKG="@rollup/rollup-darwin-x64" ;;
    esac
    ;;
  MINGW*|MSYS*|CYGWIN*)
    PLATFORM_PKG="@rollup/rollup-win32-x64-msvc"
    ;;
esac

# Check if the required platform-specific package is already installed and working
NEEDS_INSTALL=true
if [ -n "$PLATFORM_PKG" ]; then
  if [ -d "node_modules/$PLATFORM_PKG" ]; then
    # Verify the package is actually loadable (not just a directory)
    if node -e "require('$PLATFORM_PKG')" >/dev/null 2>&1; then
      # Check if it's the right version
      if [ -n "$ROLLUP_VERSION" ] && [ -f "node_modules/$PLATFORM_PKG/package.json" ]; then
        INSTALLED_VERSION=$(node -p "require('./node_modules/$PLATFORM_PKG/package.json').version" 2>/dev/null || echo "")
        if [ "$INSTALLED_VERSION" = "$ROLLUP_VERSION" ]; then
          NEEDS_INSTALL=false
        fi
      else
        # Package exists and is loadable, assume it's fine
        NEEDS_INSTALL=false
      fi
    fi
  fi
fi

# If platform package is missing, wrong version, or not loadable, install all platform packages
# This ensures CI works across different architectures
# Always install all platform packages to ensure cross-platform compatibility in CI
if [ "$NEEDS_INSTALL" = true ] || [ -z "$PLATFORM_PKG" ]; then
  if [ -z "$ROLLUP_VERSION" ]; then
    # Install all common platform packages to ensure compatibility across CI environments
    npm install --no-save --legacy-peer-deps \
      @rollup/rollup-linux-x64-gnu \
      @rollup/rollup-linux-x64-musl \
      @rollup/rollup-darwin-arm64 \
      @rollup/rollup-darwin-x64 \
      @rollup/rollup-win32-x64-msvc \
      @rollup/rollup-win32-x64-gnu \
      @rollup/rollup-win32-arm64-msvc \
      @rollup/rollup-win32-ia32-msvc \
      >/dev/null 2>&1 || echo "⚠️  Some platform packages may have failed to install (this is expected for optional dependencies)"
  else
    # Install platform-specific packages matching the installed version
    npm install --no-save --legacy-peer-deps \
      "@rollup/rollup-linux-x64-gnu@$ROLLUP_VERSION" \
      "@rollup/rollup-linux-x64-musl@$ROLLUP_VERSION" \
      "@rollup/rollup-darwin-arm64@$ROLLUP_VERSION" \
      "@rollup/rollup-darwin-x64@$ROLLUP_VERSION" \
      "@rollup/rollup-win32-x64-msvc@$ROLLUP_VERSION" \
      "@rollup/rollup-win32-x64-gnu@$ROLLUP_VERSION" \
      "@rollup/rollup-win32-arm64-msvc@$ROLLUP_VERSION" \
      "@rollup/rollup-win32-ia32-msvc@$ROLLUP_VERSION" \
      >/dev/null 2>&1 || echo "⚠️  Some platform packages may have failed to install (this is expected for optional dependencies)"
  fi
fi

