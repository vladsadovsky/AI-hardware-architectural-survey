# Chapter 1. Historical Context and Architectural Transitions

## 1.1 Why the History Matters

The history relevant to AI acceleration is not primarily a chronology of processors or products. It is a history of changing constraints. For several decades, software could expect a newer general-purpose processor to execute an existing workload faster with limited architectural intervention. Higher clock rates, wider issue, deeper pipelines, branch prediction, speculative and out-of-order execution, larger caches, SIMD extensions, and eventually multiple cores all increased the amount of useful work available from a CPU. Compilers, operating systems, libraries, and applications learned to exploit each layer.

That model did not end abruptly, and CPUs did not become unimportant. The CPU remains the control and integration center of most AI systems. It owns processes and address spaces, manages protection and I/O, prepares and schedules work, handles storage and networking, and executes code whose control flow or working set does not map efficiently to an accelerator. What changed was the assumption that one increasingly capable general-purpose execution architecture could economically provide every kind of required throughput, latency, and energy efficiency.

The resulting transitions did not occur identically across the compute continuum. In datacenters, the pressure came from throughput, fleet utilization, power delivery, cooling, and the cost of operating large systems under service-level objectives. In mobile devices, it came from battery capacity, passive cooling, shared memory bandwidth, idle power, and the need to keep selected functions active without waking the whole SoC. In embedded, automotive, and robotic systems, it came from bounded response time, sensor data rates, energy and size limits, safety, and operation without dependable cloud connectivity.

These pressures produced two broad architectural transitions:

1. **From CPU-centered execution to heterogeneous acceleration.** Datacenter and technical-computing workloads moved highly parallel kernels toward GPUs; mobile and embedded systems increasingly routed signal, media, vision, and control workloads toward DSPs, ISPs, FPGAs, and fixed-function engines.
2. **From a small set of broad accelerator types to domain-specific AI acceleration.** GPUs incorporated tensor operations, datacenters deployed matrix and tensor processors, mobile SoCs evolved DSP and media-engine experience into NPUs, and embedded platforms adopted microNPUs and near-sensor processing.

Neither transition is a replacement hierarchy. Each adds execution domains and moves responsibility among hardware, compiler, runtime, operating system, and application.

[**Figure 1.1 placeholder — Two transitions across the compute continuum.** Three horizontal lanes—hyperscale/datacenter, client/mobile, and embedded/automotive/robotics—show the path from CPU-centered optimization through heterogeneous acceleration to AI-specific specialization. Each lane identifies the software optimizations that delayed offload, the limiting constraints, and the resulting hardware responses.]

## 1.2 Common Limits of General-Purpose Scaling

Modern CPUs achieve high performance by extracting instruction-level parallelism while preserving a familiar sequential programming model. Out-of-order execution overlaps independent instructions; speculation attempts to keep pipelines full; caches reduce average access latency; prefetchers anticipate future data; simultaneous multithreading fills otherwise unused execution slots; and SIMD units apply one instruction to multiple data elements. At the software level, compilers schedule and vectorize code, libraries provide tuned kernels, applications improve locality through blocking and layout changes, and operating systems distribute runnable work across cores and NUMA nodes.

This combination remains highly effective for complex control flow, moderate parallelism, frequent system interaction, heterogeneous data structures, and rapidly changing execution behavior. It also preserves a mature software contract: virtual memory, coherent shared memory, precise exceptions, preemption, protection, debugging, and decades of language and tool support.

The cost of that generality is machinery devoted to finding parallel work dynamically and hiding latency at run time. Caches, reorder structures, predictors, translation structures, coherence, and control logic consume area and energy that cannot simultaneously be devoted to dense arithmetic or application-specific data movement. The CPU is optimized for low-latency progress across diverse code, not for maximizing one class of operation per unit area or per joule.

Software pushed this architecture far. Before offloading work, engineers commonly improve algorithms, remove unnecessary computation, change data layout, use tuned libraries, vectorize inner loops, add thread-level parallelism, place memory and threads with NUMA awareness, and overlap computation with memory, storage, or network activity. This remains the correct starting point. Acceleration does not rescue a poor algorithm or remove the need to understand locality. Tiling, batching, fusion, prefetching, quantization, and minimizing intermediate materialization often become more important after offload.

