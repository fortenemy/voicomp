# Voicomp Security Model

## Status and scope

Voicomp is an MIT-licensed VS Code extension intended to provide a real-time voice
assistant with controlled access to the active workspace. This document is the
repository-wide security model and disclosure policy.

All 19 Phase 0 master tasks are complete, independently reviewed, committed,
synchronized to GitHub, and read back from remote `main`. Phase 1 has not started.

The repository contains documentation only: no extension runtime, Webview,
provider connection, microphone path, workspace tool, approval gate, or security
control described below has been implemented. Phase 1 is planned as an offline
extension: it will use mock state and transcript data, make no provider call,
capture no audio, read no workspace content, and perform no mutation. Controls
assigned to later phases are requirements for future work, not claims about
current protection or authorization to implement those phases.

## Assets and security objectives

The protected assets are the user's standard OpenAI API key and future ephemeral
client secrets; workspace files, selections, diagnostics, Git state, and settings;
microphone audio, transcripts, and assistant audio; user intent and approvals;
extension and editor integrity; and the accuracy of security-relevant logs and UI.

Voicomp must minimize every capability and disclosure, keep secrets in their
owning trust domain, validate data at every boundary, bind operations to an
explicit workspace resource, and fail closed when identity, scope, trust, or user
intent is uncertain. Workspace content can instruct or mislead a model but can
never grant capability. No repository is uploaded automatically.

## Actors and trust boundaries

The user controls editor actions, settings, provider credentials, and approvals.
Extension developers and release maintainers control source, dependencies, and
packages. Workspace authors may be hostile and control names, paths, content,
tasks, settings, symlinks, and repository history. The provider is an untrusted
network peer whose events and tool requests require validation.

The Webview is an untrusted presentation boundary. It may express user intent and,
in a future phase, handle microphone, playback, WebRTC, and the provider data
channel. It cannot call VS Code APIs directly and never owns the standard API key,
workspace access, tool execution, approvals, or mutations. The Extension Host is
the trusted coordinator for workspace policy, tools, approval enforcement, and
mutations. SecretStorage retrieval, standard-key use, and ephemeral-secret minting
are permitted only in a supported local Extension Host. A remote Extension Host
must reject key setup, key retrieval, minting, and live sessions before secret
access. The workspace and provider remain untrusted even after one message or event
has passed another boundary.

## Phase 1 controls

Phase 1 must remain provider-free and offline, with no external network request.
Direction-specific Zod schemas validate
both Webview-to-host and host-to-Webview messages at runtime; values begin as
`unknown`, discriminated unions reject unknown variants, fields are bounded, and
invalid payloads are rejected without logging their contents. Correlation and
session identifiers prevent unrelated responses from being accepted.

The Webview must send a restrictive Content Security Policy with
`default-src 'none'`, a fresh cryptographic nonce for each render, nonce-authorized
scripts only, and the minimum required local resource sources. Its
`localResourceRoots` are restricted to the exact packaged asset directories it
needs. It must not use inline event handlers, remote scripts, or `innerHTML`;
untrusted text is rendered with text-safe DOM APIs. Host and view listeners are
explicitly disposed, late messages are ignored, and Output Channel logs contain
only allowlisted metadata.

## Future tool and approval model

Future tools are classified as read-only, sensitive or broad read, proposal,
mutation, or execution. Classification determines hard blocks, workspace-trust
requirements, context limits, previews, and approval. The Extension Host—not the
model, provider, or Webview—enforces policy and executes tools. A proposal is not
permission to apply it.

Every future mutation or execution requires an exact user-visible preview and an
internal approval token bound to the operation digest, complete validated
arguments, explicit workspace root, affected resource versions, session, and risk
level. The token is short-lived and single-use, is consumed atomically before the
operation, and cannot be minted by the model. Stale, replayed, expired, already
used, or mismatched tokens fail closed. Approval cannot override a hard block.

There will be no generic shell tool. A later, separately authorized phase may add
named test, lint, typecheck, or task adapters and narrowly validated commands.
They remain disabled by default and require exact command and working-directory
preview, bounded output, cancellation, timeout, and explicit approval.

## Workspace/path/sensitive-file policy

