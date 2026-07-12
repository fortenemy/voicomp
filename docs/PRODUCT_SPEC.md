# Voicomp Product Specification

## Purpose and authority

This document defines what Voicomp is, who it serves, which capabilities belong
to its first functional MVP, and which safety and acceptance boundaries govern
delivery.

`docs/BUILD_PLAN.md` remains the authoritative task order and completion
checklist. The approved Phase 0-1 design defines the execution boundary for the
current cycle. If this specification and the build plan appear to conflict, work
must stop until the documents are reconciled; later-phase work must not be pulled
forward.

This specification makes no time-sensitive claim about external APIs, editor
versions, registries, or publishing procedures. Those decisions require dated
verification against primary sources in their dedicated Phase 0 records.

## Product summary

Voicomp is a secure, real-time voice assistant delivered as a VS Code extension.
It adds a focused voice and conversation layer to the editor rather than trying
to replace the editor itself.

The finished product lets a developer discuss the active project by voice,
inspect narrowly selected workspace context, hear and interrupt assistant
responses, review a transcript, and request plans or proposed changes. Workspace
access is mediated by explicit tools. Any operation that changes files, runs a
command, changes Git state, publishes an artifact, or otherwise creates material
risk requires an explicit approval path.

VS Code is the primary platform. Cursor is a tested compatibility target only
where standard VS Code Extension APIs support the required behavior.

## Delivery status and boundaries

All 19 Phase 0 master tasks are complete. Phase 0 boundary verification/memory/log/GitHub synchronization is in progress. Phase 1 has not started.

Voicomp has three distinct delivery horizons:

| Horizon | Status | Included outcome | Explicitly absent |
| --- | --- | --- | --- |
| Current repository | Phase 0 boundary synchronization in progress; Phase 1 not started | Repository foundation, product and engineering documentation, decision records, and task controls | Extension production code, npm package, voice, network, workspace tools, edits, terminal actions, and a VSIX |
| Current implementation milestone | Phase 1 target | Offline, installable extension shell with Activity Bar entry, secure sidebar Webview, typed message round trip, mock state, tests, build scripts, and local VSIX packaging | OpenAI integration, microphone capture, live audio, real provider traffic, workspace reads, edits, Git tools, and terminal execution |
| Functional MVP and release path | Future phases | Real voice conversation, controlled context, planning, read-only project tools, approved edits and commands, hardening, packaging, compatibility evidence, and release preparation | Any capability listed as a first-MVP non-goal |

Phase 1 is an offline architecture and packaging milestone. It is not the
voice-enabled functional MVP.

### Mandatory stop after Phase 1

After every Phase 1 acceptance criterion has evidence:

1. stop implementation before Phase 2;
2. update `docs/BUILD_PLAN.md` and the required session records;
3. report files, commands, test results, the exact VSIX path, current
   architecture, and known limitations; and
4. wait for explicit user instruction before beginning Phase 2.

Generating a VSIX does not waive this stop or prove the rest of Phase 1.

## Users and primary scenario

The primary user is a software developer working in an active local or remote
workspace who wants to understand, discuss, and safely improve a project without
leaving the editor or surrendering control of workspace actions.

### Primary voice scenario

1. The user opens a project in VS Code or a supported Cursor environment and
   opens the Voicomp sidebar.
2. The user starts a live voice session and asks Voicomp to explain the function
   currently open.
3. Voicomp identifies the active editor and selection through controlled tools,
   retrieves only the context needed, explains the code aloud, and displays the
   text transcript.
4. The user interrupts the spoken response. Voicomp stops the response and
   returns to a listening state without losing the usable conversation.
5. The user asks whether the function is used elsewhere. Voicomp performs a
   bounded workspace search and answers from the returned evidence.
6. The user asks for a safer implementation. Voicomp separates facts from
   assumptions, prepares a proposal, and displays the exact diff and affected
   files.
