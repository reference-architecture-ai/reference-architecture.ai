+++
title = "Organisational Roles as Contracts for AI Agents"
description = "Role-based knowledge graphs, capabilities, services and accountable actions with Terraphim and Terraph, the Terraphim language."
date = 2026-11-07

[taxonomies]
categories = ["Architecture"]
tags = ["ai-agents", "governance", "knowledge-graphs", "terraphim", "verification"]

[extra]
archived = false
+++

## Abstract

An organisational AI agent needs defined responsibilities, relevant knowledge and bounded authority. This paper proposes roles as contracts for all three. A Project Manager plans delivery; a Product Manager decomposes product outcomes into features. Each uses a governed role-based knowledge graph. Agent services realise role capabilities through tools whose actions require contextual permission. Verification and validation require compatible concepts, relationships and operating conditions across the input and evaluation criteria, with explicit mappings where views differ. A cross-check against ISO/IEC/IEEE 42010:2022 and 29148:2018 informs these distinctions without claiming conformity. Terraphim provides graph retrieval and checklists; Terraph connects concept matching to proof-gated verbs; ADF configurations define responsibilities and artefact templates. The proposed integration would allow a Project Manager agent to create a checked plan from an approved template while reserving production deployment for a separately authorised role.

<span id="continue-reading"></span>

## Continuing the argument on evolving AI risk

