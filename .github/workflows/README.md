# GitHub Actions Workflows

This directory contains CI/CD workflows for the Canon project.

## Workflows

### PR Checks (`pr-checks.yml`)

Runs on pull requests to `main` and `develop` branches. This workflow ensures all code quality checks pass before merging.

**Jobs:**

1. **lint-and-typecheck**
   - Runs TypeScript type checking
   - Runs ESLint with reviewdog integration
   - Reports errors inline in PR reviews using reviewdog
   - Fails if any TypeScript or ESLint errors are found

2. **test**
   - Runs unit tests (`npm run test`)
   - Runs integration tests/examples (`npm run example`)
   - Ensures all tests pass

3. **coverage**
   - Generates test coverage reports
   - Uploads coverage to Codecov (if configured)
   - Provides coverage metrics

4. **all-checks-passed**
   - Meta-job that depends on all other jobs
   - Ensures all checks passed before allowing merge
   - Provides clear status indicator

**Features:**

- ✅ Inline PR review comments via reviewdog
- ✅ TypeScript error reporting
- ✅ ESLint error reporting with auto-fix suggestions
- ✅ Test results with detailed output
- ✅ Coverage reports

### CI (`ci.yml`)

Runs on pushes to `main` and `develop` branches. This workflow validates the codebase after merges.

**Jobs:**

1. **lint-and-typecheck** - Type checking and linting
2. **test** - Unit and integration tests
3. **coverage** - Coverage reporting

**Triggers:**

- Push to `main` or `develop`
- Manual workflow dispatch

## Reviewdog Integration

[Reviewdog](https://github.com/reviewdog/reviewdog) provides automated code review comments directly in PRs.

### TypeScript Errors

TypeScript errors are reported using the `tsc` formatter:

```yaml
- name: Report TypeScript errors with reviewdog
  run: |
    cat typescript.log | reviewdog -f=tsc -name="TypeScript" \
      -reporter=github-pr-review -level=error -fail-on-error=true
```

**Example output in PR:**

```
src/example.ts:10:5
error TS2322: Type 'string' is not assignable to type 'number'.
```

### ESLint Errors

ESLint uses the dedicated reviewdog action:

```yaml
- name: Run ESLint with reviewdog
  uses: reviewdog/action-eslint@v1
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    reporter: github-pr-review
    eslint_flags: .
    fail_on_error: true
```

**Features:**

- Inline comments on specific lines
- Auto-fix suggestions when available
- Severity levels (error, warning, info)
- Direct links to ESLint rules

## Required Checks

To enforce these checks in GitHub:

1. Go to **Settings** → **Branches** → **Branch protection rules**
2. Add rule for `main` and `develop` branches
3. Enable **Require status checks to pass before merging**
4. Select required checks:
   - `lint-and-typecheck`
   - `test`
   - `coverage`
   - `all-checks-passed`
5. Enable **Require branches to be up to date before merging**

## Permissions

The workflows require these permissions:

- `contents: read` - Read repository contents
- `pull-requests: write` - Comment on PRs
- `checks: write` - Create check runs

These are configured in the workflow files.

## Secrets

Optional secrets for enhanced functionality:

### CODECOV_TOKEN

Upload coverage reports to Codecov:

1. Sign up at [codecov.io](https://codecov.io)
2. Add your repository
3. Copy the token
4. Add to **Settings** → **Secrets and variables** → **Actions**
5. Create secret named `CODECOV_TOKEN`

### GITHUB_TOKEN

Automatically provided by GitHub Actions. No configuration needed.

## Local Testing

Test workflows locally using [act](https://github.com/nektos/act):

```bash
# Install act
brew install act  # macOS
# or
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Run PR checks workflow
act pull_request -W .github/workflows/pr-checks.yml

# Run CI workflow
act push -W .github/workflows/ci.yml
```

## Troubleshooting

### npm ci fails with Rollup optional dependencies error

**Error**: `Error: Cannot find module @rollup/rollup-linux-x64-gnu`

This is a known npm bug with optional dependencies (https://github.com/npm/cli/issues/4828). The package handles this transparently:

1. **Direct optionalDependencies**: All Rollup platform-specific packages are declared directly in `package.json` as `optionalDependencies`
2. **Transparent for consumers**: When other packages depend on canon, npm automatically installs the appropriate platform packages during installation
3. **No scripts needed**: No postinstall scripts or manual fixes required - npm handles it natively

**For consumers of canon**: No action needed - npm automatically installs the correct platform packages during `npm install` or `npm ci`.

**Note**: This approach accepts a small performance cost (installing platform packages) to ensure 100% transparency and reliability across all architectures.

### TypeScript errors not showing in PR

1. Verify `GITHUB_TOKEN` has write permissions
2. Check workflow logs for reviewdog output
3. Ensure TypeScript is outputting to the log file

### ESLint reviewdog action fails

1. Verify ESLint configuration is valid
2. Check that all plugins are installed
3. Ensure Node.js version matches requirements (22+)

### Tests fail in CI but pass locally

1. Check Node.js version (must be 22+)
2. Verify all dependencies are in `package.json`
3. Check for environment-specific issues
4. Review test isolation (global state cleanup)

### Coverage upload fails

1. Verify `CODECOV_TOKEN` is set (optional)
2. Check coverage file generation
3. Review Codecov action logs
4. Note: `fail_ci_if_error: false` means this won't block PRs

## Workflow Optimization

### Caching

Dependencies are cached using `actions/setup-node@v4`:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '22'
    cache: npm # Caches node_modules
```

### Parallelization

Jobs run in parallel when possible:

- `lint-and-typecheck`, `test`, and `coverage` run simultaneously
- Reduces total CI time
- `all-checks-passed` waits for all to complete

### Fail Fast

Workflows fail fast on first error:

- TypeScript: `fail-on-error=true`
- ESLint: `fail_on_error: true`
- Tests: Default behavior
- Saves CI minutes

## Best Practices

1. **Keep workflows fast** - Current target: < 5 minutes
2. **Use caching** - npm dependencies cached automatically
3. **Parallel jobs** - Run independent checks simultaneously
4. **Clear naming** - Job and step names describe what they do
5. **Comprehensive checks** - Type check, lint, test, and coverage
6. **Inline feedback** - Reviewdog provides contextual comments
7. **Required checks** - Enforce via branch protection

## Monitoring

Monitor workflow performance:

1. Go to **Actions** tab in repository
2. View recent workflow runs
3. Check run duration and success rate
4. Review detailed logs for failures

**Target metrics:**

- Success rate: > 95%
- Average duration: < 5 minutes
- Time to feedback: < 2 minutes

## Future Enhancements

Potential improvements:

- [ ] Add matrix testing for multiple Node.js versions
- [ ] Add performance benchmarking
- [ ] Add dependency vulnerability scanning
- [ ] Add automated release workflows
- [ ] Add documentation deployment
- [ ] Add visual regression testing
