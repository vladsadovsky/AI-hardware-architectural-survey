# Chapter 3. Fundamental Architectural Principles

Chapter 2 described AI workloads as signatures of computation, access, time, state, communication, quality, and deployment constraints. This chapter translates those signatures into architectural concepts. Its purpose is not to select a product or declare one execution model superior. It establishes the vocabulary needed to explain why different hardware organizations make different work cheap, expensive, predictable, or difficult to express.

The central idea is that an accelerator is a set of contracts:

- An **execution contract** determines how operations become active and which forms of parallel work can proceed together.
- A **data-placement contract** determines where values reside, who moves them, and when they can be reused.
- A **numerical contract** determines supported formats, accumulation behavior, approximation, and quality obligations.
- A **scheduling contract** determines how work is admitted, ordered, isolated, preempted, and completed.
- A **communication contract** determines which components can exchange state, through which topology, under which ordering and failure semantics.
- A **software contract** determines what the compiler, runtime, driver, operating system, and application must know and control.

Specialization changes these contracts; it does not remove them. Hardware can replace dynamic discovery with explicit scheduling, caches with scratchpads, general instructions with tensor operations, or coherent sharing with message passing. Each substitution can improve efficiency because it eliminates machinery or exposes stronger assumptions. It also transfers responsibility into software and narrows the conditions under which the design remains efficient.

## 3.1 From Workload Signature to Architectural Contract

An architectural decision should begin with a workload phase, not a model name. A dense training matrix multiplication and an autoregressive decode step may belong to the same model while requiring different parallel width, memory residency, and scheduling. Likewise, graph aggregation and its following dense transformation may share a framework graph but occupy different architectural regimes.

The workload signature developed in Chapter 2 can be read as a set of questions:

- Does the phase contain thousands of independent operations, or a short dependency chain?
- Do nearby operations consume nearby data, or follow indirect and data-dependent addresses?
- Is reuse regular enough to schedule explicitly?
- Does state fit in local storage, or must it be streamed or distributed?
- Can requests wait to form batches?
- Does work per item remain uniform?
- Which numerical formats preserve the required quality?
- Is communication local, package-scale, host-mediated, or network-scale?
- Is the objective average throughput, tail latency, battery energy, a bounded deadline, or some combination?

The answers define the required architectural properties. High and regular data parallelism can support wide execution. Predictable reuse can support explicit local buffers. Irregular and evolving working sets may favor hardware-managed caching. Tight deadlines may require bounded arbitration and preemption. Large distributed state may make the interconnect part of the execution engine.

The mapping is many-to-many. One workload phase may run on several architecture types with different efficiency and software effort. One architecture may run many phases, but not at equal utilization. The goal is therefore **fit**, not capability: which architecture meets the objective with acceptable energy, cost, predictability, and lifecycle burden?

### Table 3.1 — Workload signature to architectural question

| Workload-signature property | Architectural property affected | Failure when mismatched |
|---|---|---|
| Abundant independent operations | Execution width, issue model, thread or tile capacity | Functional units idle; latency hiding fails |
| Long dependency chain | Pipeline depth, launch overhead, fine-grained scheduling | Wide throughput engine remains underfilled |
| Regular spatial and temporal reuse | Tile shape, dataflow, scratchpad and register allocation | Reuse is lost; bandwidth and movement energy rise |
| Irregular or data-dependent access | Cache policy, gather/scatter, address generation, routing | Overfetch, misses, serialization, and imbalance |
| Large persistent state | Memory capacity, hierarchy, residency, partitioning | Paging, transfer, reduced concurrency, or inability to run |
| Variable shapes and work | Dynamic scheduling, predication, reconfiguration | Padding, divergence, recompilation, or tail latency |
| Strict quality or precision | Arithmetic formats, accumulator width, rounding | More iterations, instability, invalid results, or unused peak units |
| Bursty arrival and latency SLO | Queue model, batching, preemption, isolation | Low utilization or excessive queueing |
| Distributed communication | Topology, collective support, consistency and ordering | Scaling stalls, stragglers, or excessive network energy |
| Bounded deadline or safety path | Determinism, resource reservation, fault handling | Jitter, missed deadline, or unsafe degraded behavior |

[**Figure 3.1 placeholder — From workload signature to architectural contracts.** Place the Chapter 2 signature dimensions on the left, the six architectural contracts in the center, and deployment objectives on the right. Show that one signature dimension can affect several contracts and that the final decision is evaluated by useful throughput, latency, energy, cost, determinism, reliability, and quality. Avoid mapping workload names directly to vendor or product categories.]

## 3.2 Execution Models: How Work Becomes Active

An execution model defines how the machine identifies ready work and applies operations to data. The labels below describe abstractions; real processors and accelerators often combine them.

### Scalar and superscalar execution

