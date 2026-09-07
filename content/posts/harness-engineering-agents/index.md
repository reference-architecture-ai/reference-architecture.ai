+++
title = "Harness Engineering for Self-Improving Agents"
description = "Proposed reference pattern for supervised feedback loops that make AI agent behavior measurable and improvable"
date = 2026-09-06
[taxonomies]
categories = ["Architecture"]
tags = ["agents", "self-improvement", "harnesses", "feedback-loops"]
[extra]
comments = true
+++

Many AI agent systems plateau after deployment. They execute tasks, but the surrounding system may not measure whether they are getting better, repeating old work, or normalizing stalled execution. This article proposes a reference pattern for **agent harnesses**: supervised feedback loops that make agent behavior observable, measurable, and easier to improve.

<!-- more -->

# The Problem: Agents That Don't Learn From Their Own Trace

Most agent architectures follow a simple pattern:

```
User Request -> Agent Reasoning -> Tool Execution -> Response
```

This works for single-turn tasks. But over hundreds or thousands of runs, the agent can make the same mistakes, retry the same failing strategies, and generate the same redundant outputs. It may have no mechanism to:

- Detect that it's stuck in a loop
- Filter redundant documentation from its memory
- Calculate objective health metrics instead of narrating them
- Escalate risk when thresholds are breached

These are plausible failure modes in long-running agent systems: repeated status updates, hand-waved health scores, accumulated "lessons learned" that never change system behavior, and stale priorities that remain nominally critical while no one acts on them.

This is not necessarily a bug in the agent. It is often a missing architectural layer.

# The Harness Architecture

A **harness** is a feedback loop that monitors an agent's output, detects patterns, and triggers bounded corrective action. The proposed pattern uses four harness types, each addressing a specific failure mode:

| Harness | Failure Mode | Trigger | Action |
|---------|--------------|---------|--------|
| **Novelty Filter** | Redundant documentation accumulation | Semantic similarity > threshold | Suppress redundant output |
| **Calculated Health** | Narrated metrics drift from reality | Daily evaluation window | Compute objective health score |
| **Break-Glass** | System paralysis without action | Threshold breach | Notify, escalate, or reduce authorized scope |
| **Lesson Window** | Lessons identified but never applied | Age > window or count > limit | Archive stale active lessons |

```
+-------------------------------------------------------------+
|                         AGENT CORE                          |
|   +-----------+      +-----------+      +----------------+   |
|   | Reasoning | ---> | Execution | ---> | Output         |   |
|   +-----------+      +-----------+      +----------------+   |
+-------------------------------------------------------------+
                                |
                                v
+-------------------------------------------------------------+
|                        HARNESS LAYER                        |
|   +----------------+   +----------------+   +-------------+ |
|   | Novelty Filter|   | Calc. Health   |   | Break-Glass | |
|   | (dedup)       |   | (metrics)      |   | escalation  | |
|   +----------------+   +----------------+   +-------------+ |
|   +-------------------------------------------------------+ |
|   |             Lesson Window (time-bounded)              | |
|   +-------------------------------------------------------+ |
+-------------------------------------------------------------+
                                |
                                v
+-------------------------------------------------------------+
|                        FEEDBACK LOOP                        |
|        Metrics -> Review -> Approved Changes -> Policies    |
+-------------------------------------------------------------+
```

## Harness 1: Novelty Filter

**Problem:** The agent may produce repeated documentation or status text that restates known issues without adding decision value.

**Illustrative implementation:** This example is self-contained enough to show the state-management rule. In production, persist `history` outside the process and choose the embedding model, threshold, and retention period through evaluation.

