# Implementation Details

## Architecture

The commit-message skill operates in two modes:

### Mode 1: Message Generation Only

- Analyzes git status and diffs
- Generates type, scope, and subject
- Returns message for user review
- User commits manually with `git commit -m "..."`

### Mode 2: Full Automation

- Performs Mode 1
- Stages with `git add --all`
- Commits with `git commit -m "..."`

## Core Algorithms

### Type Detection

```pseudocode
function detectType(changedFiles, diffs):
  if all_files_are_tests:
    return "test"
  if all_files_are_docs:
    return "docs"
  if has_chore_files (package.json, tsconfig, etc):
    return "chore"
  if has_ci_files (github actions):
    return "ci"
  if has_build_files (next.config, turbopack):
    return "build"

  if no_logic_changes_only_formatting:
    return "style"

  if has_error_handling_or_validation:
    return "fix"

  if has_new_functions_or_files:
    return "feat"

  if only_reorganized_code:
    return "refactor"

  if has_caching_or_optimization:
    return "perf"

  return "chore" // fallback
```

### Scope Detection

```pseudocode
function detectScope(changedFiles):
  scopes = []

  for each file in changedFiles:
    // Extract from directory path
    if file matches "app/api/{scope}/*":
      scopes += scope
    if file matches "lib/{scope}/*":
      scopes += scope
    if file matches "components/{scope}/*":
      scopes += scope

    // Extract from filename
    if file contains known pattern like "auth-", "customer-", "rewards-":
      scopes += pattern_name

  // Pick most common scope (most files changed in this area)
  return most_frequent_scope(scopes)
```

### Subject Generation

```pseudocode
function generateSubject(type, scope, diffs):
  if type == "feat":
    extract_new_exports(diffs) // find new function/class names
    return "add {export_name}"

  if type == "fix":
    extract_validation_or_error_handling(diffs)
    return "handle {problem} in {context}"

  if type == "refactor":
    find_main_change_pattern(diffs)
    return "simplify/extract/reorganize {what}"

  if type == "docs":
    return "update {file_description}"

  if type == "test":
    return "add {feature_name} tests"

  if type == "chore":
    if package.json changed:
      return "upgrade {package} to {version}"
    else:
      return "update {config_file}"

  if type == "perf":
    return "add {optimization_type}"

  if type == "style":
    return "format {target}"

  if type == "ci":
    return "add {workflow_name} workflow"

  if type == "build":
    return "configure {tool_name} settings"
```

### Body Generation

```pseudocode
function generateBody(type, diffs, changedFiles):
  sentences = []

  for each significant change in diffs:
    if removed_code:
      sentences += "Previously {behavior}. Now {new_behavior}."

    if new_function:
      sentences += extract_docstring_or_intent(new_function)

    if validation_added:
      sentences += "Added validation for {what}."

    if error_handling:
      sentences += "{error_case} now handled gracefully with {solution}."

  if type == "fix" and tests_added:
    sentences += "Adds tests to prevent regression."

  return join_sentences(sentences, limit_to_72_chars_per_line)
```

## Git Integration

### Staging

```bash
git add --all
```

Stages:

- New files
- Modified files
- Deleted files
- Respects .gitignore

### Committing

```bash
git commit \
  -m "feat(rewards): add redemption endpoint" \
  --trailer "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

### Error Handling

- If git add fails: catch and report unstaged files
- If git commit fails: report merge conflicts or other issues
- Rollback: user can `git reset` to undo if needed

## Analysis Example: Real Commit

**Changed Files**:

```
app/api/rewards/redeem/route.ts (NEW, 120 lines)
lib/rewards/redeem.ts (NEW, 85 lines)
lib/db/queries.ts (MODIFIED, +50 lines for validation)
prisma/schema.prisma (MODIFIED, schema change for transaction type)
__tests__/rewards.test.ts (NEW, 200 lines)
```

**Analysis Process**:

1. **Type Detection**
   - Has new .ts files (not test/doc/config)
   - Has validation logic added
   - Has test files
   - → Decision: `feat` (new files take priority) or `test`? → `feat` because main changes are new features

2. **Scope Detection**
   - `app/api/rewards/...` → scope: `rewards`
   - `lib/rewards/...` → scope: `rewards`
   - `__tests__/rewards.test.ts` → scope: `rewards`
   - → Decision: `rewards`

3. **Subject Generation**
   - New exports: `redeemReward()`, `validatePoints()`
   - Primary action: redemption endpoint
   - → Subject: "add redemption endpoint"

4. **Body Generation**
   - New endpoint for `/api/rewards/redeem`
   - Validates customer points balance
   - Deducts points and creates transaction
   - Test cases added
   - → Body: Multi-line explanation of functionality

5. **Result**

```
feat(rewards): add redemption endpoint

Implements POST /api/rewards/redeem endpoint. Validates customer
points balance against reward cost. Deducts points and creates
transaction record. Returns 400 if insufficient points.

Adds comprehensive test cases to verify endpoint behavior.

```

## Configuration

The skill respects project conventions:

- Uses existing `.gitignore` for staging
- Respects git hooks if configured
- Works with monorepos (detects root)
- Compatible with conventional commit tools like commitlint

## Future Enhancements

Potential improvements:

- Support for custom type definitions
- Scope suggestions from project config
- Integration with GitHub issues
- Emoji support (e.g., feat: 🎉)
- Multi-language messages
- Custom body templates
