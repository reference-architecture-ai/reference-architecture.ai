+++
title = "The MCP-Native Agent Architecture"
description = "Why Model Context Protocol is the missing link between probabilistic LLMs and production-grade agent orchestration — a reference architecture drawn from Terraphim"
date = 2026-09-07
[taxonomies]
categories = ["Architecture"]
tags = ["mcp", "agents", "rust", "knowledge-graphs", "production", "terraphim"]
[extra]
comments = true
+++

A reference architecture for production AI systems, drawn from five years building Terraphim — a privacy-first AI assistant with ~50 Rust crates, MCP-native interfaces, and role-based multi-agent orchestration.

<!-- more -->

## The Production Agent Crisis

In the spring of 2024, I watched a well-funded AI startup burn through $180,000 in cloud credits in six weeks. Their crime? They let an LLM-powered agent manage their Kubernetes cluster. The agent had root access, a vague prompt ("optimize resource utilization"), and no guardrails. It deleted a production namespace, scaled a stateful set to zero, and triggered a cascading failure that took down their primary revenue pipeline for four hours.

The post-mortem was illuminating. The LLM wasn't "malicious." It was doing exactly what LLMs do: generating plausible-sounding text based on pattern matching. The prompt "optimize resource utilization" is semantically close to "remove unused resources." The agent found a namespace with low CPU utilization and removed it. Logical, if you squint. Catastrophic, if you're the on-call engineer.

**This is the production agent crisis in miniature: we've given probabilistic systems deterministic powers without deterministic boundaries.**

The current generation of agent frameworks — LangChain, CrewAI, AutoGPT, and their descendants — share a common architectural flaw: they treat the LLM as both the decision-maker AND the execution engine. The LLM decides what to do, how to do it, and when to stop. This is fine for demos. It's a liability for production.

Consider what production systems actually require:

- **Determinism:** Same input → same behavior. Always. Not "usually." Not "most of the time." Always.
- **Auditability:** Every action traceable to a specific decision, with full context, for compliance and debugging.
- **Boundaries:** The system must be physically incapable of certain actions, regardless of what the LLM suggests.
- **Resource limits:** CPU, memory, API calls, time — bounded and enforced, not merely suggested.
- **Rollback:** When things go wrong, return to a known-good state.

None of these are properties of LLMs. LLMs are probabilistic text generators. They hallucinate. They drift. They respond to temperature. They have no concept of "side effects" or "resource limits" or "this action is irreversible."

**The solution is architectural, not algorithmic.** We need a boundary layer between the probabilistic decision-maker (the LLM) and the deterministic execution environment (the system). That boundary layer is the Model Context Protocol (MCP), and treating it as an architectural primitive rather than a communication protocol changes everything.

## MCP as Architectural Primitive

MCP was introduced by Anthropic in late 2024 as a standardized protocol for connecting AI assistants to external data sources and tools. At its simplest, it defines how an AI client discovers capabilities, requests context, and invokes tools from a server.

But MCP is more than a wire format. **It is a contract layer that enforces capability boundaries.** And when you treat it as an architectural primitive — a fundamental building block of your system, not just a communication detail — you get something powerful: the ability to build deterministic agent systems on top of probabilistic reasoning engines.

### The Protocol Surface

An MCP server exposes three things:

1. **Resources:** Read-only data sources (files, databases, API responses)
2. **Tools:** Functions the client can invoke, with defined schemas and side effects
3. **Prompts:** Pre-defined templates for common interactions

The key insight: **the server defines WHAT is possible. The LLM decides WHICH possibility to pursue. The protocol enforces the boundary between them.**

Terraphim's MCP server (`terraphim_mcp_server`) implements this boundary in ~200 lines of Rust. It exposes three tools: `search` (read-only, queries the knowledge graph), `build_autocomplete_index` (idempotent, rebuilds the Aho-Corasick automata), and `update_config` (destructive, modifies runtime configuration). Each tool has a schema. Each tool has a known effect. The LLM cannot invoke a tool it hasn't discovered, and it cannot pass arguments that don't match the schema.

This is the difference between "I hope the LLM doesn't delete something" and "the system is physically incapable of deleting something without authorization."