### The memory wall

Processor execution capability and main-memory latency did not improve at the same rate. Wulf and McKee described this divergence as the “memory wall” in 1995: faster processors could spend an increasing fraction of time waiting for data unless locality and memory-system behavior improved. Cache hierarchies, prefetching, wider interfaces, NUMA organizations, and sophisticated memory controllers mitigated the problem but did not abolish it. They transformed the question from raw DRAM latency into a hierarchy problem: which data is resident at which level, how often it is reused, and how much movement is required per unit of useful work.

“Memory-bound” is consequently not one diagnosis. A workload may be limited by DRAM bandwidth, cache capacity, cache-line overfetch, address translation, coherence traffic, NUMA placement, irregular access that defeats prefetching, or insufficient memory-level parallelism. The dominant level can also change with tensor shape, batch size, or request concurrency. The Roofline model later provided a useful high-level formulation: attainable arithmetic throughput is bounded by both peak compute and memory bandwidth multiplied by operational intensity. This survey uses that intuition without treating it as a complete model of AI execution.

### The power wall and multicore scaling

For a long period, transistor scaling supported higher frequency and greater integration without a proportional rise in power density. As voltage scaling slowed, frequency increases and increasingly aggressive single-core mechanisms became constrained by power and thermal limits. Multicore processors allowed more transistors to contribute useful throughput at lower per-core frequency, but only when software exposed sufficient parallelism. Serial regions, synchronization, shared-memory contention, NUMA effects, and coherence costs limited scaling.

Increasing transistor counts also stopped implying that every transistor could operate at maximum activity simultaneously within a fixed power envelope. Research on “dark silicon” formalized the concern that power constraints could prevent portions of a chip from being active at full performance at the same time. Specialization became attractive because simpler datapaths and memory systems designed for narrower operation classes can perform more useful work within a fixed area and energy budget than fully general-purpose cores.

### Data movement as an energy concern

The energy cost of computation is not only the arithmetic operation. Data must be fetched, decoded, routed, stored, and often moved through several levels of memory. Accelerator research such as Eyeriss treated dataflow and movement across the hierarchy as first-order energy concerns. The important general lesson is not that one stationary dataflow is universally best. It is that increasing arithmetic density without arranging locality and reuse can move the bottleneck into registers, SRAM, DRAM, interconnect, or network communication.

These limits are common across the continuum, but their operational consequences differ. A stalled datacenter accelerator wastes expensive provisioned capacity and rack power. A stalled mobile engine extends active time, consumes battery energy, and may trigger thermal throttling. A stalled robotic perception path can violate a deadline even if its average throughput appears adequate.

## 1.3 The Datacenter Path: Throughput, Useful Utilization, and Power Capacity

In hyperscale infrastructure, the relevant computer is not only a processor or server; it is frequently the rack, cluster, or warehouse-scale system. Capital is committed to servers, accelerators, networking, power delivery, cooling, and buildings. Operating cost includes energy, maintenance, and the opportunity cost of capacity that is installed but not performing useful work.

This makes utilization economically important, but utilization is not an isolated objective. A service fleet must retain headroom for bursts, failures, maintenance, and placement constraints. Pushing every resource toward nominal 100 percent occupancy can increase queueing and tail latency, reduce fairness, and weaken resilience. The useful goal is high productive utilization: completed work per dollar and joule while satisfying latency, availability, and reliability requirements.

Cluster scheduling history illustrates this distinction. Google’s Borg system combined admission control, task packing, overcommitment, and machine sharing to raise utilization while preserving process-level performance isolation and supporting high-availability services. Later work on heterogeneous warehouse-scale computers emphasized matching diverse workloads to different hardware generations and accelerator types. Utilization is therefore partly a scheduling and placement problem, not merely a property of the processor.