```python
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from sentence_transformers import SentenceTransformer
import numpy as np

@dataclass(frozen=True)
class HistoryEntry:
    content: str
    embedding: np.ndarray
    created_at: datetime

class NoveltyFilter:
    def __init__(self, threshold=0.82, window_days=7):
        self.model = SentenceTransformer("all-MiniLM-L6-v2")
        self.threshold = threshold
        self.window_days = window_days
        self.history: list[HistoryEntry] = []

    def is_novel(self, content: str) -> bool:
        """Return True only if content is sufficiently novel."""
        now = datetime.now(timezone.utc)
        self._evict_expired(now)
        new_embedding = self.model.encode(content)

        for entry in self.history:
            similarity = np.dot(new_embedding, entry.embedding) / (
                np.linalg.norm(new_embedding) * np.linalg.norm(entry.embedding)
            )
            if similarity > self.threshold:
                return False

        self.history.append(HistoryEntry(content, new_embedding, now))
        return True

    def _evict_expired(self, now: datetime) -> None:
        cutoff = now - timedelta(days=self.window_days)
        self.history = [
            entry for entry in self.history
            if entry.created_at >= cutoff
        ]
```

**Hypothesis:** A correctly tuned novelty filter should reduce redundant persisted text while preserving new decisions, new evidence, and changed conclusions. A proposed target is a 30-50% reduction in persisted daily status text with manual review showing no loss of material decisions.

## Harness 2: Calculated Health

**Problem:** Health metrics are often narrated rather than calculated. A stable phrase such as "roughly healthy" can mask variation in the underlying jobs.

**Illustrative implementation:** The health calculator should receive concrete check functions. This avoids hidden dependencies on undefined methods and makes the metric auditable.

```python
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Callable

@dataclass
class JobMetrics:
    name: str
    weight: float
    check_func: Callable[[int], float]

class HealthCalculator:
    def __init__(self, jobs: list[JobMetrics]):
        total_weight = sum(job.weight for job in jobs)
        if round(total_weight, 6) != 1.0:
            raise ValueError("job weights must sum to 1.0")
        self.jobs = jobs

    def calculate(self, days: int = 7) -> float:
        """Calculate health as weighted average of job success rates."""
        total = 0.0
        for job in self.jobs:
            success_rate = job.check_func(days)
            total += success_rate * job.weight
        return round(total * 100, 1)

def recent_output_check(directory: Path, min_bytes: int = 1024) -> Callable[[int], float]:
    """Return a check where success means one meaningful output per day."""
    def check(days: int) -> float:
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        outputs = [
            path for path in directory.glob("*.md")
            if datetime.fromtimestamp(path.stat().st_mtime, timezone.utc) >= cutoff
            and path.stat().st_size >= min_bytes
        ]
        return min(len(outputs) / max(days, 1), 1.0)
    return check

calculator = HealthCalculator([
    JobMetrics("extraction", 0.40, recent_output_check(Path("runs/extraction"))),
    JobMetrics("briefing", 0.30, recent_output_check(Path("runs/briefing"))),
    JobMetrics("weekly_review", 0.30, recent_output_check(Path("runs/review"))),
])
```

**Measurement definition:** Health is the weighted average of job-specific success rates over a fixed evaluation window. Each job must define its own observable success condition before the run starts.

## Harness 3: Break-Glass

**Problem:** Some systems need a fail-safe escalation path when important work stalls or health drops below an agreed threshold. Break-glass rules should not silently grant broad autonomy to the agent.

**Canonical configuration:**

```toml
[break_glass]
enabled = true
mode = "supervised"

[[break_glass.rules]]
name = "commit_gap"
condition = "days_since_commit > 14"
severity = "critical"
action = "notify_and_require_ack"
message = "Critical commit gap: human acknowledgement required."

[[break_glass.rules]]
name = "health_critical"
condition = "calculated_health < 15"
severity = "critical"
action = "reduce_authorized_scope"
allowed_jobs = ["extraction", "health_check"]
message = "Health critical: non-essential jobs are paused within pre-authorized limits."

[[break_glass.rules]]
name = "lesson_accumulation"
condition = "unapplied_lessons > 50 AND oldest_unapplied_days > 14"
severity = "warning"
action = "notify_owner"
```

**Rule semantics:**

```
notify_and_require_ack:
  Send an escalation and block risky automatic changes.

reduce_authorized_scope:
  Automatically disable only jobs already marked non-essential.

notify_owner:
  Create a visible warning with no automatic operational change.
```

**Abbreviated trigger evaluation:** This sketch assumes `Rule.evaluate` is a safe expression evaluator over a constrained state object, not arbitrary code execution.

