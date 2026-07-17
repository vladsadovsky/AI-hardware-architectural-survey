# Chapter 4. Architectural Stressors and Design Tradeoffs

Chapter 3 described the contracts through which hardware executes, stores, communicates, schedules, and exposes work to software. This chapter examines what happens when those contracts are stressed by real workloads.

A stressor is not a component and not automatically a defect. It is a workload or deployment condition that pushes an architectural resource toward a limit. The response is a tradeoff because improving one property usually consumes another: locality requires capacity or mapping effort; utilization may require batching and queueing; determinism reserves resources; programmability retains general hardware; reliability adds redundancy and recovery state; lower precision risks quality.

Each section uses the same reasoning chain:

> **Real-world scenario → Workload behavior → Software mitigation → Residual architectural limit → Direct consequence → Architectural response → New tradeoff**

The purpose is to narrow the design space without selecting an architecture family. Later chapters can then explain CPU, GPU, tensor, spatial, reconfigurable, memory-centric, and other designs as different bundles of responses to these stressors.

## 4.1 Stressors Interact

Architectural stressors rarely occur alone. The running example’s hyperscale document assistant is exactly such a system: a long-context inference service constrained by KV capacity, memory bandwidth, low-batch decode, dynamic arrivals, and tail latency simultaneously. Sharding the model solves capacity while adding communication. Batching improves utilization while adding queueing and state. Quantization reduces traffic while creating conversions and quality constraints. A design that optimizes one metric in isolation can make the system worse.

Three distinctions are essential.

First, **resource utilization is not useful utilization**. Busy arithmetic that computes padding, repeats work after a failure, or serves requests too late is not useful. Keeping a device occupied can increase queueing, heat, and energy without improving completed work under the objective.

Second, **average behavior is not tail or worst-case behavior**. Caches, dynamic scheduling, batching, and statistical multiplexing can improve average throughput while producing variance. Datacenter services care about tail latency; real-time systems may require a bounded path; mobile devices care about sustained performance after thermal equilibrium.

Third, **local optimization is not system optimization**. Reducing kernel time does not help if input preparation, host wakeups, communication, memory allocation, or postprocessing remains on the critical path. The measurement boundary must include all resources whose work changes because of the proposed response.

### Table 4.1 — Common optimization exchanges

| Optimization | Resource improved | Resource or obligation added | Failure mode when overused |
|---|---|---|---|
| Batching | Arithmetic utilization, throughput | Queueing time, state capacity, fairness policy | Tail-latency violation or memory exhaustion |
| Tiling | Locality, useful bandwidth | Local storage, boundary work, mapping complexity | Register/SRAM pressure, spills, underfilled tiles |
| Fusion | Intermediate traffic, launch overhead | Register pressure, code variants, reduced scheduling freedom | Lower occupancy, long kernels, compile complexity |
| Quantization | Capacity, bandwidth, arithmetic density | Calibration, conversions, numerical validation | Quality loss or fallback |
| Sharding | Effective capacity, aggregate compute | Communication, synchronization, failure exposure | Scaling loss and stragglers |
| Replication | Local access, availability, read bandwidth | Capacity and update consistency | Memory cost and stale state |
| Static scheduling | Predictability, lower control overhead | Shape assumptions, variants, reserved resources | Padding, poor adaptability, brittle timing |
| Dynamic scheduling | Adaptability, load balance, sharing | Queue state, arbitration, timing variance | Tail latency and priority inversion |
| Caching | Average latency and traffic | Tags, coherence, replacement, interference | Thrashing and unpredictable service |
| Scratchpad allocation | Predictability and storage efficiency | Explicit movement and synchronization | Software burden and oversubscription |

[**Figure 4.1 placeholder — Interacting stressors and moving bottlenecks.** Begin with a long-context inference or multimodal service. Show how batching, quantization, sharding, fusion, caching, and offload each relieve one pressure while increasing queueing, state, communication, register pressure, consistency, or integration cost. End with system objectives rather than a single throughput metric.]

## 4.2 Data Movement, Locality, and Bandwidth

Data movement is the recurring stressor because computation requires operands and produces state. Its cost depends on distance, access granularity, reuse, and whether movement performs useful work. The magnitudes deserve to be stated once, with their boundary: in 45 nm at 0.9 V, Horowitz reported roughly 0.9 pJ for a 32-bit floating-point add and about 3.7 pJ for a 32-bit floating-point multiply, single-digit to tens of picojoules for small on-chip SRAM accesses, and on the order of 640 pJ to read a 32-bit word from external DRAM—two to three orders of magnitude above the arithmetic that word feeds [4.1]. Absolute values have shifted with process generations and these figures must not be quoted as current constants, but the ordering and the orders of magnitude have proved durable: moving data through a memory system can cost far more energy than the computation it enables, and application–hardware matching must therefore optimize communication and computation together.

### Scenario: low-batch transformer decode

**Real-world scenario:** an interactive service or client generates one token at a time under an inter-token latency objective.

**Workload behavior and software mitigation:** established quantitatively in §2.5 and not restated here—narrow per-step operations over weights and growing KV state, dependencies limiting parallelism within a sequence, and the full software arsenal (quantization, fusion, residency, continuous batching, paging, speculative decoding) applied first.

**Residual architectural limit:** the minimum bytes required per accepted token, multiplied by the target token rate, approaches sustained memory bandwidth or energy—the ≈48 tokens/s, ≈0.3%-intensity bound computed in §2.5. More arithmetic units do not reduce compulsory weight and state traffic.

**Direct consequence:** execution units wait for operands; inter-token latency and energy per token remain high; a larger device may increase cost without proportional useful throughput.