7. No workspace change occurs unless the user explicitly approves that exact,
   still-current proposal.

## Product goals

Voicomp must provide:

- continuous, low-latency, bidirectional voice conversation;
- interruption and barge-in while the assistant is speaking;
- readable user and assistant transcripts, including partial states;
- awareness of the active file and explicit selection;
- progressive, controlled workspace exploration through defined tools;
- project discussion that distinguishes facts, assumptions, and proposals;
- planning before editing;
- diff-based edit proposals with explicit approval;
- controlled, opt-in project checks and commands;
- safe behavior in trusted and untrusted workspaces;
- secure user-provided provider credentials;
- actionable failures without secret or source-data leakage;
- reproducible local packaging as an installable VSIX; and
- evidence-backed operation in VS Code plus documented Cursor test results.

## Complete functional MVP scope

For this specification, the complete functional MVP is the user-facing and
security capability set delivered through product hardening. Release automation,
marketplace publication, broader distribution, and long-term maintenance follow
that functional boundary but remain required for the complete project.

### Installable editor experience

- A Voicomp Activity Bar container and sidebar Webview.
- Command Palette entries for opening and controlling the assistant.
- Connection, microphone, speaking, tool, approval, reconnect, and error states.
- Start, stop, mute, and interrupt controls.
- A transcript that supports partial and final user and assistant turns.
- Tool activity summaries and context indicators without dumping large raw
  payloads.
- Keyboard navigation, visible focus, meaningful labels, theme support,
  non-color-only status, sufficient contrast, and reduced-motion behavior where
  applicable.

### Voice and conversation

- Live voice input and output through the selected Realtime provider.
- Assistant interruption and response cancellation.
- Voice activity detection with a push-to-talk fallback.
- Bounded reconnect behavior and clean session disposal.
- An explicit, tested state model that rejects invalid transitions.
- Text input and mock provider paths for deterministic debugging and normal CI.
- Real provider smoke tests only when separately authorized and configured; they
  must never be a default CI dependency.

### Secure user-provided authentication

- In a supported local Extension Host, the user supplies their own provider API
  key through a secure editor flow.
- The standard API key is stored persistently only through VS Code secret
  storage.
- The standard API key never enters Webview state, logs, diagnostics, source
  control, packaged files, or transcripts.
- A supported local Extension Host obtains any short-lived browser credential
  required for a live session and exposes only that limited credential to the
  Webview. Remote Extension Hosts block key setup and retrieval, client-secret
  minting, and live provider sessions before secret access.
- Users can clear the stored secret through an explicit command.
- A hosted subscription backend may be designed for later use, but it is not
  part of the first functional MVP.

### Context and read-only project tools

- Active editor, selection, open-file, workspace-file, file-read, text-search,
  diagnostics, project-manifest, and workspace-summary tools.
- Multi-root, cancellation, file-size, binary-file, path-canonicalization,
  symbolic-link, unsupported-scheme, and remote-workspace handling.
- Sensitive-file filtering informed by deny rules, ignore files, user
  exclusions, file type, and size.
- Normalized, bounded tool results with clear truncation and failure states.
- User-visible tool activity and, before the functional MVP is complete, a way
  to inspect which context sources were sent.

### Discussion, planning, Git, and diagnostics

- Project discussion and ordered implementation plans without requiring edits.
- Explicit labeling of known facts, assumptions, and proposed actions.
- Session context limits, compaction, reset controls, and optional transcript
  export.
- Read-only Git status, diff, branch, and recent-commit tools when Git is
  available.
- Diagnostics summaries grouped by severity.
- Clear unavailable states; no hidden fallback to mutation.

### Proposed edits

- A structured edit proposal with validated ranges and affected files.
- A rendered diff before approval.
- Detection of files that changed after the proposal was generated.
- Per-proposal approval that is short-lived, one-time, and bound to the exact
  operation.
