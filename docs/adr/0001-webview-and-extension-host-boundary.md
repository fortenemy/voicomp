# ADR 0001: Webview and Extension Host Boundary

## Status

Accepted. This is a future-facing architecture decision recorded during Phase 0.
The repository is documentation-only today; no runtime boundary or control described
here has been implemented.

## Date

2026-07-12

## Context

Voicomp needs a browser-capable surface for its sidebar and, in later phases,
low-latency microphone capture, audio playback, and WebRTC. It also needs privileged
access to VS Code secrets, workspace APIs, context selection, tools, approvals, and
controlled mutations. Combining these responsibilities would allow browser-facing
code or provider-controlled events to reach capabilities that should remain trusted.

VS Code Webviews communicate with extensions by JSON-serializable messages and should
receive only the minimum capabilities and local resources they require. Workspace
content and provider data are untrusted even after crossing one boundary. Voicomp
therefore needs an explicit ownership model that remains stable as later features are
added. Phase 1 will exercise only an offline, mock message round trip; it will not
capture audio, inspect workspace content, execute tools, mutate files, or call OpenAI.

## Decision

The Webview owns presentation and browser media behavior. It renders controls,
transcripts, connection state, approval previews, and tool activity. In future phases
it will capture microphone input, play assistant audio, and own the browser WebRTC
peer connection and provider data channel.

The Extension Host owns all privileged and policy-bearing behavior: the standard API
key, SecretStorage access, VS Code workspace APIs, context assembly and budgets, tool
registration and execution, canonical path validation, workspace-trust decisions,
approval authorization, mutations, and sanitized operational logging. The Webview
must never receive direct workspace, standard-key, approval-token, mutation, or tool
execution access.

Every message in both directions starts as `unknown` and must pass a direction-specific,
bounded Zod schema before use. Discriminated unions, correlation and session identifiers,
and explicit versioning will reject unknown, stale, or unrelated messages. Validation
at this boundary does not bypass later provider, tool, path, or approval validation.

## Consequences

The split limits the impact of Webview compromise and keeps security policy testable in
host-side modules. UI and media code can evolve without importing VS Code adapters,
while host tools remain independent of DOM and provider transport details. Remote and
multi-root behavior can be handled through VS Code APIs instead of assumed shared paths.

The cost is explicit message plumbing, duplicate runtime validation at appropriate
boundaries, lifecycle coordination, and careful propagation of cancellation and errors.
Audio and provider events must be normalized before privileged work can occur. These
costs are accepted because the boundary is part of the product's security model.

## Rejected Alternatives

A Webview that reads files, stores the standard key, or executes tools directly is
rejected because UI compromise would become workspace compromise. Keeping UI, media,
and workspace policy in one Extension Host bundle is rejected because browser media
and WebRTC belong in the browser runtime and would entangle trusted policy with device
handling. Compile-time TypeScript types without runtime schemas are rejected because
cross-runtime messages are untrusted JavaScript values.

## Security and Privacy Impact

This decision keeps standard credentials and workspace authority outside the Webview.
The Webview will use a restrictive Content Security Policy, a fresh nonce, minimal
`localResourceRoots`, text-safe rendering, and bounded messages. Host-side policy must
still filter sensitive paths, minimize provider-bound context, require exact approval
for mutations, and prevent payloads, source, transcripts, audio, and credentials from
entering logs. A compromised Webview can request an action but cannot authorize it.

## Sources

Internal decisions: [Architecture](../ARCHITECTURE.md),
[Security](../SECURITY.md), and [Privacy](../PRIVACY.md).

Official sources checked 2026-07-12:

- [VS Code Webview API](https://code.visualstudio.com/api/extension-guides/webview)
  — message passing, least capability, local resource restrictions, CSP, and lifecycle.
- [VS Code Extension Host](https://code.visualstudio.com/api/advanced-topics/extension-host)
  — extension runtime placement, including local, remote, and web hosts.
