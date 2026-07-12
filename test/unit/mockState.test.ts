import { describe, expect, it } from 'vitest';

import { initialMockState } from '../../src/shared/mockState.js';

describe('initialMockState', () => {
  it('contains only the disconnected mock connection and one packaged assistant entry', () => {
    expect(initialMockState).toEqual({
      connection: 'mock_disconnected',
      transcript: [
        {
          role: 'assistant',
          text: 'Voicomp is ready in offline mock mode.',
        },
      ],
    });
  });

  it('is immutable at every nested level', () => {
    expect(Object.isFrozen(initialMockState)).toBe(true);
    expect(Object.isFrozen(initialMockState.transcript)).toBe(true);
    expect(Object.isFrozen(initialMockState.transcript[0])).toBe(true);
  });
});
