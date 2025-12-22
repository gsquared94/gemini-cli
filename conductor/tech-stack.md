# Technology Stack

## Core Runtime & Language

- **TypeScript:** The primary programming language, providing strong typing and
  modern features.
- **Node.js (v20+):** The runtime environment for the CLI.

## Frameworks & Libraries

- **React (Ink):** Used to build the interactive and rich terminal user
  interface.
- **Yargs:** For parsing command-line arguments.
- **Simple-Git:** For interacting with Git repositories.
- **Model Context Protocol (MCP) SDK:** To enable extensible tool integrations.

## Architecture

- **Monorepo:** Structured using NPM workspaces, with separate packages for
  `core`, `cli`, `a2a-server`, `vscode-ide-companion`, and `test-utils`.

## Development & Tooling

- **Vitest:** The primary testing framework for unit and integration tests.
- **ESLint:** For code quality and linting.
- **Prettier:** For consistent code formatting.
- **Husky:** For managing Git hooks (like pre-commit).
- **Esbuild:** For bundling the application.
