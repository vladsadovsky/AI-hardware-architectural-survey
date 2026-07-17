# Project Working Instructions

## Purpose

These instructions govern assistant behavior while working on the *Survey of Modern AI Compute Accelerator Hardware* repository.

For project orientation, read `PROJECT_CONTEXT.md`. For scope, research methodology, evidence standards, and writing standards, follow `charter/Project_Charter_and_Research_Methodology_v0.2.md`. For manuscript organization, follow `outline/Master_Structural_Outline_v0.2.md`.

If these documents conflict, use this precedence:

1. The user's current explicit instruction
2. `PROJECT.md` for collaboration and repository workflow
3. The Charter for research and writing methodology
4. The Master Structural Outline for manuscript organization
5. `PROJECT_CONTEXT.md` for summarized background and current state

## Collaboration Style

- Act as an assistant, not the project driver.
- Answer the question or perform the requested task directly.
- Be terse and constructive in chat unless details are requested.
- Do not interrupt the user's train of thought with long explanations, unsolicited brainstorming, or broad proposals.
- Offer brief options or critique when useful, then wait for direction.
- Put substantive research and writing into repository documents rather than the chat window.
- Do not propose additional process, artifacts, or scope unless they solve an immediate problem.

When an important structural, factual, or content problem appears, report it concisely and stop:

> **Issue:** One or two sentences describing the problem.  
> **Suggestion:** One or two sentences describing the recommended response.

Elaborate only when asked.

## Work Discipline

- Work on one major document at a time.
- Ask for review before starting the next major document.
- Preserve the user's approved structure, terminology, and argument unless explicitly asked to reconsider them.
- Distinguish accepted decisions from drafts, suggestions, and unresolved questions.
- Do not silently promote unreviewed prose or speculative claims to canonical status.
- Make narrow changes. Do not rewrite unrelated material.
- Keep project process lightweight. Do not introduce ADRs or other heavy governance.

## Manuscript Standards

- Write for senior software engineers, systems and software architects, AI infrastructure engineers, and technically grounded decision makers.
- Assume solid engineering experience but not graduate-level computer architecture.
- Prefer precise engineering language and practical architectural explanation.
- Use minimal mathematics in the main text. Put formal methods, derivations, and further links in appendices.
- Organize analysis around workloads and architectural approaches, not vendor chronology.
- Explain software optimization and its limits before presenting a hardware response.
- Treat hardware “necessity” as conditional and economic as well as technical: identify the residual bound, direct consequence, hardware lever, workload stability or volume, and lifecycle cost before concluding that specialization is justified.
- Characterize workload phases by signatures—computation and shapes, memory and access structure, temporal behavior, state, communication, quality, and deployment constraints—rather than relying on model-family labels alone. Keep formal stochastic-process treatment in appendices unless it is essential to the argument.
- Describe GPU limitations as movement outside an efficiency envelope involving parallelism, coalescing, lane regularity, occupancy, batchability, and amortized overhead. Do not imply that GPUs require stricter cache coherence or cannot execute irregular workloads.
- Separate verified facts, analysis, author assessment, announced products, development work, reporting, and speculation.
- Avoid unsupported causal claims, vendor advocacy, vague superlatives, and comparisons without measurement boundaries.
- Preserve the two-transition thesis and AI compute continuum unless the user explicitly revises them.
- Write Engineering Takeaways as concise natural-language bullets with an explicit causal connector such as “therefore,” “so,” “thus,” or “which means.” Do not repeat labels such as “Observation” and “Conclusion” in every bullet.

### Mandatory problem-to-consequence traceability

When describing workloads and bottlenecks, use an explicit causal chain:

> Real-world problem → Workload behavior → Architectural bottleneck → Direct system consequence

For every material bottleneck:

- Identify the real workload or deployment problem that exposes it.
- Describe the relevant computational, memory, communication, control-flow, or timing behavior.
- Name the specific architectural resource or mechanism that becomes limiting.
- State the direct consequence, such as reduced scalability or utilization; increased mean or tail latency; higher energy, heat, memory footprint, or cost; missed deadlines; reduced determinism, reliability, or quality.
- State the deployment class and operating conditions under which the chain applies.
- Avoid lists of workloads, bottlenecks, and consequences that are not explicitly mapped to one another.
- Check for omitted links, contradictory mappings, and bottlenecks presented without a demonstrated consequence before delivering a chapter.

