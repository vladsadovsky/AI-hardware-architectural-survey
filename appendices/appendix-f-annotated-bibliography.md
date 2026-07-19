# Appendix F. Annotated Bibliography

## F.1 Purpose and Selection Method

The consolidated References section contains the complete citation record. This appendix is a guided reading list: it identifies the sources that most directly support the survey’s framework, explains what each source establishes, and states how not to use it. It is selective rather than exhaustive.

Reference labels below use the manuscript’s chapter-group notation—for example **[1.2]** means Chapter 1, Reference 2 in the consolidated list. Vendor sources are useful for documented architecture and product characteristics but do not independently validate performance superiority. Snapshot reporting is separated from durable architectural literature.

## F.2 Foundations: Bounds, Energy, and Scale

### Wulf and McKee, “Hitting the Memory Wall” — [1.1]

**Why read it:** Establishes the historical processor–memory divergence and the intuition that arithmetic improvement can expose rather than eliminate data-supply limits.

**Use in this survey:** Frames Chapter 1’s first transition and the recurring memory-distance problem.

**Boundary:** It predates modern cache hierarchies, HBM, and AI workloads. Use the mechanism and historical argument, not its numerical assumptions as current constants.

### Williams, Waterman, and Patterson, “Roofline” — [1.2]

**Why read it:** Provides the compact relationship among operational intensity, bandwidth, and peak arithmetic throughput.

**Use:** Basis for §2.5’s decode bound and Appendix B.

**Boundary:** Roofline is a ceiling model. Dependencies, latency, irregular access, occupancy, scheduling, communication, and service objectives can keep performance below both roofs.

### Esmaeilzadeh et al., “Dark Silicon” — [1.3]

**Why read it:** Explains why transistor availability no longer implies simultaneous high-activity use under a fixed power envelope.

**Use:** Supports specialization as an allocation of limited active area and energy rather than a response to transistor scarcity alone.

**Boundary:** Process projections age. The durable result is the power-constrained design logic.

### Barroso and Hölzle, “The Case for Energy-Proportional Computing” — [1.4]

**Why read it:** Establishes that low-load system behavior matters when infrastructure spends substantial time below peak utilization.

**Use:** Connects datacenter fleet economics to mobile-style power-domain and idle-energy thinking.

**Boundary:** It is a datacenter argument, not a direct model of modern accelerator energy per token.

### Horowitz, “Computing’s Energy Problem” — [4.1]

**Why read it:** Gives a canonical order-of-magnitude comparison among arithmetic, on-chip storage, and off-chip DRAM movement.

**Use:** Supports the survey’s physical argument that locality can matter more than arithmetic count.

**Boundary:** The numerical table is process- and voltage-specific. Preserve the boundary and avoid quoting the figures as universal current constants.

### Amdahl, “Validity of the Single Processor Approach” — [5.2]

**Why read it:** Provides the canonical upper bound on speedup when only part of a workload is accelerated.

**Use:** Grounds the CPU–accelerator system-boundary analysis.

**Boundary:** Modern heterogeneous partitioning makes the serial fraction dynamic by adding transfer, queueing, and orchestration terms.

## F.3 Workloads and Software Ceilings

### Vaswani et al., “Attention Is All You Need” — [1.15]

**Why read it:** Defines the transformer structure whose training, prefill, decode, and KV-state behavior shape much of the current hardware landscape.

**Use:** Workload origin, not hardware evidence.

**Boundary:** Later transformer variants change attention, KV heads, sparsity, context, and routing; do not treat one 2017 model as the whole workload class.

### Dao et al., “FlashAttention” — [2.2]

**Why read it:** Demonstrates that exact attention can be accelerated materially by IO-aware tiling and reduced HBM traffic.

**Use:** Strong evidence for the manuscript’s rule that disciplined software optimization precedes hardware claims.

**Boundary:** It changes avoidable attention traffic, not every model-state read, KV-capacity requirement, or autoregressive dependency.

### Kwon et al., “PagedAttention” — [2.3]

**Why read it:** Shows how paging concepts reduce KV-cache fragmentation and improve serving throughput.

**Use:** Supports the serving-runtime layer in Chapters 2 and 9.

**Boundary:** Allocation efficiency does not eliminate the information capacity or access bandwidth of live KV state.

### Naumov et al., DLRM — [2.4], and Mudigere et al. — [2.5]

**Why read them:** DLRM identifies the mixed dense/embedding structure of recommendation; the production training study exposes simultaneous compute, memory-capacity, bandwidth, and network pressure.

**Use:** Prevents recommendation from being misclassified as only dense neural inference.