## The Four-Layer Reference Architecture

![Four-Layer Architecture](/diagrams/four-layer-architecture.svg)
*The MCP-native agent stack: four layers with the LLM as a probabilistic reasoning engine, bounded by deterministic architectural layers.*

Based on production experience building Terraphim — a privacy-first AI assistant with ~50 Rust crates, MCP server integration, and multi-agent orchestration — I've distilled the following reference architecture. It separates concerns that current frameworks conflate and introduces verification at every boundary.

### Layer 1: Role & Configuration

*What the agent IS.*

In Terraphim, everything starts with a `Role`. A Role is not a prompt. It is a structured configuration that defines an agent's identity, knowledge sources, capabilities, and constraints. Think of it as a compile-time contract for an agent's behavior.

```rust
// From terraphim_config — the actual Role struct
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Role {
    pub name: RoleName,
    pub relevance_function: RelevanceFunction,  // BM25, TitleScorer, etc.
    pub haystacks: Vec<Haystack>,               // Data sources
    pub kg: Option<KnowledgeGraph>,             // Linked knowledge graph
    pub llm_enabled: bool,
    pub llm_model: Option<String>,              // e.g., "gemma3:270m"
    pub llm_router_enabled: bool,               // 6-phase intelligent routing
    pub extra: AHashMap<String, Value>,         // Extensible config
}
```

**Key properties:**
- **Statically typed:** Role configuration is validated at load time, not runtime
- **Resource-scoped:** Each Role specifies exactly which haystacks (data sources) it can access
- **LLM-agnostic:** The same Role can run against Ollama, OpenAI, or any provider via the LLM router
- **Extensible:** The `extra` hashmap allows domain-specific configuration without schema changes

The Role is the "type system" of your agent. Just as Rust's borrow checker prevents data races at compile time, the Role configuration prevents capability leakage at configuration time.

### Layer 2: Knowledge Graph

*What the agent KNOWS.*

Terraphim's knowledge graph (`terraphim_rolegraph`) is not a general-purpose graph database. It is a specialized structure optimized for one thing: fast, deterministic text-to-concept matching using Aho-Corasick automata.

```rust
// From terraphim_rolegraph — the actual RoleGraph
pub struct RoleGraph {
    pub role: RoleName,
    nodes: AHashMap<u64, Node>,
    edges: AHashMap<u64, Edge>,
    documents: AHashMap<String, IndexedDocument>,
    pub thesaurus: Thesaurus,
    pub ac: AhoCorasick,                    // Compiled automata
    pub ac_reverse_nterm: AHashMap<u64, NormalizedTermValue>,
}

impl RoleGraph {
    pub fn find_matching_node_ids(&self, text: &str) -> Vec<u64> {
        self.ac.find_iter(text)
            .map(|mat| self.aho_corasick_values[mat.pattern()])
            .collect()
    }
}
```

**Key properties:**
- **Deterministic matching:** Aho-Corasick finds all matches in O(n) time, where n is text length. No probabilistic retrieval.
- **Thesaurus-driven:** Synonyms map to canonical concepts. "Rust" and "Rustlang" resolve to the same node.
- **Serializable:** The entire graph (minus the compiled automata) serializes to JSON for persistence and transport.
- **WASM-compatible:** `terraphim_automata` compiles to WebAssembly for browser-based autocomplete.

The Context Boundary emerges naturally from the Role configuration: if a Role only has access to certain haystacks, and the RoleGraph is built from those haystacks, the agent cannot access information outside its Role. This is not a runtime permission check. It is a structural impossibility.

### Layer 3: Multi-Agent Orchestration

*What the agent DOES with others.*

Terraphim's multi-agent system (`terraphim_multi_agent`) treats each Role as an autonomous agent. Agents discover each other through capability registration, communicate through structured messages, and coordinate through workflow patterns.

