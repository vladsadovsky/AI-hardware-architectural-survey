# Chapter 5. CPUs and GPUs

Chapters 2 through 4 moved from workload signatures to architectural contracts and then to the stressors that force tradeoffs among flexibility, locality, utilization, latency, energy, reliability, and cost. This chapter applies that vocabulary to the two broad programmable processor classes that define the baseline for modern AI systems: CPUs and GPUs.

The comparison is not a replacement contest. A GPU normally enters a system through a CPU-managed process, address space, I/O path, and software stack. Even highly accelerated applications retain work that is sequential, irregular, privileged, latency-sensitive, or deeply integrated with storage and networking. Conversely, moving every parallel operation to a GPU is not automatically efficient. The transfer, launch, residency, synchronization, and power-domain costs must be smaller than the benefit of wider execution.

The architectural distinction is one of allocation and assumption:

- A **CPU** spends substantial silicon and energy making diverse instruction streams progress with low latency under uncertain control and memory behavior.
- A **GPU** spends a larger fraction of its resources on throughput, using many threads and grouped execution to tolerate latency and amortize control.

Both have evolved toward each other in selected respects. CPUs added wider vectors, matrix operations, more cores, and higher memory bandwidth. GPUs added caches, virtual memory, independent thread state, richer control, matrix units, stronger system integration, and sophisticated scheduling. They nevertheless retain different centers of gravity. Understanding those centers explains both the durability of the CPU–GPU pair and the economic opportunity for the domain-specific designs introduced in Chapter 6.

## 5.1 Two General Platforms, Different Optimization Targets

“General purpose” is not a binary property. It describes how much workload diversity a design can execute efficiently, how much behavior is discovered dynamically, and how much responsibility is assigned to software.

A modern CPU attempts to preserve rapid progress for ordinary programs without requiring the programmer to expose every dependency or memory transfer. Out-of-order scheduling searches for ready instructions. Branch prediction and speculation continue execution before control is resolved. Caches discover reuse. Coherence permits shared-memory communication. Virtual memory, protection, interrupts, privilege levels, and precise exceptions connect execution to the operating system. These mechanisms make the CPU an effective machine for changing control flow, pointer-rich structures, operating-system services, and mixed workloads.

A GPU starts from a different premise: the application can identify a large collection of related work. Hardware groups logical threads, shares instruction-delivery resources, and switches among ready groups to hide latency. The design can devote more area and bandwidth to arithmetic because it does not provide every thread with the same low-latency machinery as a CPU core. This trade is favorable when work is abundant, lane behavior is compatible, memory requests combine efficiently, and per-kernel overhead is amortized.

Neither platform is defined by one implementation feature. A CPU may contain efficient vector and matrix units. A GPU may contain scalar units, caches, and substantial control capability. The architectural question is not whether a feature exists, but how much of the machine and software contract is organized around it.

### Table 5.1 — CPU and GPU architectural centers of gravity

| Dimension | CPU center of gravity | GPU center of gravity | System implication |
|---|---|---|---|
| Primary objective | Low-latency progress across diverse code | High throughput across abundant parallel work | End-to-end AI paths usually need both |
| Control | Independent instruction streams, prediction, speculation, dynamic scheduling | Many logical threads grouped for issue; divergence is legal but can reduce active lanes | Irregular orchestration tends to remain on CPU; regular kernels migrate |
| Latency tolerance | Reduce and hide latency within a few powerful cores | Cover latency by switching among many resident thread groups | GPU needs enough ready work and state capacity |
| Memory | Large coherent caches, virtual memory, sophisticated prefetch | High bandwidth, many outstanding requests, caches plus programmer/compiler-managed local storage | Placement, transfer, and residency determine offload value |
| Parallelism | Instruction, vector, thread, task, socket | Thread, data, tensor, pipeline, device | Parallel width must match the workload phase |
| Scheduling unit | Process, thread, instruction, vector operation, task | Grid, kernel, block or workgroup, warp or wave, instruction | Priority and backpressure must cross host and device layers |
| Software compatibility | Broad operating-system and application ecosystem | Accelerator runtime, libraries, compiler, driver, and device binaries | GPU portability includes the whole stack, not kernel syntax alone |
| Common AI role | Control, input, preprocessing, retrieval, fallback, small or irregular inference | Training, dense inference, simulation, parallel preprocessing and postprocessing | Partitioning creates boundaries that must be measured |

[**Figure 5.1 placeholder — CPU and GPU as different allocations of architectural machinery.** Use two equal-area conceptual dies, not literal floorplans. For the CPU, emphasize a small number of powerful cores, dynamic scheduling, prediction, coherent cache, vector or matrix units, and system interfaces. For the GPU, emphasize many throughput-oriented execution lanes, grouped thread scheduling, large register state, local memory, high-bandwidth memory paths, and matrix units. Connect both through host memory, interconnect, runtime queues, and I/O. Avoid equating visual area with a current commercial product.]

## 5.2 The Modern CPU Architectural Proposition

The CPU remains the reference execution environment because it implements the complete system contract. It starts the machine, runs the operating system, owns protection and resource accounting, responds to interrupts, manages storage and networking, and executes general application code. AI acceleration changes where selected computations run; it does not eliminate these obligations.

### Dynamic machinery buys latency and compatibility

Superscalar out-of-order cores decode an instruction stream, track dependencies, issue ready operations, speculate across branches, and retire results in program order. The exact structures differ, but the purpose is stable: discover parallel work without requiring the application to express a static schedule. Vendor optimization manuals expose the resulting performance sensitivities—dependency chains, front-end supply, cache and translation behavior, branch predictability, vectorization, and memory-level parallelism—because source-level correctness alone does not determine achieved performance [5.1].

This machinery is expensive in area and energy, but it provides option value. A CPU can run an updated tokenizer, a graph traversal with unexpected degrees, an operating-system fault handler, a database query, a network protocol, or a new model operator without requiring a new datapath. The same core can switch among them at fine granularity under mature protection and scheduling mechanisms.

For AI systems, that flexibility matters most at boundaries:

