# Voicomp Project Memory

## Current Position

- All 19 Phase 0 master tasks are complete and synchronized to remote history.
- Phase 1 remains in progress: 28 of 29 tasks are checked after Task 24,
  `Add npm run watch`, was reopened because clean Ctrl+C termination was not
  observed. Task 29 remains checked from the inspected local VSIX evidence.
- The Phase 1 manual acceptance gate remains open. Manual F5/UI, message
  round-trip, Output Channel, clean installed VS Code, and Cursor evidence has
  not been recorded.
- Phase 2 is untouched and unauthorized until the Phase 1 stopping point is
  satisfied and the user gives an explicit instruction.
- `docs/BUILD_PLAN.md` is the authoritative task cursor. The repository has 265
  roadmap tasks: Phase 0 is 19/19 checked, Phase 1 is 28/29 checked, and Phases
  2-16 have zero checked tasks.

## Repository and Git State

- Workspace: `D:\projekty AI\voice_project_companion`.
- GitHub: https://github.com/fortenemy/voicomp
- Branch: local `main`, tracking `origin/main`.
- At the 2026-07-13 review-fix boundary, local `HEAD` is
  `da63c7965acaaa8ed4f7e66eaf843c416bbeafb2` and `origin/main` is
  `0f483e18cc52be327e09188f6f469f367f704bc2`; local `main` is 16 commits ahead
  before the uncommitted final-review fixes. No Phase 1 commit was pushed or
  published in this session.
- The remote Phase 0 history includes the reviewed and synchronized boundary;
  the local Phase 1 commit series runs from `c21aab8` through `da63c79`.
- MIT remains the authoritative license. The physical workspace path remains
  unchanged.

## Implemented Phase 1 Surface

- The repository contains a strict TypeScript VS Code extension manifest,
  separate Extension Host and Webview bundles, ESLint, Prettier, Vitest, the
  official VS Code integration harness, build/watch/test/package scripts,
  editor launch tasks, an offline Activity Bar/sidebar shell, runtime-validated
  typed messages, restrictive Webview CSP, sanitized Output Channel logging,
  a setting, and an informational API-key placeholder.
- Phase 1 has no provider or external network call, API-key input or storage,
  microphone capture, workspace read/search/list, mutation, terminal action,
  telemetry, or publication path.
- The local artifact is
  `D:\projekty AI\voice_project_companion\artifacts\voicomp.vsix`.
  Its SHA-256 is
  `2BD2795526138889EFCA1E39FD0DF8ECC172A8CEDE8F71F95F955D962DCA52C4`.
- The VSIX passed exact-content and secret-shape inspection and registered by
  CLI in isolated VS Code 1.127.0 and Cursor 3.10.20 directories. CLI
  registration is not visible UI acceptance.

## Environment and Dependency Evidence

- Development Node.js: `v24.18.0` from
  `C:\tmp\voicomp-node-v24.18.0\runtime\node-v24.18.0-win-x64`.
- Development npm: `11.16.0`, with process-local `npm_config_os=win32`,
  `npm_config_cpu=x64`, and an isolated npm cache.
- End users installing the VSIX do not need Node.js; they need a supported
  editor. VS Code `1.127.0` and Cursor `3.10.20` CLIs were observed locally,
  and the package engine floor remains VS Code `^1.95.0`.
- The full dependency audit reports four development-tree findings: two low,
  one moderate, and one high, through
  `@vscode/test-cli@0.0.15 > mocha@11.7.6 > diff@7.0.0` and
  `serialize-javascript@6.0.2`. The production audit reports zero
  vulnerabilities; runtime dependency `zod@4.4.3` is not affected.
- Install scripts for `@vscode/vsce-sign@2.0.9`, `esbuild@0.28.1`, and optional
  `keytar@7.9.0` are not repository-approved in Phase 1. They remain deferred
  and risk-tracked; no allow-scripts policy or dependency pin change was added.

## Architecture and Security Decisions

- Product identifiers remain display name `Voicomp`, publisher `fortenemy`,
  package `voicomp`, target extension ID `fortenemy.voicomp`, and the
  `voicomp.*` contribution namespace.
- Secrets, workspace authority, tools, and future mutations stay in the
  Extension Host. The Webview owns presentation and future browser media only.
  Cross-boundary data requires runtime validation; future mutations require
  explicit approval.
- Remote live-provider work must fail closed whenever `vscode.env.remoteName`
  is defined. A future local credential broker plus remote helper requires a
  separate approved design and security review.
- Cursor compatibility is a manual test target, not an assumed guarantee.

## Open Evidence and Next Task

- Required manual evidence: F5 Extension Development Host launch; Activity Bar
  and sidebar visibility; mock state and transcript rendering; Webview/Host
  round-trip; sanitized Voicomp Output Channel behavior; and clean installed VS
  Code and Cursor UI smoke tests.
- Required Task 24 evidence: clean Ctrl+C termination of `npm run watch`.
- Exact next unchecked task: `Add npm run watch`.
- Do not claim Phase 1 complete, begin Phase 2, push, or publish without the
  remaining evidence and explicit authorization.
