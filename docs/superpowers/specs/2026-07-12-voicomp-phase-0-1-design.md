# Voicomp Phase 0-1 Design

**Status:** Approved direction, pending written-spec review

**Date:** 2026-07-12

**Workspace:** `D:\projekty AI\voice_project_companion`

## Source of truth

The attached Master Build Instruction is the authoritative product roadmap and
task list. Work must follow its phases and checkboxes in order. This design
only resolves how Phase 0 and Phase 1 will be executed; it does not replace or
expand the master instruction.

The final product name is **Voicomp**. The existing workspace path remains
unchanged. Product-facing text and new identifiers must use `Voicomp` or the
`voicomp` namespace. No provisional product name may be introduced into
repository files.

## Scope and stopping point

This implementation cycle contains only:

1. Phase 0 — repository initialization and decision records.
2. Phase 1 — a minimal installable VS Code extension.
3. Full Phase 1 verification and local VSIX packaging.
4. A completion report followed by a mandatory stop.

Phase 2 and later work is excluded until the user explicitly authorizes it.
There will be no OpenAI integration, microphone capture, live audio, network
request, workspace file access, edit application, Git mutation command, or
terminal execution feature in this cycle.

## Execution workflow

`docs/BUILD_PLAN.md` will copy every phase and task from the Master Build
Instruction, from Phase 0 through Phase 16, into a persistent checkbox list.
Every task will use `- [ ]` while open and `- [x]` only after verification.
Names will be normalized to Voicomp without changing task meaning. Work will
select one unchecked task at a time and will only mark it complete after its
acceptance evidence exists.

For each coherent change:

1. Read `AGENTS.md` and `docs/BUILD_PLAN.md`.
2. Implement the smallest relevant change.
3. Run the narrowest relevant check.
4. Update documentation and acceptance evidence.
5. Mark only verified tasks complete.
6. At each completed phase or session boundary, append a dated entry to
   `docs/IMPLEMENTATION_LOG.md` and refresh the concise project snapshot in
   `MEMORY.md`.

The completed Phase 1 report will list changed files, commands, test results,
the exact VSIX path, architecture, limitations, decisions, and new risks.

## Naming contract

- Display name: `Voicomp`
- npm/extension package-name target: `voicomp`
- Command, view, configuration, and internal contribution namespace:
  `voicomp.*`
- Output channel: `Voicomp`
- Activity Bar and sidebar labels: `Voicomp`
- Physical workspace path: unchanged

The package identifier will be checked against the VS Code Marketplace and
Open VSX during Phase 0. A local-only publisher value will be used for Phase 1
packaging and recorded in `docs/HUMAN_ACTIONS.md`; publication remains blocked
until the user supplies and approves a registered publisher ID.

The repository owner selected the MIT License in the initial GitHub commit.
The extension manifest and documentation will use `MIT` consistently.

## Phase 0 deliverables

Phase 0 will initialize Git and create the repository-level `AGENTS.md`,
complete build plan, human-action register, product specification,
architecture, security, privacy, implementation log, project `MEMORY.md`, and
initial ADR documents required by the master instruction and user direction.

`AGENTS.md` will require every contributor and delegated agent to read the
current build-plan checkbox before editing, preserve phase order, run the
required verification, and update the checklist, implementation log, and
memory snapshot at the required boundaries.

The ADRs will record at least:

1. Webview and Extension Host trust boundary.
2. Realtime transport direction for a later phase.
3. BYOK authentication and SecretStorage boundary.

Current external decisions will be verified against primary sources and dated
in the relevant document. These include the supported development Node.js
release, minimum VS Code engine, official OpenAI Realtime browser connection
flow, direct Realtime API versus the current OpenAI Agents SDK, package ID
availability, and Cursor compatibility assumptions.

Cursor compatibility will be documented as a test target, never as an
unverified guarantee.

## Phase 1 architecture

Phase 1 will use one npm package and two runtime bundles:

```text
VS Code / Cursor
  Extension Host bundle
    activation and disposal
    command registration
    output channel
    WebviewViewProvider
    message validation and routing
  validated postMessage boundary
  Webview bundle
    minimal themed UI
    mock connection state
    mock transcript
    round-trip connection check
```