Power introduces another capacity constraint. Research on warehouse-scale power provisioning showed that the cost of facilities capable of delivering a given electrical capacity can rival recurring energy cost. Operators have an incentive to use safely provisioned power capacity well, while avoiding correlated peaks that exceed facility limits. Energy-proportional computing addresses a related problem: systems that consume a large fraction of peak power while doing little work are inefficient at the low and moderate utilizations common in real fleets. Memory, storage, network, and accelerator subsystems all affect this curve.

### CPU optimization and the move to GPUs

Datacenter and technical workloads first exploited multicore CPUs, SIMD, optimized numerical libraries, NUMA placement, and distributed execution. For highly regular data-parallel kernels, GPUs offered a different allocation of silicon. Graphics workloads had already driven high arithmetic throughput, wide memory systems, and extensive hardware multithreading. As graphics stages became programmable, developers began mapping nongraphical algorithms onto shader hardware. Early general-purpose GPU programming demonstrated the opportunity but forced applications through graphics-oriented APIs and data representations.

The transition became practical when the hardware and programming interface changed. NVIDIA introduced CUDA in 2006, allowing developers to launch general-purpose kernels without expressing computation as a graphics pipeline. CUDA formalized a heterogeneous host/device model: the CPU begins and orchestrates execution, while GPU kernels execute many threads across streaming multiprocessors. This model exposed enough hierarchy and memory behavior for optimization while providing a scalable abstraction across GPU generations.

The GPU traded some single-thread latency and dynamic generality for throughput. Many lightweight threads could cover long-latency events by allowing other warps to run. High-bandwidth memory sustained large parallel kernels. Registers and programmer-managed shared memory enabled reuse when software tiled computation effectively. For dense numerical and later neural-network workloads, these properties allowed more useful work per unit time and often per joule than CPU-only execution.

The system did not become automatically efficient. Software had to identify parallel regions, prepare and batch work, manage data placement, choose launch geometry, reduce transfers and synchronization, and keep kernels large enough to occupy the device. At fleet scale, schedulers also had to place jobs, share devices, account for memory capacity, and coordinate multi-device communication. Idle gaps caused by data preparation, memory faults, network collectives, small kernels, or load imbalance represent underused capital and energy even when peak device throughput is high.

[**Figure 1.2 placeholder — Datacenter AI execution and resource-efficiency path.** CPU orchestration, storage and network ingestion, host memory, accelerator memory, accelerator execution, scale-up links, and scale-out networking are shown as one service path. Mark batching, queueing, memory stalls, synchronization, collective communication, useful utilization, rack power, cooling, cost per token or workload unit, and tail-latency constraints.]

### AI made the GPU central—and exposed system-level limits

Neural-network training contained work that GPUs handled well: large collections of multiply-accumulate operations over dense tensors, substantial parallelism across examples and features, and repeated operations that could amortize launch and transfer costs. The 2012 AlexNet work is a visible milestone because its convolutional network was trained using two GPUs, demonstrating the practical role of GPU computation in a major image-recognition result. It was not the beginning of neural networks or GPU computing, but it helped establish the GPU as a central platform for deep learning.

As models grew, the metric expanded beyond kernel speed. Training throughput depends on keeping expensive devices supplied with work and coordinating them across nodes. Inference economics depend on request mix, batch formation, model residency, memory capacity, tail latency, and energy. Cost per token is useful for language-model services only when its boundary is explicit: model, precision, batch and sequence distributions, utilization, latency target, hardware level, energy accounting, and amortization all matter.

GPU software responded with operation batching, layout selection, fusion, register and shared-memory tiling, mixed precision, quantization, asynchronous copies, graph capture, memory pooling, optimized collectives, and compiler-generated kernels. GPUs themselves incorporated domain-specific matrix or tensor units and faster scale-up links. These improvements increased useful work but also exposed new bottlenecks in memory movement, small-batch execution, irregular routing, collective communication, and distributed failure handling.

The datacenter case for further specialization is therefore not simply “more operations per second.” It is the possibility of improving useful throughput, tail behavior, energy per completed unit of work, memory efficiency, and fleet economics for a stable and sufficiently important workload domain.