- parsing, tokenization, feature transformation, and control;
- storage, network, database, and retrieval interaction;
- dynamic allocation and memory management;
- model dispatch, batching, admission control, and error handling;
- operators unsupported or inefficient on another engine;
- small tasks whose offload cost exceeds their execution time;
- safety, policy, and application logic surrounding inference.

The CPU therefore often determines application latency even when it performs a minority of arithmetic. Optimizing only the accelerator portion is bounded by the remaining serial and system work. Amdahl’s original argument concerned the limits of parallel speedup under a fixed workload; in heterogeneous AI systems, transfers, queueing, synchronization, and newly exposed host work make the nonaccelerated fraction dynamic rather than fixed [5.2].

### Vector and matrix execution expand the CPU envelope

CPUs do not rely only on scalar execution. SIMD and vector extensions apply one instruction to multiple elements. Predication handles tails and conditionally active lanes. Gather and scatter extend vector execution to noncontiguous addresses, though they cannot make scattered memory physically contiguous. Arm’s Scalable Vector Extension illustrates a vector-length-agnostic contract in which software can run across implementations with different vector widths while predication and gather/scatter widen the class of vectorizable loops [5.3].

Matrix or tile instructions move the CPU further toward AI computation. They can increase operations per instruction, reuse operands in architectural or microarchitectural tile state, and support narrow formats. Their benefit is strongest when libraries or compilers pack data, choose supported shapes, and amortize setup. They do not turn the entire CPU into a GPU or tensor accelerator: core count, memory bandwidth, tile capacity, instruction issue, and package power still bound sustained throughput.

The important architectural lesson is that specialization can occur inside a general processor. Adding a vector or matrix unit preserves the CPU’s system integration while improving recurring kernels. It is economically attractive when the extra area serves enough workloads and avoids the transfer and software cost of a separate engine. It becomes insufficient when the desired throughput or energy efficiency would require most of the CPU to be reorganized around the specialized path.

### Multicore and coherence create a shared-memory scale

Multiple cores increase task and thread parallelism. Coherent caches simplify communication and allow irregular shared structures to evolve dynamically. Nonuniform memory access extends capacity and bandwidth across sockets or chiplets. These properties suit inference services, retrieval, feature processing, and mixed enterprise workloads that cannot keep a wide accelerator continuously occupied.

The costs grow with scale. Coherence traffic, shared-cache contention, memory-controller imbalance, synchronization, and operating-system placement can reduce useful scaling. Large coherent domains also consume power even when AI arithmetic is concentrated elsewhere. Software responds with thread pools, affinity, NUMA placement, lock reduction, batching, vector libraries, and data partitioning. When these optimizations expose a stable, high-volume parallel phase, offload becomes an architectural option rather than a verdict on the CPU’s general capability.

### Heterogeneous CPU cores change scheduling, not the basic role

Client and mobile CPUs often combine cores with different performance and energy characteristics. Background work can run on smaller cores while latency-critical work activates larger cores. Embedded systems may pair application cores with real-time or safety processors. Datacenter CPUs may combine general cores with infrastructure engines or specialized instructions.

This heterogeneity makes placement an operating-system and runtime problem. The lowest-energy core is not always the lowest-energy system choice if slower execution keeps memory, display, radio, cooling, or other domains active. Similarly, moving work to a GPU may save CPU cycles while increasing shared-memory traffic and wake cost. The relevant metric is energy and latency for the complete useful result.

## 5.3 CPUs in the End-to-End AI Path

The CPU’s role becomes clearer when the unit of analysis is a request or control cycle rather than a tensor kernel.

### Scenario: online retrieval-augmented inference

**Workload behavior:** a request is authenticated, parsed, tokenized, converted into one or more retrieval queries, sent through network and storage services, filtered, assembled into context, and then passed through model prefill and decode. The dense model phases are highly parallel; the surrounding path includes branches, short data transformations, pointer-rich indexes, variable result counts, and I/O completion.

**Software mitigation:** cache popular data, batch queries, vectorize distance computation, overlap I/O with model execution, use asynchronous runtimes, pin memory, and offload large dense or vector-search kernels.

**Residual architectural limit:** the control path and external services do not become one regular kernel. Fine-grained dependencies and variable arrivals constrain batching, while moving every small operation through a device queue creates launch and synchronization overhead.

**Direct consequence:** accelerating the model alone leaves host latency, queueing, and data preparation visible; GPU idle periods may coexist with overloaded CPU cores or network threads.

**Architectural response:** retain CPU execution for control and I/O, provide fast host–device queues and memory paths, accelerate stable subgraphs, and make scheduling and telemetry span the whole request.

**New tradeoff:** tighter integration reduces transfer cost but can increase memory contention, shared failure domains, and coupling among the CPU, accelerator runtime, and operating system.

### Scenario: enterprise private inference

**Workload behavior:** several models, retrieval services, and ordinary applications share a small cluster. Demand is bursty, data must remain local, and there may be too little load to batch every model efficiently.

**Software mitigation:** consolidate services, quantize models, use optimized CPU libraries, reserve accelerator capacity for larger models, and route requests by current load.

**Residual architectural limit:** an accelerator sized for peak demand may be idle much of the time, while a CPU-only system may miss peak latency or energy objectives.

**Direct consequence:** acquisition cost and idle power compete with service latency and data-domain requirements.

**Architectural response:** use the CPU as the broadly utilized baseline and add acceleration only for stable, material phases; expose resource accounting and fallback so capacity can be managed with a small operations team.

**New tradeoff:** sharing improves utilization but adds interference, security, queueing, and software-support obligations.

### Scenario: embedded perception and control

**Workload behavior:** sensor processing and neural perception produce state for planning and control. The neural kernels may be regular, but state validation, exception handling, actuator commands, and safe fallback are branch-heavy and deadline constrained.

**Software mitigation:** isolate critical tasks, preallocate buffers, use real-time scheduling, vectorize signal processing, and offload qualified perception stages.

**Residual architectural limit:** average accelerator throughput cannot guarantee that host-side validation and control complete within the deadline, especially under contention or an accelerator fault.

**Direct consequence:** a fast inference result can still be unusable if the complete sensing-to-actuation path is late or cannot enter a safe state.

