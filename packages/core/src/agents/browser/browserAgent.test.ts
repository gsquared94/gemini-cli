/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserAgent } from './browserAgent.js';
import { browserTools } from './browserTools.js';
import { browserManager } from './browserManager.js';

// Mock BrowserManager and BrowserTools
vi.mock('./browserManager.js', () => ({
  browserManager: {
    getPage: vi.fn(),
  },
}));

vi.mock('./browserTools.js', () => ({
  browserTools: {
    navigate: vi.fn(),
  },
}));

describe('BrowserAgent', () => {
  let browserAgent: BrowserAgent;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockClient: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockPage: any;

  beforeEach(() => {
    // Mock GeminiClient
    mockClient = {
      generateContent: vi.fn(),
    };

    browserAgent = new BrowserAgent(mockClient);

    mockPage = {
      screenshot: vi.fn().mockResolvedValue(Buffer.from('fake-screenshot')),
      accessibility: {
        snapshot: vi.fn().mockResolvedValue({ name: 'Root' }),
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (browserManager.getPage as any).mockResolvedValue(mockPage);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should execute a simple task', async () => {
    // Mock model response: Call 'navigate' tool
    mockClient.generateContent
      .mockResolvedValueOnce({
        candidates: [
          {
            content: {
              parts: [
                {
                  functionCall: {
                    name: 'navigate',
                    args: { url: 'https://example.com' },
                  },
                },
              ],
            },
          },
        ],
      })
      .mockResolvedValueOnce({
        candidates: [
          {
            content: {
              parts: [{ text: 'Done' }],
            },
          },
        ],
      });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (browserTools.navigate as any).mockResolvedValue({ output: 'Navigated' });

    await browserAgent.runTask('Go to example.com');

    expect(browserTools.navigate).toHaveBeenCalledWith('https://example.com');
  });
});
