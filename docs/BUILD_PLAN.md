# Voicomp Build Plan

## Evidence rule

A task may be marked `- [x]` only after concrete evidence verifies completion, such as an inspected file, successful command output, a passing test, or recorded human confirmation. Partial work, intent, or an existing artifact without task-specific verification is not sufficient. Keep acceptance criteria, required checks, and mandatory stopping points satisfied before advancing to the next phase.

# Phase 0 — Repository initialization and decision records

## Tasks

- [x] Inspect the repository and preserve any existing useful work.
- [x] Initialize Git if needed.
- [x] Create `.gitignore`.
- [x] Create `AGENTS.md`.
- [x] Create `docs/BUILD_PLAN.md`.
- [x] Create `docs/HUMAN_ACTIONS.md`.
- [x] Create `docs/PRODUCT_SPEC.md`.
- [x] Create `docs/ARCHITECTURE.md`.
- [x] Create `docs/SECURITY.md`.
- [x] Create `docs/PRIVACY.md`.
- [x] Create initial ADRs.
- [x] Determine the current supported Node.js development version.
- [x] Determine the minimum supported VS Code version.
- [x] Record the current official OpenAI Realtime connection method.
- [x] Record whether direct Realtime API or the current OpenAI Agents SDK is preferable.
- [x] Record Cursor compatibility assumptions as assumptions, not guarantees.
- [x] Select a placeholder publisher ID.
- [x] Select a final package identifier that is not already occupied.
- [x] Add licensing placeholder requiring human confirmation.

## Acceptance criteria

- Repository contains persistent project instructions.
- Every major architectural decision is recorded.
- No production code is written before the architecture and scope are documented.
- Unknown external decisions are listed in `docs/HUMAN_ACTIONS.md`.

## Phase Notes

- **Summary:** Phase 0 is complete: all 19 tasks have concrete repository or command evidence, every major architectural and platform decision is recorded, and Phase 1 is now the next active phase. No production implementation was started.
- **Files:** Verified evidence includes `.gitignore`, `AGENTS.md`, `LICENSE`, `MEMORY.md`, `docs/BUILD_PLAN.md`, `docs/HUMAN_ACTIONS.md`, `docs/IMPLEMENTATION_LOG.md`, `docs/PRODUCT_SPEC.md`, `docs/ARCHITECTURE.md`, `docs/SECURITY.md`, `docs/PRIVACY.md`, `docs/PLATFORM_DECISIONS.md`, and ADRs 0001-0003, with the approved design and plan as supporting context.
- **Tests:** Phase 0 Markdown structure, required ADR headings, decision content, source links, and one-or-more evidence paths for every Phase 0 checkbox were inspected. The roadmap remains 265 tasks with its exact per-phase distribution, Phase 0 is 19/19 checked, and Phases 1-16 remain 0 checked. Environment, registry HTTP status, initial-license history, legacy-name, unresolved-marker, credential-pattern, trailing-whitespace, Git diff, and exact staged-scope checks passed.
- **Limitations:** No production code, package manifest, dependency lockfile, npm script, VSIX, OpenAI call, or microphone flow exists, so Phase 1 lint, typecheck, test, build, packaging, and manual editor checks are not yet applicable. The local Node.js `v24.9.0` runtime must be updated within the Node.js 24 LTS line before dependency lock generation. Nothing was published or pushed.
- **Decisions:** Use Node.js 24 LTS, `engines.vscode` `^1.95.0`, and `@types/vscode` pinned to `1.95.x`. Phase 3 will mint an ephemeral Realtime client secret in the Extension Host and use WebRTC in the Webview, preferring `@openai/agents/realtime` behind the provider abstraction; Phase 1 has no OpenAI integration. Cursor `3.10.20` is observed but remains unverified until VSIX smoke tests. Local identifiers are `fortenemy`, `voicomp`, and `fortenemy.voicomp`; the license is MIT from the remote initial commit.
- **Risks:** Registry HTTP `404` results are point-in-time availability observations, not reservations. Final publisher registration and immutable ID approval remain open human actions, Cursor compatibility is unverified, external API and SDK behavior may drift, and credentials, manual platform and microphone testing, legal/privacy approval, and publication remain human-controlled.

