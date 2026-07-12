export const apiKeyPlaceholderMessage =
  'OpenAI API key setup is not available yet. Secure BYOK setup begins in Phase 3.';

export type InformationMessagePresenter = (message: string) => unknown;

export function createSetApiKeyPlaceholderCommand(
  showInformationMessage: InformationMessagePresenter,
): () => unknown {
  return () => showInformationMessage(apiKeyPlaceholderMessage);
}