## 1.4 The Client and Mobile Path: Energy, Thermal Limits, and Always-On Operation

Mobile computing followed a parallel but distinct path. A battery-powered device cannot treat energy as an operating expense that can be offset by installing more cooling. Energy determines battery life; instantaneous power affects temperature and user comfort; sustained power is constrained by passive dissipation; and multiple engines compete for a shared SoC and memory system. Performance matters, but finishing quickly is useful only if the total energy and thermal cost are acceptable.

Mobile SoCs became heterogeneous before contemporary AI workloads dominated client computing. CPUs handled operating-system and control-intensive work. GPUs accelerated graphics and later compute. DSPs executed signal-processing workloads with lower control overhead and more predictable vector behavior. ISPs processed camera pipelines. Video and audio codecs implemented stable functions in dedicated hardware. Sensor hubs allowed selected functions to remain active while larger CPU clusters slept.

This organization established a principle that later shaped mobile AI: route each workload to the lowest-energy engine that can satisfy its functional and latency requirements. A general-purpose CPU may complete a signal-processing task, but keeping a high-performance core and its supporting memory hierarchy active for continuous audio or sensor processing can cost more energy than executing the same function on a smaller DSP or dedicated block. Qualcomm’s descriptions of Hexagon DSP use, for example, emphasize processing sensor or camera streams without waking other SoC elements and using low-power engines for always-on voice, touch, sensors, and vision. These are vendor descriptions and require independent measurement for quantitative comparison, but the architectural pattern is well established.

The transition from DSP and media acceleration to NPU was therefore evolutionary rather than a sudden import from the datacenter. Vector and tensor arithmetic, local memories, DMA, fixed or limited precision, offline compilation, and explicit host control all had precedents in mobile signal processing. As neural networks became common in imaging, speech, language, and sensor interpretation, tensor-oriented datapaths were added to the heterogeneous SoC.

### Energy is a whole-system property

An efficient NPU does not guarantee an efficient application. The CPU may remain awake to prepare tensors, submit work, poll or synchronize, or execute unsupported operators. Model partitioning may force intermediate data through shared memory. CPU, GPU, NPU, ISP, display, modem, and media engines contend for bandwidth and thermal headroom. Waking a larger power domain for a small task can dominate the arithmetic energy. Conversely, offloading a short operation can cost more than executing it locally if setup, migration, and synchronization are not amortized.

The relevant software decisions include:

- keeping data close to its producer or next consumer;
- avoiding unnecessary format conversion and copies;
- selecting an engine based on energy and latency, not peak TOPS;
- batching only when the latency budget permits;
- minimizing CPU wakeups and active residency;
- compiling enough of the graph for the target engine to avoid costly fallback;
- coordinating DVFS and power domains with real workload phases;
- accounting for shared-memory and thermal contention from concurrent applications.

Arm’s Ethos-U55 documentation provides a concrete embedded/mobile-style software path: offline tools quantize and compile a model into an optimized command stream, while the host application processor and driver manage run-time control and data flow. Its interfaces include DMA, interrupt signaling, and clock- and power-control coordination. The example illustrates that the NPU’s compiler and host integration are part of the architecture, not external conveniences.

On-device execution also has objectives beyond energy. It can reduce dependence on network availability, improve response latency, keep private data local, and enable experiences that would be impractical with repeated cloud round trips. These benefits must still be balanced against model capacity, updateability, local memory pressure, and the energy cost of sustained use.

[**Figure 1.3 placeholder — Mobile heterogeneous SoC execution path.** Show CPU clusters, GPU, NPU, DSP or sensor hub, ISP, media engines, shared memory, sensors, and power domains. Contrast an always-on path that keeps large domains asleep with a burst path that wakes CPU/GPU/NPU resources. Mark wake-up cost, memory contention, battery energy, thermal limits, privacy, and response latency.]

## 1.5 The Embedded, Automotive, and Robotics Path: Deadlines, Determinism, and SWaP-C

