# Voicomp Phase 1 Implementation Plan

> **For Codex:** Execute this plan with `superpowers:subagent-driven-development`
> and `superpowers:test-driven-development`. Keep
> `docs/BUILD_PLAN.md` authoritative and check each of its 29 Phase 1 tasks only
> after task-specific evidence.

**Goal:** Build the first offline, installable Voicomp VS Code extension with an
Activity Bar container, secure sidebar Webview, typed round-trip mock messages,
automated checks, and a locally verified VSIX.

**Architecture:** Produce two esbuild bundles: a CommonJS Extension Host bundle
targeting Node 20 and a browser Webview bundle targeting Chromium 128/ES2022.
The Host owns VS Code APIs, commands, logging, message validation, and disposal.
The Webview owns only accessible presentation and mock UI interactions. Zod
schemas validate both message directions. Do not create provider, SecretStorage,
microphone, workspace-tool, editing, Git, terminal, telemetry, or network code.

**Tech stack:** Node.js `24.18.0`, npm `11.16.0`, TypeScript `6.0.3`, esbuild
`0.28.1`, Zod `4.4.3`, ESLint `10.7.0`, Prettier `3.9.5`, Vitest `4.1.10`,
jsdom `29.1.1`, official VS Code test CLI/Electron harness, and VSCE `3.9.2`.

**Repository policy:** Work in the existing physical path and on the existing
`main` history. Use small reviewed commits and normal fast-forward pushes only.
Do not rename the workspace, publish the extension, request an API key, or begin
Phase 2.

---

## Task 1: Establish the verified toolchain and manifest

**Master tasks:** 1-7 — manifest, strict TypeScript, esbuild, ESLint, Prettier,
Vitest, and official integration harness.

**Files:**

- Create: `.nvmrc`
- Create: `package.json`
- Create: `package-lock.json`
- Create: `tsconfig.base.json`
- Create: `tsconfig.extension.json`
- Create: `tsconfig.webview.json`
- Create: `tsconfig.unit.json`
- Create: `test/integration/tsconfig.json`
- Create: `scripts/esbuild.mjs`
- Create: `eslint.config.mjs`
- Create: `.prettierrc.json`
- Create: `.prettierignore`
- Create: `vitest.config.ts`
- Create: `.vscode-test.mjs`
- Create: `test/fixtures/workspace/.gitkeep`
- Create: `test/integration/harness.test.ts`
- Modify: `.gitignore`

### Step 1: Use the selected Node/npm runtime

Download the official `node-v24.18.0-win-x64.zip` to a temporary directory,
download `SHASUMS256.txt`, verify the ZIP SHA-256 before extraction, and prepend
the extracted directory to `PATH` for every Phase 1 npm command. Verify:

```powershell
node --version
npm --version
```

Expected: `v24.18.0` and `11.16.0`. Record `24.18.0` in `.nvmrc`.

### Step 2: Create exact package metadata

Use these immutable local identifiers:

```text
publisher: fortenemy
name: voicomp
displayName: Voicomp
version: 0.0.1
extension id: fortenemy.voicomp
engines.vscode: ^1.95.0
extensionKind: ["workspace"]
main: ./dist/extension.js
```

Reserve these later contribution identifiers in this plan, but do not add their
manifest contributions early: `voicomp` Activity Bar container,
`voicomp.assistant` Webview view, commands `voicomp.openAssistant` and
`voicomp.setOpenAIApiKey`, and setting `voicomp.logging.level`. The initial
manifest contains only base extension/package metadata, entry point, engine, and
workspace placement. Tasks 9-11 and 18-19 add each contribution in checklist
order after its own RED test.

Pin production dependency `zod@4.4.3`. Pin dev dependencies exactly:

