# Voicomp Platform Decisions

## Status

Accepted for Phase 0 planning. These decisions constrain later implementation but
do not authorize Phase 1 code, OpenAI integration, credential use, packaging, or
publication. Time-sensitive external facts must be rechecked at the triggers below.

## Verified date

2026-07-12

## Decisions

### Development runtime

- Use Node.js 24 LTS as the development line.
- The official `latest-v24.x` release observed during this verification is
  `v24.18.0`, released on 2026-06-23, and is the current Node.js 24 LTS patch.
- The local runtime is `v24.9.0`. It is on the selected major line, but it must be
  updated to the then-current Node.js 24 LTS patch before Phase 1 generates the
  dependency lockfile.

### VS Code compatibility floor

- Set `engines.vscode` to `^1.95.0` in the Phase 1 extension manifest.
- This is a conservative minimum for the stable manifest, command, sidebar
  Webview, message-passing, Content Security Policy, Output Channel, settings,
  and official Extension Host test APIs planned for Phase 1. It is a project
  support target, not a claim that every future feature has already been tested
  on VS Code 1.95.
- Pin `@types/vscode` to `1.95.x` in Phase 1. Do not use a range that admits newer
  minor API declarations, because compiling against newer declarations could
  accidentally introduce an API unavailable at the declared engine floor.

### Remote workspace placement and BYOK

- Keep the single extension workspace-capable and declare
  `"extensionKind": ["workspace"]` in the Phase 1 manifest. This lets VS Code run
  it with the workspace and route supported workspace operations through stable
  APIs.
- When `vscode.env.remoteName` is defined, Voicomp must reject API-key setup,
  standard-key retrieval, Realtime client-secret minting, and live provider
  sessions with an explicit unsupported-state message. Clearing an existing
  SecretStorage entry may remain available because it does not retrieve the
  value.
- Offline and read-only remote features may use explicit `vscode.Uri` values,
  `vscode.workspace.fs`, and capability-aware adapters. Local-process, Git, and
  terminal capabilities must report unavailable when the active host cannot
  provide them safely.
- A future local credential/UI broker plus remote workspace helper is a separate
  architecture requiring a new ADR, threat and privacy review, tests, and human
  authorization. It is not part of the current MVP.

### Future OpenAI Realtime transport

- Phase 1 remains offline and contains no OpenAI dependency, network request,
  credential collection, microphone capture, or live audio.
- In Phase 3, the Extension Host will use the standard BYOK API key to call
  `POST /v1/realtime/client_secrets` with bounded session configuration.
- Only the returned short-lived ephemeral client secret and validated session
  settings may cross to the Webview. The standard API key never enters Webview
  code or state.
- The Webview will establish the browser voice session with WebRTC.
- Prefer the official `@openai/agents/realtime` transport, including the browser
  default or `OpenAIRealtimeWebRTC`, behind Voicomp's provider abstraction. Raw
  WebRTC remains a fallback only if implementation-phase evidence shows that the
  SDK cannot satisfy the security, lifecycle, packaging, or control requirements.
- Model and voice remain validated user-configurable settings. Their defaults
  and supported values will be selected from current provider evidence in Phase 3.

### Cursor compatibility

- The local Cursor CLI version observed on 2026-07-12 is `3.10.20`.
- Cursor is a compatibility test target, not a guaranteed supported environment.
  Compatibility remains unverified until the packaged VSIX passes the required
  manual smoke tests in Cursor.
- Voicomp will use stable documented VS Code Extension APIs and no private Cursor
  APIs. Cursor's VS Code lineage and extension migration support are context, not
  proof that a Voicomp feature works.

### Local identifiers and registry availability

- Use `fortenemy` as the local publisher placeholder.
- Use `voicomp` as the package name.
- The resulting local target extension ID is `fortenemy.voicomp`.
- On 2026-07-12, the direct VS Code Marketplace page for
  `fortenemy.voicomp` returned HTTP `404`, and the Open VSX API endpoint returned
  HTTP `404` with `Extension not found: fortenemy.voicomp`.
- Those observations support the current package-identifier choice, but they do
  not reserve the name, prove publisher ownership, or approve publication. Final
  publisher registration, immutable publisher-ID approval, and an immediate
  pre-publication availability recheck remain human-controlled.

### License

- Use the MIT License already present in `LICENSE`.
- The remote initial commit `0fb01b72e031d8c0e34607770bc717c475945ccb`
  contains only that MIT license, and the repository owner has selected it. The
  earlier need for a licensing placeholder is therefore resolved by recorded
  human confirmation rather than left as an unresolved marker.

## Evidence