**Architectural response:** retain a bounded CPU or microcontroller path, partition resources, define timeout and reset behavior, and make accelerator output a checked input to the control system.

**New tradeoff:** isolation and redundant fallback consume area, energy, validation effort, and capacity that do not raise nominal AI throughput.

These scenarios show why “percent of operations offloaded” is an incomplete metric. The CPU may execute few operations but remain on the critical path, own failure recovery, or keep a large power domain active. CPU capacity, memory bandwidth, and scheduling must therefore be co-designed with accelerator capacity.

## 5.4 From Graphics Pipeline to Programmable GPU Computing

The GPU did not begin as a smaller CPU with more cores. Chapter 1 sketched this history in passing; this section is its canonical treatment. The architecture developed under graphics workloads containing abundant data parallelism, regular arithmetic, latency-tolerant pipelines, and high bandwidth demand. Fixed graphics stages gradually became programmable. Unified shader architectures then allowed a common pool of processors to execute several graphics stages, improving utilization and creating a more general parallel machine.

Early general-purpose GPU computing mapped nongraphical algorithms through graphics APIs and data abstractions. This demonstrated throughput potential but imposed an awkward software contract: computation had to resemble rendering, data had to fit graphics resources, and programming tools were not designed for ordinary parallel applications.

The unified graphics-and-computing architecture changed the boundary. NVIDIA’s Tesla architecture presented arrays of programmable processors, hardware thread management, shared memory, and a general load/store model intended for both graphics and nongraphics computation [5.4]. CUDA then exposed kernels, thread hierarchies, memory spaces, synchronization, and a host–device runtime in a C-like environment [5.5]. The essential shift was not only that shaders became programmable. A complete platform made GPU parallelism accessible without disguising the workload as graphics.

AI arrived after this foundation existed. Dense neural-network operations had properties that matched the GPU’s investment:

- large numbers of similar arithmetic operations;
- substantial parallelism across examples, channels, features, and outputs;
- repeated tensor operations amenable to tiling;
- enough work to amortize kernel launch and data preparation;
- training workloads that valued throughput and time to quality;
- rapidly changing algorithms that benefited from programmable kernels.

AlexNet’s use of two GPUs was an influential demonstration of this fit [1.9]. The broader transition, however, depended on more than one model or paper. GPU hardware, programming tools, optimized libraries, research frameworks, cloud access, and developer expertise matured together.

[**Figure 5.2 placeholder — Evolution of the GPU computing contract.** Show four stages: fixed graphics pipeline; programmable but graphics-mediated shaders; unified programmable GPU with general kernels; AI-era GPU with matrix units, expanded memory and interconnect, graph execution, and distributed libraries. Under each stage, show what software must express and which workload assumptions remain. End with arrows toward both continued GPU evolution and adjacent domain-specific offload; do not depict specialization as a simple replacement.]

## 5.5 The GPU Architectural Contract

Modern GPUs vary by vendor, market, and generation, but several principles define the broad throughput-oriented contract.

### Hierarchical parallel work

A kernel describes work that can be instantiated across many logical threads. Threads are grouped into blocks or workgroups that can cooperate through local memory and synchronization. Hardware schedules smaller groups—commonly called warps or waves—onto execution resources. Blocks are intended to be sufficiently independent that a larger or smaller GPU can schedule more or fewer of them.

This hierarchy gives software a scalable expression of parallelism. It also establishes performance conditions:

- the grid must contain enough work to occupy the machine;
- block resource use must permit enough concurrent residency;
- grouped threads should perform compatible work;
- synchronization should remain mostly local and infrequent;
- global dependencies usually require a new launch or special cooperative mechanism.

SIMT does not mean that every thread is logically identical. Threads retain their own state and may branch. The efficiency issue is physical grouping: when threads in one group follow different paths, the hardware may execute paths with only subsets of lanes active. CUDA’s programming guide therefore distinguishes functional independence from the performance benefit of minimizing divergence [1.8].

### Hardware multithreading tolerates latency

A GPU keeps state for many threads and selects ready work when another group waits. This is most effective when enough independent groups are resident. Occupancy—the amount of resident work relative to an architectural limit—is one contributor, not an objective by itself. Registers, local memory, block size, instruction mix, and scheduler limits determine residency. A kernel with lower occupancy may still perform well if it has instruction-level parallelism or high reuse; a nominally full machine may still be memory or synchronization bound.

The contract differs from a CPU’s latency strategy. A CPU invests heavily in reducing the delay of one or a few instruction streams. A GPU accepts longer individual-thread latency and attempts to keep shared execution resources productive with other threads. If the workload supplies no independent work, more thread slots cannot hide the wait.

### Memory bandwidth must become useful operand delivery

GPUs provide wide memory systems and support many outstanding requests. Threads also use registers, caches, read-only paths, and software- or compiler-managed shared memory or local data stores. High performance requires tiling and reuse so that scarce off-chip bandwidth feeds many operations.

Grouped memory requests are most efficient when addresses fall into a small number of memory transactions. Scattered accesses can require many transactions whose fetched bytes are mostly unused. Current CUDA documentation uses coalescing examples to show that the relevant quantity is the ratio of requested useful bytes to bytes transferred [1.8]. Caches may recover some locality, but they cannot guarantee reuse for working sets and access distributions that exceed their capacity or associativity.

Registers and local memory create a second tension. Larger tiles can improve reuse but consume more per-block state, reducing the number of resident blocks. Fusion removes intermediate traffic and launches but increases live values and may reduce occupancy. Chapter 4’s interacting stressors appear inside one GPU kernel.

### Matrix operations specialize the GPU internally

AI-era GPUs added matrix or tensor operations that perform many multiply-accumulate operations per instruction. NVIDIA’s Volta architecture is an early documented example of matrix units integrated within the GPU streaming multiprocessor and exposed through CUDA and libraries [5.8]. These units increase arithmetic density and support narrow data formats, while the surrounding SIMT cores handle addressing, control, transformations, and unsupported operations.

