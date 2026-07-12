# Voicomp Phase 0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the complete, persistent Phase 0 project foundation for Voicomp, including the user-requested README, Git ignore rules, full 265-task roadmap, agent instructions, project memory, implementation log, decision records, and conflict-free GitHub synchronization.

**Architecture:** Documentation and repository state are the control plane for all later implementation. `docs/BUILD_PLAN.md` is the authoritative task cursor, `AGENTS.md` defines contributor behavior, `MEMORY.md` stores the concise current snapshot, and `docs/IMPLEMENTATION_LOG.md` is append-only evidence. No extension production code is created in this plan.

**Tech Stack:** Git, GitHub, Markdown, PowerShell verification, official Node.js/OpenAI/VS Code/Cursor documentation.

## Global Constraints

- Product name is `Voicomp`; new product identifiers use `voicomp`.
- Keep the physical workspace path `D:\projekty AI\voice_project_companion` unchanged.
- Follow all phases and task text from the attached Master Build Instruction.
- `docs/BUILD_PLAN.md` must contain Phase 0 through Phase 16 and exactly 265 task checkboxes.
- Open tasks use `- [ ]`; only verified tasks use `- [x]`.
- Read `AGENTS.md` and the next unchecked build-plan task before every change.
- Append to `docs/IMPLEMENTATION_LOG.md` and refresh `MEMORY.md` at every completed phase or session boundary.
- Create a Codex memory update note at the permitted ad-hoc memory path after Phase 0 closes.
- Do not create extension production code, call OpenAI, publish an extension, or introduce credentials.
- Do not claim Cursor compatibility beyond verified local facts.
- Preserve the existing remote MIT `LICENSE` file and use `MIT` consistently.
- Do not push until remote ancestry and the exact local diff are re-verified.

---

## File Map

- Create `.gitignore`: repository, build, test, secret, editor, and local-loop exclusions.
- Create `README.md`: honest Phase 0 product overview and development status.
- Create `AGENTS.md`: durable repository workflow and verification rules.
- Create `MEMORY.md`: concise current project snapshot, decisions, limitations, and next task.
- Create `docs/BUILD_PLAN.md`: all 17 phases and all 265 task checkboxes.
- Create `docs/HUMAN_ACTIONS.md`: credentials, publisher, publication, legal/privacy, and manual test gates; record MIT as selected.
- Create `docs/IMPLEMENTATION_LOG.md`: append-only dated phase/session evidence.
- Create `docs/PRODUCT_SPEC.md`: product scope, goals, non-goals, and acceptance boundary.
- Create `docs/ARCHITECTURE.md`: runtime boundaries and planned data flow.
- Create `docs/SECURITY.md`: trust model, secrets, Webview, tools, logging, and workspace trust.
- Create `docs/PRIVACY.md`: data flow, persistence defaults, telemetry, and user controls.
- Create `docs/adr/0001-webview-and-extension-host-boundary.md`.
- Create `docs/adr/0002-openai-realtime-transport.md`.
- Create `docs/adr/0003-byok-authentication.md`.
- Modify `docs/superpowers/specs/2026-07-12-voicomp-phase-0-1-design.md`: retain memory/log requirements.
- Create a memory-update note outside the repository only after local staging and explicit filesystem approval.

---

### Task 1: Establish the Git foundation and requested root files

**Files:**
- Create: `.gitignore`
- Create: `README.md`
- Existing: `docs/superpowers/specs/2026-07-12-voicomp-phase-0-1-design.md`

**Interfaces:**
- Consumes: GitHub repository `fortenemy/voicomp` with one initial MIT-license commit and the approved Phase 0-1 design.
- Produces: local `main` branch, `origin`, safe ignore rules, and an honest public entry point.

- [ ] **Step 1: Re-verify local and remote starting state**

Run:

```powershell
git status -sb
git remote -v
git ls-remote --heads https://github.com/fortenemy/voicomp.git
```

Expected: local repository has no commits, the design and plan are the only existing content changes, and the remote reports `refs/heads/main` at `0fb01b72e031d8c0e34607770bc717c475945ccb`.

- [ ] **Step 2: Attach the local worktree to the existing remote history**

Run:

```powershell
git remote add origin https://github.com/fortenemy/voicomp.git
git fetch origin main
git switch -c main --track origin/main
git remote get-url origin
```

Expected: local `main` tracks `origin/main`, the remote `LICENSE` is present,
and all pre-existing local documentation changes remain intact.

- [ ] **Step 3: Create `.gitignore` with explicit safe defaults**

Create exactly these categories and entries:

```gitignore
# Dependencies
node_modules/

# Build and test output
dist/
out/
coverage/
.vscode-test/
.vscode-test-web/
*.tsbuildinfo
*.vsix

# Tool caches and logs
.eslintcache
.npm-cache/
*.log
npm-debug.log*

# Secrets and local configuration
.env
.env.*
!.env.example
*.pem
*.key
*.p12
*.pfx

# Local agent loop state
.claude/.ralph-loop.local.md

# Local agent orchestration state
.superpowers/
.codex-memory-update/
.worktrees/

# Operating-system files
.DS_Store
Thumbs.db
Desktop.ini
```

- [ ] **Step 4: Create the user-requested `README.md`**

Use this initial content:

```markdown
# Voicomp

Voicomp is a VS Code extension, with Cursor compatibility as an explicit test
target, that is being built as a secure real-time voice companion for software
projects.

## Current status

The project is in Phase 0: repository initialization and architectural decision
records. No OpenAI connection, microphone capture, workspace tools, file edits,
or terminal actions are implemented yet.

The first implementation milestone will provide an offline, installable VSIX
with an Activity Bar container, a secure sidebar Webview, typed message passing,
mock connection state, and automated build and test tooling.

## Development workflow

Read `AGENTS.md` and `docs/BUILD_PLAN.md` before making changes. Work on the
next unchecked task only, verify its acceptance criteria, then update the
checkbox, `docs/IMPLEMENTATION_LOG.md`, and `MEMORY.md` at the required
boundary.

## Security and privacy

Voicomp will never bundle a publisher-owned OpenAI API key. Mutating actions
will require explicit approval. The initial release has no telemetry and does
not upload a repository automatically.

See `docs/SECURITY.md` and `docs/PRIVACY.md` for the evolving documented model.

## Repository

https://github.com/fortenemy/voicomp

## License

MIT. See `LICENSE`.
```

- [ ] **Step 5: Validate root-file scope and naming**

Run:

```powershell
git diff --check
rg -n "Voice[ ]Project[ ]Companion|voiceProject[C]ompanion" README.md .gitignore docs/superpowers/specs
git status --short
```

Expected: `git diff --check` succeeds, the legacy-name search returns no matches, and only intended files appear.

- [ ] **Step 6: Commit the coherent repository bootstrap**

Run:

```powershell
git add -- .gitignore README.md docs/superpowers/specs/2026-07-12-voicomp-phase-0-1-design.md docs/superpowers/plans/2026-07-12-voicomp-phase-0.md
git diff --cached --check
git commit -m "chore: initialize Voicomp repository"
```

Expected: one new commit on top of the preserved remote MIT-license commit, containing only the four explicitly staged paths.

---

### Task 2: Create persistent tracking and agent instructions

**Files:**
- Create: `AGENTS.md`
- Create: `MEMORY.md`
- Create: `docs/BUILD_PLAN.md`
- Create: `docs/HUMAN_ACTIONS.md`
- Create: `docs/IMPLEMENTATION_LOG.md`

**Interfaces:**
- Consumes: Master Build Instruction at `C:\Users\fortenemy\.codex\attachments\b2e8cc23-9e4b-4d43-aa44-3545fb824f23\pasted-text.txt`.
- Produces: the authoritative task cursor and durable contributor workflow.

- [ ] **Step 1: Transcribe the complete build roadmap**

Create `docs/BUILD_PLAN.md` with:

- a title and a rule that evidence is required before `- [x]`;
- Phase 0 through Phase 16 in the original order;
- every task from the Master Build Instruction as a Markdown checkbox;
- `[HUMAN ACTION REQUIRED]` labels retained for human-only actions;
- the product name normalized to Voicomp;
- acceptance criteria and mandatory stopping points under their phases;
- a Phase Notes section under every phase for summary, files, tests, limitations, decisions, and risks.

The exact checkbox counts must be:

```text
Phase 0=19  Phase 1=29  Phase 2=12  Phase 3=18  Phase 4=19
Phase 5=10 Phase 6=9   Phase 7=12  Phase 8=12  Phase 9=17
Phase 10=13 Phase 11=20 Phase 12=12 Phase 13=17 Phase 14=14
Phase 15=18 Phase 16=14 TOTAL=265
```

- [ ] **Step 2: Create `AGENTS.md` with enforceable repository rules**

The file must contain these sections and rules:

```markdown
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
```

- [ ] **Step 3: Create the project memory snapshot**

Create `MEMORY.md` with sections: Current Position, Repository, Decisions, Verified Environment, Known Limitations, Last Completed Boundary, and Next Unchecked Task. Record the workspace path, GitHub URL, product naming contract, Phase 0 scope, empty-remote origin, Node `24.9.0` observed locally, VS Code CLI `1.127.0`, Cursor CLI `3.10.20`, unavailable native Ralph loop, and the next actual unchecked build-plan item.