A scalar instruction names one logical operation on one or a small number of values. Modern CPUs use pipelines, out-of-order execution, speculation, register renaming, and multiple issue to find instruction-level parallelism dynamically. This is valuable for irregular control, pointer-rich software, operating-system work, preprocessing, and orchestration because the hardware tolerates uncertain dependencies and memory delays.

The cost is substantial control and state per operation. Instruction fetch and decode, dependency tracking, branch prediction, large register structures, and coherent caches consume area and energy. When a workload repeats the same arithmetic over many regular elements, that generality can become unnecessary overhead. When the workload is narrow, branchy, or latency-sensitive, however, it can be exactly the machinery that preserves useful performance.

### Vector and SIMD execution

Vector or SIMD execution applies one instruction to several lanes. It amortizes instruction and control overhead across multiple data elements. The programmer or compiler must expose independent elements, align data layouts, handle tails, and determine what happens when lanes require different control paths.

Vector efficiency depends on active-lane fraction and memory supply. Padding, masking, indirect access, and short dimensions reduce the amount of useful work per issued instruction. Wider vectors do not help a dependency chain that exposes only a few elements at a time. Conversely, regular tensor and signal-processing kernels can gain high efficiency from vector operations without adopting a separate device programming model.

### SIMT execution

Single-instruction, multiple-thread execution presents many logical threads while scheduling them in groups that share execution resources. Each thread has its own logical state and control flow, which makes the model more expressive than a single fixed vector instruction. Efficiency remains highest when threads in a group follow compatible paths and access memory in coalescible patterns. Divergent paths mask lanes, and scattered addresses generate additional transactions [1.8].

SIMT hardware also relies on a large pool of resident work to hide latency. Registers, local storage, synchronization, and block dimensions affect occupancy. This makes the execution model well suited to abundant, regular parallelism and less efficient for small batches, deeply sequential phases, or highly variable per-thread work. It remains functionally capable of those workloads; the issue is useful work per provisioned resource.

### Spatial and dataflow execution

A spatial architecture maps operations and storage across processing elements connected by an on-chip network. Values move through the structure according to a scheduled pattern, data readiness, or a hybrid of both. Instead of repeatedly fetching and decoding instructions for every arithmetic operation, the configuration and placement can persist while many data items flow through.

This organization can reduce control overhead and make local communication explicit. It can also expose deterministic paths and high operand reuse. Its efficiency depends on mapping the computation to the physical array: a shape that fits one array dimension well may leave processing elements unused for another shape. Dynamic control, arbitrary graphs, and rapidly changing dimensions require reconfiguration, flexible routing, or fallback.

Systolic arrays are a specific spatial organization in which processing elements rhythmically compute and pass values to neighbors. Their historical motivation was to use simple, regular structures and keep data moving locally rather than repeatedly accessing central storage [3.1]. A systolic array is therefore not synonymous with every tensor processor or dataflow accelerator.

### Reconfigurable and fixed-function execution

Reconfigurable logic can construct customized pipelines, arithmetic, state machines, and interfaces after manufacturing. It provides more structural freedom than a fixed instruction set but pays for programmability in configuration resources, routing, clock rate, density, and tool complexity. It is attractive when algorithms, interfaces, or precision change but the workload benefits from a tailored data path.

Fixed-function engines encode a narrow and stable operation directly. They can remove instruction overhead, unused formats, and general routing, but provide little tolerance for semantic change. Video codecs, image-signal functions, cryptography, and sensor processing illustrate where a stable standard or high product volume can justify such narrowing. AI operators and model graphs evolve more quickly, which usually increases the value of some programmability around specialized arithmetic.

### Execution-model combinations

A heterogeneous system may use all of these models in one request. A CPU parses input and manages control; a vector engine preprocesses features; a SIMT device executes irregular but parallel kernels; a matrix array performs dense operations; and a fixed-function block handles media or sensor conversion. The architectural problem becomes orchestration across boundaries rather than selection of one universal execution model.

### Table 3.2 — Execution models and their central assumptions

| Execution model | Efficiency assumption | Hardware retained | Responsibility transferred to software | Common mismatch |
|---|---|---|---|---|
| Scalar/out-of-order | Limited or irregular parallelism; uncertain dependencies | Dynamic scheduling, speculation, coherent caches | Moderate; conventional compiler and OS model | Repeated regular arithmetic pays high control cost |
| Vector/SIMD | Same operation over active lanes | Vector registers, lane control, masks | Vectorization, layout, tail handling | Narrow dimensions, masking, irregular loads |
| SIMT | Many independent threads with compatible paths and accesses | Thread state, warp scheduling, coalescing, caches and shared memory | Kernel decomposition, block sizing, occupancy and locality tuning | Divergence, insufficient work, scattered traffic |
| Spatial/dataflow | Reusable mapping and local value movement | Processing-element array, local storage, routing | Placement, tiling, dataflow, synchronization | Shape mismatch, dynamic control, reconfiguration cost |
| Reconfigurable | Workload stable long enough to configure a tailored path | Configurable logic, routing, memories, interfaces | Hardware construction, timing, verification, tool flow | Low density, long compile, portability burden |
| Fixed function | Operation and standard remain stable | Only required datapath and control | Integration and invocation | Algorithm or format change |