**Architectural response:** increase effective local capacity and bandwidth, place compute closer to model state, optimize matrix-vector execution, or provide a dataflow that retains and distributes weights more efficiently.

**New tradeoff:** larger local memory consumes area and leakage; wider interfaces consume package and power budget; near-memory designs narrow programmability and complicate consistency; weight-stationary mappings may fit decode but not every phase.

### Scenario: sparse embedding or graph access

**Real-world scenario:** a recommendation, retrieval, or graph pipeline follows data-dependent indices through a working set much larger than cache.

**Workload behavior:** individual accesses use few bytes from a cache line, show long or weak reuse, require metadata and translation, and assign variable work to processing elements.

**Software mitigation:** reorder or partition data, cache popular entries, compress indices, batch gathers, replicate hot state, prefetch predictable portions, and use approximate search.

**Residual architectural limit:** cold and irregular accesses remain noncoalescible; dependent addresses prevent early prefetch; useful bytes per transaction stay low; hot partitions saturate while other capacity is idle. Reuse-distance analysis can identify when the working set will not return before eviction [2.13].

**Direct consequence:** bandwidth is consumed by metadata and overfetch; caches churn; latency tails grow; CPU, GPU, or matrix units wait despite low arithmetic demand.

**Architectural response:** provide gather/scatter support, larger translation structures, fine-grained memory transactions, near-memory lookup, compressed-domain processing, or dynamic routing to distributed banks.

**New tradeoff:** fine-grained transactions reduce overfetch but add request metadata and arbitration; replication consumes capacity and consistency traffic; near-memory processing fragments the programming model; specialized sparse hardware may perform poorly when the data becomes structured or dense.

### Scenario: continuous video and sensor pipelines

**Real-world scenario:** a phone, camera, vehicle, or robot must process a sustained stream without exceeding thermal or deadline limits.

**Workload behavior:** sensor and image stages create large tensors at fixed rates. Several engines may read and rewrite intermediate representations through shared memory.

**Software mitigation:** crop or downsample early, fuse stages, use zero-copy buffers, compress formats, skip frames, tile computation, and keep intermediate data resident.

**Residual architectural limit:** required freshness and quality set a minimum input rate; shared DRAM or inter-engine paths still carry large compulsory traffic; keeping general compute active turns movement energy into sustained heat.

**Direct consequence:** shared-memory contention delays other functions, the platform throttles, frames queue or drop, and mission or battery energy falls.

**Architectural response:** place preprocessing near the sensor, create streaming paths between stages, provide local line or frame buffers, and isolate always-on memory and power domains.

**New tradeoff:** early reduction can discard information needed later; local buffers consume area; fixed streaming paths reduce flexibility; distributed state becomes harder to inspect, validate, and update.

### Locality is constructed, not merely observed

Hardware and software cooperate to create locality. Layout, loop order, tiling, fusion, compression, partitioning, and request grouping determine which values are close in space and time. Caches exploit the resulting behavior dynamically; scratchpads and dataflows encode it explicitly.

The limiting cases differ:

- If reuse exists but software does not expose it, compiler and layout work may be sufficient.
- If reuse exists but local storage is too small, hardware capacity or a different tile hierarchy may help.
- If the algorithm has little reuse, a larger cache can waste area and energy.
- If indices are not known until runtime, static tiling cannot create complete predictability.
- If the latency objective prevents batching, cross-request reuse remains unavailable.

### Bandwidth must be useful and sustained

Peak bandwidth assumes a traffic pattern, transaction size, bank distribution, protocol efficiency, and concurrency. Useful bandwidth is the rate at which required bytes reach consumers. It excludes overfetch, retries, metadata not contributing to the result, padding, and traffic caused by avoidable movement.

Bank conflicts, hot spots, read/write turnarounds, refresh, coherence, translation, congestion, and small transactions reduce achieved bandwidth. A design should therefore report the traffic pattern and hierarchy level associated with a bandwidth claim.

[**Figure 4.2 placeholder — Useful-byte funnel.** Start with peak link or memory bandwidth and subtract protocol overhead, transaction granularity overfetch, metadata, bank or route imbalance, contention, and bytes with no reuse. Compare a tiled dense operator, random sparse gather, and shared-memory multimodal pipeline. End with useful operands delivered per second and energy per useful operand.]

## 4.3 Parallelism, Utilization, Latency, and Queueing

Parallel hardware is efficient when useful ready work matches provisioned width. Software can draw work from tensor dimensions, batches, concurrent requests, pipeline stages, or multiple tenants. Each source has different latency and isolation cost.

### Scenario: interactive service on a wide accelerator

**Real-world scenario:** an enterprise assistant, coding service, or local model has intermittent demand and a response-time SLO.

**Workload behavior:** requests arrive irregularly; shapes and output lengths vary; one request provides insufficient work to fill the device continuously.

**Software mitigation:** continuous batching, request bucketing, admission control, model consolidation, speculative execution, and concurrent serving of several tenants.

**Residual architectural limit:** the arrival stream and SLO cap the batch window; data boundaries or model residency constrain consolidation; long requests create service-time tails.

**Direct consequence:** either the accelerator remains underfilled and cost per request rises, or requests wait and tail latency rises. Enterprise systems feel this more strongly than hyperscalers because statistical multiplexing is weaker.

**Architectural response:** right-size execution width, support finer-grained independent scheduling, partition the device, provide low-overhead matrix-vector paths, or combine different engines for latency and throughput phases.

**New tradeoff:** partitioning can strand capacity; fine-grained scheduling consumes control state; smaller engines lose peak throughput on large batches; heterogeneous placement increases software and residency complexity.

### Scenario: training pipeline at scale

**Real-world scenario:** a datacenter training job partitions a model across many devices to reduce time to quality.

