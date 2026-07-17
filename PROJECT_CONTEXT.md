# Project Context

## Purpose

This document is the concise handoff context for new tasks working on this repository. It consolidates the accepted decisions from the ChatGPT conversation **Research Paper Assistance**, the Codex task **Continuing from Research Paper Assistance**, and the current repository artifacts.

Use this file for orientation. The Charter and Master Structural Outline remain authoritative when more detail is required.

## Project

**Working title:** *Survey of Modern AI Compute Accelerator Hardware*

The project is a technically rigorous engineering survey of modern AI accelerator hardware. Its main purpose is to classify architectural approaches, explain the workload and software pressures that produced them, and compare their strengths, limitations, ecosystems, and appropriate deployment scenarios.

This is not primarily a history, a product catalog, or a mathematical-performance-modeling paper. Historical material is limited to context that explains architectural transitions. Products and vendors serve as evidence and examples of architectural choices.

## Intended Audience

- Senior software engineers and software architects
- Systems, OS, runtime, performance, AI infrastructure, and HPC engineers
- Technical decision makers and engineering managers with solid engineering backgrounds

Assume familiarity with CPUs, GPUs, caches, parallel programming, cloud systems, and AI workloads. Do not assume graduate-level computer architecture. Use minimal mathematics in the main text; place formal methods, derivations, and further links in an appendix.

## Central Thesis

The survey is organized around two transitions:

1. **CPU to GPU:** software optimization on CPUs encountered limits in parallel width, instruction overhead, memory bandwidth and locality, power, and scaling.
2. **GPU to specialized AI accelerators:** GPU software optimization continues to encounter workload-specific limits in utilization, data movement, irregularity, communication, latency, determinism, and energy efficiency.

Software did not fail in either transition. Successful optimization exposed architectural, physical, energy, or economic limits that software alone could no longer overcome. Because workloads and deployment constraints differ, no accelerator is universally optimal.

The recurring explanatory chain is:

> AI workloads → Software optimization → Architectural bottlenecks → Hardware innovations → Commercial systems → Deployment across the AI compute continuum

## Scope

Include:

- Modern AI accelerator architectures and limited explanatory history
- Datacenter, hyperscale, enterprise, edge, workstation, client, mobile, embedded, automotive, and robotics systems
- Workloads, compilers, runtimes, operating systems, memory, storage, interconnects, packaging, power, thermal limits, and economics where they affect architecture
- Significant shipping products and credible announced or developmental systems, clearly separated by evidence status
- Selected research, startup, laboratory, and moonshot efforts in explicitly forward-looking sections

Exclude or defer:

- General HPC not materially connected to AI
- General supercomputer history and consumer graphics history
- Semiconductor manufacturing details unrelated to accelerator design or availability
- Quantum computing beyond a brief future-work acknowledgment

## Organizational Principles

- Workload first; architecture before vendor.
- Organize around architectural families rather than company chronology.
- Keep abstraction levels separate: execution model, microarchitecture, dataflow, memory organization, and scheduling are different classification axes.
- Treat datacenter through always-on embedded devices as one **AI compute continuum**.
- Explain what software attempted before introducing a hardware response.
- State the optimized metric and measurement boundary; avoid unqualified claims such as “faster.”
- Compare architectures relative to workloads and constraints, never as universally superior.
- End substantive chapters with concise engineering takeaways.

## Evidence and Comparison Rules

Evidence classes:

- **A:** Shipping hardware with public documentation and meaningful independent verification
- **B:** Officially announced hardware with official specifications or architectural disclosure
- **C:** Publicly disclosed prototypes, research, patents, demonstrations, or confirmed development
- **D:** Credible industry reporting, visibly labeled
- **E:** Speculation or moonshots, used sparingly and isolated from established facts

Source preference:

1. Architecture manuals, ISA documentation, product documentation, and technical whitepapers
2. Major architecture and semiconductor conferences and proceedings
3. Peer-reviewed papers, then influential preprints when necessary
4. Official engineering documentation, blogs, and presentations
5. Reputable independent engineering analysis
6. Financial disclosures, interviews, and reputable reporting for roadmaps

Vendor specifications can establish documented characteristics. Vendor benchmarks are not independent verification and must be qualified.

Keep comparison levels distinct: die/package, board/module, node/server, rack/appliance, and cluster. For client and edge systems, distinguish SoC, device, workstation, embedded platform, automotive platform, and robotic system. Identify precision, dense versus sparse arithmetic, theoretical versus measured results, power boundary, and product status.

