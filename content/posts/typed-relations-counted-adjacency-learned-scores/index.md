+++
title = "Typed Relations, Counted Adjacency and Learned Scores"
description = "Choosing a knowledge graph layer for agent retrieval: what FIG-MAC's learned inspiration graph and Terraphim's counted role graph each establish, and a layering that keeps declared, counted and inferred relationships apart."
date = 2026-11-27

[taxonomies]
categories = ["Architecture"]
tags = ["knowledge-graphs", "graph-embeddings", "retrieval", "terraphim", "provenance", "ai-agents"]

[extra]
archived = false
mermaid = true
+++

## Abstract

A knowledge graph layer for agent retrieval must decide where its relationships come from, how it scores them and what a query returns. This paper compares two recent answers. FIG-MAC (arXiv:2611.33563) extracts typed entities and relations from research papers with fine-tuned language models, learns relational graph embeddings and returns scored multi-hop chains alongside dense-vector neighbours. Terraphim's role graph resolves surface forms through an externally supplied thesaurus, counts directed adjacency between recognised concepts and returns documents ranked by an integer sum that a reader can recompute. FIG-MAC's ablation reports that graph traversal exceeded vector retrieval on raw novelty and source diversity in all six configurations tested, and on provenance-adjusted novelty in five of six, and that combining the two did best throughout; the evaluation has limits, discussed below. The comparison motivates a layering in which every edge carries its provenance class: declared, counted or inferred. Inferred edges may widen recall, but they may not satisfy a checklist item or an authority check without review. The paper separates the components that exist today from the integration it proposes.

<span id="continue-reading"></span>

## The decision a graph layer makes

[Organisational Roles as Contracts for AI Agents](/posts/organisational-roles-as-agent-contracts/) argued that a role-based knowledge graph should keep equivalence and relationship apart, and that co-occurrence alone leaves a relationship's meaning, direction and conditions unspecified. That paper proposed governed, typed relationships above the association graph. It left open a question this paper takes up: may those typed relationships be learned from text, and if so, what may an agent do with them?

Three design decisions determine the answer.

1. **Origin of a relationship.** It can be declared by a person in a reviewed file, counted from observed text, or inferred by a model.
2. **Scoring.** A score can be a sum of counts, or a function of learned parameters.
3. **Output.** A query can return ranked documents, or the paths that justify them.

## Reference point one: a learned inspiration graph

FIG-MAC targets automated scientific hypothesis generation. Its Fine-grained Inspiration Graph has three node types: paper (PAP), research question (RQ) and solution (SOL). Hierarchical relations (`has_rq`, `has_sol`) encode the structure inside each paper. Cross-paper relations are `related`, for semantically similar entities, and `inspired`, from a solution in one paper to a research question in another, without requiring a citation between them.

The graph is inferred throughout. Papers were annotated manually to a standard (Kappa 0.85), after which a fine-tuned extractor processed 26,917 papers from five venues, four of them NLP conferences. Candidate cross-paper pairs below a similarity threshold were pruned and the remainder classified by a fine-tuned Qwen3-8B. A two-layer relational graph convolutional network with a DistMult decoder scores edges; on inspired-edge link prediction it reports a test mean reciprocal rank of 0.4599. Retrieval takes the union of dense-vector neighbours and graph chains of the form (RQ_0, ..., RQ_m, SOL_j, PAP_k). Each chain is ranked by a weighted sum of a cosine similarity and two learned edge confidences, with weights tuned on a validation set and not published.

The design returns paths. Its weakness, from an assurance point of view, is that every relationship and every score in a chain depends on a model decision that a reviewer cannot recompute.

## Reference point two: a counted role graph

Terraphim's `terraphim_rolegraph`, read at terraphim-core commit 84a496a, makes the opposite choices. [Terraphim graph embeddings](https://terraphim.ai/docs/graph-embeddings/) describes the mechanism; the facts below come from the source.

- **Declared vocabulary.** A role's thesaurus maps synonyms to normalised concept identifiers and compiles to a leftmost-longest, case-insensitive Aho-Corasick automaton.
- **Counted adjacency.** Indexing a document connects each consecutive pair of recognised concepts with a directed edge. The edge keeps a per-document count of that pair, and a node's rank is incremented per pair update. (Correction, 27 November 2026: neither count is exact. A document's first occurrence is stored as 1 or 2 depending on insertion order, and removal does not fully restore node rank; see [Verification, Prediction and the Length Confound in Retrieval Scores](/posts/verification-prediction-length-confound/).)
- **Recomputable scores.** `query_graph` adds `node.rank + edge.rank + document count` for every document reached from a matched concept and sorts by the integer total.
- **Bounded fallback.** When the automaton matches nothing, a TF-IDF index over concept descriptions may supply concepts above a 0.3 relevance threshold.
- **Paths as a predicate.** `is_all_terms_connected_by_path` searches for a walk connecting all matched concepts, over an undirected view of the directed edges, and returns only true or false.

The scoring path has no training step, and the supplied thesaurus makes the concept vocabulary inspectable; adding a concept is a text edit. Human authorship, review and change control of that thesaurus are governance requirements, not properties the cited implementation enforces: it accepts Markdown or JSON inputs and exposes an unrestricted `Thesaurus::insert`. Its weaknesses mirror FIG-MAC's strengths. The adjacency edges that `query_graph` ranks over carry no general-purpose relation type. Terraphim's optional `medical` feature does provide a `MedicalRoleGraph` with typed, directed edges (`IsA`, `Treats`, `Causes`, `Contraindicates` and others) loaded from curated sources such as PrimeKG and SNOMED CT, but those types are domain-specific and sit outside the generic query path. Two documents that express the same idea in different words remain unconnected until the thesaurus records the synonym. The path that would explain a multi-concept match is computed and discarded.