[**Figure 3.2 placeholder — Execution models without a replacement hierarchy.** Show scalar, vector/SIMD, SIMT, spatial/dataflow, reconfigurable, and fixed-function execution as overlapping regions across control flexibility, parallel width, mapping explicitness, and specialization. Include a representative heterogeneous pipeline demonstrating that several models cooperate in one AI request.]

## 3.3 Parallelism Is Multidimensional

“Parallel” does not describe one resource. A workload can expose parallelism at several levels:

- **Instruction-level parallelism:** independent operations within one control stream.
- **Data parallelism:** the same transformation over elements, samples, tokens, pixels, or tensor tiles.
- **Thread or task parallelism:** independent kernels, requests, experts, pipeline stages, or services.
- **Pipeline parallelism:** different stages operating concurrently on different data.
- **Model parallelism:** parameters or operations divided across devices because one device cannot hold or compute the model.
- **Data parallelism across devices:** replicated computation over different samples followed by state exchange.
- **Fleet parallelism:** many independent jobs or tenants assigned across a pool.

These forms are not interchangeable. Batch parallelism can fill a wide matrix engine but adds queueing and state. Pipeline parallelism increases concurrency but introduces bubbles and stage balance. Tensor or model parallelism overcomes capacity but creates communication and synchronization. Fleet parallelism improves aggregate utilization but does not reduce the latency of one dependent request.

### Available parallelism versus provisioned width

The relevant quantity is ready useful work over time, not total operations. A million-operation graph may expose only a small frontier at a particular moment. Dependency depth, dynamic routing, variable sequence lengths, and synchronization continuously change that frontier.

Provisioning execution width above the ready frontier leaves resources idle. Provisioning below it increases completion time. Hardware multithreading, queueing, batching, and interleaving several requests can fill gaps, but each requires additional state and may violate a latency or isolation objective. This creates a design frontier rather than a single optimum.

### Parallelism across the compute continuum

Hyperscale systems can draw parallelism from many users and jobs, but must preserve fairness, tail latency, failure headroom, and model residency. Enterprise private infrastructure has fewer independent jobs; consolidation may fill devices, while data boundaries and predictable latency constrain sharing. A mobile device usually cannot manufacture another user request and must exploit parallelism within one interaction or among local functions. A robot may run many sensor pipelines concurrently, yet safety priorities and memory interference limit unconstrained sharing.

The architectural implication is that execution width should be assessed against the distribution of ready work under the deployment’s batching and latency policy. Peak width without admissible concurrency is stranded capacity.

## 3.4 Dataflow: Scheduling Computation and Movement Together

In accelerator design, **dataflow** commonly refers to how loop iterations and operands are mapped across time, processing elements, and memory levels. It should not be confused with the abstract model graph alone. Two systems can execute the same matrix multiplication while using different tile sizes, operand residency, multicast, reduction paths, and traversal order.

A dense tensor operator contains several reuse opportunities. An input activation may be consumed by many weights; a weight may be used for many input positions; and a partial sum may receive many contributions. Local storage cannot usually retain every operand simultaneously. A dataflow chooses which reuse to prioritize and where accumulation occurs.

Common descriptions include:

- **Weight-stationary:** retain weights locally and stream activations or partial sums.
- **Output-stationary:** retain partial sums locally until accumulation completes.
- **Activation- or input-stationary:** retain activations for reuse across weights or outputs.
- **Row-stationary:** combine several forms of reuse across a mapped row or region.
- **Streaming:** move values through a pipeline with limited intermediate storage.

These names are shorthand, not complete architectures. Actual behavior also depends on loop order, tile shape, array dimensions, multicast and reduction support, bank organization, double buffering, and the hierarchy outside the array. Eyeriss demonstrated that dataflow should be compared under common area and parallelism constraints because movement at different hierarchy levels has different energy cost [1.10]. Timeloop and MAESTRO formalized the exploration of mappings, reuse, performance, and hardware cost across large design spaces [3.2][3.3].

### Spatial and temporal mapping

A **spatial mapping** assigns different loop iterations or operations to different processing elements. A **temporal mapping** schedules iterations on the same element over time. Increasing spatial mapping exposes throughput but distributes storage and communication. Increasing temporal reuse reduces movement but may lengthen latency or require more local capacity.

Mapping must match both tensor shape and hardware shape. A square array may perform well on large balanced matrices and poorly on narrow matrix-vector work. Partitioning, padding, folding, or combining requests can improve occupancy, but these transformations add movement or latency. This is the dataflow version of the software-ceiling test from Chapter 2: once admissible transformations cannot fill the structure, a differently shaped or more flexible engine may be needed.

### Dataflow outside dense tensors

