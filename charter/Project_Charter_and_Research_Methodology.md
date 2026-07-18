# Project Charter and Research Methodology

## Architectural Study of Modern AI Compute Accelerator Hardware

### 

## 1. Mission Statement

To produce a technically rigorous, architecturally grounded, and evidence-based engineering study of modern AI compute accelerator hardware for experienced software engineers, software and systems architects, AI infrastructure engineers, and technical decision makers.

The study shall explain not only what hardware exists, but why it exists, which computational problems it addresses, how architectural ideas evolved, where each architecture succeeds or fails, and how the ecosystem is likely to evolve.

The study is intended to remain useful beyond individual product generations by emphasizing enduring architectural principles over transient product specifications. The industry survey serves as evidence for the architectural analysis and as a foundation for later detailed studies.

## 2. Central Thesis

Modern AI acceleration is best understood through two distinct transitions:

1. **CPU to GPU:** increasingly sophisticated software optimization on general-purpose CPUs encountered limits in parallel execution width, instruction overhead, memory bandwidth, locality, power, and scaling.
2. **GPU to specialized AI accelerators:** increasingly sophisticated GPU software continues to encounter workload-specific limits in utilization, data movement, irregularity, communication, latency, determinism, and energy efficiency.

The software ecosystem did not fail in either transition. Software optimization exposed architectural and physical limits that could no longer be overcome economically or energetically by software alone. Different workloads encounter different limits; therefore, no single accelerator architecture is optimal for every workload or deployment environment.

## 3. Objectives

Primary objectives:

- Analyze the two major software-to-hardware transitions: CPU to GPU and GPU to domain-specific acceleration.
- Characterize modern AI workloads from a systems perspective and relate them to conventional enterprise and HPC workloads on one side and mobile and embedded edge workloads on the other.
- Develop a coherent, vendor-independent architectural taxonomy.
- Connect workload behavior, software optimization, architectural bottlenecks, and hardware responses.
- Survey significant commercial systems and credible emerging products as implementations of architectural choices.
- Compare implementation approaches and explain their tradeoffs, strengths, limitations, and appropriate workloads.
- Treat datacenter, enterprise edge, workstation, client, mobile, embedded, automotive, and robotics systems as one AI compute continuum.
- Explain why software optimization on existing hardware eventually becomes insufficient, technically or economically.

Secondary objectives:

- Provide limited historical context where it explains an architectural transition.
- Identify future research directions and promising but insufficiently documented efforts.
- Produce reusable figures, comparison tables, and presentation-ready analytical assets.
- Serve as a backgrounder for later focused studies.

## 4. Intended Audience

The primary audience comprises senior software engineers, software and systems architects, OS and runtime architects, performance engineers, AI infrastructure engineers, technical decision makers, and engineering managers.

Readers are assumed to understand operating systems, parallel programming, caches, CPUs, GPUs, cloud computing, and modern AI concepts. Graduate-level computer architecture knowledge is not assumed. Mathematics shall be used only where it improves engineering understanding; formal methods and further references belong in an appendix.

## 5. Scope

Included:

- AI accelerator architectures and limited historical evolution.
- Workloads and acceleration at datacenter, hyperscale, enterprise, enterprise edge, workstation,  laptop, mobile, embedded AI.
- The full range of offload systems, from always-on low-power devices to rack- and cluster-scale infrastructure.
- Workload behavior; software, compiler, runtime, OS, memory, storage, interconnect, packaging, power, thermal
- Economic constraints.
- Shipping products, officially announced systems, publicly demonstrated prototypes, and credible development programs.
- Selected university, startup, industrial laboratory and moonshot efforts in a clearly separated forward-looking treatment.

Excluded or deferred:

- General HPC unrelated to AI.
- Classical supercomputer history except where it explains an AI-accelerator transition.
- Consumer graphics unrelated to compute.
- General semiconductor manufacturing unrelated to accelerator design or availability.
- Quantum computing, except for brief acknowledgement in the conclusion as a candidate for a future revision.

## 6. Guiding Philosophy

The study follows this recurring chain:

**AI workloads → Software optimization → Architectural bottlenecks → Hardware innovations → Commercial systems → Deployment across the AI compute continuum**

It is organized around four connected concerns:

1. The computational and systems problem.
2. The architectural response.
3. The industrial implementation.
4. The deployment environment and economics.

The organizing unit is architecture rather than company. Vendors and products demonstrate how different organizations implement architectural ideas under different workload, software, economic, and deployment constraints.

## 7. Paper Design Invariants

### DI-1 — Workload First

Motivate architectural concepts with the computational and systems pressures that required them.

### DI-2 — Architecture Before Vendor

Introduce architectural ideas before commercial implementations.

### DI-3 — Deployment Awareness

Identify the intended deployment environment and constraints for every architecture: hyperscale, enterprise datacenter, enterprise edge, workstation, desktop, laptop, mobile, embedded, robotics, or automotive.

