+++
title = "Verification, Prediction and the Length Confound in Retrieval Scores"
description = "What a study of propositional decomposition (arXiv:2611.33668) implies for agent retrieval: occurrence, support and ranking are different questions, and any count-based score must be tested with length controlled."
date = 2026-11-27

[taxonomies]
categories = ["Architecture"]
tags = ["evaluation", "retrieval", "grounding", "knowledge-graphs", "terraphim", "ai-agents"]

[extra]
archived = false
mermaid = true
+++

## Abstract

A retrieval layer for agents is asked three different questions: whether a declared item occurs in a text, whether a text supports a claim, and how relevant a text is to a query. Li, Wu and Cui (arXiv:2611.33668) study a related pair of questions about proposition decomposition. They find that a learned entailment judge verifies membership accurately, that embedding geometry does not, and that symbolic counters which appear to predict proposition counts carry no information once sentence length is controlled. This paper draws two architectural consequences. First, occurrence, support and ranking should be separate components with separate evidence, because a positive answer to one says nothing about the others. Second, any count-based ranking score should be accepted only on an evaluation that controls for document length, using the paper's three lenses. Applying that reasoning to Terraphim's role graph shows a length-coupled term in its score and exposed two counting defects, now filed. No ranking evaluation is reported here; the measurement is specified, not run.

<span id="continue-reading"></span>

## The study

The paper uses PropSegmEnt, English Wikipedia sentences each segmented into propositions by three annotators, with a test split of 539 sentences. It asks two questions.

**Verification.** Given sentence *s* and candidate proposition *p*, does *p* belong to *s*? An mDeBERTa-v3 model fine-tuned on natural language inference scores the entailment probability, with a threshold of 0.5. Accuracy is 92.8% (95% CI 92.0 to 93.5), AUC 0.977, and positive recall 98.1%, on 2,411 positives and 2,156 negatives. The false-positive rate is 16.0% on hard negatives (from the same document) and 10.5% on easy ones. Most false positives are "context-true": definitional statements entailed once document context resolves a pronoun, but not entailed by the sentence alone. Geometric alternatives fail. Raw cosine similarity saturates at 0.68 to 0.71 for members and non-members alike, and a sentence embedding is not a linear combination of its propositions' embeddings.

**Prediction.** Given *s* alone, how many propositions should it yield? Proposition count correlates with token length at ρ = 0.749, so the paper evaluates every predictor through three lenses:

1. raw Spearman correlation with the reference count;
2. length-partialled correlation, the correlation of rank residuals after regressing both prediction and reference on token count;
3. accuracy on the 2,341 test pairs that have equal token count and different reference counts, where chance is 0.5.

Token count reaches a raw ρ of 0.810, then −0.042 [−0.070, 0.068] partialled, and is undefined on equal-length pairs. CPIDR, an idea-density counter, scores 0.659, then −0.179, then 0.416, which is significantly below chance. A Neo-Davidsonian predicate counter scores 0.570, then −0.064, then 0.483. A ridge probe on frozen sentence embeddings keeps a partialled ρ of 0.40 to 0.49 and a pair accuracy of 0.67 to 0.71 across three encoders. That signal survives INT4 quantisation and truncation to 256 dimensions.

The authors also retract a 48-sentence pilot. With far fewer samples than dimensions, and with whitening fitted on the evaluation sentences, leave-one-out ridge memorised the held-out labels and produced plausible numbers that the formal protocol reversed.

## Three questions, three components

The study separates questions that retrieval systems often merge. For agent retrieval there are three.

| Question | Answered by | Evidence it produces |
|---|---|---|
| Does declared item *x* occur in text *t*? | An automaton over a governed vocabulary | The matched span and the thesaurus entry |
| Does text *t* support claim *c*? | An entailment judge | A score, a threshold and the judge's model version |
| How relevant is *t* to query *q*? | A ranking function | A score with a declared evaluation |

Each answer is silent on the others. An occurrence match does not show support, because a document can name a concept while contradicting the claim. A high similarity score does not show support either, which is the paper's verification result. A support judgement does not rank. The architectural rule is that each consumer states which of the three questions it is asking, and accepts only the matching evidence.

{% <mermaid> %}
flowchart LR
    Q[Agent request] --> O[Occurrence: automaton over thesaurus]
    Q --> R[Ranking: graph or lexical score]
    R --> S[Support: entailment judge per claim]
    O --> C[Checklist and authority checks]
    S --> G[Grounded answer with cited support]
    R -.-> G
{% </mermaid> %}

*Figure 1. Occurrence feeds checks. Ranking selects candidates. Only the support judge licenses a grounded claim. The dotted line means ranking may order evidence but cannot stand in for it.*

