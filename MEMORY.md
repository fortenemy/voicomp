# Voicomp Project Memory

## Current Position

- All 19 Phase 0 master tasks are complete. Boundary verification, memory, log,
  commit, GitHub synchronization, and remote readback remain in progress until
  the Phase 0 boundary is pushed and verified.
- Phase 1 has not started.
- Authoritative task cursor: `docs/BUILD_PLAN.md`.
- Authoritative roadmap state: 265 total tasks, 19 checked in Phase 0, and zero
  checked in Phases 1-16.
- No extension production code exists.

## Repository

- Workspace: `D:\projekty AI\voice_project_companion`.
- GitHub: https://github.com/fortenemy/voicomp
- Branch: local `main`, tracking `origin/main`.
- Before the Phase 0 boundary commit, local `main` is 10 commits ahead of
  `origin/main`; no local Phase 0 commit has been pushed.
- Remote commit `0fb01b72e031d8c0e34607770bc717c475945ccb` contains the
  authoritative MIT license. Local history was reconciled onto that commit
  without force or parallel ancestry.

## Decisions

- Display name: `Voicomp`.
- Local package contract: publisher `fortenemy`, package `voicomp`, target
  extension ID `fortenemy.voicomp`, and `voicomp.*` contribution namespace.
- The physical workspace path remains unchanged despite its older path token.
- The repository owner selected the MIT License; `LICENSE` is authoritative.
- `docs/BUILD_PLAN.md` is the task source of truth, `AGENTS.md` is the durable
  contributor workflow, this file is the concise snapshot, and
  `docs/IMPLEMENTATION_LOG.md` is the append-only evidence history.
- A task is checked only after evidence. Update the build plan after each
  verified task and update this memory plus the implementation log at every
  phase or session boundary.
- Use Node.js 24 LTS, `engines.vscode` `^1.95.0`, and
  `@types/vscode` pinned to `1.95.x`.
- Secrets, workspace authority, tools, and mutations stay in the Extension
  Host; the Webview owns browser media and UI only. Cross-boundary data requires
  runtime validation, and mutations require explicit approval.
- Phase 1 is offline. Phase 3 will use an Extension Host-minted short-lived
  Realtime client secret and WebRTC, preferring `@openai/agents/realtime`
  behind the provider abstraction.
- Cursor compatibility is a manual test target, not an assumed guarantee.

## Verified Environment

- Node.js: `v24.9.0`, observed with `node --version` on 2026-07-12.
- VS Code CLI: `1.127.0`, observed with `code --version` on 2026-07-12.
- Cursor CLI: `3.10.20`, observed with `cursor --version` on 2026-07-12.
- Git safe-directory handling: the repository-specific global value
  `D:/projekty AI/voice_project_companion` resolves the ownership mismatch
  between the `CodexSandboxOnline` process identity and the `fortenemy`
  workspace-owner SID.
- Native Ralph loop: unavailable; neither `ralph-loop` nor `ralph` resolves as
  a command in the current PowerShell environment.
- Registry checks on 2026-07-12: the target VS Code Marketplace page and Open
  VSX endpoint returned HTTP `404`. This is availability evidence only.

## Known Limitations

- No production code, package manifest, npm scripts, OpenAI connection,
  microphone capture, workspace tooling, edit path, terminal path, or release
  automation exists yet.
- Phase 1 npm checks are not applicable until Phase 1 creates their scripts.
- Local Node.js `v24.9.0` must be updated within Node.js 24 LTS before Phase 1
  generates the dependency lockfile.
- No extension has been packaged, manually platform-tested, or published.
- Publishing accounts, credentials, tokens, legal/privacy approval, and final
  publication approval remain human-controlled actions.
- Publisher ownership, immutable identifier approval, and registry availability
  must be rechecked before publication.

## Last Completed Boundary

- Latest completed committed boundary: Task 3 review resolution in `93095ab`.
  The Phase 0 decision series is `3116d74`, `4f81090`, `c11a3da`,
  `bb8b840`, `a0fd969`, `9c7032c`, and `93095ab`.
- The initial Task 3 review had four Important findings covering phase-status
  wording, standard-key transfer disclosure, categorical logging prohibition,
  and future Tool Registry/Storage contracts; the re-review after `93095ab`
  was clean.
- All Phase 0 master tasks are complete. The current boundary bookkeeping is
  staged but not committed or pushed, and Phase 1 remains unopened.

## Next Unchecked Task

`Create a TypeScript VS Code extension manifest`.
