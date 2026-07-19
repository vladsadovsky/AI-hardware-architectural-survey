# Appendix C. Microarchitectural Deep Dives

## C.1 Purpose and Reading Rule

Chapter 6 compares architecture families through their contracts. This appendix descends one level into representative mechanisms that would interrupt the main narrative if explained there in full. The diagrams remain textual in this draft so their eventual figures can be derived without changing the argument.

These are not canonical floorplans of particular products. Each deep dive follows one unit of useful work through execution, local storage, wider memory, scheduling, and communication, then identifies the mechanism’s efficient envelope and failure mode. Product names are evidence anchors only.

## C.2 One GPU Kernel from Submission to Retirement

### C.2.1 The path

A host process constructs work through a framework, library, or custom kernel. The runtime resolves dependencies, selects a device context, prepares memory mappings, and submits commands to one or more queues. Firmware and front-end hardware fetch command descriptors, establish kernel state, and distribute thread blocks or comparable work groups to available processing units.

Within a GPU processing unit:

1. A block is admitted only if registers, local/shared memory, thread slots, and architectural limits permit residency.
2. Threads are grouped into warps or wavefronts for physical execution.
3. A warp scheduler selects a ready group; instruction issue may target scalar, vector, matrix, load/store, or special-function pipelines.
4. Memory instructions are coalesced into transactions. Address dispersion determines useful bytes per transaction.
5. Loads consult translation and cache structures before reaching device memory. Miss latency is tolerated by issuing other ready groups.
6. Matrix instructions move tiles through registers and local storage into matrix units; surrounding SIMT instructions handle layout, activation, reductions, indexing, and control.
7. Results remain in registers or local memory when reused, move through caches and device memory when spilled or made globally visible, and may require synchronization before a dependent kernel or peer device proceeds.

The architectural proposition is not “many cores.” It is a contract in which abundant independent work allows hardware to tolerate uncertain latency dynamically. Registers and resident thread state are the inventory from which the scheduler buys that tolerance.

### C.2.2 Occupancy is a resource inequality

For a processing unit with register capacity \(R\), local-memory capacity \(S\), maximum resident threads \(T\), and maximum resident blocks \(B\), a kernel using \(r\) registers per thread, \(s\) local bytes per block, and \(t\) threads per block is bounded by

\[
b_{\mathrm{resident}}
\leq
\min\left(
B,\,
\left\lfloor\frac{R}{rt}\right\rfloor,\,
\left\lfloor\frac{S}{s}\right\rfloor,\,
\left\lfloor\frac{T}{t}\right\rfloor
\right).
\]

Higher occupancy is valuable only until enough ready work exists to cover the encountered latency. Fusion can reduce HBM traffic while raising \(r\) or \(s\), reducing residency. The correct optimization target is therefore end-to-end useful time, not maximum resident blocks.

### C.2.3 Divergence and reconvergence

Threads in a physical group may take different branches. Hardware records active masks or comparable control state and executes the necessary paths for relevant subsets. If work per path differs, lanes wait for the longest active path. Reordering, predication, compaction, persistent kernels, or specialized work queues can improve useful-lane fraction, but dynamic graph traversal, expert routing, and variable output sizes may preserve irreducible variance.

### C.2.4 Memory coalescing

Suppose a group requests \(u\) useful bytes and the memory system transfers \(x\) bytes after transaction formation. Useful-byte efficiency is

\[
\eta_{\mathrm{bytes}}=\frac{u}{x}.
\]

Sequential or block-local addresses can make \(\eta_{\mathrm{bytes}}\) approach one. Scattered gathers may retrieve a cache line or sector for only one small value. Peak HBM bandwidth applies to \(x\), while the application benefits from \(u\).

### C.2.5 Efficient envelope and failure mode