This is a form of domain specialization, but within a programmable GPU envelope. It preserves the GPU runtime, memory hierarchy, scheduling, and broad operator coverage. Its efficiency still depends on feeding supported shapes and formats, maintaining reuse, and avoiding surrounding work that dominates execution. Peak matrix throughput is not achieved application throughput.

### The GPU is a device and a system participant

Discrete GPUs have local memory and communicate with CPUs and other devices through interconnects. Integrated GPUs may share physical memory with CPU cores and other engines. Shared memory can remove explicit copies, but it does not create unlimited bandwidth, equal latency, automatic cache consistency, or free synchronization.

At scale, GPU execution depends on device-to-device links, collective libraries, topology, host involvement, network interfaces, and failure recovery. At mobile scale, it depends on shared LPDDR, on-chip arbitration, power domains, display and graphics demand, and thermal policy. The same SIMT kernel can therefore have different system behavior across the compute continuum.

### Table 5.2 — GPU performance conditions and failure modes

| Required condition | Why it helps | When it weakens | Direct consequence |
|---|---|---|---|
| Abundant independent work | Fills execution resources and covers latency | Sequential decode, narrow shapes, dependency chains | Idle lanes or multiprocessors; longer response time |
| Compatible lane control | Keeps grouped lanes active | Data-dependent branches, variable iterations, routing | Masked execution and wasted issue capacity |
| Coalescible memory access | Converts transactions into useful bytes | Embeddings, graph edges, sparse gathers | Bandwidth and energy spent on unused data |
| Sufficient resident state | Provides ready groups for latency hiding | Register-heavy fusion, large local tiles, large per-thread state | Reduced occupancy and exposed latency |
| Reuse in registers/cache/local memory | Raises arithmetic intensity | Oversized working set, weak temporal locality | Off-chip bandwidth and energy limit throughput |
| Amortized launch and synchronization | Keeps overhead small relative to work | Tiny kernels, fine-grained dependencies, frequent host decisions | Queueing and launch time dominate |
| Balanced work distribution | Prevents long-tail groups | Unstructured sparsity, skewed routing, variable sequence length | Stragglers and barrier stalls |
| Resident data and fast communication | Avoids transfer and remote-state delay | Model sharding, KV movement, scale-out collectives | Link bottlenecks, synchronization, higher tail latency |

## 5.6 CUDA as a Platform, Not Merely a Kernel Language

CUDA is important because it aligned architecture, programming model, compatibility, libraries, and tools. Its platform effect is more consequential than the syntax of launching a kernel.

### Programming and execution model

CUDA exposes a hierarchy of grids, blocks, and threads; device memory spaces; synchronization; asynchronous streams; events; and host–device operations. The abstraction is scalable because a block can be scheduled on any compatible processing unit and a grid can contain more work than one device can execute simultaneously. The host remains responsible for allocation, submission, dependency construction, and integration with the rest of the application.

Asynchronous execution permits computation, transfers, and independent kernels to overlap when hardware resources and dependencies allow it. Streams and events express order without forcing global host synchronization. Graph execution can capture recurring launch structures and reduce CPU submission overhead. Unified-memory mechanisms simplify addressability and migration. Each feature mitigates a real bottleneck, but none removes the underlying resource: overlap still needs bandwidth and independent work; graphs need a sufficiently stable submission structure; managed memory still has residency and migration costs.

### Stable targets and compatibility

A durable accelerator platform needs source compatibility, intermediate or virtual instruction targets, device binaries, drivers, and runtime APIs to evolve together. CUDA’s model allowed applications and libraries to target a family rather than one fixed GPU. Compatibility is not absolute performance portability: code that runs on a new device may require retuning for its resource balance, memory hierarchy, or specialized units. It nevertheless protects software investment sufficiently for libraries and frameworks to accumulate.

### Libraries move architecture expertise out of applications

Few application teams should independently implement every convolution, matrix multiplication, normalization, attention primitive, transform, or collective. Libraries encapsulate algorithms, tiling, layouts, precision paths, and device-specific tuning. The cuDNN work explicitly framed deep-learning primitives as an analogue to BLAS: optimization can be concentrated in a reusable library rather than repeated by every framework and then repeated again for every processor generation [5.6].

Libraries also make hardware features economically usable. A new instruction has limited value if applications cannot reach it. When frameworks call a stable primitive and the library selects among kernels, hardware evolution can benefit many applications without source changes.

The abstraction has limits. An application may use unsupported shapes, data types, layouts, fusion patterns, or new operators. Falling outside a library’s tuned region can expose compilation, conversion, or custom-kernel work. A high-performing library path may also constrain numerical behavior or memory layout. Ecosystem strength does not eliminate architecture dependence; it amortizes it.

### Compilers, frameworks, and graph systems

Frameworks represent models above individual kernels. Compilers fuse operations, propagate layouts and precision, specialize shapes, allocate memory, and select libraries or generated code. Multi-level infrastructure such as TVM and MLIR exists partly because one abstraction cannot simultaneously preserve model meaning and express target-specific scheduling [3.6][3.7].

This layer is essential to modern GPU utilization. An eager sequence of small operations may spend too much time in launch, allocation, synchronization, and intermediate memory traffic. Graph compilation or capture can create larger units and reduce host work. Dynamic shapes, data-dependent control, debugging requirements, and operator evolution limit how much can be fixed ahead of time.

### Tooling and operational maturity

Profilers, debuggers, correctness tools, telemetry, container packaging, deployment images, and distributed libraries turn a processor into an operational platform. They help teams attribute time to kernels, memory transfers, queues, collectives, CPU submission, and synchronization rather than optimizing by peak throughput.

This maturity creates switching cost. Porting a kernel language is only one part of moving to another platform. Libraries, numerical behavior, compiler paths, operations procedures, observability, workforce knowledge, and long-term support must move too. Alternative GPU ecosystems, including AMD’s HIP model, intentionally expose similar host/device and SIMT concepts to improve source portability, while still requiring target-specific validation and tuning [5.7]. Chapter 9 will compare these software ecosystems in depth; here the point is architectural: software capital can make a somewhat less efficient general platform economically preferable to a theoretically better but poorly enabled device.