**Workload behavior:** stages have different compute and communication time; microbatches create pipeline fill and drain; sequence or expert variation creates stragglers.

**Software mitigation:** rebalance partitions, increase microbatches, overlap communication, recompute activations, use dynamic routing, and co-design parallelism dimensions.

**Residual architectural limit:** dependencies create unavoidable bubbles; increasing microbatches consumes activation memory and may change optimization behavior; runtime variation cannot be completely predicted.

**Direct consequence:** some devices wait while others work; useful scaling grows more slowly than device count; energy and capital cost per quality-adjusted result rise.

**Architectural response:** provide faster or topology-matched communication, larger activation memory, finer stage scheduling, hardware queues, or execution resources that better match nonuniform layers.

**New tradeoff:** more memory and network consume rack power and cost; dynamic scheduling reduces predictability; specialized stage hardware can fragment fleet capacity when model structure changes.

### Scenario: robotic worst-case scene

**Real-world scenario:** perception and planning must complete before a control deadline while scene complexity varies.

**Workload behavior:** object count, point density, graph size, and candidate plans increase in difficult scenes. Batch size remains one.

**Software mitigation:** cascaded models, work caps, early exit, priority, preallocation, and graceful degradation.

**Residual architectural limit:** safety or quality may require processing the complex case rather than dropping work; ready parallelism and memory demand vary at runtime.

**Direct consequence:** average utilization can look low while the worst case still misses a deadline. Filling idle periods with background work can create priority inversion or memory interference.

**Architectural response:** reserve bounded capacity, support preemption and isolation, use deterministic pipelines for critical stages, and size memory service for the verified case.

**New tradeoff:** reservation lowers average utilization; worst-case provisioning increases component cost and power; static paths reduce adaptability; certification expands to the scheduler and memory system.

### Utilization is a vector

Compute, register, local-memory, DRAM, link, network, power, and fleet utilization can move in different directions. High arithmetic occupancy may coexist with low useful memory bandwidth. High device occupancy may be achieved by queueing requests beyond their SLO. High rack power utilization may reduce failure or thermal headroom.

A useful utilization metric should therefore specify:

- Which resource is measured.
- Which work counts as useful.
- The time window.
- The quality and correctness condition.
- The latency, fairness, reliability, and headroom constraints.
- Whether padding, retries, recomputation, and speculative work are included.

### The latency-throughput frontier

Batching typically moves a system toward higher throughput and higher queueing latency. More concurrency hides device latency while consuming state and increasing interference. Preemption improves response for urgent work while lowering throughput through context save, cache disruption, and fragmentation.

There is no deployment-independent optimum. Hyperscale systems can exploit large populations but must manage tails. Enterprise private systems need right-sized capacity and consolidation. Mobile systems optimize one user’s responsiveness and energy. Embedded systems may accept low average utilization to guarantee a deadline.

[**Figure 4.3 placeholder — Latency, throughput, and useful-utilization frontier.** Plot throughput against end-to-end latency as batch window and concurrency increase. Show separate feasible regions for hyperscale service, enterprise private deployment, mobile interaction, and real-time robotics. Annotate memory growth, tail effects, preemption, and reserved headroom. Do not imply that the highest occupancy point is optimal.]

## 4.4 Synchronization, Communication, and Scalability

Scaling divides work and state across additional components. It succeeds when the added useful computation exceeds the communication, synchronization, imbalance, and failure cost introduced.

### Scenario: collective-heavy distributed training

**Real-world scenario:** data-parallel workers exchange gradients or sharded state every step.

**Workload behavior:** collectives move large buffers, synchronize participants, and expose the slowest worker or path. Tensor, pipeline, and expert parallelism add other exchange patterns.

**Software mitigation:** overlap communication with backward computation, bucket tensors, compress values, choose ring or tree algorithms, place ranks topology-aware, and combine parallelism dimensions.

**Residual architectural limit:** dependencies leave a final non-overlappable exchange; link and switch topology cap bisection; collectives compete; one congested or degraded path delays the group.

**Direct consequence:** devices idle at barriers, scaling efficiency falls, network energy rises, and step-time tails increase. BlueConnect shows why collective algorithms must reflect a heterogeneous network hierarchy rather than treating all links as equal [3.9].

**Architectural response:** add scale-up bandwidth, topology-aware collective engines, in-network reduction, direct memory access between accelerators, adaptive routing, or larger failure-isolated groups.

**New tradeoff:** high-radix and high-bandwidth fabrics consume package pins, area, power, and capital; in-network operations narrow semantics; larger tightly coupled groups expand the failure domain.

### Scenario: MoE all-to-all traffic

**Real-world scenario:** tokens route to experts distributed across devices.

**Workload behavior and software mitigation:** characterized in §2.7, where measurements place all-to-all at roughly a third of MoE step time; balance losses, capacity factors, token sorting, replication, placement, and hierarchical routing are applied first.

**Residual architectural limit:** model semantics preserve runtime skew; replication is capacity-limited; all-to-all traffic stresses different topology properties than bulk all-reduce.

**Direct consequence:** hot experts and links become stragglers, underloaded resources idle, and synchronization tails erase sparse arithmetic savings.

**Architectural response:** provide fine-grained routing, distributed queues, topology suited to permutation traffic, local expert memory, or hardware-assisted dispatch.

**New tradeoff:** flexible routers and queues cost area and energy; replication increases state and update traffic; specialized MoE paths may be underused by dense models.

### Scenario: heterogeneous SoC synchronization

**Real-world scenario:** camera, ISP, NPU, GPU, CPU, and display share buffers and deadlines.

**Workload behavior:** engines have different queues, clocks, power states, and memory views. Timestamps and buffer ownership cross device boundaries.

