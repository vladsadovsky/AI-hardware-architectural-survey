# Chapter 2. Computational Characteristics of Modern AI Workloads

This chapter characterizes representative AI workloads, identifies the bottlenecks they expose in real deployments, and determines when those bottlenecks justify changing the hardware architecture. The argument is not that every inefficiency requires an accelerator. It is that a repeatable workload can cross a technical and economic threshold at which further optimization of the existing platform costs more, consumes more energy, or delivers less useful work than a better-matched hardware design.

## 2.1 Why Workload Analysis Must Precede Architecture

An accelerator is useful only in relation to a workload and a deployment objective. The same nominal operation count can produce different system behavior when tensor shapes, batch size, precision, sparsity, memory residency, request arrival, communication, or deadlines change. Peak TOPS or FLOPS cannot reveal whether execution units remain occupied, whether data arrives on time, whether a service meets its tail-latency objective, or whether a battery-powered system can sustain the workload without throttling.

This chapter therefore applies an expanded causal structure throughout:

> **Real-world problem → Workload behavior → Software mitigation → Residual architectural bound → Direct system consequence → Hardware implication**

The final consequence must be explicit. Depending on the deployment, it may be reduced utilization or scalability; increased mean or tail latency; higher memory footprint, energy, heat, or cost; missed deadlines; reduced determinism or reliability; or unacceptable quality loss. A bottleneck without a demonstrated consequence is only a suspected limitation, not an architectural requirement. A consequence without a demonstrated software ceiling is not yet a case for new hardware.

The analysis also distinguishes three levels that are often conflated:

- **Model behavior:** operators, tensor shapes, dependencies, sparsity, precision, and state.
- **Runtime behavior:** batching, compilation, memory allocation, scheduling, graph partitioning, and communication.
- **Deployment behavior:** request distribution, service objectives, battery and thermal envelope, sensor timing, connectivity, and economics.

A model can be compute-intensive in theory and still be memory-bound in deployment. A kernel can be efficient while the service is underutilized because requests arrive irregularly. A low-power accelerator can consume little energy internally while host wakeups and shared-memory traffic dominate system energy. These distinctions guide every workload family below.

### A running example

To keep the analysis concrete, this and later chapters return repeatedly to one system: a **document-assistant service** that answers questions over an organization’s documents by combining embedding-based retrieval with a large generative model—a dense transformer of roughly 70 billion parameters, a scale documented in open model releases [2.18]. The example appears in three deployments: a hyperscale consumer service aggregating millions of users; a private enterprise deployment serving one organization under data-governance constraints; and an on-device variant running a smaller distilled model on a laptop or phone. The same model graph traverses radically different workload signatures in the three deployments, which is precisely this chapter’s point, and later chapters use the same system to instantiate architectural contracts (Chapter 3), interacting stressors (Chapter 4), and the CPU–GPU boundary (Chapter 5).

### Technical limits and economic necessity

“Necessary” in this chapter does not mean that the workload is mathematically impossible on a CPU or GPU. It means that the current architecture cannot meet the required quality, latency, throughput, energy, thermal, capacity, reliability, or cost objective after reasonable software optimization. The decision is therefore both technical and economic.

Software should first remove avoidable work through better algorithms, batching, tiling, fusion, quantization, sparsity, compression, scheduling, placement, caching, and communication overlap. Hardware specialization becomes economically credible only when four conditions hold:

1. A residual bound remains, such as compulsory data movement, limited independent parallelism, unavoidable communication, minimum live state, or a deadline that prevents further batching.
2. That bound causes a material system consequence under the target deployment conditions.
3. A hardware change can alter the bound rather than merely move the bottleneck.
4. The recurring benefit over the system lifetime exceeds non-recurring design expense, additional silicon and integration cost, software enablement, operational complexity, portability loss, and obsolescence risk.

At hyperscale, small improvements in energy per token, fleet utilization, or rack capacity can be amortized over a large and stable workload. Enterprise deployments may reach a similar threshold when privacy, data-domain protection, predictable latency, or cloud operating cost justifies private AI infrastructure or a “mini-datacenter,” although lower aggregate demand makes utilization and lifecycle support more difficult. Mobile specialization is often amortized across product volume and repeated battery-energy savings. Embedded and robotic systems may justify specialization at lower computational volume when bounded response, mission energy, safety, or physical size cannot be met otherwise.

[**Figure 2.1 placeholder — From software optimization to an economic hardware threshold.** Plot useful work per dollar or joule against successive software optimizations on an existing architecture. Show diminishing returns approaching a residual architectural bound. A second curve represents a hardware response that changes the bound but starts with non-recurring design, software, integration, and lifecycle cost. Mark the workload volume or deployment constraint at which the lifetime benefit exceeds the transition cost. Include separate annotations for hyperscale volume, enterprise private infrastructure, mobile product volume, and embedded deadline or mission constraints.]

## 2.2 A Workload-Signature Taxonomy

Workload names are useful for product discussions but insufficient for architectural analysis. “Transformer,” “vision model,” or “graph AI” can contain phases with different tensor shapes, memory behavior, dependency structure, and service objectives. A formal taxonomy should therefore describe a workload phase through a **workload signature**: a vector of measured properties and distributions rather than one categorical label.

The signature combines three kinds of structure:

- **Computational structure:** operator mix, tensor-shape distribution, precision, arithmetic intensity, dependency depth, and available parallelism.
- **Data and access structure:** working-set size, reuse-distance distribution, spatial locality, useful bytes per transfer, sparsity density and pattern, metadata, and state lifetime.
- **Temporal and deployment structure:** arrival process, burstiness, batchability, service-time variance, deadlines, communication pattern, quality constraints, and change over time.

### Table 2.1 — Workload-signature dimensions and architectural meaning

| Signature dimension | Representative measure | Architectural question it answers |
|---|---|---|
| Operation and shape distribution | Operator frequency; tensor dimensions; shape variance | Can execution use wide vector, matrix, or tensor units consistently? |
| Arithmetic intensity | Useful operations per byte transferred at each hierarchy level | Is performance bounded by computation or by a particular memory boundary? |
| Working set and reuse | Live bytes; reuse-distance histogram; cache residency interval | Which data can remain in registers, caches, scratchpads, local SRAM, or device memory? |
| Spatial access structure | Stride; address dispersion; useful-byte fraction per transaction | Will prefetching, cache lines, and GPU memory coalescing convert bandwidth into useful data? |
| Sparsity structure | Density; block size; row-degree distribution; pattern stability | Can software reorder or compress the data, or is runtime sparse scheduling required? |
| Parallelism and dependency | Ready operations over time; critical-path depth | Can a wide throughput engine hide latency, or does sequential work dominate? |
| Control and work variance | Branch-path distribution; work per item; imbalance tails | Will SIMD or SIMT lanes remain active and partitions finish together? |
| State | Capacity; lifetime; growth; update frequency | Must state be resident, streamed, paged, replicated, or distributed? |
| Arrival and service process | Interarrival distribution; burstiness; batch window; service-time distribution | Can requests be aggregated without violating tail latency or deadlines? |
| Communication | Bytes and messages per useful operation; topology; collective pattern | Does scaling add productive compute faster than synchronization and movement? |
| Precision and quality | Required formats; convergence or accuracy sensitivity | Which low-precision or approximate transformations remain valid? |
| Deployment envelope | SLO, deadline, power, thermal, battery, reliability, and cost limits | Which otherwise acceptable implementation becomes infeasible in this system? |

Arithmetic intensity and the Roofline model provide a compact way to relate useful computation to bandwidth ceilings [1.2]. Reuse distance measures the amount of distinct data accessed between uses of the same data and therefore provides a more portable description of temporal locality than the miss rate of one particular cache [2.13]. Neither measure is sufficient by itself: AI services also require distributions for shapes, arrivals, service time, state lifetime, and communication.

For readers seeking a formal model, task arrivals can be treated as a marked stochastic process. Each arrival carries a mark describing its shape, sparsity, state, dependency graph, communication demand, quality requirement, and deadline. Memory references within the task form a second trace characterized by reuse distance, address dispersion, and correlation. This formulation helps distinguish two workloads with the same average operation count but different burstiness, locality, or tail behavior. The main text uses empirical distributions and signature tables; formal stochastic notation and model fitting belong in an appendix because production workloads are often correlated, phase-changing, and nonstationary.

[**Figure 2.2 placeholder — Workload signatures instead of workload labels.** Show several workload phases—training matrix multiplication, transformer decode, embedding lookup, graph aggregation, live video, and robotic planning—as rows against signature dimensions such as arithmetic intensity, locality, parallelism, control regularity, state, batchability, communication, and deadline. Use qualitative bands or measured-distribution glyphs, not a radar chart and not unsupported numeric rankings.]

### Working vocabulary for the hardware conclusions

The hardware conclusions in this chapter occasionally name architectural families before Chapters 3 and 6 define them precisely. For readers without a hardware-architecture background, the following working definitions suffice until then; each is developed fully in Chapter 6.

- **Matrix or tensor engine:** a hardware unit performing many multiply-accumulate operations per instruction over small matrix tiles, amortizing instruction and control overhead across the tile. Chapter 5 covers the GPU-integrated form; standalone accelerators build entire devices around the idea.
- **Systolic array:** a grid of simple processing elements that pass operands rhythmically to their neighbors, so a value fetched once from memory is reused many times as it flows through the array.
- **Spatial or dataflow accelerator:** a design that maps a computation’s operations and intermediate values onto an array of processing elements and on-chip routes, so data moves point-to-point between producers and consumers instead of through a central register file and instruction stream.
- **Scratchpad and distributed SRAM:** on-chip memory managed explicitly by software or a compiler rather than by cache hardware. “Distributed-SRAM designs” place large amounts of such memory beside each processing-element group so that model state can live on chip.
- **Memory-centric and near-memory designs:** organizations that place computation close to memory arrays—on the memory die, in the same package, or at the memory controller—so data-intensive operations avoid crossing a narrow external interface. “Compressed-domain execution” means operating directly on compressed or sparse-encoded data without first expanding it.
- **NPU (neural processing unit):** vendor-neutral shorthand for an integrated SoC accelerator block, typically combining a matrix engine, a vector unit, DMA, and local SRAM behind a compiler that maps whole model graphs onto it.
- **Reconfigurable fabric (FPGAs and successors):** logic whose datapaths, state machines, and interfaces are configured after manufacturing, trading clock rate and density for structural flexibility.
- **Wafer-scale integration:** building one logical accelerator across an entire silicon wafer, converting what would be inter-chip communication into on-wafer routing.