The mechanism is strongest with abundant ready groups, regular lane work, coalescible access, adequate reuse, large or batchable shapes, and overhead that can be amortized. It weakens under serial token dependencies, narrow matrix shapes, low batch, pointer-rich gathers, high register pressure, data-dependent routing, or deadlines that prevent queueing. None makes the GPU incapable; each reduces the fraction of provisioned machinery converted into useful work.

## C.3 Systolic Matrix Multiplication Cycle by Cycle

### C.3.1 A weight-stationary example

Consider a small \(N\times N\) grid. Each processing element retains one weight for the current tile. Activations enter from the left in a staggered wavefront. Partial sums enter from the top, are updated by the local multiply-accumulate, and move downward. After fill, the array can perform \(N^2\) multiply-accumulates per cycle while receiving only edge traffic.

At cycle \(t\):

- row \(i\) receives activation element aligned for the weight in column \(j\);
- processing element \((i,j)\) multiplies its resident weight by the arriving activation;
- it adds the product to the partial sum received from its upper neighbor;
- it forwards the activation rightward and the updated partial sum downward.

The local register or latch state is real; the savings come from avoiding repeated round trips to a central register file, cache, or off-chip memory. Geometry supplies naming and routing that an instruction-scheduled processor must perform dynamically.

### C.3.2 Fill, steady state, and drain

An \(N\times N\) array does not begin at peak rate immediately. Operands must fill the wavefront and results must drain. For a small tile or narrow dimension, fill and drain consume a material fraction of time. Folding a larger operation across the array adds boundary traffic; padding a smaller operation performs work with no useful operand.

If only \(m<N\) columns are useful, a first-order column utilization is

\[
U_{\mathrm{column}}\leq \frac{m}{N}.
\]

This is why one large array can excel on training or prefill contractions and underfill on batch-one matrix-vector work.

### C.3.3 Stationary choices

- **Weight-stationary:** weights remain local; activations and partial sums move. Appropriate when weights can be reused across several activations.
- **Output-stationary:** partial sums remain local until accumulation completes; weights and activations move.
- **Row-stationary:** maps convolution rows to exploit several reuse dimensions together.
- **Streaming variants:** values continuously traverse a spatial pipeline with limited stationary state.

No choice dominates. Tensor shape, local capacity, multicast support, reduction structure, and precision determine movement at each level. Timeloop and data-centric mapping work [3.2][3.3] exist precisely because “uses a systolic array” does not determine the realized data movement.

## C.4 Deterministic Distributed-SRAM Execution

### C.4.1 Physical organization

A deterministic tile processor places compute units, SRAM banks, and router endpoints in repeated tiles. The compiler receives a graph and a hardware resource model, then performs:

1. operation partitioning across tiles;
2. static placement of weights and persistent state;
3. allocation of activation buffers;
4. routing of every inter-tile value;
5. cycle scheduling of computation and transfers;
6. insertion of synchronization implied by the schedule;
7. generation of a device program whose timing is known before execution.

The device does not discover cache misses or choose among ready warps. It executes the compiled schedule. Groq’s TSP is the strict evidence anchor [5.10][6.6]; other tile processors retain more runtime programmability and are therefore points on a spectrum rather than identical implementations.

### C.4.2 Why SRAM changes decode

On-chip SRAM provides enormous aggregate bandwidth because many physically distributed banks operate concurrently near their consumers. A model whose weights remain distributed across those banks avoids streaming the weights from HBM for every token. But SRAM capacity per die is small, so large models require many dies.

The system-level transformation is:

\[
\text{HBM bandwidth bound}
\longrightarrow
\text{SRAM capacity + placement + fabric traversal bound}.
\]

The bound is changed, not eliminated. The resulting system is attractive when stable, latency-sensitive demand keeps the compiled pipeline busy and unattractive when model churn or bursty demand strands a large sharded footprint.

### C.4.3 Static uncertainty tax

Dynamic shapes, conditional routing, sparse indices, and variable sequence lengths are not known to a strict static schedule. The compiler can:

- pad to a worst case;
- compile several variants and dispatch among them;
- reserve slack in time and storage;
- move dynamic work to a host or boundary processor.

Each choice spends capacity, code size, compile time, or determinism. “Deterministic” therefore describes the scheduled core, not the arrival queue, external tools, or arbitrary dynamic application behavior.

## C.5 NPU Execution Inside a Shared-Memory SoC

### C.5.1 Graph partition path

A client or embedded runtime imports a model, applies supported transformations, and partitions its graph by operator coverage and policy. An NPU subgraph is compiled into commands that orchestrate DMA, local SRAM, matrix units, vector units, and synchronization. Unsupported operations remain on a CPU, GPU, DSP, or another engine.

The end-to-end path may be:

1. sensor or application produces input in shared LPDDR;
2. CPU runtime validates shapes and enqueues NPU work;
3. NPU DMA stages tiles into local SRAM;
4. matrix and vector units execute compiled operators;
5. results return to shared memory or remain local for a fused successor;
6. an unsupported operation wakes a CPU or GPU domain;
7. ownership and synchronization return to the NPU for the next supported region.

### C.5.2 Coverage and fallback

Let \(E_N\) be energy of full-NPU execution, \(E_F\) incremental fallback energy including copies and wakeups, and \(p_F\) probability or fraction of executions requiring fallback. Expected energy is

\[
E=E_N+p_F E_F.
\]

A low-energy NPU kernel can lose at the system boundary if \(E_F\) is large. Coverage must therefore be measured as fractions of end-to-end time, energy, and movement—not merely percentage of graph operators.

### C.5.3 Shared-memory qualification

“Zero copy” means no explicit software copy; it does not imply zero movement. NPU and CPU accesses still traverse interconnects, memory controllers, caches, and coherence or ownership mechanisms. Display, camera, modem, CPU, GPU, and NPU traffic contend for shared LPDDR. The NPU’s advantage comes from local reuse, narrow execution, and smaller wake scope, not from shared memory becoming physically free.

### C.5.4 Power-domain hierarchy

An always-on path should keep the application CPU, GPU, and often DRAM asleep. A foreground NPU path may require shared LPDDR but keep the GPU off. A burst GPU path may finish sooner but activate a larger domain. The scheduler should select an engine using complete energy and deadline information, not nominal TOPS.

## C.6 Reconfigurable Fabric and Overlay Execution

### C.6.1 Full hardware compilation

An FPGA design maps a circuit description through synthesis, technology mapping, placement, routing, timing closure, bitstream generation, and verification. The result can implement custom pipelines, numerical formats, interfaces, and deterministic state machines. Compilation takes far longer than software compilation because it creates and times physical structure.

### C.6.2 Overlay compilation

An overlay prebuilds a reusable processor or soft NPU in the FPGA fabric. Model deployment then targets the overlay’s instruction or graph contract instead of resynthesizing hardware. This shortens deployment time and broadens accessibility while surrendering some of the structural efficiency that motivated the FPGA.

The two paths exchange:

| Property | Full hardware mapping | Overlay |
|---|---|---|
| Compile/deploy time | Hours or longer | Seconds to minutes |
| Datapath specificity | High | Limited by overlay |
| Hardware expertise | Required | Concentrated in overlay team |
| Peak efficiency | Higher potential | Lower |
| Model agility | Lower | Higher |

Catapult and Brainwave show why the family persists in datacenter infrastructure and pinned-model, batch-one serving [6.2][6.3]. The same mechanisms remain important in long-lifecycle embedded and interface-attached systems.

## C.7 Wafer-Scale Defect Tolerance and Memory Locality

### C.7.1 Crossing the reticle boundary

Conventional dies are separated at reticle and scribe boundaries, packaged, and connected through board or package links. A wafer-scale design keeps cross-reticle wiring and builds one routed mesh across the wafer. This removes several packaging and network boundaries but creates a manufacturing fact: some tiles and links will be defective.

