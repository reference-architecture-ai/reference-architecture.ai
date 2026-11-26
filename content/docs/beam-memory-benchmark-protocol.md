+++
title = "Measuring Agent Memory on BEAM: a Pre-Registered Protocol"
description = "How we will compare Terraphim's retrieval with past.dev on the BEAM long-conversation memory benchmark: paired per question against published records, with the answer model and judge held fixed. Published before any reported split is run."
date = 2026-11-08

[taxonomies]
categories = ["Evaluation"]
tags = ["benchmarks", "memory", "beam", "evaluation", "terraphim", "retrieval"]

[extra]
toc = true
+++

## Status

This page is a protocol, not a result. No reported split has been run. It is published first so that the method cannot drift towards the numbers. Results will appear in a separate post that links back here, and any change to this protocol after publication will be listed on that post with its reason.

## Why a paired comparison, and only that

Memory benchmarks for agents usually measure three things at once: the memory, the model that answers from it, and the model that grades the answer. A single "memory score" cannot tell them apart. Swap the answer model and the score moves; swap the judge and it moves again.

[past.dev](https://past.dev/benchmarks) publishes its harness for [BEAM](https://arxiv.org/abs/2510.27246), a long-conversation memory benchmark, at [pastdotdev/benchmarks](https://github.com/pastdotdev/benchmarks). Two properties make a fair comparison possible:

- **The answer model, judge and prompts are fixed.** ExaBase's published answer and judge prompts, unchanged; `openai/gpt-5.6-luna` with reasoning off answers and judges; each recall returns at most 100 results within 8,000 tokens, as of the moment the question is asked.
- **Every question's record is published.** Each record holds the recall payload, the answer, the judge's verdicts and the score.

So one component, the retrieval substrate, can be replaced while everything else stays the same, and the outcome compared **question by question** against the 2,000 published records. That is a paired test. It is not a leaderboard entry, and we will not publish a standalone score for any system.

This fits the [Memory Infrastructure](@/docs/patterns.md#memory-infrastructure) job in the twelve patterns: a memory layer is only as good as what it puts in front of the model at the moment of the question, and that can be measured without asking a model's opinion.

## What is held fixed

Pinned at harness commit `a712cd9` (2026-10-20), the latest at the time of writing:

| Split | Conversations | Questions | With evidence turn ids |
|---|---|---|---|
| 100K | 20 | 400 | 355 |
| 500K | 35 | 700 | 629 |
| 1M | 35 | 700 | 625 |
| 10M | 10 | 200 | 176 |

The 100K, 500K and 1M splits use BEAM dataset revision `3205395e`; the 10M split uses `9b209619`. Abstention questions (200 in all) have no evidence turns by design: they test whether the system declines to answer. A further 15 questions carry no evidence turn ids in the dataset (twelve in summarisation, two in preference following, one in knowledge update). They are excluded from Tier 1 and kept in Tier 2.

Every recall row past.dev published cites exactly one source turn, and in every split its payload is close to full: the median is about 7,990 of the 8,000 evidence tokens.

## What is being compared

The subject is Terraphim's retrieval as it ships, through its two command-line front ends, with no language model anywhere on the retrieval path:

| Arm | Substrate |
|---|---|
| P | past.dev, from its published records (not rerun) |
| R | plain `ripgrep` over the same turns, as a baseline |
| G | `terraphim-grep`, search only, no network, no thesaurus |
| G-KG | G with the knowledge-graph thesaurus: synonym expansion and concept boost, text matching kept |
| A-BM25 | `terraphim-agent` search, `BM25Plus` relevance, no thesaurus |
| A-Title | the same role, `TitleScorer` relevance |
| A-KG | the same role, `TerraphimGraph` relevance with a knowledge-graph thesaurus |
| A-KG-X | A-KG, with the query also expanded through the thesaurus |
| A-MEM | `terraphim-agent memory retrieve`, the agent-memory feature, with each turn stored as one memory item and the A-KG thesaurus |

A-BM25 against A-KG is the knowledge-graph ablation: same turns, same frozen query text, same settings; only the ranking and its thesaurus change. A-KG against A-KG-X then measures query expansion on its own.

G against G-KG measures the same thing inside `terraphim-grep`. There the thesaurus expands the query through synonyms and boosts matching results, but text matching still applies, so a question that names no concept can still find turns.

A-MEM measures Terraphim's agent memory as it ships. It ranks memory items by their knowledge-graph concepts, with no text-search fallback: a query that names no thesaurus concept returns nothing, and an item is only reachable if it matches at least two concepts. On its own benchmark of 56 stored learnings it reached a recall at 5 of 0.04, for exactly that reason. Expect low numbers here too. They will be published as they are, with the share of questions that named no concept.

## How the substrate is swapped

The harness talks to past.dev over HTTP. We run a small local server that implements the same eight endpoints and point the harness at it by URL. **The harness code runs unmodified; the only deviation from past.dev's run is that URL.**

The local server writes each ingested turn to its own file, runs the arm's search, discards any turn later than the question's moment, and fills the payload by rank to 100 results and 8,000 tokens. It returns only fields it can fill truthfully: rank, timestamp, the raw turn text, and its source turn id. It omits past.dev's derived-memory fields, because we do not produce derived memories. The answer model reads the payload as returned, so this difference is part of what is measured, and is stated beside every result.

An item's rank in A-MEM depends on everything else in the store, so discarding later turns after retrieval would still let them shape the ranking. For A-MEM the store is rebuilt for each question from the turns at or before its moment.

Tokens are counted with `tiktoken` `o200k_base`. past.dev counts server-side and does not document its method, so this is a known deviation.

## Two tiers

**Tier 1, no model calls.** For each question with evidence turns, the fraction of those turns cited anywhere in the payload the answer model would receive. We call this **recall within budget**. past.dev's figure is computed from its published records; ours from the local server. It costs nothing to run and needs no judge.

**Tier 2, the full benchmark.** The unmodified harness answers and judges every question through the local server. Each question's score is paired with past.dev's published score for the same question. Tier 2 is pay-per-use, and runs only after Tier 1 and a budget decision.

Three controls make Tier 2 interpretable:

- **Replay.** past.dev's own published payloads, fed back through the harness. The difference from the published scores is the answer and judge noise floor. A Terraphim difference no larger than this is reported as indistinguishable from noise.
- **Empty.** No recall at all: what the answer model scores from the question alone.
- **Oracle.** Only the gold evidence turns, within the same budget: the ceiling for a system that returns raw turns.

## What we have already seen

A pre-registration is only honest if it says what the authors looked at first. Before writing this page we read the 188 turns, 20 questions and evidence ids of 100K conversation 1, the first published 100K record, and aggregate counts over all four splits. Those counts covered structure and numbers, not question or turn text.

Two findings from that conversation shaped the protocol:

- past.dev's recall rows map back to BEAM's own turn ids through their source ids, and that mapping agrees with an exact timestamp match on all 664 rows. So past.dev's evidence recall can be computed from public data.
- `terraphim-grep` returns nothing for verbatim questions, while keyword queries reach the evidence. Query formulation is therefore part of the system under test, and it has to be fixed before the reported splits are seen.

## Development and held-out splits

- **100K is the development split.** The query protocol, the thesaurus, search flags and any over-fetch for time filtering are chosen on it. 100K results are reported, labelled as in-sample.
- **500K, 1M and 10M are held out.** No person or agent reads their question or turn text before the configuration is frozen. Automated checks that print counts only are allowed.
- **The thesaurus** for A-KG is built deterministically from 100K turns or from generic concepts, never from a held-out split, and its hash is frozen.
- **Candidate query protocols:** the verbatim question, and the question with punctuation and a fixed English stopword list removed, searched as OR terms. `terraphim-grep` matches a multi-word query as a phrase and has no OR mode, so for it the local server runs one search per term and adds up each turn's best score across terms. For R, G and G-KG, the best protocol on 100K is frozen; G and G-KG share it. Ties between equal scores are broken by a rule (conversation order, or most recent first) that is also chosen on 100K and frozen. The `terraphim-agent` arms (A-BM25, A-Title, A-KG, A-MEM) share one protocol, the one A-BM25 scores best with on 100K, so the ablation changes one thing at a time. A-KG-X adds thesaurus expansion to that shared protocol.
- **Freeze.** Before any held-out run, one committed configuration records the harness pin, dataset revisions, binary versions, role configurations, thesaurus hash, query protocol per arm, tokeniser, and the commit of this page.

This avoids a trap past.dev itself disclosed for its DolphinBench run: the setup there was chosen on the same tests it reported.

## Metrics and decisions, declared now

- **Tier 1 primary:** recall within budget, mean per split and per category, over the 1,785 questions with evidence turns.
- **Tier 1 secondary:** recall at 1, 5 and 10 distinct turns; mean reciprocal rank of the first evidence turn.
- **Countermetrics:** payload tokens and result count (an arm that returns little scores low for its own reasons), recall latency at p50 and p95, and ingestion time.
- **Uncertainty:** 95 percent bootstrap intervals resampling conversations, not questions, because 20 questions share a conversation.
- **Tier 2 primary:** the paired mean score difference against past.dev per split, with the same clustered interval, read against the replay control. Secondary: McNemar's test on full-score answers.

Decisions fixed in advance:

1. If past.dev's records map to BEAM turns for fewer than 99 percent of rows on any split, past.dev is dropped from Tier 1 for that split and the shortfall is reported.
2. If A-KG does not beat A-BM25 on held-out recall within budget, with an interval excluding zero, we report no measurable knowledge-graph gain on BEAM and make no claim of one. The same rule applies to G-KG against G, reported separately.
3. A-MEM's held-out recall within budget, and its recall at 5 (what the memory hook would inject), are reported beside A-KG and past.dev, whatever they are.
4. If no Terraphim arm beats the `ripgrep` baseline on held-out splits, that is the headline.
5. No composite score and no standalone "Terraphim BEAM score", in any tier.
6. One reported pass per arm. Any rerun is reported separately, with its pass count.

## Attribution and licence

BEAM is from "Beyond a Million Tokens: Benchmarking and Enhancing Long-Term Memory in LLMs" by Mohammad Tavakoli, Alireza Salemi, Carrie Ye, Mohamed Abdalla, Hamed Zamani and J Ross Mitchell ([arXiv:2510.27246](https://arxiv.org/abs/2510.27246)). The dataset ([Mohammadta/BEAM](https://huggingface.co/datasets/Mohammadta/BEAM) and [Mohammadta/BEAM-10M](https://huggingface.co/datasets/Mohammadta/BEAM-10M)) is published under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The harness is Past Corp's, under the MIT licence. The answer and judge prompts are ExaBase's, from its [published BEAM adapter](https://fabric.so/p/beam-3VjBcqEVRofZyA5CeazeX); they are excluded from Past Corp's licence, keep their own terms, and are used from the pinned harness, never copied. The BEAM split, question and payload counts on this page come from past.dev's published results files and the pinned dataset revisions. The A-MEM figures (56 stored items, recall at 5 of 0.04) come from Terraphim's own committed memory benchmark, `docs/memory-benchmark.md` in terraphim-clients, recorded on terraphim-agent 1.21.14. This page is CC BY-SA 4.0, like the rest of this site, and republishes no question or conversation text.
