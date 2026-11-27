+++
title = "Measuring Agent Memory on BEAM: a Pre-Registered Protocol"
description = "How we will compare Terraphim's retrieval with past.dev and with Cognee on the BEAM long-conversation memory benchmark: paired per question against published records, with the answer model and judge held fixed inside each harness. Published before any reported split is run."
date = 2026-11-08

[taxonomies]
categories = ["Evaluation"]
tags = ["benchmarks", "memory", "beam", "evaluation", "terraphim", "retrieval"]

[extra]
toc = true
+++

## Status

This page is a protocol, not a result. No reported split has been run. It is published first so that the method cannot drift towards the numbers. Results will appear in a separate post that links back here, and any change to this protocol after publication will be listed on that post with its reason.

**Changes since first publication.** Each change is made before the configuration is frozen and before any reported split is run:

- **2026-11-27: external baseline M (MGMem) added.** Reason: decision 2 compares Terraphim's knowledge graph with Terraphim's own BM25, so a "no measurable gain" result could not tell a weak graph from a weak vocabulary. M is a published graph memory with no language model in it, whose vocabulary comes from the conversation itself. It gives that decision an outside reference point. It adds a Tier 1 arm and one reporting rule (decision 7). No existing arm, metric or decision changes.

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

One external baseline, added on 2026-11-27, is not a Terraphim arm:

| Arm | Substrate |
|---|---|
| M | [MGMem](https://arxiv.org/abs/2611.33174), the authors' released code at commit `67c53a28`, with the paper's default settings and a single extraction worker. Tier 1 only |

MGMem builds a graph of the words and phrases ("mentions") that a parser finds in each stretch of conversation. It links two mentions when they appear in the same stretch, and links each mention to the stretches that contain it. A small sentence-embedding model bridges near-synonyms at query time. It returns the raw dialogue, and calls no generative model anywhere. Against A-KG it is the nearest outside design: the same kind of co-occurrence graph, but with a vocabulary taken from the conversation instead of a curated thesaurus. M is a baseline like R. It does not count as a Terraphim arm in decision 4.

## How the substrate is swapped

The harness talks to past.dev over HTTP. We run a small local server that implements the same eight endpoints and point the harness at it by URL. **The harness code runs unmodified; the only deviation from past.dev's run is that URL.**

The local server writes each ingested turn to its own file, runs the arm's search, discards any turn later than the question's moment, and fills the payload by rank to 100 results and 8,000 tokens. It returns only fields it can fill truthfully: rank, timestamp, the raw turn text, and its source turn id. It omits past.dev's derived-memory fields, because we do not produce derived memories. The answer model reads the payload as returned, so this difference is part of what is measured, and is stated beside every result.

An item's rank in A-MEM depends on everything else in the store, so discarding later turns after retrieval would still let them shape the ranking. For A-MEM the store is rebuilt for each question from the turns at or before its moment.

M has the same property, and more of it: its term weights, links and stretches are all computed over the whole conversation. So M's index is also rebuilt for each question from the turns at or before its moment. The rules for M:

- **Turn ids.** Each turn keeps its BEAM turn id inside MGMem, so a returned stretch maps to its turns exactly.
- **Payload.** The payload is filled by MGMem's score order, a stretch at a time, with each stretch's turns in conversation order, up to the same 100 results and 8,000 tokens.
- **Query.** M receives the verbatim question and uses MGMem's own question parser. It takes no part in the query-protocol choice, and nothing in M is tuned on 100K.
- **Parser caching.** Parser output may be cached per turn between rebuilds, but only if the rebuilt index is identical to a fresh build (see below).
- **Determinism.** The released build script's default runs eight extraction threads over one shared parser. On one 100K conversation, two default builds produced different indexes, and two single-thread builds were identical. M therefore runs single-threaded. Each build's content hash is recorded, and two fresh builds of one conversation must match before any reported run.
- **Code.** MGMem's repository carries no licence. It is run from a pinned clone outside our repositories, and none of its code is copied or redistributed.

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

For M, on 2026-11-27 we built MGMem's index four times on the same already-seen 100K conversation, with no model calls and no question answered. We recorded build time, memory, index size, graph counts and content hashes, and parsed its 20 questions to count how many found a subject in the index. No recall was computed.

## Development and held-out splits

- **100K is the development split.** The query protocol, the thesaurus, search flags and any over-fetch for time filtering are chosen on it. 100K results are reported, labelled as in-sample.
- **500K, 1M and 10M are held out.** No person or agent reads their question or turn text before the configuration is frozen. Automated checks that print counts only are allowed.
- **The thesaurus** for A-KG is built deterministically from 100K turns or from generic concepts, never from a held-out split, and its hash is frozen. M's vocabulary comes from the conversation it indexes, held-out splits included. That is ingestion, the same as any arm reading the turns, not a thesaurus. It never feeds A-KG or any other arm.
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
7. M's held-out recall within budget is reported beside A-KG, A-BM25 and `ripgrep`. The paired difference A-KG minus M is reported with the same clustered interval:
   - If M beats A-KG with an interval excluding zero, we report that a vocabulary taken from the conversation outperformed our curated thesaurus on BEAM.
   - If A-KG beats M the same way, we report the reverse.
   - Otherwise we report no measurable difference.
   - M runs on the 10M split only if one full single-thread build of one 10M conversation, run before the freeze with counts only printed, finishes within 12 hours on one machine. Otherwise M is reported as not run on 10M, with the measured time.

## A second harness: Cognee's

Added on 2026-11-26, before any run under either harness.

[Cognee](https://github.com/topoteretes/cognee) has published a [BEAM report](https://github.com/topoteretes/cognee/blob/1961133d0c68b450fe8e71941a756371e94f7c04/cognee/eval_framework/beam/REPORT.md), marked preliminary. It covers one 100K conversation of 20 questions, run 4 times, with a mean rubric score of 0.79. It also covers one 10M conversation, with a retriever chosen on the same 20 questions it reports, which the report calls exploratory. We pin Cognee at commit `1961133d`. As with past.dev, every question's record is published: the retrieved context, the answer, the rubric criteria, the question's aggregate score and a summary of the judging. Cognee's judge scores each criterion separately, but the records do not keep the individual verdicts, so pairing is per question, not per criterion. That is enough for the same paired design. The two harnesses use different answer models, judges and prompts, so **numbers from one harness are never compared with numbers from the other**.

**What is held fixed.** Cognee's harness code, its per-question-type answer prompts, and `openai/gpt-5` as both answer model and judge. The judge scores each rubric criterion separately. The 20 questions are those of BEAM 100K conversation 2, which is row 1 of dataset revision `3205395e`; all 20 question texts match Cognee's records. Each arm runs 4 times, as Cognee's did.

**How the substrate is swapped.** Cognee's harness builds each retriever from a registry, asks it for a context string, and then answers through the retriever's own completion method. We register one retriever per arm at runtime. It subclasses Cognee's hybrid retriever, replaces only the two methods that produce the context, and keeps Cognee's completion path. **Cognee's harness files run unmodified.** Before any paid call, a test on real files checks two things: each arm's context reaches the completion step unchanged, and the replayed context equals the published one byte for byte.

**Arms.**

| Arm | Context the answer model receives |
|---|---|
| Replay | Cognee's published context for that question and run, byte for byte |
| Empty | none: the floor |
| Full | the whole conversation, 200 turns and about 115,000 tokens, which fits in the answer model's window: a full-context control, not a guaranteed ceiling, since irrelevant turns can lower a score |
| R, G, G-KG, A-MEM | the arms above, with their configurations frozen as above |

Replay is the pair for every other arm. Cognee's records date from July 2026 or earlier, and the model behind today's route may answer and judge differently. So each Terraphim arm is compared with a fresh replay, not with Cognee's published scores. To make that replay run alongside every arm, the runs are interleaved. Each of the 4 runs is one block, and in each block every question is answered and judged under all seven arms, in an order shuffled with a fixed seed. The wrapper drives this schedule itself, calling Cognee's functions one run of one arm at a time, rather than letting the harness finish all runs of one arm before the next. It records the run index, the arm order and timestamps, and a test with no model calls checks that the observed call order matches the frozen schedule. Route drift during the run then falls on all arms alike. The model route is pinned to one provider, with fallback off, and recorded. The drift and noise floor is the absolute difference between two overall means: the mean of the 4 fresh replay runs and the mean of Cognee's 4 published runs, over the same 20 questions.

**Equal budget.** Cognee's contexts are hybrid. Each has a passages section, where every passage holds an LLM-written summary and the raw stored chunk, followed by sections of LLM-derived entities and facts. They run from 13,643 to about 29,800 tokens per question (median about 21,700), with no stated cap. Each Terraphim arm fills its context by rank up to the token count of Cognee's run-0 context for that question (the published runs differ slightly from each other), so the comparison is about what is retrieved, not how much. Our arms return raw turns only. That difference in what the payload holds is part of the substrate and stays in; the Full arm bounds it.

**A judge-free tier only if the mapping holds.** Cognee's contexts carry no BEAM turn ids. Its raw passages can still be matched to turns by text. In the first published run, no raw passage lies inside a single BEAM turn. Of the 400, 188 contain exactly one whole turn, 13 contain two whole turns, and 199 contain none, for reasons not yet found. So a raw passage is a chunk that can span several turns, not a copy of one. Before any paid call, a deterministic mapping assigns each raw passage the set of BEAM turns it contains whole. A gold turn counts as retrieved only if it is in that set. If such a set can be assigned for at least 99 percent of raw passages, we add a judge-free tier: recall of the gold evidence turns within Cognee's context, against each Terraphim arm's recall within the same per-question budget. Turns found only through multi-turn passages are reported as a separate count. If the mapping falls short, there is no judge-free tier for Cognee, and the shortfall is reported.

**What this harness cannot give.** Every answer-and-judge comparison here is paid, and it runs only after a budget decision. With 20 questions from one conversation, the interval comes from resampling questions, not conversations. With two questions per category, category results are descriptive only. Cognee's ingestion is not rerun; we replay what it retrieved.

**Decisions fixed in advance:**

1. An arm's difference from Replay, better or worse, is reported as real only if its paired bootstrap interval excludes zero and its absolute size is larger than the floor. Otherwise it is reported as indistinguishable on these 20 questions.
2. Every arm is shown between Empty and Full. If Full matches or beats Replay, the headline says that at 100K, when the whole conversation fits in its window, this answer model does not need selective retrieval, so the comparison measures selection under a fixed budget.
3. No standalone score, no composite, and no ranking across the two harnesses.
4. The 10M conversation in Cognee's report is in this protocol's held-out set, so no work on it happens before the freeze.

**In-sample for us, held out for Cognee.** Cognee held 100K conversation 2 out of its own tuning. Our arms are tuned on the whole 100K development split, conversation 2 included, as declared above. Every number from this harness is therefore labelled "in-sample for Terraphim, held out for Cognee". That asymmetry favours Terraphim, and it is stated beside every result. It does not change any decision rule.

**Already seen.** For this harness we read the structure of Cognee's published 100K records and the opening of one context (conversation 2, an abstention question). We computed counts, token sizes and per-run means. The records keep only each question's score and a count summary of verdicts, so judge failures in Cognee's runs cannot be recovered from them. For our runs, the wrapper attaches its own log handler to the rubric metric's logger, which warns on every failed judge call, so judge failures are counted per arm. The harness's quiet log level does not hide them. We matched question texts by set intersection, and raw passages against conversation turns by verbatim containment, printing counts only. From the 10M side we saw only Cognee's published aggregate scores and a total context length.

## Attribution and licence

BEAM is from "Beyond a Million Tokens: Benchmarking and Enhancing Long-Term Memory in LLMs" by Mohammad Tavakoli, Alireza Salemi, Carrie Ye, Mohamed Abdalla, Hamed Zamani and J Ross Mitchell ([arXiv:2510.27246](https://arxiv.org/abs/2510.27246)). The dataset ([Mohammadta/BEAM](https://huggingface.co/datasets/Mohammadta/BEAM) and [Mohammadta/BEAM-10M](https://huggingface.co/datasets/Mohammadta/BEAM-10M)) is published under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The harness is Past Corp's, under the MIT licence. The answer and judge prompts are ExaBase's, from its [published BEAM adapter](https://fabric.so/p/beam-3VjBcqEVRofZyA5CeazeX); they are excluded from Past Corp's licence, keep their own terms, and are used from the pinned harness, never copied. The BEAM split, question and payload counts on this page come from past.dev's published results files and the pinned dataset revisions. The A-MEM figures (56 stored items, recall at 5 of 0.04) come from Terraphim's own committed memory benchmark, `docs/memory-benchmark.md` in terraphim-clients, recorded on terraphim-agent 1.21.14. Cognee's harness, report and per-question records come from the `topoteretes/cognee` repository under the Apache 2.0 licence, and its records carry BEAM material under CC BY-SA 4.0. Cognee's prompts are used from the pinned checkout, not copied. The Cognee figures on this page (0.79, 20 questions, 4 runs, the context token range) come from its published report and records at `1961133d`, re-read on 2026-11-26. MGMem is from "MGMem: An Efficient, Deterministic, and Provenance-Preserving Framework for Long-Horizon Agent Memory" by Junhong Huang, Xin Tong and Jun Xia ([arXiv:2611.33174](https://arxiv.org/abs/2611.33174)), with code at [junhong-h/MGMem](https://github.com/junhong-h/MGMem). The repository states no licence, so it is run from a pinned clone and not redistributed. The MGMem facts on this page (the default of eight extraction threads, run-to-run index differences at that default, identical single-thread builds) come from our own builds at `67c53a28` on 2026-11-27. This page is CC BY-SA 4.0, like the rest of this site, and republishes no question or conversation text.