Workspace access uses `vscode.Uri` and VS Code workspace APIs rather than string
prefix checks or assumptions about a local filesystem. Every operation binds to
one explicit workspace folder; multi-root workspaces never imply the first root.
The host canonicalizes the target URI, verifies the canonical target remains in
the selected root, rejects traversal, and checks the resolved target so symlinks
cannot escape that root. Root changes cancel affected work and invalidate
approvals. Unsupported or ambiguous remote URI schemes fail as unavailable; host
and Webview are never assumed to share an OS, filesystem, environment, or
loopback interface.

An untrusted workspace disables broad or sensitive reads, all mutation, and all
terminal or task execution. Narrow passive UI may remain, but trust elevation must
come from VS Code and triggers a fresh policy decision; it does not revive stale
approvals.

Sensitive defaults include environment files, credential and token stores,
private keys and certificates, SSH material, cloud-provider configuration,
password databases, editor secret settings, and Git internals. Common examples
include `.env` variants, `.ssh`, `.aws`, `.azure`, `.git`, and files with private
key or credential-oriented extensions. Binary and oversized files are also denied
by default. Sensitive discovery does not disclose file contents, and access is
blocked or requires a deliberate, narrowly scoped future user action. Per-item and
total byte, line, result-count, tree-depth, and transcript budgets prevent broad
collection; omissions and truncation are visible.

## Secrets and BYOK

Voicomp is bring-your-own-key. In Phase 3, the standard OpenAI API key will be
accepted through a dedicated command, stored only with
`ExtensionContext.secrets`, retained only in supported local Extension Host memory,
and transmitted over authenticated HTTPS to OpenAI solely to call
`POST /v1/realtime/client_secrets`. The Webview never receives the standard key.
The host may pass only the returned short-lived client secret plus a bounded
session configuration to the Webview. Stop, expiry, reload, and disposal clear
transient credentials and session state.

Secrets must not appear in source, settings files, command arguments, errors,
logs, telemetry, transcripts, test fixtures, build artifacts, or packaged VSIX
contents. Voicomp contains no bundled credentials. Clearing the key must remove it
from SecretStorage and terminate sessions that depend on it.

The implementation must check `vscode.env.remoteName` before presenting or
accepting the Set OpenAI API Key flow and before every SecretStorage `get`, client-
secret request, or live-session transition. A defined value fails closed with a
sanitized unsupported-state message. Clear OpenAI API Key may call only
SecretStorage deletion and must not retrieve the value. Tests must use a fake
remote environment and spy SecretStorage/provider adapters to prove that forbidden
calls do not occur. Offline and read-only remote workspace features may use
capability-aware VS Code APIs; unsupported local-process, Git, or terminal features
must fail visibly.

## Logging/redaction/privacy

Logs are disabled from carrying payloads and use an explicit metadata allowlist,
such as event category, safe state, duration, bounded counts, and a generated
correlation identifier. Sanitization occurs before formatting or transport so
exception messages and provider objects cannot bypass redaction. Logs never
contain API keys, client secrets, authorization headers, source files, selections,
file contents, paths when avoidable, prompts, transcripts, microphone audio, or
assistant audio.

Voicomp has no telemetry. Future diagnostic export must be opt-in, previewed,
sanitized, and local unless the user deliberately sends it. Provider-bound context
must be user-visible, filtered, bounded, and limited to what the active request
needs. Privacy documentation must match the implemented data flow before any live
provider or marketplace release.

## Cancellation/timeouts/disposal

Cancellation propagates across host work with VS Code `CancellationToken` and
across browser or network work with `AbortSignal`. Reads, searches, provider calls,
tools, and future commands have explicit time and size bounds and return a distinct
cancelled or timed-out outcome instead of success. Pending approvals become
invalid when their session, root, resource version, or operation changes.

Ownership is explicit: the composition root owns extension disposables; each view
owns listeners; each session owns provider transport, media, timers, transient
credentials, and pending calls; each tool owns its cancellation scope. Shutdown
first stops new events, then invalidates approvals, cancels work, closes data and
media, and disposes listeners. Disposal and deactivation are idempotent. Late or
wrong-session events are ignored. A partial or indeterminate mutation forces a
state refresh and is never reported as success.

