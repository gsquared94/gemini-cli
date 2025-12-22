# Product Guidelines

## Prose and Communication

- **Technical and Concise:** All documentation and agent responses should
  prioritize precision and speed. Avoid unnecessary conversational filler.
- **Collaborative Voice:** The agent acts as a partner, proactively suggesting
  improvements and asking clarifying questions to ensure the user's intent is
  accurately captured and executed.

## User Experience (UX) and Interface

- **Rich Terminal UI:** Leverage modern CLI frameworks (like Ink) to provide a
  visually engaging and highly interactive experience. Use spinners, progress
  bars, and structured tables to make complex operations transparent and easy to
  follow.
- **Actionable Feedback:** Error messages must never be dead ends. Every error
  should clearly explain the "why" and provide a suggested "how" to fix it,
  often proposing the specific command or action needed to proceed.

## Security and Trust

- **Secure by Default:** Handling of sensitive information is critical. Secrets
  and API keys must be masked in outputs and never persisted in logs. The system
  should proactively warn users when it detects that sensitive data might be
  part of the execution context.
