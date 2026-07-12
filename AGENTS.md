# Repository Instructions

## Product

This repository contains Voicomp, a VS Code extension that provides a secure
real-time voice assistant with controlled access to the active workspace.

## Required workflow

- Read `docs/BUILD_PLAN.md` before making changes.
- Select the next unchecked task and work on one task at a time.
- Respect phase order and work only in the active phase.
- Use TypeScript strict mode for production code.
- Keep Webview, Extension Host, provider, tools, and security boundaries separate.
- Validate all external and cross-boundary data with runtime schemas.
- Never expose or log API keys, tokens, source files, or microphone audio.
- Never perform mutating actions without explicit approval.
- Do not add unrestricted shell execution or proposed VS Code APIs.
- Run the narrowest relevant checks before marking a task complete.
- After Phase 1 creates npm scripts, run lint, typecheck, tests, and build before completing a phase.
- For Phase 0, run the documented Markdown, naming, checkbox-count, and Git checks.
- For release phases, also run package verification.
- Update `docs/BUILD_PLAN.md` after every verified task.
- Update `docs/IMPLEMENTATION_LOG.md` and `MEMORY.md` after every phase or session.
- Do not publish or use external credentials without explicit authorization.
- Treat Cursor compatibility as a tested target, not an assumption.

## Agent handoff

Every delegated agent must read this file and the current task in
`docs/BUILD_PLAN.md`, stay within that task, report files and checks, and avoid
marking checkboxes or committing unless explicitly assigned.
