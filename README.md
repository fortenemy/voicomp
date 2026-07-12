# Voicomp

Voicomp is a VS Code extension, with Cursor compatibility as an explicit test
target, that is being built as a secure real-time voice companion for software
projects.

## Current status

Phase 0 repository initialization and architectural decision records are
complete. Phase 1 is the next implementation phase and has not started. No
OpenAI connection, microphone capture, workspace tools, file edits, or terminal
actions are implemented yet.

The first implementation milestone will provide an offline, installable VSIX
with an Activity Bar container, a secure sidebar Webview, typed message passing,
mock connection state, and automated build and test tooling.

## Development workflow

Read `AGENTS.md` and `docs/BUILD_PLAN.md` before making changes. Work on the
next unchecked task only, verify its acceptance criteria, then update the
checkbox, `docs/IMPLEMENTATION_LOG.md`, and `MEMORY.md` at the required
boundary.

## Security and privacy

Voicomp will never bundle a publisher-owned OpenAI API key. Mutating actions
will require explicit approval. The initial release has no telemetry and does
not upload a repository automatically.

See `docs/SECURITY.md` and `docs/PRIVACY.md` for the evolving documented model.

## Repository

https://github.com/fortenemy/voicomp

## License

MIT. See `LICENSE`.