- Application through controlled VS Code workspace editing so approved changes
  retain editor undo support.
- Rejection and conflict paths that leave the workspace unchanged.
- Edits disabled in untrusted workspaces.

### Controlled project actions

- Named operations for project tests, linting, type checking, and approved VS
  Code tasks.
- Terminal capabilities disabled by default and enabled only by explicit user
  choice.
- Exact command, arguments, working directory, risk, and purpose shown before
  approval.
- Argument-array execution where possible, bounded timeouts, cancellation, and
  sanitized streamed output.
- Dangerous patterns blocked even when requested.
- No unrestricted shell tool.

### Hardening and distribution readiness

- Error, accessibility, privacy, and threat-model reviews.
- Tests for security-critical schemas, policies, filters, paths, approvals, and
  state transitions.
- Safe behavior across untrusted, multi-root, large-file, unusual-name,
  symbolic-link, reload, and supported remote-workspace cases.
- Dependency and secret review with prompts, selections, source files, and file
  content excluded from logs.
- Reproducible build and VSIX packaging, package-content inspection, and clean
  VS Code installation testing.
- Cursor behavior tested and documented without weakening VS Code behavior or
  relying on private Cursor APIs.

## First-MVP non-goals

The first functional MVP does not include:

- autonomous multi-hour coding tasks;
- autonomous Git commits;
- autonomous dependency installation;
- unrestricted shell access;
- background agents;
- cloud repository indexing;
- vector databases;
- multiple cooperating agents;
- automatic repository uploads;
- automatic file deletion or renaming;
- account subscription systems;
- team synchronization;
- remote memory;
- a hosted production backend; or
- Cursor private API integration.

These exclusions are product boundaries, not deferred permission. Adding one
requires an explicit scope decision and an updated plan.

## Explicit approval model

### Governing rule

Voicomp may explain, plan, and propose without changing the workspace. It must
not perform a mutating, executable, publishing, credential, or other materially
risky action without an explicit user decision at the correct boundary.

| Action class | Default policy | Required user control |
| --- | --- | --- |
| Narrow read-only context | Allowed only within trust, sensitivity, and budget policy | The user can inspect context sources and disable sources; sensitive or broader reads require an explicit action |
| Workspace edits | Denied until approved | Show exact diff, files, risk, and stale-state status; approve or reject one exact proposal |
| Test, lint, type-check, task, or terminal action | Disabled or denied until approved | Show exact command or named task, arguments, working directory, purpose, and risk |
| Dangerous command or blocked path | Blocked | Approval cannot override a hard safety block in the normal product flow |
| Git mutation, dependency installation, deletion, or rename | Outside the first MVP or high risk | Requires later explicit scope plus operation-specific approval |
| Credentials, paid services, legal terms, and publication | Human-controlled | Separate authorization is required; Voicomp never fabricates or exposes credentials and never publishes by assumption |

For an edit, approval applies only to the exact proposal the user reviewed. A
changed document invalidates the approval. Rejected, expired, reused,
mismatched, or unverifiable approvals must fail closed and leave the workspace
unchanged.

## Context minimization and priority

Voicomp must not send an entire repository automatically. It starts with small,
relevant metadata and retrieves additional content only through bounded tools.

Initial context may include the workspace and folder names, active file path and
language, explicit selection, cursor location, open-file names, related visible
diagnostics, a small project overview, selected manifests, repository
instructions, and a short relevant README excerpt. Content inclusion remains
subject to trust, sensitivity, user settings, and budgets.

When choosing context, use this order:

1. explicit user selection;
2. active editor;
3. files explicitly named by the user;
4. open editors;
5. diagnostics related to the active file;
6. search results;
7. project manifests;
8. workspace overview; and
9. other files requested through a valid tool call.

Configurable limits must bound file size, search-result count, lines per tool
result, total text context, workspace-tree depth, and transcript length. A
truncated result must say that it was truncated and why; omission must not be
presented as complete evidence.