Where a conclusion below can be stated in terms of required *properties*—capacity, bandwidth, access granularity, scheduling behavior, placement of compute relative to state—it is; family names are used only where the property description would be more obscure than the name.

## 2.3 Dense Training

### Real-world problem

Dense training adjusts all or most model parameters over large datasets. It underlies foundation-model pretraining, computer vision, speech, multimodal learning, and many scientific models. The practical objective is normally to reach a defined quality target within an acceptable elapsed time and resource budget, not simply to execute one training step quickly. MLPerf Training reflects this distinction by measuring time to a specified quality target rather than isolated kernel throughput [2.1].

### Workload behavior

A training step performs a forward pass, stores or reconstructs intermediate activations, computes gradients in a backward pass, and updates parameters and optimizer state. Dense linear algebra—matrix multiplication, convolution, and attention—can provide high arithmetic intensity when tensor dimensions and batch sizes are large. Training also contains normalization, activation, reduction, indexing, loss, optimizer, and data-input operations with different shapes and intensity.

State is larger than the model weights alone. Gradients, optimizer state, activations, temporary workspaces, communication buffers, and framework allocations compete for device memory. Activation memory grows with batch size, sequence length, layer width, and depth. Techniques such as mixed precision, activation checkpointing, sharding, and optimizer-state partitioning reduce one component while adding recomputation, communication, or software complexity.

At multi-device scale, data parallelism replicates the model and exchanges gradients; tensor parallelism partitions operations; pipeline parallelism partitions layers; and fully sharded methods distribute parameters, gradients, and optimizer state. Each method changes communication volume, synchronization frequency, local memory demand, and susceptibility to imbalance.

### Bottleneck-to-consequence chains

**Problem: the model state or activation set exceeds device memory.** The runtime shards state, reduces microbatch size, offloads data, or recomputes activations. The immediate bottleneck becomes capacity and data movement rather than arithmetic. **Direct consequence:** smaller microbatches reduce matrix dimensions and accelerator utilization; offload raises latency and interconnect traffic; recomputation increases energy and time to train; insufficient capacity prevents the model from running at all.

**Problem: distributed workers must maintain one logically consistent update.** Gradient reductions, parameter exchanges, or sharded-state gathers place traffic on scale-up links and the network. The architectural bottleneck is collective bandwidth, latency, and topology relative to compute time. **Direct consequence:** workers wait at synchronization points, reducing accelerator utilization and scaling efficiency; stragglers extend every step; network power and cost rise as the system expands.

**Problem: pipeline stages or tensor partitions receive unequal work.** Different layer costs, sequence lengths, communication routes, or device speeds create bubbles and stragglers. The bottleneck is load balance and dependency scheduling. **Direct consequence:** provisioned accelerators sit idle even when aggregate arithmetic demand is high; useful throughput grows more slowly than device count; cost and energy per trained token increase.

**Problem: input preparation cannot supply accelerators.** Decoding, tokenization, augmentation, storage reads, and host-to-device transfers may lag compute. The bottleneck is the data path through storage, CPU, memory, and I/O. **Direct consequence:** launch gaps lower utilization and extend time to quality; adding accelerators can worsen the imbalance because input demand grows faster than preparation capacity.

**Problem: numerically sensitive training requires wider precision or additional scaling logic.** Lower-precision units offer greater throughput and lower data movement, but reductions, optimizer state, or unstable layers may require higher precision. The bottleneck becomes conversion, unsupported formats, or reduced use of dense low-precision units. **Direct consequence:** achieved throughput and energy efficiency fall below peak specifications; aggressive precision reduction can instead harm convergence and increase total training work.

### Deployment differences

Dense pretraining is primarily a datacenter workload because state, data, and elapsed compute exceed client and embedded envelopes. Fine-tuning, however, spans the continuum. Datacenters fine-tune large models or many tenant-specific variants. Workstations and high-end clients perform local adaptation when model size and memory allow. Embedded devices rarely train full models but may update small heads, calibration parameters, or online state. The architectural objective changes from cluster scaling and time to quality in the datacenter to memory footprint, privacy, and bounded energy on the client.

### Software ceiling and architectural conclusions

**Observation — capacity and data movement.** Mixed precision, checkpointing, recomputation, sharding, and offload allow larger training jobs to run, but each exchanges one scarce resource for another. After minimum-precision model state and the required live activations no longer fit locally, software must either move them or recompute them. **Conclusion:** when compulsory state traffic or recomputation extends time to quality enough that additional general-purpose devices cost more in energy and capital than local capacity, higher-bandwidth memory, larger distributed SRAM, memory-centric packaging, or a dataflow that retains operands closer to computation becomes economically justified.

**Observation — distributed synchronization.** Parallelism increases aggregate arithmetic capacity, but the model’s update semantics still impose gradient reductions, state gathers, pipeline dependencies, or expert exchanges. Compression and overlap hide only the communication for which independent computation is available. **Conclusion:** once non-overlappable communication or synchronization determines step time, adding conventional accelerators reduces scaling efficiency; topology-aware scale-up fabrics, collective engines, network offload, or architectures with different partition and residency choices are required to change the bound.

**Observation — load balance and input supply.** Better placement, asynchronous input pipelines, prefetching, and dynamic scheduling can reduce bubbles and starvation. They cannot manufacture useful work for a stage whose dependency has not resolved or supply data faster than the sustained storage, host, memory, and I/O path. **Conclusion:** persistent idle arithmetic despite a tuned pipeline indicates that the next investment belongs in I/O, scheduling, memory, or communication hardware—not automatically in more matrix throughput.

**Observation — numerical constraints.** Loss scaling, mixed precision, and selective accumulation preserve quality while using lower-precision units, but some reductions, optimizer states, or models still require wider formats. **Conclusion:** when additional quantization increases iteration count or harms convergence, the relevant hardware requirement is efficient support for the necessary precision and conversions; peak performance in a narrower format is not usable capacity.

## 2.4 Fine-Tuning and Adaptation

### Real-world problem

Organizations and devices need to adapt pretrained models to new domains, users, policies, languages, sensors, or tasks without repeating full pretraining. The value is faster specialization and lower data or compute cost, often with privacy or deployment constraints.

### Workload behavior

Full fine-tuning resembles training but operates on a smaller dataset and may use shorter runs or smaller batches. Parameter-efficient methods such as adapters and low-rank adaptation update a small fraction of parameters while keeping base weights fixed. LoRA, for example, freezes pretrained weights and trains injected low-rank matrices [2.9]. This reduces gradient and optimizer state for trainable parameters, but the forward and backward paths still traverse much of the base model. Multiple adapters may share one base model, changing storage and serving behavior.

### Bottleneck-to-consequence chains

**Problem: the base model fits poorly in local memory even though few parameters are trainable.** Frozen weights must still be resident or streamed for forward and backward computation. The bottleneck is model capacity and bandwidth, not only trainable-state size. **Direct consequence:** local adaptation becomes impossible, requires quantized or offloaded weights, or suffers long iteration latency and high energy from repeated movement.

**Problem: many tenant or user adaptations share one base model.** The runtime must select, load, cache, and sometimes combine adapters. The bottleneck is dynamic residency and request scheduling. **Direct consequence:** adapter swaps and fragmented batches lower utilization and increase tail latency; storing redundant base copies raises memory cost.

**Problem: privacy motivates on-device adaptation.** Training introduces sustained compute, memory writes, and thermal load beyond short inference bursts. The bottleneck is the client’s battery, passive thermal envelope, and memory capacity. **Direct consequence:** adaptation may throttle, take too long, interfere with foreground applications, or be restricted to charging and idle periods.

**Problem: continual or online adaptation changes model state while inference continues.** Consistency, rollback, validation, and catastrophic forgetting become system concerns. The bottleneck is safe state management rather than arithmetic alone. **Direct consequence:** unreliable updates can reduce model quality or availability; serialization between update and inference can increase latency.

### Software ceiling and architectural conclusions

**Observation — few trainable parameters do not imply a small execution footprint.** Parameter-efficient tuning removes much gradient and optimizer state, while quantization and offload reduce local capacity pressure. The frozen base model must still participate in forward and backward execution. **Conclusion:** if the minimum resident or repeatedly streamed base state exceeds local memory or energy limits, low-rank software techniques alone cannot make adaptation local; larger efficient memory, compressed execution, or a hardware path designed for low-batch training is required.

**Observation — shared bases create dynamic state-management work.** Adapter caching, grouping, and placement can reduce swaps, but privacy boundaries and request diversity constrain consolidation. **Conclusion:** at datacenter or enterprise scale, specialized residency management or memory hierarchy support is justified only when adapter switching and fragmentation materially dominate lifecycle cost; otherwise this remains a software scheduling problem.

**Observation — on-device adaptation is sustained work.** Scheduling adaptation while charging or idle is effective when the application can wait. It does not satisfy continual learning or immediate personalization requirements under a passive thermal and battery envelope. **Conclusion:** when delayed execution is unacceptable and platform energy remains above budget, efficient backward-pass support, localized parameter storage, and independently power-gated training resources become architectural requirements.

**Observation — safe update and rollback are consistency problems.** Extra arithmetic does not solve version validation, atomic activation, rollback, or concurrent inference. **Conclusion:** this bottleneck motivates protected state, transactional update paths, and runtime or storage support rather than a denser tensor engine. This verdict is worth marking explicitly: it is the necessity test returning a *software-and-system* answer rather than a hardware one, and the framework is designed to produce such answers as readily as hardware answers. Section 2.14 makes this symmetry systematic.

## 2.5 Transformer Inference: Prefill and Autoregressive Decode

### Real-world problem

Interactive language, coding, search, agentic, and multimodal systems must process an input context and then generate output while meeting time-to-first-token, inter-token latency, throughput, memory, energy, and cost objectives. Treating inference as one homogeneous workload hides the most important phase change.