---

# Phase 1 — Minimal installable VS Code extension

This is the first implementation phase and must be completed before real OpenAI integration.

## Tasks

- [ ] Create a TypeScript VS Code extension manifest.
- [ ] Configure strict TypeScript.
- [ ] Configure esbuild.
- [ ] Configure ESLint.
- [ ] Configure Prettier.
- [ ] Configure Vitest.
- [ ] Configure the official VS Code integration test harness.
- [ ] Implement `activate()` and `deactivate()`.
- [ ] Register the Activity Bar container.
- [ ] Register the sidebar Webview view.
- [ ] Register `Voicomp: Open Assistant`.
- [ ] Add a minimal sidebar UI.
- [ ] Add a mock connection state.
- [ ] Add a mock transcript entry.
- [ ] Add Extension Host ↔ Webview typed message passing.
- [ ] Add restrictive Webview CSP.
- [ ] Add Output Channel logging.
- [ ] Add basic settings.
- [ ] Add a placeholder API-key command without calling OpenAI.
- [ ] Add `README.md`.
- [ ] Add `.vscodeignore`.
- [ ] Add `vscode:prepublish`.
- [ ] Add `npm run build`.
- [ ] Add `npm run watch`.
- [ ] Add `npm run lint`.
- [ ] Add `npm run typecheck`.
- [ ] Add `npm test`.
- [ ] Add `npm run package`.
- [ ] Produce the first local `.vsix`.

## Acceptance criteria

- `npm ci` succeeds.
- `npm run lint` succeeds.
- `npm run typecheck` succeeds.
- `npm test` succeeds.
- `npm run build` succeeds.
- Pressing `F5` launches an Extension Development Host.
- The extension appears in the Activity Bar.
- The sidebar opens.
- Webview messages reach the Extension Host and return.
- No external network call is required.
- `npm run package` creates an installable `.vsix`.
- The `.vsix` installs successfully in a clean VS Code profile.
- The `.vsix` is smoke-tested in Cursor manually if Cursor is available.

## Mandatory stopping point

After completing Phase 1:

1. Stop implementation.
2. Update `docs/BUILD_PLAN.md`.
3. Present:

   - files created;
   - commands executed;
   - test results;
   - location of the `.vsix`;
   - current architecture;
   - known limitations.
4. Wait for explicit instruction before starting Phase 2.

## Phase Notes

- **Summary:** No work recorded.
- **Files:** None recorded.
- **Tests:** Not run.
- **Limitations:** Phase has not started.
- **Decisions:** None recorded.
- **Risks:** None recorded.

---

# Phase 2 — Conversation UI and mock Realtime transport

## Tasks

- [ ] Implement the session state machine.
- [ ] Create generic Realtime provider interfaces.
- [ ] Create a mock Realtime provider.
- [ ] Add typed text input for debugging.
- [ ] Add streaming mock assistant responses.
- [ ] Add transcript rendering.
- [ ] Add start, stop, mute, and interrupt controls.
- [ ] Add reconnect UI states.
- [ ] Add session disposal handling.
- [ ] Add unit tests for state transitions.
- [ ] Add Webview state restoration.
- [ ] Add accessibility checks.

## Acceptance criteria

- Full conversation UI works without OpenAI.
- State transitions are deterministic.
- Closing the Webview cleans up all session resources.
- A mocked assistant response can be interrupted.
- UI and Extension Host remain separated.

## Phase Notes

- **Summary:** No work recorded.
- **Files:** None recorded.
- **Tests:** Not run.
- **Limitations:** Phase has not started.
- **Decisions:** None recorded.
- **Risks:** None recorded.

---

# Phase 3 — Secure OpenAI Realtime connection

## Tasks