### DI-4 — Engineering Metrics

Identify the metric being optimized, such as latency, throughput, utilization, bandwidth, energy, cost, determinism, reliability, or scalability. Avoid unqualified claims such as “faster.”

### DI-5 — Evidence Separation

Clearly separate verified facts, analysis, author assessment, and future speculation.

### DI-6 — Comparative Neutrality

Evaluate architectures relative to workloads and constraints. Avoid claims of universal superiority.

### DI-7 — Historical Restraint

Include history only when it explains an architectural transition or taxonomy.

### DI-8 — Living Architecture

Keep the taxonomy and comparison structures extensible across future hardware generations.

### DI-9 — Software Before Hardware

For every significant architectural transition, explain:

1. What software attempted on the preceding hardware class.
2. How far those optimizations succeeded.
3. Which architectural, physical, economic, or energy limit became dominant.
4. Which hardware response addressed that limit.
5. Which new limitations the response introduced.

Apply this explicitly and separately to software on general-purpose CPUs and to modern software on classic GPU architectures.

### DI-10 — Compute Continuum

Treat offload hardware holistically across the continuum from hyperscale datacenters and enterprise edge servers to workstations, desktops, laptops, phones, embedded systems, and real-time robotics. Examine how architectural ideas migrate in both directions across this continuum.

### DI-11 — Engineering Takeaways

Every substantive chapter concludes with concise implications for software, systems, platform, and hardware decision makers.

## 8. Research Methodology

Use sources in the following order of preference:

1. Official architecture manuals, ISA documentation, product documentation, and technical whitepapers.
2. Hot Chips, ISSCC, ISCA, MICRO, HPCA, ASPLOS, IEEE, ACM, and comparable proceedings.
3. Peer-reviewed papers and influential preprints when peer-reviewed material is unavailable.
4. Official engineering blogs, developer documentation, and technical presentations.
5. Reputable independent engineering analysis.
6. Financial disclosures, technical interviews, and reputable industry reporting for roadmap or development-program evidence.

Vendor specifications may establish documented product characteristics. Vendor benchmark claims require explicit qualification and shall not be treated as independent validation.

Conflicting claims shall be presented with their measurement boundaries, definitions, and sources. Preference shall be given to reproducible measurements and sources that disclose methodology.

## 9. Evidence Classification

- **A — Shipping and verified:** shipping hardware with public documentation and meaningful independent verification.
- **B — Officially announced:** announced hardware with official specifications or architectural disclosure.
- **C — Publicly disclosed development:** prototypes, research demonstrations, patents, conference disclosures, or confirmed development programs.
- **D — Credibly reported:** information supported by reputable reporting, clearly labeled and not presented as established product fact.
- **E — Speculative or moonshot:** early concepts and weakly documented efforts, confined to explicitly forward-looking sections.

Shipping, announced, developmental, reported, and speculative material shall never be mixed without visible classification.

## 10. Comparison Methodology

Compare products and systems at distinct levels:

- Silicon or package.
- Board or module.
- Server or node.
- Rack, pod, or appliance.
- Cluster or scale-out system.

For client and edge hardware, additionally distinguish SoC, device, desktop or workstation, embedded platform, automotive platform, and robotic system.

Never mix metrics across levels. Clearly identify whether throughput, memory capacity, bandwidth, interconnect, power, cost, or efficiency applies per die, package, board, node, rack, device, or cluster. Distinguish dense from sparse arithmetic, training from inference, and measured from theoretical performance.

Use a consistent evaluation template where evidence permits:

- Design objective and deployment target.
- Primary workloads.
- Execution and programming model.
- Compute organization and supported precision.
- Memory hierarchy and data movement.
- Interconnect and scaling.
- Compiler, runtime, and ecosystem maturity.
- Power, thermal, physical, and economic envelope.
- Strengths, limitations, and appropriate deployment scenarios.

## 11. Workload Analysis Framework

Analyze each major workload through:

- Computational graph and operator characteristics.
- Tensor or matrix shapes and batch behavior.
- Dense, sparse, irregular, conditional, or sequential structure.
- Precision and numerical requirements.
- Memory footprint, reuse distance, locality, caching, and memory hierarchy behavior.
- Arithmetic intensity and data-movement cost.
- Latency, throughput, determinism, and real-time requirements.
- Communication, synchronization, routing, and load-balancing behavior.
- Scaling characteristics across devices and nodes.
- Energy, thermal, battery, and idle-state constraints.
- Existing software optimizations and their practical limits.
- Architectural features that alleviate or worsen the bottlenecks.
- Deployment behavior across the AI compute continuum.

Representative workloads include large-model training, fine-tuning and adaptation, inference prefill, autoregressive decode, recommendation and ranking, mixture-of-experts models, retrieval and embeddings, sparse and graph computation, computer vision and video, multimodal inference, diffusion and generative media, scientific AI, edge and client inference, robotics, and sensor fusion.