### Workload behavior

**Prefill** processes the input tokens, creates intermediate activations, and populates the key-value cache. It can expose parallelism across sequence positions and often uses matrix-matrix operations with dimensions large enough to occupy tensor units. Attention over long prompts increases compute and memory traffic; conventional attention materializes large intermediate matrices, while IO-aware algorithms such as FlashAttention tile the operation to reduce HBM traffic [2.2].

**Decode** generates one new token per sequence step. Each step reads model weights and the accumulated KV cache, performs operations for a small number of new token positions, samples or selects a token, and then extends the cache. Parallelism exists across concurrent sequences and model dimensions, but the dependency between successive tokens limits parallelism within one sequence. At low batch size, matrix operations become narrow and weight movement can dominate useful arithmetic.

[**Figure 2.3 placeholder — The memory-distance problem in AI execution.** Show registers, local SRAM or shared memory, caches, device memory or HBM/LPDDR, host memory, and remote or storage tiers. For each outward step, show increasing capacity together with increasing latency and movement energy. Overlay two paths: tiled dense prefill with substantial local reuse, and low-batch decode that repeatedly streams weights and growing KV state. Use normalized or source-bounded values; do not present old process-specific latency or energy numbers as current universal constants. Explain that caches reduce average access cost only when the working set and reuse-distance distribution allow data to be reused before eviction.]

### A worked bound: batch-one decode against current hardware

The decode bound can be computed directly from vendor-documented characteristics, and doing so is more instructive than any qualitative statement. The following is an author-computed illustration from published specifications [2.18][2.19]. It uses idealized assumptions that *favor* the GPU—perfect overlap, no scheduling overhead, no KV-cache traffic—so it is an upper bound on achievable behavior, not a benchmark.

Consider the running example’s 70-billion-parameter dense transformer serving a single interactive user (batch size one). Each generated token requires reading every model weight once; weight reuse across tokens is impossible within one sequence and becomes available only through batching. At 8-bit precision the weights occupy roughly 70 GB. An NVIDIA H100 SXM provides 3.35 TB/s of HBM3 bandwidth and roughly 1.98 PFLOPS of dense FP8 matrix throughput [2.19]. Three consequences follow from division alone:

- **A token-rate ceiling.** Streaming 70 GB per token through 3.35 TB/s permits at most ≈48 tokens per second for one sequence, before KV-cache reads, activations, or any real-system overhead. No increase in arithmetic throughput changes this number.
- **An arithmetic-intensity mismatch.** Dense decode performs roughly two operations per parameter per token—about 2 operations per byte read at 8-bit precision. The H100’s compute-to-bandwidth balance point is ≈590 FLOP per byte (1.98 PFLOPS ÷ 3.35 TB/s). Batch-one decode therefore presents the machine with roughly **0.3% of the arithmetic intensity it is provisioned for**: more than 99% of the matrix throughput is unusable in this phase regardless of software quality.
- **What batching buys, and what it costs.** Serving many sequences concurrently reuses each weight read across the batch, raising arithmetic intensity roughly linearly with batch size until compute or memory capacity binds. This is why continuous batching works—and why its benefit is capped by the latency objective and by KV-cache capacity, which grows with every admitted sequence.

Figure 2.4 plots this bound across representative memory systems. The method generalizes: for any bandwidth-bound phase, the ratio of compulsory bytes per unit of useful work to sustained bandwidth is a floor that only memory-system or model changes can move.

![**Figure 2.4 — Batch-one decode is a bandwidth bound, not a compute bound.** Left panel: roofline for a current datacenter GPU (dense BF16 and FP8 ceilings, HBM-bandwidth diagonal) with batch-one decode (arithmetic intensity ≈2 FLOP/byte) and batched prefill (≈300 FLOP/byte and above) marked. Right panel: maximum batch-one tokens/s for a 70B-parameter 8-bit model, computed from the documented peak memory bandwidth of representative platforms, against a 20 tokens/s interactive-service reference line. Author-computed from vendor datasheets; idealized upper bounds, not measurements.](figures/fig02-04-decode-bandwidth-bound.png)

### Bottleneck-to-consequence chains

**Problem: long prompts increase attention work and intermediate traffic.** Standard attention has quadratic compute and intermediate-memory behavior in sequence length. The bottleneck is HBM traffic and temporary storage as well as arithmetic. **Direct consequence:** prefill latency and memory footprint rise rapidly; fewer concurrent requests fit; time to first token and service cost increase. IO-aware tiling reduces traffic but does not remove all sequence-length scaling.

**Problem: decode advances sequentially for each request.** Low-batch matrix-vector or narrow matrix operations cannot always occupy a wide accelerator. The bottleneck is insufficient parallel work and repeated model-weight movement. **Direct consequence:** arithmetic-unit utilization falls; inter-token latency and energy per token become dominated by memory bandwidth and fixed launch or scheduling costs.

**Problem: the KV cache grows with active sequence length for fixed model dimensions.** Each live request owns dynamic state whose lifetime and final size are uncertain. The bottleneck is device-memory capacity, fragmentation, and allocation policy. **Direct consequence:** batch size and concurrency are capped, reducing serving throughput and increasing queueing; copying or evicting cache state increases latency and energy. PagedAttention applies paging concepts to reduce fragmentation and redundant cache storage [2.3].

**Problem: request lengths and arrival times vary.** Static batches develop finished sequences, stragglers, and padding waste; dynamic batching must continuously insert and remove requests. The bottleneck is scheduling and memory management. **Direct consequence:** poor policies either waste compute on padding, leave capacity idle, or delay latency-sensitive requests to form larger batches.

**Problem: prefill and decode prefer different resource balances.** Prefill often benefits from high compute throughput, while decode often benefits from bandwidth, capacity, and low scheduling overhead. A single pooled device type must compromise or separate phases imperfectly. **Direct consequence:** one phase leaves resources underused; co-located phases interfere; disaggregating them adds KV-cache transfer and network dependencies that can raise latency and reduce reliability.

**Problem: quality techniques increase per-token work.** Beam search, speculative verification, tool use, retrieval, long reasoning traces, or multiple sampled candidates alter batch shape and state lifetime. The bottleneck may shift among compute, cache capacity, scheduler complexity, and external-service latency. **Direct consequence:** headline tokens-per-second figures cease to predict end-to-end response latency or cost.

### Deployment differences

Hyperscale services can aggregate requests to improve throughput but must protect tail latency and fairness. Enterprise deployments may have lower arrival rates, making large accelerators difficult to utilize economically. Client systems often serve one user with batch size near one; shared-memory capacity, bandwidth, battery, and thermals dominate. Embedded language interfaces may use smaller models but impose deterministic response and offline availability. The same model can therefore be compute-limited in datacenter prefill, bandwidth-limited in client decode, and capacity-limited on an embedded platform. The running example traverses all three regimes: the hyperscale document assistant forms batches of dozens of sequences within its latency budget and operates near the compute-bound region during prefill; the enterprise deployment often has too few concurrent users to escape the worked batch-one bound above; and the on-device variant is distilled precisely so that weights and KV state fit shared memory at all.

### Software ceiling and architectural conclusions

**Observation — IO-aware attention changes traffic but not all scaling.** FlashAttention and related tiling avoid materializing large intermediates and increase on-chip reuse, and the measured gains are material: the original work reported a 15% end-to-end training speedup on BERT-large against an MLPerf 1.1 record entry and roughly 3× on GPT-2 at sequence length 1K, from memory-traffic reduction alone [2.2]. That is exactly why this survey treats software optimization as the mandatory first response. But such techniques do not remove the required attention computation, all reads of model state, or all sequence-dependent state growth. **Conclusion:** when the optimized compulsory traffic or arithmetic for the supported context still exceeds the latency, capacity, or energy envelope, more local memory, different attention support, memory-centric execution, or an algorithmically compatible specialized dataflow is needed.

**Observation — decode is dependency- and bandwidth-constrained.** Continuous batching, kernel fusion, quantization, speculative decoding, and cache paging improve throughput. A single sequence still produces its next token only after the preceding step, while latency objectives cap the time available to form a larger batch. **Conclusion:** when the admissible batch cannot expose enough independent work to fill a wide GPU, adding wider tensor throughput does not solve the problem. The hardware properties that do change the bound are higher sustained bandwidth per byte of live state, execution granularity matched to narrow matrix-vector work, lower fixed per-step scheduling cost, and memory organizations that keep weights and KV state closer to the arithmetic. Persistent kernels and improved schedulers are software expressions of the same requirement and terminate at the same physical ceiling computed above.

**Observation — KV-cache software improves allocation efficiency, not information capacity.** Paging and sharing reduce fragmentation and redundant storage—vLLM reported 2–4× serving throughput at equal latency from this memory-management change alone [2.3]—but the live cache required by active sequences remains state that must reside somewhere and be accessed. **Conclusion:** when minimum live state caps profitable concurrency, the architectural response must increase effective capacity, compress or transform the state in hardware-compatible form, or place computation closer to the memory holding it.

**Observation — prefill and decode occupy different points in the workload signature.** Software can co-schedule, separate, or disaggregate the phases, but separation introduces KV transfer, network, queueing, and failure dependencies. **Conclusion:** specialization is justified only when the lifetime gain from phase-matched compute and memory exceeds those transfer and operational costs; otherwise a flexible GPU remains the better economic compromise.

**Observation — end-to-end generation includes more than model kernels.** Retrieval, tool calls, sampling, verification, and reasoning alter service time and state lifetime. **Conclusion:** a tensor accelerator cannot repair external-service latency or an unstable request queue. Hardware investment should follow measured critical paths and cost per completed response, not isolated tokens per second.

## 2.6 Recommendation, Ranking, Retrieval, and Embeddings

### Real-world problem

Recommendation and ranking systems select relevant items from very large catalogs under strict service latency. Retrieval systems convert queries and documents into vector representations and search large indexes. These systems combine learned dense computation with sparse, data-dependent access to large tables or indexes.

### Workload behavior

Deep recommendation models commonly use embedding tables for categorical features, followed by feature interaction and dense neural layers. Embedding tables may be too large for one accelerator, while individual lookups have low arithmetic intensity and irregular locality. DLRM therefore uses model parallelism for embedding tables and data parallelism for dense layers [2.4]. Production training studies describe simultaneous pressure on compute, memory capacity, memory bandwidth, and network bandwidth [2.5].

