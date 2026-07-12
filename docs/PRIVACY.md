# Voicomp Privacy

## Status, date, and scope

- **Status:** Phase 0 privacy decision record and pre-release disclosure draft.
- **Last reviewed:** 2026-07-12.
- **Scope:** Voicomp, an MIT-licensed VS Code extension, including its planned
  operation in tested Cursor environments.

The repository currently contains documentation only. It has no extension
runtime, network connection, OpenAI integration, microphone access, workspace
file tools, telemetry, transcript store, or other persistence. Phase 1 is also
planned as an offline milestone. Every capability or control below identified as
**Future** is a requirement for a later phase, not a claim that it exists today
or permission to implement it early.

This document describes Voicomp's intended data boundaries. Applicable editor,
provider, operating-system, and remote-workspace terms also apply.

## Planned Phase 1 offline data flow

**Future Phase 1 requirement:** Phase 1 will remain provider-free and offline,
with no external network request. A sidebar Webview will send small,
runtime-validated UI messages to the Extension Host. The
Extension Host will return mock connection state, a mock transcript entry, and
sanitized errors through the same editor-controlled message boundary.

Phase 1 will make no external network request and will not call OpenAI. It will
not request microphone access, capture or play live audio, inspect workspace
files, invoke project tools, apply edits, collect telemetry, or persist session
history. Its API-key command will be informational only and will not collect,
store, validate, or transmit a key. Mock text is packaged test content, not a
recording or transcript of the user.

## Future BYOK OpenAI flow

**Future Phase 3 requirement:** Voicomp will use a bring-your-own-key flow. The
user will enter a standard OpenAI API key through a dedicated editor command only
when Voicomp runs in a supported local Extension Host. The standard API key will
be retained only in `ExtensionContext.secrets` storage and supported local host
memory. For a user-started Realtime session, that local Extension Host will
transmit it over authenticated HTTPS to OpenAI
solely to call `POST /v1/realtime/client_secrets`. The standard key will never
enter the Webview, settings, logs, transcripts, source control, or the packaged
extension.

When `vscode.env.remoteName` is defined, Voicomp will not offer or accept key
setup, retrieve a stored key, request a client secret, or start a live provider
session. It will show an explicit unsupported state before secret access. Clearing
an existing SecretStorage entry may remain available without reading its value.

OpenAI will return a short-lived client secret. Only that ephemeral secret and a
bounded session configuration will enter the Webview. The Webview may then
create the WebRTC connection, capture microphone input after editor or
operating-system permission, play assistant audio, and exchange Realtime events.
Stop, expiry, reload, and disposal will clear transient credentials and session
state.

**Future Phase 4 and later requirement:** Provider-bound workspace context will
come only from the explicit selection, active request, or a validated, bounded
tool result. Voicomp will not upload the complete repository automatically.

## Data categories

Voicomp distinguishes these data categories:

- **Credentials:** the future standard API key and ephemeral client secret.
- **Voice data:** future microphone audio and assistant audio for a live session.
- **Conversation data:** future user and assistant transcripts, typed messages,
  prompts, responses, and session state.
- **Workspace data:** file names, paths, selections, file content, diagnostics,
  manifests, search results, Git metadata, and workspace summaries requested by
  future tools.
- **Control data:** settings, workspace-trust state, context-source choices,
  tool activity, approval decisions, cancellation, and bounded identifiers.
- **Operational metadata:** safe lifecycle states, tool names, durations, bounded
  counts, and sanitized error categories used for local diagnostics.

## When audio, transcripts, or file content may leave the device

Today, none of these categories leaves the device because no runtime exists.
Phase 1 will remain offline.