```text
typescript@6.0.3
esbuild@0.28.1
eslint@10.7.0
@eslint/js@10.0.1
typescript-eslint@8.63.0
globals@17.7.0
prettier@3.9.5
vitest@4.1.10
jsdom@29.1.1
@vscode/test-cli@0.0.15
@vscode/test-electron@3.0.0
@vscode/vsce@3.9.2
@types/vscode@1.95.0
@types/node@20.17.58
@types/mocha@10.0.10
```

`@types/node` intentionally matches the Node 20 Extension Host line, not the
Node 24 development runtime. `typescript-eslint` requires TypeScript `<6.1.0`,
which is why TypeScript 7 is not selected.

Use a temporary writable npm cache, install exact pins, and generate the
lockfile. Do not add runtime dependencies other than Zod.

### Step 3: Configure strict, runtime-specific TypeScript

`tsconfig.base.json` enables `strict`, `noUncheckedIndexedAccess`,
`exactOptionalPropertyTypes`, `useUnknownInCatchVariables`, `noImplicitOverride`,
`noFallthroughCasesInSwitch`, and no emit by default.

- Extension config: ES2022 library, Node 20 and VS Code types.
- Webview config: ES2022 plus DOM libraries, no Node or VS Code types.
- Unit config: Vitest types and the source/test surface.
- Integration config: CommonJS output under `out/test/integration`, Mocha, Node,
  and VS Code types.

### Step 4: Configure two esbuild targets

`scripts/esbuild.mjs` creates:

```text
src/extension.ts -> dist/extension.js
webview/main.ts -> dist/webview/main.js
webview/styles.css -> dist/webview/styles.css
```

Host options: `platform: "node"`, `format: "cjs"`, `target: "node20"`, and
`external: ["vscode"]`. Webview options: `platform: "browser"`, target
`chrome128`, and no Host imports. Production removes source maps and minifies;
watch retains source maps and rebuilds both targets.

### Step 5: Configure lint, format, unit, and integration harnesses

- Flat ESLint covers TypeScript and scripts, with runtime-specific globals,
  zero warnings, and an AST restriction on every `innerHTML` member access.
- Prettier checks only Phase 1-owned source, tests, scripts, package/editor
  configuration, and `README.md`. `.prettierignore` excludes generated output,
  `docs/**`, `MEMORY.md`, `AGENTS.md`, `LICENSE`, and `.superpowers/**`; existing
  Phase 0 control-plane formatting must not trigger an unrelated broad rewrite.
- Vitest uses Node by default and jsdom only for Webview DOM tests.
- `.vscode-test.mjs` has labels `minimum` (`1.95.0`) and `current`
  (`1.127.0`), both using `out/test/integration/**/*.test.js` and the isolated
  fixture workspace.

Run the harness smoke test only after its compiler exists. It may initially fail
until VS Code is downloaded; network use belongs to test tooling, not extension
runtime.

### Step 6: Verify and check tasks in order

Verify JSON parsing, strict config, esbuild config loading, ESLint config loading,
Prettier, Vitest discovery, integration compilation, and `vscode-test --help`.
Then check Phase 1 master tasks 1-7 individually and commit:

```text
chore: configure phase one toolchain
```

---

## Task 2: Implement typed mock contracts first

**Master tasks:** prerequisite for tasks 13-15; do not check those tasks yet.

**Files:**

- Create test first: `test/unit/messages.test.ts`
- Create after RED: `src/shared/messages.ts`
- Create test first: `test/unit/mockState.test.ts`
- Create after RED: `src/shared/mockState.ts`

### Step 1: RED — message schemas

Write tests for strict, direction-specific Zod discriminated unions:

```text
Webview -> Host
  webview.ready(requestId UUID)
  webview.connectionCheck(requestId UUID, sessionId UUID)

Host -> Webview
  host.initialState(requestId, sessionId, mock connection, transcript)
  host.connectionCheckResult(requestId, sessionId, mock_ready)
  host.error(optional requestId, fixed code, bounded safe message)
```

Valid messages must parse. Unknown variants/keys, malformed UUIDs, missing
fields, incorrect roles/states, and oversized strings must fail. Run the narrow
Vitest file and record the expected RED failure before implementation.