Embedded and robotic systems share some mobile constraints but add a crucial difference: computation participates in a physical control loop. Sensor data must be captured, interpreted, and converted into an action before the environment changes enough to invalidate the result. Average throughput is insufficient when missed or highly variable deadlines affect control quality or safety.

Historically, these systems combined microcontrollers for control, DSPs for signal processing, FPGAs for deterministic pipelines and custom interfaces, and ASICs for stable high-volume functions. Automotive systems added networks, safety islands, redundant paths, and qualified components. Robotics combined perception accelerators with CPUs or real-time processors responsible for planning, control, and actuator coordination.

AI expands perception and decision capabilities but does not remove the real-time contract. A perception model may have high average frame rate yet be unsuitable if its worst-case latency, jitter, memory contention, or thermal throttling violates the control deadline. Dynamic models, variable sensor loads, and fallback paths complicate timing further. The system must also decide what happens when inference misses a deadline, produces low confidence, encounters corrupted input, or loses connectivity.

Energy remains central because many embedded platforms operate within fixed power, size, weight, cooling, and cost envelopes—often summarized as SWaP-C. Unlike a phone, a robot may allocate energy among sensing, computation, communication, and motion. Saving compute energy can extend mission time, but additional local processing may reduce radio use or enable faster control. The correct boundary is therefore the whole platform and mission, not the accelerator alone.

Moving computation closer to sensors can reduce data movement and response latency. The ShiDianNao research, for example, placed convolutional processing near an image sensor and kept weights in local SRAM to reduce off-chip traffic. The specific implementation is not a universal blueprint, but it demonstrates why near-sensor architecture is attractive when raw sensor streams are expensive to move and only derived information is needed downstream.

Embedded AI also makes determinism a cross-layer property. Hardware execution time, DMA behavior, memory arbitration, interrupt delivery, driver queues, runtime scheduling, and operating-system policy all contribute to the deadline. An accelerator with predictable internal execution may still be part of an unpredictable system if shared memory, host submission, or fallback execution is uncontrolled.

[**Figure 1.4 placeholder — Embedded and robotic closed-loop execution.** Show sensors, timestamping and synchronization, preprocessing, inference, fusion or planning, real-time control, and actuators. Overlay memory and communication paths. Mark bounded latency, jitter, deadline handling, energy, SWaP-C, safety fallback, and intermittent or unavailable cloud connectivity.]

Table 1.1 summarizes why similar offload ideas arose under different deployment pressures.

### Table 1.1 — Transition drivers by deployment class

| Deployment class | Primary objective | Software optimization before offload | Residual constraint | Typical hardware response | New system cost introduced |
|---|---|---|---|---|---|
| Hyperscale and datacenter | Useful work per dollar and joule while meeting service objectives | SIMD, threading, NUMA placement, batching, optimized libraries, distributed execution, task packing | Memory and network stalls, underfilled accelerators, rack power, cooling, tail latency, fleet fragmentation | GPU, tensor or matrix processor, high-bandwidth memory, scale-up links, workload-specific ASIC | Placement, queueing, device memory, collectives, isolation, failure recovery, software-stack coupling |
| Enterprise and edge infrastructure | Consolidated service throughput under smaller power, cooling, management, and capital budgets | Virtualization, CPU/GPU sharing, batching, data locality, local caching | Limited scale, acquisition cost, power availability, data governance, service latency | GPU or accelerator cards, integrated accelerators, edge inference appliances | Capacity planning, heterogeneous management, model placement, lifecycle and support burden |
| Client and mobile | Functionality and responsiveness within battery and thermal limits | SIMD, GPU compute, quantization, pruning, model compression, heterogeneous framework dispatch | Wake-up and idle cost, shared-memory bandwidth, sustained thermals, unsupported operators | DSP, ISP, sensor hub, mobile GPU, NPU, fixed-function media and vision engines | Graph partitioning, engine selection, power-domain control, fallback, memory contention |
| Embedded, automotive, and robotics | Bounded response, safety, mission energy, and SWaP-C | Fixed-point optimization, DSP kernels, real-time scheduling, FPGA pipelines, model compression | Deadlines, jitter, sensor bandwidth, limited memory, connectivity, qualification | MicroNPU, near-sensor processor, FPGA, safety accelerator, heterogeneous real-time SoC | Timing analysis, certification, deterministic integration, fallback behavior, update constraints |

