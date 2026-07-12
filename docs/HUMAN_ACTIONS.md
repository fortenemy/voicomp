# Voicomp Human Actions

This register contains only decisions or actions that require the repository
owner or another authorized human. Secrets must never be committed to this
repository, pasted into documentation, or included in logs. Credentials and
access tokens must use an approved secret store or the target platform's secret
mechanism.

## Recorded owner decision

- The repository owner selected the MIT License. The committed `LICENSE` file
  records that decision; no license-selection action remains open.
- For local Phase 1 metadata, `fortenemy` is the non-reserving publisher
  placeholder and `voicomp` is the selected package name, producing the local
  target ID `fortenemy.voicomp`. HTTP `404` observations on both target registry
  pages on 2026-07-12 do not prove ownership or reserve that ID.

## Open actions

### Publisher identity, accounts, and credentials

- [ ] Register or select the final VS Code Marketplace publisher account; the
  local `fortenemy` placeholder is not evidence of registration.
- [ ] Choose and approve the immutable registered Marketplace publisher ID
  carefully, replacing the local placeholder if the approved ID differs, before
  final release metadata is written.
- [ ] Recheck the complete final extension ID on the VS Code Marketplace and
  Open VSX immediately before publication; availability observed during Phase 0
  is not a reservation.
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