[**Figure 5.3 placeholder — The GPU platform stack and accumulated software capital.** Show application and model framework; graph compiler; operator and collective libraries; kernel language and compiler; virtual or intermediate target; runtime and memory manager; driver and firmware; GPU and interconnect; profiler, debugger, deployment, and telemetry alongside all layers. Mark compatibility and optimization boundaries. Add a migration arrow to another GPU or accelerator platform showing that syntax is only one transferred asset.]

## 5.7 Why GPUs Became the Dominant Broad AI Accelerator

GPU dominance is best explained as an alignment of several conditions, not as the result of one throughput number.

### Architecture matched the first wave of scalable deep learning

Training and many inference phases supplied large dense tensors, repeated operations, and abundant parallel work. GPU memory bandwidth, thread-level parallelism, and local reuse mechanisms matched these phases better than CPU-only execution. The same device remained programmable enough for activation functions, reductions, data transformations, custom layers, and new model architectures.

### The installed platform preceded the workload

Programmable GPU computing, hardware products, drivers, tools, and developer communities existed before deep learning demand reached its later scale. Researchers could access parallel hardware without commissioning an ASIC. Cloud services and workstations widened access. This reduced experimentation cost and shortened the path from a new operator to running code.

### Libraries and frameworks compounded adoption

Once frameworks and libraries optimized for GPUs, new applications inherited those paths. Larger use justified more library and hardware investment, which improved performance and usability and attracted more users. This feedback loop is an ecosystem effect, not proof that every workload is architecturally ideal for a GPU.

### One platform served research and production

The same broad programming model could support exploratory kernels, large training, batch inference, visualization, simulation, and custom preprocessing. Organizations could delay specialization while model architectures changed. A GPU’s flexibility had economic option value: it reduced the risk that an expensive device would become unusable when algorithms evolved.

### GPUs scaled from one device to systems

Multiple GPUs could be connected within a node and across a cluster. Libraries and frameworks developed model, data, tensor, and pipeline parallelism. Faster device memory and interconnects expanded the feasible model size. The GPU became a unit in a distributed system rather than an isolated coprocessor.

### The architecture absorbed domain specialization

Matrix units, narrow precision, structured sparsity support, asynchronous data movement, graph submission, and stronger interconnects extended the GPU efficiency envelope. This adaptability is central to the platform’s durability. It also shows that the transition toward specialization is not external to GPUs; part of it occurs within them.

### Dominance differs across the compute continuum

In hyperscale and datacenter training, the GPU is a broad high-throughput platform supported by distributed software. In enterprise infrastructure, it is a flexible accelerator that can consolidate changing models, though utilization and acquisition cost may dominate. In workstations and PCs, it combines AI with graphics, simulation, and media. In mobile systems, an integrated GPU offers programmable parallel execution but competes with graphics demand, shared-memory bandwidth, battery, and specialized NPU paths. In robotics, it is valuable when perception and planning algorithms evolve rapidly, while real-time control and safe fallback remain elsewhere.

The same word “GPU” therefore names different physical and economic designs. Dominance in datacenter training does not imply that a datacenter GPU should be placed unchanged into an always-on sensor path.

## 5.8 The CPU–GPU System Is the Baseline Unit

The practical unit of architecture is often the CPU–GPU system, not either processor alone.

### Discrete acceleration

In a discrete system, the GPU has local memory and the CPU has system memory. Explicit copies, direct device I/O, peer access, or managed-memory migration move data across the boundary. Local GPU memory can provide high bandwidth and isolate accelerator traffic from host memory, but capacity is finite and transfer paths have latency, power, and topology.

The software must decide:

- which objects remain resident;
- who owns and mutates them;
- when transfers occur;
- whether computation can overlap movement;
- how faults and oversubscription behave;
- how several devices share or partition state;
- how CPU and GPU queues propagate priority and backpressure.

### Integrated and shared-memory systems

An integrated GPU can share physical memory with CPU cores and other SoC engines. This may avoid bulk copies and enable fine-grained collaboration. It is especially important in client, mobile, and embedded systems where a separate high-power memory pool would be costly.

Shared physical memory does not remove architecture. CPU and GPU caches may have different consistency rules. Page ownership, translation, cache maintenance, and synchronization can remain visible. More importantly, all agents contend for the same channels and thermal budget. A zero-copy path can reduce bytes copied while still increasing latency if the GPU, display, camera, and CPU saturate shared LPDDR.

### Submission and synchronization

The CPU normally builds command buffers or launches, manages dependencies, and consumes results. Fine-grained applications can become submission bound. Software batches launches, captures graphs, uses persistent kernels, delegates scheduling to device code, or overlaps CPU and GPU work.

Each mitigation shifts responsibility. Persistent device execution reduces launches but reserves resources and complicates preemption. Larger graphs reduce overhead but require structural stability. Device-side scheduling reduces host decisions but can make resource control and debugging harder. The correct boundary depends on arrival variance, deadline, isolation, and power state.

### Failure and recovery

The CPU often detects device faults, resets queues, restores state, and reroutes work. In a cluster it may coordinate checkpoint and job recovery. In an embedded system it may transition to a degraded mode. A GPU that is fast in the fault-free case can still reduce goodput or availability if its failure domain is too large or recovery is slow.

### Table 5.3 — CPU–GPU boundary choices

| Boundary choice | Benefit | Residual cost | Best fit |
|---|---|---|---|
| Explicit copy to local GPU memory | Predictable ownership and high local bandwidth | Transfer, duplication, capacity planning | Large reusable working sets and long kernels |
| Managed or migrated memory | Simpler addressability and oversubscription | Page movement, faults, placement variability | Incremental ports and irregular residency with tolerance for migration |
| Shared physical memory | Avoids bulk copies and supports integrated pipelines | Contention, consistency, shared bandwidth and thermals | Client/mobile/embedded SoCs and fine-grained sharing |
| Large batched submission | Amortizes host and launch overhead | Queueing latency and larger live state | Throughput services and training |
| Captured execution graph | Lowers recurring submission overhead | Shape/control rigidity and update complexity | Stable repeated subgraphs |
| Persistent device scheduler | Reduces round trips and supports fine-grained work | Reserved resources, preemption and isolation burden | High-rate recurring tasks with controlled behavior |
| CPU fallback | Broad coverage and fault tolerance | Transfers, latency discontinuities, duplicated implementations | Rare operators, dynamic control, graceful degradation |

