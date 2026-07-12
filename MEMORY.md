# Voicomp Project Memory

## Current Position

- Active phase: Phase 0 — Repository initialization and decision records.
- Authoritative task cursor: `docs/BUILD_PLAN.md`.
- Six Phase 0 tasks have evidence; Phase 1 and all later phases remain unopened.
- Phase 0 is limited to repository setup and documented product, architecture,
  security, privacy, compatibility, package, publisher, and licensing decisions.
- No extension production code is authorized before the Phase 0 documentation
  boundary is complete.

## Repository

- Workspace: `D:\projekty AI\voice_project_companion`.
- GitHub: https://github.com/fortenemy/voicomp
- Branch: local `main`, tracking `origin/main`.
- Repository origin: the local workspace began without project Git history. The
  original empty-remote assumption was superseded when the newly created origin
  gained the MIT-only commit `0fb01b72e031d8c0e34607770bc717c475945ccb`;
  local work was reconciled onto that commit without force or parallel history.

## Decisions

- Display name: `Voicomp`.
- Package-name target: `voicomp`.
- New command, view, configuration, and internal contribution identifiers use
  the `voicomp.*` namespace.
- The physical workspace path remains unchanged.
- The repository owner selected the MIT License; `LICENSE` is authoritative.
- `docs/BUILD_PLAN.md` is the task source of truth, `AGENTS.md` is the durable
  contributor workflow, this file is the concise snapshot, and
  `docs/IMPLEMENTATION_LOG.md` is the append-only evidence history.
- Cursor compatibility is a manual test target, not an assumed guarantee.

## Verified Environment

- Node.js: `v24.9.0`, observed with `node --version` on 2026-07-12.
- VS Code CLI: `1.127.0`, observed with `code --version` on 2026-07-12.
- Cursor CLI: `3.10.20`, observed with `cursor --version` on 2026-07-12.
- Native Ralph loop: unavailable; neither `ralph-loop` nor `ralph` resolves as
  a command in the current PowerShell environment.
- Git: local `main` tracks `origin/main`; the three baseline commits through
  `070066e6dfa2b74725e13f7a9abae273efab13e9` were inspected locally.

## Known Limitations

- Phase 0 is not complete. Product, architecture, security, privacy, ADR, API,
  compatibility, publisher, package-identifier, and remaining license-record
  tasks still require evidence.
- No production code, package manifest, npm scripts, OpenAI connection,
  microphone capture, workspace tooling, edit path, terminal path, or release
  automation exists yet.
- Phase 1 npm checks are not applicable until Phase 1 creates their scripts.
- No extension has been packaged, manually platform-tested, or published.
- Publishing accounts, credentials, tokens, legal/privacy approval, and final
  publication approval remain human-controlled actions.

## Last Completed Boundary

- Remote baseline: MIT commit `0fb01b72e031d8c0e34607770bc717c475945ccb`.
- Repository bootstrap: commit `7919cf4e964603b5e61d576dbd7103611ca42bd2`.
- Complete roadmap: commit `070066e6dfa2b74725e13f7a9abae273efab13e9`.
- Persistent workflow artifacts were created in the current Task 2 session;
  roadmap counts, checked-task policy, naming, Markdown structure, Git scope,
  and whitespace were validated before the session commit.
- Nothing has been pushed during this session.

## Next Unchecked Task

`Create docs/PRODUCT_SPEC.md`.
