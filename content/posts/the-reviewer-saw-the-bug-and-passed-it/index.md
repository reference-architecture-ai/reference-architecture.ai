+++
title = "The Reviewer Saw the Bug and Passed It"
description = "A paired study of 810 AI code reviews found no effort setting that made a strong gate, and in 111 of 290 wrong acceptances the reviewer had named the defect. What that changes about our own different-model review rule."
date = 2026-11-27

[taxonomies]
categories = ["Engineering"]
tags = ["ai-agents", "code-review", "llm-as-judge", "verification", "review-gates"]
+++

Every pull request we merge is reviewed by a second model before it lands. The rule is simple: the model that wrote the code never signs it off. We use a different model family as the reviewer, at a fixed rubric, and we merge only when it returns no blocking findings and a confidence of 4 or 5 out of 5.

I like that rule. This week a paper made me look harder at what it actually buys.

<span id="continue-reading"></span>

## The experiment

Zax Shen, Hanling Zhang and Zixu Wang ([arXiv:2611.33639](https://arxiv.org/abs/2611.33639)) took 90 agent-written patches to Django from SWE-bench Verified. Every one of them passes the benchmark's own tests. Stronger tests, plus a post hoc review of the labels, judged 55 wrong and 35 correct. They then had Claude Opus 5.5, Sonnet 5.5 and Haiku 5.5 review every patch at low, medium and high reasoning effort, in a sealed container. The reviewer had the issue, the code and a shell, and could run tests. That makes 810 reviews for about $50 of API spend.

The Opus part was preregistered before the first main-run review. The Sonnet and Haiku parts were not, and the authors say so on every table. The data are public. I recounted the headline cells from their per-review CSV without using any of their code, and they match.

## What came out

More effort helps. For Opus, going from low to high cut the share of wrong patches accepted from 67% to 45%. For Opus, medium was close enough to high, within the preregistered 15-point margin, to be the sensible default. For the two smaller models it was not.

Then the part that matters for anyone running a review gate: **no setting was a strong gate**. The best of the nine configurations still accepted 45% of the wrong patches.

And the part I keep thinking about. In 111 of the 290 reviews that accepted a wrong patch, the reviewer **named the defect in its feedback and passed the patch anyway**.

That is not a detection failure. The model found the bug, described it, and then decided it did not matter. Part of that may be fair: for many of these patches the stronger test checks something the issue never asked for. The authors are clear that the labels are not ground truth, and they show the results weaken a lot when those patches are removed. But "seen, written down, waved through" is a failure mode you can design for, and most review setups do not.

## Where this lands for us

Three things changed in how I think about our gate.

**First, the effort setting is part of the gate, so write it down.** Our review command never passed a thinking level. It runs at whatever the tool's default is, which today is `medium`. The paper's clearest result is that the right level differs by model. Opus was fine at medium; Haiku needed high. Our reviewer is not a Claude model at all, so the paper tells us nothing about where its level should sit. It only tells us that we have never measured it. The honest fix is to pin the level explicitly and record it with every review, and then to measure it on our own merged PRs before claiming it is enough.

**Second, a finding about behaviour must not be a nit.** Our rubric splits findings into blocking (P0, P1) and non-blocking (P2). We put wording, scope and process in P2 on purpose, because reviewers rewarded for finding things will find things. That is still right. But it means that a real functional defect, filed as a P2 or mentioned in passing, merges. The "seen but passed" result says this is not hypothetical. Our rule now needs one more sentence: a finding that claims the code behaves incorrectly is blocking unless the reviewer argues it down explicitly.

**Third, a review is not a test.** If the strongest configuration in a careful study lets 45% of plausible-but-wrong patches through, the review cannot be what stands between a wrong patch and production. Nothing guarantees that, tests included: every patch in the study had passed the benchmark's tests. But tests and CI are the primary executable gate, and the merge needs them whatever the reviewer says. What the review adds on top, checks of structure, scope and claims that a reader would act on wrongly, is our design choice. The paper never measured it, so we will have to. The paper ends in the same place: a review gate "complements tests rather than replacing them".

## The bit nobody likes

The paper is also a good example of its own threat. The analysis, figures and draft were written by Claude Opus 5.5, one of the models under test. The coders that decided which reviews "named the defect" were Claude 5.5 models too, and no person checked them. The authors say all of this, plainly, in the paper. Agreement between two models from the same family shows consistency, not accuracy. We have that sentence in our own rules for the same reason.

What I take from it is not a number to copy. It is a measurement we have not yet made on our own reviewer, our own code and our own definition of "wrong".

---

*The pattern this leads to, with the evidence and its limits, is written up as [The AI Review Gate: What a Second Model Can and Cannot Stop](https://reference-architecture.ai/posts/ai-review-gate-pattern/).*