**Software mitigation:** shared buffers, fences, asynchronous queues, pipeline depth control, and explicit ownership protocols.

**Residual architectural limit:** a shared address does not eliminate cache maintenance, arbitration, wake-up, or ordering; one slow stage applies backpressure.

**Direct consequence:** copies and waits increase latency and energy; stale or misordered data harms quality; queues grow outside OS visibility.

**Architectural response:** coherent or explicitly managed shared memory, common synchronization primitives, timestamp propagation, bounded DMA, and cross-engine priority.

**New tradeoff:** coherence and ordering add traffic and verification; explicit ownership increases software burden; common scheduling interfaces constrain independent engine design.

### Scalability has several ceilings

- **Algorithmic ceiling:** serial or dependent work remains.
- **Partition ceiling:** state cannot be divided without excessive communication.
- **Topology ceiling:** links and routes do not provide the required pattern at scale.
- **Synchronization ceiling:** progress depends on the slowest participant.
- **Capacity ceiling:** buffers, tables, or checkpoints grow with participants.
- **Power ceiling:** communication and memory consume the rack or platform budget.
- **Reliability ceiling:** more components increase interruption probability and recovery frequency.
- **Economic ceiling:** marginal useful throughput costs more than an alternative design or additional deployment.

The architecture should identify which ceiling is approached before adding devices. Scale is a system property, not a count of arithmetic units.

[**Figure 4.4 placeholder — Scaling efficiency and communication exposure.** Show useful compute, overlappable communication, non-overlappable communication, imbalance, and recovery as device count increases. Compare all-reduce, all-to-all, pipeline, and heterogeneous-SoC synchronization patterns. Mark topology and failure-domain transitions.]

## 4.5 Determinism, Dynamism, and Control

Determinism has several meanings:

- Identical numerical result for the same input.
- Reproducible ordering of operations and reductions.
- Predictable execution time.
- Bounded worst-case latency.
- Predictable resource interference and failure behavior.

These properties are related but not equivalent. A deterministic instruction schedule can still wait unpredictably on shared memory. A numerically reproducible kernel can miss a deadline. A system with stable average latency can have an unbounded retry path.

### Scenario: tail-sensitive inference

**Real-world scenario:** a service must meet a 99th-percentile response objective while sharing hardware.

**Workload behavior:** requests vary in shape and length; caches, batching, dynamic frequency, page migration, and contention affect service time.

**Software mitigation:** bucket shapes, reserve headroom, cap batches, preallocate memory, pin models, isolate tenants, and use admission control.

**Residual architectural limit:** shared caches, non-preemptible kernels, hidden queues, and variable memory service remain outside the application’s direct control.

**Direct consequence:** a small fraction of requests violate the SLO; operators reserve excessive idle capacity to protect tails.

**Architectural response:** deterministic or bounded execution paths, queue priority, preemption points, memory partitioning, and observable admission control. Google’s first TPU evaluation explicitly connected a simpler deterministic execution model with production 99th-percentile requirements [1.12].

**New tradeoff:** removing dynamic mechanisms can reduce average performance on irregular work; reservations lower consolidation; preemption and partitioning cost state and area.

### Scenario: safety-relevant control

**Real-world scenario:** perception or planning must complete before an actuator deadline.

**Workload behavior:** batch one, variable scenes, shared sensors and memory, and fallback paths combine in a closed loop.

**Software mitigation:** static allocation, worst-case execution analysis, priority scheduling, bounded input sizes, redundant checks, and safe degradation.

**Residual architectural limit:** if the device does not expose bounded queue, DMA, memory, and preemption behavior, software cannot prove the end-to-end deadline.

**Direct consequence:** the platform cannot guarantee safe timing even when average inference is fast; certification or deployment may be blocked.

**Architectural response:** time-partitioned resources, deterministic interconnect and memory service, safety islands, monitored execution, and hardware-supported fallback.

**New tradeoff:** dedicated resources reduce utilization; constrained execution limits model change; redundant paths add cost, power, and validation.

### Static versus dynamic response

Static schedules reduce runtime uncertainty but assume known shapes, costs, and dependencies. Dynamic scheduling adapts to irregularity but introduces state and variance. Hybrid systems can reserve a critical path while scheduling best-effort work dynamically around it.

The correct choice follows the objective. A datacenter throughput job may tolerate variable step time if average time to quality improves. An online service may need controlled tails. A phone may prefer dynamic energy management until thermal oscillation harms responsiveness. A robot may require a bounded critical subset and allow dynamic background perception.

[**Figure 4.5 placeholder — Sources of end-to-end timing variance.** Trace one request through host scheduling, runtime queue, memory allocation, device queue, DMA, kernel execution, shared memory, and postprocessing. Mark average-improving mechanisms that can add variance. Contrast a throughput-oriented dynamic path with a bounded critical path and show the resources reserved to obtain predictability.]

## 4.6 Programmability, Portability, and Specialization

Specialization derives efficiency from assumptions. Programmability determines how many assumptions can change after manufacturing and how much software effort is required to exploit the hardware. Portability determines whether the model and its performance-relevant intent survive across targets.

### Scenario: a new operator on a deployed accelerator

**Real-world scenario:** a model revision introduces an attention variant, state-space operator, sparse routing rule, or preprocessing step not efficiently supported by the deployed device.

**Workload behavior:** most of the graph still maps to specialized units, but the new operation requires a layout, precision, control flow, or memory access pattern outside the existing path.

**Software mitigation:** decompose the operator into supported primitives, fuse adjacent work, generate a custom kernel, approximate the operation, or fall back to CPU or GPU.

**Residual architectural limit:** primitive decomposition may create intermediates and launches; the accelerator may lack programmable addressing, synchronization, precision, or local storage; fallback crosses a memory and power boundary.