- [ ] Implement `Set OpenAI API Key`.
- [ ] Store the key using `ExtensionContext.secrets`.
- [ ] Implement `Clear OpenAI API Key`.
- [ ] Implement Realtime client secret creation in the Extension Host.
- [ ] Pass only the short-lived client secret to the Webview.
- [ ] Implement WebRTC peer connection.
- [ ] Implement Realtime data channel.
- [ ] Capture microphone audio.
- [ ] Play assistant audio.
- [ ] Handle partial transcripts.
- [ ] Handle interruption and response cancellation.
- [ ] Handle voice activity detection.
- [ ] Add push-to-talk fallback.
- [ ] Add model and voice settings.
- [ ] Add connection retries with bounded backoff.
- [ ] Add token-expiration handling.
- [ ] Add sanitized provider logs.
- [ ] Document OpenAI data flow.

## Acceptance criteria

- Standard API key never enters the Webview.
- Standard API key is absent from logs and packaged files.
- User can start a live voice conversation.
- User can hear the assistant.
- User can interrupt the assistant.
- Partial and final transcripts appear.
- Session can be stopped cleanly.
- Network failures produce actionable errors.

## Phase Notes

- **Summary:** No work recorded.
- **Files:** None recorded.
- **Tests:** Not run.
- **Limitations:** Phase has not started.
- **Decisions:** None recorded.
- **Risks:** None recorded.

---

# Phase 4 — Context Engine and read-only project tools

## Tasks

- [ ] Implement active editor context.
- [ ] Implement selection context.
- [ ] Implement open files listing.
- [ ] Implement workspace file listing.
- [ ] Implement safe file reading.
- [ ] Implement workspace text search.
- [ ] Implement diagnostics retrieval.
- [ ] Implement project manifest detection.
- [ ] Implement workspace summary.
- [ ] Implement context budget.
- [ ] Implement sensitive file filtering.
- [ ] Implement binary detection.
- [ ] Implement multi-root support.
- [ ] Implement path canonicalization.
- [ ] Implement cancellation.
- [ ] Register tools with the Realtime session.
- [ ] Execute tool calls in the Extension Host.
- [ ] Return normalized tool results to the model.
- [ ] Display tool activity in the Webview.

## Acceptance criteria

- Assistant can explain the active selection.
- Assistant can inspect the active file.
- Assistant can find references through text search.
- Assistant does not automatically upload the entire repository.
- Sensitive paths are blocked or require explicit action.
- Tool arguments are validated.
- Tool failures do not crash the session.

## Phase Notes

- **Summary:** No work recorded.
- **Files:** None recorded.
- **Tests:** Not run.
- **Limitations:** Phase has not started.
- **Decisions:** None recorded.
- **Risks:** None recorded.

---

# Phase 5 — Planning and conversation intelligence

## Tasks

- [ ] Add project discussion system instructions.
- [ ] Add “plan before edit” behavior.
- [ ] Add explicit distinction between facts, assumptions, and proposals.
- [ ] Add project summary generation.
- [ ] Add session context compaction.
- [ ] Add transcript length controls.
- [ ] Add command for clearing session context.
- [ ] Add optional transcript export.
- [ ] Add user-visible indication of which context was sent.
- [ ] Add protection against model requests for blocked tools.

## Acceptance criteria

- Assistant can discuss architecture without editing files.
- Assistant can present an ordered implementation plan.
- User can inspect context sources.
- Long sessions remain usable without unlimited context growth.

## Phase Notes

- **Summary:** No work recorded.
- **Files:** None recorded.
- **Tests:** Not run.
- **Limitations:** Phase has not started.
- **Decisions:** None recorded.
- **Risks:** None recorded.

---

# Phase 6 — Git and diagnostics tools

## Tasks

- [ ] Detect whether Git is available.
- [ ] Implement read-only Git status.
- [ ] Implement Git diff.
- [ ] Implement current branch.
- [ ] Implement recent commits.
- [ ] Add diagnostics summaries grouped by severity.
- [ ] Add tool tests with fixtures.
- [ ] Prevent Git mutation commands.
- [ ] Add clear unavailable states.

## Acceptance criteria

- Assistant can explain current uncommitted changes.
- Assistant can compare code against the current Git state.
- No Git mutation occurs.

## Phase Notes

