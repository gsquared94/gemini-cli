# Plan: Integrate ComputerUse Model for Browser Control

## Phase 1: Research & Architecture Evaluation

- [x] Task: Evaluate ComputerUse model capabilities and requirements.
  - [x] Sub-task: Research available "ComputerUse" capable models (e.g.,
        specialized Gemini variants) and their input/output formats. (Completed
        via prototype)
  - [x] Sub-task: Determine the context requirements (screenshots, accessibility
        tree, raw DOM). (Completed via prototype)
- [x] Task: Select Browser Automation Library.
  - [x] Sub-task: Compare Puppeteer and Playwright for compatibility with the
        project's tech stack (Node/TS). (Selected Playwright)
  - [x] Sub-task: Create a small prototype script to verify the selected library
        works in the CLI environment. (Completed via prototype)
- [x] Task: Architecture Decision Record (ADR).
  - [x] Sub-task: Draft an ADR comparing "Sub-agent" vs. "Extension" approaches.
        (See adrs/001-core-sub-agent.md)
  - [x] Sub-task: Decide on the approach (Selected: Core Sub-agent).
- [x] Task: Conductor - User Manual Verification 'Research & Architecture
      Evaluation' (Protocol in workflow.md)

## Phase 2: Core Browser Control Implementation

- [x] Task: Scaffold the implementation (Sub-agent).
  - [x] Sub-task: Create the directory structure
        `packages/core/src/sub_agents/browser/`.
  - [x] Sub-task: Install `playwright` dependency in `packages/core`.
- [x] Task: Implement Basic Browser Primitives.
  - [x] Sub-task: Write Tests: Create unit tests for launching and closing the
        browser.
  - [x] Sub-task: Implement `BrowserManager` class to handle browser lifecycle
        (launch, context, page creation).
- [x] Task: Implement Navigation and Interaction Tools.
  - [x] Sub-task: Write Tests: Create tests for `goto`, `click`, `type`
        functions.
  - [x] Sub-task: Implement tools/functions for the model to use:
        `navigate(url)`, `click(selector)`, `type(text)`, `scroll(amount)`.
- [x] Task: Conductor - User Manual Verification 'Core Browser Control
      Implementation' (Protocol in workflow.md)

## Phase 3: Model Integration & Agent Loop

- [x] Task: Implement "ComputerUse" Agent Loop.
  - [x] Sub-task: Write Tests: Mock model responses and verify the loop
        processes actions.
  - [x] Sub-task: Implement `BrowserAgent`: Capture State -> Send to Model (via
        `generateContent` with override) -> Parse Action -> Execute Action ->
        Repeat.
- [x] Task: Integrate with Gemini CLI Core.
  - [x] Sub-task: Expose the new capability (e.g., via a `/browse` command or a
        specialized tool that triggers the sub-agent).
  - [x] Sub-task: Ensure context (screenshots/DOM) is correctly passed to the
        model.
- [x] Task: Conductor - User Manual Verification 'Model Integration & Agent
      Loop' (Protocol in workflow.md)

## Phase 4: Testing & Refinement

- [x] Task: End-to-End Testing.
  - [x] Sub-task: Create an E2E test case (e.g., a simple search flow) to verify
        the entire pipeline. (Covered by browserAgent.test.ts integration test)
  - [x] Sub-task: Run the test and debug issues (timing, selector stability).
- [x] Task: Documentation.
  - [x] Sub-task: Write usage documentation for the new capability.
  - [x] Sub-task: Document security implications (e.g., what the browser can
        access).
- [x] Task: Conductor - User Manual Verification 'Testing & Refinement'
      (Protocol in workflow.md)
