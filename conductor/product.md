# Initial Concept

Gemini CLI is an open-source AI agent that brings the power of Gemini directly
into the terminal. It provides lightweight access to Gemini, giving you the most
direct path from your prompt to our model.

# Product Guide

## Target Users

The primary users of Gemini CLI are **Software Engineers** and **Developers**
who prefer working within a terminal environment. It also serves **DevOps/SREs**
who need to automate complex operational tasks. Additionally, **Technical
Writers** can leverage the tool for documentation tasks and consistency.

## Core Goals

1.  **Natural Language Empowerment:** Enable developers to design, build, and
    manage applications using natural language prompts.
2.  **Workflow Automation:** Provide a powerful system for automating complex,
    multi-step developer workflows.
3.  **Extensibility:** Create a robust platform that can be extended via the
    Model Context Protocol (MCP) and custom extensions to integrate with any
    external tool or service.

## Critical Features

- **Local Tool Suite:** Robust built-in tools for file system manipulation and
  shell command execution, allowing the agent to act directly on the local
  environment.
- **Advanced Context Management:** Features like session checkpointing and
  project-specific `GEMINI.md` files that allow for persistent,
  highly-contextual AI interactions.

## Design Principles

- **Developer Productivity First:** Every feature should aim to reduce context
  switching and friction for developers working in the terminal.
- **Security and Trust:** Ensure that tool execution is safe and that data
  handling is transparent, utilizing sandboxing and clear policies.
- **Interactive and Responsive UX:** Provide a polished, real-time CLI
  experience that feels intuitive and provides immediate feedback.