The cost profile follows the paper's own recommendation. The judge needs one judgement per proposition, which is accurate but pairwise. So a cheap stage should route claims to it rather than replace it. Context-true false positives should be reported as their own class, because the paper shows they concentrate in definitional statements whose subject is resolved from surrounding text.

## The length confound in count-based ranking

A ranking score built from counts can win a raw correlation through length alone. The study's token-count row is the clean example. Terraphim's role graph, read at terraphim-core commit 84a496a, makes the risk concrete.

- Indexing links each consecutive pair of recognised concepts with a directed edge that stores a per-document count.
- `query_graph` adds `node.rank + edge.rank + count` once for every edge that touches a matched concept and appears in the document.
- `edge.rank` is initialised to 1 and never updated.

For a single-concept query, a document's score is therefore *k*·(node.rank + 1) plus the sum of its counts on those edges. Here *k* is the number of distinct edges between the concept and its neighbours in that document. node.rank is shared by all documents for that concept, so *k* leads the ordering, and *k* grows with the amount of text around each mention. In a scratch test, two documents that each mention the query concept once scored 5 and 11. The higher-scoring one simply had more neighbours.

That establishes a length-coupled term, not a length proxy. Whether the score carries relevance beyond length is an empirical question that needs relevance judgements.

The same test exposed two counting defects, filed as terraphim-core#120. First, a document's first occurrence of a pair is stored as 1 if that document created the edge and as 2 otherwise, so identical documents score differently by insertion order. Second, removal subtracts node rank once per edge while insertion adds it once per occurrence, so repeated pairs leave residue. Insertion-order effects have to be removed before any ranking change can be measured.

## An evaluation contract for ranking changes

The paper's protocol transfers directly. A ranking change to a count-based scorer is accepted only if its report includes the following.

1. **Three lenses against relevance labels.** Raw rank correlation, length-partialled rank correlation, and accuracy on same-length document pairs with different relevance. The length unit is declared in advance, either tokens or matched concepts.
2. **A length-only baseline.** Document length itself, scored on the same three lenses. A candidate that beats the baseline only on the raw lens is rejected.
3. **Train-only fitting.** Any normalisation, weighting or threshold is fitted on a split the test never sees. The retracted pilot is the reason.
4. **Intervals.** Bootstrap confidence intervals on each lens, with the number of queries and pairs stated.
5. **A pinned order.** Results are reproduced under at least two document insertion orders, until order independence is proven by test.

A two-variable correlation between score and length alone does not belong in such a report. Without relevance labels it cannot distinguish a proxy from a relevant signal that happens to scale with length.

## Implementation boundary

Today Terraphim provides the occurrence component (automaton and thesaurus) and count-based ranking (`terraphim-graph`, alongside BM25 variants and a title scorer). No support judge is part of the retrieval path, and the shared grounding contract is open work. The counting defects are filed and not yet fixed. The evaluation contract above is proposed. It has not been run on any Terraphim ranking, and none of the paper's results were reproduced.

## Limits of the source

The study uses one dataset in one domain and one annotation scheme, and releases no code. Two passages in v1 conflict with its tables. Section 6.2 attributes the ceiling comparison to the MiniLM probe (ρ 0.827), but the stated paired difference of +0.032 and MAE of 1.53 match the Qwen3 0.6B row (ρ 0.768). The Figure 3 caption says definitional negatives "drive 43% of the false positives", while Section 5.1 gives 43% as their false-positive rate, which is the reading consistent with the totals. Neither conflict affects the length-control finding for the symbolic counters.

## Conclusion

The study's lesson for retrieval is not that one representation wins. Different questions live in different places. Support needs an entailment judge, and similarity does not provide it. Counts can look predictive purely because longer texts produce bigger counts. A reference architecture should keep occurrence, support and ranking as separate components with separate evidence, and should accept a count-based ranking change only when it survives length control. Checking one count-based scorer against that standard has already found a length-coupled term and two defects. The measurement that would show whether the scorer carries relevance beyond length is specified here and still to be run.

## Sources and scope

Li, Wu and Cui, [arXiv:2611.33668v1](https://arxiv.org/abs/2611.33668), "Verifiable but Not Predictable: What Sentence Embeddings Know About Propositional Decomposition", submitted 25 November 2026, CC BY 4.0. Read on 27 November from the v1 PDF. Figures are quoted from Sections 3 to 7 and Tables 1 to 4. The recomputation of the Section 6.2 difference is this paper's.

Terraphim details were checked against `crates/terraphim_rolegraph` and `crates/terraphim_types` in terraphim-core at commit 84a496a on 27 November 2026, with a scratch test run in a clean worktree. The component separation and evaluation contract are proposals and do not describe a deployed system.
