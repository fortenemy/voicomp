# Voicomp

Voicomp is a VS Code extension, with Cursor compatibility as an explicit test
target, that is being built as a secure real-time voice companion for software
projects.

## Current status

Phase 1 provides an offline extension shell with an Activity Bar container, a
sidebar Webview, typed Extension Host/Webview messages, a mock connection state,
a mock transcript entry, sanitized Output Channel logging, and local build and
test tooling.

This phase does not accept or store an API key, call OpenAI or any other network
service, request microphone access, or read, search, list, or modify workspace
files. `Voicomp: Set OpenAI API Key` is an informational placeholder only. Live
voice, provider integration, and workspace tools belong to later phases.

Live BYOK sessions are also intentionally unavailable in remote extension hosts.
Future live-provider work must fail closed whenever `vscode.env.remoteName` is
defined; supporting a local broker with a remote helper would require a separate
architecture decision and security review.

## Requirements

- Node.js 24 LTS
- VS Code 1.95 or newer

## Install from a local VSIX

After creating the package, install `artifacts/voicomp.vsix` through **Extensions:
Install from VSIX...** in the Command Palette, or run:

```powershell
code --install-extension artifacts/voicomp.vsix
```

The package is a local development artifact. Marketplace and Open VSX
publication are not part of Phase 1.

## Development workflow

Read `AGENTS.md` and `docs/BUILD_PLAN.md` before making changes. Work on the
next unchecked task only, verify its acceptance criteria, then update the
checkbox, `docs/IMPLEMENTATION_LOG.md`, and `MEMORY.md` at the required
boundary.

Install dependencies and run the complete verification commands:

```powershell
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

Additional commands:

```powershell
npm run watch
npm run test:unit
npm run test:integration
npm run package
```

`npm run package` builds the extension through `vscode:prepublish` and writes
`artifacts/voicomp.vsix`.

## Run in VS Code

Open the repository in VS Code and press `F5`. The checked-in launch
configuration runs the build task first and then opens an Extension Development
Host with this workspace as the extension-under-development.

In the Development Host, select Voicomp in the Activity Bar or run `Voicomp:
Open Assistant`. The sidebar operates entirely on offline mock state. To inspect
sanitized lifecycle and message logs, open **View: Toggle Output** and select
**Voicomp** from the Output Channel list.

## Security and privacy

Voicomp will never bundle a publisher-owned OpenAI API key. Mutating actions
will require explicit approval. Phase 1 has no telemetry, external network
traffic, microphone capture, API-key input, or workspace access.

See `docs/SECURITY.md` and `docs/PRIVACY.md` for the evolving documented model.

## Repository

https://github.com/fortenemy/voicomp

## License

MIT. See `LICENSE`.