| Category | Future condition for transfer | Destination and limit |
| --- | --- | --- |
| Standard OpenAI API key | In a supported local window, the user starts a Realtime session and the Extension Host requests a short-lived client secret; key setup and use are blocked when `vscode.env.remoteName` is defined | Retained only in SecretStorage and supported local Extension Host memory; transmitted over authenticated HTTPS to OpenAI solely to call `POST /v1/realtime/client_secrets`; never enters a remote Extension Host, the Webview, settings, or logs |
| Microphone audio | The user starts a live session and grants microphone access | OpenAI Realtime over the authorized WebRTC session; Voicomp will not log or persist source audio |
| Transcript or typed conversation | The user participates in a live provider session | OpenAI receives the conversation events needed for that session; local persistence remains off by default |
| Workspace content | The user selects content or the active request triggers an allowed, visible, bounded read-only tool | OpenAI receives only the context identified for that request, subject to trust, sensitivity, type, size, line, result-count, and total-context limits |

Provider processing, retention, and deletion are governed by the provider's
then-current terms, not by Voicomp alone. A future local transcript export will
occur only when the user asks; Voicomp will not send it automatically.

## Context minimization and user-visible sources

**Future requirement:** Context selection will prioritize the user's explicit
selection, then the active editor, then files the user names and results requested
through explicit tools. Broader sources such as open editors, diagnostics, search
results, manifests, or workspace summaries will be added only when relevant and
within configured limits. The provider will receive only the context explicitly
assembled for the active request, never a silent full-repository upload.

Voicomp will show tool activity and sent context sources. Truncation and omission
will be visible. Users will be able to disable sources. Reading context does not
grant permission to mutate it: edits and executable actions will require an exact
preview and approval for that operation.

## Local storage and SecretStorage

There is no current Voicomp storage. **Future requirement:** the standard API key
will be the only required persistent secret and will use VS Code SecretStorage,
which VS Code documents as encrypted and not synchronized across machines. It
cannot protect a compromised user account or Extension Host.

SecretStorage is client-backed, but a workspace extension running remotely can
request a stored value. Voicomp therefore prohibits key setup and retrieval from a
remote Extension Host instead of treating encrypted storage as proof of credential
locality.

Future live session state, ephemeral secrets, and transcripts will remain in
memory and will be cleared on session disposal. Transcript persistence will be
off by default. A future user-requested export will create a user-controlled local
file. Voicomp will not place keys, transcripts, source content, or microphone
audio in Webview persistence, workspace settings, logs, telemetry, or packaged
artifacts.

## Privacy-protective defaults

**Future requirements:** Privacy-protective defaults will be:

- no telemetry;
- no automatic repository upload or cloud indexing;
- no default transcript persistence or remote memory;
- no source-code, transcript, credential, or audio payload logging;
- bounded, filtered context rather than broad collection;
- broad reads and all mutations disabled in untrusted workspaces;
- terminal features disabled and no unrestricted shell tool; and
- no mutation, command, publication, or other risky action without explicit,
  operation-specific approval.

Any future telemetry proposal requires a separately approved scope, must be
opt-in, and must exclude source code, prompts, file content, credentials,
transcripts, and microphone audio.

## Logging

**Future Phase 1 requirement:** The local Voicomp Output Channel may contain only
allowlisted operational metadata such as lifecycle state, safe event category,
duration, bounded counts, and generated correlation identifiers. Sanitization
must occur before formatting or transport.

Logs must not contain API keys, ephemeral secrets, authorization headers,
environment values, prompts, transcripts, selections, source files, file content,
raw message or provider payloads, microphone audio, assistant audio, or paths when
they can be avoided. Errors will be actionable but sanitized. Any future
diagnostic export will be opt-in, previewed, sanitized, and local unless the user
deliberately sends it.

## User controls and deletion

**Future requirements:** Users will be able to stop, mute, and interrupt a live
session; inspect and disable context sources; clear session context and local
conversation history; clear the stored API key; and choose whether to export a
transcript. Clearing the key will delete it from SecretStorage and terminate
sessions that depend on it. Stopping or clearing a session will dispose of
transient credentials, media, provider transport, and in-memory state.

Users must delete files they intentionally exported. Local clearing cannot erase
data already processed by an external service; that service's controls apply.
Before uninstalling, users should use Voicomp's future clear-key and clear-history
commands.

## Sensitive exclusions