## Workload and Architecture Emphasis

Give deeper-than-average treatment to software-visible limits, including:

- Cache capacity, locality, reuse distance, and memory hierarchy
- Register pressure, shared memory, scratchpads, and operand movement
- Sparsity, indirect addressing, divergence, irregularity, and load imbalance
- Dynamic graphs, conditional execution, routing, and synchronization
- KV-cache capacity and movement
- Host-device and accelerator communication
- Distributed collectives and mixture-of-experts traffic
- Small-batch, sequential, deterministic, and latency-sensitive execution
- Tiling, fusion, quantization, pruning, scheduling, and graph compilation
- Idle power, wake-up cost, DRAM activity, battery, thermal, and always-on constraints

Representative workloads include training, fine-tuning, transformer prefill and decode, recommendation, retrieval and embeddings, mixture of experts, sparse and graph computation, vision and video, multimodal inference, diffusion, scientific AI, edge/client inference, robotics, and sensor fusion.

Characterize workload phases through signatures covering operation and shape distributions, arithmetic intensity, working set and reuse distance, spatial access, sparsity structure, dependency and control behavior, state, arrivals and service time, communication, quality, and deployment limits. Use stochastic-process formalization only as optional deeper treatment in an appendix.

## Current Structure

The accepted provisional outline is architecture-first and workload-driven:

1. Historical context and the two architectural transitions
2. Computational characteristics of modern AI workloads
3. Fundamental architectural principles
4. Architectural stressors and design tradeoffs
5. CPUs and GPUs
6. Domain-specific accelerators across the compute continuum
7. Enterprise accelerator landscape
8. Client and edge AI landscape
9. Software ecosystem
10. Packaging, memory, interconnects, and economics
11. Future directions
12. Conclusions

Appendices cover terminology, formal performance models, microarchitectural deep dives, product tables, historical timeline, and annotated bibliography.

## Collaboration Protocol

- Act as an assistant, not the project driver.
- Be concise and constructive in chat. Do not volunteer long explanations or broad process proposals.
- Put substantive output into repository documents rather than chat.
- Offer brief options and critique; let the user decide direction.
- If an important structural or content problem appears, use:

  > **Issue:** Concise description of the problem.  
  > **Suggestion:** Concise proposed response.

  Then stop unless asked to elaborate.
- Keep process lightweight. Do not introduce ADRs or other heavy governance.
- Work on one document at a time and request review before starting the next major document.
- The user owns Git mutations. Do not stage, commit, push, pull, merge, rebase, create branches, or otherwise modify Git state unless explicitly instructed in a later task.
- Repository file edits are allowed when requested.

### Mandatory compute-continuum rule

Every substantive chapter must cover hyperscale/datacenter, enterprise/edge infrastructure, client/mobile, and embedded/automotive/robotics implications wherever technically relevant. Coverage should be integrated concept by concept rather than imposed as repetitive deployment-specific chapter partitions. Datacenter analysis emphasizes useful utilization, energy, cost, throughput, and service objectives; mobile emphasizes energy, battery, thermals, responsiveness, privacy, and SoC scheduling; embedded and robotics emphasize bounded latency, determinism, energy, SWaP-C, integration, safety, and connectivity constraints. Utilization is a means to useful work per dollar and joule under service and reliability constraints, not an end in itself. Enterprise private AI may become datacenter-like when governance or data-domain protection motivates a local cluster, while retaining smaller-scale utilization, staffing, support, and lifecycle economics. Non-mobile edge remains an intermediate class.

### Mandatory causal traceability rule

Workload analysis must explicitly connect real-world problem, workload behavior, software mitigation, residual architectural bound, direct system consequence, hardware implication, and economic trigger. Every material bottleneck must name the scalability, utilization, latency, energy/heat, memory, cost, determinism, reliability, deadline, or quality consequence it produces and the deployment conditions under which the relationship applies. Hardware “necessity” is conditional on a specified objective and must include lifecycle volume, integration and software cost, flexibility, and risk. Do not present disconnected inventories of problems, workloads, bottlenecks, and consequences.

## Canonical Artifacts and Current State