| Decision | Evidence verified on 2026-07-12 |
| --- | --- |
| Node.js development line | The official releases page marks Node.js 24 (`Krypton`) as LTS and the official `latest-v24.x` release observed for this decision is `v24.18.0`; `node --version` returned `v24.9.0`. |
| VS Code engine and type floor | The official manifest requires a non-wildcard `engines.vscode` compatibility declaration; the Webview and testing guides document the stable Phase 1 surface. `code --version` returned `1.127.0`, which verifies the local test environment but does not change the `^1.95.0` support floor. |
| Remote workspace and BYOK | The official Extension Host guide distinguishes local and remote hosts and documents `extensionKind`; the remote-extension guide documents workspace-host placement, while the API reference documents `vscode.env.remoteName`, `SecretStorage`, and remote-capable `workspace.fs`. The fail-closed BYOK restriction prevents the standard key from entering a remote Extension Host. |
| Realtime connection and SDK preference | The OpenAI WebRTC guide documents browser WebRTC and `POST /v1/realtime/client_secrets`; the Agents SDK guides document ephemeral client tokens, `@openai/agents/realtime`, and WebRTC as the default browser transport. ADR 0002 records the project boundary. |
| Cursor assumption | `cursor --version` returned `3.10.20`; Cursor's migration guide describes its VS Code base while noting version differences. No VSIX exists yet, so compatibility is intentionally unverified. |
| Package identifier availability | A direct request to the VS Code Marketplace target page returned HTTP `404`; a direct request to the Open VSX API returned HTTP `404` and `Extension not found: fortenemy.voicomp`. |
| License | `git ls-tree --name-only 0fb01b7` returned only `LICENSE`, and `git show 0fb01b7:LICENSE` returned the MIT License now present at the repository root. `docs/HUMAN_ACTIONS.md` records the owner's selection. |

The product, architecture, security, privacy, and trust-boundary evidence is
recorded in [the product specification](./PRODUCT_SPEC.md),
[the architecture](./ARCHITECTURE.md), [the security model](./SECURITY.md),
[the privacy record](./PRIVACY.md), and [ADR 0002](./adr/0002-openai-realtime-transport.md).

## Recheck triggers

- Before Phase 1 installs dependencies or generates `package-lock.json`, recheck
  the current Node.js 24 LTS patch and update the local runtime.
- When Phase 1 creates `package.json`, verify `engines.vscode` is `^1.95.0` and
  `@types/vscode` is pinned to `1.95.x`, and declare
  `"extensionKind": ["workspace"]`; run the official Extension Host tests against
  the declared floor as well as the normal supported test target.
- Before Phase 3 implementation, recheck the Realtime client-secret endpoint,
  Agents SDK package and transport behavior, ephemeral-secret semantics, current
  supported models and voices, and browser Content Security Policy requirements.
- When the first VSIX exists and again for the release candidate, run and record
  Cursor installation and feature smoke tests against the exact observed version.
- Before writing final release metadata or publishing to either registry, register
  and approve the final publisher, then recheck the complete extension ID on the
  VS Code Marketplace and Open VSX. Treat another HTTP `404` only as a point-in-time
  availability observation, never as a reservation.
- Before release, recheck package license metadata and complete the open human
  legal, privacy, terms, credential, and publication approvals.

## Sources

Official sources checked 2026-07-12:

- [Node.js releases](https://nodejs.org/en/about/previous-releases)
- [Node.js v24.18.0 LTS release](https://nodejs.org/en/blog/release/v24.18.0)
- [VS Code extension manifest](https://code.visualstudio.com/api/references/extension-manifest)
- [VS Code Extension Host](https://code.visualstudio.com/api/advanced-topics/extension-host)
- [VS Code remote extensions](https://code.visualstudio.com/api/advanced-topics/remote-extensions)
- [VS Code API reference](https://code.visualstudio.com/api/references/vscode-api)
- [VS Code Webview API](https://code.visualstudio.com/api/extension-guides/webview)
- [VS Code testing extensions](https://code.visualstudio.com/api/working-with-extensions/testing-extension)
- [OpenAI Realtime API with WebRTC](https://developers.openai.com/api/docs/guides/realtime-webrtc)
- [OpenAI Agents SDK voice quickstart](https://openai.github.io/openai-agents-js/guides/voice-agents/quickstart/)
- [OpenAI Agents SDK Realtime transport](https://openai.github.io/openai-agents-js/guides/voice-agents/transport/)
- [Cursor migration from VS Code](https://docs.cursor.com/get-started/migrate-from-vs-code)
- [VS Code Marketplace target page](https://marketplace.visualstudio.com/items?itemName=fortenemy.voicomp)
- [Open VSX target API endpoint](https://open-vsx.org/api/fortenemy/voicomp)