- **Summary:** No work recorded.
- **Files:** None recorded.
- **Tests:** Not run.
- **Limitations:** Phase has not started.
- **Decisions:** None recorded.
- **Risks:** None recorded.

---

# Phase 7 — Proposed edits and diff approval

## Tasks

- [ ] Define a structured edit proposal format.
- [ ] Validate edit ranges.
- [ ] Detect stale documents.
- [ ] Generate diff previews.
- [ ] Display affected files.
- [ ] Implement approval tokens.
- [ ] Implement rejection.
- [ ] Apply approved `WorkspaceEdit`.
- [ ] Preserve undo support.
- [ ] Add conflict handling.
- [ ] Add tests for partial and failed edits.
- [ ] Disable edits in untrusted workspaces.

## Acceptance criteria

- No edit is applied without explicit approval.
- User sees the exact diff first.
- Rejected changes leave the workspace unchanged.
- Approved changes can be undone through VS Code.
- Changed documents invalidate stale proposals.

## Phase Notes

- **Summary:** No work recorded.
- **Files:** None recorded.
- **Tests:** Not run.
- **Limitations:** Phase has not started.
- **Decisions:** None recorded.
- **Risks:** None recorded.

---

# Phase 8 — Controlled tests, linting, and terminal actions

## Tasks

- [ ] Detect project scripts.
- [ ] Add `run_project_test`.
- [ ] Add `run_project_lint`.
- [ ] Add `run_project_typecheck`.
- [ ] Add named VS Code task execution.
- [ ] Add command risk policy.
- [ ] Add command preview.
- [ ] Add explicit approval.
- [ ] Add timeout and cancellation.
- [ ] Stream sanitized command output.
- [ ] Block dangerous command patterns.
- [ ] Disable all terminal tools by default.

## Acceptance criteria

- Only approved commands run.
- User sees the exact command and working directory first.
- Commands time out safely.
- Dangerous commands are rejected.
- Terminal tools remain opt-in.

## Phase Notes

- **Summary:** No work recorded.
- **Files:** None recorded.
- **Tests:** Not run.
- **Limitations:** Phase has not started.
- **Decisions:** None recorded.
- **Risks:** None recorded.

---

# Phase 9 — Product hardening

## Tasks

- [ ] Complete error-state review.
- [ ] Complete accessibility review.
- [ ] Complete privacy review.
- [ ] Complete threat model.
- [ ] Complete secret scan.
- [ ] Complete dependency audit.
- [ ] Test untrusted workspace behavior.
- [ ] Test multi-root workspaces.
- [ ] Test large files.
- [ ] Test unusual filenames.
- [ ] Test symbolic links.
- [ ] Test remote workspace behavior.
- [ ] Add recovery after extension reload.
- [ ] Add migration support for changed settings.
- [ ] Improve first-run onboarding.
- [ ] Add diagnostic command.
- [ ] Ensure no source code is logged by default.

## Acceptance criteria

- Security checklist is complete.
- Privacy behavior matches documentation.
- The extension fails safely.
- No known critical vulnerability remains.
- All supported environments are documented.

## Phase Notes

- **Summary:** No work recorded.
- **Files:** None recorded.
- **Tests:** Not run.
- **Limitations:** Phase has not started.
- **Decisions:** None recorded.
- **Risks:** None recorded.

---

# Phase 10 — CI and release automation

## Tasks

- [ ] Create GitHub Actions CI.
- [ ] Run lint, typecheck, unit tests, and build on pull requests.
- [ ] Add integration tests where stable.
- [ ] Package `.vsix` in CI.
- [ ] Upload `.vsix` as a workflow artifact.
- [ ] Add version validation.
- [ ] Add changelog validation.
- [ ] Add secret scanning.
- [ ] Add dependency review.
- [ ] Add release-on-tag workflow.
- [ ] Keep publishing disabled until credentials and approval are provided.
- [ ] Prefer current secure Microsoft Entra ID publishing for automated VS Code Marketplace releases.
- [ ] Configure Open VSX token only as a repository secret if approved.

## Acceptance criteria