- `charter/Project_Charter_and_Research_Methodology_v0.2.md` — governing scope, thesis, methodology, evidence rules, and writing standards
- `outline/Master_Structural_Outline_v0.2.md` — accepted provisional manuscript structure
- `PROJECT_CONTEXT.md` — concise reusable orientation and collaboration handoff
- `PROJECT.md` — governing collaboration and repository workflow instructions
- `chapters/preface.md` — approved Preface; canonical unless subsequently revised
- `chapters/ch01-historical-context.md` — revised full Chapter 1 draft awaiting review; approved tables are included and five approved figures remain placeholders
- `chapters/ch02-workload-characteristics.md` — expanded Chapter 2 workload-analysis draft awaiting review; includes workload signatures, per-workload software ceilings and hardware conclusions, GPU-efficiency limits, future-world-model analysis, cross-continuum reuse, four tables, and six figure placeholders
- `chapters/ch03-fundamental-architectural-principles.md` — Chapter 3 draft awaiting review; translates workload signatures into execution, data-placement, numerical, scheduling, communication, and software contracts, with four tables and six figure placeholders
- `chapters/ch04-architectural-stressors-and-tradeoffs.md` — Chapter 4 draft awaiting review; applies explicit scenario-to-response chains to interacting architectural stressors across the compute continuum, with three tables and eight figure placeholders
- `chapters/ch05-cpus-and-gpus.md` — Chapter 5 draft awaiting review; establishes the CPU–GPU system baseline, explains GPU platform dominance, defines the limits of the GPU efficiency envelope without implying inability, and bridges explicitly to Chapter 6, with five tables and four figure placeholders
- `figures/` — currently empty
- `references/references.md` — consolidated paper-level reference list, organized by chapter and intended for placement at the end of the assembled paper
- `discussions/thread_bukatin-sparse-matrix-gpu-shared_2026-07-15.md` — supporting technical discussion, not governing methodology

## Open Work

- Review and stabilize the Master Structural Outline before declaring v1.0.
- Review the revised Chapter 1 text and included tables; approved figures remain placeholders pending later production.
- Review the expanded Chapter 2 for workload coverage, causal consistency, economic reasoning, depth, and style; figures remain placeholders pending production.
- Review Chapter 3 for conceptual depth, terminology, separation of architectural abstraction levels, and continuity from the Chapter 2 workload taxonomy.
- Review Chapter 4 for complete causal chains, treatment of interacting tradeoffs, compute-continuum coverage, and an appropriately gradual lead-in to Chapters 5 and 6.
- Review Chapter 5 for CPU/GPU balance, accuracy of the platform-level CUDA treatment, economic framing of further specialization, and readiness of its questions to structure Chapter 6.
- Review the Preface for consistency and completeness if later manuscript work expands or changes relevant content.
- Develop later chapters only after the current drafts are reviewed.
- Create figures, tables, references, and presentation-extraction material as manuscript work produces them; do not let companion artifacts drive manuscript structure.

## Gemini Archive Assessment

The earlier Gemini outline and Chapter 1/2 drafts were reviewed as background material. Their prose is not canonical and should not be copied directly.

Potentially useful research leads:

- Mobile DSP and ISP evolution as historical precedent for NPUs.
- Host orchestration, memory sharing, synchronization, and heterogeneous task partitioning.
- Prefill/decode divergence, Tokens/J, SWaP-C, and compiler bucketing, subject to source verification.
- Microsoft Catapult and Brainwave as possible FPGA case studies.
- The regional startup inventory as a discovery list only, not verified survey evidence.
- Detailed GPU-pipeline and systolic-dataflow material as possible appendices.

Technical warnings:

- The archived taxonomy mixes execution models, microarchitectures, dataflows, and implementation technologies.
- Do not reuse claims that spatial layout mirrors a computation graph, dataflow is defined by absence of a program counter, systolic arrays eliminate a fixed class of SRAM accesses, TPU dataflow is universally weight-stationary, or FPGAs categorically dominate batch-one latency.
- Reducing bytes per operation through quantization increases operational intensity; it does not move a workload left on a Roofline plot.
- Standard transformer KV-cache capacity grows linearly with sequence length for fixed model dimensions, not quadratically.
- Archived mobile energy figures, product specifications, rankings, roadmap details, and named future products require independent verification; several appear unsupported or speculative.
- Avoid the archive's absolute causal language, universal architecture claims, and unsourced numerical assertions.

The current Chapter 1 independently covers the useful historical material more accurately. The Gemini documents are no longer required for working context after this assessment, although retaining them outside the canonical manuscript may still be useful for provenance.

## Source Lineage

Consolidated on 2026-07-16 from:

- ChatGPT conversation: **Research Paper Assistance**
- Codex task: **Continuing from Research Paper Assistance**
- Charter v0.2 and Master Structural Outline v0.2 in this repository

Where the conversations and repository differ, the latest accepted repository artifacts and the user's later workflow instructions take precedence.
