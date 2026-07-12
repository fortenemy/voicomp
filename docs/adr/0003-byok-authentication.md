# ADR 0003: BYOK Authentication

## Status

Accepted. This records the authentication design for future Phase 3. The current
Phase 0 repository is documentation-only. Phase 1 will have only an informational
API-key command: it will not accept, store, validate, or transmit an API key.

## Date

2026-07-12

## Context

Voicomp requires OpenAI authentication for its later Realtime voice capability, but
the initial product has no hosted Voicomp backend or account service. A long-lived
standard API key gives access to the user's OpenAI project and must not be exposed to
workspace files, settings synchronization, browser-facing Webview code, diagnostics,
logs, or packaged assets.

VS Code provides `ExtensionContext.secrets` for encrypted extension secret storage and
documents that its implementation varies by platform and does not synchronize secrets
across machines. The OpenAI browser Realtime flow separates the standard server-side
key from a short-lived client secret used by the browser. These capabilities support a
bring-your-own-key model without bundling a publisher-owned credential.

## Decision

Future Phase 3 will implement `Voicomp: Set OpenAI API Key` as a dedicated secure VS
Code command. The command will collect the standard key through a masked editor input
flow and send it only to trusted Extension Host code. The Host will store the value
only in `ExtensionContext.secrets`. It will not mirror the key into user or workspace
settings, Webview state, global state, environment files, diagnostics, telemetry, test
fixtures, or logs.

When the user starts a Realtime session, the Extension Host will retrieve the standard
key, call `POST /v1/realtime/client_secrets`, and pass only the returned short-lived
ephemeral secret plus bounded session configuration to the Webview. The Host must
sanitize failures before displaying or logging them. The key is used only for this
user-requested provider operation and is never made available to workspace tools.

Future Phase 3 will also implement `Voicomp: Clear OpenAI API Key`. Clearing deletes
the value from SecretStorage, terminates sessions that depend on it, invalidates
transient credentials, and reports a safe success or actionable failure without
revealing secret material.

Voicomp will not bundle, download, or derive a publisher-owned key. A future hosted
backend would be a separate authentication and operating mode requiring a new ADR,
threat model, privacy disclosure, build-plan authorization, and human approval; it is
not part of the current MVP.

## Consequences

Users retain control of their OpenAI account, usage, limits, and key revocation, while
Voicomp avoids operating a credential-bearing backend. SecretStorage reduces accidental
disclosure compared with settings or files, and the Webview receives only a transient
credential scoped to session establishment.

Users must obtain and manage their own key and may need to set it again on another
machine because SecretStorage is not synchronized. Platform secret storage cannot
protect against a compromised user account, operating system, Extension Host, or editor.
Authentication errors need clear, sanitized recovery guidance.

## Rejected Alternatives

A publisher-owned key embedded in the extension is rejected because it would be
extractable, share billing and quota across users, and create unacceptable abuse risk.
Settings JSON, workspace files, environment files, global state, and Webview persistence
are rejected because they increase disclosure or synchronization risk. Sending the
standard key directly to OpenAI from the Webview is rejected because the Webview is not
the credential trust domain. Building a hosted proxy now is rejected as unnecessary
scope and a materially different privacy and security model.

## Security and Privacy Impact

The standard key remains confined to trusted host memory and encrypted SecretStorage;
only a short-lived client secret crosses to the Webview. Logs and diagnostics must use
allowlisted metadata and never include credentials, headers, request bodies, provider
payloads, source content, transcripts, or audio. Secret clearing and session disposal
must be deterministic and testable. BYOK does not eliminate provider processing: users
must receive accurate disclosure of what audio, conversation, and bounded workspace
context OpenAI receives during a live session.

## Sources

Internal decisions: [Security](../SECURITY.md), [Privacy](../PRIVACY.md), and
[Architecture](../ARCHITECTURE.md).

Official sources checked 2026-07-12:

- [VS Code API: `ExtensionContext.secrets` and `SecretStorage`](https://code.visualstudio.com/api/references/vscode-api)
  — extension-owned encrypted secret storage and deletion semantics.
- [VS Code common extension capabilities](https://code.visualstudio.com/api/extension-capabilities/common-capabilities)
  — SecretStorage behavior for desktop extensions.
- [OpenAI Realtime API with WebRTC](https://developers.openai.com/api/docs/guides/realtime-webrtc)
  — standard-key server boundary and ephemeral client-secret browser flow.