Vector retrieval performs dense embedding computation followed by nearest-neighbor or index traversal. The first phase maps well to matrix engines; the second depends on index structure, memory locality, filtering, and result-set size. Ranking may then apply a larger model to a smaller candidate set.

### Bottleneck-to-consequence chains

**Problem: embedding tables exceed accelerator memory.** Tables are partitioned across devices or retained in host memory. The bottleneck is capacity plus irregular memory and interconnect access. **Direct consequence:** lookup latency and network traffic dominate; dense compute units wait for sparse features; scaling adds communication rather than proportional throughput.

**Problem: feature popularity is highly skewed.** Caches capture hot embeddings, but misses remain unpredictable and partitions receive unequal traffic. The bottleneck is hot-spot bandwidth and load imbalance. **Direct consequence:** tail latency increases, some memory channels or devices saturate while others remain idle, and replication raises capacity cost.

**Problem: online ranking has strict response deadlines.** Large batches improve dense-layer efficiency but require requests to wait. The bottleneck is the batching-versus-latency tradeoff. **Direct consequence:** small batches reduce utilization; large batches increase queueing and violate tail-latency objectives.

**Problem: vector indexes are much larger than caches.** Approximate search reduces work, but graph or tree traversal produces data-dependent memory access. The bottleneck is random access, memory capacity, and branchy control. **Direct consequence:** latency becomes bandwidth- and locality-sensitive; adding matrix throughput does little for the search phase; distributed shards add network tails.

**Problem: retrieval and ranking form a multi-stage pipeline.** A faster stage can increase pressure on the next stage without improving response time. The bottleneck is pipeline balance and backpressure. **Direct consequence:** queues move rather than disappear; memory use and tail latency increase unless capacity and admission control are coordinated end to end.

### Deployment differences

Datacenter systems operate enormous catalogs and indexes, making capacity, sharding, and tail latency primary. Client retrieval uses smaller personal indexes and values privacy and offline response; storage-to-memory movement and battery replace cluster networking as the limiting resources. Robotic or industrial retrieval may search maps, objects, or prior observations under deadlines, making worst-case lookup time more important than average throughput.

### Software ceiling and architectural conclusions

**Observation — caching and sharding exploit popularity but cannot create locality in cold accesses.** Replication, hot-entry caches, reordering, prefetching, and approximate indexes can reduce average lookup cost. The remaining misses still require capacity, indirect addressing, and communication, and skew can concentrate them on a few channels or shards. **Conclusion:** when cold or tail accesses determine the service objective, additional dense arithmetic has little value; larger or tiered memory, near-memory lookup, hardware gather support, or architectures that couple sparse access with dense processing can change the limiting path.

**Observation — batching improves dense ranking but conflicts with response deadlines.** Dynamic batching and request grouping use wide accelerators more efficiently, but the batch window consumes part of the latency budget. **Conclusion:** if the maximum permitted batch remains too small for efficient GPU execution at the required arrival rate, a smaller-granularity accelerator or CPU-plus-specialized-memory design may have better lifecycle economics than a larger underfilled GPU.

**Observation — retrieval is a heterogeneous pipeline.** Software can balance stages, apply backpressure, and choose approximate search parameters, but accelerating one phase only pushes more requests into the next constrained phase. **Conclusion:** hardware becomes useful when it accelerates the measured end-to-end critical path or enables a different placement of the index; an isolated vector engine is not justified by embedding throughput alone.

**Observation — enterprise locality can alter the economic threshold.** A private corpus may be smaller than a hyperscale index yet subject to governance, confidentiality, or predictable-latency requirements that prevent external service use. **Conclusion:** enterprise “mini-datacenters” may adopt datacenter-like memory and accelerator designs, but lower utilization makes shared infrastructure, consolidation, support lifetime, and idle power more important than peak throughput.

## 2.7 Sparse Computation, Mixture of Experts, and Graph AI

### Real-world problem

Sparsity aims to avoid unnecessary work or increase model capacity without activating every parameter. Graph models represent relationships that do not fit regular grids. Mixture-of-experts models route tokens to selected expert subnetworks. These methods can reduce arithmetic or improve model quality, but the saved operations do not automatically become saved time or energy.

### Workload behavior

Structured sparsity uses regular patterns that hardware can encode and schedule efficiently. Unstructured sparsity uses arbitrary nonzero positions and requires indices, irregular gathers, and variable work. MoE introduces data-dependent token routing: tokens are partitioned among experts, often across devices, then recombined. Switch Transformer is a representative sparsely activated model in which routing activates a subset of model capacity for each token [2.10]. Graph neural networks combine an irregular aggregation phase over neighbors with more regular dense transformations. HyGCN explicitly separates these phases because their execution and memory behavior differ [2.6].

[**Figure 2.5 placeholder — Structured and irregular sparsity through a CPU cache hierarchy.** Compare two sparse matrix rows with the same number of nonzeros. In the structured case, block-adjacent values share cache lines, support prefetching, and are reused before eviction. In the irregular case, compressed-row indices lead to dependent gathers from widely separated addresses; show index and value metadata, page translations, full cache-line fills containing only one or a few useful words, a working set larger than the last-level cache, and reuse distances long enough for eviction before reuse. Include a useful-bytes-to-bytes-transferred indicator. State explicitly that structured or reordered sparsity need not thrash caches; the pathological behavior belongs to large, weakly local, dynamically indexed sparsity.]

### Bottleneck-to-consequence chains

**Problem: sparse values require metadata and indirect access.** Index decoding, pointer traversal, and noncontiguous loads reduce useful bytes per transaction. The bottleneck is address generation, memory locality, and load balance rather than multiply count. **Direct consequence:** execution units remain underfilled, bandwidth is wasted on metadata or overfetch, and nominal operation reduction produces little wall-clock or energy improvement.

**Problem: MoE routing is data-dependent.** Token counts per expert vary, and expert placement may require all-to-all communication. The bottleneck is routing balance, fine-grained network traffic, and synchronization. **Direct consequence:** overloaded experts become stragglers, underloaded experts waste capacity, network congestion limits scale, and tail step time rises even though only a subset of parameters is active. The magnitude is documented: characterizations of distributed MoE training report all-to-all communication averaging roughly one third of step time—about 34% in one multi-platform measurement study, growing toward 45% as expert count rises [2.20]—so routing cost is of the same order as the computation it enables, not a second-order correction.

**Problem: expert-capacity limits prevent overload.** Tokens may be dropped, rerouted, padded, or processed by fallback paths. The bottleneck becomes the tension between balanced hardware execution and model semantics. **Direct consequence:** padding wastes utilization, rerouting raises communication, and dropping or constraining tokens can reduce quality.

**Problem: graph degree follows an irregular distribution.** Neighbor aggregation assigns very different work to nodes and causes unpredictable feature fetches. The bottleneck is dynamic parallelism, memory access, and partition imbalance. **Direct consequence:** SIMD lanes diverge, caches and prefetchers are ineffective, high-degree nodes create stragglers, and scale-out partitions generate irregular communication.

**Problem: graph preprocessing and sampling occur outside the accelerator.** CPU sampling and feature gathering feed a faster dense engine. The bottleneck is host memory bandwidth and CPU-to-device movement. **Direct consequence:** accelerators wait for minibatches; increasing accelerator count raises input pressure and can reduce overall utilization.

### Deployment differences

Datacenter graph and MoE workloads emphasize network topology, partitioning, and aggregate memory. Client systems encounter smaller but still irregular graphs in knowledge, vision, and personalization tasks; low concurrency makes wide accelerators harder to fill. Robotics uses graphs for maps, scenes, planning, and relational perception, where dynamic topology and deadlines make predictability as important as throughput.

### Software ceiling and architectural conclusions

**Observation — zero arithmetic is not zero cost.** Sparse formats, pruning, blocking, reordering, and compression can remove stored values and multiply operations. Arbitrary sparsity still carries indices, dependent address generation, cache-line overfetch, translations, and uneven work. Sparse matrix-vector multiplication is therefore often limited by low computational intensity, irregular access, and runtime input dependence rather than by multiplication [2.14]. **Conclusion:** if the remaining useful-byte fraction and work distribution keep CPU caches or GPU memory transactions inefficient after reordering, compressed-domain execution, sparse gather/scatter support, local routing, or near-memory processing is required to turn arithmetic sparsity into time and energy savings.

**Observation — a GPU can execute irregular work, but outside its most efficient envelope.** GPU efficiency is highest when there is abundant independent work, threads in a warp follow compatible paths, addresses coalesce into a small number of memory transactions, and occupancy is sufficient to hide latency [1.8]. Divergent paths mask lanes; scattered addresses multiply transactions; heavy register or shared-memory use can reduce resident warps. The issue is not “stricter GPU cache coherency.” **Conclusion:** when irregularity persistently reduces lane activity, transaction utilization, or latency hiding, a design with independent lanes, fine-grained queues, sparse dataflow, or locality-aware routing may provide greater useful work per joule than a wider SIMT machine.

**Observation — MoE saves arithmetic while creating routing and balance costs.** Capacity factors, auxiliary losses, token sorting, expert replication, and placement can improve balance, but a data-dependent token distribution still generates tail loads and all-to-all traffic. **Conclusion:** when non-overlappable routing and expert imbalance determine step time, network topology, routing engines, distributed queues, or architectures that place expert state closer to traffic become the hardware target; more dense tensor throughput alone deepens underutilization.

**Observation — graph preprocessing can remain on the host.** Better sampling, partitioning, and asynchronous pipelines reduce starvation, but dynamically discovered neighborhoods may prevent complete offline scheduling. **Conclusion:** if the host remains the critical path after tuned pipelining, graph or sparse accelerators must include sampling, feature gathering, and memory access—not merely accelerate the dense transform that follows.