**Direct consequence:** end-to-end latency and energy regress despite high supported-operator coverage; model deployment waits for compiler or firmware support; organizations retain a general device as insurance.

**Architectural response:** add programmable vector or scalar units, expose custom operations, use reconfigurable logic, define extensible instructions, or retain a heterogeneous companion processor.

**New tradeoff:** programmable machinery consumes area and energy even when idle; extensibility expands verification and security surfaces; custom kernels weaken portability; heterogeneous fallback increases orchestration.

### Scenario: one compiler targets several deployments

**Real-world scenario:** an organization deploys related models in cloud, enterprise appliances, laptops, phones, and embedded products.

**Workload behavior:** graph semantics are shared, but tensor shapes, memory capacity, supported precision, latency, and power objectives differ.

**Software mitigation:** use common model formats, multi-level IR, target-specific schedules, operator libraries, autotuning, and profile-guided compilation. TVM and MLIR illustrate how compiler infrastructure can preserve higher-level meaning while lowering to heterogeneous targets [3.6][3.7].

**Residual architectural limit:** performance-critical layout, tiling, synchronization, and memory decisions remain target-specific; dynamic behavior and custom operators may not lower uniformly.

**Direct consequence:** functional portability hides performance cliffs; validation multiplies across variants; a hardware change can strand tuned software and models.

**Architectural response:** standardize stable semantic layers, expose declarative memory and numerical constraints, provide introspection, and design hardware primitives broad enough to cover a workload domain.

**New tradeoff:** a stable abstraction may omit novel hardware features; exposing more detail burdens compilers and applications; compatibility can retain inefficient legacy behavior.

### The specialization budget

Every design spends a finite budget of area, power, engineering effort, and software complexity among:

- General instruction and control.
- Specialized arithmetic.
- Local memory.
- Address generation and data movement.
- Dynamic scheduling and queues.
- Interconnect and communication.
- Precision and format support.
- Protection, observability, and reliability.

Removing generality frees budget for arithmetic or storage, but also narrows the workload domain. Adding a “small programmable core” can handle exceptions but becomes a bottleneck if exceptions are common. Adding more operator types can increase coverage while fragmenting the data path and compiler.

The economically correct degree of specialization depends on workload stability and volume. Hyperscalers can co-design hardware and software around a large internal portfolio. Enterprise buyers need longer support and broader compatibility. Mobile SoCs amortize silicon across many devices but must anticipate application change over a product lifetime. Embedded and automotive systems may keep hardware for many years, making stable interfaces and updateability more valuable than short-term peak efficiency.

### Programmability is operational

Programming is more than kernel authoring. A usable architecture needs:

- Debuggers, profilers, traces, and numerical diagnostics.
- Versioned compiler and runtime behavior.
- Model partition and fallback visibility.
- Memory, queue, and power observability.
- Security and process isolation.
- Fault reporting, reset, recovery, and deployment automation.
- Long-term compatibility and update policy.

An architecture that is easy to program in a laboratory but difficult to monitor or recover in production transfers cost rather than eliminating it.

## 4.7 Energy, Power, and Thermal Constraints

Energy is accumulated work over time; power is the instantaneous or average rate of energy use; thermal behavior determines how that power changes temperature and sustainable performance. Optimizing one does not automatically optimize the others.

### Dynamic and static energy

Dynamic energy is consumed when capacitance switches: arithmetic, memory arrays, links, clocks, and control. Static or leakage power remains while circuits are powered. A larger cache may reduce DRAM accesses while adding leakage. A wider engine may complete work sooner and enter idle, or may remain underfilled while its supporting structures stay active.

Energy per useful result includes:

- Arithmetic and conversion.
- Register, cache, SRAM, DRAM, and storage accesses.
- On-chip and off-chip communication.
- Clocking, scheduling, and control.
- Host and companion-engine work.
- Idle and wake-up transitions.
- Cooling and power-conversion overhead at system scale.
- Retries, recomputation, checkpointing, and failed work.

### Scenario: datacenter rack power

**Real-world scenario:** a hyperscaler or enterprise cluster has additional workload demand but cannot activate more accelerators within rack power, facility, or cooling limits.

**Workload behavior:** devices alternate among compute, memory, and communication phases; stalled resources may still consume substantial power; synchronized jobs create peaks.

**Software mitigation:** improve placement, cap power, schedule phases, use lower precision, increase batching, consolidate jobs, and shift work in time.

**Residual architectural limit:** required useful throughput multiplied by the minimum energy per workload unit exceeds the deployable power envelope; caps reduce frequency or active devices.

**Direct consequence:** installed silicon cannot be used concurrently, time to result rises, and facility expansion or cooling becomes part of accelerator cost.

**Architectural response:** reduce data movement and control energy, improve power proportionality, add fine-grained power domains, co-design memory and interconnect, and expose power-aware scheduling controls.

**New tradeoff:** aggressive power gating adds wake latency; lower voltage can reduce timing margin; denser packaging raises heat flux; power-aware scheduling may lower utilization or fairness.

### Scenario: mobile sustained inference

**Real-world scenario:** a client device performs continuous translation, media generation, camera inference, or an on-device assistant.

**Workload behavior:** repeated computation and shared-memory traffic prevent deep idle; heat accumulates in a passively cooled enclosure.

**Software mitigation:** DVFS, race to idle, model compression, adaptive quality, duty cycling, and heterogeneous dispatch.

**Residual architectural limit:** the minimum acceptable quality and response rate still exceed sustainable platform power; moving work among engines does not reduce shared-memory and sensor energy enough.

**Direct consequence:** thermal throttling increases latency, battery drains, skin temperature rises, and other device functions lose budget.

