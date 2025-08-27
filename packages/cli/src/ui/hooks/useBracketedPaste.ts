/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';

const ENABLE_BRACKETED_PASTE = '\x1b[?2004h';
const DISABLE_BRACKETED_PASTE = '\x1b[?2004l';

/**
 * Enables and disables bracketed paste mode in the terminal.
 *
 * This hook ensures that bracketed paste mode is enabled when the component
 * mounts and disabled when it unmounts or when the process exits.
 */
export const useBracketedPaste = () => {
  const cleanup = () => {
    // Vitest can have many workers, so we can't just write to stdout.
    if (process.env['VITEST']) {
      return;
    }
    process.stdout.write(DISABLE_BRACKETED_PASTE);
  };

  useEffect(() => {
    // Vitest can have many workers, so we can't just write to stdout.
    if (process.env['VITEST']) {
      return;
    }
    process.stdout.write(ENABLE_BRACKETED_PASTE);

    process.on('exit', cleanup);
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

    return () => {
      cleanup();
      process.removeListener('exit', cleanup);
      process.removeListener('SIGINT', cleanup);
      process.removeListener('SIGTERM', cleanup);
    };
  }, []);
};