**Boundary:** Specific table sizes and system ratios are workload- and generation-dependent.

### Fedus, Zoph, and Shazeer, “Switch Transformers” — [2.10]

**Why read it:** Establishes the compute-efficiency motivation for sparse expert activation at model scale.

**Use:** Defines the workload side of the MoE trade.

**Boundary:** Compute per token is not total system efficiency. Expert placement, imbalance, routing, and communication must be added.

### Li et al., “Lina,” and Hwang et al., “Tutel” — [2.20]

**Why read them:** Measure and optimize the all-to-all communication and scheduling costs of distributed MoE.

**Use:** Quantitative counterweight to unqualified “MoE is more efficient” claims.

**Boundary:** Reported fractions depend on model, topology, software, scale, and overlap.

### Ding and Zhong, reuse-distance analysis — [2.13]

**Why read it:** Provides a cache-independent language for temporal locality.

**Use:** Supports workload signatures that travel across architectures more cleanly than one cache’s miss rate.

**Boundary:** Reuse distance alone does not describe spatial overfetch, bank conflict, translation, or dependent-access latency.

### Bell and Garland, sparse matrix-vector multiplication — [2.14]

**Why read it:** Shows how sparse formats, row structure, useful bandwidth, and load balance shape accelerator behavior.

**Use:** Grounds the manuscript’s distinction between structured and irregular sparsity.

**Boundary:** Sparse behavior varies dramatically by matrix distribution and format; do not generalize one benchmark set to all sparse AI.

## F.4 Architectural Contracts and Mapping

### Kung, “Why Systolic Architectures?” — [3.1]

**Why read it:** Canonical explanation of rhythmic local communication and spatial reuse.

**Use:** Defines the systolic mechanism independently of later TPU marketing.

**Boundary:** It does not prescribe one stationary dataflow or prove that systolic arrays fit dynamic or irregular workloads.

### Chen et al., Eyeriss — [1.10]

**Why read it:** Connects spatial dataflow, local reuse, and energy-conscious accelerator design.

**Use:** Historical and methodological anchor for dataflow comparison across Chapter 3 and §6.2.

**Boundary:** CNN-centric results and an older process should not be transferred directly to transformer products.

### Parashar et al., Timeloop — [3.2]

**Why read it:** Formalizes systematic exploration of mappings across accelerator storage and compute structures.

**Use:** Demonstrates why an architecture cannot be evaluated independently of its mapping.

**Boundary:** Model fidelity depends on the supplied architecture, workload, and energy/action data.

### Kwon et al., data-centric DNN dataflows — [3.3]

**Why read it:** Provides a common representation for reuse, performance, and hardware cost across dataflows.

**Use:** Supports the manuscript’s separation of dataflow strategy from microarchitectural family.

**Boundary:** The framework organizes tradeoffs; it does not identify one universal stationary choice.

### Micikevicius et al., mixed-precision training — [3.4]

**Why read it:** Shows that storage, multiplication, accumulation, and master-state precision can be chosen differently while preserving training behavior.

**Use:** Basis for treating precision as a multi-part numerical contract.

**Boundary:** Convergence evidence applies to tested models and recipes; lower precision always requires workload-specific validation.

### Chen et al., TVM — [3.6]

**Why read it:** Separates computation from schedule and applies automated search across hardware targets.

**Use:** Compiler evidence for mapping quality as a first-class architectural variable.

**Boundary:** An optimizing compiler reduces mapping cost but does not erase target-specific tuning or unsupported operations.

### Lattner et al., MLIR — [3.7]

**Why read it:** Explains reusable multi-level intermediate representations and progressive lowering.

**Use:** Supports Chapter 9’s claim that compiler infrastructure lowered the entry cost for new accelerators.

**Boundary:** Shared compiler infrastructure does not create equal library maturity, performance portability, or operational support.

### BlueConnect — [3.9]

**Why read it:** Decomposes all-reduce against heterogeneous network hierarchies.

**Use:** Connects collective algorithms to topology rather than treating network bandwidth as one scalar.

**Boundary:** Current fabrics and collective libraries differ; use the decomposition method, not one platform result as timeless.

## F.5 CPU, GPU, and Software-Platform Sources

### Intel Optimization Reference Manual — [5.1]

**Why read it:** Documents the performance sensitivities of modern out-of-order CPUs: front-end supply, dependencies, caches, translation, vectorization, and memory-level parallelism.

**Use:** Grounds the CPU baseline in an architecture manual rather than caricature.

**Boundary:** Vendor documentation explains behavior and optimization; it is not an independent cross-vendor benchmark.

