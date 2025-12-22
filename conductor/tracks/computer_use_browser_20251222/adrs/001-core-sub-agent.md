# ADR 001: Core Sub-agent vs. Extension for Browser Control

## Status

Accepted

## Context

We need to integrate a "Computer Use" model to control a browser. The prototype
was built as a standalone MCP extension. We need to decide whether to
productionize it as an extension or integrate it into the `packages/core` as a
sub-agent.

## Decision

We will integrate the browser control logic as a **Core Sub-agent** within
`packages/core`.

## Rationale

1.  **User Experience:** A sub-agent offers a seamless experience. Users can
    simply ask "browse the web" without needing to install, build, and link a
    separate extension.
2.  **Authentication:** The sub-agent can reuse the existing authenticated
    `GeminiClient` or `ContentGenerator` infrastructure, avoiding the need for
    separate API key management.
3.  **Integration:** Deep integration allows the sub-agent to access other core
    services (telemetry, logging, file system) more easily.
4.  **Distribution:** It becomes a built-in "superpower" of the CLI rather than
    an optional plugin.

## Implementation Details & Mitigations

### 1. Model Selection

**Challenge:** The sub-agent requires `gemini-2.5-computer-use`, which differs
from the main agent's model. **Solution:** The sub-agent will instantiate a
dedicated `ContentGenerator` or use `GeminiClient` with a specific model
override. The `packages/core` architecture supports `generateContent` with a
specific `model` parameter.

### 2. User Confirmation

**Challenge:** Browser actions (e.g., "click buy", "post tweet") are high-risk
and require user confirmation. **Solution:**

- We will implement a `ask_user_confirmation` tool or hook that the sub-agent
  can use.
- The sub-agent loop will pause execution when the model invokes this tool,
  waiting for the user's "Y/N" input via the CLI standard input.
- We can also enforce a "headed" mode initially where the user can see the
  browser actions in real-time.

### 3. Architecture

- **Path:** `packages/core/src/sub_agents/browser/`
- **Components:**
  - `BrowserManager`: Wraps Playwright (headless/headed).
  - `BrowserAgent`: Manages the agent loop, state capture (screenshot/DOM), and
    model interaction.
  - `BrowserTools`: Defines the tools (`navigate`, `click`, etc.) exposed to the
    model.

## Consequences

- **Dependency:** Adds `playwright` as a dependency to `packages/core`.
- **Complexity:** Adds a new "agent loop" pattern within the core, distinct from
  the main chat loop.
