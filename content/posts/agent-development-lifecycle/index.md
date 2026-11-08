+++
title = "The Agent Development Lifecycle (ADLC) in October 2026"
description = "Six vendor frameworks, no neutral standard: a synthesis of the agent development lifecycle into seven phases, two feedback loops and a governance ring"
date = 2026-10-19
[taxonomies]
categories = ["Architecture"]
tags = ["agents", "adlc", "lifecycle", "evaluation", "governance", "agent-identity"]
[extra]
comments = true
+++

*By Allan Smeyatsky*

By October 2026 the Agent Development Lifecycle (ADLC) has become the accepted name for how enterprises build, evaluate, ship and run AI agents, but it is a family of vendor frameworks rather than a single standard. Salesforce (April 2026), IBM and Glean (May 2026), Microsoft, LangChain and EPAM have each published their own version, with phase counts ranging from four to seven.

<!-- more -->

# Executive summary

Under the different labels, the frameworks agree on five things:

1. **Behaviour, not code, is the product.** Agents are probabilistic, so the same input can yield different outputs, and failures look plausible rather than obvious.
2. **Deployment is day one, not the finish line.** Every framework closes the loop from production observation back into evaluation and rebuild.
3. **Evaluation is continuous.** Golden datasets, LLM-as-judge, human review and red teaming run before release and keep running after it.
4. **Governance is designed in.** Intake, agent identity, least privilege, sandboxing and a governed agent registry are lifecycle phases, not afterthoughts.
5. **Orchestration is the destination.** Single agents earn a "ticket to ride" into multi-agent systems only by clearing a quality bar.

The gaps that remain open are standard agent identity and delegation, cross-vendor interoperability, retrofitting the lifecycle onto existing agent sprawl, and closing the feedback loop without drift.

One naming warning: security vendors such as OX Security and Cycode use "ADLC" for the *agentic* development lifecycle, meaning ordinary software delivery executed by coding agents. This article covers the *agent* development lifecycle: the lifecycle of the agents themselves.

# Why the SDLC breaks for agents

The SDLC assumes a program does the same thing every time until someone changes its code. Agents break that assumption in four ways, and each one forces a lifecycle change.