[**Figure 5.4 placeholder — One AI request across the CPU–GPU system boundary.** Trace input from network, storage, or sensor through CPU parsing and preparation, GPU transfer or shared-memory access, GPU kernels, collectives or peer communication, CPU postprocessing, and output. Mark queues, ownership changes, synchronization, power-domain transitions, failure handling, and telemetry. Provide three insets: discrete datacenter, shared-memory mobile, and safety-partitioned robotics.]

## 5.9 Where the GPU Efficiency Envelope Narrows

Chapter 2 defined the GPU efficiency envelope through parallelism, coalescing, lane regularity, occupancy, batchability, and amortized overhead. Chapter 4 showed the interacting costs of movement, synchronization, determinism, energy, and reliability. The purpose here is to connect those observations specifically to GPU design choices.

### Low-batch and sequential phases

Autoregressive decode exposes limited parallel work within one sequence compared with large training or prefill operations. Batching sequences improves tensor shapes and device utilization but consumes queueing time and KV-cache capacity. Continuous batching reduces idle gaps but introduces scheduling and state-management work.

Software can aggregate requests, fuse kernels, capture graphs, and optimize KV layout, yet a latency target limits batching and token dependencies limit look-ahead; the arithmetic of §2.5 fixes the ceiling that remains once those techniques are exhausted. The running example shows both outcomes: the hyperscale document assistant escapes the bound statistically because fleet demand supplies admissible concurrency, while the enterprise deployment cannot—which is why §2.14 returned opposite verdicts for the same model. A wide GPU therefore remains attractive where demand fills it within the latency budget; a right-sized or more state-local architecture becomes economically credible where narrow decode is stable, material, and cannot fill the GPU without violating service latency.

### Sparse and irregular access

Embeddings, graph aggregation, unstructured sparsity, and routed experts generate addresses and work counts that depend on data. GPUs can execute them and provide gather, atomic, and dynamic mechanisms. Sorting, reordering, compression, and specialized kernels improve locality.

These transformations carry metadata and latency costs of their own, and runtime sparsity may remain uncoalesced or imbalanced despite them. When useful transaction bytes and active-lane fractions stay persistently low, adding nominal GPU arithmetic does not move the bound; architectures with different access granularity, scheduling, routing, or near-data organization can then justify their enablement cost.

### Resource-heavy fused kernels

Fusion reduces launches and intermediate memory traffic. It also increases register lifetime, local-memory demand, code size, and sometimes control complexity. Resource use may reduce resident blocks and expose latency.

The GPU compiler must trade eliminated movement against occupancy and reusable library paths, and that trade has a floor: fusion is not an unlimited substitute for architectural locality. Stable pipelines may benefit from hardware that retains state or streams values without allocating full general thread context.

### Communication-dominated scale

Distributed training and sharded inference increase aggregate compute and memory capacity. Software overlaps collectives, changes parallelization, compresses communication, and uses topology-aware algorithms.

Exposed communication, imbalance, and recovery all rise when the workload’s communication structure no longer fits the fabric. At that point another GPU adds value only if its marginal useful work exceeds the network, synchronization, power, and failure cost it brings—and the limiting investment can shift from compute devices to specialized interconnect, collective, memory, or execution organization.

### Tail latency and deterministic response

GPU scheduling and multithreading improve throughput under latency variation. Shared resources, queue depth, dynamic clocks, memory contention, and long-running kernels can create response variance. Priority queues, partitioning, preemption points, and admission control mitigate it.

These mechanisms consume capacity, and none of them necessarily bounds every interference path. For safety-relevant or hard-deadline stages, deterministic scheduling, partitioned memory, and bounded pipelines may therefore matter more than average GPU throughput, while the GPU remains in the system for less critical perception or planning work.

### Always-on and small-duty-cycle work

A mobile or embedded GPU can execute a small model quickly, but waking the GPU domain, raising memory frequency, submitting work from the CPU, and contending with graphics may dominate energy. Batching is often impossible because the task must react to one event.

Kernel efficiency does not imply low energy for an intermittent end-to-end path; the four-orders-of-magnitude wake-scope gap quantified in §2.10 is the governing fact. An always-on engine becomes attractive exactly when it keeps CPU, GPU, and external memory domains asleep often enough to amortize its area and integration cost.

### Unsupported or rapidly changing operations

Specialized GPU matrix paths support selected formats, shapes, and operations, while SIMT cores handle the rest. Libraries and compilers expand coverage.

New operations can fall back to general GPU code and remain functionally supported, which preserves research velocity and gives the GPU high option value under algorithm change. Narrower offload is justified only when the target workload is stable enough and common enough that repeated efficiency gains exceed portability and lifecycle risk—the condition that §2.14 showed failing for Nervana and holding for the TPU.

### Table 5.4 — When continued GPU optimization or additional specialization is favored

| Condition | Continued GPU optimization favored | Additional specialization becomes credible |
|---|---|---|
| Workload evolution | Operators, shapes, or numerical methods change rapidly | Stable recurring phases dominate product or fleet cost |
| Parallelism | Demand or batching fills wide execution | Deadline or dependency constrains available width |
| Access | Tiling, caching, and layout create reuse | Irregularity or state movement remains after transformation |
| Control | Divergence is limited or amortized | Data-dependent routing and variable work persist |
| Communication | Compute overlaps most transfers and collectives | Communication remains exposed or requires a different topology |
| Energy | GPU is already active and well utilized | Wake, idle, memory, or cooling energy dominates useful work |
| Determinism | Statistical tail control meets objectives | Worst-case bounds or safety isolation are required |
| Economics | Shared platform and ecosystem reduce total cost | Volume, utilization, energy, or product capability repay enablement |

## 5.10 Why “GPUs Alone Are No Longer Sufficient” Needs Precision

The phrase does not mean that GPUs have stopped improving, cannot execute modern AI, or will be replaced as a class. It means that one throughput-oriented programming and memory contract cannot economically optimize every stable phase across the compute continuum.