### Step 2: GREEN — minimal schemas and mock state

Implement only the schemas/types and one immutable mock state:

```text
connection: mock_disconnected
transcript: one packaged assistant entry
```

No user content, persistence, provider type, or future abstraction. Rerun narrow
tests and the whole unit suite.

---

## Task 3: Implement the Extension Host shell

**Master tasks:** 8-11 — activate/deactivate, Activity Bar, Webview view, Open
Assistant command.

**Files:**

- Create test first: `test/unit/commands.test.ts`
- Create after RED: `src/commands/commandIds.ts`
- Create after RED: `src/commands/registerCommands.ts`
- Create after RED: `src/commands/openAssistantCommand.ts`
- Create test first: `test/unit/viewProvider.test.ts`
- Create after RED: `src/ui/VoicompViewProvider.ts`
- Create test first: `test/integration/extension.test.ts`
- Create after RED: `src/extension.ts`
- Create: `media/voicomp.svg`
- Modify: `package.json`

### Step 1: RED/GREEN — command behavior

Test that Open Assistant executes the exact generated focus command
`voicomp.assistant.focus`. Inject only the narrow command executor needed for the
unit test. Implement the smallest handler and registration function.

### Step 2: RED/GREEN — provider registration and disposal

Test a minimal Webview provider registration seam without adding test-only
production getters. Implement provider construction and idempotent disposal only;
HTML/message behavior follows in Task 4.

### Step 3: RED/GREEN — real Extension Host activation

Compile an integration test that discovers `fortenemy.voicomp`, activates it,
asserts both command IDs and manifest contributions, and executes the view focus
command without rejection. Observe RED before `activate()` exists, then implement
the composition root and `deactivate()`.

Check master tasks 8-11 only after their unit/integration evidence, then commit:

```text
feat: add Voicomp extension shell
```

---

## Task 4: Build the secure offline Webview with TDD

**Master tasks:** 12-16 — minimal UI, mock state, mock transcript, typed message
passing, and restrictive CSP. Tasks 15 and 16 are one atomic security slice.

**Files:**

- Create test first: `test/unit/createWebviewHtml.test.ts`
- Create after RED: `src/ui/createWebviewHtml.ts`
- Create test first: `test/unit/messageRouter.test.ts`
- Create after RED: `src/ui/WebviewMessageRouter.ts`
- Create test first: `test/unit/webview.test.ts`
- Create after RED: `webview/main.ts`
- Create after RED: `webview/styles.css`
- Modify: `src/ui/VoicompViewProvider.ts`

### Step 1: RED/GREEN — accessible static HTML and CSP

Test for heading, status region, transcript list, and connection-check button.
Test fresh nonces, one nonce-bearing local script, exact
`default-src 'none'`, local style source, no remote URL, no inline handler,
`unsafe-inline`, `unsafe-eval`, key input, or untrusted HTML insertion.

Implement HTML using only static packaged text and Webview-generated local URIs.
Set `localResourceRoots` to `dist/webview` only and enable scripts only together
with CSP and disposal.

### Step 2: RED/GREEN — Host router

Test that `webview.ready` returns a correlated initial state and new session UUID;
a valid connection check returns `mock_ready`; invalid, unknown, stale-session,
late, or disposed input fails closed. Outbound candidates are revalidated before
posting. Logs contain only event categories, never payloads.

### Step 3: RED/GREEN — Webview controller and safe render

In jsdom, test that the Webview posts ready once, validates Host messages, accepts
only matching request/session values, and ignores malformed, duplicate, or stale
responses. Render transcript text through `createElement`, `textContent`, and
`replaceChildren`. A string such as `<img src=x onerror=alert(1)>` must remain
literal text and create no image. Events use `addEventListener`; disposal removes
listeners.

Check master tasks 12-16 in order only after the atomic CSP/message slice is
green, then commit:

```text
feat: add secure offline assistant view
```

---

## Task 5: Add bounded logging, settings, and key placeholder

**Master tasks:** 17-19 — Output Channel logging, settings, placeholder API-key
command.

**Files:**

- Create test first: `test/unit/logging.test.ts`
- Create after RED: `src/logging/logLevel.ts`
- Create after RED: `src/logging/OutputLogger.ts`
- Create test first: `test/unit/apiKeyPlaceholder.test.ts`
- Create after RED: `src/commands/setApiKeyPlaceholderCommand.ts`
- Modify: `src/commands/registerCommands.ts`
- Modify: `src/extension.ts`
- Modify: `package.json`

### Step 1: RED/GREEN — allowlisted logs and setting

Test `off | error | info`, missing/invalid fallback to `info`, and Output Channel
messages limited to fixed lifecycle/category strings plus bounded numeric counts
or generated identifiers. Do not accept raw objects, provider payloads, Error
messages/stacks, paths, source, prompts, transcript, or credentials.

### Step 2: RED/GREEN — informational key command

Test that `voicomp.setOpenAIApiKey` only displays fixed text explaining that secure
BYOK begins in Phase 3. It must not call input boxes, SecretStorage, environment
readers, `fetch`, a provider, or the Webview.

Check master tasks 17-19 after tests and integration command discovery, then
commit:

```text
feat: add offline operational controls
```

---

## Task 6: Complete docs, packaging surface, and scripts

**Master tasks:** 20-28 — README, `.vscodeignore`, `vscode:prepublish`, build,
watch, lint, typecheck, test, and package scripts.

**Files:**

- Create test first: `test/unit/manifest.test.ts`
- Modify: `README.md`
- Create: `.vscodeignore`
- Create: `.vscode/launch.json`
- Create: `.vscode/tasks.json`
- Modify: `package.json`

### Step 1: RED/GREEN — manifest and script gates

Extend the manifest test one item at a time and observe RED before adding each
exact script:

```json
{
  "build": "npm run typecheck && node ./scripts/esbuild.mjs --production",
  "watch": "node ./scripts/esbuild.mjs --watch",
  "lint": "npm run lint:code && npm run lint:format",
  "lint:code": "eslint . --max-warnings=0",
  "lint:format": "prettier --check .",
  "typecheck": "tsc -p tsconfig.extension.json && tsc -p tsconfig.webview.json && tsc -p tsconfig.unit.json",
  "test:unit": "vitest run",
  "test:integration": "npm run build && tsc -p test/integration/tsconfig.json && vscode-test",
  "test": "npm run test:unit && npm run test:integration",
  "vscode:prepublish": "npm run build",
  "package": "vsce package --no-dependencies --out artifacts/voicomp.vsix"
}
```

Add `test:integration:minimum` and `test:integration:current` labels if narrow
reruns are needed. Avoid a script-runner dependency.

### Step 2: README and editor launch

Document install/development commands, F5, offline mock behavior, Output Channel,
package path, no key input/no network/no microphone/no workspace access, and the
remote live-BYOK limitation. `launch.json` uses `extensionHost` with
`--extensionDevelopmentPath=${workspaceFolder}` and a build prelaunch task.

### Step 3: Package allowlist

`.vscodeignore` must leave only package metadata, `README.md`, `LICENSE`,
`dist/**`, and `media/**`. Exclude `.vscode`, `.github`, `.superpowers`,
`node_modules`, `src`, `webview`, `test`, `docs`, `out`, `coverage`, `artifacts`,
source maps, TypeScript/config files, lockfile, logs, environment/credential files,
and existing VSIX files.

For each master task 20-28, run the exact command or inspect the exact file before
checking it. For `watch`, observe both initial builds and one rebuild, then stop it
cleanly. Commit:

```text
chore: add Phase one build and package workflow
```

---

## Task 7: Produce and inspect the first VSIX