## Mandatory Compute-Continuum Coverage

Every substantive chapter must explicitly evaluate its subject across the full AI compute continuum where technically relevant:

1. **Hyperscale and datacenter:** useful utilization, throughput, tail latency, energy per useful unit of work, cost per token or workload unit, memory and network stalls, rack power, cooling, scheduling, reliability, and total cost of ownership.
2. **Enterprise and edge infrastructure:** utilization at smaller scale, workload consolidation, acquisition and operating cost, power and cooling limits, data locality, privacy, manageability, and service latency.
3. **Client and mobile:** energy per inference or token, battery life, thermal envelope, idle and wake-up cost, shared-memory pressure, privacy, responsiveness, and heterogeneous SoC scheduling.
4. **Embedded, automotive, and robotics:** bounded response latency, determinism, energy, SWaP-C, sensor and actuator integration, availability, safety, and operation with limited or intermittent connectivity.

Do not let datacenter/HPC concerns stand in for the entire continuum. Do not confine mobile, client, or embedded systems to a late product chapter when they have distinct historical, architectural, workload, or software implications.

For each major concept or transition, state:

- How it appears in each relevant deployment class.
- Which objective is primary in that class.
- Which constraints or tradeoffs differ across classes.
- Whether the same architectural idea migrates across the continuum in either direction.

Coverage must be integrated into the chapter's argument. Do not mechanically split every chapter into identical datacenter, mobile, and embedded sections when a concept-by-concept comparison is clearer. Before delivering a chapter draft, perform a compute-continuum coverage check and report any intentionally omitted deployment class with a reason.

Treat enterprise private AI infrastructure as potentially datacenter-like when data-domain protection, governance, sovereignty, or predictable local service motivates a private cluster or “mini-datacenter.” Preserve its distinct economics: lower and more variable utilization, longer lifecycle, smaller support organization, and higher relative cost of spare capacity. Treat non-mobile edge as an intermediate deployment class whose architecture moves toward datacenter or embedded designs according to consolidation, locality, environmental, and real-time requirements.

Utilization is not an isolated objective. Treat it as a means to improve useful throughput, energy efficiency, and economics while meeting latency, reliability, fairness, and capacity-headroom requirements. Avoid implying that maximum occupancy or 100 percent utilization is universally desirable.

## Sources and Verification

- Follow the Charter's source hierarchy and evidence classes.
- Prefer primary technical sources and peer-reviewed research.
- Treat vendor specifications as evidence of documented characteristics, not independent validation.
- Qualify vendor benchmarks and disclose their measurement boundaries.
- Verify current products, specifications, roadmaps, and other time-sensitive facts before using them.
- Record citations close to the claims they support.
- Keep the complete reference list in `references/references.md`, placed at the end of the assembled paper rather than at the end of individual chapters.
- Organize the consolidated reference list by chapter. Keep only one canonical entry for a source used in multiple chapters.
- Clearly label uncertainty, conflicts between sources, and missing public evidence.

## Repository Workflow

- Markdown files are the canonical authoring sources unless the user specifies otherwise.
- Repository file edits are allowed when requested.
- Preserve existing user work and unrelated changes.
- Do not stage, commit, push, pull, merge, rebase, create or switch branches, or otherwise mutate Git state unless the user explicitly requests that operation.
- Read-only inspection of repository status and history is allowed when needed.
- Do not delete or replace an accepted artifact without explicit direction.
- Generated DOCX, PDF, HTML, figures, and other publication formats are outputs, not canonical sources, unless designated otherwise.

## Current Working State

- Governing Charter: `charter/Project_Charter_and_Research_Methodology_v0.2.md`
- Provisional outline: `outline/Master_Structural_Outline_v0.2.md`
- Reusable context: `PROJECT_CONTEXT.md`
- Approved Preface: `chapters/preface.md`
- Chapter 1 draft awaiting review: `chapters/ch01-historical-context.md`
- Chapter 2 workload-characteristics draft awaiting review: `chapters/ch02-workload-characteristics.md`
- Chapter 3 architectural-principles draft awaiting review: `chapters/ch03-fundamental-architectural-principles.md`
- Chapter 4 architectural-stressors draft awaiting review: `chapters/ch04-architectural-stressors-and-tradeoffs.md`
- Chapter 5 CPU-and-GPU draft awaiting review: `chapters/ch05-cpus-and-gpus.md`

Update this section only when the canonical working state materially changes.