| Dimension | SDLC (traditional software) | ADLC (agents) |
| --- | --- | --- |
| What is engineered | Deterministic code paths | Probabilistic behaviour shaped by instructions, context, tools and model |
| How it fails | Crashes and logic errors, traceable to a line of code | Plausible but wrong answers, constraint violations, misaligned shortcuts; often not reproducible |
| What changes behaviour | Only a code change | Model updates, new data in the knowledge base, tool availability, shifting user expectations (drift) |
| Primary artifact | Source code and specs | Natural-language instructions (the agent's "job description"), grounding data, tool contracts, eval sets |
| Testing | A gate passed before release | A permanent state: offline evals, in-the-loop evals, production scoring |
| Release | The finish line | Day one; progressive rollout and an escalation path to humans |
| Success measure | Correctness against spec | Task success, groundedness, safety, cost per outcome, beating a human baseline |
| Security boundary | Users and services | Agents acting with delegated authority, reading untrusted content, calling tools |

Two consequences matter most in practice.

**Context quality outweighs prompt cleverness.** Salesforce reports that the completeness of grounding data is the largest single determinant of agent performance, ahead of prompt sophistication. Atlan argues that the ADLC therefore needs its own context lifecycle, with context built, tested, versioned, deployed and observed like code.

**Not every task belongs in the model.** Salesforce splits agent work into deterministic code, retrieval and reasoning, and calls that split the most important design decision in the lifecycle. IBM's version of the same rule: pick the simplest thing that solves the problem, and use an agent only where judgement or multi-step reasoning is genuinely needed.

The stakes are not abstract. Gartner's widely cited forecast is that more than 40% of agentic AI projects will be cancelled by the end of 2027, and Gravitee's 2026 survey found only 14.4% of organisations say their agents go live with full security approval.

# Origins and the current reference models

There is no neutral standard: each major ADLC is published by a vendor and maps onto that vendor's platform. Atlan traces the term to Arthur.ai in 2024; it went mainstream in the first half of 2026, when Salesforce, IBM and Glean each published a named framework within five weeks of each other. A Towards AI review in August 2026 compared every substantive framework and found six definitions and no consensus, and noted that neither Gartner nor Forrester has endorsed one.

| Framework | Published | Phases | Distinctive emphasis |
| --- | --- | --- | --- |
| [Salesforce ADLC](https://www.salesforce.com/uk/news/stories/applied-ai-building-agents-playbook/) | Apr 2026 | 6: Design, Build, Test and Evaluate, Deploy, Observe, Control and Orchestrate | Task taxonomy (code / retrieval / reasoning); human baseline and "crossover point"; deterministic fences; quality gate before orchestration; nine jobs to be done |
| [IBM ADLC](https://www.ibm.com/think/topics/agent-development-lifecycle-adlc) | May 2026 | 6: Plan, Code and Build, Test and Release, Deploy, Operate, Monitor | DevSecOps lineage; MCP gateway pattern; per-agent identity; sandboxing; governed catalog; two explicit loops (build-test, deploy-operate) |
| [Glean ADLC](https://www.reworked.co/knowledge-findability/glean-updates-platform-to-support-agent-development-lifecycle/) | May 2026 | 7: Opportunity, Design, Performance, Input, Develop, Launch, Monitor and Improve | Success metrics set *before* build; permission-aware data access as its own stage; controlled agent library to curb sprawl |
| [LangChain](https://www.langchain.com/blog/the-agent-development-lifecycle) | Jun 2026 | 4: Build, Test, Deploy, Monitor | Lightweight iteration loop; production failures become the next eval cases |
| [Microsoft Foundry](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/development-lifecycle) + Agent 365 | 2026 | Create to production monitoring, as a platform checklist | Entra Agent ID; every Foundry agent auto-registered in the Agent 365 control plane (GA 1 May 2026) |
| [EPAM AI/Run](https://www.epam.com/insights/ai/blogs/agentic-development-lifecycle-explained) | early 2026 | Multi-phase, mapped to SDLC equivalents | Making uncertainty explicit; built from production work in incident management, FMCG, financial services, eCommerce |
| [GroupBWT](https://groupbwt.com/blog/agent-development-lifecycle/) | Sep 2026 | 7, each ending in an evidence-based gate | Every stage ends in proceed, narrow, redesign, restrict or stop; security, governance, evaluation, observability and ownership run across all stages |

Google's Gemini Enterprise Agent Platform offers a parallel four-pillar model (Build, Scale, Govern, Optimize) that works as both framework and platform. Reworked's observation applies to all of them: the methodologies run through each vendor's platform, while real agents rarely stay inside one vendor's ecosystem.

The practical reading for an architect: the phase names differ, but the underlying shape is the same, and it is that shared shape the next section describes.

# The phases of the ADLC

Collapsing the published frameworks gives seven phases joined by two loops: build and evaluate repeat until an agent clears its release bar, and production observation feeds back into evaluation for the life of the agent. Governance wraps every phase.

![The ADLC orbit: seven phases around the agent, a build loop and a production loop feeding Evaluate, and a governance ring of identity, least privilege, registry and audit trail](/diagrams/adlc-orbit.svg)

Evaluate sits at the centre of both loops: failed evals send the agent back to Build, and production failures become new eval cases.

## 1. Frame the opportunity

Start from a job to be done, not from a model. Decompose the role into tasks and sort each into deterministic code, retrieval or reasoning; only the reasoning tasks belong to the LLM. Ask whether an agent is needed at all, since a classifier or a workflow is often enough. Capture how humans perform the task today, because without a baseline there is nothing to measure the agent against.

*Exit artifacts:* validated use case and business value, task taxonomy, human performance baseline.

## 2. Specify, set metrics, clear intake

Glean puts performance metrics here, before any build, and IBM notes that the exact formula for each metric is itself an architectural decision. Write the expected behaviour and standard operating procedures in natural language. Run a governance intake: risk, bias and fairness assessment, data access boundaries, and a check of the agent registry for an existing agent or pattern to extend.

*Exit artifacts:* success metrics and thresholds, behaviour spec, governance clearance, list of tools and data to procure.

## 3. Build

The main artifact is the agent's instructions, closer to an onboarding document than a code spec. Around it sit the tools (increasingly exposed through MCP behind a gateway), the grounding data and its permissions, the memory strategy, and model selection, usually a portfolio of frontier, specialised and small models rather than one. Targeted agents with sub-agents beat one general agent; monolithic agents suffer "logic collisions" between capabilities. Instrument from the start: observability hooks capture reasoning traces, tool calls and outputs, preferably on OpenTelemetry. Give each agent its own identity and least-privilege access.

*Exit artifacts:* versioned instructions, tool contracts, context sources, model routing, telemetry, agent identity.

## 4. Evaluate and release

Behavioural validation replaces unit tests as the main gate. Run large, varied scenario sets against golden datasets and expected trajectories, scored by LLM-as-judge with human review on a sample. Add red teaming for prompt injection, goal hijack and tool misuse. Wire evals into CI so a model version bump or prompt edit cannot silently regress reasoning. Certify the agent into a governed catalog. Loop back to Build until thresholds are met.

*Exit artifacts:* eval report against thresholds, red-team findings, catalog entry with owner, version and risk posture.

## 5. Deploy progressively

Treat deployment as tiered activation: canary, blue-green or rolling rollout; sandboxed execution; rollback plans; throttling. Embed the agent where people already work (Salesforce uses Slack; Microsoft uses Teams and Copilot) and make the human escalation path fast, because its quality largely decides whether users trust the agent. Put deterministic fences around consequential actions: the agent drafts a refund, capped code issues it.

## 6. Operate and observe

Observability asks "is the agent thinking correctly?", not "is the server up?". Track task success, handoff rate, satisfaction, latency, token cost and cost per outcome, and score live traffic against an evolving golden set. Watch output variance on repeated questions as a reasoning-stability signal. Manage drift, which happens with no code change at all. Human review tapers with maturity: Salesforce's pattern is 100% review at launch, then low-confidence outputs only, then about a 5% random sample. Every correction becomes calibration data for phase 4.

## 7. Orchestrate, then retire

Only agents that pass a scoring rubric graduate into orchestrated, multi-agent systems; Salesforce calls quality the "ticket to ride". Coordination must avoid duplicated work, contradictions and dropped handoffs. The frameworks say least about the end of life, but a governed catalog implies decommissioning: revoke identity and credentials, archive traces for audit, and remove the agent from the library.

# Evaluation and observability as the backbone

Evaluation is what turns an agent from a demo into a managed asset, and it runs at three points rather than one.

| Where it runs | What it does | Typical methods |
| --- | --- | --- |
| Offline, in build and CI | Benchmarks behaviour before release; blocks regressions when prompts, tools or model versions change | Golden datasets, expected trajectories, LLM-as-judge, human sample review, red-team suites |
| In the loop, at run time | Guides individual decisions as they happen | Context-relevance scores before using a retrieved source, confidence thresholds that trigger escalation, policy checks on tool calls |
| In production, continuously | Scores live traffic and detects drift | Sampled scoring against an evolving golden set, variance on repeated questions, user feedback, handoff analysis |

IBM groups metrics into four families, and a credible eval plan covers all four:

- **Quality:** task success rate, accuracy, groundedness, tool-call success rate
- **Safety:** policy violations, sensitive-data leakage rate, injection resistance
- **Operations:** latency, token consumption, cost per task
- **Business:** satisfaction, cost per outcome, hours saved, performance against the human baseline

Three practices separate mature teams from the rest.

**Evaluate the trajectory, not just the answer.** A right answer reached by an unsafe or wasteful path is still a failure. Salesforce calls this reasoning efficacy: inspect inputs, the reasoning trace and output variance together.

**Keep the golden set alive.** It must evolve with the business, and production failures are the best source of new cases. LangChain's loop is exactly this: find the hard examples, understand why the agent failed, adjust, re-run evals, redeploy.

**Make telemetry portable.** IBM recommends OpenTelemetry for traces so observability survives a change of framework or vendor, which matters when agents span platforms.

The known weak spot is closing the loop. Practitioners at Glean's launch event noted that agents given feedback often drift off-task rather than correcting cleanly, and Reworked described tracking performance and actually closing the feedback loop as two different problems that the industry has not yet solved.

# Governance, identity, security and regulation

In 2026 governance moved from a review step to a set of controls embedded in every phase, and agent identity became its centre of gravity.

## Identity and authorisation

The core problem, as the NIST NCCoE concept paper put it, is that agents are commonly treated as generic service accounts with no dedicated identity, authorisation or audit trail. Every reference ADLC now requires a distinct identity per agent so every action can be attributed, plus least-privilege, task-scoped permissions.

- **NIST:** CAISI launched the AI Agent Standards Initiative on 17 February 2026, with three pillars: industry-led standards, open-source protocols, and research on agent security and identity. The NCCoE concept paper *Accelerating the Adoption of Software and AI Agent Identity and Authorization* closed for comment on 2 April 2026. No final standard has been published yet; an AI Agent Interoperability Profile is planned for Q4 2026, per the Cloud Security Alliance.
- **Vendors:** Microsoft Entra Agent ID and Okta have shipped agent identity products; OpenAI's Frontier gives each agent an employee ID with explicit access controls.
- **Building blocks:** SPIFFE/SPIRE for cryptographic workload identity, OAuth 2.1 for task-scoped tokens, and the IETF WIMSE work are the pieces most often combined.

The unsolved part is delegation: proving which human authorised which agent to do what, and keeping that chain intact as agents hand work to other agents across organisational boundaries.

## Security risks

The [OWASP Top 10 for Agentic Applications 2026](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/), published 9 December 2025 by 100+ contributors, is the reference taxonomy. Its ten categories (ASI01 to ASI10) cover goal hijack, tool misuse, identity and privilege abuse, agentic supply chain, unexpected code execution, memory poisoning, insecure inter-agent communication, cascading failures, human-agent trust exploitation and rogue agents. It extends the LLM Top 10 rather than replacing it, and OWASP added an Agent Control Standard in August 2026. NIST's own red-team research reported an 81% attack success rate against AI agents.

Mapped to the lifecycle, the controls look like this:

| Phase | Controls |
| --- | --- |
| Frame and specify | Risk classification, data boundaries, registry check, threat model per OWASP category |
| Build | Per-agent identity, least privilege, MCP gateway, sandboxed execution, supply-chain pinning of tools and servers |
| Evaluate | Red teaming for injection and goal hijack, policy checks, leakage tests |
| Deploy | Deterministic fences on consequential actions, progressive rollout, rollback, throttling |
| Operate | Audit trails with non-repudiation, anomaly detection, kill switch, credential revocation |

## Regulation

The EU AI Act's high-risk deadline moved. The Digital Omnibus on AI (Regulation (EU) 2026/1744) entered into force on 27 July 2026, days before the original 2 August 2026 date. Standalone Annex III high-risk systems (hiring, credit and similar) now apply from 2 December 2027, and AI embedded in Annex I regulated products from 2 August 2028. The Article 50 transparency obligations were largely unaffected, and the substantive requirements did not shrink. For ADLC teams this is runway, not relief: the documentation, logging, human oversight and risk management the Act demands are the same artifacts a good ADLC already produces.

On management systems, ISO/IEC 42001 and the NIST AI RMF remain the frameworks most organisations map their ADLC governance onto; neither specifically covers agent identity, which is why the NIST agent initiative sits alongside them.

# Tooling landscape and protocols

The protocol layer consolidated in 2026; the platform layer did not. Agents now share open plumbing under one neutral foundation, while lifecycle tooling remains split across hyperscaler platforms and independent frameworks.

## Protocols

The Linux Foundation launched the [Agentic AI Foundation (AAIF)](https://www.flowhunt.io/blog/agentic-ai-foundation-a2a-mcp-standards/) on 9 December 2025 with three founding projects: Anthropic's Model Context Protocol, Block's goose and OpenAI's AGENTS.md. On 20 August 2026 Google donated Agent2Agent (A2A) to the same foundation. By August 2026 AAIF reported 247 member organisations.

| Standard | Role in the lifecycle | Status, Oct 2026 |
| --- | --- | --- |
| MCP | Agent to tools and data (vertical). Default integration pattern in the Build phase, usually behind a gateway | AAIF project; IBM's ADLC treats every integration as an MCP tool |
| A2A | Agent to agent (horizontal): discovery via agent cards, delegation, result exchange across frameworks and organisations | Donated to AAIF Aug 2026; v1.0; backed by 150+ organisations |
| AGENTS.md | Repository instructions for coding agents | AAIF founding project |
| agentgateway | Routing, policy and observability across agent traffic | AAIF project |
| OpenTelemetry | Portable traces of reasoning and tool calls | Recommended by IBM for ADLC observability |

## Platforms and frameworks by phase

| Phase | Representative tooling |
| --- | --- |
| Build | LangGraph, Google ADK, Microsoft Agent Framework, CrewAI, LlamaIndex, Claude Agent SDK, OpenAI Agents SDK |
| Evaluate | LangSmith, Agentforce Testing Center, Foundry evaluations and automated red teaming, Langfuse, Arize, Braintrust |
| Deploy and run | Foundry Agent Service, Vertex AI Agent Engine, Amazon Bedrock AgentCore, watsonx Orchestrate, Glean |
| Govern | Microsoft Agent 365 and Entra Agent ID, Glean Agent Library Controls and Access Policies, Salesforce AI registry, Google's Gemini Enterprise Agent Platform |

The lock-in question is live. Nearly every platform has its own formats for agent definition, tool schemas, memory, tests and versioning, and IBM cites research ranking that fragmentation second only to security among leaders' concerns about the agent vendor ecosystem. The defensive pattern is to standardise on the open layer (MCP, A2A, OpenTelemetry, reusable prompt schemas) and treat any single platform's control plane as replaceable.

# Roles, team shape and operating model

The ADLC is staffed by functions, not job titles. Salesforce's framing has become the common reference: nine jobs to be done, grouped into three families, which a startup might cover with one or two people and an enterprise with dedicated teams.

| Family | Job to be done | What it owns |
| --- | --- | --- |
| Build | Agent architecture | Capabilities, boundaries, where deterministic fences sit |
| Build | Agent development | Topics, actions, tool and code integrations |
| Build | Knowledge management | Grounding data, content strategy, context quality |
| Improve | Efficacy analysis | Quality metrics, session analysis, agent "performance reviews" |
| Improve | Experience management | Conversation design and the natural-language job description |
| Drive | Business ownership | Outcomes, ROI targets, which jobs deserve an agent |
| Drive | Product management | Agent roadmap and backlog |
| Drive | Agent management | Live human-in-the-loop oversight, triage, escalations |
| Drive | Programme management and change | Coordinating the calibration loop; training and adoption |

Three operating-model shifts follow from this.

**From debugging to coaching.** Agent mistakes are treated as learning signals that feed instruction refinement, not defects patched once. The skill mix shifts toward people who can write precise natural-language instructions and judge behaviour, alongside engineers.

**Knowledge owners become critical path.** Because grounding data drives performance more than prompts, the people who own content and data quality move into the core team rather than supporting it.

**Central registry, federated building.** Intake templates, pre-approved patterns and one agent registry let business teams build while a central function keeps sprawl, identity and risk under control. Salesforce reports that pre-approved patterns cut review cycles from weeks to days.

The north-star metric is the crossover point: the moment an agent's measured performance consistently beats the human baseline captured in phase 1. Scaling, in this framing, means shortening the time from "trainee" to "senior contributor".

# Open problems and where the ADLC is heading

The ADLC is clear on what to do inside one vendor's platform for one new agent. It is weakest where agents cross boundaries, already exist, or must improve on their own.

1. **No neutral standard.** Six or more vendor frameworks, no analyst endorsement, and methodologies tied to platforms. Expect convergence on the shared shape rather than a single winner, with the AAIF the most likely neutral venue if a vendor-neutral lifecycle spec emerges.
2. **Retrofitting existing sprawl.** Glean's framework, like most, assumes a fresh start; Reworked noted it does not say whether to audit existing agents first or rebuild one high-value use case properly. Inventory and registration of agents already running is the unglamorous first step most organisations still face.
3. **Delegation and cross-organisation trust.** Per-agent identity is solved inside a tenant. Proving a verifiable chain of authority when one company's agent delegates to another's over A2A is not. NIST's interoperability profile and practice guide are the milestones to watch.
4. **Closing the feedback loop.** Observation is mature; turning it into reliable improvement without drift or regressions is not. Salesforce's ambition of self-learning agents is ahead of current practice.
5. **Multi-agent orchestration.** Most multi-agent workflows are still serialised handoffs. Parallel, de-serialised orchestration with a coordination layer is the stated next frontier, and cascading failures (OWASP ASI08) are its main new risk.
6. **Economics.** Token cost per outcome is now a first-class metric, and Salesforce flags token management for its next paper. Model routing across a portfolio is becoming a lifecycle discipline of its own.
7. **Retirement.** Decommissioning is the least specified phase in every framework, despite being where orphaned credentials and audit gaps accumulate.

The direction of travel is clear enough to act on. Over the next 12 months, expect agent identity and authorisation to harden into procurement requirements, eval-gated CI to become as standard for agents as unit tests are for code, and the EU's December 2027 high-risk date to pull governance artifacts forward into the ADLC's early phases.

# Sources

- [Applied AI: Why Building AI Agents Requires a New Playbook](https://www.salesforce.com/uk/news/stories/applied-ai-building-agents-playbook/), Salesforce, 14 Apr 2026
- [What Is the Agent Development Lifecycle?](https://www.ibm.com/think/topics/agent-development-lifecycle-adlc), IBM, 11 May 2026
- [Glean Targets AI Agent Sprawl With New Lifecycle Framework](https://www.reworked.co/knowledge-findability/glean-updates-platform-to-support-agent-development-lifecycle/), Reworked, 12 May 2026
- [The Agent Development Lifecycle](https://www.langchain.com/blog/the-agent-development-lifecycle), LangChain
- [Agent development lifecycle](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/development-lifecycle), Microsoft Foundry docs; [Agent 365 integration](https://learn.microsoft.com/azure/foundry/agents/how-to/agent-365); [Agent 365 Lifecycle Atlas](https://microsoft.github.io/FastTrack/copilot-agent-strategy/agent-365-lifecycle-atlas/index.html)
- [Introducing Agentic Development Lifecycle](https://www.epam.com/insights/ai/blogs/agentic-development-lifecycle-explained), EPAM
- [AI Agent Development Lifecycle: 7 Stages](https://groupbwt.com/blog/agent-development-lifecycle/), GroupBWT
- [ADLC vs SDLC](https://atlan.com/know/ai-agent/adlc-vs-sdlc/), Atlan, Jun 2026
- [ADLC Has Six Definitions and Zero Consensus](https://towardsai.com/p/machine-learning/adlc-has-six-definitions-and-zero-consensus-i-compared-every-major-framework), Towards AI, Aug 2026
- [What Is the Agentic Development Lifecycle?](https://www.ox.security/academy/governance-compliance/what-is-the-agentic-development-lifecycle-adlc/), OX Security (alternative meaning of ADLC)
- [OWASP Top 10 for Agentic Applications 2026](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/), OWASP GenAI Security Project; [category summary](https://docs.modulos.ai/frameworks/owasp-top-10-agentic)
- [NIST AI Agent Standards research note](https://labs.cloudsecurityalliance.org/wp-content/uploads/2026/04/CSA_research_note_nist-ai-agent-standards-initiative_20260405-csa-styled.pdf), Cloud Security Alliance, Apr 2026; [NIST concept paper coverage](https://www.executivegov.com/?p=280712), ExecutiveGov; [agent identity standards overview](https://www.idmworks.com/?p=34100), IDMWorks
- [EU AI Act high-risk deadline: deferred, not cancelled](https://labs.cloudsecurityalliance.org/research/csa-research-note-eu-ai-act-high-risk-deadline-omnibus-20260/), CSA; [Omnibus agreement](https://www.gibsondunn.com/eu-ai-act-omnibus-agreement-postponed-high-risk-deadlines-and-other-key-changes/), Gibson Dunn
- [A2A Joins MCP at the Linux Foundation](https://www.flowhunt.io/blog/agentic-ai-foundation-a2a-mcp-standards/), FlowHunt; [Agentic AI Foundation profile](https://www.ai.engineer/orgs/agentic-ai-foundation), AI Engineer