The architecture therefore includes spare resources, defect discovery, logical-to-physical remapping, and routes around unusable regions. Yield is not achieved by requiring a perfect wafer; it is achieved by converting physical defects into a mapping constraint.

### C.7.2 Distributed state

Each core or tile owns a portion of on-wafer SRAM. Aggregate capacity and bandwidth are large, but locality remains nonuniform: a local-bank access differs from a route across the wafer. Compilers must place operations and state to exploit neighborhood reuse and avoid hot routes.

For models fitting the on-wafer state, inter-device collectives can collapse into mesh traffic. For larger models, external MemoryX-class systems stream or supply weights, restoring a wider memory tier. Wafer-scale therefore changes the scale at which SRAM locality applies; it does not abolish hierarchy.

### C.7.3 Appliance boundary

Power delivery, liquid cooling, wafer packaging, external memory, and system software make the appliance the minimum honest comparison boundary. Per-wafer arithmetic or bandwidth compared with one conventional package is useful only as mechanism evidence, not procurement evidence.

## C.8 Processing-in-Memory Placement and Coherence

### C.8.1 Three organizations

1. **In-DRAM SIMD:** arithmetic units beside memory banks operate on locally stored values, harvesting internal bank bandwidth.
2. **Memory-bank processors:** small programmable cores execute code near partitions of commodity-style memory.
3. **All-SRAM near-memory inference:** weights and activations remain in distributed on-die SRAM beside compute.

These organizations share a movement objective but not an ISA, programming model, precision set, or consistency contract.

### C.8.2 Offload sequence

A host must identify eligible data, establish its placement, issue an in-memory operation, manage ordering with ordinary loads and stores, and retrieve or expose the result. If data must first be copied into a special region, the setup cost may dominate small operations. If the operation produces a much smaller result than its input, the external interface carries result-level rather than operand-level traffic and the lever is strongest.

### C.8.3 Coherence choices

- **Noncoherent regions:** software explicitly transfers ownership and synchronization.
- **Restricted shared regions:** host and PIM obey a limited consistency protocol.
- **Coherent attachment:** hardware maintains visibility but spends area, bandwidth, and energy on coherence.

The absence of a portable contract across these choices is the family’s principal adoption barrier (§6.8). A successful standard must define not only operations but placement, failure, observability, protection, and performance semantics.

## C.9 Interconnect Hierarchy as One Repeated Problem

The same producer–consumer separation recurs at several scales:

| Boundary | Typical mechanism | Dominant concerns |
|---|---|---|
| Within a PE | bypass/local register | latency, ports, energy |
| PE to PE | neighbor or NoC route | placement, multicast, reduction |
| Die to die in package | die-to-die link | yield, reach, protocol, power |
| Device scale-up | proprietary or open fabric | collectives, ordering, topology |
| Node scale-out | Ethernet/InfiniBand lineage | congestion, routing, failures |
| Storage or remote tier | network/storage protocol | latency, capacity, persistence |

Moving a boundary inward reduces some costs while consuming packaging, area, local capacity, or design flexibility. The architecture families in Chapter 6 can be reread as different decisions about which boundaries to collapse and which to expose.

## C.10 Cross-Mechanism Checklist

For any new microarchitecture, ask:

1. What physical state is local to the arithmetic, and for how long?
2. Which values are multicast, streamed, reduced, cached, or recomputed?
3. Who decides readiness, placement, and routes—hardware, compiler, runtime, or input?
4. What happens when shapes, operators, or control fall outside the intended envelope?
5. Where does unsupported work execute, and what movement or wake does fallback cause?
6. Which bandwidth figure is local aggregate bandwidth and which is uniformly accessible bandwidth?
7. What is the minimum honest comparison boundary?
8. Which residual bound is removed, and which new bound replaces it?

The final question is the governing one. Every mechanism in this appendix buys efficiency by moving a bottleneck or narrowing a contract; architectural analysis is the discipline of naming both sides of that exchange.