```python
class BreakGlass:
    def evaluate(self, system_state: dict) -> list[Trigger]:
        triggers = []
        for rule in self.rules:
            if rule.evaluate(system_state):
                triggers.append(Trigger(
                    rule=rule.name,
                    severity=rule.severity,
                    action=rule.action,
                    message=rule.message.format(**system_state),
                ))
        return triggers
```

**Fail-safe principle:** Notification and escalation remain available through approved channels and rate limits. Automatic action is limited to pre-authorized scope reduction, such as pausing non-essential jobs. Anything outside that predefined reduction policy—including changing data, deleting history, shipping code, or broadening production behavior—requires human authorization.

## Harness 4: Lesson Window

**Problem:** "Lessons learned" can become a growing active queue that never changes system behavior.

**Illustrative implementation:** The window archives stale active lessons. It does not prove that lessons have been applied, and it does not force application.

```python
from datetime import datetime, timedelta, timezone

class LessonWindow:
    def __init__(self, window_days: int = 7, max_unapplied: int = 30):
        self.window = timedelta(days=window_days)
        self.max_unapplied = max_unapplied

    def process(self, lessons: list[Lesson]) -> tuple[list[Lesson], list[Lesson]]:
        """Return (active_lessons, archived_lessons)."""
        active = []
        archived = []
        now = datetime.now(timezone.utc)
        candidates = [
            lesson for lesson in lessons
            if lesson.status not in {"applied", "archived"}
        ]
        overflow = max(len(candidates) - self.max_unapplied, 0)

        for lesson in lessons:
            if lesson.status == "archived":
                archived.append(lesson)
                continue
            if lesson.status == "applied":
                active.append(lesson)
                continue

            age = now - lesson.created_at

            if age > self.window:
                lesson.archive_once(reason=f"expired_after_{self.window.days}_days")
                archived.append(lesson)
            elif overflow > 0:
                lesson.archive_once(reason="overflow")
                archived.append(lesson)
                overflow -= 1
            else:
                active.append(lesson)

        return active, archived
```

**Rule:** A lesson is only "learned" if system state changes because of it. If not applied within the active window, it can be archived, not forgotten, so that it no longer clutters the active queue.

# Integration Architecture

The harnesses integrate at the **output boundary** of the agent core, before content is persisted to memory:

```
Agent Output
    |
    v
+-----------------+
| Novelty Filter  | --> Suppress? Yes: discard and log filter event
+-----------------+     No: continue
    |
    v
+-----------------+
| Calculate Health| --> Update metrics store
+-----------------+
    |
    v
+-----------------+
| Break-Glass     | --> Notify or apply authorized reduction
+-----------------+
    |
    v
+-----------------+
| Lesson Window   | --> Archive expired, queue active
+-----------------+
    |
    v
Persist to Memory
```

This placement is important: harnesses operate on **output**, not input. Filtering input could prevent useful ideas from reaching the agent. Filtering output ensures only valuable, non-redundant content is preserved.

# Deployment Pattern

## Configuration

```toml
# harness.toml
[novelty_filter]
enabled = true
threshold = 0.82
window_days = 7
model = "all-MiniLM-L6-v2"

[health]
enabled = true
calculation_window_days = 7
jobs = [
    { name = "extraction", weight = 0.40, check = "recent_output:runs/extraction" },
    { name = "briefing", weight = 0.30, check = "recent_output:runs/briefing" },
    { name = "weekly_review", weight = 0.30, check = "recent_output:runs/review" },
]

[break_glass]
enabled = true
mode = "supervised"

[[break_glass.rules]]
name = "commit_gap"
condition = "days_since_commit > 14"
severity = "critical"
action = "notify_and_require_ack"

[[break_glass.rules]]
name = "health_critical"
condition = "calculated_health < 15"
severity = "critical"
action = "reduce_authorized_scope"
allowed_jobs = ["extraction", "health_check"]

[[break_glass.rules]]
name = "lesson_accumulation"
condition = "unapplied_lessons > 50 AND oldest_unapplied_days > 14"
severity = "warning"
action = "notify_owner"

[lesson_window]
enabled = true
window_days = 7
max_unapplied = 30
```

## Platform-Neutral Integration Contract