Sparse, graph, MoE, and planning workloads require dataflow decisions too, but ready work and destinations may be known only at runtime. Their mapping includes queue placement, index traversal, routing, load balance, and reduction. Static placement can be efficient when structure is stable; dynamic work distribution preserves utilization when structure changes. Supporting both increases routing, metadata, and scheduling cost.

### Compiler-visible dataflow

The compiler must express the iteration space, dependencies, legal reorderings, memory levels, and communication. If the hardware’s efficient dataflow cannot be represented at an appropriate abstraction, programmers fall back to hand-written kernels or vendor libraries. Conversely, a compiler cannot safely invent reuse that the algorithm’s dependencies or dynamic indices do not permit.

[**Figure 3.3 placeholder — One tensor operation, several mappings.** Use a small matrix or convolution loop nest and show weight-stationary, output-stationary, and streaming mappings across a processing-element array and memory hierarchy. For each mapping, highlight what remains local, what is multicast, what is reduced, and which tensor shapes could underfill the array. Do not present one dataflow as universally superior.]

## 3.5 Memory Systems: Placement, Movement, and Consistency

Arithmetic consumes operands; the memory system determines whether they arrive at the required rate, latency, and energy. “Memory” is not one resource. Registers, local SRAM, caches, device memory, shared system memory, host memory, remote memory, and storage differ in capacity, bandwidth, access granularity, latency, energy, ownership, consistency, and failure behavior.

### Capacity, bandwidth, and latency are different constraints

Capacity answers whether state fits. Bandwidth answers how quickly a sustained stream can move. Latency answers how long an individual dependency waits. A memory can have high aggregate bandwidth but remain unsuitable for a serial pointer chase. A low-latency local SRAM can be too small to hold the working set. A large memory can hold the model while consuming too much energy to stream it for each token.

The hierarchy must be evaluated at every boundary. Arithmetic intensity measured against device memory may look favorable while register spills make the kernel local-memory bound. A device may have ample internal bandwidth while host-device transfers starve it. A cluster may have sufficient aggregate network capacity while one collective or shard hot spot determines tail time.

### Caches

A cache discovers reuse dynamically and preserves a conventional address-space abstraction. It works well when recently or nearby used data is likely to be used again. Hardware tags, replacement, coherence, prefetching, and miss handling make that reuse largely transparent to software.

Transparency is not free. Tags, lookup, speculation, overfetch, replacement, and coherence consume area and energy. Cache latency and hit rate vary with interference and access history. Large sparse or streaming working sets may fill caches with data that is not reused. Shared caches can improve average utilization while making worst-case service more difficult to bound.

### Scratchpads and explicitly managed local memory

A scratchpad exposes local SRAM to software or a compiler. Transfers are performed explicitly through loads, DMA, asynchronous copies, or dataflow. This removes tag lookup and replacement decisions, provides predictable capacity, and lets a mapping retain exactly the chosen tile.

The cost is a stronger software contract. The compiler or programmer must allocate space, schedule transfers, double-buffer data, avoid bank conflicts, and prove that producers and consumers synchronize correctly. Dynamic shapes, irregular addresses, oversubscription, and multi-tenant sharing complicate this management. A scratchpad therefore trades hardware discovery for software knowledge.

### Registers and distributed local state

Registers provide the lowest-latency operand storage but are limited and often partitioned among active contexts. Larger tiles can improve reuse while raising register pressure and reducing occupancy. Spills then move nominally local values into a slower memory tier, potentially reversing the expected benefit.

Distributed register files or SRAM banks scale bandwidth by placing storage near processing elements. They also create placement and routing constraints: a value may be physically close to one consumer and expensive for another. Multicast, reduction networks, and compiler mapping become part of the memory design.

### Shared, unified, and coherent memory

“Unified memory” can mean one virtual address space, one physical memory pool, automatic migration, or coherent access by several engines. These properties should be distinguished:

- **Addressability:** can an engine name the location?
- **Residency:** where are the bytes physically stored now?
- **Consistency:** when do writes become visible?
- **Coherence:** which mechanism keeps cached copies compatible?
- **Migration:** who moves pages or objects?
- **Concurrency:** can engines access the data simultaneously without copies?
- **Performance isolation:** which arbitration protects latency and bandwidth?

A shared address can reduce programming friction while retaining nonuniform latency and bandwidth. Coherence simplifies fine-grained sharing but generates metadata, probes, and ordering cost. Explicit ownership and message passing can be more efficient and predictable but require transfers and synchronization in software.

### Virtual memory and paging

Virtual memory enables protection, sparse allocation, oversubscription, sharing, and flexible placement. Translation lookaside buffers and page walkers become part of the access path. Large tensors can benefit from large pages; fine-grained sparse or fragmented state can create translation pressure. Page faults and migration may be acceptable in throughput jobs and unacceptable in a real-time control path.

Paged KV-cache management shows how an operating-system concept can improve accelerator-memory utilization [2.3]. It reduces fragmentation and supports flexible allocation, but it does not remove the live-state capacity or movement required by the model. The abstraction solves one layer of the problem while preserving the physical bound.