## 1.6 Why GPUs Became the Broad AI Platform

The GPU’s importance comes from a combination of architecture and programmability. It provides high throughput for regular parallel work but remains broad enough to support changing algorithms. A general kernel programming model allows the same platform to run matrix multiplication, convolution, attention, reductions, transformations, simulation, and custom operators. Libraries, compilers, profilers, debuggers, and frameworks make optimization reusable across applications.

This balance distinguished GPUs from narrower fixed-function accelerators. A specialized engine can be more efficient for its target operation, but a GPU can absorb algorithm change through software and selective hardware evolution. Modern GPUs are not “classic SIMD machines” frozen in time. They combine SIMT execution, caches, large register files, software-managed storage, matrix units, sophisticated scheduling, and high-bandwidth interconnects.

The GPU also appears across the continuum, but for different reasons. In datacenters, it supports large-scale training and flexible inference. In workstations and PCs, it combines graphics, creative, simulation, and AI workloads. In mobile SoCs, integrated GPUs provide programmable parallel compute when a model or operator does not fit the NPU. In robotics, GPUs support perception and planning workloads whose algorithms change too quickly or whose operation set is too broad for a narrow accelerator.

The same flexibility creates costs. Instruction issue, general address generation, registers, caches, multithreading state, and support for diverse kernels consume area and energy. GPU efficiency also depends on sufficient parallelism, compatible control paths, suitable memory access, and enough work to amortize launch and scheduling overhead. Those conditions vary by workload phase and deployment.

## 1.7 The Second Transition: Specialization Across the Continuum

The second transition has no single destination because the residual constraints are not uniform.

In datacenters, specialization may improve the economics of a stable workload portfolio by increasing arithmetic density, making data movement more explicit, reducing control overhead, or improving predictable latency. Google’s first-generation TPU illustrates this path. It used a large matrix multiply unit and software-managed on-chip memory for production neural-network inference. Its published evaluation emphasized not only throughput and energy efficiency but also 99th-percentile response-time requirements. The design traded some generality for behavior suited to a defined service workload.

In mobile systems, specialization aims to execute supported models at low energy while fitting within shared-memory and thermal constraints. The NPU complements rather than replaces the CPU and GPU. It is most useful when the compiler can map a substantial graph onto supported operators and data types, residency can be maintained efficiently, and host intervention is minimized.

In embedded and robotic systems, specialization may prioritize predictable pipelines, local sensor interfaces, and bounded response. FPGAs and spatial accelerators can express custom data paths; microNPUs can accelerate common neural operators near a microcontroller; near-sensor processing can reduce raw-data movement. Flexibility, qualification, updateability, and worst-case timing remain as important as nominal efficiency.

These categories overlap. A commercial device may combine programmable vector cores, matrix arrays, dataflow scheduling, caches, scratchpads, packet networks, and fixed-function engines. Vendor labels such as “NPU,” “tensor processor,” or “AI engine” do not by themselves identify the execution model, memory hierarchy, scheduling mechanism, or deployment behavior.

Architectural ideas also migrate across deployment classes rather than following a one-way path from datacenter to device. Local scratchpads, quantization, explicit data movement, spatial arrays, compressed execution, power gating, and heterogeneous scheduling recur throughout the continuum, but are resized and integrated for different economic and physical envelopes. Mobile techniques for idle power and low-energy memory can inform datacenter energy proportionality; datacenter compiler, scheduling, and observability techniques can inform enterprise and edge consolidation. Enterprise private AI infrastructure may increasingly resemble a small datacenter when data-domain protection, governance, or predictable local service justifies it, while non-mobile edge remains an intermediate design point. Reuse is therefore strongest at the level of architectural principles, parameterized IP, and software abstractions—not necessarily as an unchanged physical implementation.