## What the evidence supports

FIG-MAC's ablation (Table 5 of the paper) compares no external knowledge, graph-only, vector-only and hybrid retrieval across three backbones and two architectures. Graph-only exceeded vector-only on raw novelty and on source diversity in all six configurations, and on provenance-adjusted novelty in five of six. Hybrid retrieval exceeded both everywhere.

Four limits govern how far this generalises.

- **The task is hypothesis generation.** The metrics reward distance from prior work and diversity among sources. They are not retrieval precision or recall.
- **The diversity metric is partly mechanical.** Source diversity averages the dissimilarity among retrieved sources. Traversal across cross-domain edges retrieves dissimilar sources by construction.
- **The judge is the generator.** Qwen-Max produces the primary hypotheses and also scores them. The human study (200 assessments of 100 questions) reports no per-method breakdown.
- **There is no variance or cost data and no release.** No repeated runs, runtime or token figures are reported, and no code or data has been published.

The defensible reading is that typed traversal contributes something dense neighbours do not, for a task that values breadth. That supports adding typed relationships to a graph layer. It does not establish that learned relationships are safe to act on.

## A layering that keeps provenance visible

The proposal is to treat provenance as a property of every edge and to let it constrain use. Each layer below either exists today or is proposed, as marked.

{% <mermaid> %}
flowchart TB
    T[Declared vocabulary: thesaurus and automaton. Exists] --> C[Counted adjacency: role graph. Exists]
    D[Declared typed relations: governed role templates. Proposed] --> P
    C --> P[Path evidence: walk with per-edge provenance class. Proposed]
    I[Inferred candidate relations: model, version, confidence. Proposed, quarantined] -.-> R
    V[Dense recall supplement: tagged neighbours. Optional] -.-> R
    P --> R[Retrieval result for the agent]
    P --> K[Checklist and authority checks: declared and counted edges only]
{% </mermaid> %}

*Figure 1. Provenance-classed layers. Dotted lines may widen recall but cannot satisfy a check.*

**Declared vocabulary and counted adjacency.** These are the existing Terraphim layers. They supply concept resolution and association evidence with recomputable scores.

**Declared typed relations.** A relationship such as `refines`, `precedes` or `contradicts` is written by a role owner in the same reviewed form as synonyms and promoted under the same change control. This is the typed layer the roles paper proposed. Its type is a claim a person made, so it can be audited like any other governed statement. Relations imported from a curated external ontology, as the medical graph does from PrimeKG and SNOMED CT, belong in this class too, with the source and release recorded.

**Inferred candidate relations.** A model may propose edges such as FIG-MAC's `inspired`. Each inferred edge records the model, its version, the input it saw and its confidence. Inferred edges are stored apart from declared and counted edges. They may extend a retrieval result, and they are labelled as inferred when they do. They are never evidence for a checklist item or an authority decision until a reviewer promotes them to the declared layer.

**Dense recall supplement.** Vector neighbours can fill gaps that the thesaurus has not yet covered, which is the role FIG-MAC's ablation suggests for them. Results obtained this way are tagged, so a reader can distinguish "matched a governed concept" from "was near the query".

**Path evidence as the output contract.** Instead of a boolean, the graph returns the walk it found, with the node, edge, count and provenance class of each step. An agent can cite the path, and a reviewer can check that every step used to satisfy a check is declared or counted.

**Evaluation.** Any claim that a new layer improves results should use a judge independent of the generator, report spread across repeated runs, and measure provenance directly: similarity of the answer to its sources, and diversity among them. FIG-MAC's provenance factor is a usable starting point, with the caveat above that diversity partly reflects the retrieval mechanism.

## Implementation boundary

Today Terraphim provides the declared vocabulary, the counted adjacency graph, the TF-IDF fallback and the boolean path check. Behind the optional `medical` feature it also provides domain-specific typed edges, loaders for PrimeKG and SNOMED CT, and symbolic embeddings that compute Jaccard similarity over IS-A ancestor and descendant sets; none of these is part of the generic query path. General-purpose relation types that any role can declare, provenance-classed edge storage, a quarantined inferred-edge store, path return with provenance classes and the evaluation harness are proposed. No benchmark comparing these layers is claimed here, and none of FIG-MAC's results were reproduced.

## Conclusion

FIG-MAC and Terraphim's role graph illustrate two coherent positions. A learned, typed graph connects ideas that share no vocabulary and returns chains that read as arguments, at the cost of relationships nobody can recompute. A declared, counted graph gives every score an audit trail, at the cost of untyped edges and recall that depends on the thesaurus. A reference architecture need not choose between them if it records how each edge was obtained and limits what each class may justify. Declared and counted edges can support checks and authority decisions. Inferred edges and vector neighbours can widen what an agent sees, provided they are labelled and cannot be mistaken for evidence.

## Sources and scope

FIG-MAC: Chen, Gao, Huang, Zhou, Su, Wang and Sha, [arXiv:2611.33563v1](https://arxiv.org/abs/2611.33563), submitted 25 November 2026 and read on 27 November from the v1 PDF. Figures quoted are from its sections 3 and 4 and Tables 2 to 5; the interpretation of its limits is this paper's.

Terraphim details were checked against `crates/terraphim_rolegraph` and `crates/terraphim_types` in terraphim-core at commit 84a496a on 27 November 2026. The layering, provenance classes and evaluation requirements are proposed integration work and do not describe a deployed system.