**Architectural response:** use lower-energy local dataflow, reduce wake scope, retain state in low-power memory, and separate always-on from burst domains.

**New tradeoff:** additional power islands and local memory consume area; wake transitions complicate scheduling; fixed low-power paths may not support future models.

### Scenario: robotic mission energy

**Real-world scenario:** a battery-powered robot divides energy among sensing, computation, radio, and actuation.

**Workload behavior:** more local AI may reduce radio traffic and improve response but competes with locomotion and sensor energy.

**Software mitigation:** adapt model rate and quality, cache maps, offload when connectivity permits, and prioritize mission phases.

**Residual architectural limit:** remote execution cannot satisfy all deadlines or availability, while local general-purpose execution consumes too much mission energy.

**Direct consequence:** mission duration falls or autonomous capability must be reduced.

**Architectural response:** near-sensor processing, energy-proportional local acceleration, efficient state retention, and hardware support for the required critical path.

**New tradeoff:** distributed compute adds components, validation, and update surfaces; local specialization may sit idle in other mission phases.

### Energy proportionality and utilization

An energy-proportional system consumes little power when lightly loaded and increases power with useful work. Real memory, interconnect, cooling, and accelerator systems have fixed and idle costs. Consolidating work can amortize them, but consolidation adds contention and latency. The datacenter case for energy-proportional computing [1.4] and the mobile-to-datacenter memory example [2.16] show why low-load efficiency is a system concern across deployment classes.

[**Figure 4.6 placeholder — Power and energy boundaries across deployments.** Compare a datacenter request, mobile inference, and robotic control cycle. For each, divide energy among compute, memory, communication, host or companion engines, idle/wake, and system overhead. Show burst power, sustained thermal limit, and energy per useful result as different constraints.]

## 4.8 Reliability, Availability, Serviceability, and Safety

Reliability asks whether components and computations behave correctly over time. Availability asks whether useful service continues. Serviceability asks whether faults can be detected, isolated, repaired, and understood. Safety asks whether failures lead to controlled behavior. AI accelerators inherit conventional system faults and add long-running, highly parallel, numerically tolerant workloads in which some errors can be difficult to distinguish from model variation.

### Fault classes

Relevant faults include:

- Transient bit flips in logic, memory, and links.
- Permanent manufacturing or wear-out faults.
- Timing errors under voltage, temperature, or aging.
- Link loss, packet corruption, and congestion timeouts.
- Firmware, driver, compiler, and scheduling defects.
- Silent data corruption that escapes detection.
- Numerical instability or nondeterminism that complicates fault diagnosis.
- Power, cooling, and sensor failures outside the accelerator.

Protection must match the consequence. ECC may protect memory but not arithmetic. Retry can recover a link but increase tail latency. Checkpointing preserves training progress but consumes storage, bandwidth, and energy. Redundant execution can detect errors but doubles work. A safety system may require an independent fallback rather than continued best-effort acceleration.

### Scenario: long-running distributed training

**Real-world scenario:** a training job runs across thousands of components for long enough that some failure is expected.

**Workload behavior:** model state is distributed; participants synchronize; a failed device or link can interrupt the group; restarting loses work since the last durable state.

**Software mitigation:** checkpoint, retry, monitor, drain unhealthy components, reconfigure topology, and resume from known state.

**Residual architectural limit:** checkpoint intervals trade overhead against lost work; some failures corrupt state silently; tightly coupled collectives can make one fault global.

**Direct consequence:** goodput falls below nominal throughput, jobs miss schedules, and energy is spent repeating work. At scale, reliability becomes a performance and economic metric.

**Architectural response:** end-to-end error detection, link retry, memory protection, health telemetry, fault containment, spare capacity, reconfigurable routes, and fast recovery support. Google’s TPUv4 operational study describes automatic fault detection, fabric reconfiguration, remediation, and recovery as infrastructure required for a 4,096-node training system [4.2].

**New tradeoff:** protection consumes bandwidth, storage, area, power, and operational complexity; stronger coupling can improve normal performance while expanding the fault domain.

### Scenario: online inference and multi-tenancy

**Real-world scenario:** a service shares accelerators among models and tenants under availability and isolation objectives.

**Workload behavior:** one process can exhaust memory, submit a long kernel, trigger a device fault, or encounter corrupted state.

**Software mitigation:** quotas, watchdogs, process isolation, canarying, replication, health checks, and load balancing.

**Residual architectural limit:** if reset scope is device-wide, one fault disrupts unrelated tenants; if memory or queues lack protection, software cannot contain interference.

**Direct consequence:** failure blast radius and recovery time dominate availability; providers reserve capacity and replicas, lowering useful utilization.

**Architectural response:** protected address spaces, queue isolation, partitionable reset, fault attribution, hardware watchdogs, and redundant service paths.

**New tradeoff:** isolation and partitioning consume state and may prevent opportunistic sharing; fine-grained recovery increases hardware and driver complexity.

### Scenario: embedded and automotive safety

**Real-world scenario:** a component fault occurs during perception or control with limited connectivity.

**Workload behavior:** the system must detect the fault, determine confidence, and transition to a safe or degraded mode before the environment changes.

**Software mitigation:** plausibility checks, redundant sensors, independent monitors, watchdogs, and conservative fallback.

**Residual architectural limit:** common-mode faults, undetected corruption, shared power or memory, and unbounded recovery can defeat software redundancy.

**Direct consequence:** incorrect actuation, missed deadline, or loss of availability.

**Architectural response:** safety islands, diverse redundancy, lockstep or monitored execution where appropriate, protected memories and links, fault containment, and deterministic fallback interfaces.

**New tradeoff:** duplicated hardware adds SWaP-C and validation; diversity complicates software; conservative fallback can reduce capability.

