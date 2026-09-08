+++
title = "The Terraphim Engine: Six Layers, Fifty-Two Crates"
description = "How the engine behind this reference architecture is actually decomposed: six layers, single-responsibility crates, and why that boundary discipline is what makes an agent system auditable."
date = 2026-09-08

[taxonomies]
categories = ["Architecture"]
tags = ["terraphim", "rust", "knowledge-graphs", "agents", "reference-architecture"]

[extra]
archived = false
+++

The diagram on the front page of this site is not an illustration. Every box in it is a
published Rust crate you can `cargo add` today, read the documentation for, and use
without taking the rest of the system. This article explains what sits behind each box,
and why the decomposition is the interesting part.

<span id="continue-reading"></span>

## Why decomposition is the architecture

Most agent frameworks ship as a single dependency. You take the orchestrator, the memory
layer, the retrieval stack and the tool protocol together, or you take none of it. That
is convenient at first and expensive later: when one layer misbehaves you cannot isolate
it, and when you want to replace one you replace all of them.

The pattern this site argues for is the opposite. Draw the boundaries first, make each
one independently useful, and let the seams stay visible. Terraphim is built that way —
52 crates across six layers, each with a single responsibility — which makes it a
reasonable worked example rather than a product pitch.

The test of a boundary is whether you can use one side without the other. Here you can:
`terraphim_automata` is a text-matching engine that happens to be used by a knowledge
graph; `terraphim_persistence` is a storage abstraction that does not know what it is
storing.

## The six layers

Terraphim organises its crates into a dependency graph with six levels. Lower layers do
not know the higher ones exist.