Specialization shifts responsibility rather than removing it. Replacing dynamic hardware scheduling with static scheduling increases compiler responsibility. Replacing caches with scratchpads requires explicit placement and transfer. Restricting supported operations improves efficiency only if real models can be lowered without expensive fallback. Predictable internal execution does not guarantee predictable end-to-end latency. An accelerator is therefore inseparable from its compiler, runtime, graph partitioner, driver, operating-system integration, and deployment tools.

[**Figure 1.5 placeholder — Specialization tradeoff space.** A conceptual map compares CPU, GPU, programmable NPU, FPGA or reconfigurable fabric, and narrow fixed-function engines across flexibility, efficiency, predictability, and compiler or integration burden. Use overlapping regions, not precise points, and annotate how workload stability and deployment class change the preferred tradeoff.]

### Table 1.2 — Software optimization and the next bottleneck

| Deployment | Optimization | Immediate benefit | Assumption required | Resource stressed next or common failure mode |
|---|---|---|---|---|
| Datacenter | Batching and request aggregation | Higher accelerator occupancy and arithmetic efficiency | Requests can wait and shapes can be grouped | Queueing and tail latency; memory-capacity pressure |
| Datacenter | Kernel fusion and tiling | Less intermediate traffic; greater on-chip reuse | Operations can be legally combined and working sets fit local storage | Register or SRAM pressure; reduced occupancy; compiler complexity |
| Datacenter | Mixed precision and quantization | More arithmetic throughput and lower storage traffic | Accuracy and numerical stability remain acceptable | Conversion overhead, unsupported operations, bandwidth at another hierarchy level |
| Datacenter | Communication overlap | Hides a portion of collective or transfer latency | Independent computation is available and scheduling is balanced | Network congestion, synchronization tails, reduced overlap in later phases |
| Datacenter | Tensor, pipeline, or expert parallelism | Allows models to exceed one device and increases aggregate compute | Partitioning overhead remains smaller than useful work | Collectives, all-to-all traffic, bubbles, load imbalance, failure domains |
| Mobile | Quantization and model compression | Lower memory footprint, bandwidth, and arithmetic energy | Model quality and operator coverage remain acceptable | Reformatting, fallback, shared-memory contention, accuracy loss |
| Mobile | Heterogeneous graph partitioning | Routes operations to a lower-energy engine | Transfer and synchronization cost is amortized | CPU wakeups, copies, unsupported subgraphs, fragmented execution |
| Mobile | Always-on offload | Keeps large CPU/GPU domains asleep | Small engine can process the continuous stream independently | Wake-up transitions, false triggers, sensor and memory energy |
| Mobile | DVFS and race-to-idle policies | Balances active energy, leakage, thermals, and latency | Workload phase and deadline are predictable enough | Thermal oscillation, missed latency, energy lost in transitions |
| Embedded/robotics | Static scheduling and fixed pipelines | Predictable execution and low control overhead | Workload and timing model are stable | Poor adaptability, difficult updates, worst-case shared-resource interference |
| Embedded/robotics | Near-sensor preprocessing | Reduces raw-data movement and response time | Useful reduction can occur before full-system processing | Sensor thermal limits, local memory, accuracy and observability constraints |
| Embedded/robotics | Model pruning or compact models | Fits memory and energy envelope | Quality remains adequate for operating conditions | Distribution shift, safety margin, unsupported sparse execution |

## 1.8 System Architecture Consequences

Across all three deployment paths, an accelerator changes more than instruction execution.

### Memory becomes a contract

“Unified memory” may mean a shared address space, shared physical memory, automatic migration, or some combination. It does not guarantee uniform latency, bandwidth, coherence, or concurrent access. Architects must identify ownership, residency, consistency, translation, page-fault behavior, copy paths, and contention for every engine. A discrete datacenter GPU, a mobile NPU sharing LPDDR, and a near-sensor accelerator have different memory contracts even if all are presented through a high-level framework.

### Scheduling crosses layers

The OS schedules CPU threads, but device runtimes, firmware, accelerator queues, collective libraries, and cluster orchestrators schedule other portions of the same request. Priority and isolation must propagate across those boundaries if a latency objective or tenant policy is to have meaning. Backpressure must also propagate; otherwise, faster submission simply moves queueing into a less observable layer.

