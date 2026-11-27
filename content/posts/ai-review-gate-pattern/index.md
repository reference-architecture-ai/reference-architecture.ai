+++
title = "The AI Review Gate: What a Second Model Can and Cannot Stop"
description = "A reference pattern for putting a second model in front of merges, built on a paired study of 810 Claude 5.5 reviews of agent-written patches, most of them plausible but wrong. Pin the effort, type the verdict, make behavioural findings block, and keep the reviewer out of the role of correctness gate."
date = 2026-11-27

[taxonomies]
categories = ["Architecture"]
tags = ["ai-agents", "code-review", "llm-as-judge", "verification", "evaluation", "review-gates"]

[extra]
toc = true
mermaid = true
+++

## Abstract

Coding agents write patches faster than people can review them, so teams put a second model in front of the merge. A recent paired study by Shen, Zhang and Wang ([arXiv:2611.33639](https://arxiv.org/abs/2611.33639)) measured how well that works. Three Claude 5.5 models, each at three reasoning-effort levels, reviewed 90 agent-written Django patches that all pass the benchmark's own tests. Stronger tests, followed by a post hoc label review, judged 55 of them wrong. More effort helped, but no setting was a strong gate: the best of the nine accepted 45% of the wrong patches. In 111 of the 290 reviews that accepted a wrong patch, the reviewer had named the defect in its own feedback. This article turns those findings into a reference pattern for an AI review gate. It covers what the gate should be asked to do, which settings belong in its configuration, how its verdict should fail, and how to measure it on your own code before trusting it.

<span id="continue-reading"></span>

## The question a review gate has to answer

A review gate is worth its cost only if it rejects broken patches without rejecting good ones. That makes it a classifier, and a classifier has two error rates:

- **False success:** the share of wrong patches the gate accepts.
- **False alarm:** the share of correct patches the gate rejects.

For a merge gate the two are not equally costly. A rejected good patch costs a round trip. An accepted wrong patch costs whatever it breaks later. Any claim that a gate "works" needs both rates, measured on patches whose correctness is known independently of the gate.

That last condition is the hard part. Most teams have never measured their reviewer at all. The study below is useful because it did, carefully, and published the data.

## The evidence

### What was measured

- **Patches.** 90 agent-written patches to Django from SWE-bench Verified. Every one passes the Verified tests. The stronger SWE-ABS tests gave the original labels: 60 wrong ("plausible but wrong") and 30 correct. After the run, a rule-based label review changed 11 of them, giving the primary split of 55 wrong and 35 correct (see the limits below).
- **Reviewers.** Claude Opus 5.5, Sonnet 5.5 and Haiku 5.5, each run through Claude Code at `--effort` low, medium and high. Each patch was reviewed once per model and effort, giving 810 paired reviews.
- **Conditions.** The reviewer ran in a sealed container. It got the issue text and the repository with the patch as one commit, and it could read code, run commands and write tests. The scoring tests and the official fix were withheld.
- **Prompt.** One generic prompt. A patch fails only for an unmet requirement or a functional defect that matters.
- **Preregistration.** Only the Opus hypotheses were preregistered. The Sonnet and Haiku results are exploratory, and the paper marks them so throughout.

I recounted the headline cells from the authors' released per-review data, without using their code. The false-success and false-alarm counts, the paired discordant counts, the exact McNemar p values and the cost ratios all match the paper. The intervals and the coded analyses were not recomputed.

### What came out

| Model | Effort | Wrong patches accepted (of 55) | Correct patches rejected (of 35) | Mean cost per review |
|---|---|---|---|---|
| Opus 5.5 | low | 37 (67%) | 2 | $0.044 |
| Opus 5.5 | medium | 26 (47%) | 2 | $0.095 |
| Opus 5.5 | high | 25 (45%) | 2 | $0.120 |
| Sonnet 5.5 | low | 36 (65%) | 2 | $0.023 |
| Sonnet 5.5 | medium | 33 (60%) | 3 | $0.027 |
| Sonnet 5.5 | high | 27 (49%) | 3 | $0.047 |
| Haiku 5.5 | low | 43 (78%) | 2 | $0.002 |
| Haiku 5.5 | medium | 35 (64%) | 7 | $0.004 |
| Haiku 5.5 | high | 28 (51%) | 4 | $0.008 |

Source: the paper's Table 3, corrected labels.

Five results matter for architecture:

1. **Effort helps, and the useful level depends on the model.** For Opus, in the preregistered test, high caught 13 wrong patches that low missed, against 1 the other way. Medium was within the preregistered 15-point margin of high. For Sonnet and Haiku, medium was much cheaper than high but was not shown to be as good.
2. **No setting is a strong gate.** Every configuration accepted at least 45% of the wrong patches. False alarms stayed between 6% and 20%. The errors lean heavily towards letting wrong code through.
3. **Seen but passed.** In exploratory coding, 111 of the 290 acceptances of wrong patches named the tested defect in their feedback and passed the patch anyway. Detection was not the failure. The decision was.
4. **Shallow passes and malformed verdicts.** Every review that used no thinking tokens returned a pass. At low effort, Opus ran no test in 23 of 90 reviews. The two smaller models returned 15 malformed verdicts between them.
5. **Memory of the fix did not help.** This is exploratory and Opus only. Reviews flagged as drawing on memory of the upstream fix accepted 71% of the wrong patches, against 46% for the rest.

### How far the evidence reaches

The authors are explicit about the limits, and a pattern built on this study has to carry them:

- **The labels are not ground truth.** For 32 of the 55 wrong patches, a post hoc coder judged that the issue does not require what the failing test checks. Without those patches, no model shows a significant effect of effort. The labels were corrected after the verdicts were known, a risk the paper names.
- **One family, one repository, one prompt.** Three Claude 5.5 models reviewed one Python project. No other model family was tested.
- **Model coders.** The memory flags, the issue-requirement codes and the "named the defect" coding were all done by Claude 5.5 models, and no person checked them. The analysis and the draft were also written by Claude Opus 5.5. In the authors' words, agreement between two model coders "shows consistency, not accuracy".
- **Competing interest.** The first author develops Trust My Bot, the agent harness whose review gate motivated the study.

None of this weakens the architectural reading below. It does mean that no number in the table should be copied into another team's configuration.

## The reference pattern

{% <mermaid> %}
flowchart LR
    A[Author agent] --> P[Patch at head SHA]
    P --> T[Tests and CI: primary executable gate]
    P --> R[Reviewer: different model, pinned effort]
    R --> V{Typed verdict}
    V -->|pass| M[Merge decision]
    V -->|fail: behavioural finding| X[Back to author]
    V -->|malformed or undetermined| H[Escalate: fail closed]
    T -->|green| M
    T -->|red| X
    K[Known-answer set] -.->|calibrates| R
{% </mermaid> %}

The pattern has six parts. Each part answers one of the findings above.

### 1. The reviewer is not the correctness gate

If the strongest configuration in a careful study lets 45% of plausible-but-wrong patches through, the reviewer cannot be the component that correctness rests on. Nothing in this pattern guarantees correctness, tests included: every patch in the study passed the benchmark's tests, and many were still wrong. Tests and CI are the primary executable gate, and the merge decision requires them independently of the review. The paper reaches the same conclusion: such a gate "complements tests rather than replacing them".

What else the reviewer should be asked to do is a design choice, not a finding of the study. The study measured only verdicts against functional-correctness labels. It did not measure how well a model checks scope, documentation claims or structure. This pattern proposes giving the reviewer that work, because tests do not do it: checking that the change matches its stated scope, that claims in the description and documentation are supported, and that structure and boundaries are kept. That proposal needs its own calibration (part 6) before anyone relies on it. What the evidence does support is the negative: a brief that asks a model to certify correctness asks for something this study says it cannot reliably deliver.

### 2. The reviewer is a different model from the author

The authoring model's own review is never the review of record. The study did not test this directly: its reviewers judged patches written by many different agents, and it did not compare self-review with review by another model. The rule rests instead on a point the authors make about their own coders, that a coder from the same model family "may share the reviewer's blind spots". It is our inference that the same holds, with more force, for an author reviewing its own patch.

### 3. Effort is configuration: pin it, record it, sweep it

The useful effort level differed by model in the study, and vendor defaults differ by model too. A review command that does not state its effort level inherits whatever the tool's default is today. When the tool or model is upgraded, the gate's behaviour can change with no change in your repository.

- **Pin** the effort or thinking level in the command or configuration that runs the reviewer.
- **Record** the model identifier, the tool version and the effort level alongside every review, so that a later change is visible.
- **Sweep** the level on your own known-answer set (part 6) before treating any level as sufficient. The study's own advice, and the vendor's, is to set effort from a sweep on your own evaluations.

### 4. A finding that claims wrong behaviour blocks

"Seen but passed" is the most useful result in the study for gate design. A reviewer that writes down a real defect and then approves the patch has done the hard part and failed at the easy one.

Most review rubrics separate blocking findings from advisory ones, and they should. Reviewers that are rewarded for finding things will find things, so wording, scope and process belong in the advisory tier. The rule that closes the gap is narrow:

> A finding that claims the code behaves incorrectly is blocking, unless the reviewer explicitly argues why it does not matter.

This keeps advisory findings cheap without letting a behavioural claim fall into the advisory tier by default. It also produces an auditable record: every behavioural finding that did not block comes with its reason.

### 5. The verdict is typed, and it fails closed

The verdict has three outcomes:

- **pass**;
- **fail**, with findings;
- **undetermined**, covering malformed output, a timeout, a parse failure or a split panel.

For a merge gate, undetermined does not pass. The study counted a malformed verdict as no acceptance, and the gate should do the same: escalate to a person or a stronger lane, and never default to pass.

A review that never ran the code it judged is a weaker signal than one that did. In the study, every review with no thinking returned a pass. If the reviewer has tools, record whether it ran anything. A pass with no execution and no reasoning trace is a candidate for escalation, not a clean pass.

### 6. Calibrate on a known-answer set that you own

Every number above comes from public Django patches. Those are patches whose fixes a model may have seen in training, judged against labels from fix-derived tests. Your code is different, and if it is private, no fix can be recalled. Absolute rates may move in either direction.

The only way to know your gate's false-success rate is to measure it.

- **Set.** Merged patches whose outcome you know. "Wrong" means a later fix traces back to the patch. "Correct" means it stayed clean for a fixed period. For every wrong one, a person records whether the original issue actually required the behaviour the fix changed. This is the question the study shows the result depends on.
- **Arms.** The reviewer at each candidate effort level, paired on the same patches.
- **Predeclared.** The denominator for each rate, a countermetric (cost per review and false alarm), the margin that makes a cheaper level acceptable, and the rule for what happens if no level meets it.
- **Rerun.** Repeat the sweep when the model, the tool or the prompt changes.

If the measured false-success rate is close to the study's, that is not a failure of the method. It is the evidence that the review cannot carry correctness, which then rests primarily on tests and CI.

## What this pattern does not claim

- **It does not recommend an effort level.** The study found medium sufficient for one model and not for two others, all from one family. It says nothing about any other family.
- **It does not claim that a second model makes merges safe.** For correctness the evidence points the other way. The claim this pattern makes is narrower, and it is a proposal: a pinned, typed and calibrated second model can add a structural review on top of tests. How good that review is has to be measured on your own patches.
- **It does not treat agreement between models as evidence.** Two reviewers from the same family agreeing is consistency. A known-answer set is evidence.

## Sources

- Zax Shen, Hanling Zhang and Zixu Wang. *How Much Effort Does an AI Code Reviewer Need? Evidence from Claude 5.5 Models on Plausible-but-Wrong Patches.* arXiv:2611.33639v1, 25 November 2026. [arxiv.org/abs/2611.33639](https://arxiv.org/abs/2611.33639). Licensed CC BY 4.0.
- Released data and analysis: [trustmybot/research-artifacts](https://github.com/trustmybot/research-artifacts), tag `cr-effort-claude-5.5-v1.2`. Preregistration: [osf.io/r8q2m](https://osf.io/r8q2m).