### Memory across deployments

Datacenter accelerators emphasize high-bandwidth device memory, model residency, scale-up access, fault containment, and useful capacity per rack. Enterprise systems add consolidation and manageability while often running at lower utilization. Mobile SoCs share physical memory among CPU, GPU, NPU, ISP, display, and modem; copies may be avoidable, but contention and power-domain activation remain. Embedded systems may prefer explicitly allocated SRAM and bounded DMA because predictable access is part of a deadline argument.

### Table 3.3 — Cache and scratchpad as different contracts

| Concern | Hardware-managed cache | Software-managed scratchpad |
|---|---|---|
| Reuse discovery | Dynamic, based on addresses and history | Explicit, based on mapping and transfers |
| Irregular workloads | Tolerates uncertainty when working set has locality | Difficult unless indices and capacity are known |
| Predictability | Hit-dependent and interference-sensitive | More predictable after allocation and transfer schedule |
| Hardware cost | Tags, lookup, replacement, miss machinery, possible coherence | Simpler storage, DMA or copy engines, banking |
| Software cost | Lower initial placement burden | Tiling, allocation, synchronization, double buffering |
| Oversubscription | Natural eviction, but possible thrashing | Explicit spill, retile, or fallback required |
| Multi-tenancy | Shared capacity and interference need control | Partitioning is explicit but may waste reserved space |
| Best fit | Evolving, irregular, or general workloads | Stable mappings with predictable reuse |

[**Figure 3.4 placeholder — Memory as a contract, not a stack of capacities.** Show registers, distributed SRAM or scratchpad, caches, device or shared DRAM, host or remote memory, and storage. Annotate each level with capacity, latency, bandwidth, access granularity, energy, ownership, consistency, and predictability. Overlay cache-managed, scratchpad-managed, and unified-address paths for datacenter, mobile, and real-time embedded examples.]

## 3.6 Precision Is an Architectural and Numerical Contract

Reducing numerical precision can increase arithmetic density, reduce storage, raise effective bandwidth, and lower movement energy. It is not merely a switch that converts a workload from one throughput rating to another. A format defines range, resolution, special values, rounding, accumulation, conversion, and reproducibility behavior. The algorithm determines whether those semantics preserve quality.

### Storage, multiplication, and accumulation may use different formats

Mixed-precision execution commonly stores operands in a narrow format, multiplies them using narrow arithmetic, and accumulates into a wider format. Training may retain a wider master copy of parameters or use scaling to protect small gradients. Micikevicius and colleagues demonstrated that mixed-precision training required explicit techniques including loss scaling, wider accumulation, and a higher-precision weight copy to preserve accuracy with FP16 [3.4].

This illustrates a broader principle: supported input precision does not fully describe the numerical path. Architects must identify:

- Input and output formats.
- Product and accumulator width.
- Rounding and saturation.
- Reduction order.
- Conversion points and their cost.
- Treatment of denormals, infinities, and exceptional values.
- Deterministic versus implementation-dependent behavior.

BF16 preserves the exponent range of FP32 while reducing significand precision, changing the balance between overflow tolerance and rounding error. Empirical work across several training domains showed why range and conversion behavior matter independently of nominal bit width [3.5]. Integer inference similarly requires calibration, scale and zero-point handling, accumulation width, and decisions about per-tensor or per-channel quantization.

### Precision changes the memory system too

Halving operand width can double the number of values carried by a fixed-width interface and allow larger tiles or models to fit locally. Packing and compressed storage can reduce traffic, but conversions, alignment, and unsupported operators can create new movement. If an accelerator accepts narrow operands but repeatedly expands them in memory or transfers wide intermediates between engines, the theoretical bandwidth benefit is not realized.

### Precision is phase- and operator-specific

Some layers, reductions, optimizer states, scientific calculations, or safety functions require greater range or precision than the dominant matrix operations. A useful architecture supports a numerical mix without forcing the entire graph onto its widest and most expensive path. It must also avoid making rare high-precision operations so costly that they fragment execution across devices.

### Approximation and quality

Quantization, sparsity, approximate arithmetic, and reduced iteration counts exchange numerical or model fidelity for efficiency. The admissible error depends on the application. A small change in ranking quality may have economic impact; a scientific solver may diverge; a perception system may lose safety margin. Hardware should therefore expose numerical behavior precisely enough for training, calibration, validation, and certification.

Across the continuum, datacenters may accept complex mixed-precision recipes when fleet savings justify software effort. Enterprise systems value stable support across model upgrades. Mobile devices use quantization to reduce battery energy and footprint but must avoid fallback. Embedded and automotive systems may prefer fixed formats and deterministic rounding because validation and long lifecycle dominate.

## 3.7 Scheduling: Who Decides What Runs When

Scheduling exists at several layers:

- The compiler orders operations and transfers within a kernel or graph.
- The device scheduler assigns warps, tiles, blocks, or commands to execution resources.
- The runtime admits kernels, forms batches, manages streams, and selects devices.
- The driver and firmware manage queues, memory operations, and interrupts.
- The operating system schedules host threads and may arbitrate accelerators.
- A cluster scheduler places jobs, models, and services across nodes.
- An application scheduler applies priorities, deadlines, and admission policy.

Optimizing one layer can move queueing into another. A host may submit work rapidly while a firmware queue grows invisibly. A cluster scheduler may reserve a device for a latency-sensitive service while the device internally admits long non-preemptible kernels. An OS priority has little meaning if DMA and accelerator queues do not propagate it.

### Static scheduling

Static scheduling determines placement, ordering, and movement before execution. It can remove dynamic hardware and provide predictable timing. It works best when shapes, dependencies, memory addresses, and operation cost are known. Spatial arrays, VLIW engines, pipelines, and scratchpad-based accelerators often rely on substantial static scheduling.

The limitation is uncertainty. Variable sequence lengths, sparse indices, MoE routing, graph degrees, page faults, and shared-resource interference may not be known at compile time. A static schedule can pad for the worst case, compile several variants, or fall back to dynamic execution. Each choice costs area, code size, utilization, or predictability.

### Dynamic scheduling

Dynamic scheduling reacts to ready work and runtime state. It can balance variable tasks, tolerate latency, and share resources among tenants. Work queues, hardware thread schedulers, out-of-order issue, and dynamic batching are examples at different scales.

The cost includes queue state, arbitration, synchronization, metadata, and variable timing. Dynamic policies can optimize average utilization while producing tail latency or priority inversion. They also require observability: without queue depth, service time, and contention metrics, software cannot determine why a nominally fast accelerator misses an objective.

### Hybrid scheduling

Most practical systems are hybrid. A compiler statically tiles a kernel; hardware schedules ready groups; a runtime dynamically batches requests; and the OS or orchestrator allocates devices. The design question is where uncertainty should be resolved. Resolving it early allows simpler hardware; resolving it late preserves adaptability.

### Batching, preemption, and isolation

Batching converts independent requests into efficient tensor shapes but consumes queueing time and memory. Preemption protects latency but requires a safe interruption point and somewhere to preserve state. Fine-grained preemption increases control overhead; coarse-grained preemption can leave a deadline-critical request waiting behind a long kernel.

Isolation reserves execution, memory bandwidth, capacity, or queue priority. Reservation improves predictability but can lower aggregate utilization. For datacenters and enterprise systems, the economic question is how much headroom is required to meet SLOs. For mobile, isolation protects foreground responsiveness and camera or display service. For robotics, it may be part of a safety argument.

## 3.8 Compiler, Runtime, Driver, and Operating-System Interaction

An accelerator is programmable only through its software path. Functional support means a model can execute. Performance support means it can be mapped without excessive copies, conversions, padding, fallback, synchronization, or recompilation. Operational support adds deployment, observability, isolation, fault handling, versioning, and lifecycle maintenance.

### From model graph to executable schedule

A typical lowering path passes through several representations:

1. Framework operators and dynamic program behavior.
2. A captured graph or tensor program.
3. Shape, type, alias, and dependency analysis.
4. Graph transformations such as fusion, constant folding, quantization, and layout selection.
5. Operator or loop decomposition into tiles.
6. Mapping to execution units, memory levels, and communication.
7. Device code, command buffers, and runtime metadata.

High-level representations preserve model meaning and optimization scope. Low-level representations expose target-specific storage, instructions, synchronization, and layout. Multi-level compiler infrastructure exists because lowering immediately from a model graph to machine instructions would either lose semantic information too early or require one monolithic representation to describe incompatible abstractions. MLIR was explicitly designed to support reusable representations and transformations across heterogeneous and domain-specific systems [3.7].

TVM demonstrates the need to combine graph-level fusion, operator-level schedules, hardware-specific primitives, and memory-latency hiding across CPUs, GPUs, mobile devices, and accelerator back ends [3.6]. Halide’s separation of algorithm from schedule similarly shows why computation semantics and decisions about tiling, fusion, storage, vectorization, and parallelism should be related but not conflated [3.8].

### Shape specialization and dynamic behavior

Static shapes enable aggressive allocation, tiling, fusion, and code generation. Dynamic shapes improve generality but require guards, runtime dispatch, bounded polymorphism, or recompilation. A compiler may generate several specialized variants and select among them. Too few variants waste performance through padding; too many increase compile time, memory, validation, and cache pressure.

Dynamic control also challenges graph capture. Data-dependent loops, external calls, mutation, and custom operators may break a compiled region. The transition between compiled and eager or host execution becomes an architectural boundary with copies, synchronization, and wakeups.

### Operator coverage and fallback

