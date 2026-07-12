# Voicomp Project Memory

## Current Position

- All 19 Phase 0 master tasks are complete, independently reviewed, committed,
  synchronized to GitHub, and read back from remote `main`.
- Phase 1 planning is active; all 29 Phase 1 implementation tasks remain
  unchecked and no Phase 1 production code exists yet.
- Authoritative task cursor: `docs/BUILD_PLAN.md`.
- Authoritative roadmap state: 265 total tasks, 19 checked in Phase 0, and zero
  checked in Phases 1-16.
- No extension production code exists.

## Repository

- Workspace: `D:\projekty AI\voice_project_companion`.
- GitHub: https://github.com/fortenemy/voicomp
- Branch: local `main`, tracking `origin/main`.
- The reviewed Phase 0 history through
  `1638123f88b86673bde76d26172017ce85b5a165` was pushed to `origin/main` as a
  normal fast-forward and confirmed by both Git and the GitHub connector.
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
- The official Node.js 24 LTS patch observed on 2026-07-12 is `v24.18.0`;
  the local `v24.9.0` runtime must be updated before lockfile generation.
- Secrets, workspace authority, tools, and mutations stay in the Extension
  Host; the Webview owns browser media and UI only. Cross-boundary data requires
  runtime validation, and mutations require explicit approval.
- Phase 1 is offline. Phase 3 will use an Extension Host-minted short-lived
  Realtime client secret and WebRTC, preferring `@openai/agents/realtime`
  behind the provider abstraction.
- Keep the single extension workspace-capable. In a remote window, detected by
  `vscode.env.remoteName`, Voicomp must not accept, retrieve, or transmit the
  standard API key, mint a client secret, or start a live provider session.
  Remote workspace features remain capability-aware; a future local credential
  broker plus remote workspace helper requires a separate approved design.
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

- Commit `665b397` records the initial Phase 0 closure boundary. The Phase 0
  decision series before that boundary is `3116d74`, `4f81090`, `c11a3da`,
  `bb8b840`, `a0fd969`, `9c7032c`, and `93095ab`.
- The initial Task 3 review had four Important findings covering phase-status
  wording, standard-key transfer disclosure, categorical logging prohibition,
  and future Tool Registry/Storage contracts; the re-review after `93095ab`
  was clean.
- The whole-branch review after `665b397` found stale snapshot wording, an
  unresolved remote-credential boundary, a missing provider/billing human
  action, and stale Node patch evidence. Commit `1638123` incorporates those
  corrections; its independent re-review had no Critical, Important, or Minor
  findings.
- Git and GitHub connector readback confirmed remote `main` at `1638123` after
  the fast-forward push. The implementation plan now lives at
  `docs/superpowers/plans/2026-07-12-voicomp-phase-1.md`; implementation remains
  at the first unchecked manifest task.

## Next Unchecked Task

`Create a TypeScript VS Code extension manifest`.