Sensitive files, secret-like file patterns, ignored build and dependency trees,
binary files, oversized files, unsupported URI schemes, out-of-workspace paths,
and traversal attempts must be excluded or require an explicit safe path.
Ignore-file membership is only one signal and never proves that content is safe.

## Naming contract

- Product and display name: `Voicomp`.
- npm and extension package-name target: `voicomp`.
- Commands, views, settings, and internal contribution identifiers:
  `voicomp.*`.
- User-facing command prefix: `Voicomp:`.
- Output channel: `Voicomp`.
- Physical workspace path: unchanged.

New repository content must not introduce an alternate product name or a second
identifier namespace. Final publisher and public extension-identifier decisions
must be verified and recorded before publication metadata is approved.

## Platform and compatibility policy

VS Code stable is the primary product target. Voicomp uses stable, documented VS
Code Extension APIs and must not depend on proposed APIs without explicit
approval.

Cursor compatibility is established through testing, not inference. The release
candidate must be installed and exercised in an available Cursor environment,
including the sidebar, Webview, microphone, secret storage, Realtime transport,
workspace tools, approved edits, and any enabled Git or terminal tools. Supported
versions and limitations must be documented from test evidence. VS Code behavior
must not be weakened to accommodate Cursor, and private Cursor APIs are out of
scope.

## Workspace trust, security, and privacy principles

### Trust and process boundaries

- The Webview owns presentation, browser audio, session controls, and approval
  input. It does not read workspace files, hold the standard API key, execute
  tools, run commands, or mutate the project.
- The Extension Host owns editor API access, secret storage, context retrieval,
  tool execution, path and trust checks, approvals, mutations, and sanitized
  logging. Standard-key use and client-secret minting are restricted to a
  supported local Extension Host.
- Provider-specific conversation code remains separated from generic session,
  tool, context, and approval behavior.
- Every external event, tool argument, provider payload, and Webview/Extension
  Host message is runtime-validated. Unknown or invalid data is rejected
  intentionally.
- Long-running work supports cancellation and bounded failure handling.

### Untrusted workspaces

When the workspace is not trusted, Voicomp may open the sidebar, explain its
capabilities, support secure key configuration only in a supported local
Extension Host, and, if the policy permits, operate on text the user explicitly
selected. It must disable broad workspace
scanning, file changes, Git mutation, terminal commands, task execution, and
automatic tool actions. The UI must explain the restriction clearly.

### Secrets and Webview safety

- Restrictive Webview content security policy, per-render nonces, and restricted
  local resources are required. Phase 1 loads no remote resources; later phases
  may permit only the provider connections required for a user-started session
  and documented by the approved architecture.
- Untrusted project content is rendered as text, never as executable markup.
- API keys, short-lived secrets, authentication headers, and environment values
  are never logged.
- The standard API key never reaches Webview JavaScript.
- Secrets and source content must not be included in packaged artifacts.

### Data and privacy

- No repository is uploaded automatically.
- File content is sent only when selected or retrieved for the active request
  under the context and tool policy.
- Transcript persistence is disabled by default. Any later persistence or export
  is user-controlled and documented.
- The initial release has no telemetry. Any later telemetry requires explicit
  approval, must be opt-in, and must exclude source code, prompts, file content,
  secrets, and microphone audio.
- Logs may include lifecycle state, tool names, durations, sanitized errors, and
  request identifiers. They must never include prompts, selections, source files,
  file content, secret values, authentication headers, environment values, or
  microphone audio.
- Users receive explicit controls to clear secrets and session context and to
  disable context sources.

## Error and transparency requirements

User-facing failures must be concise and actionable. Sanitized technical details
may be written to the Voicomp Output Channel, but raw stack traces, message
payloads, secrets, prompts, selections, source files, file content, and audio
must not be exposed there.