There are four distinct claims:

- **A GPU is not a complete system.** CPUs, memory, storage, networking, power delivery, cooling, operating systems, and recovery remain part of every useful result.
- **A GPU’s generality has a cost.** Thread state, instruction delivery, address generation, caches, scheduling, and broad operator support consume area and energy that a narrower design may redirect.
- **GPU efficiency is conditional.** Work must supply sufficient parallelism, regularity, locality, residency, and amortization under the deployment objective.
- **The economic answer changes with scale.** Hyperscalers can amortize custom silicon and software across enormous volume. Mobile vendors can amortize a small accelerator across many devices and convert energy savings into battery life or features. An enterprise with modest, changing demand may rationally prefer a less efficient GPU because its software compatibility and reuse reduce total risk.

This formulation also explains specialization inside GPUs. Matrix units, media engines, copy engines, compression, and collective support remove recurring costs while retaining the larger platform. External accelerators make a stronger trade: they may change execution, memory, numerical, or scheduling contracts more substantially.

The boundary is not fixed. If a formerly narrow accelerator gains programmability, it may absorb more work. If a GPU adds a specialized path, the economic case for a separate device may shrink. If a workload becomes more irregular, a prior ASIC may lose utilization and the GPU may regain the advantage. Architecture families should therefore be compared against measured workload signatures and lifecycle conditions, not arranged in a permanent hierarchy. The next section makes that moving boundary explicit.

## 5.11 What GPU Evolution Absorbs—and What It Cannot

The strongest objection to this survey’s two-transition thesis deserves a direct answer rather than a passing caveat. The objection runs: GPU vendors respond to every residual bound that Chapters 2 and 4 identify, so the second transition will largely happen *inside* the GPU—as it already has with matrix units—leaving external accelerators a permanently shrinking remainder. If that is right, Chapter 6 describes a niche; if it is wrong, Chapter 6 describes the future. The evidence supports neither extreme, and the productive move is to partition the residual bounds of Chapter 2 into three classes: those the GPU contract has demonstrably absorbed, those that are structurally outside any throughput-oriented device contract, and a contested middle where the outcome is decided by the economics of §2.14 rather than by architecture alone.

### Bounds the GPU has absorbed or is absorbing (evidence class A)

The absorption record is real and should be stated plainly, because it explains why the GPU remains the default platform:

### Table 5.6 — Residual bounds absorbed into the GPU platform

| Residual bound (Chapter 2) | GPU response, shipped | What the response preserves |
|---|---|---|
| Matrix arithmetic density | Tensor cores integrated in the SM since Volta [5.8] | SIMT programmability around the matrix path |
| Precision reduction | FP16/BF16/FP8 with hardware conversion and per-layer scaling support in Hopper’s transformer engine [5.9] | Library and framework compatibility |
| Structured sparsity | 2:4 structured-sparse execution [5.9] | Dense-path programming model |
| Data-movement overhead | Asynchronous copy engines and tensor memory accelerators decoupling movement from compute [5.9] | The kernel abstraction |
| Launch and submission overhead | Graph capture and device-side scheduling | Host-driven execution model |
| Scale-up communication | Multi-device NVLink domains treating a rack as one accelerator complex [5.9] | Single-platform software stack |
| Sharing and isolation | Multi-instance partitioning of one device | Fleet scheduling flexibility |

Each row absorbs a bound *while preserving the platform contract*—programmability, library compatibility, and accumulated software capital. This is specialization occurring inside the GPU, exactly as §5.7 described, and it is why the necessity test's fourth condition so often resolves in the GPU's favor: the challenger must beat not today's device but this trajectory plus its ecosystem.

### Bounds structurally outside the throughput contract

A second class of bounds cannot be absorbed, because the obstacle is the GPU contract itself rather than any parameter of its implementation:

- **Wake-scope and always-on energy.** The §2.10 bound is set by which power domains and memory paths must be active, not by arithmetic efficiency. A host-driven device with a deep runtime, large shared memory, and driver-mediated submission *is* the energy cost; no generation of the same contract reaches the sub-milliwatt regime in which always-on silicon operates [2.21]. Absorbing this bound would mean abandoning the submission and memory model that defines the platform.
- **Bounded worst-case timing and certification.** GPU mechanisms deliver statistical tail control; safety cases require provable bounds on interference paths through shared schedulers, caches, and DMA. Removing the dynamic sharing that obstructs the proof removes what makes the GPU economically a GPU. TPU v1's deterministic pipeline was a contract change, not a parameter change [1.12], and that distinction generalizes.
- **Near-sensor locality.** When the bound is the energy and latency of moving raw sensor data to a central device (§2.11), the lever is physical placement. A central throughput device cannot occupy the sensor's location; the economics of a large die contradict the SWaP-C envelope at the sensor.
- **Per-unit cost floors at embedded volume.** A microNPU occupying a few square millimeters beside a microcontroller meets a component-cost target that no general throughput device approaches, independent of efficiency progress. The embedded envelope prices out generality itself.

These four are the secure foundation of the beyond-GPU case: they justify architecture families by contract change, and no plausible GPU roadmap reaches them.

### The contested middle

Between the two classes lies the territory where the commercial battle is actually fought:

- **Low-batch decode.** The bandwidth bound of §2.5 is being attacked from both sides: GPU platforms with faster memory, FP8 paths, and disaggregated-serving support; decode-oriented designs—deterministic tensor streaming with model state held in distributed on-chip SRAM [5.10], and related architectures—by changing the memory contract outright. Which side wins at a given operator's volume is a §2.14 condition-4 question, and the answer is genuinely open.
- **MoE routing and all-to-all.** Fabric and collective evolution inside the GPU platform competes with topology- and routing-specialized designs for a bound measured at roughly a third of step time (§2.7).
- **Near-memory computation for embeddings and retrieval.** Processing-in-memory prototypes (evidence class C) compete with sharding and caching software on conventional accelerators; the software side has so far held.

In this middle band, silicon efficiency decides outcomes less often than software capital and workload stability do—the same terms that decided the Nervana and Graphcore cases. Chapter 7's product analysis should be read with this partition in hand.

