/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ContentGenerator } from '../../core/contentGenerator.js';
import { browserTools } from './browserTools.js';
import { browserManager } from './browserManager.js';
import type { Content, Part } from '@google/genai';

// Tool Definitions for Computer Use
const tools = [
  {
    computerUse: {
      environment: 'ENVIRONMENT_BROWSER',
    },
  },
];

export class BrowserAgent {
  constructor(private generator: ContentGenerator) {}

  async runTask(prompt: string) {
    const model = 'gemini-2.5-computer-use-preview-10-2025'; // Fixed model for now
    let currentPrompt: string | Part[] = prompt;

    const contents: Content[] = [];

    for (let i = 0; i < 20; i++) {
      // Capture State
      let screenshotBase64 = '';
      let domSnapshot = '';
      try {
        const page = await browserManager.getPage();
        const buffer = await page.screenshot();
        screenshotBase64 = buffer.toString('base64');
        const snapshot = await page.accessibility.snapshot();
        if (snapshot) {
          domSnapshot = JSON.stringify(snapshot, null, 2).slice(0, 10000);
        }
      } catch (_e) {
        // Browser might not be ready
      }

      const newContent: Content = { role: 'user', parts: [] };

      if (typeof currentPrompt === 'string') {
        newContent.parts.push({ text: currentPrompt });
      } else {
        // It's an array of parts (likely function responses)
        newContent.parts.push(...currentPrompt);
      }

      // Add Visual Grounding
      const isFunctionResponse =
        Array.isArray(currentPrompt) &&
        currentPrompt.length > 0 &&
        'functionResponse' in currentPrompt[0];

      if (!isFunctionResponse) {
        if (domSnapshot) {
          newContent.parts.push({
            text: `Current Accessibility Tree:
${domSnapshot}`,
          });
        }
        if (screenshotBase64) {
          newContent.parts.push({
            inlineData: {
              mimeType: 'image/png',
              data: screenshotBase64,
            },
          });
        }
      }

      contents.push(newContent);

      // Call Model
      const result = await this.generator.generateContent(
        {
          model,
          contents,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          tools: tools as any,
        },
        'browser-agent-session',
      );

      const response = result.candidates?.[0]?.content;
      if (!response) break;

      contents.push(response); // Add model response to history

      const parts = response.parts || [];
      const functionCalls = parts.filter((p) => 'functionCall' in p);

      if (functionCalls.length === 0) {
        return parts.map((p) => p.text).join(''); // Finished
      }

      // Execute Tools
      const functionResponses: Part[] = [];
      for (const part of functionCalls) {
        const call = part.functionCall!;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let funcResult: any = {};

        try {
          switch (call.name) {
            case 'navigate':
              funcResult = await browserTools.navigate(
                call.args!['url'] as string,
              );
              break;
            case 'click_at':
              funcResult = await browserTools.clickAt(
                call.args!['x'] as number,
                call.args!['y'] as number,
              );
              break;
            case 'type_text_at':
              funcResult = await browserTools.typeTextAt(
                call.args!['x'] as number,
                call.args!['y'] as number,
                call.args!['text'] as string,
              );
              break;
            case 'scroll_document':
              funcResult = await browserTools.scrollDocument(
                call.args!['direction'] as 'up' | 'down',
                call.args!['amount'] as number,
              );
              break;
            default:
              funcResult = { error: `Unknown tool: ${call.name}` };
          }
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          funcResult = { error: message };
        }

        // Capture state AFTER execution
        let newScreenshot = '';
        let newDom = '';
        try {
          const page = await browserManager.getPage();
          const buffer = await page.screenshot();
          newScreenshot = buffer.toString('base64');
          const snapshot = await page.accessibility.snapshot();
          if (snapshot) {
            newDom = JSON.stringify(snapshot, null, 2).slice(0, 10000);
          }
        } catch (_e) {
          // ignore
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const responsePart: any = {
          functionResponse: {
            name: call.name,
            response: funcResult,
            parts: [],
          },
        };

        if (newScreenshot) {
          responsePart.functionResponse.parts.push({
            inlineData: { mimeType: 'image/png', data: newScreenshot },
          });
        }
        if (newDom) {
          responsePart.functionResponse.parts.push({
            text: `current_accessibility_tree:
${newDom}`,
          });
        }

        functionResponses.push(responsePart);
      }

      currentPrompt = functionResponses;
    }
  }
}