The implementation will keep files small and responsibilities explicit:

- `src/extension.ts` is the composition root.
- `src/commands/` owns command IDs and registration.
- `src/ui/` owns Webview registration and HTML generation.
- `src/shared/` owns cross-boundary message schemas and types.
- `webview/` owns browser-side state, DOM rendering, and message handling.
- `test/unit/` owns isolated logic tests.
- `test/integration/` owns VS Code Extension Host tests.

No provider, tool, context-engine, editing, Git, or terminal subsystem will be
implemented early. Documentation may describe their future boundaries without
creating unused production abstractions.

## Message and UI flow

The sidebar will be registered as a `WebviewViewProvider`. The Open Assistant
command will reveal and focus the contributed Voicomp view.

On view creation:

1. The Extension Host creates HTML with a per-render nonce, restrictive CSP,
   and extension-local resource URIs.
2. The Webview posts a typed `webview.ready` message.
3. The Extension Host validates the message and responds with typed initial
   state containing a mock connection state and mock transcript entry.
4. The Webview validates the response and renders it with DOM text APIs.
5. A user-triggered connection check performs a typed request/response round
   trip so message transport can be verified manually and in isolated tests.

Messages will be discriminated unions backed by Zod schemas. Invalid or
unknown messages will be rejected intentionally and logged without including
payload contents.

## Webview security

Phase 1 will apply the security boundary required by the master instruction:

- `default-src 'none'` CSP with only required local script and style sources.
- A cryptographically generated per-render script nonce.
- Restricted `localResourceRoots` covering only packaged UI resources.
- No inline executable code and no remote resource URLs.
- No use of `innerHTML` for workspace- or message-derived content.
- Runtime validation in both directions across `postMessage`.
- No API key input, storage, transmission, or logging in the Webview.
- No telemetry and no external network request.
- Explicit disposal of subscriptions and view resources.

The Phase 1 API-key command is informational only. It will explain that secure
key setup is introduced in Phase 3; it will not request, store, or transmit a
key prematurely.

The Output Channel will log lifecycle events, message kinds, and sanitized
errors. It will not log complete message payloads, source text, secrets, or
authentication data.

## Build and test design

- TypeScript uses strict mode and performs type checking without emission.
- esbuild creates separate Extension Host and Webview bundles.
- ESLint and Prettier enforce source and configuration consistency.
- Vitest runs isolated unit tests.
- The official VS Code test CLI and Electron harness run integration tests.
- `@vscode/vsce` creates the local VSIX.

Required scripts will include `build`, `watch`, `lint`, `typecheck`, `test`,
and `package`, plus narrow unit and integration test scripts where useful.

Unit coverage will include message schema acceptance and rejection, message
routing, safe state rendering inputs, and CSP/HTML invariants. Integration
coverage will include activation, command registration, and sidebar provider
registration. The Webview round trip will also have a visible manual smoke
path.

Before Phase 1 is reported complete, the following must succeed from the
checked-in lockfile and documented environment:

```text
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm run package
```

The generated package will be inspected for unexpected files and secret-like
content, installed into an isolated VS Code extensions directory, and checked
with the available Cursor CLI. Any UI behavior that cannot be proven through
automation will remain uncompleted and be recorded as a manual human action;
acceptance criteria will not be claimed from installation alone.

## Error handling

Activation, view creation, message parsing, and command execution errors will
be handled deliberately. User-facing messages will be concise and actionable;
sanitized technical details will go to the Output Channel. Unknown messages
will not crash the extension. Disposed views will not retain active listeners.

Build, test, package, and installation failures will stop the current task.
They will be diagnosed before any checklist item is marked complete.

## Acceptance boundary

Phase 0 is complete only when all required documents exist, external decisions
are dated and sourced, and human-only decisions are tracked explicitly.

Phase 1 is complete only when all master-instruction acceptance criteria have
evidence. A generated VSIX alone is insufficient: lint, type checking, tests,
build, message round trip, registration, clean-profile installation, package
inspection, and applicable Cursor checks must also pass.

After the Phase 1 report, work stops before Phase 2.