Voicomp must report unavailable tools, blocked paths, truncation, stale edit
proposals, denied permissions, connection failures, timeouts, and unsupported
environments honestly. It must not silently continue with broader access or
claim a result from incomplete evidence.

## Measurable success and definition of done

Completion requires recorded evidence for every applicable item. Intent, a
generated artifact by itself, or an unverified compatibility assumption is not
evidence.

### Phase 1 offline milestone

Phase 1 is done only when:

- `npm ci` succeeds;
- `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, and
  `npm run package` succeed;
- pressing `F5` launches an Extension Development Host through the documented
  workflow;
- Voicomp appears in the Activity Bar and its sidebar opens;
- a validated Webview message reaches the Extension Host and receives a
  validated response;
- the mock connection state and transcript render without an external network
  request;
- the informational API-key command does not collect, store, or transmit a key;
- packaging produces a local VSIX and package inspection finds no unexpected or
  secret-like content;
- the VSIX installs in a clean VS Code profile; and
- a Cursor smoke test is recorded when Cursor is available, with any unverified
  manual behavior left open rather than claimed.

After this evidence is reported, the mandatory Phase 1 stop applies.

### Functional MVP

The functional MVP is done only when a test or documented manual check proves
that:

- in a supported local environment, a user can start and stop a live voice
  session; remote live-BYOK limitations are reported explicitly;
- the user hears the assistant, sees partial and final transcripts, and can
  interrupt assistant speech;
- active selection, active file, file reading, search, manifests, workspace
  summary, diagnostics, and read-only Git context work within defined limits;
- the context sent is inspectable and the repository is not uploaded
  automatically;
- sensitive, binary, oversized, outside-workspace, and unsupported content is
  blocked or handled through the declared safe flow;
- the standard API key is persisted only in secret storage, retained only in
  supported local Extension Host memory while needed, and never enters a remote
  Extension Host, the Webview, logs, package, or repository;
- untrusted workspaces disable broad reads and dangerous actions;
- an edit proposal shows the exact diff, rejection changes nothing, stale
  approval fails, and an approved edit uses controlled workspace editing with
  undo support;
- terminal features remain opt-in, approved commands show their exact execution
  context, time out safely, and dangerous commands are rejected;
- session cleanup releases listeners, audio resources, and connections;
- security-critical unit and integration tests pass; and
- privacy, security, accessibility, and known-platform limitations are
  documented accurately.

### Complete project and release readiness

The complete project is done only when, in addition to the functional MVP:

- the VSIX is reproducibly built, inspected, and installed in a clean VS Code
  profile;
- CI runs lint, type checking, tests, build, security checks, and package
  generation on the required events;
- the package contains no credentials or unnecessary source-sensitive content;
- supported Cursor behavior is backed by recorded manual tests;
- installation, BYOK, microphone, privacy, security, support, and release
  documentation are complete;
- publication metadata and assets are verified; and
- any Marketplace or Open VSX publication occurs only after separate explicit
  authorization.

## Future phase map

Future work remains ordered by `docs/BUILD_PLAN.md`:

| Phase | Product outcome |
| --- | --- |
| 2 | Complete offline conversation UI and mock Realtime transport |
| 3 | Secure live Realtime voice connection and BYOK secret flow |
| 4 | Progressive context engine and read-only workspace tools |
| 5 | Planning, fact/assumption clarity, context controls, and conversation compaction |
| 6 | Read-only Git and richer diagnostics |
| 7 | Diff proposals and explicit edit approval |
| 8 | Controlled, opt-in tests, linting, tasks, and terminal actions |
| 9 | Product, privacy, security, accessibility, and recovery hardening |
| 10-12 | CI, release assets and documentation, packaging, and pre-release validation |
| 13-15 | Separately authorized registry publication and evidence-backed Cursor distribution |
| 16 | Stable-release maintenance and regression discipline |

No future phase is authorized merely because it is described here.