### Reliability changes architecture selection

Peak throughput assumes successful work. A more fault-prone but faster system can deliver lower goodput after retries and recovery. A specialized engine may be simpler to verify but harder to replace or bypass. A flexible processor may support graceful fallback but consume more energy.

Reliability evidence must therefore identify the protected boundary, detected fault classes, recovery scope, performance overhead, and behavior under silent corruption. Product-level RAS claims without those boundaries are insufficient for architectural comparison.

[**Figure 4.7 placeholder — Fault containment and recovery path.** Show fault sources in arithmetic, memory, links, power, firmware, and software. Trace detection, attribution, containment, retry, checkpoint restore, route reconfiguration, degraded operation, and repair. Compare datacenter training, multi-tenant inference, and safety-critical embedded responses.]

## 4.9 Cost, Area, Lifecycle, and the Economics of Flexibility

The Chapter 2 escalation test treated hardware necessity as economic. Architectural tradeoffs determine both sides of that test.

### Silicon and system cost

Specialized arithmetic can provide more operations per area, but an accelerator also requires memory, interconnect, control, I/O, protection, power delivery, packaging, cooling, boards, and software. A design that minimizes core area may increase external memory or host cost. A larger on-chip memory can reduce energy and bandwidth while lowering manufacturing yield or arithmetic density.

System cost includes:

- Non-recurring design and verification.
- Masks, packaging, boards, power, cooling, and memory.
- Compiler, runtime, driver, firmware, tools, and frameworks.
- Integration, validation, security, and certification.
- Deployment, observability, support, replacement, and training.
- Capacity held for failures, latency headroom, or demand bursts.
- Porting and stranded-software risk when models or hardware change.

### Scenario: custom datacenter accelerator

**Real-world scenario:** a stable internal workload consumes enough fleet capacity and energy to motivate custom hardware.

**Workload behavior:** common operations and service objectives repeat at large volume; software and models can be co-designed.

**Software mitigation:** optimize libraries, compile graphs, tune batching and placement, and use available GPUs more efficiently.

**Residual architectural limit:** general control, memory hierarchy, precision, or scheduling consumes material cost and energy that software cannot remove.

**Direct consequence:** recurring fleet and facility expense exceeds the projected cost of a specialized system.

**Architectural response:** narrow the execution and memory contracts around the stable workload while investing in compiler and operations.

**New tradeoff:** workload drift can strand silicon; internal software becomes a long-term dependency; manufacturing and supply risk replace some vendor dependence.

### Scenario: enterprise private AI

**Real-world scenario:** an enterprise keeps models and data within a private domain for governance, confidentiality, latency, or predictable cost.

**Workload behavior:** architecture resembles a smaller datacenter, but demand is lower and more variable; the platform may serve retrieval, inference, adaptation, and conventional applications.

**Software mitigation:** consolidate services, use shared accelerators, schedule batch work around interactive demand, and select portable frameworks.

**Residual architectural limit:** insufficient statistical multiplexing leaves large specialized devices idle; external service may be unacceptable; staffing and support constrain complexity.

**Direct consequence:** cost per useful request can be dominated by idle capital, integration, and lifecycle rather than energy or peak throughput.

**Architectural response:** right-sized modular systems, broader programmable accelerators, efficient low-load states, manageable memory capacity, and simple operations.

**New tradeoff:** broader hardware sacrifices some efficiency; smaller systems lose hyperscale purchasing and utilization advantages; private ownership assumes upgrade and recovery responsibility.

### Scenario: mobile and embedded specialization

**Real-world scenario:** a high-volume client device or constrained embedded product repeats a stable function within battery, thermal, or physical limits.

**Workload behavior:** one inference may be small, but it occurs often or across many shipped devices; wake and memory energy matter.

**Software mitigation:** optimize CPU and GPU code, quantize, compress, and use existing DSP or media engines.

**Residual architectural limit:** the function still wakes large domains, moves too much data, misses a deadline, or consumes unacceptable battery or mission energy.

**Direct consequence:** product capability, battery life, enclosure, or component count cannot meet the objective.

**Architectural response:** integrate a right-sized NPU, sensor engine, fixed pipeline, or local memory path.

**New tradeoff:** silicon area is paid on every unit; unsupported future models cause fallback; long product lifecycles require stable software and validation.

### Flexibility has option value

General hardware can be economically rational even when it uses more joules per operation. It can absorb model change, serve diverse tenants, reuse mature software, reduce time to deployment, and avoid custom-design risk. Specialization becomes justified when recurring savings and product-enabling constraints outweigh that option value.

The appropriate comparison is therefore not ASIC efficiency versus GPU efficiency in isolation. It is lifecycle-adjusted useful work under the required quality, latency, energy, reliability, and deployment constraints.

## 4.10 Tradeoff Synthesis Across the Compute Continuum

The same stressor produces different architectural priorities across deployment classes. Table 4.2 is the survey’s canonical deployment-class comparison at the design level; Chapters 3 and 5 reference it rather than repeating it.

### Table 4.2 — Stressor priorities across deployment classes