| Layer | Concern | Representative crates |
|---|---|---|
| 6 | User interfaces | [`terraphim_agent`](https://docs.rs/terraphim_agent), [`terraphim-cli`](https://docs.rs/terraphim-cli), [`terraphim_server`](https://docs.rs/terraphim_server) |
| 5 | Orchestration | [`terraphim_orchestrator`](https://docs.rs/terraphim_orchestrator), [`terraphim_kg_orchestration`](https://docs.rs/terraphim_kg_orchestration), `terraphim_symphony` |
| 4 | Agent system | [`terraphim_spawner`](https://docs.rs/terraphim_spawner), [`terraphim_router`](https://docs.rs/terraphim_router), [`terraphim_agent_supervisor`](https://docs.rs/terraphim_agent_supervisor) |
| 3 | Service layer | [`terraphim_service`](https://docs.rs/terraphim_service), [`terraphim_middleware`](https://docs.rs/terraphim_middleware), `haystack_*` |
| 2 | Core engine | [`terraphim_automata`](https://docs.rs/terraphim_automata), [`terraphim_rolegraph`](https://docs.rs/terraphim_rolegraph), [`terraphim_persistence`](https://docs.rs/terraphim_persistence) |
| 1 | Types and configuration | [`terraphim_types`](https://docs.rs/terraphim_types), [`terraphim_config`](https://docs.rs/terraphim_config), [`terraphim_settings`](https://docs.rs/terraphim_settings) |

That ordering matters more than the crate count. An agent system that cannot say which
layer a failure came from is a system you cannot debug in production.

## Layer 1: types and configuration

`terraphim_types` is the shared vocabulary — the structures every other crate agrees on.
`terraphim_config` holds role definitions, haystacks and LLM routing;
`terraphim_settings` handles runtime preferences.

Putting roles in configuration rather than code is what makes the context boundary
structural. A role has access to certain haystacks; the knowledge graph is built from
those haystacks; therefore the agent cannot reach information outside its role. That is
not a permission check at runtime that could be bypassed — it is an absence. The data
was never loaded.

## Layer 2: the core engine

This is the layer the front-page diagram mostly depicts.

**[`terraphim_automata`](https://docs.rs/terraphim_automata)** is the matching engine:
Aho-Corasick finite state automata that match thousands of patterns simultaneously in
O(n) time, where n is the length of the text. Not "usually fast" — bounded, and the same
bound every time. It compiles to WebAssembly, which is why the same matcher runs in a
browser as on a server.

**[`terraphim_rolegraph`](https://docs.rs/terraphim_rolegraph)** is the knowledge graph.
It is deliberately not a general-purpose graph database. It maps search roles to
domain-specific graph views, and it exists to do one thing quickly: turn text into
concepts, deterministically. Terraphim reports knowledge-graph inference in the 5-10
nanosecond range and a 15 MB memory footprint, with no GPU — figures worth checking
against your own workload, but the shape of the claim follows from the design rather
than from optimisation tricks.

**[`terraphim_persistence`](https://docs.rs/terraphim_persistence)** provides the
`Persistable` trait and DeviceStorage backends across memory, SQLite and redb. Storage is
an interface here, not an assumption, which is what lets the same engine run on a laptop
and at the edge.

## Layer 3: the service layer

[`terraphim_middleware`](https://docs.rs/terraphim_middleware) searches *haystacks* —
pluggable data-source backends. This is the boundary the front-page diagram labels
Document Input. A haystack might be a local folder, a repository, or a connector to
something else; the layers above do not change when you add one.

[`terraphim_service`](https://docs.rs/terraphim_service) handles requests and responses
for the core, which keeps request handling out of the engine itself.

## Layers 4 and 5: agents and orchestration

Above the service layer sit the agent system ([`terraphim_spawner`](https://docs.rs/terraphim_spawner), [`terraphim_router`](https://docs.rs/terraphim_router),
[`terraphim_agent_supervisor`](https://docs.rs/terraphim_agent_supervisor)) and orchestration ([`terraphim_orchestrator`](https://docs.rs/terraphim_orchestrator),
[`terraphim_kg_orchestration`](https://docs.rs/terraphim_kg_orchestration), `terraphim_symphony`).

The distinction is worth holding onto. The agent system is concerned with individual
agents — spawning them, routing to them, supervising them. Orchestration is concerned
with what happens between them. Collapsing those two into one "agent framework" is the
usual mistake, and it is why so many systems cannot tell a stuck agent from a stuck
workflow.

[The MCP-Native Agent Architecture](@/posts/mcp-native-agent-architecture/index.md) goes
into the protocol surface these layers expose, and why treating MCP as an architectural
primitive rather than a transport changes what the system can guarantee.

## Layer 6: the interfaces

[`terraphim_agent`](https://docs.rs/terraphim_agent) is the interactive REPL with session
search and learning capture. [`terraphim-cli`](https://docs.rs/terraphim-cli) is the
automation-shaped counterpart, with JSON output for scripting.
[`terraphim_server`](https://docs.rs/terraphim_server) provides the REST API.

Three interfaces over one engine, none of them privileged. That is the payoff of the
layering: the CLI is not a thin wrapper around the server, and the server is not a
special case. They are peers over the same core.

## What to take from this

You do not need to adopt Terraphim to use the pattern. The transferable parts are:

- **Draw layers that a failure can be attributed to.** If you cannot name the layer, you
  cannot fix the bug.
- **Make each boundary independently useful.** A crate nobody would use on its own is
  usually not a boundary, it is a split file.
- **Put the context boundary in configuration, not in runtime checks.** Structural
  impossibility beats a permission test.
- **Keep the expensive guarantees low.** Determinism in the matching engine is worth more
  than determinism bolted onto the orchestrator.

## Documentation

Every crate named above is published and documented:

- **[terraphim.rs](https://terraphim.rs)** — the engine: all 52 crates, grouped by layer,
  with the dependency graph and installation instructions.
- **[docs.rs](https://docs.rs/terraphim_automata)** — per-crate API documentation,
  generated from source. Start with
  [`terraphim_automata`](https://docs.rs/terraphim_automata) for matching,
  [`terraphim_rolegraph`](https://docs.rs/terraphim_rolegraph) for the knowledge graph,
  or [`terraphim_persistence`](https://docs.rs/terraphim_persistence) for storage.
- **[docs.terraphim.ai](https://docs.terraphim.ai)** — the full documentation site:
  guides, deployment and integration patterns.
- **[terraphim.ai](https://terraphim.ai)** — the assistant built on all of it, if you
  would rather see the system working before reading its parts.

Installation is a single command, or `cargo install terraphim_agent` if you would prefer
to start from the REPL.
