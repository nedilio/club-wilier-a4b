---
name: commit-message
description: Generate conventional commit messages by analyzing code changes, auto-detect type (feat/fix/docs/etc) and scope, stage all files, and create git commits with proper formatting and Co-authored-by trailers.
---

# Conventional Commits Skill

Automatically generate, stage, and commit code changes following the Conventional Commits specification.

## Quick Start

### Generate a Commit Message

```bash
# Analyze staged/unstaged changes and suggest a conventional commit message
# The skill will detect type, scope, and body from code diffs
```

### Commit with Conventional Format

```bash
# Stage all changes and create a commit with conventional message
# Includes Co-authored-by: Copilot trailer
# Format: type(scope): subject
#
# Optional body and footers
```

## Conventional Commits Format

```
type(scope): subject

[optional body]

[optional footers]
```

### Type
Required. Describes the kind of change:

| Type | Purpose | Example |
|------|---------|---------|
| `feat` | New feature | `feat(auth): add OAuth login` |
| `fix` | Bug fix | `fix(api): handle null responses` |
| `docs` | Documentation only | `docs(readme): update setup guide` |
| `style` | Code style (no behavior change) | `style(ui): format button spacing` |
| `refactor` | Code restructure (no new feature/fix) | `refactor(db): simplify query builder` |
| `perf` | Performance improvement | `perf(cache): add Redis caching` |
| `test` | Add/update tests | `test(auth): add login flow tests` |
| `chore` | Maintenance, deps, build config | `chore(deps): upgrade Next.js to v16` |
| `ci` | CI/CD changes | `ci: add GitHub Actions workflow` |
| `build` | Build system, tooling | `build: configure Turbopack settings` |

### Scope
Optional but recommended. Specifies the area/module affected:

Examples: `auth`, `api`, `ui`, `db`, `prisma`, `neon`, `admin`, `customer`, `rewards`, `qr`

### Subject
Concise change description:
- Use imperative mood ("add" not "added" or "adds")
- Don't capitalize first letter
- No period at the end
- Keep under 50 characters

### Body
Optional. Detailed explanation:
- Wrap at 72 characters
- Explain why, not what (code shows what)
- Can reference issues: "Closes #123"

### Footers
Optional. Metadata about the commit:
- `BREAKING CHANGE: description` — signals major version bump
- `Closes #123` — links to GitHub issue
- `Fixes #456` — alternative to Closes
- `Co-authored-by: Name <email>` — multiple authors

## Examples

### Simple Feature
```
feat(customer): add email verification

Implement email verification for customer registration. Users receive
a one-time code sent to their email. Verification is required before
accessing the loyalty program.

Closes #42
```

### Bug Fix
```
fix(qr): handle expired tokens gracefully

Previously expired QR tokens would throw 500 error. Now returns
401 Unauthorized with helpful message directing users to re-register.

Fixes #89
```

### Breaking Change
```
feat(api)!: change points calculation formula

BREAKING CHANGE: Points are now calculated as purchase_amount * 0.1
instead of flat 1 point per purchase. Existing memberships unaffected.

Migration: Update customer loyalty tier expectations.
```

### Multiple Scopes (use multiple commits)
```
feat(rewards): add reward categories
refactor(admin): simplify rewards dashboard
docs(api): document rewards endpoints
```

## Skill Capabilities

### 1. Analyze Changes
- Scans git diff and file changes
- Groups modifications by area
- Detects patterns (new files, deletions, modifications)

### 2. Suggest Type
- `feat`: new files, new functions/features
- `fix`: bug fixes, error handling additions
- `docs`: markdown/comment changes only
- `refactor`: structural changes
- `test`: new test files/cases
- `chore`: dependency, config changes
- `perf`: optimization, caching additions
- `style`: formatting, linting changes

### 3. Infer Scope
- From directory structure: `components/`, `lib/`, `app/api/`, etc
- From file names: `auth.ts`, `customer.prisma`, `rewards.tsx`
- From code patterns: function names, imports, class names

### 4. Auto-Stage & Commit
- Stages all changes with `git add --all`
- Creates commit with generated message
- Adds `Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>` trailer

## Usage Examples

### Scenario 1: Quick Feature Commit
```
User changes: Added new reward redemption endpoint

Skill detects:
- Type: feat (new API endpoint)
- Scope: rewards (from file path app/api/rewards/redeem)
- Subject: add redemption endpoint
- Body: Analyzes logic from diff

Result:
feat(rewards): add redemption endpoint

Implements POST /api/rewards/redeem endpoint. Validates customer points,
deducts reward cost, and creates transaction record.
```

### Scenario 2: Bug Fix with Multiple Files
```
User changes: Fixed null pointer in customer search and updated tests

Skill detects:
- Primary type: fix (bug correction)
- Scope: customer (from affected files)
- Body: Includes what was broken and fix applied
- Analyzes test changes for validation logic

Result:
fix(customer): handle null email in search filter

Customer search would crash when filtering by null email. Now properly
validates and skips null values. Tests added to prevent regression.
```

### Scenario 3: Refactoring
```
User changes: Reorganized database query builder, no behavior change

Skill detects:
- Type: refactor (restructure, no feature/fix)
- Scope: db (from affected module)
- Subject: simplify query builder structure

Result:
refactor(db): simplify query builder

Reorganized QueryBuilder methods into logical groups. No behavior change.
Makes code easier to maintain and test. All tests still passing.
```

## Best Practices

1. **One logical change per commit** — Each commit should represent one thing
2. **Test before committing** — Run tests to ensure changes work
3. **Meaningful scopes** — Use consistent scope names across project
4. **Descriptive subjects** — Help future developers understand intent
5. **Reference issues** — Link to GitHub issues in footers
6. **Breaking changes** — Always signal with `BREAKING CHANGE` footer

## Reference

- [Conventional Commits Spec](https://www.conventionalcommits.org/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#-commit-message-guidelines)