An accelerator’s useful coverage is the fraction of the end-to-end path that remains on its efficient execution and memory domain. A rare unsupported operator can be inexpensive if tensors are small and memory is shared. The same fallback can dominate if it transfers a large intermediate, wakes a CPU or GPU, changes layout, and serializes the pipeline.

Coverage must therefore be measured by time, movement, energy, and critical-path effect—not by operator count. Compiler reports should expose partitions, conversions, inserted copies, estimated and measured cost, and numerical changes.

### Runtime responsibilities

The runtime manages executable variants, memory pools, queues, batching, dependencies, streams, device selection, and error propagation. It may also coordinate collectives, checkpointing, model residency, and graph partitioning. Runtime policy is part of architecture because it determines whether the hardware’s local storage, concurrency, and power states are used effectively.

### Driver, firmware, and OS responsibilities

The driver exposes queues, memory mappings, synchronization, interrupts, protection, accounting, reset, and recovery. Firmware may schedule commands, manage power, and hide hardware details. The OS owns processes, address spaces, CPU priorities, and system-wide policy, but heterogeneous devices can create scheduling and memory behavior outside conventional OS visibility.

For systems architects, the important interfaces include:

- Memory allocation, pinning, mapping, residency, and migration.
- Queue priority, admission, cancellation, and preemption.
- Synchronization primitives and timestamping.
- Performance counters and trace correlation across engines.
- Security domains and tenant isolation.
- Error reporting, reset scope, and recovery.
- Power-state control and thermal feedback.

### Performance portability

Performance portability does not mean identical kernels or schedules on every device. It means that the software retains enough semantic information to generate or select an efficient mapping while preserving numerical and operational behavior. Strong abstraction hides accidental detail but exposes decisions that materially affect cost.

The tradeoff is unavoidable: exposing every hardware mechanism burdens applications; hiding all mechanisms prevents informed placement and diagnosis. Multi-level IRs, libraries, profiles, and declarative constraints are attempts to place that boundary at useful levels.

[**Figure 3.5 placeholder — Software-to-hardware lowering and feedback loop.** Show framework graph, high-level tensor IR, optimization and quantization, loop or tile IR, target-specific lowering, runtime queues, driver/firmware, and hardware. Add feedback from profiling, numerical validation, and deployment telemetry. Mark where shapes, layouts, memory placement, precision, scheduling, fallback, and power policy become fixed.]

## 3.9 Communication Is Part of Computation

Communication occurs whenever a producer and consumer are separated in space, time, ownership, or failure domain. At small scale it may be a register bypass. At larger scale it may be an SRAM bank, network on chip, package link, host interconnect, rack fabric, or datacenter network. The same questions recur:

- What data moves, and at what granularity?
- Is the pattern point-to-point, multicast, broadcast, reduction, gather, scatter, or all-to-all?
- Which topology connects participants?
- Who routes and schedules traffic?
- Which ordering and consistency are guaranteed?
- How is backpressure exposed?
- What happens on congestion, retry, timeout, or component failure?

### On-chip communication

Centralized register files and buses simplify access but scale poorly in ports, wiring, and energy. Distributed storage and processing increase aggregate bandwidth but require routing and placement. A systolic path offers efficient neighbor communication for regular flows; a packet network supports flexible destinations at greater control and buffering cost.

Multicast can deliver one weight or activation to several processing elements without repeated memory reads. Reduction trees combine partial sums efficiently. These mechanisms are useful only when the mapping exposes the corresponding pattern. Arbitrary sparse or graph traffic may require flexible routing and queues, which consume area and can create hot spots.

### Device and package communication

Multiple dies or accelerators exchange model partitions, activations, gradients, KV state, and control. Link bandwidth alone does not determine behavior. Transaction size, protocol overhead, topology, hop count, routing, congestion, memory registration, and synchronization affect useful throughput and tail latency.

Scale-up communication aims to make a set of devices cooperate on one tightly coupled workload. Scale-out communication connects larger failure domains through networks with different latency and reliability. A workload partition that is efficient within one package can become communication-bound across nodes.

### Collective communication

Distributed training and sharded inference use collectives such as broadcast, all-gather, reduce-scatter, all-reduce, and all-to-all. Different algorithms trade bandwidth, latency, temporary storage, and topology fit. Hierarchical systems often need hierarchical collectives; BlueConnect, for example, decomposed all-reduce to use heterogeneous network layers more effectively [3.9].

Communication overlap is a schedule, not a deletion of traffic. It succeeds only when independent computation is ready, buffers are available, and the network makes progress concurrently. At the dependency boundary, remaining communication becomes visible.

### Communication across deployments

Datacenters make accelerator-to-accelerator and rack networking part of model execution and cost. Enterprise private clusters use similar principles at smaller scale, where underutilized fabric and operational simplicity matter more. Mobile systems communicate through an on-chip interconnect and shared memory; avoiding explicit copies does not eliminate arbitration or DRAM energy. Robotics adds sensor links, timestamp alignment, deterministic delivery, and actuator deadlines. In every case, the architecture boundary should follow measured communication and ownership, not marketing categories.

