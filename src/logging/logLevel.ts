export type LogLevel = 'off' | 'error' | 'info';

export function parseLogLevel(candidate: unknown): LogLevel {
  if (candidate === 'off' || candidate === 'error' || candidate === 'info') {
    return candidate;
  }

  return 'info';
}