This paper continues the argument developed by David Hunt and Alexander Mikhalev in [AI Risk is evolving, every day.](https://www.linkedin.com/pulse/ai-risk-evolving-every-day-david-hunt-ziqbe/), published on 31 October 2026. Their starting concern is that an agent can pursue a legitimate objective through unauthorised methods. They connect oversight of business activity with cybersecurity and knowledge integrity, and argue that changes to agents and their surroundings can invalidate earlier assurance.

Supervision needs an inspectable mandate: the organisational role, the capability being exercised, the service providing it, and the tool action requested against a particular resource. Role-based knowledge graphs provide the relevant concepts and relationships; an independently enforced permission decision determines whether the action may proceed. A Project Manager can prepare a delivery plan using approved templates while production execution remains assigned to a separately authorised role. The sections below distinguish existing components from the integration still required.

A successful check needs criteria that apply to the input's meaning, obligations and operating context. Matching words cannot establish that a plan preserves a prohibition, uses the correct environment, or retains an acceptance threshold. The semantic compatibility contract developed here connects requirements, criteria and evidence through a versioned baseline and explicit mappings. Changes to that baseline trigger reassessment of affected results. The standards cross-check helps define the responsibilities and evaluation claims; it does not establish that the supervisory system has been implemented.

The common concepts connect the earlier article's concerns to the mechanisms examined in this paper:

| Shared concept | Engineering continuation in this paper |
|---|---|
| Mandate and justified authority | Trace the assigned role through capability, service, tool and action to a contextual permission decision. |
| Knowledge integrity and context | Use governed concept identities, relationships and requirement baselines to preserve meaning across inputs, outputs and criteria. |
| Independent supervision | Separate the agent's proposal from the gateway's permission decision and the evidence used to assess its result. |
| Continued validity of assurance | Bind findings to the evaluated artefact, criteria and context; reassess affected claims when relevant versions change. |
| Learning and authority to change | Govern changes to role graphs, templates and policies separately from permission to perform the task. |
| Prediction and operational evidence | Keep illustrative scenarios, expected outcomes and recorded executions distinguishable; validate predictions before relying on them. |
| Consequences across organisational scales | Make resource and project scope explicit, and identify where wider consequences require escalation beyond the acting role. |

This mapping is our architectural synthesis. The examples below illustrate individual mechanisms; connecting them across systems remains engineering work.

## The organisational unit of agency

“Planning agent” describes a computational activity. It does not identify who owns the outcome, which planning conventions apply, or what authority accompanies the work. The same ambiguity affects “research agent”, “review agent” and “execution agent”. These labels can be useful implementation names, but they leave organisational meaning unresolved.

A Project Manager plans delivery against agreed scope, dependencies, resources and milestones. A Product Manager decomposes desired outcomes into features, evaluates value and defines acceptance criteria. Both plan, but they plan different objects, draw on different evidence, and answer to different accountabilities. An organisation should therefore delegate to an agent acting in a defined role, with planning as one of that role’s capabilities.

The role contract can remain stable when an agent’s model, prompt, framework or supplier changes. A replacement implementation must demonstrate the required service behaviour and operate within the same authority boundary. Governed role definitions and capability contracts give the organisation a basis for evaluating that replacement.

The central proposal is a traceable relationship:

> Organisation → role → capability → service → tool → action → contextual permission.

This sequence is an explanation path, not an assertion that authority flows automatically through every edge. The organisation assigns responsibilities to roles; an agent principal is separately authorised to enact a role. Its implementation supplies services. Tools make actions technically available. Policy determines whether an exact requested action is permitted in its current context.

## The organisational semantic layer

The organisational semantic layer describes concepts, relationships, templates, standards and responsibilities using explicit identifiers and versioned definitions. Here, *conceptual space* means this governed system of organisational meaning. The proposal does not require a fully implemented geometric model of human conceptual spaces.

| Element | Organisational meaning | Planning example |
|---|---|---|
| Role | A position with responsibilities and bounded authority | Project Manager |
| Capability | An ability the organisation needs to achieve an outcome | Delivery planning |
| Service | An accessible behaviour provided by an implementation | Produce a delivery plan |
| Agent implementation | Software that provides the service while enacting an assigned role | Project planning agent instance |
| Tool | A concrete interface through which work is performed | Template reader or document writer |
| Action | A specific operation on an identified resource | Create a draft plan in project workspace |
| Permission | A policy decision over principal, role, action, resource and context | Draft creation allowed for the assigned project |
| Evidence | Records supporting a decision and its observed result | Template version, checks and execution receipt |

This distinction between capabilities and services is compatible with enterprise architecture’s separation of organisational behaviour from its realisation and exposed services. It is used here as an architectural vocabulary, without claiming formal compliance with an ArchiMate model. [Open Group ArchiMate 101](https://archimate-community.pages.opengroup.org/workgroups/archimate-101/)

A capability describes what the organisation can accomplish. It is not a permission token. Likewise, an implementation’s demonstrated competence does not grant authority. A model may understand deployment instructions while having no right to invoke a deployment endpoint.

Role capabilities contribute to broader organisational capabilities. For example, an organisation’s **Product Delivery** capability can depend on **Product Discovery** performed by the Product Manager, **Delivery Planning** performed by the Project Manager, and **Release Assurance** performed by the Release Manager. The graph records these contribution relationships explicitly. Separate agent services realise the role capabilities; their combined performance supports the organisational outcome without granting each service the authority of every contributing role.

Roles should also be sufficiently specific to support ownership. An organisation can assign a person or agent multiple roles, but each action should use an explicit active role and bounded assignment. Combining role knowledge for a discussion must not silently combine execution privileges.

| Role | Dedicated conceptual view | Principal service | Example boundary |
|---|---|---|---|
| Product Manager | Outcomes, user needs, features, value hypotheses and acceptance criteria | Produce an evidence-linked feature breakdown | Cannot approve production deployment |
| Project Manager | Scope, dependencies, resources, risks and delivery milestones | Produce a delivery plan from an approved template | Can write a project draft; cannot deploy it |
| Release Manager | Release readiness, change records, environments and rollback procedures | Coordinate an authorised release | Production action requires a separate assignment and satisfied release policy |

These are example contracts, not universal job descriptions. The organisation owns the actual definitions and decides where responsibilities overlap.

## Dedicated knowledge without isolated vocabularies

Each role receives a governed projection of organisational knowledge. This can select which concepts and relationships are available to the role, as well as how retrieval ranks them. Roles can share an underlying graph while retaining different conceptual views.

Shared concepts retain shared identifiers. For example, a feature’s acceptance criteria connect product intent with delivery planning and release verification. Role-specific relationships express what matters for each responsibility: a Product Manager connects a criterion to user value; a Project Manager connects it to delivery evidence and dependencies; a Release Manager connects it to a release decision. The shared identity supports handoffs without making the roles interchangeable.

Role-owned overlays can define local vocabulary, specialised relationships, approved templates and checklist requirements. Their provenance should identify the owner, source, revision and approval state. Changes to the shared definition of “accepted” require different governance from adding a convenient synonym to a role’s retrieval vocabulary.

Graph projections must also respect access controls. Knowing that another team’s confidential plan exists does not authorise retrieving its contents. A role graph is a semantic view; a separately authenticated assignment and resource policy determine what information the agent may actually read.

The graph is the inspectable, or white-box, component of this architecture. A reviewer can examine its concepts and relationships, the embeddings derived from them, and the definitions that shaped retrieval. This visibility neither makes the language model transparent nor establishes that the graph's contents are correct.

## Architecture description and requirements engineering

ISO/IEC/IEEE 42010:2022 concerns architecture descriptions, including viewpoints and model kinds. It distinguishes an architecture from its description and does not prescribe an agent implementation or execution policy. In that standard, ADF means *architecture description framework*; the ADF agent orchestration system discussed here is a different use of the acronym. [ISO/IEC/IEEE 42010:2022](https://www.iso.org/standard/74393.html)

For this architecture, stakeholder concerns, viewpoint conventions and resulting views must remain distinguishable from organisational roles. A viewpoint establishes conventions for constructing and interpreting views that address concerns. [ISO 24641:2023 preview](https://www.iso.org/obp/ui?_escaped_fragment_=iso:std:iso-iec-ieee:24641:ed-1:v1:en)

A role can serve several stakeholder concerns and use several viewpoints. A role graph becomes useful architectural material when its concepts, relationships, conventions and intended questions are explicit. It is not automatically a viewpoint; a project plan is not automatically an architecture view. Terraph's language constructs likewise do not establish that it is a conforming architecture description language. The standards do not assign the paper's Project Manager, Product Manager or Release Manager jobs their permissions.

ISO/IEC/IEEE 29148:2018 addresses requirements engineering and its information across the life cycle. Its terminology distinguishes checks on requirements from checks on the realised product or system. The following four questions must not be collapsed into a single “validation passed” label. [ISO/IEC/IEEE 29148:2018 official preview](https://www.iso.org/obp/ui?_escaped_fragment_=iso%3Astd%3Aiso-iec-ieee%3A29148%3Aed-2%3Av1%3Aen)

| Activity | Question and object |
|---|---|
| Requirements verification | Are the requirement statements and set well formed? |
| Requirements validation | Do those requirements express the intended stakeholder needs? |
| Product or system verification | Does the realised item fulfil its specified requirements? |
| Product or system validation | Does it support its intended application and use? |

Each decision needs the applicable activity and evidence; an individual tool check need not perform all four. A reviewed input baseline is particularly important: an output checklist cannot retrospectively establish what the stakeholder meant.

The following crosswalk is this paper's proposed design, not an ISO clause-compliance matrix:

| Standards-related distinction | Application to the proposed agent contract |
|---|---|
| Stakeholder concern and viewpoint | Name the decision owner, concern and representation conventions; bind the agent's organisational assignment separately. |
| View and modelling conventions | Specify graph concept and relationship types, interpretation rules and correspondences between role views. |
| Requirement and traceability | Connect each obligation to its need, responsible role, input baseline, criteria, output and evidence. |
| Verification and validation | Name the checked object, the predicate or intended-use scenario, its applicable context and the decision supported. |

This is a bounded cross-check using official public material. It is neither certification nor a full-text normative clause audit. The richer semantic contract below is the paper's engineering proposal, not a claim that either standard mandates knowledge graphs or this permission scheme.

## Semantic compatibility between inputs and criteria

A check is meaningful only if its criteria apply to the relevant meaning and context of its input. “Release” can mean software deployment or approval of a payment; the same token need not denote the same concept. A plan for staging cannot be validated against production assumptions merely because both mention “release”. A criterion about elapsed hours cannot silently become one about business days. Evaluation requires compatible conceptual spaces, not identical wording or complete identity between two role graphs.

The proposed trace is:

> Requirement ID and revision → stakeholder need → responsible role and relevant viewpoints → input concepts, propositions and context baseline → verification criterion and validation scenario → evidence → decision.

The baseline identifies the entity and project, source and requirement revisions, environment, relevant time and calendar, units and thresholds, assumptions, exceptions and prohibited actions. A proposition preserves who must do what to which object, under which conditions, with its polarity and quantifiers. “Every accepted feature” and “some features” can share concepts while imposing different obligations.

Verification and validation may use different abstractions. A product view can describe a customer outcome while a delivery view describes work packages. Their mapping must explain how the relevant obligation survives decomposition and which evidence supports it. Approved unit conversions and concept mappings may establish compatibility; fuzzy similarity alone cannot. Additional derived criteria can be legitimate when their rationale and relationship to the stakeholder need are recorded. An obligation cannot disappear merely because a role projection omits its vocabulary.

This paper proposes the following contract. These SHALL statements are authored requirements for the proposed integration, not quotations from ISO:

1. **A check SHALL identify its object, requirement baseline, applicable criteria and relevant context revisions.** The requirement owner and authority to resolve ambiguity or change the baseline must be recorded.
2. **A transformation SHALL preserve relevant obligations or carry an explicitly approved mapping or change.** This includes relationships, polarity, quantifiers, units, thresholds, scope and assumptions, not just concept identifiers.
3. **A decision SHALL distinguish pass, fail, indeterminate and justified not applicable.** Missing context, unresolved mappings or insufficient evidence cannot yield a pass; not applicable needs a recorded reason and authorised acceptance.
4. **A result SHALL bind to the evaluated state and be reassessed when a relevant change invalidates it.** Passing semantic or quality checks never substitutes for an action's separate authority decision.

Context compatibility is necessary but insufficient. A perfectly aligned test can still have a weak predicate, unreliable evidence or inadequate coverage. Criteria must themselves be verified and validated for their purpose; their evaluation must establish the promised claim. Checks should report only what their evidence supports.

## Connecting meaning with authority

The architecture needs four cooperating parts: identity and assignment, semantic knowledge, mediated execution, and audit evidence.

![Proposed architecture: organisational ownership and authenticated assignment, role knowledge, services, execution gateway, contextual policy, registered actions and decision evidence.](/diagrams/roles-contract-architecture.png)

*Figure 1. Connecting meaning with authority. [Open the diagram source in Mermaid Live](https://mermaid.live/edit#base64:eyJjb2RlIjogImZsb3djaGFydCBURFxuICAgIE9bT3JnYW5pc2F0aW9uIGFuZCBhY2NvdW50YWJsZSByb2xlIG93bmVyXSAtLT4gUltWZXJzaW9uZWQgcm9sZSBhbmQgY2FwYWJpbGl0eSBjb250cmFjdF1cbiAgICBJW0F1dGhlbnRpY2F0ZWQgYWdlbnQgcHJpbmNpcGFsXSAtLT4gQVtTY29wZWQgcm9sZSBhc3NpZ25tZW50XVxuICAgIFIgLS0+IEtbUm9sZSBrbm93bGVkZ2UgZ3JhcGggYW5kIGFwcHJvdmVkIHRlbXBsYXRlc11cbiAgICBSIC0tPiBTW0FnZW50IHNlcnZpY2UgY29udHJhY3RdXG4gICAgQSAtLT4gR1tFeGVjdXRpb24gZ2F0ZXdheV1cbiAgICBLIC0tPiBQW0FnZW50IHByZXBhcmVzIGEgcHJvcG9zZWQgYWN0aW9uXVxuICAgIFMgLS0+IFBcbiAgICBQIC0tPiBHXG4gICAgUVtDb250ZXh0dWFsIHBlcm1pc3Npb24gcG9saWN5XSAtLT4gR1xuICAgIEcgLS0+IFRbUmVnaXN0ZXJlZCB0b29sIGFjdGlvbl1cbiAgICBHIC0tPiBFW0RlY2lzaW9uIGFuZCBleGVjdXRpb24gZXZpZGVuY2VdXG4gICAgVCAtLT4gRVxuIiwgIm1lcm1haWQiOiB7InRoZW1lIjogImRlZmF1bHQifX0=).*

Role-based access control provides a foundation: subjects are assigned authorised roles, and operations are mediated through the permissions of those roles. A session can activate a subset of the roles available to a subject. [NIST RBAC](https://csrc.nist.gov/Projects/role-based-access-control/faqs)

The proposed architecture adds organisational meaning to this assignment and applies contextual conditions to execution. Project identity, resource scope, environment, approval state and expiry can all matter. This is consistent with attribute-based access control, which evaluates attributes of the subject, object, operation and environment against policy. [NIST SP 800-162](https://csrc.nist.gov/pubs/sp/800/162/upd2/final)

Let a request be `q = (principal, role, service, tool, action, resource, arguments, context)`. A simplified decision rule is:

```text
permit(q) =
    authenticated(principal)
    AND active_assignment(principal, role, scope, expiry)
    AND capability_service_binding(role, service)
    AND registered_service_tool_action(service, tool, action)
    AND resource_and_argument_scope_match(q)
    AND required_evidence_valid_for_exact_request(q)
    AND contextual_policy_allows(q)
    AND NOT explicit_deny(q)
```

An absent or indeterminate condition produces no permit. This is a proposed contract, not a description of a policy engine already supplied by Terraphim.

The gateway must mediate actual effects. Hiding a deployment tool in a user interface is insufficient if the same principal can deploy through a shell, network client or overprivileged service credential. The action boundary includes alternative routes, delegated agents and mutable resource references. A delegate receives only an authorised subset of the parent’s scope; it cannot turn a planning request into a production privilege.

## Terraphim graph embeddings as a role context mechanism

Terraphim’s graph approach supplies a concrete semantic mechanism for the role view. Concepts and surface forms are represented explicitly, and graph relationships support retrieval and explanation. Its documented graph retrieval path uses normalised concepts, synonym matching and document co-occurrence structure, rather than requiring a neural vector embedding model. [Terraphim graph embeddings](https://terraphim.ai/docs/graph-embeddings/)

The inspected general `RoleGraph` implementation uses Aho–Corasick matching to resolve surface forms to concept identifiers. Its document indexer creates edges between consecutive recognised concepts in the indexed text and retains supporting document references. Retrieval then accumulates node, edge and document rank. Matched edges and tags make the retrieval basis inspectable. A high rank indicates retrieval support under that graph, not factual certainty or authority.

For organisational planning, this allows terms such as “delivery roadmap” and “project plan” to resolve according to the organisation’s chosen vocabulary. The interpretation is role-dependent: a delivery roadmap may emphasise dependencies and milestones for a Project Manager, while a product roadmap emphasises outcomes and prioritisation.

The organisation should keep equivalence and relationship separate. A synonym maps a surface form to a concept. A relationship links distinct concepts. “Risk log” may be an agreed synonym for “risk register”, but a register and an individual risk remain distinct concepts. “Risk” and “deployment permission” must not become equivalent merely because they occur together in operational documents.

Graph embeddings make the retrieval context reproducible. A result can identify the recognised concept and supporting relationship evidence, explaining why a planning template or dependency policy was selected. Template currency, the truth of retrieved claims and action authority require separate checks against authoritative metadata, evidence and policy.

### From co-occurrence to typed organisational relationships

The existing concept vocabulary and the associations found in text play different parts in constructing the role's conceptual space. The role's thesaurus supplies the concepts that can be recognised and the synonyms that resolve to them. Indexing identifies occurrences of those concepts in notes and documents, then constructs connections from the matching text. Retrieval uses that structure to select relevant material. In this path, a connection is discovered between recognised concepts; it does not establish a new concept definition or a new organisational rule.

Sentence-level co-occurrence provides an intuitive starting assumption: concepts mentioned together may be related. The inspected implementation has a broader boundary. The document indexer takes the matching concept sequence from the indexed document and connects adjacent matches without invoking the available sentence-splitting helper. Associations can therefore cross sentence boundaries. A sentence-bounded association rule would require an explicit indexing change; it is not a current guarantee.

Even within one sentence, proximity leaves the relationship unspecified. A note can mention a requirement and a test because the test satisfies it, fails it, or has not yet been performed. The association graph cannot decide which statement holds. The proposed semantic layer must establish the connection's meaning, direction and conditions before admitting it as a typed organisational claim.

| Layer | Representation | What it establishes |
|---|---|---|
| Role vocabulary | Canonical concepts and approved synonyms | Which concept a recognised expression denotes within the role's domain. |
| Text association | Connections between matched concepts, with document evidence | Where concepts occur together or in the indexed matching sequence. |
| Organisational interpretation | Typed, contextual propositions governed by role templates | Whether a connection expresses a dependency, responsibility, requirement, evidence claim or other admitted meaning. |
| Evaluation and execution | Applicable criteria, evidence checks and permission decisions | Whether the specific claim is supported and whether the requested action is authorised. |

The organisational semantic layer supplies the relationship vocabulary. A role selects an applicable profile of that vocabulary, together with the templates for its work products. A Project Manager's delivery-plan template may admit dependencies between milestones and assignments of responsibility. A Product Manager's feature template may admit derivation from stakeholder needs and links to acceptance criteria. Shared concepts retain their identities across these views; the role determines which governed relationships are relevant, rather than inventing their meanings during each interaction.

The proposed governance rule is that **every admitted organisational relationship type SHALL be defined in a versioned, approved template or semantic profile, with traceability to the applicable adopted standards or an explicitly approved organisational extension**. The profile records the standard edition and relevant requirement or definition where applicable. Where a standard leaves a modelling choice open, the organisation records its extension and rationale. This preserves standards-based discipline without asserting that industry standards already name every graph predicate used by an organisation. ISO/IEC/IEEE 42010:2022 and ISO/IEC/IEEE 29148:2018 inform the distinctions discussed earlier; the illustrative predicate names here are not standard-prescribed vocabulary.

A relation definition needs more than a label. It identifies the permitted source and target concept types, direction, interpretation, applicable role and work product, and required qualifiers such as environment, time, polarity or evidence state. For example, `verifies` might connect a verification activity to a requirement, while `producedEvidence` connects its execution to a result. A planned test and a completed test cannot be substituted merely because both connect to the same requirement.

Consider the sentence: “The Release Manager must approve production deployment after verification.” An association graph can connect the recognised concepts *Release Manager*, *production deployment* and *verification*. In a governed release template, those associations could support the candidate propositions `deployment requiresApprovalFrom ReleaseManager` and `deployment requiresEvidence verificationResult`. These describe obligations; they do not record that approval was given or that verification passed. An observed approval requires separate evidence identifying its issuer, subject, decision and applicable version. The runtime must still establish that the issuer and acting agent have the necessary authority.

Typing a connection is therefore a controlled interpretation step. A candidate keeps its source text and concept matches; the role template supplies permissible predicates and structural constraints; a check establishes whether the text and independent evidence support the proposed proposition. An extraction model can propose a type, but a plausible label is not sufficient to admit the claim as organisational knowledge. Ambiguous, unsupported or conflicting propositions remain unresolved. The association evidence is retained so that a reviewer can reconstruct how the candidate arose.

Verification and validation must compare typed propositions and their qualifiers across the input, output and evaluation criteria, using approved mappings where views differ. A test that finds every concept but converts `requiresApprovalFrom` into `approvedBy`, or removes a prohibition, has changed the claim. The audit must expose that change. Graph coverage can find omitted concepts; checking typed relationships addresses whether the connections preserve the intended meaning.

### Retrieving an approved planning template

The following command is an illustrative invocation using the installed `terraphim-grep` interface. The paths represent a proposed organisational knowledge layout; they are not supplied sample data or a claim that this particular corpus was executed.

```bash
terraphim-grep "delivery plan" \
  --role "Project Manager" \
  --haystack all \
  --paths ./organisation/templates/planning \
  --thesaurus ./organisation/roles/project-manager/thesaurus.json \
  --search-only -n 8 -C 2 --json
```

The dedicated thesaurus makes the role’s vocabulary concrete. `--search-only` keeps this invocation on its search path without LLM synthesis. The implementation can fall back to thesaurus matching when populated graph evidence is absent; a result alone does not demonstrate graph traversal. Search produces candidates; the service then checks each candidate against the authoritative template registry. The chosen template must be approved, applicable to the project type, available to the active role and identified by an immutable revision or content digest. Restricting search paths narrows retrieval; it does not establish an execution sandbox.

This distinction matters when a semantically excellent match is obsolete. The organisation’s semantic layer may help locate it, but the planning service must select an eligible template. If none exists, the service should request a governed template decision rather than manufacture an “approved” template itself.

## A graph-based planning checklist

A checklist makes an expected output contract explicit. Terraphim’s published checklist approach places enumerated concepts outside the model and uses the same graph machinery for recognition and retrieval. [Graph embeddings for checklists](https://docs.terraphim.ai/src/howto/graph-embeddings-checklists)

The current source also supports a paired input/output graph-coverage mode. An illustrative planning checklist, saved as `.terraphim/checklists/project_plan.md`, is:

```markdown
# Project plan

mode:: graph-coverage-v1
checklist:: scope, dependencies, risk register, acceptance criteria

### risk register

synonyms:: risk log
```

Its concepts and aliases must resolve uniquely in the configured role graph; declaring an alias in a checklist does not create the missing graph concept. The checklist is not a substitute for building and governing that graph. A source-level invocation for the inspected implementation is:

```bash
terraphim-agent validate \
  --role "Project Manager" \
  --checklist project_plan \
  --input-file brief.md \
  --json < plan.md
```

This `--input-file` form is supported by the inspected client source, not by the locally installed 1.21.22 command interface. The example is therefore a source-supported integration example, not an installed-binary demonstration.

The paired check requires recognised input concepts and checklist concepts to appear in the output, with supporting stored graph paths. Its report distinguishes `pass`, `fail` and `indeterminate`. A service using it as a gate must inspect that verdict; successful CLI completion alone does not establish a passing checklist.

Concept coverage is one limited checking predicate. A plan can mention “dependencies” while assigning them incorrectly, or include “acceptance criteria” that do not test the promised outcome. The complete planning contract consequently layers structural checks, graph concept coverage and evidence review. The graph checker supplies an inspectable signal within that contract. It does not establish the full semantic compatibility contract, verify every asserted relationship or confer permission to publish or execute the plan. Its lexical negation handling does not constitute general verification of proposition meaning.

## Worked example from brief to bounded plan

Consider a project to deliver a customer-facing feature. The Product Manager agent receives an authorised assignment to prepare a feature breakdown. Its graph connects the product outcome to needs, features, value assumptions and acceptance criteria. It produces a versioned breakdown and hands that artefact to the Project Manager service.

The Project Manager agent authenticates under its own scoped assignment. It retrieves candidate planning templates through its role thesaurus, selects an approved revision, and creates a draft connecting the agreed features to milestones, dependencies, owners and risks. It preserves the incoming acceptance criteria and identifies unresolved assumptions.

The service checks the draft’s structure and invokes the graph checklist. A missing recognised requirement produces a failed or indeterminate result that must be resolved before the relevant transition. A passing result is recorded alongside its limitations. Further review establishes whether the proposed dependencies and acceptance evidence are adequate.

When the service requests `create_draft` on the assigned project’s document store, the gateway evaluates the exact operation, destination and content digest. Assuming the role assignment, template, checks and policy conditions are valid, it permits that write and records its outcome.

Now suppose the agent requests `deploy` against production. The request fails the role-to-service/action binding and the production policy. Mentioning deployment in the plan, retrieving a release runbook, or passing the planning checklist cannot repair that missing authority. The gateway records a denial before an effect occurs.

The agent may instead hand the approved plan to the release management process. That handoff supplies evidence, not inherited production credentials. A separately authorised release principal must satisfy its own contract. The organisation can therefore automate preparation without collapsing preparation, approval and execution into a single unrestricted agent.

### Checking the planning context

Consider an illustrative requirement **R-17 revision 3**: the plan must specify a **staging** rollback rehearsal whose planned start is no earlier than the simulated-failure trigger and no later than **eight elapsed hours** afterwards. The baseline defines that trigger as the rehearsal protocol's injected-failure timestamp. Production deployment is outside the Project Manager's scope. The stakeholder need is to coordinate a usable rehearsal without delegating production execution.

A verification criterion checks the plan's environment, planned start offset and preserved prohibition against that baseline. A validation scenario asks the delivery and release stakeholders whether the proposed handoff enables the intended rehearsal with the available people and resources. The plan's check does not prove that a rehearsal occurred. Later testing of the delivered system requires its own evidence; a good plan does not establish successful system behaviour.

| Candidate interpretation or evidence | Required treatment under the proposed contract |
|---|---|
| “One business day” replaces eight elapsed hours | No silent equivalence. Resolve the calendar and conversion; fail if the interval changes, otherwise retain the approved mapping. |
| The plan schedules the rehearsal in production | Fail the known environment mismatch; separately deny unauthorised production actions. |
| The evaluator uses revision 2's 24-hour threshold | Reject the stale criterion binding and reassess against revision 3. |
| “Must not deploy” becomes “may deploy” | Fail proposition preservation despite matching deployment concepts. |
| Relevant calendar or requirement revision is unknown | Return indeterminate until the baseline is resolved. |

The same protection applies when views use different language. “Pre-production” can map to the named staging environment if the organisation explicitly defines that equivalence. Matching the spelling “staging” in an unrelated project's evidence cannot establish that the requirement was met.

## Terraph audit with one role and one checklist

This Terraph example connects a role graph, a checklist and three verbs: `audit`, `check` and `deploy`. Here, `engineer` is the example role; it does not change the Project Manager’s authority. The graph and checklist are Markdown inputs compiled into constant matching automata. `embed` and `satisfies` are language intrinsics, so retrieval and checking use the same concept definitions.

```text
import std;

role engineer from "kg";
checklist preflight from "checklists/preflight.md";

// Audit concept coverage and report the matching source spans.
fn audit(path: str) -> i64 {
    let src = read_file(path);
    if src.len == 0 {
        print("cannot read ", path);
        return 1;
    }
    let h = embed(src);
    let cov = coverage(h);
    print("file: ", path);
    print("kg_hits: ", cov.kg_hits, "  concepts: ", cov.concepts,
          "  confidence: ", cov.confidence, "  diversity: ", cov.diversity);
    for m in h {
        print("  ", m.concept, " @", m.start, "..", m.end);
    }
    if cov.sufficient() {
        print("sufficient: yes");
        return 0;
    }
    print("sufficient: no");
    return 1;
}

// Diagnose missing checklist items. This verb does not issue a proof.
fn check(text: str) -> i64 {
    let miss = text satisfies preflight;
    if miss.any() {
        print("checklist preflight: incomplete");
        miss.report();
        return 4;
    }
    print("checklist preflight: complete");
    return 0;
}

// The generated wrapper supplies a sealed proof for the checked snapshot.
fn deploy(plan: str, ev: Proof<preflight>) -> i64 {
    print("deploy: preflight evidence present, proceeding");
    return 0;
}
```

`audit` exposes which concepts matched and where. `check` reports missing checklist items. At the gated entry point, the generated verb wrapper obtains a sealed `Proof<preflight>` through `.require()`, which succeeds only when no items are missing. The function signature makes that evidence a prerequisite for entering `deploy`.

The proof carries the checked snapshot as `ev.subject`. Any operation justified by the gate must consume that snapshot; reopening the path in `plan` could read changed, unchecked bytes. The sample body only prints a message. Actual deployment still requires an authorised role assignment and resource policy, and concept coverage alone does not establish that the plan is correct. The example shows the language boundary; it is not a recorded deployment.

## ADF configuration gives the role an organisational task

The ADF agent orchestration configurations assign organisational responsibilities. The checked-in Product Owner template names an implementation and declares these fields. Product Owner is the configured role; it is distinct from the illustrative Product Manager role used earlier:

```toml
[[agents]]
name = "product-owner"
persona = "Themis"
capabilities = [
    "planning",
    "roadmap",
    "issue-creation",
    "prioritisation",
]
project = "terraphim"
```

Its skill chain includes research, design, specification, architecture, business scenario design, requirements traceability and acceptance testing. The task defines the work product: each proposed issue must identify its organisational goal, describe the problem and proposed solution, and supply Given–When–Then acceptance criteria. The template also requires a priority estimate, a communication hint and the suggested delivery agent. The workflow narrows the backlog, scores the surviving items and proposes up to two new issues.

These selected literal fields show the existing issue template. Its brackets indicate fields the Product Owner must fill; WIG means the organisation’s current Wildly Important Goal.

```text
Title: [concise, imperative]
WIG: [which WIG this serves, or skip if none]
Problem: [2-3 sentences describing the problem]
Proposed solution: [bullet points, no hand-waving]
Acceptance criteria (mini-UAT):
  Given [precondition]
  When [action]
  Then [observable outcome]
```

The configuration connects the Product Owner’s planning capability to a defined work product and template. It records operational intent; this inspection does not establish that the agent is deployed or that every configured step succeeds.

The repo-local ADF configuration separately declares a Developer, Reviewer and Merge Coordinator, with distinct capability lists and named Terraphim roles:

| Configured agent | Declared Terraphim role | Responsibility expressed in the configuration |
|---|---|---|
| `developer` | Terraphim AI Developer | Implementation, Rust development and test-driven development |
| `reviewer` | Terraphim AI Reviewer | Code review, quality gates and review coordination |
| `merge-coordinator` | Terraphim AI Merge Coordinator | Merge coordination, CI/CD and conflict resolution |

The orchestrator’s merge path checks four required status contexts: `native-ci / build (push)`, `adf/pr-reviewer`, `adf/validation` and `adf/verification`. It also requires canonical gate-result records for the current pull request head. Blocking findings and the project's treatment of concerns affect the decision. Evidence for an older commit cannot substitute for the current head’s review, binding the decision to that part of its context baseline. The labels `adf/validation` and `adf/verification` do not establish that their producers perform the corresponding ISO requirements or system activities.

Configuration intent and runtime enforcement must remain distinguishable. The inspected repo-local loader sets `terraphim_role` to `None`; the declaration alone does not prove that an agent receives the named role graph. Instructions such as “do not merge” are task text, and the Product Owner’s broad shell access is not a production-deployment barrier. The merge gate controls the orchestrator’s merge path; it does not prove that every alternative credential or tool path is mediated. Its structured records are not independently authenticated merely by having the expected fields.

ADF declares responsibility, capabilities, workflow and expected artefacts. Terraph implements bounded tool access, checks and receipts; Terraphim provides the role vocabulary and graph context. Connecting them still requires authenticated role assignments, capability-to-service identifiers, approved artefact versions and policy decisions tied to exact requests.

W3C PROV provides terms for recording entities, activities and agents, including derivation, association and delegated responsibility. These relationships can describe an artefact’s origin and an agent’s participation; a provenance statement alone is not an authorisation decision. [W3C PROV-O](https://www.w3.org/TR/prov-o/)

## Evaluation and implementation boundaries

The proposal can be evaluated without assuming that more graph coverage means safer behaviour. A test corpus should pair legitimate planning tasks with boundary cases and preserve the same role assignments and policy across agent implementations.

| Test | Expected observable result |
|---|---|
| Valid plan from an approved template | Draft created in the assigned project with complete evidence links |
| Semantically relevant but withdrawn template | Candidate rejected by template eligibility policy |
| Required concept omitted | Graph report identifies a fail or indeterminate result; gated transition does not proceed |
| All terms present but a dependency is wrong | Concept coverage may pass; substantive review detects the error |
| Project Manager requests production deployment | Denied before any deployment effect |
| Deployment attempted through an alternative tool | Same authority boundary enforced |
| Artefact changes after checking | Previous evidence rejected for the changed request or bytes |
| Role assignment expires before execution | Gateway denies or requires a fresh valid assignment |
| Agent implementation is replaced | Service contract and authority boundaries remain unchanged |
| Concepts match but polarity, environment or units differ | Relevant semantic predicate fails, or unresolved meaning is indeterminate |
| A role projection drops a critical obligation | Trace check rejects the transformation or requires an approved change |
| Different role views have an approved meaning-preserving mapping | Compatibility can be established; substantive criteria still require evidence |

Measurements should include accepted legitimate tasks, incorrect denials, unauthorised effects, trace completeness and the cost of reconstructing a decision. Report semantic-check accuracy separately from policy enforcement. A test that finds no bypass in a bounded suite is evidence about that suite, not proof that all possible tool paths are mediated.

Terraphim already supplies relevant semantic components, and Terraph supplies concrete prototype mechanisms for compiled checks and evidence. ADF provides configured organisational responsibilities and an implemented orchestrator merge gate. The end-to-end organisational contract, contextual requirement-to-criterion alignment, authenticated role binding, complete execution mediation and linked audit schema remain the integration proposed in this paper. No production deployment result or benchmark is claimed here.

Role owners must maintain concepts, templates and policies, and reviewers must understand what each checklist establishes. Graph updates need controlled promotion because a vocabulary change can alter which obligations appear satisfied. Audit records should retain enough versioned evidence to reconstruct decisions while limiting sensitive content.

## Conclusion

An agent’s organisational role provides a durable basis for knowledge, responsibility and delegated authority. Capabilities explain the outcomes the role must support; services describe how an agent implementation supplies them; tools expose actions; contextual policy determines which actions may occur. A role-based knowledge graph makes the concepts and relationships behind the work inspectable. Meaningful verification and validation also require those concepts, their propositions and the operating context to align with the applicable criteria through explicit, traceable mappings. A shared vocabulary alone cannot preserve an obligation.

Terraphim supplies explicit concept matching, co-occurrence associations, graph retrieval and graph-based checklists. The proposed next layer types those associations using governed role templates and standards-traceable relationship definitions, distinguishing a mention from an obligation and an obligation from an evidenced event. Terraph illustrates how compiled checks can produce evidence tied to the subject being checked. Connecting these mechanisms to authenticated role assignments and mediated execution yields a traceable organisational contract.

For a Project Manager agent, the contract requires an approved planning template, preserved requirements, a checked plan and operation within the assigned project scope. Production deployment belongs to a separately authorised role and process. The evidence must allow a reviewer to reconstruct both the planning result and the authority decision.

## Sources and scope

Public sources are linked beside the claims they support. The preceding article by David Hunt and Alexander Mikhalev was published on 31 October 2026 and read on 4 November. The continuation and concept mapping are this paper's synthesis.

Terraphim and ADF implementation details were checked against local source on 3–4 November 2026. The Terraph example above was supplied by Alexander Mikhalev; its comments have been shortened and its function bodies retained. Source revisions, implementation paths, recorded fixture results and inspection limits remain in the internal research notes.

The standards cross-check used official catalogue records and accessible previews. The complete normative text of ISO/IEC/IEEE 42010:2022 was not inspected, so no clause-by-clause conformity claim is made. The role contracts, typed relationship profiles, contextual criteria and cross-system bindings are proposed integration work. The examples do not demonstrate a live production deployment.
