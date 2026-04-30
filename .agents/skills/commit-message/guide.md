# Commit Message Skill Guide

## How to Use

### Option 1: Generate Message Only

Get a suggested conventional commit message based on your changes:

```bash
# View what type, scope, and message the skill suggests
# User reviews and can modify before committing manually
```

**Skill analyzes**:
- Modified files and their paths
- git diff (what code changed)
- New vs modified vs deleted files
- Patterns in the code changes

**Output**:
```
Suggested commit message:

  type: feat
  scope: rewards
  subject: add redemption endpoint
  
  Full message:
  feat(rewards): add redemption endpoint
  
  Validates customer points, deducts reward cost, and creates
  transaction record. Handles insufficient points gracefully.
```

### Option 2: Generate & Auto-Commit

Commit all changes automatically with a generated conventional message:

```bash
# Skill stages all changes and creates commit
# Uses git add --all and git commit
```

**What happens**:
1. Analyzes current changes
2. Generates commit message
3. Stages with `git add --all`
4. Commits with message
5. Includes Co-authored-by trailer

## Type Detection Algorithm

The skill infers commit type by analyzing code changes:

### `feat` (New Feature)
Detected when:
- New files added (except tests, config, docs)
- New exported functions/classes
- API endpoints added
- Database schema additions
- New routes, pages, or components

**Example**: Adding `app/api/rewards/redeem/route.ts`

### `fix` (Bug Fix)
Detected when:
- Error handling added
- Edge case handling (null checks, validation)
- Logic corrections
- Bug-specific comments in code
- Tests added to verify fix

**Example**: Adding null check in customer search filter

### `refactor` (Code Restructure)
Detected when:
- Functionality unchanged
- Files moved/renamed
- Functions extracted/combined
- Import statements reorganized
- Internal logic reorganized

**Example**: Extracting QueryBuilder into separate file

### `test` (Test Changes)
Detected when:
- `.test.ts`, `.spec.ts` files changed
- Test directory modifications
- Test helpers/utilities added

**Example**: Adding test cases for auth flow

### `docs` (Documentation)
Detected when:
- Only `.md` files changed
- Comments/JSDoc updated (without code changes)
- README, CHANGELOG, etc.

**Example**: Updating API documentation

### `chore` (Maintenance)
Detected when:
- `package.json`, `tsconfig.json` changed
- Build config files modified
- CI/CD config changes
- Dependency updates
- Linting config changes

**Example**: Upgrading Next.js in package.json

### `perf` (Performance)
Detected when:
- Caching added (Redis, memory)
- Query optimization
- Bundle size optimization
- Memoization added
- Lazy loading implemented

**Example**: Adding Redis caching layer

### `style` (Code Style)
Detected when:
- Formatting changes only
- Whitespace/indentation
- Naming conventions applied
- No logic changes

**Example**: Running eslint --fix

### `ci` (CI/CD)
Detected when:
- GitHub Actions workflows
- GitHub config
- CI/CD scripts
- Release workflows

**Example**: Adding new GitHub Actions job

### `build` (Build System)
Detected when:
- Next.js config changes
- Vite/Webpack config
- Turbopack settings
- Build scripts

**Example**: Configuring Turbopack options

## Scope Detection Algorithm

Scope is inferred from file paths and code patterns:

### From Directory Structure
```
app/
  ├── api/
  │   ├── auth/[...path]/      → scope: auth
  │   ├── rewards/[...path]/   → scope: rewards
  │   ├── customers/[...path]/ → scope: customers
  │   └── admin/[...path]/     → scope: admin
  ├── auth/
  │   └── [path]/page.tsx      → scope: auth
  ├── admin/
  │   └── page.tsx             → scope: admin
  └── components/
      ├── auth/                → scope: auth
      ├── rewards/             → scope: rewards
      └── customer/            → scope: customer
lib/
  ├── auth/                    → scope: auth
  ├── db/                      → scope: db
  └── prisma/                  → scope: prisma
```

### From File Names
```
auth.ts, auth.tsx, AuthProvider.tsx → scope: auth
customer.ts, customer.prisma        → scope: customer
rewards-api.ts, rewards-schema.ts   → scope: rewards
qr-generator.ts, qr.utils.ts       → scope: qr
```

### From Code Patterns
```typescript
// Import analysis
import { auth } from "@/lib/auth"     → scope: auth
import { prisma } from "@/lib/prisma" → scope: prisma

// Export/function analysis
export function earnPoints()          → scope: rewards (inferred from context)
export const createCustomer()         → scope: customer
```