[**Figure 2.6 placeholder — GPU efficiency envelope.** Use a two-dimensional matrix or parallel-coordinate view rather than a single “GPU versus accelerator” score. Show high GPU efficiency for abundant parallelism, coalescible access, regular work per lane, adequate occupancy, large or batchable shapes, and amortized launch cost. Show declining useful utilization as each characteristic becomes narrow, irregular, divergent, state-heavy, synchronization-bound, or latency constrained. Overlay representative phases: dense training, prefill, low-batch decode, embedding lookup, graph aggregation, MoE routing, and robotic planning. Emphasize a continuum of efficiency, not inability.]

## 2.8 Vision, Video, Multimodal Models, and Diffusion

### Real-world problem

Vision systems classify, detect, segment, track, enhance, or generate images and video. Multimodal systems combine image, audio, text, and sensor streams. Diffusion models generate or transform media through repeated denoising steps. These applications span offline datacenter generation, interactive client tools, always-on cameras, automotive perception, and robotic control.

### Workload behavior

Convolutional networks exploit local reuse and regular kernels; vision transformers introduce patch embeddings and attention; detection and segmentation add multiscale features, proposal or decoder stages, and variable outputs. Video adds a temporal dimension and sustained input bandwidth. Multimodal models include modality-specific encoders, fusion, and sequence processing whose stages may prefer different engines.

Diffusion inference repeatedly executes a denoising network across a sequence of timesteps [2.11]. Each step may be regular and accelerator-friendly, but the dependency between steps limits temporal parallelism. Larger images or video increase activation footprint, attention cost, and movement. Training adds the memory and distributed behavior of dense training.

### Bottleneck-to-consequence chains

**Problem: high-resolution images and video create large activation tensors.** Feature maps and intermediate representations consume memory and bandwidth. The bottleneck is capacity and movement through the hierarchy. **Direct consequence:** batch size falls, tiling introduces boundary and scheduling overhead, latency and energy rise, and mobile systems throttle under sustained camera use.

**Problem: live video arrives continuously.** Frames cannot always be batched without adding delay, and frame rates establish a steady deadline. The bottleneck is sustained throughput under bounded latency, including decode, ISP, preprocessing, inference, and postprocessing. **Direct consequence:** a slow stage accumulates queues or drops frames; active power becomes heat; missed deadlines reduce tracking or control quality.

**Problem: detection and segmentation have variable scene complexity and output size.** Postprocessing, suppression, masks, and tracking introduce irregular work. The bottleneck shifts from dense inference to control-heavy CPU or GPU stages. **Direct consequence:** end-to-end latency varies even when neural-kernel time is stable; accelerator-only benchmarks overstate system performance.

**Problem: multimodal pipelines place stages on different engines.** Camera ISP, audio DSP, NPU, GPU, and CPU exchange representations and synchronize timestamps. The bottleneck is inter-engine movement, shared-memory contention, and orchestration. **Direct consequence:** copies and wakeups consume energy; skew or queueing increases response latency; one stalled modality blocks fusion and lowers useful utilization elsewhere.

**Problem: diffusion requires many dependent denoising steps.** The bottleneck is sequential iteration count combined with repeated weight and activation traffic. **Direct consequence:** image-generation latency and energy remain high despite efficient individual kernels; client devices may exceed thermal budgets; datacenter cost scales with steps and resolution.

**Problem: aggressive reduction of steps, resolution, or precision changes output quality.** The bottleneck is not hardware but the quality constraint that limits permissible optimization. **Direct consequence:** performance improvements may be invalid if visual quality, temporal consistency, or safety accuracy falls below the application threshold.

### Deployment differences

Datacenter media generation emphasizes throughput, cost per output, queueing, and energy. Client creative tools emphasize interactive latency, shared memory, thermal sustainability, and privacy. Always-on vision emphasizes sensor-to-engine locality and idle-domain energy. Automotive and robotics emphasize bounded latency, frame freshness, synchronization, redundancy, and safe degraded behavior.

### Software ceiling and architectural conclusions

**Observation — tiling and fusion reduce activation traffic but are bounded by local storage.** Layout selection, operator fusion, recomputation, compression, and lower precision can keep more image or video data on chip. Large resolutions and temporal windows eventually exceed registers, caches, or scratchpads, and excessive tiling adds halos, redundant work, and scheduling overhead. **Conclusion:** when compulsory sensor and activation traffic exceeds the sustained memory or energy envelope, more local storage, streaming dataflows, sensor-adjacent processing, or a more efficient memory interface becomes necessary.

**Observation — continuous media converts active power into a steady thermal problem.** Frame skipping, adaptive resolution, duty cycling, and dynamic voltage and frequency scaling can reduce average demand, but they also reduce freshness or quality. **Conclusion:** if required frame rate and quality cannot be sustained without throttling, burst benchmark performance is irrelevant; the platform needs lower-energy execution, localized movement, or independently power-gated stages.

**Observation — scene-dependent postprocessing and fusion remain irregular.** Software can fuse stages and move some postprocessing to the accelerator, but variable detections, tracks, masks, and modality arrivals resist a single static schedule. **Conclusion:** hardware is justified only if it accelerates or isolates the variable stages and their movement; otherwise a faster dense neural engine will leave end-to-end tail latency unchanged.

**Observation — diffusion is sequential across denoising steps.** Fewer-step samplers, distillation, caching, compilation, and quantization reduce work, but quality requirements place a lower bound on acceptable steps and precision. **Conclusion:** after that quality-constrained minimum is reached, reducing latency or energy requires faster repeated state movement, persistent residency, or hardware matched to the denoising dataflow—not further software removal of required steps.

## 2.9 Scientific AI

### Real-world problem

Scientific AI accelerates simulation, surrogate modeling, inverse problems, weather and climate analysis, molecular or materials modeling, and data interpretation. The objective may be time to scientific result, fidelity, conservation properties, uncertainty, or coupling with an existing simulation—not merely inference throughput.

### Workload behavior

There is no single scientific-AI profile. Some models use dense tensors and map well to GPUs or matrix units. Others operate on meshes, particles, graphs, sparse grids, spectral transforms, or multiscale domains. Many workflows alternate learned components with conventional numerical solvers. Precision requirements vary: reduced precision may be acceptable for portions of training, while iterative stability, accumulated error, or physical constraints require wider formats elsewhere.

### Bottleneck-to-consequence chains

**Problem: a learned model couples to a legacy solver or instrument pipeline.** Data layouts, precision, and decomposition differ between stages. The bottleneck is conversion, movement, and synchronization at the boundary. **Direct consequence:** accelerator kernels finish quickly while the coupled workflow remains slow; copies increase energy; scaling is limited by the least parallel stage.

**Problem: meshes, particles, or graphs are irregular.** Neighborhood sizes, domain partitions, and sparse operators vary. The bottleneck is memory locality, dynamic parallelism, and communication. **Direct consequence:** utilization falls, partition imbalance creates stragglers, and scale-out efficiency declines.

**Problem: fidelity requires larger domains or higher resolution.** Working sets exceed device memory and halo or collective traffic grows. The bottleneck is capacity and network bandwidth. **Direct consequence:** simulations require more partitions, spend more time communicating, and consume more energy per scientific result.

**Problem: reduced precision violates numerical or physical requirements.** Wider arithmetic and storage reduce use of the highest-throughput matrix paths. **Direct consequence:** achieved performance falls below AI-focused peak claims; using lower precision can instead increase iteration count, instability, or scientific error.

**Problem: scientific validity requires reproducibility or uncertainty estimates.** Ensembles and repeated runs multiply compute, while nondeterministic kernels complicate comparison. The bottleneck is total workload volume and deterministic execution. **Direct consequence:** time and energy to result increase; performance optimizations that change numerical behavior may be unacceptable.

### Deployment differences

Large training and simulation coupling are usually datacenter or HPC workloads. Workstations support interactive analysis and smaller experiments. Embedded scientific AI appears in instruments, medical devices, and field sensors, where models must operate within local energy and memory limits and may need to preserve calibrated or safety-relevant behavior.

### Software ceiling and architectural conclusions

**Observation — coupled workflows inherit the least accelerable stage.** Layout conversion, asynchronous pipelines, graph capture, and overlap reduce boundary cost, but a solver dependency or instrument timing can leave no independent work to hide it. **Conclusion:** hardware offload is justified only when it supports the coupled data formats, precision, synchronization, and conventional numerical stages; accelerating the neural component in isolation may have negligible scientific value.

**Observation — irregular scientific structures resemble graph and sparse workloads.** Partitioning, mesh reordering, sparse formats, and load balancing help until geometry or physics produces unavoidable nonuniformity. **Conclusion:** when runtime topology and communication determine time to solution, dynamic scheduling, sparse memory systems, or topology-aware interconnect matter more than dense peak throughput.

**Observation — fidelity constrains approximation.** Mixed precision and surrogate models are useful only while conservation, stability, uncertainty, and reproducibility remain valid. **Conclusion:** the required precision and deterministic behavior become hardware requirements; a faster low-precision path is not an optimization if it increases iterations or invalidates the result.

**Observation — ensembles multiply total work.** Better experiment scheduling and shared preprocessing reduce overhead but do not remove independent runs required for uncertainty estimates. **Conclusion:** at sufficient recurring volume, energy-efficient domain hardware may be economical; at smaller volume, flexible GPUs and shared infrastructure usually amortize risk better.

## 2.10 Edge, Client, and Always-On Inference

### Real-world problem

Client and edge systems perform speech, imaging, translation, personalization, anomaly detection, generative AI, and context sensing without sending every input to a datacenter. Objectives include privacy, offline capability, responsiveness, and reduced network use, constrained by battery, thermals, shared memory, and device cost. MLPerf Tiny treats latency, accuracy, and optional energy as distinct metrics for constrained inference [2.7]; client benchmarks similarly require workloads representative of personal systems rather than datacenter throughput [2.8].

### Workload behavior

Foreground inference is often bursty and interactive. Always-on inference processes a continuous low-rate sensor stream and should keep larger power domains asleep until an event occurs. Models are compressed or quantized to fit memory and supported NPU operators. The runtime may partition a graph among CPU, GPU, NPU, DSP, and ISP while applications compete for shared LPDDR bandwidth and thermal headroom.

### Bottleneck-to-consequence chains

**Problem: one user provides little batching opportunity.** Tensor dimensions and concurrency may be too small to occupy a wide accelerator. The bottleneck is insufficient parallel work and fixed launch cost. **Direct consequence:** peak TOPS remain unused; latency and energy per inference are determined by setup and memory rather than arithmetic.

