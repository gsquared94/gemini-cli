/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { browserManager } from './browserManager.js';

export interface ToolResult {
  output?: string;
  error?: string;
  url?: string;
}

export class BrowserTools {
  async navigate(url: string): Promise<ToolResult> {
    const page = await browserManager.getPage();
    await page.goto(url);
    return { output: `Navigated to ${url}`, url: page.url() };
  }

  async clickAt(x: number, y: number): Promise<ToolResult> {
    const page = await browserManager.getPage();
    const viewport = page.viewportSize();
    if (viewport) {
      const actualX = (x / 1000) * viewport.width;
      const actualY = (y / 1000) * viewport.height;
      await page.mouse.click(actualX, actualY);
      return { output: 'Clicked', url: page.url() };
    }
    return { error: 'Viewport not available', url: page.url() };
  }

  async typeTextAt(
    x: number,
    y: number,
    text: string,
    pressEnter: boolean = false,
  ): Promise<ToolResult> {
    const page = await browserManager.getPage();
    const viewport = page.viewportSize();
    if (viewport) {
      const actualX = (x / 1000) * viewport.width;
      const actualY = (y / 1000) * viewport.height;
      await page.mouse.click(actualX, actualY);
      await page.keyboard.type(text);
      if (pressEnter) {
        await page.keyboard.press('Enter');
      }
      return { output: `Typed "${text}"`, url: page.url() };
    }
    return { error: 'Viewport not available', url: page.url() };
  }

  async scrollDocument(
    direction: 'up' | 'down',
    amount: number = 500,
  ): Promise<ToolResult> {
    const page = await browserManager.getPage();
    const delta = direction === 'down' ? amount : -amount;
    await page.mouse.wheel(0, delta);
    return { output: 'Scrolled', url: page.url() };
  }

  async keyCombination(keys: string): Promise<ToolResult> {
    const page = await browserManager.getPage();
    await page.keyboard.press(keys);
    return { output: `Pressed ${keys}`, url: page.url() };
  }
}

export const browserTools = new BrowserTools();