### The partition is Chapter 6's mandate

Chapter 6 can now be given a precise assignment rather than a general one. Architecture families that attack the structural non-absorbables—always-on NPUs, deterministic pipelines, near-sensor engines, microNPUs—earn their place by contract change and are secure against GPU evolution. Families that attack the contested middle must demonstrate, workload by workload, that the necessity test's fourth condition holds against a moving target. Any family that attacks an absorbed bound is competing with the GPU's strongest ground and carries the burden of explaining why its advantage survives the platform's next generation.

![**Figure 5.5 — Partition of residual bounds by absorbability.** Three columns: absorbed into the GPU platform (with shipped mechanism named per bound), structurally outside the throughput contract (with the contract obstacle named), and contested middle (with both competing responses named). Arrows run from each Chapter 2 residual bound into its column. The contested column is annotated with the §2.14 condition-4 criterion that decides it.](figures/fig05-05-absorption-partition.png)

## 5.12 CPUs and GPUs Across the Compute Continuum

### Table 5.5 — CPU and GPU roles by deployment class

| Deployment | CPU role | GPU role | Primary objective | Key boundary decision |
|---|---|---|---|---|
| Hyperscale/datacenter | Host orchestration, storage/network processing, admission, retrieval, fallback, recovery | Large training, flexible inference, parallel simulation and data processing | Useful work per dollar and joule under SLO, rack, network, and reliability limits | Which phases, state, and communication remain GPU-resident; whether stable cost justifies further specialization |
| Enterprise/private infrastructure | Consolidated general compute, local data services, security and management | Flexible acceleration for changing private models and shared services | Meet governance and latency needs without excessive idle capital or support burden | Whether demand fills a GPU and whether CPU fallback or sharing meets service objectives |
| Workstation/client | Application and OS execution, interactive control, preprocessing | Graphics plus programmable AI, creative, simulation, local training or inference | Responsiveness, application coverage, privacy, thermals | How graphics and AI share memory, queues, and power; when an NPU or CPU path is preferable |
| Mobile | App and OS control, short irregular work, fallback | Programmable parallel compute and unsupported NPU operators | Energy per interaction, battery, skin temperature, wake cost | Whether GPU activation and shared-memory traffic cost less than CPU or NPU execution |
| Embedded/automotive/robotics | Real-time control, safety, integration, recovery | Evolving perception, mapping, simulation, and planning | Bounded response, mission energy, SWaP-C, availability and safety | Which GPU stages may be variable and which control paths require deterministic isolation |

The architectural idea migrates in both directions. Datacenter GPUs contribute compiler, profiling, and parallel-programming techniques to smaller systems. Integrated systems demonstrate shared-memory and aggressive power-management techniques that can reduce movement and idle cost elsewhere. CPU vector-length-agnostic programming and heterogeneous scheduling likewise address portability across different physical design points.

Reuse does not imply identical chips. A datacenter GPU can assume active cooling, high-power memory, and large concurrent demand. A mobile GPU must coexist with display and media workloads under passive cooling. A robotic GPU may require ruggedization, bounded interference, and long support life. The shared principles are programming hierarchy, parallel execution, locality, and heterogeneous orchestration; implementation and economics remain deployment specific.

## 5.13 Bridge to Domain-Specific Acceleration

The CPU and GPU establish two important endpoints in the design space, but not the only endpoints.

The CPU demonstrates the value of dynamic discovery, coherent sharing, low-latency control, compatibility, and complete system integration. The GPU demonstrates the value of exposing parallel work, amortizing control, tolerating latency with many threads, constructing locality, and building a durable accelerator software platform. Domain-specific accelerators selectively retain, remove, or reorganize these properties.

Chapter 6 can therefore be approached through explicit questions:

- Which execution machinery is removed, and which workload assumption permits its removal?
- What replaces the GPU’s SIMT scheduling or the CPU’s dynamic scheduling?
- Where do weights, activations, state, metadata, and intermediate values reside?
- Which data movement becomes local, implicit, streamed, multicast, or eliminated?
- Which shapes, sparsity structures, precision formats, and control patterns remain efficient?
- What happens to unsupported operators and dynamic behavior?
- Which compiler, runtime, OS, memory, and failure responsibilities move into software?
- How does the answer change among hyperscale, enterprise, mobile, and embedded deployment?
- Under what workload volume and lifecycle economics does the design outperform continued CPU or GPU optimization?

These questions prevent Chapter 6 from becoming a list of devices. Systolic arrays, tensor processors, deterministic dataflow and tile processors, NPUs, reconfigurable fabrics, wafer-scale systems, memory-centric architectures, and neuromorphic approaches should be compared as different answers to the contracts and stressors established in Chapters 2 through 5.

## 5.14 Engineering Takeaways

- CPUs remain the control and integration baseline of every AI system—they own the system contract even when they execute a minority of the arithmetic—and vector or matrix extensions let them absorb recurring kernels without crossing a device boundary.
- The GPU’s advantage is conditional on abundant ready work, compatible lane behavior, useful memory transactions, sufficient residency, and amortized overhead; the CPU–GPU pair divides each request across memory, queue, power, and failure boundaries that must be measured at the useful-result boundary.
- CUDA’s alignment of abstractions, compatibility, libraries, tools, and operations converted software capital into an architectural selection criterion; a narrower design must repay the option value, portability, and support it gives up—the condition that decided the §2.14 cases.
- Specialization is already occurring inside the GPU: tensor cores, narrow precision, structured sparsity, asynchronous movement, graph submission, and scale-up fabrics have absorbed several of Chapter 2’s residual bounds while preserving the platform contract (Table 5.6).
- Four bounds are structurally beyond that absorption—wake-scope energy, provable worst-case timing, near-sensor locality, and embedded per-unit cost floors—and they anchor the secure portion of the beyond-GPU case; a contested middle (low-batch decode, MoE routing, near-memory lookup) is decided by volume, stability, and software economics rather than silicon alone.
- Chapter 6 should therefore compare domain-specific families by which contracts they change, which assumptions they exploit, and where they sit in the absorption partition—not as a catalog of devices.