**Problem: the model exceeds local memory or bandwidth.** Compression, quantization, smaller context, or storage streaming is required. The bottleneck is capacity and shared-memory traffic. **Direct consequence:** the model cannot run, quality must be reduced, or latency and battery energy rise due to movement and contention.

**Problem: part of the graph is unsupported by the NPU.** The runtime falls back to CPU or GPU and moves intermediate tensors. The bottleneck is operator coverage and cross-engine synchronization. **Direct consequence:** wakeups, copies, and fragmented execution erase expected energy savings and increase latency variance.

**Problem: inference is sustained rather than bursty.** Active power accumulates as heat under passive cooling. The bottleneck is the steady-state thermal envelope. **Direct consequence:** frequency throttling reduces throughput and increases latency; the system may curtail features to protect temperature and battery.

**Problem: an always-on function wakes a large domain too often.** False positives, polling, or host-managed preprocessing activate CPU, GPU, memory, or radio subsystems. The bottleneck is wake-up and idle-state energy. **Direct consequence:** battery life falls even if the inference kernel itself is efficient.

**Problem: local execution competes with foreground applications.** CPU, GPU, NPU, display, camera, and modem share memory and thermals. The bottleneck is system-level arbitration. **Direct consequence:** user-interface jank, camera degradation, model slowdown, or thermal throttling appears outside the AI component.

### Software ceiling and architectural conclusions

**Observation — batch one is a service constraint, not a tuning failure.** Fusion, graph compilation, quantization, and concurrent applications can improve occupancy, but one interactive user supplies little aggregatable work and cannot always wait for a batch. **Conclusion:** if fixed launch, scheduling, and memory energy dominate at the admissible batch size, a narrower low-overhead NPU, persistent execution path, or tightly integrated shared-memory engine can be more efficient than a wider GPU.

**Observation — model compression eventually reaches a quality floor.** Pruning, quantization, distillation, and context reduction can make local execution feasible, but additional reduction may violate accuracy or feature requirements. **Conclusion:** when the smallest acceptable model still exceeds capacity or bandwidth, more efficient local memory, compressed-domain execution, or selective specialized operators are required; forcing a smaller model is a product-quality decision rather than an architecture solution.

**Observation — fallback fragments the graph.** Compilers and runtimes can expand operator coverage, fuse supported regions, and choose layouts, but an unsupported semantic operation must execute somewhere. **Conclusion:** if cross-engine copies, wakeups, or conversions repeatedly erase NPU savings, broader programmable coverage, shared virtual and physical memory with controlled consistency, or a different accelerator boundary becomes economically necessary.

**Observation — always-on energy is dominated by the awakened system boundary.** Event filtering, duty cycling, and sensor-hub software reduce wakeups, but required continuous sensing still consumes sensor, memory, and interconnect energy. The magnitudes span roughly four orders: dedicated always-on inference silicon performs wake-word detection at under ~300 µW [2.21, vendor claim], while waking an application processor and its DRAM path costs on the order of watts. When the wake path is exercised often, its energy—not the neural kernel’s—determines battery life. **Conclusion:** when host wake-up or DRAM activation dominates the neural kernel, a near-sensor or independently power-gated always-on path is the relevant hardware response.

**Observation — sustained operation shares a finite platform envelope.** Thermal-aware scheduling can move work in time or among engines, but it cannot exceed steady-state cooling without throttling or displacing another function. **Conclusion:** the hardware requirement is lower whole-system energy per useful inference and better power-domain isolation, not a higher burst TOPS rating.

## 2.11 Robotics, Automotive, and Sensor Fusion

### Real-world problem

Robots and vehicles must transform sensor streams into perception, localization, prediction, planning, and control before the physical environment changes. Energy and SWaP-C matter, but the defining requirement is often a bounded response with acceptable confidence and safe fallback. MLPerf Automotive accordingly treats latency—including 99.9th-percentile latency in defined scenarios—as a primary performance metric for automotive systems [2.12].

### Workload behavior

Camera, radar, lidar, audio, IMU, and other sensors produce streams with different rates, timestamps, and noise. Pipelines combine fixed-function preprocessing, neural inference, geometric computation, tracking, graph or search algorithms, and real-time control. Batch size is usually one. Scene complexity changes dynamically, and multiple pipelines may share accelerators and memory.

### Bottleneck-to-consequence chains

**Problem: sensor streams must be temporally aligned.** Buffering compensates for rate and arrival differences. The bottleneck is synchronization and buffer management. **Direct consequence:** added buffering increases end-to-end latency; insufficient alignment reduces fusion quality and can produce incorrect state estimates.

**Problem: scene complexity varies.** The number of objects, points, tracks, or graph nodes changes. The bottleneck is data-dependent execution and worst-case workload. **Direct consequence:** latency and jitter rise exactly in complex scenes where timely decisions may be most important.

**Problem: several safety-relevant pipelines share an accelerator.** Priority, preemption, and memory interference are not always controlled by the CPU scheduler. The bottleneck is cross-engine scheduling and isolation. **Direct consequence:** a lower-priority workload can delay a deadline-critical path; average benchmark latency fails to predict safe behavior.

**Problem: raw sensors generate more data than the central processor should move.** The bottleneck is sensor I/O, memory bandwidth, and movement energy. **Direct consequence:** central memory saturates, latency increases, and mission energy falls. Near-sensor filtering or inference can reduce traffic but adds distributed state and validation requirements.

**Problem: cloud connectivity is delayed or unavailable.** Remote inference cannot close a dependable control loop. The bottleneck is network latency and availability. **Direct consequence:** the system must reduce capability, stop safely, or provide sufficient local compute and models for autonomous operation.

**Problem: heat or battery depletion changes available compute during operation.** The bottleneck is sustained platform power, not peak accelerator speed. **Direct consequence:** throttling can violate deadlines; allocating more power to compute may reduce mission duration or compete with sensing and actuation.

### Software ceiling and architectural conclusions

**Observation — buffering trades alignment for latency.** Timestamping, interpolation, prediction, and adaptive buffers can synchronize modalities, but the control loop limits how long the system may wait. **Conclusion:** when the maximum safe buffer cannot absorb sensor skew and processing variance, deterministic capture, time-aware interconnect, bounded DMA, or hardware timestamp support is required.

**Observation — worst-case scenes matter more than average occupancy.** Priority scheduling, workload caps, model cascades, and graceful degradation reduce average and tail work, but safety requirements may still demand full processing in a complex scene. **Conclusion:** if the verified worst-case path misses its deadline, hardware must provide sufficient bounded throughput, preemption, isolation, and memory service—not merely higher average benchmark performance.

**Observation — CPU scheduling does not control the entire heterogeneous path.** Runtime queues, firmware, DMA, shared memory, and accelerator kernels can introduce priority inversion outside the OS scheduler. **Conclusion:** deadline-critical systems need priority and isolation propagated through device queues and memory arbitration; a fast accelerator without these controls is not a real-time solution.

**Observation — raw sensor movement is often compulsory unless reduction occurs near the source.** Compression and selective sampling help only when they preserve the information required downstream. **Conclusion:** when central bandwidth, latency, or mission energy remains excessive, near-sensor preprocessing or inference becomes necessary, with added validation, observability, and update obligations.

**Observation — connectivity cannot satisfy a local availability contract.** Prediction, caching, and redundant links reduce some outages but cannot guarantee a remote response. **Conclusion:** any function required for safe autonomous operation needs sufficient local compute and state; cloud offload may enhance capability but cannot be the only execution path.

## 2.12 Cross-Cutting Bottlenecks, Software Ceilings, and Hardware Implications

The workload families above repeatedly expose the same resources, but the consequences differ by context.

### Table 2.2 — Direct consequences across deployment classes

| Bottleneck | Workload behavior that exposes it | Direct datacenter consequence | Direct client/mobile consequence | Direct embedded/robotics consequence |
|---|---|---|---|---|
| Compute throughput | Large dense matrices, convolutions, attention, training backward pass | Longer time to quality or lower service throughput | Slower foreground response; longer active time | Missed processing deadline if compute demand exceeds provisioned rate |
| Insufficient parallelism | Autoregressive decode, batch-one inference, sequential diffusion steps | Low accelerator utilization and higher cost per token | Peak TOPS unused; fixed overhead dominates latency and energy | Wide engine underused while deadline remains unchanged |
| Memory capacity | Large models, activations, optimizer state, embeddings, KV cache | Lower batch/concurrency, sharding, higher cost | Model or context cannot fit; quality or features reduced | Model cannot deploy within component memory budget |
| Memory bandwidth/locality | Weight streaming, embeddings, graphs, large feature maps | Stalled compute, reduced throughput and utilization | Higher energy and latency; shared-memory contention | Deadline jitter and platform-energy increase |
| Interconnect/network | Distributed training, MoE, sharded embeddings, disaggregated serving | Reduced scaling efficiency, collective tails, higher rack/network power | Usually manifests as engine-to-engine shared-memory traffic or cloud latency | Sensor/network delay, loss of autonomy, missed control deadlines |
| Load imbalance | Variable sequences, expert routing, graph degree, pipeline stages | Stragglers, idle devices, poor fleet economics | Latency variance and inefficient heterogeneous dispatch | Worst-case latency and jitter in complex scenes |
| Control-flow irregularity | Sparse graphs, dynamic routing, variable outputs, planning | Divergence and underfilled execution | CPU/GPU fallback and higher energy | Unpredictable execution and harder timing analysis |
| Scheduling/queueing | Dynamic arrivals, multi-tenancy, shared accelerators | Tail latency, fairness loss, or low utilization | UI interference, wakeups, response jitter | Priority inversion and deadline violations |
| Precision/quality constraint | Training stability, scientific fidelity, safety accuracy | Lower use of peak low-precision paths or more iterations | Larger model and higher energy; quality tradeoff | Certification or safety prevents aggressive optimization |
| Thermal/power envelope | Sustained training or inference, continuous video, mission workloads | Rack capacity and cooling limit installed or active hardware | Throttling, battery drain, reduced user comfort | Reduced mission time or deadline failure under throttling |

