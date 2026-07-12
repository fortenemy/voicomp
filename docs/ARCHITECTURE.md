# Voicomp Architecture

## Status and scope

This is a Phase 0 decision record. The repository currently contains documentation
only: no extension runtime, Webview, provider, tool, or security component is
implemented. Described components are targets, not evidence that code exists or
permission to advance phases.

Phase 1 will deliver one offline VS Code extension with an Extension Host bundle, a
secure sidebar Webview bundle, strict Zod-validated messages, and mock connection
state and transcript data. It will make no provider call, capture no audio, read no
workspace content, and perform no mutation. Later phases remain unauthorized until
their build-plan order and approval gates are satisfied.

## Architectural principles

- Keep trust boundaries explicit and validate every external or cross-runtime value.
- Prefer a few small files with one responsibility over frameworks, empty layers, or
  early abstractions.
- Separate policy from mechanism and provider-specific behavior from product logic.
- Minimize context and capability; deny, truncate, or fail visibly rather than widen
  access silently.
- Add each component only in its owning phase. Stable VS Code APIs are the baseline.

## Runtime trust boundaries

| Boundary | Owner and authority |
| --- | --- |
| Webview | Presentation and user intent. In future phases it owns microphone capture, audio playback, WebRTC, and the provider data channel. It never owns the standard API key, workspace APIs, tool execution, approval authorization, or mutations. |
| Extension Host | Trusted coordinator. In future phases it owns secret storage, standard-key use, ephemeral-secret minting, workspace APIs, context policy, tools, approval gates, and mutations. |
| Provider | Untrusted network peer behind a narrow provider interface. Events and tool requests are normalized and runtime-validated. |
| Workspace | Untrusted paths, content, settings, tasks, and state, accessed only through host policy and VS Code APIs. |

The Webview cannot call VS Code APIs directly. Message validation at one boundary
does not make data trusted at the next boundary.

## Phase 1 implemented subset

Phase 1's planned subset is activation/deactivation, command and sidebar
registration, a restrictive local-only Webview, sanitized Output Channel logging,
and a typed round trip. Direction-specific Zod discriminated unions validate
`webview.ready`, initial mock state, connection-check request/result, and safe error
messages. The Webview renders mock state and a mock transcript using text-safe DOM
APIs. A per-render nonce, `default-src 'none'`, minimal local resource roots, and
explicit disposal are required. “Implemented” here names the Phase 1 acceptance
surface; none of it exists during Phase 0.

## Target components by future phase

| Phase | Components introduced only then |
| --- | --- |
| 2 | Conversation coordinator/state machine and mock provider implementing the provider interface |
| 3 | Host secret broker and provider adapter; Webview WebRTC/media transport |
| 4-6 | Context engine, budget/filter policies, read-only workspace tools, planning controls, read-only Git and diagnostics |
| 7 | Proposal builder, diff preview, approval gate, controlled `WorkspaceEdit` adapter |
| 8 | Named test/lint/typecheck/task adapters and tightly controlled command execution |
| 9+ | Hardening, release automation, packaging, compatibility evidence, and separately authorized publication |

The provider interface exposes session start/stop, normalized input/output events,
tool-call delivery, interruption, cancellation, and disposal. Generic conversation,
context, tool, and approval code must not depend on OpenAI payload types.

## Dependency direction

Dependencies point inward: shared schemas and domain contracts → pure policies and
state → coordinators → provider, VS Code, storage, logging, and Webview transport
adapters. The composition root wires them. The Webview depends only on browser code
and shared message contracts; it never imports host implementation. Provider and
VS Code adapters do not call each other except through a coordinator. Cycles and
large “manager” files are rejected in favor of small, named modules.

## Message and data flows

Phase 1: Webview posts `ready` → host validates → host returns validated mock state
and transcript → Webview validates and renders. A user connection check follows the
same correlated request/result path. Invalid messages are rejected without logging
payloads.

Future voice: user starts session → host reads the standard key from SecretStorage
and mints a short-lived client secret → only that secret and bounded session config
cross to the Webview → Webview opens microphone/WebRTC/data channel → normalized
events cross typed messages → host executes any allowed tool → bounded result
returns to the provider path. Stop or expiry clears transient credentials and media.

Future context: request → workspace trust/root/URI checks → sensitive and binary
filter → configurable per-item and total context budget → normalized result. Limits
cover bytes, lines, search count, tree depth, and transcript length. Truncation and
omission are explicit; the repository is never uploaded automatically.

