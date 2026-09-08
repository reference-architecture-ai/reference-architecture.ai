+++
title = "The Twelve Core Patterns"
description = "The twelve patterns this reference architecture is built from, grouped by the three jobs of an agent harness: context architecture, execution guardrails, and memory infrastructure."
date = 2026-09-08
weight = 1

[taxonomies]
categories = ["Architecture"]
tags = ["reference-architecture", "patterns", "agents", "harnesses"]
+++

The harness, not the model, determines agent success. A harness has three jobs — deciding
what the model sees, enforcing what it can do, and ensuring it learns from its own history
— and each job is served by four patterns.

Every pattern below is documented elsewhere on this site. This page is the index, not the
explanation: each entry links to where the argument is actually made.

## Context Architecture

*What the model sees at each step.* Context is a scarce resource: a 1M token window with
800K of noise performs worse than 200K with 150K of curated signal.

### 1. Structural Context Boundary

Put the boundary in configuration, not in a runtime permission check. A role has access
to certain sources; the knowledge graph is built from those sources; the agent therefore
cannot reach anything outside its role. Not a check that could be bypassed — an absence.
The data was never loaded.

→ [The Terraphim Engine, Layer 1](@/posts/terraphim-engine-architecture/index.md#layer-1-types-and-configuration)

### 2. Deterministic Concept Matching

Resolve text to concepts with finite state automata rather than vector similarity.
Aho-Corasick finds every match in O(n) time, with the same result every run. Probabilistic
retrieval gives you a different context window each time you ask, which makes every
downstream failure irreproducible.

→ [The MCP-Native Agent Architecture, Layer 2](@/posts/mcp-native-agent-architecture/index.md#layer-2-knowledge-graph)

### 3. Structured Compaction

Compact before the window fills, not when it overflows. By 100K tokens a working context
is largely noise: superseded search results, abandoned reasoning paths, old file reads.
Adding capacity without compaction makes performance worse, not better.

→ [Three ways 1M token windows fail](/#failures)

### 4. Priority-Weighted Instruction Injection

Instructions compete, and by default the loudest wins rather than the most important. The
system prompt says one thing, the project file another, the README a third. Weight them
explicitly and re-inject the high-priority ones, rather than trusting position in a
transcript.

→ [Three ways 1M token windows fail](/#failures)

## Execution Guardrails

*What the model can and cannot do.* Risk-tiered, machine-readable, and enforced by the
system rather than requested in a prompt.

### 5. Multi-Tenant Agent Isolation

Agents sharing a protocol layer must not share state. Each agent keeps its own role
configuration and its own knowledge graph, discovering the others' tools without
discovering their data.

→ [Pattern 1: Multi-Tenant Agent Isolation](@/posts/mcp-native-agent-architecture/index.md#pattern-1-multi-tenant-agent-isolation)

### 6. Deterministic Replay

An agent run you cannot replay is an agent run you cannot debug. Record the inputs and the
decisions such that the same run can be reconstructed exactly — which is only possible if
the layers underneath are themselves deterministic.

→ [Pattern 2: Deterministic Replay](@/posts/mcp-native-agent-architecture/index.md#pattern-2-deterministic-replay)

### 7. Human-in-the-Loop for Destructive Operations

Classify tools by effect, not by name. Read-only operations run freely; destructive ones
stop for approval. The protocol enforces the distinction, so an agent cannot talk its way
past it.

→ [Pattern 3: Human-in-the-Loop for Destructive Operations](@/posts/mcp-native-agent-architecture/index.md#pattern-3-human-in-the-loop-for-destructive-operations)

### 8. Break-Glass

Every guardrail needs a deliberate, logged way through it. A guardrail with no override
gets disabled wholesale the first time it blocks something urgent; an override that is
not recorded is indistinguishable from the guardrail not existing.

→ [Harness 3: Break-Glass](@/posts/harness-engineering-agents/index.md#harness-3-break-glass)

## Memory Infrastructure

*Ensuring the model learns from its own history.* Without it, agents repeat solved
problems indefinitely and no amount of context helps.

### 9. Novelty Filter

Distinguish output that is new from output that merely looks new. An agent that cannot
tell repetition from progress will re-report the same finding until someone stops reading.

→ [Harness 1: Novelty Filter](@/posts/harness-engineering-agents/index.md#harness-1-novelty-filter)

### 10. Calculated Health

Derive a health signal from observable metrics rather than asking the agent how it is
doing. Self-assessment is the least reliable input available; commit recency, unapplied
lessons and stall time are not.

→ [Harness 2: Calculated Health](@/posts/harness-engineering-agents/index.md#harness-2-calculated-health)

### 11. Lesson Window

Capture corrections at the moment of failure and apply them within a bounded window.
Lessons with no expiry become noise; lessons never applied were never lessons.

→ [Harness 4: Lesson Window](@/posts/harness-engineering-agents/index.md#harness-4-lesson-window)

### 12. Drift Detection

Long-running agents optimise for local coherence and lose the original objective. Ask
periodically, and mechanically: do we actually have the thing we set out to build? The
question has to be asked by the harness, because an agent that has drifted cannot detect
its own drift.

→ [Three ways 1M token windows fail](/#failures) ·
[The nine-step orchestration arc](/#flywheel)

## On this list

These twelve are the patterns this site currently makes an argument for, grouped by
[the three jobs of an agent harness](/#harness). The grouping is deliberate: a pattern
that does not serve one of those three jobs probably belongs in a different architecture.

The list is not a claim to completeness. It is what is documented, and the honest test of
any addition is whether there is an article behind it.