### Lindholm et al., “NVIDIA Tesla” — [5.4]

**Why read it:** Documents the transition to a unified programmable GPU architecture.

**Use:** Historical anchor for the first transition.

**Boundary:** Current GPUs differ radically in memory, scheduling, tensor units, and system integration.

### Nickolls et al., “Scalable Parallel Programming with CUDA” — [5.5]

**Why read it:** Explains the programming hierarchy and scalable block scheduling that made GPU parallelism accessible.

**Use:** Establishes CUDA as a programming contract.

**Boundary:** The current CUDA moat includes far more than the original kernel model: libraries, compatibility, distributed systems, tools, and operations.

### Chetlur et al., cuDNN — [5.6]

**Why read it:** Shows how optimized primitives become a framework-level platform asset.

**Use:** Evidence that software capital compounds around hardware.

**Boundary:** It is an early library paper; today’s platform includes many more layers and operators.

### NVIDIA V100 and H100 architecture documents — [5.8][5.9]

**Why read them:** Document tensor-core integration and later absorption mechanisms including narrow precision, structured sparsity, asynchronous movement, and NVLink scale-up.

**Use:** Product architecture evidence for the absorption thesis.

**Boundary:** Vendor architecture specifications establish shipped mechanisms, not independent application superiority.

### AMD HIP programming model — [5.7]

**Why read it:** Documents a source-compatible GPU programming strategy intended to reduce porting friction.

**Use:** Supports Chapter 9’s distinction between kernel-language compatibility and the larger ecosystem gap.

**Boundary:** Source portability does not guarantee performance portability or equivalent distributed and operational tooling.

## F.6 Domain-Specific Accelerator Sources

### Jouppi et al., TPU v1 — [1.12]

**Why read it:** Rare production disclosure connecting a stable workload portfolio, deterministic tail-latency requirements, matrix hardware, software-managed memory, and deployment-scale results.

**Use:** The survey’s strongest positive necessity-test case.

**Boundary:** Comparisons are against contemporary CPU/GPU systems and Google’s own production workload mix. Do not treat them as a current product ranking.

### Norrie et al., TPUv2/v3 design process — [6.1]

**Why read it:** Documents how an inference tensor processor evolved into HBM-backed training systems with inter-chip communication.

**Use:** Evidence that specialized families can absorb workload change when an owner controls models, compiler, and fleet.

**Boundary:** The vertically integrated owner context is part of the result.

### Jouppi et al., TPU v4 — [2.24]

**Why read it:** Provides system-scale evidence for optical topology reconfiguration, embedding-specific hardware, power, reliability, and 4,096-chip deployment.

**Use:** Supports pod-level comparison and the view that interconnect is part of the accelerator.

**Boundary:** Vendor-published evaluation over the vendor’s portfolio; preserve workload and system boundaries.

### Abts et al., “Think Fast” — [5.10], and “Answer Fast” — [6.6]

**Why read them:** The first details a deterministic, compiler-scheduled, distributed-SRAM TSP; the second applies the contract to batch-one transformer inference.

**Use:** Principal evidence for the deterministic dataflow family.

**Boundary:** The architecture changes HBM bandwidth into SRAM-capacity and multi-chip placement constraints. System economics require the scaled deployment boundary.

### Putnam et al., Catapult — [6.3]

**Why read it:** Demonstrates fleet-scale FPGA deployment for a production datacenter service.

**Use:** Establishes reconfigurable fabric as a viable infrastructure layer.

**Boundary:** The result depends on fleet integration and workload placement; it is not proof that FPGA fabric universally beats ASICs or GPUs.

### Fowers et al., Brainwave — [6.2]

**Why read it:** Demonstrates batch-one serving with a soft NPU and weights pinned in distributed FPGA memory.

**Use:** Evidence for reconfigurable, latency-oriented serving and overlays.

**Boundary:** Model fit, numerical format, fleet context, and fabric cost constrain generalization.

### Cerebras WSE-3 disclosure — [6.7]

**Why read it:** Documents the scale of a current wafer-scale implementation: cores, SRAM, bandwidth, transistor count, and appliance context.

**Use:** Existence proof that reticle boundaries can be crossed with defect-tolerant architecture.

**Boundary:** Vendor specifications are per wafer; comparisons with packages must retain power, cooling, yield, external memory, and appliance boundaries.

### Aquabolt-XL — [6.8]

**Why read it:** Demonstrates arithmetic beside HBM banks and discusses an LPDDR-PIM mobile direction.