### Scope Priority (if multiple areas changed)
1. **Largest change**: Area with most modified code
2. **New files**: If new files added in specific area
3. **API routes**: If API endpoints changed
4. **Multiple scopes**: Use most significant, mention others in body

**Example**: If auth, customer, and rewards all changed → pick largest area as scope

## Subject Generation

Subject is generated as imperative mood description:

**Rules**:
- Imperative mood: "add", "fix", "update", "refactor" (not "added", "fixes")
- Lowercase first letter
- No period at end
- Keep under 50 characters
- Specific but concise

**Generated subjects**:
```
feat(rewards): add redemption endpoint
fix(customer): handle null email in search
refactor(db): simplify query builder
docs(api): update rewards documentation
test(auth): add login flow test cases
```

## Body Generation

Body provides context from code analysis:

**Extracted from**:
- Changed function names and purposes
- Comments in modified code
- Error messages added
- Logic changes between old and new code

**Example generated body**:
```
Implements POST /api/rewards/redeem endpoint. Validates customer
points balance against reward cost. Deducts points and creates
transaction record. Returns 400 if insufficient points.
```

## Breaking Changes

Skill detects breaking changes when:
- Function signatures changed incompatibly
- API endpoints removed or changed
- Database schema changes (columns dropped, type changed)
- Export names removed or changed
- Config format changed

**Generated footer**:
```
BREAKING CHANGE: Points calculation now uses purchase_amount * 0.1
instead of flat 1 point per purchase.
```

## Examples from Real Changes

### Example 1: New Rewards Endpoint

**Files changed**:
```
app/api/rewards/redeem/route.ts (NEW)
lib/rewards/redeem.ts (NEW)
```

**Detected**:
- Type: `feat` (new files)
- Scope: `rewards` (directory path)
- Subject: "add redemption endpoint"

**Generated**:
```
feat(rewards): add redemption endpoint

Implements POST /api/rewards/redeem endpoint. Validates customer
points balance, deducts reward cost, and creates transaction record.
Returns 400 error if customer has insufficient points.
```

### Example 2: Bug Fix in Customer Search

**Files changed**:
```
lib/db/queries.ts (MODIFIED - null check added)
app/components/customer-search.tsx (MODIFIED - error handling)
__tests__/customer-search.test.ts (NEW - test cases)
```

**Detected**:
- Type: `fix` (error handling + test coverage)
- Scope: `customer` (from file path)
- Subject: "handle null email in search filter"

**Generated**:
```
fix(customer): handle null email in search filter

Customer search would crash when filtering by null email value.
Now properly validates and skips null values. Prevents database
query errors and improves UX with clear error message.

Adds test cases to prevent regression.
```

### Example 3: Dependency Update

**Files changed**:
```
package.json (MODIFIED - version bump)
pnpm-lock.yaml (MODIFIED - lockfile update)
```

**Detected**:
- Type: `chore` (dependency management)
- Scope: `deps` (conventional for dependencies)
- Subject: "upgrade Next.js to v16"

**Generated**:
```
chore(deps): upgrade Next.js to v16

Updates Next.js from 15.2 to 16.2.4. Includes Turbopack improvements
and performance enhancements. See changelog for details.
```

## Git Integration

### Staging Strategy
Uses `git add --all` to stage everything:
- Includes new files
- Includes modified files
- Includes deleted files
- Respects .gitignore

### Commit with Trailer
Commits include Co-authored-by trailer:
```
feat(rewards): add redemption endpoint

[body]

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

This ensures Copilot is credited as co-author.

## Tips for Best Results

1. **Make focused changes** — Commits work better when changes are related
2. **Run tests first** — Helps skill understand if it's a fix vs refactor
3. **Use meaningful file names** — Helps scope detection
4. **Organize in clear directories** — Better scope inference
5. **Review generated message** — Tweak if needed before committing
6. **Use for documentation** — Generated messages help future developers

## Troubleshooting

### Scope Detection Off?
- Ensure files are in appropriately named directories
- Check file names follow project conventions
- Large multi-area changes: skill picks largest area

### Type Detection Wrong?
- Large commits confuse analysis — split into smaller logical commits
- Add specific variable/function names that clarify intent
- Add comments explaining the change type

### Subject Too Long?
- Scope detection scope shows "add..."
- Keep changes focused to one area
- Complex changes work better as multiple commits