- [ ] **Step 4: Create the append-only implementation log**

Create `docs/IMPLEMENTATION_LOG.md` with a format contract followed by a `2026-07-12 — Repository bootstrap session` entry. Record inspection evidence, Git initialization, remote MIT-license commit reconciliation, files created in Task 1, commands run, limitations, and the next checkbox. Do not claim Phase 0 completion in this first entry.

- [ ] **Step 5: Create the human-action register**

Create `docs/HUMAN_ACTIONS.md` with unchecked human actions for Marketplace publisher registration and immutable ID selection, Open VSX account/agreement/token, final publication approval, credentials, macOS/Linux testing, microphone testing, and final legal/privacy approval. Record MIT as already selected by the repository owner. State that secrets must never be committed.

- [ ] **Step 6: Validate the tracking system**

Run a PowerShell count that groups `^- \[[ x]\]` entries by Phase and verify the exact counts above. Also run:

```powershell
rg -n "Voice[ ]Project[ ]Companion|voiceProject[C]ompanion" AGENTS.md MEMORY.md docs
rg -n "^- \[x\]" docs/BUILD_PLAN.md
git diff --check
```

Expected: no legacy names, only evidence-backed Phase 0 boxes checked, and no whitespace errors.

- [ ] **Step 7: Commit the persistent workflow**

Run:

```powershell
git add -- AGENTS.md MEMORY.md docs/BUILD_PLAN.md docs/HUMAN_ACTIONS.md docs/IMPLEMENTATION_LOG.md
git diff --cached --check
git commit -m "docs: add persistent project workflow"
```

---

### Task 3: Record Phase 0 product, architecture, security, and privacy decisions

**Files:**
- Create: `docs/PRODUCT_SPEC.md`
- Create: `docs/ARCHITECTURE.md`
- Create: `docs/SECURITY.md`
- Create: `docs/PRIVACY.md`
- Create: `docs/adr/0001-webview-and-extension-host-boundary.md`
- Create: `docs/adr/0002-openai-realtime-transport.md`
- Create: `docs/adr/0003-byok-authentication.md`
- Modify: `docs/BUILD_PLAN.md`

**Interfaces:**
- Consumes: approved design and current primary documentation.
- Produces: dated decisions that constrain Phase 1 and Phase 3 without implementing them.

- [ ] **Step 1: Record current platform decisions from primary sources**

Use and date these sources:

- Node releases: `https://nodejs.org/en/about/previous-releases`
- VS Code extension manifest: `https://code.visualstudio.com/api/references/extension-manifest`
- VS Code Webview security: `https://code.visualstudio.com/api/extension-guides/webview`
- VS Code extension tests: `https://code.visualstudio.com/api/working-with-extensions/testing-extension`
- OpenAI Realtime browser flow: `https://developers.openai.com/api/docs/guides/realtime-webrtc`
- OpenAI Agents SDK voice quickstart: `https://openai.github.io/openai-agents-js/guides/voice-agents/quickstart/`
- Cursor migration assumptions: `https://docs.cursor.com/get-started/migrate-from-vs-code`

Record Node 24 LTS as the development line, `voicomp` as the package-name target, `fortenemy` as the local publisher placeholder, and `^1.95.0` as the proposed minimum VS Code engine justified by the stable APIs used in Phase 1. Mark publisher ownership and publication as human actions.

- [ ] **Step 2: Write the product specification**

`docs/PRODUCT_SPEC.md` must cover the primary voice scenario, Phase 1 offline milestone, full product goals, MVP non-goals, approval model, workspace-context principle, Cursor test target, and the Phase 1 mandatory stopping point.

- [ ] **Step 3: Write the architecture document**

`docs/ARCHITECTURE.md` must define Extension Host, Webview, provider abstraction, context engine, tool registry, approval gate, storage, and VS Code API boundaries. It must show that Phase 1 implements only activation, commands, output logging, Webview registration, typed messages, mock state, and mock transcript.

- [ ] **Step 4: Write security and privacy documents**

`docs/SECURITY.md` must define trust boundaries, CSP, nonce use, local resource roots, Zod validation, SecretStorage, path safety, approval tokens, terminal denial by default, sanitized logging, workspace trust, and vulnerability reporting.

`docs/PRIVACY.md` must define no telemetry in the initial release, no repository upload by default, no transcript persistence by default, explicit context disclosure, BYOK data flow, clearing secrets/history, and no microphone/source logging.

- [ ] **Step 5: Write the three initial ADRs**

