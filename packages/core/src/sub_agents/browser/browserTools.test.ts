/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserTools } from './browserTools.js';
import { browserManager } from './browserManager.js';

// Mock BrowserManager
vi.mock('./browserManager.js', () => ({
  browserManager: {
    getPage: vi.fn(),
  },
}));

describe('BrowserTools', () => {
  let browserTools: BrowserTools;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockPage: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockMouse: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockKeyboard: any;

  beforeEach(() => {
    browserTools = new BrowserTools();

    mockMouse = {
      click: vi.fn(),
      wheel: vi.fn(),
    };
    mockKeyboard = {
      type: vi.fn(),
      press: vi.fn(),
    };
    mockPage = {
      goto: vi.fn(),
      url: vi.fn().mockReturnValue('https://example.com'),
      viewportSize: vi.fn().mockReturnValue({ width: 1000, height: 1000 }),
      mouse: mockMouse,
      keyboard: mockKeyboard,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (browserManager.getPage as any).mockResolvedValue(mockPage);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('navigate should go to the specified URL', async () => {
    const result = await browserTools.navigate('https://google.com');

    expect(mockPage.goto).toHaveBeenCalledWith('https://google.com');
    expect(result).toEqual({
      output: 'Navigated to https://google.com',
      url: 'https://example.com',
    });
  });

  it('click_at should click at scaled coordinates', async () => {
    // x=500 (50%), y=500 (50%) of 1000x1000 viewport -> 500, 500
    const result = await browserTools.clickAt(500, 500);

    expect(mockMouse.click).toHaveBeenCalledWith(500, 500);
    expect(result).toEqual({ output: 'Clicked', url: 'https://example.com' });
  });

  it('type_text_at should click and type', async () => {
    const result = await browserTools.typeTextAt(500, 500, 'hello', true);

    expect(mockMouse.click).toHaveBeenCalledWith(500, 500);
    expect(mockKeyboard.type).toHaveBeenCalledWith('hello');
    expect(mockKeyboard.press).toHaveBeenCalledWith('Enter');
    expect(result).toEqual({
      output: 'Typed "hello"',
      url: 'https://example.com',
    });
  });

  it('scroll_document should scroll the page', async () => {
    await browserTools.scrollDocument('down', 100);
    expect(mockMouse.wheel).toHaveBeenCalledWith(0, 100);

    await browserTools.scrollDocument('up', 100);
    expect(mockMouse.wheel).toHaveBeenCalledWith(0, -100);
  });
});
