# Voicomp Human Actions

This register contains only decisions or actions that require the repository
owner or another authorized human. Secrets must never be committed to this
repository, pasted into documentation, or included in logs. Credentials and
access tokens must use an approved secret store or the target platform's secret
mechanism.

## Recorded owner decision

- The repository owner selected the MIT License. The committed `LICENSE` file
  records that decision; no license-selection action remains open.

## Open actions

### Publisher identity, accounts, and credentials

- [ ] Register or select the VS Code Marketplace publisher account.
- [ ] Choose the immutable Marketplace publisher ID carefully and approve its
  use before it is written into release metadata.
- [ ] Create or select the required Microsoft account and approve the publishing
  authentication method and credentials.
- [ ] Create or select the Open VSX account and link the correct GitHub identity.
- [ ] Sign the Open VSX Publisher Agreement.
- [ ] Generate an Open VSX access token and store it only in an approved secret
  mechanism.

### Publication approvals

- [ ] Approve the final VS Code Marketplace publication after reviewing the
  tested release artifact and listing.
- [ ] Approve the final Open VSX publication after reviewing the tested release
  artifact and listing.

### Manual platform and hardware validation

- [ ] Complete required manual release-candidate testing in VS Code and Cursor,
  including installation in clean profiles.
- [ ] Complete required manual testing on macOS and Linux.
- [ ] Complete real microphone permission, capture, playback, mute, interrupt,
  and cleanup testing on supported platforms.

### Final legal and privacy approval

- [ ] Review and approve the final license notices, Marketplace terms, privacy
  disclosure, data-flow claims, and release-facing legal text.
