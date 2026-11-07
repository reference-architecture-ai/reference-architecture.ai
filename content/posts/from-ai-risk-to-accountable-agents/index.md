+++
title = "From AI Risk to Accountable Agents"
description = "An AI agent can pursue a legitimate objective through methods outside its mandate. Organisational roles give supervision a defined mandate to check."
date = 2026-11-07

[taxonomies]
categories = ["Architecture"]
tags = ["ai-agents", "governance", "knowledge-graphs", "terraphim", "verification"]

[extra]
archived = false
+++

In [AI Risk is evolving, every day.](https://www.linkedin.com/pulse/ai-risk-evolving-every-day-david-hunt-ziqbe/), David Hunt and I examined how an AI agent can pursue a legitimate objective through methods outside its mandate. Oversight needs to connect organisational intent, knowledge, authority, actions and consequences.

<span id="continue-reading"></span>

This article summarises [the full paper](@/posts/organisational-roles-as-agent-contracts/index.md). To supervise that agent, we need to specify its responsibilities, the concepts it uses, the evidence its work requires and the actions it may take.

## Start with an organisational role

“Planning agent” tells us what an agent does, but leaves its responsibility unclear.

A Product Manager breaks outcomes into features and acceptance criteria. A Project Manager turns agreed scope into a delivery plan with dependencies, owners and milestones. Both perform planning, but their work products and authority differ.

An agent's planning capability should belong to a defined organisational role. Its implementation provides services that use tools to perform specific actions.

The chain becomes:

**Organisation → role → capability → service → tool → action → contextual permission.**

A Project Manager agent might select an approved planning template and create a draft in its assigned project. That assignment does not authorise production deployment. The permission decision must govern the actual tool operation, including alternative routes through shells or delegated agents.

## Give the role a defined conceptual space

Each role needs a governed view of organisational knowledge. A Product Manager works with user needs, value hypotheses and acceptance criteria. A Project Manager needs dependencies, resources, risks and delivery commitments. Shared concepts connect their work without making the roles interchangeable.

![Role-based knowledge graphs connect organisational responsibilities to capabilities, services and tool actions. In the proposed architecture, the Project Manager may create a plan draft but cannot deploy to production.](/diagrams/accountable-agents-01-role-and-authority.png)

*Figure 1. Proposed role contract: the knowledge needed to plan and the authority to act are explicit.*

Terraphim's role-based knowledge graphs make this vocabulary explicit through concepts and synonyms. The inspected indexer connects consecutive recognised concepts in document text, retaining supporting document references. Those associations help retrieve relevant notes and explain why they were selected.

The next layer is to type the relationships. A connection might mean “depends on”, “addresses a requirement” or “requires approval”. The role selects the applicable relationship profile from approved templates, traced to adopted standards or documented organisational extensions.

A sentence mentioning a release, a manager and approval does not establish that approval occurred. **“Requires approval” and “was approved” are different claims.**

## Verify meaning in its context

A checklist can recognise every expected concept while missing a change in meaning.

Suppose a delivery plan must place a rollback rehearsal in staging, with its planned start within eight elapsed hours of a defined failure trigger. An output can contain “rollback”, “rehearsal” and “hours” while moving the activity to production or replacing elapsed hours with business days.

Successful checking therefore requires compatible concepts, relationships and context across the input, output and criteria. Different terminology can be acceptable through an explicit mapping. Changed scope, units, conditions or prohibitions cannot pass silently.

Our paper uses [ISO/IEC/IEEE 42010:2022](https://www.iso.org/standard/74393.html) to frame architecture descriptions and [ISO/IEC/IEEE 29148:2018](https://www.iso.org/standard/72089.html) to distinguish requirements quality and stakeholder intent from evidence about the realised system. This is a standards-informed design, not a conformity claim.

The practical requirement is traceability: identify the requirement version, relevant context, applicable criterion and evidence behind each result. When those conditions change, reassess the affected findings. Unknown context should produce an indeterminate result, not an assumed pass.

![Contextual verification compares a proposed plan with the versioned requirement and its concepts, trigger and criteria. Preserved conditions pass this planning criterion, changed conditions fail, and missing evidence leaves the result indeterminate.](/diagrams/accountable-agents-02-contextual-verification.png)

*Figure 2. Proposed contextual check: passing a planning criterion neither proves the rehearsal occurred nor grants deployment authority.*

## Make the audit concrete

Terraph, the Terraphim language, connects a role graph, a checklist and a gated action in one program. The graph and checklist compile from Markdown into constant matching automata. `embed` identifies concepts and source spans; `text satisfies preflight` reports which checklist items are missing.

The `deploy` verb declares the evidence it needs. Here, `engineer` is the example role; it does not change the Project Manager’s authority:

```text
import std;

role engineer from "kg";
checklist preflight from "checklists/preflight.md";

fn deploy(plan: str, ev: Proof<preflight>) -> i64 {
    print("deploy: preflight evidence present, proceeding");
    return 0;
}
```

The generated verb wrapper obtains a sealed `Proof<preflight>` through `.require()` only when no checklist items are missing. The proof binds to the checked snapshot, available as `ev.subject`.

![Terraph uses compiled role concepts and checklist definitions to check a text snapshot. Findings with missing items cannot yield a proof; findings with no missing items can produce a sealed proof required by the gated verb.](/diagrams/accountable-agents-03-terraph-audit.png)

*Figure 3. The Terraph proof gate. The example body prints a message; it does not deploy a system.*

Any actual operation must use that checked snapshot and pass a separate authority check. Reopening the plan could read changed bytes. Passing the checklist cannot give a Project Manager production privileges, nor can concept coverage establish that the plan is correct.

Our earlier argument calls for supervision that follows an agent's changing context. An inspectable role contract gives that supervision a defined mandate to check. A Project Manager agent can prepare a plan, preserve its requirements and record the evidence, while release authority stays with the role responsible for exercising it.