## 12. Special Emphasis: Software-Visible Limits

The study shall provide deeper-than-average treatment of limitations visible to software and systems architects. This includes, but is not limited to:

- Cache capacity, locality, reuse distance, and hierarchy effects.
- Register pressure, shared memory, scratchpads, and operand movement.
- Sparse matrices, indirect addressing, divergence, load imbalance, and poor prefetchability.
- Nonuniform and non-isotropic workload behavior.
- Dynamic graphs, conditional execution, routing, and synchronization.
- KV-cache capacity and movement.
- Host-device and accelerator-to-accelerator communication.
- Distributed training collectives and mixture-of-experts all-to-all traffic.
- GPU utilization under small batches, sequential dependencies, and latency-sensitive inference.
- Kernel fusion, tiling, quantization, pruning, scheduling, and graph compilation.
- Idle power, wake-up cost, power islands, DRAM activity, and always-on inference in phones and embedded devices.

The purpose is to make the engineering case for investment in new hardware classes without implying that specialization automatically improves every workload.

## 13. Architectural Taxonomy Principles

Do not mix abstraction levels. Classify separately:

- **Execution and instruction models:** scalar, vector/SIMD, SIMT, VLIW, dataflow, and spatially scheduled execution.
- **Microarchitectural organizations:** out-of-order CPU, throughput GPU, matrix or tensor engine, systolic or semi-systolic array, FPGA or reconfigurable fabric, distributed-SRAM design, wafer-scale mesh, and memory-centric architecture.
- **Dataflow strategies:** weight-, output-, row-, or activation-stationary and streaming variants.
- **Memory organizations:** coherent cache hierarchy, noncoherent cache, software-managed scratchpad, distributed SRAM, HBM-backed accelerator, unified physical memory, and virtual unified memory.
- **Scheduling:** dynamic hardware scheduling, compiler/static scheduling, and hybrid approaches.

Vendor terminology such as “NPU,” “tensor processor,” or “AI engine” shall not override the underlying architectural classification.

## 14. Writing Standards

Use precise engineering language suitable for experienced software and systems practitioners. Introduce mathematics only when it clarifies an architectural concept. Keep formal derivations and links to formal methods in an appendix.

Every major discussion should answer:

- What problem is being solved?
- What did software already attempt?
- Why did that approach reach a limit?
- How does the hardware response work?
- What tradeoffs and new limitations result?
- Which workloads and deployment environments benefit?

Avoid vendor advocacy, unsupported causal claims, vague superlatives, and comparisons without measurement boundaries.

## 15. Figures and Tables

Figures shall prioritize conceptual understanding over decoration. Preferred forms include workload-to-bottleneck-to-solution mappings, execution pipelines, memory hierarchies, dataflow diagrams, communication topologies, compute-continuum maps, and architecture comparison matrices.

Tables shall identify evidence class, product status, measurement level, precision, sparsity assumptions, power boundary, and source date where relevant. Figures and tables should be reusable in later presentations without forcing the manuscript to adopt slide-oriented structure.

## 16. Governance and Evolution

This Charter is the governing methodology document but remains revisable. Changes are appropriate when they improve technical accuracy, taxonomy, clarity, consistency, scope control, or maintainability.

The project follows a lightweight iterative process. Substantive changes require a new document revision, but process overhead shall remain secondary to research and manuscript development.

Expected stability:

| Component | Expected stability |
|---|---|
| Mission and central thesis | Very high |
| Design invariants | Very high |
| Evidence and comparison methodology | High |
| Architectural and workload taxonomy | Medium |
| Chapter organization | Medium |
| Product landscape and tables | Low |
| Future outlook | Very low |

## 17. Future Scope

Potential future editions may expand treatment of quantum computing, analog and mixed-signal AI, photonic computing, spintronics, advanced processing-in-memory, superconducting logic, and post-CMOS architectures.

Quantum computing is outside the present scope. The conclusion may briefly identify it as a future effort worthy of evaluation in a later revision, particularly for optimization and simulation rather than current mainstream AI acceleration.

## 18. Versioning

- **v0.x:** Charter development and controlled refinement.
- **v1.0:** Charter stabilized for the first complete manuscript draft.
- **v1.x:** Minor revisions during manuscript development.
- **v2.x:** A later edition incorporating substantial structural or architectural developments.

## Appendix A — Normative Terminology and Definitions (Planned)

The appendix will provide canonical definitions for recurring architectural, workload, performance, deployment, and product-status terms, including accelerator, tensor processor, NPU, SIMD, SIMT, dataflow, systolic array, scratchpad, unified memory, HBM, arithmetic intensity, TOPS, FLOPS, training, inference, prefill, decode, and AI PC.