| Stressor | Hyperscale/datacenter | Enterprise/private infrastructure | Client/mobile | Embedded/automotive/robotics |
|---|---|---|---|---|
| Data movement | HBM, scale-up traffic, model/KV residency, rack energy | Right-sized capacity, local data, tiering, manageable cost | Shared LPDDR, copies, wake scope, battery | Sensor movement, bounded DMA, local SRAM, mission energy |
| Utilization | Fleet goodput under SLOs and failure headroom | Consolidation under smaller and variable demand | Batch-one efficiency and foreground responsiveness | Deadline capacity, not maximum occupancy |
| Communication | Collectives, topology, bisection, network power | Smaller fabrics and operational simplicity | On-chip arbitration and inter-engine synchronization | Time-aware sensor/control links and isolation |
| Determinism | Tail latency and predictable sharing | Stable service and manageable capacity planning | Consistent responsiveness under thermal policy | Worst-case timing, jitter, safety fallback |
| Programmability | Large compiler investment across a changing portfolio | Portability, broad coverage, long support | Operator coverage and app-compatible updates | Certified updates, fixed interfaces, controlled flexibility |
| Energy/thermal | Rack and facility limits; joules per useful result | Power/cooling availability and idle efficiency | Battery, skin temperature, sustained passive cooling | SWaP-C, mission duration, enclosure and actuator competition |
| Reliability | Goodput, fault containment, automatic recovery | Serviceability with smaller support teams | Graceful fallback and device stability | Safety, disconnected operation, deterministic recovery |
| Economics | TCO at volume, facility and fleet utilization | Idle capital, staffing, lifecycle, data-domain value | Per-unit area, product volume, battery and feature value | Component count, qualification, mission capability, longevity |

### Table 4.3 — Architectural response and the cost it introduces

| Architectural response | Stress relieved | New cost or risk |
|---|---|---|
| Larger local memory | Capacity, locality, bandwidth, energy | Area, leakage, yield, allocation complexity |
| Wider or stacked memory | Sustained bandwidth and capacity | Package cost, power, thermal density, supply |
| Scratchpad and explicit DMA | Predictability and useful data movement | Compiler/runtime burden, synchronization, poor oversubscription |
| Hardware-managed cache and coherence | Dynamic reuse and sharing | Tags, probes, replacement, variability, verification |
| Wider execution array | Dense throughput | Underutilization on narrow/irregular work, supply pressure |
| Fine-grained queues and scheduling | Irregularity, load balance, latency | Control area, metadata, nondeterminism |
| Specialized dataflow | Movement and control energy | Shape sensitivity, mapping and portability |
| Lower-precision arithmetic | Compute density, capacity, bandwidth, energy | Numerical validation, conversions, quality risk |
| Scale-up fabric and collective engines | Distributed communication | Power, package pins, topology lock-in, larger failure domain |
| Reconfigurable or programmable units | Model evolution and exceptions | Area and energy overhead, tool complexity |
| Power domains and gating | Idle and sustained energy | Wake latency, state retention, scheduling complexity |
| Redundancy and fault containment | Reliability, availability, safety | Area, power, capacity reserve, validation |

[**Figure 4.8 placeholder — Multi-objective design envelope.** Show flexibility, useful performance, energy, predictability, reliability, and lifecycle cost as competing objectives around a central workload signature. Add four deployment envelopes to show different feasible regions. Avoid a radar-chart score or a claim that one architecture dominates.]

## 4.11 Design Questions That Lead to Architecture Families

By this point, the need for multiple hardware organizations follows from the workload and tradeoff analysis:

- If irregular control and changing software dominate, how much dynamic scheduling and coherent memory should be retained?
- If dense tensor reuse dominates, how should operations and operands be mapped spatially?
- If data movement dominates, should the design add local memory, change dataflow, increase memory bandwidth, or move computation toward state?
- If small-batch latency dominates, what execution width and launch model avoid stranded capacity?
- If communication dominates, which topology and collective mechanisms belong in hardware?
- If deterministic response dominates, which resources require reservation, partitioning, or static scheduling?
- If models change quickly, where should programmability reside: scalar/vector units, instruction extensions, reconfiguration, compiler-generated dataflow, or a companion processor?
- If energy dominates, which power domains and memory boundaries can remain inactive?
- If reliability dominates, what is the detection, containment, recovery, and fallback boundary?

Different answers produce different architecture families. A CPU retains dynamic machinery for irregular software. A GPU amortizes control across massive parallel work while preserving general kernels. A tensor or spatial accelerator invests more heavily in local reuse and regular dataflow. A reconfigurable device preserves structural flexibility at lower density. A memory-centric design changes where state and computation meet. A heterogeneous SoC combines several answers because no one contract fits the entire request.

This paragraph is a bridge, not the architecture survey. Chapter 5 will examine CPUs and GPUs as the broad platforms that established the first transition and expose the second. Chapter 6 will then compare domain-specific families across the compute continuum using the contracts and stressors defined here. Their commercial implementations should be evaluated only after their execution, memory, scheduling, compiler, communication, energy, reliability, and economic choices are explicit.

## 4.12 Engineering Takeaways

- Stressors interact, and relieving one usually consumes another—batching buys utilization with queueing and state; sharding buys capacity with communication; quantization buys bandwidth with quality risk—so architecture must be evaluated at the system boundary across several objectives, never by one peak metric.
- Data movement dominates the energy budget by two to three orders of magnitude over arithmetic at every process node measured, so locality, transaction granularity, and reuse determine how much nominal bandwidth and compute become useful.
- Scaling introduces communication, synchronization, imbalance, power, and failure cost; device count adds value only while marginal useful work exceeds those costs, and the ceiling being approached (algorithmic, topology, power, reliability, economic) should be identified before adding devices.
- Dynamic mechanisms adapt to irregularity while static mechanisms buy predictability; the correct boundary follows workload uncertainty and the tail or worst-case behavior the deployment actually requires.
- Energy, reliability, and failure handling are performance properties: energy comparisons need a complete useful-result boundary including idle, wake, cooling, and failed work, and goodput after recovery—not nominal throughput—is what scale delivers.
- Flexibility has option value that specialization must repay; because no single response maximizes flexibility, locality, utilization, determinism, energy efficiency, reliability, and cost simultaneously, the offload landscape necessarily contains several architecture families rather than one successor to the GPU.