In a datacenter, scheduling determines packing, device sharing, service latency, and fleet utilization. In mobile, it determines which engine runs a graph, which power domains wake, and how applications share memory bandwidth and thermals. In robotics, scheduling participates in the timing proof for a physical control loop.

### Portability has degrees

A framework may make a model functionally portable while leaving performance dependent on device-specific operators, layouts, precision formats, compilation, and memory policy. The relevant question is not only whether a model runs, but what fraction runs on the intended engine, where fallback occurs, which copies are inserted, and how much tuning survives a hardware generation change.

### Specialization creates lifecycle dependencies

Hardware usefulness depends on compiler and framework coverage, driver stability, debugging and profiling, security maintenance, model support, deployment tooling, and a viable update path. A theoretically efficient architecture with an immature software path can impose more integration and operational cost than its silicon advantage justifies.

### Table 1.3 — Success metrics across the compute continuum

| Concern | Hyperscale/datacenter | Client/mobile | Embedded/automotive/robotics |
|---|---|---|---|
| Useful performance | Training or service throughput under SLOs; completed requests or tokens | Response time and sustained user-visible performance | Deadline completion, worst-case latency, and jitter |
| Utilization | Productive device, memory, network, rack, and fleet use with required headroom | Appropriate engine occupancy without unnecessary wake time | Adequate resource use within deterministic schedules; not maximum occupancy |
| Energy | Joules per completed workload unit; rack and fleet energy | Energy per inference or token; battery impact | Mission energy, energy per control or perception cycle |
| Power and thermal | Rack power, facility capacity, cooling, peak management | Skin temperature, passive cooling, power-domain residency | SWaP-C, enclosure cooling, sensor and actuator power competition |
| Economics | Cost per token/request, amortized accelerator cost, TCO | Device cost, memory cost, battery and thermal design cost | Component and qualification cost, mission duration, maintenance |
| Latency | Mean and tail latency, queueing, collective tails | Interactive responsiveness and wake-up delay | Bounded response, deadline miss behavior, control-loop stability |
| Memory | Model residency, HBM capacity, host/device movement, distributed state | Shared LPDDR bandwidth, copies, contention, footprint | Limited SRAM/DRAM, deterministic access, sensor-stream movement |
| Reliability and safety | Availability, fault containment, checkpointing, degraded capacity | Application isolation, graceful fallback, thermal management | Fail-safe behavior, redundancy, certification, disconnected operation |
| Software maturity | Scheduler, compiler, framework, collectives, observability, fleet management | OS dispatch, graph partitioning, driver/runtime, app lifecycle | Real-time integration, tooling, timing analysis, long-term update support |
| Privacy and connectivity | Data governance and locality policies | Local processing and reduced cloud dependence | Local autonomy, limited or intermittent connectivity, safety boundaries |

## Engineering Takeaways

- AI acceleration is best understood through related but distinct transitions across datacenter, mobile, and embedded systems.
- Software optimization did not fail. It exposed limits in parallelism, locality, bandwidth, utilization, power, energy, latency, communication, and predictability.
- Hyperscalers seek useful work per dollar and joule under service and reliability constraints. Utilization is a means to that end, not an isolated target.
- Mobile acceleration evolved from heterogeneous SoCs, DSPs, ISPs, and always-on engines; its primary constraints are energy, battery, thermals, shared memory, and wake-up behavior.
- Embedded and robotic acceleration must be evaluated through bounded latency, jitter, safety, mission energy, sensor movement, and SWaP-C—not average throughput alone.
- CPUs and GPUs remain foundational. Specialized accelerators add execution domains rather than forming a universal replacement hierarchy.
- Data movement and whole-system integration frequently determine useful performance and energy more than peak operation rates.
- Every accelerator changes memory, scheduling, synchronization, observability, failure handling, and deployment responsibilities.
- Hardware selection is workload and deployment selection. There is no context-free “best accelerator.”