## Dependency/package/release checks

Dependencies must be necessary, pinned by the lockfile, reviewed for maintenance
and security impact, and installed reproducibly with `npm ci`. CI and release work
must run lint, strict typechecking, tests, and builds; release phases also verify
the generated package, dependency findings, licenses, and secrets. The VSIX
contents must be inspected to exclude credentials, logs, source material not
needed at runtime, development files, and unintended network configuration.

Publishing remains disabled until separately authorized. Credentials must use the
approved release platform's secret mechanism and must not be available to
untrusted pull requests. The tested artifact must be the artifact released.
Voicomp is licensed under MIT; package metadata and notices must remain consistent
with that license.

## Abuse cases and mitigations

- A malicious file instructs the model to reveal secrets or run a command.
  Workspace text conveys data only; host policy denies capabilities, sensitive
  reads, and generic shell execution independently of model output.
- A forged Webview or provider message requests a tool. Strict schemas in both
  message directions, tool allowlists, session correlation, host-side policy, and
  approval binding reject it.
- A path uses traversal, encoding, a symlink, another workspace root, or a remote
  scheme to escape scope. Canonical URI and resolved-target checks bind it to one
  explicit root or fail closed.
- An attacker replays or alters an approved edit or command. Exact previews,
  digest and resource-version binding, short expiry, and atomic single use make
  the approval invalid.
- A compromised dependency or package leaks data. Minimal dependencies,
  reproducible installs, audits, secret scans, package inspection, and controlled
  release credentials reduce the risk.
- Unbounded messages, searches, audio, or provider events exhaust resources.
  Schema limits, budgets, cancellation, timeouts, bounded queues and output, and
  deterministic disposal constrain denial of service.

## Residual risks

A trusted workspace can still contain adversarial instructions, and users can
approve a harmful but accurately previewed operation. Provider-side retention,
model behavior, editor vulnerabilities, compromised dependencies, malicious
extensions, operating-system compromise, and microphone permission behavior are
outside Voicomp's full control. Remote and Cursor behavior may differ from VS Code
and requires recorded testing before compatibility claims.

Live BYOK sessions are not supported while Voicomp runs in a remote Extension Host.
A future split between a local credential broker and a remote workspace helper
would introduce a new authenticated boundary and is forbidden until a separate ADR,
threat model, privacy review, tests, and human authorization exist.

SecretStorage protects against accidental disclosure but cannot defend a fully
compromised Extension Host or user account. Path and symlink behavior varies by
filesystem and URI provider. These risks require defense in depth, narrow defaults,
visible context and previews, prompt cancellation, current dependency review, and
honest documentation. A bypass that exposes a standard key, escapes a workspace
root, or performs unapproved mutation or execution is high-impact and must block
release; cosmetic metadata leakage without sensitive content is lower impact.

## Reporting vulnerabilities

Do not open a public issue for a suspected vulnerability and do not include real
credentials, private source, transcripts, or audio in a report. Use the private
security-reporting channel configured for the repository or hosting platform. If
no private channel is available, contact the repository owner privately and ask
for one before sharing details. Include the affected version, environment,
preconditions, minimal reproduction, security impact, and suggested mitigation.
Allow maintainers reasonable time to investigate and coordinate a fix before
public disclosure.

## Sources

Internal sources: [build plan](./BUILD_PLAN.md),
[architecture](./ARCHITECTURE.md), and [product specification](./PRODUCT_SPEC.md).

Official sources checked 2026-07-12:

- [VS Code Webview API](https://code.visualstudio.com/api/extension-guides/webview)
  — CSP, resource roots, message boundaries, and lifecycle.
- [VS Code Workspace Trust](https://code.visualstudio.com/api/extension-guides/workspace-trust)
  — restricted mode and trust-aware extension behavior.
- [OpenAI Realtime API with WebRTC](https://developers.openai.com/api/docs/guides/realtime-webrtc)
  — browser WebRTC and ephemeral client-secret flow.

External behavior must be rechecked in the phase that implements it. This model
does not freeze an API payload, endpoint, SDK, editor behavior, or provider policy.