- Pull requests cannot pass with lint, type, test, or build failures.
- A release candidate `.vsix` is reproducibly generated.
- Publishing secrets are not available to untrusted pull requests.
- Publishing requires an approved release path.

## Phase Notes

- **Summary:** No work recorded.
- **Files:** None recorded.
- **Tests:** Not run.
- **Limitations:** Phase has not started.
- **Decisions:** None recorded.
- **Risks:** None recorded.

---

# Phase 11 — Marketplace assets and documentation

## Tasks

- [ ] Finalize product name.
- [ ] Finalize publisher ID.
- [ ] Verify extension identifier availability.
- [ ] Create icon.
- [ ] Create screenshots.
- [ ] Create short demo media if appropriate.
- [ ] Complete README.
- [ ] Complete feature list.
- [ ] Complete installation instructions.
- [ ] Complete BYOK instructions.
- [ ] Complete microphone permission troubleshooting.
- [ ] Complete privacy disclosure.
- [ ] Complete security policy.
- [ ] Complete support links.
- [ ] Complete changelog.
- [ ] Select license.
- [ ] Add repository metadata to `package.json`.
- [ ] Add keywords and categories.
- [ ] Verify Marketplace rendering.
- [ ] Verify all image and documentation paths in packaged VSIX.

## Acceptance criteria

- Marketplace page clearly explains what data is sent.
- Installation and API-key setup can be completed by a new user.
- No broken assets exist.
- Package metadata is consistent.

## Phase Notes

- **Summary:** No work recorded.
- **Files:** None recorded.
- **Tests:** Not run.
- **Limitations:** Phase has not started.
- **Decisions:** None recorded.
- **Risks:** None recorded.

---

# Phase 12 — Local packaging and pre-release

## Tasks

- [ ] Run clean install with `npm ci`.
- [ ] Run full verification suite.
- [ ] Run `vsce package --pre-release` if using a pre-release channel.
- [ ] Inspect VSIX contents.
- [ ] Confirm no secrets are included.
- [ ] Install VSIX in clean VS Code profile.
- [ ] Install VSIX in Cursor manually.
- [ ] Test upgrade from previous version.
- [ ] Test uninstall and reinstall.
- [ ] Verify API key clearing.
- [ ] Verify microphone permission behavior.
- [ ] Record compatibility results.

## Acceptance criteria

- Clean `.vsix` installs.
- Core voice flow works.
- Read-only tools work.
- No secret or unnecessary development file exists in the package.
- Known Cursor incompatibilities are documented.

## Phase Notes

- **Summary:** No work recorded.
- **Files:** None recorded.
- **Tests:** Not run.
- **Limitations:** Phase has not started.
- **Decisions:** None recorded.
- **Risks:** None recorded.

---

# Phase 13 — VS Code Marketplace publication

## Human prerequisites

- [ ] [HUMAN ACTION REQUIRED] Create or select Microsoft account.
- [ ] [HUMAN ACTION REQUIRED] Create VS Code Marketplace publisher.
- [ ] [HUMAN ACTION REQUIRED] Choose immutable publisher ID carefully.
- [ ] [HUMAN ACTION REQUIRED] Configure approved authentication.
- [ ] [HUMAN ACTION REQUIRED] Approve terms and privacy information.
- [ ] [HUMAN ACTION REQUIRED] Approve final release.

## Codex tasks

- [ ] Verify current official Marketplace publishing instructions.
- [ ] Ensure `publisher` matches the registered publisher.
- [ ] Configure secure publishing.
- [ ] Prefer Microsoft Entra ID for CI automation.
- [ ] Use PAT only for temporary/manual flows if still supported and explicitly approved.
- [ ] Never write credentials to repository files.
- [ ] Publish pre-release first when appropriate.
- [ ] Verify Marketplace listing.
- [ ] Install the Marketplace version into a clean profile.
- [ ] Compare Marketplace package checksum or contents with the tested artifact.
- [ ] Record release metadata.

## Useful commands

Verify current syntax before execution:

```bash
npx vsce package
npx vsce package --pre-release
npx vsce publish
npx vsce publish --pre-release
```

Do not execute publication commands without explicit user approval.

## Phase Notes