```rust
// From terraphim_multi_agent — the actual AgentRegistry
pub struct AgentRegistry {
    agents: Arc<RwLock<HashMap<AgentId, Arc<TerraphimAgent>>>>,
    capabilities: Arc<RwLock<HashMap<String, Vec<AgentId>>>>,
    role_agents: Arc<RwLock<HashMap<String, AgentId>>>,
    agent_load: Arc<RwLock<HashMap<AgentId, LoadMetrics>>>,
}

impl AgentRegistry {
    pub async fn find_agents_by_capability(&self, capability: &str) -> Vec<AgentId> {
        let capabilities = self.capabilities.read().await;
        capabilities.get(capability).cloned().unwrap_or_default()
    }
}
```

**Key properties:**
- **Capability-based discovery:** Agents register what they can do. Other agents query by capability, not by name.
- **Load-aware routing:** The registry tracks per-agent load metrics and routes tasks to the least-loaded capable agent.
- **Role-as-Agent:** Each Terraphim Role becomes an agent with its own knowledge graph, memory, and task history.
- **Workflow patterns:** Lead-with-specialists, review-and-optimize, parallel execution — implemented as typed Rust enums.

The Execution Harness is not a Wasm sandbox (though we have WASM support in `terraphim_automata` for browser contexts). It is the agent's own `TerraphimAgent` struct, which enforces resource limits through Rust's type system: token budgets are `usize`, timeouts are `Duration`, and context windows are bounded by configuration.

### Layer 4: MCP Protocol Surface

*How the agent COMMUNICATES.*

The `terraphim_mcp_server` crate exposes Terraphim's capabilities through the Model Context Protocol. It acts as both server (exposing Terraphim tools to external clients) and client (discovering external tools for Terraphim agents).

```rust
// From terraphim_mcp_server — the actual McpService
#[derive(Clone)]
pub struct McpService {
    config_state: Arc<ConfigState>,
    resource_mapper: Arc<TerraphimResourceMapper>,
    autocomplete_index: Arc<tokio::sync::RwLock<Option<AutocompleteIndex>>>,
}

impl McpService {
    pub async fn search(
        &self,
        query: String,
        role: Option<String>,
        limit: Option<i32>,
    ) -> Result<CallToolResult, ErrorData> {
        // 1. Resolve role (tenant boundary)
        let role_name = if let Some(role_str) = role {
            RoleName::from(role_str)
        } else {
            self.config_state.get_selected_role().await
        };

        // 2. Query knowledge graph within role boundary
        let search_query = SearchQuery {
            search_term: NormalizedTermValue::from(query),
            role: Some(role_name),
            limit: limit.map(|l| l as usize),
            ..Default::default()
        };

        // 3. Return structured results
        match service.search(&search_query).await {
            Ok(documents) => { /* ... */ }
            Err(e) => { /* ... */ }
        }
    }
}
```

**Key properties:**
- **Schema-enforced:** Every tool has a JSON schema. Invalid arguments are rejected before reaching business logic.
- **Role-scoped:** The `role` parameter in every tool call enforces tenant isolation at the protocol level.
- **Typed errors:** `TerraphimMcpError` maps to MCP `ErrorData` with structured error codes.
- **Async by design:** Built on `tokio` for concurrent request handling.

## Why Rust?

The reference architecture is implemented in Rust. This is not aesthetic preference. It is an engineering requirement.

**Zero-cost abstractions:** The Role configuration, knowledge graph, and agent registry introduce no runtime overhead. The type system enforces safety at compile time.

**Deterministic resource usage:** No garbage collection pauses. Memory is explicitly managed. The `terraphim_automata` Aho-Corasick matcher runs in bounded time and space.

**Fearless concurrency:** The AgentRegistry is accessed by multiple agents simultaneously. Rust's `Arc<RwLock<_>>` prevents data races without runtime overhead.

**WASM portability:** `terraphim_types` and `terraphim_automata` compile to WebAssembly, enabling browser-based autocomplete with TypeScript bindings.

## Production Patterns

![Traditional vs MCP-Native](/diagrams/traditional-vs-mcp.svg)
*Traditional agents conflate decision and execution. MCP-native agents enforce a hard boundary: the LLM decides, the architecture executes.*

### Pattern 1: Multi-Tenant Agent Isolation

In Terraphim, multiple users share the same agent infrastructure but have completely isolated contexts:

```rust
// Each tenant gets their own Role configuration
let tenant_role = Role::new("tenant_acme")
    .with_haystacks(vec![acme_documents, acme_wiki])
    .with_llm_model("gemma3:270m")
    .with_relevance_function(RelevanceFunction::BM25);

// The RoleGraph is built ONLY from tenant's haystacks
let role_graph = RoleGraph::new("tenant_acme".into(), tenant_thesaurus).await?;

// MCP search automatically scopes to tenant's role
let results = mcp_service.search(query, Some("tenant_acme".to_string()), None).await?;
```

**Key insight:** The boundary is per-tenant, but the automata engine and MCP server are shared. This gives you multi-tenant isolation without multi-tenant cost.

### Pattern 2: Deterministic Replay

When a bug occurs in production, you need to reproduce it exactly. With probabilistic agents, this is nearly impossible. With MCP-native architecture, it's trivial:

![Deterministic Replay](/diagrams/deterministic-replay.svg)
*Recording LLM responses (not regenerating them) makes replay deterministic. The same inputs produce the same execution trace.*

```rust
// The RoleGraph + automata are deterministic
// Same query + same thesaurus → same matches, every time
let matches = role_graph.find_matching_node_ids("rust programming");
// Always returns the same node IDs for the same input

// For LLM variability: record responses, don't regenerate
let recorded_response = load_recording(task_id)?;
let plan = agent.generate_plan_with_response(context, recorded_response)?;
```

**Key insight:** The knowledge graph is deterministic. The LLM is not. Separate the two, and replay becomes deterministic where it matters.

### Pattern 3: Human-in-the-Loop for Destructive Operations

![Approval Flow](/diagrams/approval-flow.svg)
*Destructive operations require explicit approval. The system logs every request but does not execute without authorization.*

```rust
// terraphim_mcp_server's update_config tool is inherently bounded
pub async fn update_config_tool(&self, config_str: String) -> Result<CallToolResult, ErrorData> {
    match serde_json::from_str::<Config>(&config_str) {
        Ok(new_config) => {
            // Config validation happens BEFORE mutation
            self.validate_config(&new_config)?;
            self.update_config(new_config).await?;
            Ok(CallToolResult::success(vec![Content::text(
                "Configuration updated".to_string()
            )]))
        }
        Err(e) => {
            Ok(CallToolResult::error(vec![Content::text(
                format!("Invalid configuration: {}", e)
            )]))
        }
    }
}
```

**Key insight:** The MCP schema IS the approval gate. The LLM cannot construct a valid `Config` JSON without knowing the schema, and invalid configs are rejected before mutation.

## Integration with Terraphim

![Terraphim Multi-Agent Orchestration](/diagrams/terraphim-multi-agent.svg)
*Terraphim instances share an MCP protocol layer while maintaining isolated Role configurations and Knowledge Graphs. Each agent discovers tools through MCP without data leakage.*

Terraphim implements this architecture across ~50 Rust crates. Here's how the layers map to real code:

| Layer | Crate | Responsibility |
|-------|-------|--------------|
| Role & Config | [`terraphim_config`](https://docs.rs/terraphim_config) | Role definitions, haystacks, LLM routing |
| Knowledge Graph | [`terraphim_rolegraph`](https://docs.rs/terraphim_rolegraph) | Aho-Corasick automata, concept matching |
| Fast Matching | [`terraphim_automata`](https://docs.rs/terraphim_automata) | FST autocomplete, link generation, WASM |
| Multi-Agent | [`terraphim_multi_agent`](https://docs.rs/terraphim_multi_agent) | Agent registry, capability discovery, workflows |
| MCP Server | [`terraphim_mcp_server`](https://docs.rs/terraphim_mcp_server) | Protocol surface, schema enforcement |
| Capabilities | [`terraphim_agent_registry`](https://docs.rs/terraphim_agent_registry) | Capability matching, score-based discovery |
| Persistence | [`terraphim_persistence`](https://docs.rs/terraphim_persistence) | DeviceStorage, memory/file backends |

The MCP integration is bidirectional. Terraphim acts as an MCP server (exposing search and config tools to external clients) and can discover external MCP servers for additional capabilities. This enables multi-agent orchestration where each agent has its own Role and Knowledge Graph, but they can discover and invoke each other's tools through MCP.

## The Determinism Guarantee

Let's be precise about what this architecture guarantees and what it doesn't.

**What IS guaranteed:**
- Given the same Role + Thesaurus, the knowledge graph returns the SAME matches for the same query
- The Aho-Corasick automata finds all matches in deterministic O(n) time
- MCP tool schemas reject invalid arguments before business logic executes
- Role-scoped haystacks prevent cross-tenant data access
- Audit logs record every MCP tool invocation with full context

**What is NOT guaranteed:**
- LLM output is deterministic (it's not, and doesn't need to be)
- The agent will always choose the "best" action (it will choose a valid one)
- The agent will never make mistakes (it will make bounded, recoverable mistakes)

**The key insight:** We don't need the LLM to be deterministic. We need the KNOWLEDGE GRAPH and the PROTOCOL BOUNDARY to be deterministic. The LLM provides variable intelligence within fixed architectural bounds. The bounds are what matter for production.

## When This Architecture Is Overkill

Not every AI system needs four layers of deterministic boundaries. Here's when you DON'T need MCP-native architecture:

- **Chatbots with no tool access:** If the agent only generates text, it can't break anything
- **Read-only research assistants:** If there are no side effects, there are no safety concerns
- **Prototypes and demos:** Move fast, validate the concept, then add boundaries
- **Human-in-the-loop systems where every action is approved:** If a human reviews every output, the LLM is just a suggestion engine

**Add MCP-native boundaries when:**
- The agent has write access to databases, APIs, or infrastructure
- The agent operates in a regulated environment (finance, healthcare, government)
- The agent handles PII or sensitive data
- The agent's actions have financial or safety consequences
- You need to explain agent decisions to auditors, regulators, or courts

## Implementation Checklist

Building MCP-native agents?

- [ ] Define your Role configurations with scoped haystacks and typed capabilities
- [ ] Build a Knowledge Graph with deterministic matching (Aho-Corasick, not vector search)
- [ ] Implement MCP server with schema-enforced tool definitions
- [ ] Add agent registry with capability-based discovery
- [ ] Audit-log every MCP tool invocation
- [ ] Implement Role-scoped search to prevent cross-tenant leakage
- [ ] Write deterministic replay tests for your knowledge graph
- [ ] Benchmark automata latency vs. vector retrieval
- [ ] Document your architecture for security audits

## Conclusion: The Protocol Is the Architecture

The current generation of agent frameworks treats LLMs as the center of the universe. The LLM decides everything, and the framework provides convenient wrappers around API calls.

This is backwards.

**The protocol is the architecture. The LLM is just one implementation detail.**

A production agent system needs:
- Deterministic configuration boundaries (Role)
- Deterministic knowledge access (Knowledge Graph + Automata)
- Capability-based multi-agent orchestration (Agent Registry)
- Schema-enforced protocol surface (MCP Server)

MCP provides the protocol surface. The reference architecture provides the safety properties. Rust provides the implementation guarantees.

The LLM? It's just the reasoning engine. Powerful, probabilistic, and properly contained.

---

## Reference Implementation

The architecture described in this article is implemented in Terraphim, an open-source privacy-first AI assistant:

- **Repository:** [github.com/terraphim-ai/terraphim](https://github.com/terraphim/terraphim-ai)
- **Documentation:** [docs.terraphim.ai](https://docs.terraphim.ai)
- **MCP Server:** [`terraphim_mcp_server`](https://docs.rs/terraphim_mcp_server) crate
- **License:** Apache-2.0

Contributions welcome. Issues tracked in the [Terraphim Gitea](https://git.terraphim.cloud).

---

*Alexander Mikhalev is CTO & Head of AI at Zestic AI, where he architects AI-native platforms with deterministic safety guarantees. He is the creator of Terraphim, an open-source privacy-first AI assistant built in Rust. His project "The Pattern" won the $10,000 Platinum Prize at the Redis "Build on Redis" Hackathon 2021 for ML-powered knowledge discovery. He previously led AI/ML architecture at Nationwide Building Society, where he co-authored the organization's first technology patent — a blockchain-inspired distributed system for resilient consensus. He speaks on AI architecture, Rust, and knowledge graphs.*