**Use:** Principal evidence for processing-in-memory as a concrete architecture rather than a slogan.

**Boundary:** Vendor-reported gains apply to supported bandwidth-bound kernels and a proprietary programming path.

### Modha et al., NorthPole — [6.10]

**Why read it:** Presents distributed all-SRAM inference with a carefully bounded same-process-node comparison.

**Use:** Strong evidence for near-memory inference when the model fits on die.

**Boundary:** Capacity is the defining cliff; the reported vision workloads do not establish large-model generality.

### Merolla et al., TrueNorth — [6.11], and Davies et al., Loihi — [6.12]

**Why read them:** Establish large-scale spiking hardware and, for Loihi, programmable neuron models and on-chip learning.

**Use:** Defines neuromorphic architecture by mechanism rather than press category.

**Boundary:** Neither validates mainstream transformer or dense-training economics.

## F.7 Client, Edge, and System Sources

### Arm Ethos-U55 Technical Reference Manual — [1.13]

**Why read it:** Provides a public microNPU contract: offline compilation, command execution, DMA, memory, interrupts, and power integration.

**Use:** Clean architectural anchor for the small end of the continuum.

**Boundary:** It documents one IP implementation, not all NPUs.

### ShiDianNao — [1.11]

**Why read it:** Makes the near-sensor locality argument concrete for vision.

**Use:** Historical anchor for moving computation toward sensor data.

**Boundary:** Research comparisons and older workloads do not establish current commercial performance.

### MLPerf Tiny, Client, and Automotive — [2.7][2.8][2.12]

**Why read them:** Define workload scenarios and reporting structures across constrained, client, and automotive deployments.

**Use:** Evidence that comparison boundaries and objectives differ across the continuum.

**Boundary:** Each benchmark suite covers only a subset of end-to-end product behavior; TOPS, battery impact, fallback, and certification remain outside many tests.

### Apple on-device and server foundation models — [8.5]

**Why read it:** Documents a curated production model tier spanning on-device and server execution.

**Use:** Supports Chapter 9’s observation that platform owners can convert an open coverage problem into a controlled model portfolio.

**Boundary:** It describes one vertically integrated ecosystem and does not establish cross-platform NPU superiority.

## F.8 Evidence on Industrial Outcomes

### Nervana cancellation sources — [2.22]

**Why read them:** Record an officially confirmed product-line cancellation through reputable industry reporting.

**Use:** Negative necessity-test case illustrating moving targets, internal portfolio decisions, and condition-4 failure.

**Boundary:** Reporting cannot prove that the architecture itself was unsound; the manuscript explicitly rejects that inference.

### Graphcore acquisition sources — [2.23]

**Why read them:** Establish the company’s acquisition and provide evidence about independent merchant outcomes.

**Use:** Supports the distinction between technical capability and ecosystem/economic survival.

**Boundary:** Acquisition is not a benchmark and should not be converted into a technical ranking.

### Chapter 7 snapshot sources — [7.1]–[7.10]

**Why read them:** Document the current product and ownership landscape used in the mid-2026 tables.

**Use:** Low-stability evidence for product status, roadmap, and commercial structure.

**Boundary:** Several entries are class D. They require date-stamped re-verification and should never support enduring microarchitectural claims without primary technical evidence.

## F.9 Suggested Reading Paths

**For software architects:** Roofline [1.2] → CUDA [5.5] → FlashAttention [2.2] → PagedAttention [2.3] → TVM/MLIR [3.6][3.7] → TSP [5.10].

**For hardware architects:** Horowitz [4.1] → Kung [3.1] → Eyeriss [1.10] → Timeloop/data-centric mapping [3.2][3.3] → TPU v1/v4 [1.12][2.24] → NorthPole/PIM [6.8][6.10].

**For infrastructure architects:** energy proportionality [1.4] → Borg [1.6] → TPU v4 resiliency [4.2] → BlueConnect [3.9] → PagedAttention [2.3] → Chapter 7 snapshot sources.

**For client and embedded architects:** ShiDianNao [1.11] → Ethos-U55 [1.13] → MLPerf Tiny/Client/Automotive [2.7][2.8][2.12] → Edge TPU evaluation [2.17] → Apple’s curated model tier [8.5].

**For technical decision makers:** TPU v1 [1.12] → FlashAttention/PagedAttention [2.2][2.3] → Nervana and Graphcore outcome sources [2.22][2.23] → Chapter 7 ownership evidence → Appendix G.

The reading order mirrors the survey’s method: establish the bound, understand what software recovered, inspect the contract-changing hardware response, and only then interpret product and market outcomes.