This table is not a substitute for workload-specific analysis. It is a consistency check: every architectural claim in later chapters should trace back to one or more demonstrated workload chains, and every proposed optimization should identify which direct consequence it is intended to improve.

### Table 2.3 — Software ceilings and the test for hardware escalation

| Bottleneck | Software mitigation attempted first | Residual bound that software cannot remove without changing the requirement | Hardware lever that can change the bound | Economic trigger |
|---|---|---|---|---|
| Compute throughput | Fusion, vectorization, compilation, lower precision | Minimum required operations exceed throughput within the deadline or power budget | More or better-matched parallel arithmetic; matrix or tensor dataflow | Recurring time, energy, or capacity cost exceeds specialization and enablement cost |
| Insufficient parallelism | Batching, concurrency, speculation, persistent kernels | Dependencies and latency objectives cap independent work | Smaller-granularity execution, low-overhead pipelines, heterogeneous engines | Underfilled wide devices cost more per completed request than right-sized alternatives |
| Memory capacity | Quantization, pruning, checkpointing, paging, sharding | Minimum live state still exceeds affordable local capacity | Larger local memory, hierarchical or distributed memory, compression support, near-memory compute | Capacity-driven device count, offload traffic, or quality loss dominates lifetime cost |
| Memory bandwidth and locality | Tiling, fusion, reordering, caching, prefetching, compression | Compulsory useful bytes and overfetch exceed sustained bandwidth or energy | Scratchpads, streaming dataflow, stacked memory, near-data execution, sparse movement support | Stalled compute and data-movement energy remain material at target volume |
| Interconnect and network | Partitioning, compression, overlap, collective scheduling | Dependency-imposed communication exceeds link or topology capability | Scale-up fabric, topology change, collective or network offload | Added devices deliver insufficient useful scaling or exceed rack/network power and cost |
| Load imbalance and irregularity | Reordering, padding, bucketing, work stealing, rerouting | Runtime work distribution remains data-dependent and heavy-tailed | Fine-grained queues, independent lanes, dynamic routing, sparse dataflow | Idle provisioned capacity or deadline tails outweigh flexibility benefits |
| Scheduling and queueing | Admission control, placement, batching, priority, preemption | SLOs cap queueing and batching; device queues may not propagate priority | Hardware isolation, bounded preemption, deterministic dispatch, queue support | Tail violations or reserved idle capacity create material service or safety cost |
| Precision and quality | Mixed precision, calibration, retraining, approximation | Further reduction violates convergence, fidelity, or safety | Efficient required-format arithmetic, accumulation, conversion, and storage | Extra iterations, larger fleet, or invalid output costs more than format support |
| Thermal and power | DVFS, duty cycling, scheduling, race to idle | Minimum sustained energy exceeds rack, battery, cooling, or mission envelope | Lower-movement dataflow, power gating, near-sensor execution, lower-energy memory | Thermal throttling, rack capacity, battery life, or mission duration blocks the product objective |

The economic test should use the whole system and its lifetime. A custom engine that saves kernel energy but requires repeated host wakeups, creates unsupported-operation fallback, or fragments fleet capacity may fail the test. Conversely, a modest per-request improvement can justify substantial hardware investment at hyperscale or across a high-volume mobile product. The result is conditional necessity: given a specified quality and service objective, software optimization reaches a point at which only an architectural change can meet the objective economically.

## 2.13 Why the GPU Is a Transition Point Rather Than an Endpoint

GPUs became the broad AI platform because they combine high parallel throughput with programmability, evolving libraries, and a reusable software ecosystem. They are not limited to perfectly dense or perfectly regular kernels. Modern GPUs include caches, software-managed shared memory, large register files, independent thread execution features, matrix units, sparse support, and increasingly capable scheduling. Any account that treats them as fixed-function dense-matrix devices would be a straw man.

Their efficiency nevertheless depends on a recognizable workload envelope:

- Enough independent threads and blocks to occupy the machine and hide memory latency.
- Similar work and control paths among threads that share execution resources.
- Memory addresses that can be coalesced into a small number of useful transactions.
- Tensor shapes and precisions that map efficiently to high-throughput arithmetic units.
- Register, shared-memory, and synchronization requirements that preserve adequate occupancy.
- Batches or persistent work large enough to amortize launch, scheduling, and data-transfer overhead.

The CUDA programming model documents these relationships directly. Threads in a divergent warp can be masked while another path executes, so useful lane utilization falls. Global memory is transacted in segments; widely scattered per-thread addresses can generate many transactions for few useful bytes. Occupancy provides resident warps that help hide latency, but register and shared-memory demand can constrain it [1.8].

These are efficiency limits, not functional prohibitions. Software can reorder data, fuse kernels, bucket shapes, use persistent kernels, assign specialized warps, cache state, and overlap transfers. The transition pressure appears when the workload’s semantics prevent enough regularization: autoregressive dependencies cap batching; arbitrary sparse gathers remain scattered; graph degrees remain imbalanced; expert routing remains data-dependent; or real-time deadlines prevent queueing. At that point a non-GPU architecture may improve useful work per joule by removing general control overhead, making data placement explicit, providing finer-grained scheduling, moving compute closer to state, or implementing a narrower but more efficient dataflow.

Google’s first-generation TPU illustrates the economic logic rather than a universal replacement rule—and its published numbers are worth quoting, because they show what crossing the threshold actually looks like. The design dedicated a 256×256 array of 8-bit multiply-accumulate units (65,536 MACs, ≈92 TOPS peak) and 28 MiB of software-managed on-chip memory to a stable production-inference portfolio, and its deterministic execution model was chosen explicitly for 99th-percentile response-time requirements measured in single-digit milliseconds. Under those production latency bounds, the published evaluation reported roughly 15–30× the inference throughput of its contemporary CPU and GPU baselines and 30–80× their performance per watt [1.12]. The motivating projection is equally instructive: an internal estimate that growing speech-recognition use could require doubling datacenter capacity if served on general-purpose hardware. The specialization was valuable because workload volume amortized the hardware and software investment. A smaller or rapidly changing workload might rationally remain on GPUs even at lower silicon efficiency because flexibility, availability, and software maturity have economic value. Section 2.14 formalizes this reasoning by executing the necessity test on this and two contrasting cases.

## 2.14 The Necessity Test, Executed

Section 2.1 stated four conditions for economically credible specialization: a demonstrated residual bound, a material system consequence, a hardware lever that changes the bound rather than relocating it, and lifetime economics that repay the transition. A framework of this kind earns trust only when it is exercised on real systems—and only when it can return a negative verdict. This section runs the test three times: once where history answered *specialize*, once where the market answered *no*, and once where the correct contemporary answer is *stay on general-purpose hardware*. Figure 2.7 summarizes the test as a decision structure and marks the paths the three cases take through it.

### Case 1 — Verdict: specialize. Google TPU v1 (evidence class A)

- **Residual bound.** Production inference services operated under 99th-percentile latency limits of a few milliseconds, which capped admissible batch size. Under that constraint, the contemporary GPU baseline could use only a small fraction of its throughput: latency-bounded batching left wide execution provisioned for parallelism the service was not permitted to accumulate [1.12]. Software batching had reached the ceiling the SLO allowed.
- **Material consequence.** Google’s published account cites a 2013 internal projection that growing speech-recognition adoption could require doubling datacenter compute capacity if served on the existing fleet—a facility-scale capital and energy consequence, not a kernel-level inefficiency [1.12].
- **Hardware lever.** An 8-bit 256×256 matrix unit (65,536 MACs, ≈92 TOPS peak), 28 MiB of software-managed on-chip memory, and a deterministic execution pipeline removed dynamic machinery whose latency variance the SLO could not absorb. The lever attacked the bound directly: predictable service time at small batch, high arithmetic density per watt for the operations the portfolio actually executed.
- **Lifetime economics.** The workload portfolio (MLPs, LSTMs, CNNs in production ratios) was stable, internally controlled, and enormous; compiler and serving software were co-designed by the same organization that owned the models. Published results—15–30× throughput and 30–80× performance per watt against contemporary baselines under production latency bounds [1.12]—were amortized across a fleet the owner fully utilized.
- **Verdict.** All four conditions held. The confirming evidence is subsequent history: the TPU line has continued through multiple generations and expanded from inference to training at supercomputer scale [2.24], exactly what the test predicts when its conditions are durably satisfied.

### Case 2 — Verdict: the market said no. Intel Nervana (evidence class D), with Graphcore as supporting evidence

Intel acquired Nervana in 2016 and developed its NNP-T training and NNP-I inference processors to announced-silicon status, with committed customers for the inference part. In December 2019 Intel acquired Habana Labs for approximately $2 billion, and roughly two months later it cancelled NNP-T outright and limited NNP-I to previously committed customers [2.22]. Running the test backward over the public record is instructive:

- **Residual bound and consequence (conditions 1–2):** arguably present—the same training-throughput and energy arguments that motivated every contemporary training ASIC.
- **Hardware lever (condition 3):** plausibly present; the silicon was real and its architecture was publicly detailed.
- **Lifetime economics (condition 4): failed.** The design cycle straddled the industry’s pivot to transformer-scale training; the workload-stability assumption underneath the lever eroded while the chip was in flight. The software-enablement cost was not amortized across an internal model portfolio, as Google’s was—Nervana needed external adopters to leave a mature CUDA ecosystem whose accumulated capital was precisely the “option value of flexibility” this chapter prices. When a better-positioned alternative (Habana) became available, the rational move was to strand the investment.

Graphcore provides supporting evidence from the merchant market: a technically distinctive architecture (massive distributed on-chip SRAM, fine-grained parallelism) backed by roughly $700 million of investment, which nevertheless failed to displace GPU deployments at scale and was acquired by SoftBank in July 2024 [2.23]. Neither case shows the architectures were wrong as hardware. Both show that condition 4—software capital, workload timing, and volume—dominates the test, and that it can fail while conditions 1–3 hold. Any Chapter 6 architecture family should be read with these failure modes in mind.

### Case 3 — Verdict: stay on GPUs. Enterprise private serving (author assessment, illustrative arithmetic)

The running example’s enterprise deployment makes the negative verdict quantitative. The following numbers are illustrative and labeled as author assessment; the method, not the specific values, is the point.