[**Figure 3.6 placeholder — Communication hierarchy and operation patterns.** Show register or PE neighbor links, on-chip network, package links, host-device path, scale-up fabric, and scale-out network. Overlay multicast, reduction, all-gather, all-to-all, sensor stream, and control-message patterns. Annotate latency, bandwidth, topology, ordering, congestion, power, and failure-domain changes across levels.]

## 3.10 Architectural Principles Across the Compute Continuum

The principles above recur across deployment classes, but the preferred contract differs.

### Table 3.4 — Architectural contracts across deployment classes

| Contract | Hyperscale/datacenter | Enterprise/private infrastructure | Client/mobile | Embedded/automotive/robotics |
|---|---|---|---|---|
| Execution | Wide throughput plus flexible kernels and specialized units | Consolidated heterogeneous execution sized for variable demand | Batch-one efficiency, low overhead, power-gated engines | Deterministic pipelines, control handling, bounded service |
| Parallelism | Across tensors, devices, jobs, and fleet | Across local services and tenants with less statistical multiplexing | Within one interaction and among local functions | Across sensor and control pipelines under priority constraints |
| Dataflow | Large tiles, model partitioning, explicit collective overlap | Stable private models, right-sized mappings, manageable variants | Shared-memory tiling, minimized copies and wakeups | Streaming and near-sensor flows with bounded buffers |
| Memory | HBM or large device memory, distributed state, scale-up access | Local model/index residency, tiering, lifecycle manageability | Shared LPDDR, limited SRAM, system contention | Explicit SRAM, bounded DMA, local maps and safety state |
| Precision | Aggressive mixed precision when time-to-quality permits | Stable supported formats across deployed model portfolio | Quantized inference under quality and coverage constraints | Validated fixed or mixed formats with deterministic behavior |
| Scheduling | Fleet placement, batching, sharing, headroom, failure recovery | Consolidation and SLOs with smaller queues and support teams | Foreground priority, thermal policy, power domains | Deadline, preemption, isolation, safe fallback |
| Software | Large compiler/runtime investment amortized at scale | Portability, manageability, and long support life | OS-integrated graph partitioning and app lifecycle | Timing analysis, certification, controlled updates |
| Communication | On-chip through rack-scale collectives | Smaller fabrics, private data locality, operational simplicity | On-chip interconnect, shared memory, sensor and media paths | Time-aware sensor and actuator communication |

Several ideas migrate in both directions. Explicit local memory and power gating developed under constrained energy can inform datacenter efficiency. Datacenter compiler IRs and telemetry can improve smaller heterogeneous systems. The implementation still changes because the economic and physical envelopes differ.

## 3.11 Engineering Takeaways

- A workload signature constrains execution, data placement, numerical behavior, scheduling, communication, and software simultaneously; therefore, an accelerator should be evaluated as a collection of contracts, not as an arithmetic unit with a peak operation rate.
- Scalar, vector, SIMT, spatial, reconfigurable, and fixed-function models retain different amounts of dynamic machinery, so specialization improves efficiency by exploiting assumptions and transferring responsibility rather than by creating universally faster execution.
- Total operation count does not reveal ready parallel work over time; thus, execution width must be matched to dependency depth, admissible batching, work variance, and deployment latency.
- Dataflow determines which values remain local and which hierarchy levels carry traffic, which means the same arithmetic can have materially different utilization and energy under different mappings.
- Caches discover reuse dynamically while scratchpads require explicit placement; the choice therefore trades transparency and adaptability against predictability, storage efficiency, and software burden.
- Shared addressability does not guarantee uniform latency, bandwidth, residency, coherence, or isolation, so system architects must specify the complete memory contract for every engine boundary.
- Numerical width, range, accumulation, rounding, and conversion jointly determine quality and performance; accordingly, precision support should be evaluated as an end-to-end numerical and memory path, not a TOPS label.
- Scheduling decisions span compiler, device, runtime, driver, OS, application, and cluster layers, so priority, backpressure, observability, and failure semantics must cross those layers if service objectives are to hold.
- Compiler coverage can be functionally complete while inserting costly copies, conversions, padding, or fallback; therefore, useful programmability is measured by end-to-end mapping quality and lifecycle support.
- Communication patterns and failure domains change from on-chip links to scale-out networks, making interconnect and collectives part of the execution architecture whenever state is distributed.
- The same principles recur across the compute continuum with different objectives; architectural ideas can therefore be reused, but their physical organization and software contracts must be retuned for each deployment envelope.

Chapter 4 now applies these principles under pressure. It examines what happens when locality is incomplete, parallelism is insufficient, communication becomes visible, resources interfere, deadlines bound scheduling freedom, energy limits active hardware, or failures interrupt a distributed computation. Those conflicts produce the design tradeoffs that later explain the diversity of CPUs, GPUs, domain-specific accelerators, memory-centric systems, and reconfigurable hardware.