**Master task:** 29 — first local VSIX, followed by all Phase 1 acceptance gates.

### Step 1: Clean reproducibility run

Use the verified Node/npm runtime and a temporary npm cache:

```powershell
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm exec -- vsce ls --tree --no-dependencies
npm run package
```

Stop at the first failure and use systematic debugging before changing code.

### Step 2: Inspect the VSIX

Copy the VSIX to a temporary `.zip`, expand it, list files, calculate SHA-256, and
assert that the manifest `main` file exists. Reject source/test/docs/node_modules,
TypeScript, maps, environment or key files, logs, configs, nested VSIX files, or
credential-shaped values. Secret scans print filenames only, never matched values.

### Step 3: Isolated VS Code and Cursor installation

Use fresh temporary `--user-data-dir` and `--extensions-dir` paths. Install the
VSIX with `--force`, then require the exact list result
`fortenemy.voicomp@0.0.1` from both `code` and available `cursor` CLIs.

The official integration harness proves VS Code activation/contributions. CLI
installation proves artifact registration only. F5 key handling and visible UI in
VS Code/Cursor remain manual facts unless actually observed; never relabel CLI
installation as a manual UI smoke test.

### Step 4: Mandatory manual acceptance gate

Phase 1 cannot be declared complete from automation alone. Record direct manual
evidence for every applicable item:

1. Press F5 from this repository and confirm an Extension Development Host opens.
2. In that Host, confirm the Voicomp Activity Bar icon and sidebar appear.
3. Confirm the mock connection state and transcript render as text.
4. Click the connection-check control and confirm the visible round trip plus
   sanitized Voicomp Output Channel event.
5. Open the isolated clean VS Code installation of the VSIX and repeat the
   Activity Bar/sidebar/mock/round-trip smoke.
6. Because Cursor is locally available, open the isolated Cursor installation and
   repeat the same UI smoke; record exact version and any limitation.

If the executing agent cannot observe these UI facts, it must stop at this evidence
gate, keep Phase 1 completion open, provide the exact checklist and VSIX to the
user, and request the missing manual results. It must not mark the acceptance
criteria or Phase 1 boundary complete.

### Step 5: Phase boundary and review

- Check master task 29 only after the VSIX exists and package inspection passes.
- Run the entire 29-item evidence map and all acceptance commands again.
- Request independent spec and code/security review; fix and reverify findings.
- Require all automated checks and the mandatory manual acceptance evidence above
  before declaring Phase 1 complete or writing completion wording in current
  snapshots.
- Update Phase 1 notes in `docs/BUILD_PLAN.md`, append
  `docs/IMPLEMENTATION_LOG.md`, refresh `MEMORY.md`, and write the approved Codex
  memory update.
- Commit and push through a normal fast-forward, then read back GitHub.
- Present created files, commands, results, VSIX location, architecture, and known
  limitations.
- Stop before Phase 2 and wait for explicit user instruction.

---

## Required acceptance evidence

Phase 1 is complete only when fresh output proves:

```text
Node v24.18.0 / npm 11.16.0 used for lockfile and checks
npm ci succeeds
npm run lint succeeds
npm run typecheck succeeds
npm test succeeds at VS Code 1.95.0 and 1.127.0
npm run build succeeds
both runtime bundles exist
VSIX package allowlist and secret scan pass
VSIX installs in isolated VS Code and Cursor directories
Activity Bar/view/commands are registered by real Extension Host tests
F5 launches the Extension Development Host by direct observation
Activity Bar, sidebar, mock state/transcript, and round trip pass manual VS Code smoke
the clean-profile installed VSIX passes manual VS Code smoke
the installed VSIX passes manual Cursor 3.10.20 UI smoke
all 29 Phase 1 tasks have evidence
Phase 2 remains unchecked
```

Any missing manual item blocks Phase 1 completion; it is not a permissible known
limitation for this phase. Once every automated and manual item is evidenced, the
mandatory stopping point applies after the Phase 1 report.