Suppose an organization of 2,000 employees runs the document assistant privately for data-governance reasons. Peak concurrent sessions might reach 30; a session generates a few thousand tokens across a working hour. Aggregate demand averages well below 10% utilization of a single modern 8-accelerator server, concentrated in business hours. Apply the test:

- **Residual bound (condition 1): present.** Decode at low concurrency sits deep in the bandwidth-bound region computed in §2.5; the server’s arithmetic is largely idle during generation.
- **Material consequence (condition 2): weak.** Inter-token latency comfortably meets interactive needs; the inefficiency costs idle capital, but the capital is already sized by the governance requirement, not by throughput.
- **Hardware lever (condition 3): exists but is not decisive.** A decode-optimized engine would raise efficiency of a phase that is not the deployment’s binding constraint.
- **Lifetime economics (condition 4): fails decisively.** There is no volume to amortize a second hardware platform, its compiler stack, and its operational surface. The organization’s models change with each upstream release; the same GPU server also serves retrieval, fine-tuning, and batch analytics between interactive peaks. Flexibility is not a consolation prize here—it is the productive asset.
- **Verdict:** optimize software, right-size the general platform, and revisit only if demand becomes large and stable enough to move condition 4. This is the most common real-world outcome of the test, and it is the reason the CPU–GPU baseline of Chapter 5 persists across most of the industry even while hyperscalers specialize.

### What the three cases establish

First, the test is decidable in advance: its inputs—compulsory bytes per unit of work, latency bounds, demand volume and stability, model-change rate, software-enablement cost—are measurable or estimable before committing silicon. Second, condition 4 is where most proposals die, and software capital is the dominant term in it; a hardware lever alone never satisfies the test. Third, the same workload can produce opposite verdicts at different volumes—yes at hyperscale, no at enterprise scale—which is the two-transition thesis restated as evidence rather than assertion: specialization is conditional, and the conditions are economic as much as technical.

![**Figure 2.7 — The conditional hardware-necessity test as a decision structure.** The four conditions are drawn as sequential gates: (1) residual bound demonstrated after software ceiling? (2) material consequence under deployment objectives? (3) does a hardware lever change the bound rather than move it? (4) do lifetime economics repay transition cost including software enablement and flexibility loss? Each *no* exit names the correct non-hardware response: more algorithm/software work; renegotiate the requirement; buy the flexible platform. The paths of TPU v1 (four yes gates), Nervana/Graphcore (fails at gate 4), and enterprise private serving (fails at gates 2 and 4) are overlaid.](figures/fig02-07-necessity-test.png)

## 2.15 Future Workload Stress Test: Predictive World Models

The preceding observations describe current deep-learning systems, but the workload taxonomy should survive changes in model family. Predictive world models provide a useful stress test because they can combine continuous multimodal observation, learned state, temporal prediction, planning, and action.

It would be premature to claim that world models necessarily require more operations than current generative models. Joint-embedding predictive architectures are partly motivated by predicting in a learned representation rather than reconstructing every unpredictable low-level detail. That choice may reduce some computation and output-state requirements. The safer architectural conclusion is that world models can move pressure into different dimensions:

- Continuous video and sensor streams create sustained input, synchronization, and data-movement requirements.
- Persistent latent state increases residency, update, and lifetime-management demands.
- Prediction across several time horizons creates heterogeneous shapes and dependency depths.
- Planning can evaluate repeated candidate-action rollouts under a response deadline.
- Online adaptation combines inference with controlled state mutation.
- Physical interaction makes freshness, determinism, and safe fallback part of the execution contract.

V-JEPA 2 demonstrates a research path combining video-scale self-supervised learning with an action-conditioned latent world model used for robot planning [2.15]. It does not establish the final workload of autonomous intelligence, but it shows why a model-independent signature is preferable to a taxonomy based only on today’s transformer layers. Future neuro-symbolic, memory-augmented, or world-model systems may be less dominated by dense matrix operations and more sensitive to state, irregular control, temporal correlation, and latency.

**Observation:** future model families may replace one bottleneck rather than simply enlarge it. **Conclusion:** accelerator decisions should be derived from measured workload signatures and deployment objectives, not from the assumption that future AI will be a larger version of today’s dominant model.

## 2.16 Architectural Synergy Across the Compute Continuum

Datacenter, enterprise, mobile, and embedded systems do not require unrelated accelerator ideas. The same physical facts—data movement costs energy, locality raises useful bandwidth, specialization removes general overhead, and inactive resources should consume little power—apply throughout the continuum. What changes is the design point and economic weighting.

Reuse occurs at several levels:

- **Architectural principle:** local reuse, explicit data movement, quantization, compression, spatial dataflow, near-data processing, and heterogeneous execution.
- **Parameterized IP:** matrix arrays, vector engines, DMA, scratchpads, networks on chip, security domains, and power-management blocks can be resized and reconfigured.
- **Software abstraction:** compiler intermediate representations, graph partitioning, operator libraries, queues, memory-residency models, and profiling concepts can span products.
- **Operational learning:** techniques developed for mobile idle power can inform energy-proportional servers, while datacenter scheduling and observability can inform consolidated enterprise and edge platforms.

The transfer is not identity. A datacenter design can assume active cooling, high-bandwidth device memory, large batches, scale-up networks, and fleet-level redundancy. A mobile design shares LPDDR with the rest of the SoC, frequently enters idle states, and is limited by battery and skin temperature. A robotic design may require bounded arbitration, qualified components, sensor interfaces, and fail-safe execution. These differences alter array size, voltage and frequency, memory hierarchy, coherence, interconnect, redundancy, and software lifecycle even when the designs share an architectural family.

Research on energy-proportional datacenter memory provides a direct example of cross-continuum migration: mobile DRAM characteristics were evaluated as a way to reduce server-memory power for workloads that stressed capacity and latency more than peak bandwidth [2.16]. Google’s evaluation of Edge TPU classes likewise covers related accelerator designs in datacenter and mobile-SoC ecosystems [2.17]. These examples support a bidirectional model of innovation rather than a one-way flow from large systems to small devices.

### Table 2.4 — Common principles, different deployment realizations

| Common principle | Hyperscale and datacenter | Enterprise and non-mobile edge | Client and mobile | Embedded, automotive, and robotics |
|---|---|---|---|---|
| Keep data near computation | HBM, distributed SRAM, scale-up memory, cache-aware serving | Accelerator cards or appliances with local model and index residency | Shared LPDDR, on-SoC SRAM, zero-copy paths where semantics permit | Near-sensor SRAM, bounded DMA, local maps and control state |
| Match execution width to available work | Large arrays and fleet batching | Consolidated multi-tenant serving; right-sized local clusters | Batch-one engines and heterogeneous dispatch | Deterministic pipelines and small independently scheduled engines |
| Reduce movement and precision | Fusion, compression, low-precision training and inference | Quantized private serving, local retrieval, tiered memory | Quantized NPU execution, compressed models, minimized wakeups | Fixed-point or mixed precision under safety and quality constraints |
| Specialize communication | Collective engines, scale-up fabrics, topology-aware routing | Cluster fabric sized for private models and retrieval | On-chip interconnect and shared-memory arbitration | Sensor networks, time-aware interconnect, actuator and safety paths |
| Control idle and active energy | Energy-proportional memory and fleet placement | Consolidation, power states, capacity right-sizing | Power islands, sensor hubs, race-to-idle and sustained thermal control | Duty cycling, mission-energy allocation, always-on safety domains |
| Preserve programmability | Compilers and libraries across evolving large models | Stable platform support and manageable private deployment | Operator coverage, graph partitioning, app-compatible updates | Long lifecycle, certified updates, deterministic fallback |

Enterprise infrastructure increasingly resembles a small datacenter when data governance, confidentiality, sovereignty, network cost, or predictable latency motivates local deployment. It still differs economically from hyperscale: demand is smaller and more variable, specialized staff and spare capacity are expensive, and hardware may remain deployed for longer. Non-mobile edge remains intermediate, shifting toward datacenter architecture when consolidation and private-model serving dominate, and toward embedded architecture when locality, environmental limits, or real-time interaction dominate.

[**Figure 2.8 placeholder — Bidirectional migration of accelerator principles across the compute continuum.** Place hyperscale/datacenter, enterprise/private infrastructure, non-mobile edge, client/mobile, and embedded/robotics along a continuum. Show shared principles—locality, explicit movement, quantization, right-sized parallelism, heterogeneous scheduling, and power gating—moving in both directions. Under each deployment, annotate the different primary objective and implementation constraint. Avoid implying that the same physical chip is reused unchanged.]

## 2.17 Engineering Takeaways

- Workload labels hide distributions of shapes, locality, state, dependency, arrivals, and deadlines; architecture decisions should therefore use measured workload signatures rather than model names or peak operation counts.
- The case for hardware follows a fixed, decidable sequence—demonstrated residual bound, material consequence, effective hardware lever, and lifetime economics—and §2.14 shows the test returning *specialize* (TPU v1), *no* (Nervana, Graphcore), and *stay on GPUs* (enterprise private serving) on real systems; condition 4, dominated by software capital and workload stability, is where most proposals fail.
- Batch-one decode shows the method’s value: an author-computed bound from public datasheets gives a ≈48 tokens/s ceiling and ≈0.3% usable arithmetic intensity for a 70B 8-bit model on a current GPU, so wider tensor throughput cannot address this phase—only bandwidth, execution granularity, or state-locality changes can.
- Sparse, MoE, graph, recommendation, and retrieval workloads are limited by indirect access, metadata, imbalance, and communication—measured at roughly a third of MoE step time for all-to-all alone—so reducing multiply counts or adding dense throughput does not move their critical path.
- GPUs remain most efficient with abundant parallelism, coalescible access, regular lane work, adequate occupancy, and amortized overhead; the beyond-GPU case exists exactly where workload semantics keep material, stable phases outside that envelope, and future model families may relocate rather than enlarge those phases.
- Client, mobile, and robotic deployments are governed by whole-system boundaries—wake scope (four orders of magnitude between always-on silicon and an awakened application processor), shared memory, thermal envelopes, and deadlines—so the correct hardware boundary may be a power domain, memory path, or near-sensor engine rather than a larger accelerator.