- **Summary:** No work recorded.
- **Files:** None recorded.
- **Tests:** Not run.
- **Limitations:** Phase has not started.
- **Decisions:** None recorded.
- **Risks:** Marketplace publication requires current documentation verification, credentials, legal acceptance, and explicit human approval.

---

# Phase 14 — Open VSX publication

## Human prerequisites

- [ ] [HUMAN ACTION REQUIRED] Create Eclipse account.
- [ ] [HUMAN ACTION REQUIRED] Ensure the correct GitHub identity is linked.
- [ ] [HUMAN ACTION REQUIRED] Sign the Open VSX Publisher Agreement.
- [ ] [HUMAN ACTION REQUIRED] Generate an Open VSX access token.
- [ ] [HUMAN ACTION REQUIRED] Approve namespace creation.
- [ ] [HUMAN ACTION REQUIRED] Approve publication.

## Codex tasks

- [ ] Verify current Open VSX publishing documentation.
- [ ] Confirm package compatibility.
- [ ] Create namespace using the approved publisher identifier.
- [ ] Publish the already tested `.vsix`.
- [ ] Verify extension scanning results.
- [ ] Verify listing metadata.
- [ ] Test installation from the registry in a compatible editor.
- [ ] Record release metadata.

## Useful commands

Verify current syntax before execution:

```bash
npx ovsx create-namespace <publisher> -p <token>
npx ovsx publish <path-to-extension.vsix> -p <token>
```

Never place the token directly in committed scripts or shell history when a safer secret mechanism is available.

## Phase Notes

- **Summary:** No work recorded.
- **Files:** None recorded.
- **Tests:** Not run.
- **Limitations:** Phase has not started.
- **Decisions:** None recorded.
- **Risks:** Open VSX publication requires an account, linked identity, agreement, token, namespace approval, and explicit publication approval.

---

# Phase 15 — Cursor compatibility and distribution

Cursor compatibility is an explicit test target, not an automatic guarantee.

## Tasks

- [ ] Review current official Cursor extension documentation.
- [ ] Verify which extension registry Cursor currently uses.
- [ ] Verify whether direct VSIX installation is supported.
- [ ] Install the release candidate in Cursor.
- [ ] Test sidebar registration.
- [ ] Test Webview microphone access.
- [ ] Test SecretStorage behavior.
- [ ] Test Realtime WebRTC.
- [ ] Test file tools.
- [ ] Test diagnostics.
- [ ] Test WorkspaceEdit.
- [ ] Test Git tools.
- [ ] Test terminal tools if enabled.
- [ ] Identify APIs that behave differently.
- [ ] Avoid reliance on Cursor private APIs.
- [ ] Document supported Cursor versions.
- [ ] Document limitations.
- [ ] Publish to the currently appropriate registry only after verification.

## Acceptance criteria

- The extension either works in Cursor or clearly reports unsupported capabilities.
- VS Code functionality is not broken to support Cursor.
- Compatibility claims are backed by manual test results.

## Phase Notes

- **Summary:** No work recorded.
- **Files:** None recorded.
- **Tests:** Not run.
- **Limitations:** Phase has not started.
- **Decisions:** None recorded.
- **Risks:** None recorded.

---

# Phase 16 — Stable release and maintenance

## Tasks

- [ ] Collect opt-in feedback.
- [ ] Monitor crash and support reports without collecting source code.
- [ ] Track OpenAI Realtime API changes.
- [ ] Track VS Code API changes.
- [ ] Track Cursor compatibility.
- [ ] Track marketplace policy changes.
- [ ] Maintain dependency updates.
- [ ] Maintain security advisories.
- [ ] Maintain changelog.
- [ ] Use semantic versioning.
- [ ] Define support policy.
- [ ] Define deprecation policy.
- [ ] Add regression tests for every confirmed bug.
- [ ] Perform periodic secret and dependency scans.

## Phase Notes

- **Summary:** No work recorded.
- **Files:** None recorded.
- **Tests:** Not run.
- **Limitations:** Phase has not started.
- **Decisions:** None recorded.
- **Risks:** None recorded.