- ADR 0001 accepts a strict Webview/Extension Host boundary: browser media and UI in the Webview; secrets, workspace APIs, tools, and mutations in the Extension Host.
- ADR 0002 accepts the official Realtime browser pattern: Extension Host obtains a short-lived client secret; Webview connects with WebRTC. Prefer the official Agents SDK Realtime transport behind the provider interface while keeping tool execution in the Extension Host.
- ADR 0003 accepts BYOK with `ExtensionContext.secrets`; the standard API key never enters Webview code or settings JSON.

Each ADR must contain Status, Date, Context, Decision, Consequences, and Sources.

- [ ] **Step 6: Validate and commit the decision records**

Run:

```powershell
rg -n "^## (Status|Date|Context|Decision|Consequences|Sources)$" docs/adr
rg -n "Voice[ ]Project[ ]Companion|voiceProject[C]ompanion" docs
git diff --check
```

Then explicitly stage and commit:

```powershell
git add -- docs/PRODUCT_SPEC.md docs/ARCHITECTURE.md docs/SECURITY.md docs/PRIVACY.md docs/adr docs/BUILD_PLAN.md
git diff --cached --check
git commit -m "docs: record phase zero architecture"
```

---

### Task 4: Close Phase 0 with evidence, memory, and conflict-free GitHub synchronization

**Files:**
- Modify: `docs/BUILD_PLAN.md`
- Modify: `docs/IMPLEMENTATION_LOG.md`
- Modify: `MEMORY.md`
- Create temporarily: `.codex-memory-update/20260712-voicomp-phase-0.md`

**Interfaces:**
- Consumes: all Phase 0 artifacts and their Git commits.
- Produces: auditable Phase 0 completion, durable memory, and synchronized `origin/main`.

- [ ] **Step 1: Audit every Phase 0 checkbox against evidence**

For each of the 19 Phase 0 tasks, verify its artifact or dated decision before changing `- [ ]` to `- [x]`. Complete all 19: use `fortenemy` as the explicitly documented local publisher placeholder, verify the target identifier `fortenemy.voicomp`, and record the existing MIT license as the completed licensing decision. Do not close Phase 0 while any of its 19 boxes remains open.

- [ ] **Step 2: Write the Phase 0 evidence summary**

Under Phase 0 in `docs/BUILD_PLAN.md`, record implementation summary, files changed, checks executed, limitations, decisions, and risks. Append the same boundary as a dated entry in `docs/IMPLEMENTATION_LOG.md`. Refresh `MEMORY.md` so its Next Unchecked Task matches the first open build-plan checkbox.

- [ ] **Step 3: Prepare the authorized Codex memory update note**

Create `.codex-memory-update/20260712-voicomp-phase-0.md` with the workspace path, GitHub repository, naming contract, authoritative build-plan path, required checkbox/log/memory workflow, completed Phase 0 decisions, current limitations, and next task. After reviewing its contents, move this one file to:

```text
C:\Users\fortenemy\.codex\memories\extensions\ad_hoc\notes\20260712-voicomp-phase-0.md
```

Request filesystem approval for the move. Do not edit `MEMORY.md` in the global memory base directly.

- [ ] **Step 4: Run the Phase 0 documentation verification**

Run:

```powershell
git diff --check
rg -n "Voice[ ]Project[ ]Companion|voiceProject[C]ompanion" . -g "!.git/**"
git status --short
git log --oneline --decorate -5
```

Expected: no legacy name, no whitespace errors, and only the Phase 0 closure files remain uncommitted.

- [ ] **Step 5: Commit the Phase 0 closure**

Run:

```powershell
git add -- docs/BUILD_PLAN.md docs/IMPLEMENTATION_LOG.md MEMORY.md
git diff --cached --check
git commit -m "docs: complete phase zero"
```

- [ ] **Step 6: Re-check the remote immediately before push**

Run:

```powershell
git ls-remote --heads origin
git status -sb
git log --oneline --decorate --graph --all
```

Expected: remote `main` is still an ancestor already tracked locally and local `main` is clean. If remote `main` advanced, fetch it and stop for reconciliation instead of forcing.

- [ ] **Step 7: Push the initial history without force**

Run:

```powershell
git push -u origin main
```

If authentication fails, keep the verified local commits unchanged, request `gh auth login`, and retry only after `gh auth status` succeeds. Do not force-push and do not create a parallel remote history through file APIs.

- [ ] **Step 8: Verify GitHub readback**

Use the connected GitHub repository API to verify `fortenemy/voicomp`, default branch `main`, latest commit, and presence of `.gitignore`, `README.md`, `AGENTS.md`, `MEMORY.md`, and `docs/BUILD_PLAN.md`. Report the commit SHA and remote URL.
