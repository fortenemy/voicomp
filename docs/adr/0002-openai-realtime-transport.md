# ADR 0002: OpenAI Realtime Transport

## Status

Accepted. This selects a future Phase 3 direction, subject to rechecking the official
API and SDK when that phase begins. Phase 0 is documentation-only, and Phase 1 will
contain no OpenAI dependency, network call, credential collection, or live audio.

## Date

2026-07-12

## Context

Voicomp needs a low-latency browser voice transport without exposing the user's
standard OpenAI API key to the Webview. OpenAI documents WebRTC as the browser path
and supports short-lived client secrets minted with a standard key by a trusted
server-side component. In Voicomp, a supported local Extension Host fills that role
and the Webview is the browser client. ADR 0003 requires live BYOK to fail closed
when the extension runs in a remote Extension Host.

The transport choice must preserve Voicomp's provider abstraction. Conversation state,
tool policy, workspace context, approvals, and mutations cannot become dependent on raw
OpenAI events or browser-side SDK behavior. Model and voice availability can change, so
the architecture must not freeze a transient default in this Phase 0 record.

## Decision

In future Phase 3, a supported local Extension Host will verify that
`vscode.env.remoteName` is undefined, read the user's standard BYOK key, and call
`POST /v1/realtime/client_secrets` with a bounded session configuration. It will pass
only the returned short-lived ephemeral client secret and approved session settings to
the Webview. The standard key never crosses that boundary.

The Webview will establish the OpenAI Realtime session with WebRTC. Voicomp prefers the
official `@openai/agents/realtime` browser WebRTC transport, including
`OpenAIRealtimeWebRTC` or the browser default used by `RealtimeSession`, behind a
project-owned provider interface. That interface exposes normalized lifecycle, input,
output, interruption, cancellation, and tool-call events rather than SDK-specific
types. Raw WebRTC remains a fallback only if implementation-phase evidence shows that
the SDK cannot satisfy Voicomp's security, lifecycle, packaging, or control needs.

Tool execution remains exclusively in the Extension Host. A provider tool request is
validated and forwarded across the typed boundary; host policy decides whether it is
allowed, executes it if permitted, and returns a bounded result. Browser SDK convenience
features do not grant workspace capability or approval authority. Model and voice will
be user-configurable from a validated supported set, with safe defaults chosen and
rechecked during Phase 3.

## Consequences

WebRTC gives the Webview the browser-native microphone and playback path and avoids
sending the standard key into browser code. The official transport can reduce custom
peer-connection, audio, interruption, and event-lifecycle code while the provider
interface limits vendor coupling and preserves a deterministic mock provider.

The design adds a client-secret request, expiry handling, reconnect behavior, strict
cross-boundary schemas, and SDK dependency review. A session cannot begin offline or
without a valid user key. SDK and endpoint behavior must be revalidated before
implementation; a remote Extension Host cannot start a live BYOK session. This ADR
does not authorize Phase 3 work early.

## Rejected Alternatives

Putting the standard API key in the Webview is rejected because browser-facing code
cannot protect a long-lived credential. A default WebSocket voice loop in the Extension
Host is rejected because it moves browser media handling into the wrong runtime and the
official SDK recommends WebRTC for browser speech-to-speech. Direct raw WebRTC as the
initial implementation is rejected because it duplicates transport lifecycle already
provided by the official SDK. Letting the browser SDK execute workspace tools is rejected
because it crosses Voicomp's trust boundary.

## Security and Privacy Impact

Only a short-lived session credential reaches the Webview; it must remain in memory and
be discarded on stop, expiry, reload, or disposal. Standard keys, ephemeral secrets,
authorization headers, raw provider payloads, microphone audio, transcripts, and source
content must not be logged. Microphone capture occurs only after a user-started session
and platform permission. Provider-bound context remains visible, filtered, and bounded.
Key setup, SecretStorage retrieval, client-secret minting, and live-session startup
must be blocked before secret access whenever `vscode.env.remoteName` is defined.

## Sources

Internal decisions: [Architecture](../ARCHITECTURE.md),
[Security](../SECURITY.md), and [Privacy](../PRIVACY.md).

Official sources checked 2026-07-12:

- [OpenAI Realtime API with WebRTC](https://developers.openai.com/api/docs/guides/realtime-webrtc)
  — browser WebRTC and server-minted ephemeral client-secret flow.
- [OpenAI Agents SDK voice quickstart](https://openai.github.io/openai-agents-js/guides/voice-agents/quickstart/)
  — `@openai/agents/realtime`, short-lived tokens, and browser connection behavior.
- [OpenAI Agents SDK Realtime transport](https://openai.github.io/openai-agents-js/guides/voice-agents/transport/)
  — WebRTC as the default browser transport and `OpenAIRealtimeWebRTC` customization.