The following is an illustrative contract, not a schema from a real product. The goal is to show the integration boundary a scheduler, orchestrator, or agent runtime would need to provide.

```json
{
  "event": "agent.output.proposed",
  "timestamp": "2026-09-06T23:00:00Z",
  "run_id": "run_123",
  "agent_id": "research_agent",
  "content": "Proposed output content",
  "metrics": {
    "days_since_commit": 15,
    "calculated_health": 42.5,
    "unapplied_lessons": 12
  }
}
```

# Evaluation Plan

As of 2026-09-07, a 14-day evaluation starting on 2026-09-06 is not complete. A coherent 14-day inclusive window would run from 2026-09-06 through 2026-09-19. The table below is a prospective evaluation plan, not reported results.

| Metric | Baseline Definition | Treatment Definition | Target / Hypothesis |
|--------|---------------------|----------------------|---------------------|
| Daily persisted text | Bytes of agent-generated status or lesson text per day | Same measure after novelty filtering | 30-50% reduction without losing material decisions |
| Health score stability | Seven-day weighted health score from fixed checks | Same measure after calculated health is introduced | Changes should track job outcomes rather than remain narratively fixed |
| Break-glass behavior | Number of threshold breaches that produce no visible escalation | Number of threshold breaches with notification, acknowledgement, or authorized scope reduction | Critical breaches should create reviewable events |
| Lesson queue age | Age of oldest active unapplied lesson | Same measure after lesson window archival | Active queue should remain bounded |

## Methodology

1. Freeze the rule set, thresholds, job weights, and measurement definitions before the evaluation starts.
2. Run a seven-day baseline with harnesses disabled, then a seven-day treatment with the same workload and harnesses enabled.
3. Record raw events: outputs proposed, outputs persisted, filter decisions, health inputs, health score, threshold breaches, notifications, scope reductions, lessons created, lessons applied, and lessons archived.
4. Manually audit a sample of filtered outputs for false positives: content that was suppressed but should have been retained.
5. Report all metrics as observations only after the window closes. Do not backfill missing data or infer results from anecdotes.

**Sample size and limitations:** A single 14-day run is enough to detect obvious integration failures and generate hypotheses, but it is not enough to claim general performance. Workload mix, agent prompts, human review behavior, and calendar effects can dominate the result. Treat the outcome as local evidence for this system, not proof that the pattern works everywhere.

**Related-work caveat:** This pattern overlaps with established ideas in observability, control loops, MLOps monitoring, guardrails, and human-in-the-loop operations. The novelty here, if any, is the packaging of those ideas around agent output boundaries. This article does not claim a new algorithm or publish comparative research.

# Failure Modes

## Over-Filtering

If the novelty threshold is too aggressive, genuinely novel but structurally similar content may be suppressed. **Mitigation:** Start with a conservative threshold, then adjust based on measured filter hit rate and manual false-positive review. The target should be meaningful reduction, not maximum suppression.

## Break-Glass Fatigue

If thresholds are too tight, break-glass triggers too frequently and is ignored. **Mitigation:** Reserve critical alerts for conditions that require review. Warning-level thresholds should log or notify without interrupting work.

## Lesson Loss

Archiving lessons after a fixed window may hide valuable but long-term insights. **Mitigation:** Archived lessons remain searchable. The archive is cold storage: retrievable, but not cluttering the active queue.

# Conclusion

The harness architecture addresses a practical gap in agent design: **agents need feedback loops about their own behavior**, not just about the tasks they execute. Without these loops, systems can accumulate redundant memory, drifted metrics, and normalized paralysis.

The four harnesses (novelty filter, calculated health, break-glass, lesson window) form a proposed minimal layer for supervised agent improvement. They require a small, explicit contract from the agent core—output events, job metrics, and authorization state—plus careful placement at the output boundary and human authorization for risky actions.

**Key Takeaway:** An agent that cannot detect its own stagnation will stagnate. Harnesses are the architectural layer that makes stagnation visible, reviewable, and fixable.

---

*This is a proposed reference pattern. The methodology above is intended to make future evaluation reproducible without relying on private supporting material.*

*License: CC BY-SA 4.0*