**Future requirement:** Sensitive defaults will block or require a deliberate,
narrowly scoped action for environment files, credential and token stores,
private keys and certificates, SSH material, cloud-provider configuration,
password databases, editor secret settings, and Git internals. Examples include
`.env` variants, `.ssh`, `.aws`, `.azure`, and `.git`. Binary, oversized,
out-of-workspace, traversal, unsupported-scheme, and symlink-escape targets will
also be denied or reported unavailable.

User exclusions, ignore files, type rules, and size limits will reduce exposure,
but an ignored file is not automatically safe. Sensitive discovery must not
reveal content. Untrusted workspaces will disable broad or sensitive reads.

## Hosted-backend distinction

Voicomp has no hosted backend, account system, subscription service, cloud
repository index, or remote memory, and none is part of the first functional MVP.
The planned BYOK flow uses the user's OpenAI account and the Extension Host trust
boundary; OpenAI remains a separate provider. A future Voicomp hosted service
would require an updated build plan, threat model, privacy disclosure, legal
review, and explicit authorization.

## Workspace, Cursor, and remote assumptions

VS Code stable is the primary target. Cursor's VS Code-based extension support is
useful migration context, not proof that Voicomp works there. Cursor remains a
tested target: supported versions and privacy-relevant differences must come from
recorded installation, microphone, SecretStorage, Webview, network, and workspace
tool tests. Voicomp will not use private Cursor APIs.

**Future remote-workspace requirement:** The Webview, Extension Host, and
workspace may run on different machines and must not be assumed to share a
filesystem, operating system, environment, or loopback network. Workspace access
will use `vscode.Uri` and capability-aware VS Code APIs. Context stored on a
remote workspace can leave that environment only through the same visible,
filtered, bounded provider flow. Unsupported schemes will fail visibly.

The single extension remains workspace-capable so offline and supported read-only
workspace features can run with the workspace. However, while
`vscode.env.remoteName` is defined, Voicomp blocks standard-key setup and
retrieval, client-secret minting, and live provider sessions; the standard key is
not transferred into the remote Extension Host. Local-process, Git, and terminal
features may be reported unavailable. VS Code for the Web/Codespaces configurations
without a supported local Node Extension Host have no live BYOK mode. Supporting
live voice across a future local credential broker and remote workspace helper
requires a separate ADR, security and privacy review, tests, and authorization.

## Human and legal review

This engineering record is not legal advice or a final consumer privacy notice.
Before enabling a live provider or publishing Voicomp, a human reviewer must
confirm the implemented data flow, OpenAI processing and retention terms,
microphone permissions, SecretStorage behavior, remote and Cursor behavior,
deletion wording, applicable legal requirements, and Marketplace disclosures.
The MIT license does not resolve data-protection obligations. External behavior
and links must be rechecked in the relevant implementation or release phase.

## Sources

Internal sources: [build plan](./BUILD_PLAN.md),
[product specification](./PRODUCT_SPEC.md), [architecture](./ARCHITECTURE.md),
and [security model](./SECURITY.md).

Official sources checked 2026-07-12:

- [OpenAI Realtime API with WebRTC](https://developers.openai.com/api/docs/guides/realtime-webrtc)
  — browser WebRTC, standard-key server boundary, and ephemeral credential flow.
- [VS Code common extension capabilities](https://code.visualstudio.com/api/extension-capabilities/common-capabilities)
  — `ExtensionContext.secrets` encryption and synchronization behavior.
- [VS Code Webview API](https://code.visualstudio.com/api/extension-guides/webview)
  — Webview isolation, message passing, security, and persistence.
- [VS Code remote extension guidance](https://code.visualstudio.com/api/advanced-topics/remote-extensions)
  — remote runtime separation, SecretStorage, and Webview messaging.
- [VS Code Extension Host](https://code.visualstudio.com/api/advanced-topics/extension-host)
  — local and remote host placement and `extensionKind` behavior.
- [VS Code API reference](https://code.visualstudio.com/api/references/vscode-api)
  — `vscode.env.remoteName`, SecretStorage, and remote-capable `workspace.fs`.
- [Cursor migration from VS Code](https://docs.cursor.com/get-started/migrate-from-vs-code)
  — VS Code-based migration, extension import, and version differences.
