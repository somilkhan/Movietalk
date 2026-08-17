# ADR-001: Remove Replit from the supported architecture

- Status: Accepted
- Date: 2026-08-18

## Context

RabbitRip was previously developed with Replit-specific configuration, plugins, workflows, and agent state. The project is no longer developed or deployed through Replit. Production is deployed on Vercel, and the current coding workflow uses GitHub with coding agents such as ChatGPT and Kimi.

## Decision

Replit is not a supported environment for RabbitRip.

The repository should not retain Replit-specific configuration or dependencies solely for compatibility with a retired workflow.

## Consequences

- Replit configuration and plugins can be removed.
- Vercel becomes the documented production deployment platform.
- Agent instructions must prohibit reintroducing Replit-specific tooling.
- Dependency and lockfile cleanup must be kept consistent when the removal is completed.
