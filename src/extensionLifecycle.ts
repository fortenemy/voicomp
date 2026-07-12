import type { Disposable } from 'vscode';

import type { OutputLogger } from './logging/OutputLogger.js';

export type ResourceFactory = () => Disposable;

export function createExtensionLifecycle(
  outputLogger: OutputLogger,
  registerCommandResources: ResourceFactory,
  createViewResources: ResourceFactory,
): Disposable {
  let commandResources: Disposable | undefined;
  let viewResources: Disposable | undefined;

  try {
    commandResources = registerCommandResources();
    viewResources = createViewResources();
    outputLogger.lifecycle('extension.activated');
  } catch (error) {
    disposeForRollback(viewResources, commandResources, outputLogger);
    throw error;
  }

  let disposed = false;
  return {
    dispose: () => {
      if (disposed) {
        return;
      }

      disposed = true;
      disposeAll(
        { dispose: () => outputLogger.lifecycle('extension.deactivated') },
        viewResources,
        commandResources,
        outputLogger,
      );
    },
  };
}

function disposeForRollback(...resources: Array<Disposable | undefined>): void {
  try {
    disposeAll(...resources);
  } catch {
    // Preserve the acquisition failure that triggered rollback.
  }
}

function disposeAll(...resources: Array<Disposable | undefined>): void {
  let firstError: unknown;

  for (const resource of resources) {
    try {
      resource?.dispose();
    } catch (error) {
      firstError ??= error;
    }
  }

  if (firstError) {
    throw firstError;
  }
}