## Security invariants

- Standard API keys stay in SecretStorage and trusted host-side provider code; no
  key, short-lived secret, source, transcript, or audio is logged.
- Cross-boundary values start as `unknown` and pass strict, bounded runtime schemas.
- Workspace access is root-bound, URI-aware, trust-gated, filtered, and budgeted.
- Tools declare a risk level: read-only, sensitive/broad read, proposal, mutation,
  or execution. Host policy may require approval or hard-block an operation.
- Mutation/execution requires an exact preview and an internal approval token bound
  to the operation digest, arguments, workspace root, resource versions, session,
  and risk. It is short-lived, single-use, consumed atomically, and cannot be issued
  by the model. Stale, reused, expired, or mismatched approval fails closed.
- There is no generic shell tool. Phase 8 may expose only named checks/tasks or
  narrowly validated commands, disabled by default with exact preview, timeout, and
  cancellation. Approval never overrides a hard block.

## Lifecycle/error/cancellation

The composition root owns extension disposables; a view owns its listeners; a
session owns provider transport, media, timers, and pending calls; each tool owns a
cancellation scope. Stop accepting events, invalidate approvals, cancel work, close
data/media, then dispose listeners. View disposal and deactivation are idempotent;
late session-correlated events are ignored.

Cancellation propagates as VS Code `CancellationToken` or browser/network
`AbortSignal` and returns a distinct cancelled outcome. Failures are categorized,
shown to users actionably, and logged only as allowlisted metadata. Partial or
indeterminate mutation forces state refresh and is never reported as success.

## Testing seams

Pure tests cover schemas, state transitions, context budgets/filters, path and trust
policy, tool risk, approval expiry/reuse/digest binding, and cancellation. Adapter
contract tests use a deterministic mock provider, fake clocks, fake SecretStorage,
and synthetic multi-root/URI fixtures. Webview tests cover safe rendering, message
correlation, CSP, nonce, and disposal. Official VS Code Extension Host tests cover
activation, registrations, trust behavior, workspace adapters, edits, and cleanup.
Real provider, microphone, remote, and Cursor checks are explicit smoke tests only
in their authorized phases, never default credential-dependent CI.

## Planned repository structure

This placement guide does not describe the current tree. Create paths only when
their phase is active.

```text
src/extension.ts                    Phase 1 composition root
src/{commands,logging,ui}/          Phase 1 host responsibilities
src/shared/messages/                Phase 1 Zod contracts
webview/{main,controller,render}.ts Phase 1 browser responsibilities
src/conversation/                   future state and coordination
src/providers/                      future provider interface/adapters
src/{context,tools,approvals}/      future policies and execution gates
src/{storage,platform}/             future trusted adapters
webview/{provider,media}/           future WebRTC and audio
test/{unit,integration,fixtures}/   introduced with owning features
```

## Cursor/remote/multi-root constraints

VS Code stable is primary. Cursor compatibility is claimed only from recorded tests
against stable VS Code Extension APIs; no private Cursor API or inferred guarantee
is allowed. Every operation binds an explicit workspace folder and `vscode.Uri`;
there is no implicit first root. Root changes cancel affected work and invalidate
approvals. Remote Webview and Extension Host runtimes may not share a filesystem,
OS, environment, or loopback. Use `workspace.fs` and capability-aware adapters;
unsupported schemes or local-process operations return unavailable explicitly.

## Sources

Internal sources: [build plan](./BUILD_PLAN.md), [product specification](./PRODUCT_SPEC.md),
and [approved Phase 0-1 design](./superpowers/specs/2026-07-12-voicomp-phase-0-1-design.md).

Official sources checked 2026-07-12:

- [OpenAI Realtime API with WebRTC](https://developers.openai.com/api/docs/guides/realtime-webrtc) — browser WebRTC and ephemeral-secret flow.
- [VS Code Webview API](https://code.visualstudio.com/api/extension-guides/webview) — message passing, CSP, local resources, and lifecycle.
- [VS Code Testing Extensions](https://code.visualstudio.com/api/working-with-extensions/testing-extension) — official Extension Host test CLI and Electron harness.

External behavior must be rechecked in its implementation phase; this document
does not freeze an SDK version, model, endpoint payload, or compatibility claim.
