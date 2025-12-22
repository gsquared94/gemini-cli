# Plan: Integrate ComputerUse Model for Browser Control

## Phase 1: Research & Architecture Evaluation

- [ ] Task: Evaluate ComputerUse model capabilities and requirements.
  - [ ] Sub-task: Research available "ComputerUse" capable models (e.g.,
        specialized Gemini variants) and their input/output formats.
  - [ ] Sub-task: Determine the context requirements (screenshots, accessibility
        tree, raw DOM).
- [ ] Task: Select Browser Automation Library.
  - [ ] Sub-task: Compare Puppeteer and Playwright for compatibility with the
        project's tech stack (Node/TS).
  - [ ] Sub-task: Create a small prototype script to verify the selected library
        works in the CLI environment.
- [ ] Task: Architecture Decision Record (ADR).
  - [ ] Sub-task: Draft an ADR comparing "Sub-agent" vs. "Extension" approaches.
  - [ ] Sub-task: Decide on the approach (e.g., Extension seems more aligned
        with the "extensibility" goal).
- [ ] Task: Conductor - User Manual Verification 'Research & Architecture
      Evaluation' (Protocol in workflow.md)

## Phase 2: Core Browser Control Implementation

- [ ] Task: Scaffold the implementation (Extension or Sub-agent).
  - [ ] Sub-task: Create the directory structure (e.g.,
        `packages/browser-extension` or `packages/core/src/agents/browser`).
  - [ ] Sub-task: Set up `package.json` and install dependencies (e.g.,
        `playwright`).
- [ ] Task: Implement Basic Browser Primitives.
  - [ ] Sub-task: Write Tests: Create unit tests for launching and closing the
        browser.
  - [ ] Sub-task: Implement `BrowserManager` class to handle browser lifecycle
        (launch, context, page creation).
- [ ] Task: Implement Navigation and Interaction Tools.
  - [ ] Sub-task: Write Tests: Create tests for `goto`, `click`, `type`
        functions.
  - [ ] Sub-task: Implement tools/functions for the model to use:
        `navigate(url)`, `click(selector)`, `type(text)`, `screenshot()`.
- [ ] Task: Conductor - User Manual Verification 'Core Browser Control
      Implementation' (Protocol in workflow.md)

## Phase 3: Model Integration & Agent Loop

- [ ] Task: Implement "ComputerUse" Agent Loop.
  - [ ] Sub-task: Write Tests: Mock model responses and verify the loop
        processes actions.
  - [ ] Sub-task: Implement the loop: Capture State -> Send to Model -> Parse
        Action -> Execute Action -> Repeat.
- [ ] Task: Integrate with Gemini CLI Core.
  - [ ] Sub-task: Expose the new capabilities as a tool or agent to the main
        CLI.
  - [ ] Sub-task: Ensure context (screenshots/DOM) is correctly passed to the
        model.
- [ ] Task: Conductor - User Manual Verification 'Model Integration & Agent
      Loop' (Protocol in workflow.md)

## Phase 4: Testing & Refinement

- [ ] Task: End-to-End Testing.
  - [ ] Sub-task: Create an E2E test case (e.g., a simple search flow) to verify
        the entire pipeline.
  - [ ] Sub-task: Run the test and debug issues (timing, selector stability).
- [ ] Task: Documentation.
  - [ ] Sub-task: Write usage documentation for the new capability.
  - [ ] Sub-task: Document security implications (e.g., what the browser can
        access).
- [ ] Task: Conductor - User Manual Verification 'Testing & Refinement'
      (Protocol in workflow.md)
