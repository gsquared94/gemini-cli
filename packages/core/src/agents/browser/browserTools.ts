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
  private async showOverlay(page: any, message: string): Promise<void> {
    await page.evaluate((msg: string) => {
      let overlay = document.getElementById('gemini-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'gemini-overlay';
        overlay.style.position = 'fixed';
        overlay.style.bottom = '50px';
        overlay.style.left = '50%';
        overlay.style.transform = 'translateX(-50%)';
        overlay.style.background = 'rgba(32, 33, 36, 0.9)';
        overlay.style.color = 'white';
        overlay.style.padding = '12px 24px';
        overlay.style.zIndex = '2147483647';
        overlay.style.borderRadius = '24px';
        overlay.style.fontSize = '16px';
        overlay.style.fontFamily = 'Google Sans, Roboto, sans-serif';
        overlay.style.fontWeight = '500';
        overlay.style.pointerEvents = 'none';
        overlay.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        overlay.style.transition = 'opacity 0.3s ease-in-out';
        document.body.appendChild(overlay);
      }
      overlay.innerText = msg;
    }, message);
  }

  async updateBorderOverlay(options: { active: boolean; capturing: boolean }): Promise<void> {
    try {
      const page = await browserManager.getPage();
      await page.evaluate(({ active, capturing }) => {
        // 1. Inject CSS if not present
        if (!document.getElementById('gemini-border-style')) {
          const style = document.createElement('style');
          style.id = 'gemini-border-style';
          style.textContent = `
            :root {
              --color-agy-blue: rgb(0, 102, 255);
              --color-agy-blue-glow: rgba(0, 102, 255, 0.9);
            }
            #preact-border-container {
              pointer-events: none;
              z-index: 2147483647;
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              border: 2px solid var(--color-agy-blue);
              box-shadow: inset 0 0 10px 0px var(--color-agy-blue-glow);
              opacity: 1;
              transition: opacity 300ms ease-in-out;
              box-sizing: border-box;
            }
            #preact-border-container.hidden {
              opacity: 0;
            }
            @keyframes breathe {
              0%, 100% {
                box-shadow: inset 0 0 20px 0px var(--color-agy-blue-glow);
              }
              50% {
                box-shadow: inset 0 0 30px 10px var(--color-agy-blue-glow);
              }
            }
            #preact-border-container.animate-breathing {
              animation: breathe 3s ease-in-out infinite;
            }
          `;
          document.head.appendChild(style);
        }

        // 2. Manage Container
        let container = document.getElementById('preact-border-container');
        if (!container) {
          container = document.createElement('div');
          container.id = 'preact-border-container';
          document.body.appendChild(container);
        }

        // 3. Update State
        if (active) {
          container.classList.remove('hidden');
          if (!capturing) {
            container.classList.add('animate-breathing');
          } else {
            container.classList.remove('animate-breathing');
          }
        } else {
          container.classList.add('hidden');
          container.classList.remove('animate-breathing');
        }
      }, options);
    } catch (e) {
      // Ignore errors (e.g. page closed)
    }
  }

  async removeOverlay(): Promise<void> {
    try {
      const page = await browserManager.getPage();
      await page.evaluate(() => {
        const overlay = document.getElementById('gemini-overlay');
        if (overlay) {
          overlay.remove();
        }
      });
    } catch (e) {
      // Ignore errors if page is closed or not available
    }
  }

  async navigate(url: string): Promise<ToolResult> {
    const page = await browserManager.getPage();
    await this.showOverlay(page, `Navigating to ${url}`);
    await page.goto(url);
    return { output: `Navigated to ${url}`, url: page.url() };
  }

  private async getViewportSize(page: any): Promise<{ width: number; height: number } | null> {
    const viewport = page.viewportSize();
    if (viewport) {
      return viewport;
    }
    return page.evaluate(() => ({
      width: window.innerWidth,
      height: window.innerHeight,
    }));
  }

  private async getElementLabel(page: any, x: number, y: number): Promise<string | null> {
    return page.evaluate(({ x, y }: { x: number; y: number }) => {
      const el = document.elementFromPoint(x, y);
      if (!el) return null;
      const text =
        (el as HTMLElement).innerText?.trim() ||
        el.getAttribute('aria-label') ||
        el.getAttribute('placeholder') ||
        el.getAttribute('title') ||
        el.getAttribute('alt');
      if (text) {
        return text.slice(0, 30) + (text.length > 30 ? '...' : '');
      }
      return el.tagName.toLowerCase();
    }, { x, y });
  }

  async clickAt(x: number, y: number): Promise<ToolResult> {
    const page = await browserManager.getPage();
    const viewport = await this.getViewportSize(page);
    if (viewport) {
      const actualX = (x / 1000) * viewport.width;
      const actualY = (y / 1000) * viewport.height;

      const label = await this.getElementLabel(page, actualX, actualY);
      const msg = label ? `Clicking "${label}"` : `Clicking at ${x}, ${y}`;
      await this.showOverlay(page, msg);

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
    clearBeforeTyping: boolean = false,
  ): Promise<ToolResult> {
    const page = await browserManager.getPage();
    const viewport = await this.getViewportSize(page);
    if (viewport) {
      const actualX = (x / 1000) * viewport.width;
      const actualY = (y / 1000) * viewport.height;

      const label = await this.getElementLabel(page, actualX, actualY);
      const msg = label
        ? `Typing "${text}" into ${label}`
        : `Typing "${text}" at ${x}, ${y}`;
      await this.showOverlay(page, msg);

      await page.mouse.click(actualX, actualY);

      if (clearBeforeTyping) {
        // Select all text using keyboard shortcut and delete it
        // Note: 'Control' is commonly used on Linux/Windows. For Mac, 'Meta' might be needed
        // but 'Control' is often safer as a default for browser contexts in some envs.
        // However, Playwright usually handles 'Control' vs 'Meta' if we use 'ControlOrMeta'.
        // But let's stick to 'Control+A' and 'Backspace' for standard clearing behavior.
        await page.keyboard.press('Control+A');
        await page.keyboard.press('Backspace');
      }

      await page.keyboard.type(text);
      if (pressEnter) {
        await page.keyboard.press('Enter');
      }
      return { output: `Typed "${text}"`, url: page.url() };
    }
    return { error: 'Viewport not available', url: page.url() };
  }

  async scrollAt(
    x: number,
    y: number,
    deltaX: number,
    deltaY: number,
  ): Promise<ToolResult> {
    const page = await browserManager.getPage();
    await this.showOverlay(page, `Scrolling at ${x}, ${y}`);
    const viewport = await this.getViewportSize(page);
    if (viewport) {
      const actualX = (x / 1000) * viewport.width;
      const actualY = (y / 1000) * viewport.height;
      await page.mouse.move(actualX, actualY);
      await page.mouse.wheel(deltaX, deltaY);
      return { output: `Scrolled at ${x}, ${y}`, url: page.url() };
    }
    return { error: 'Viewport not available', url: page.url() };
  }

  async scrollDocument(
    direction: 'up' | 'down' | 'left' | 'right',
    amount: number = 500,
  ): Promise<ToolResult> {
    const page = await browserManager.getPage();
    await this.showOverlay(page, `Scrolling ${direction}`);
    let deltaX = 0;
    let deltaY = 0;
    
    if (direction === 'up') deltaY = -amount;
    if (direction === 'down') deltaY = amount;
    if (direction === 'left') deltaX = -amount;
    if (direction === 'right') deltaX = amount;

    await page.mouse.wheel(deltaX, deltaY);
    return { output: `Scrolled ${direction} by ${amount}`, url: page.url() };
  }

  async dragAndDrop(
    x: number,
    y: number,
    destX: number,
    destY: number,
  ): Promise<ToolResult> {
    const page = await browserManager.getPage();
    await this.showOverlay(page, `Dragging from ${x},${y} to ${destX},${destY}`);
    const viewport = await this.getViewportSize(page);
    if (viewport) {
      const actualX = (x / 1000) * viewport.width;
      const actualY = (y / 1000) * viewport.height;
      const actualDestX = (destX / 1000) * viewport.width;
      const actualDestY = (destY / 1000) * viewport.height;

      await page.mouse.move(actualX, actualY);
      await page.mouse.down();
      await page.mouse.move(actualDestX, actualDestY);
      await page.mouse.up();
      
      return { output: `Dragged from ${x},${y} to ${destX},${destY}`, url: page.url() };
    }
    return { error: 'Viewport not available', url: page.url() };
  }

  async pagedown(): Promise<ToolResult> {
    const page = await browserManager.getPage();
    await this.showOverlay(page, 'Pressing PageDown');
    await page.keyboard.press('PageDown');
    return { output: 'Pressed PageDown', url: page.url() };
  }

  async pageup(): Promise<ToolResult> {
    const page = await browserManager.getPage();
    await this.showOverlay(page, 'Pressing PageUp');
    await page.keyboard.press('PageUp');
    return { output: 'Pressed PageUp', url: page.url() };
  }

  async keyCombination(keys: string): Promise<ToolResult> {
    const page = await browserManager.getPage();
    await this.showOverlay(page, `Pressing ${keys}`);
    await page.keyboard.press(keys);
    return { output: `Pressed ${keys}`, url: page.url() };
  }

  async openWebBrowser(): Promise<ToolResult> {
    const page = await browserManager.getPage();
    return { output: 'Browser opened', url: page.url() };
  }
}

export const browserTools = new BrowserTools();
