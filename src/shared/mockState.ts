const packagedAssistantEntry = Object.freeze({
  role: 'assistant' as const,
  text: 'Voicomp is ready in offline mock mode.',
});

export const initialMockState = Object.freeze({
  connection: 'mock_disconnected' as const,
  transcript: Object.freeze([packagedAssistantEntry] as const),
});

export type InitialMockState = typeof initialMockState;
