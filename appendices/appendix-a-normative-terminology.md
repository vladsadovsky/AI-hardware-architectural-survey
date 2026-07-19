# Appendix A. Normative Terminology

## A.1 Purpose and Usage

This appendix fixes the meaning of recurring terms in the survey. It is normative for this manuscript: where vendor usage differs, the definition here governs the analysis. The objective is not to impose universal industry vocabulary but to prevent three recurring errors—mixing abstraction levels, comparing unlike measurement boundaries, and treating a product label as an architectural classification.

The words **shall** and **must** identify a manuscript rule; **should** identifies preferred analytical practice; **may** identifies a permitted variation. Terms are grouped by the kind of claim they support. Cross-references point to the canonical discussion in the main text.

## A.2 Workload and Execution Terms

**Accelerator.** Hardware that executes a selected workload phase under the control of a host, runtime, compiler, or system scheduler, with an objective such as lower latency, greater throughput, lower energy, improved determinism, or reduced cost. The term does not imply a discrete device: an accelerator may be a rack-scale system, add-in card, SoC block, memory-side engine, sensor-adjacent block, or fixed-function unit.

**AI workload.** The complete measured path that produces an AI-enabled useful result, including model computation, state movement, preprocessing, retrieval, communication, scheduling, fallback, and postprocessing where these lie inside the chosen boundary. A model graph is not automatically the workload boundary (§2.1, §4.1).

**Workload phase.** A portion of a workload with a sufficiently stable signature to analyze separately. Transformer prefill and decode are distinct phases even when they execute within one request.

**Workload signature.** A vector of measured properties describing operation and shape distributions, arithmetic intensity, working set, reuse, spatial access, sparsity, dependencies, control variance, state, arrivals, communication, precision, quality, and deployment constraints (§2.2). A signature is a distribution, not a product label or one average.

**Training.** Model execution that computes parameter updates toward a quality target. The relevant system boundary includes forward and backward passes, gradients, optimizer state, activation storage or recomputation, input preparation, communication, checkpointing, and failure recovery.

**Inference.** Model execution that produces predictions or generated outputs without the full parameter-update path. Inference may still update caches, adapters, retrieval state, or application state.

**Prefill.** The transformer-inference phase that processes an input context, produces the initial activations, and populates the KV cache. It commonly exposes parallelism across input positions and relatively large matrix operations (§2.5).

**Autoregressive decode.** The transformer-inference phase that generates one new token per active sequence step. Successive steps are dependent; at low batch, weights and KV state can make the phase bandwidth- and capacity-bound (§2.5).

**Batch.** Work admitted for concurrent execution or co-scheduling. Batch size shall be distinguished from request concurrency: a serving runtime can form changing batches from a larger set of active requests.

**Batch one.** One independently advancing item or sequence at the relevant operation. It does not mean that only one request exists in the system or that no parallelism exists within the model dimensions.

**Dense computation.** Computation whose mapped operand domain is substantially populated and regular enough that dense vector, matrix, or tensor execution does useful work across most provisioned lanes.

**Sparsity.** The absence of values or operations relative to a dense representation. Claims about sparse acceleration must state whether sparsity is structured or unstructured, static or dynamic, and whether metadata, indexing, load balance, and routing are included.

**Mixture of Experts (MoE).** A conditional model organization in which a router selects a subset of expert submodels for each token or item. MoE may reduce arithmetic executed per token while increasing routing, imbalance, state-placement, and all-to-all communication costs (§2.7).

**Useful work.** Work that contributes to a correct, timely, accepted result within the stated objective. Padding, retries, failed work, late responses, inactive-lane operations, and computation discarded by policy are not useful work merely because hardware executed them.

## A.3 Architectural Abstraction Levels

**Execution model.** The rule by which operations become eligible and are issued: scalar, superscalar, vector/SIMD, SIMT, spatial/dataflow, event-driven, or fixed-function. An execution model is not itself a complete microarchitecture.

**Instruction-set architecture (ISA).** The software-visible contract defining operations, state, addressing, exceptions, and other behavior implemented by a processor. Matrix or tile instructions specialize an ISA without necessarily changing the processor’s overall microarchitectural family.

**Microarchitectural organization.** The physical organization implementing execution, placement, scheduling, communication, and memory contracts—for example an out-of-order CPU, throughput GPU, tensor processor, deterministic tile fabric, NPU, FPGA, wafer-scale mesh, or processing-in-memory organization.

**Dataflow.** The choice of which values remain stationary, which values move, and where reuse and reduction occur while mapping an operation. Weight-stationary, output-stationary, row-stationary, and streaming dataflows are strategies that can occur within several microarchitectural families (§3.4).

**Mapping.** The assignment of operations and values across space, time, storage levels, and communication routes. Tiling, folding, fusion, placement, layout, and scheduling are mapping decisions.

**Architectural contract.** A set of obligations and guarantees visible across a hardware–software boundary. This survey uses six: execution, data placement, numerical behavior, scheduling, communication, and software (§3.1).

**General-purpose.** Able to support a broad and changing workload set through a stable programming and system contract. General-purpose does not mean unspecialized internally: CPUs contain vector and matrix units; GPUs contain tensor cores and fixed-function engines.

**Domain-specific.** Designed around recurring properties of a workload domain while retaining some programmability within that domain. Domain-specific does not mean single-function.

**Fixed-function.** Implements a narrow operation or pipeline whose structure is substantially fixed at design time. Configuration values and firmware do not by themselves make a block general-purpose.

## A.4 Processor and Accelerator Families

**CPU.** A processor organized around low-latency progress, general system execution, protection, interrupts, operating-system integration, caches, and dynamically encountered control. Modern CPUs may include SIMD, vector, matrix, cryptographic, media, and infrastructure acceleration (§5.2).

**GPU.** A programmable throughput processor organized around many grouped execution lanes, hierarchical parallelism, latency tolerance through resident work, high-bandwidth memory access, and increasingly matrix-specialized units (§5.4–§5.5).

**SIMD.** Single instruction, multiple data: one instruction applies an operation across several data elements represented as lanes of one architectural operation.

**SIMT.** Single instruction, multiple threads: threads retain individual logical state while hardware executes groups of them together. Divergent paths are functionally valid but may serialize subsets of lanes.

**Matrix or tensor engine.** A unit that performs many multiply-accumulate operations per instruction or command over small tiles, amortizing control and operand-delivery overhead. The term describes a mechanism, not a whole device.

**Systolic array.** A grid of processing elements through which operands or partial results advance rhythmically over neighbor links. The stationary data choice is a design parameter; a systolic array shall not be defined as universally weight-stationary or as universally register-free (§6.2).

**Tensor processor.** A device organized primarily around one or more large matrix engines, explicit or software-managed memory, predominantly compiler-owned scheduling, and—at datacenter scale—a co-designed interconnect (§6.3).

**Deterministic dataflow or tile processor.** A tiled accelerator in which the compiler owns placement, routing, and substantial portions of execution time. The strict form avoids caches and dynamic arbitration in the scheduled core and places state in distributed SRAM (§6.4).

**NPU.** A vendor-neutral label for an integrated neural-processing block, typically combining matrix, vector, DMA, and local-memory resources behind graph compilation. In this survey the term is a product class only after the underlying organization and power-domain role are stated (§6.5).

**microNPU.** A small NPU designed for microcontroller-class, embedded, or always-on operation, commonly executing an offline-compiled command stream from flash or local SRAM within a milliwatt-scale envelope.

**Near-sensor accelerator.** Computation placed in or adjacent to a sensor path so that raw or high-rate data can be reduced before traversing the wider SoC or system.

**FPGA.** A field-programmable gate array whose lookup tables, arithmetic blocks, memory blocks, and routing are configured after manufacturing to implement a datapath. Hardened engines may coexist with the programmable fabric (§6.6).

**Wafer-scale accelerator.** One logical accelerator spanning multiple reticle fields across a wafer, with defect-tolerant routing and distributed state. The comparison boundary is a wafer or appliance, not a conventional die (§6.7).

**Processing in memory (PIM).** Computation placed within or immediately beside memory arrays to exploit internal bandwidth or avoid external operand movement. PIM claims must state the memory technology, supported operations, placement boundary, host-consistency model, and whether results or operands cross the external interface (§6.8).

**Near-memory computing.** Computation placed close to, but not necessarily inside, the memory arrays. The term is broader than PIM.

**Neuromorphic accelerator.** An architecture using event-driven neuron and synapse models, typically with state distributed near computation and communication through spike events. Synchronous distributed-SRAM inference is not neuromorphic merely because it shares an institutional lineage (§6.9).

## A.5 Memory and Data-Movement Terms

**Working set.** The state that must be accessible over a specified execution interval. A working-set claim must identify the interval and include weights, activations, caches, metadata, temporary buffers, and replicated or sharded state as applicable.

**Reuse distance.** The amount of distinct data accessed between two uses of the same data. It describes temporal locality independently of one particular cache configuration.

**Cache.** Hardware-managed storage using tags and a replacement policy to retain recently or predictively useful data. A cache provides probabilistic average locality, not guaranteed residency.

**Scratchpad.** Software- or compiler-managed local memory with explicit allocation and movement. A scratchpad trades automatic placement for predictability and controllable capacity.

**SRAM.** Static random-access memory, normally used on die for registers, caches, scratchpads, and distributed local storage. Capacity, porting, banking, and wiring costs prevent treating aggregate SRAM bandwidth as one uniformly accessible resource.

**DRAM.** Dynamic random-access memory used for larger-capacity tiers. DDR, LPDDR, GDDR, and HBM differ in interface, packaging, energy, bandwidth, and target envelope.

**HBM.** High Bandwidth Memory: stacked DRAM connected through a wide interface, typically placed beside accelerator logic through advanced packaging. HBM capacity and bandwidth are per stack or package only when so labeled.

**Unified memory.** An overloaded term that shall be qualified. It may mean shared physical memory used by several SoC engines, a unified virtual address space across distinct physical memories, or a managed migration system. These have different latency, consistency, copying, and capacity behavior.

**Memory bandwidth.** Bytes transferred per second at a named interface and direction. Peak pin bandwidth, sustained application bandwidth, aggregate bank bandwidth, and useful operand bandwidth are different quantities.

**Memory latency.** Time from an access request at a named boundary to the required response. Aggregate bandwidth does not imply low latency for dependent accesses.

**Memory-bound.** Limited by a specified memory property—capacity, bandwidth, latency, useful bytes per transaction, locality, translation, consistency, or energy. The term must name the boundary and mechanism.

**KV cache.** Transformer inference state containing key and value representations for previously processed tokens. For fixed model dimensions and precision, its capacity grows approximately linearly with active sequence length and request count.

**Coherence.** A mechanism maintaining defined visibility and ordering of shared memory across agents. Coherence does not imply uniform latency or free data movement.

## A.6 Performance, Scaling, and Service Terms

**Operational intensity.** Useful arithmetic operations divided by bytes transferred at a specified memory boundary. It is not an intrinsic constant of a model: tiling, fusion, batching, precision, cache residency, and the chosen boundary change it.

**Arithmetic intensity.** Often used synonymously with operational intensity. In this survey, operational intensity is preferred when emphasizing useful application work and a measured boundary.

**Peak performance.** Theoretical arithmetic rate under stated precision, sparsity, and operation assumptions. Peak performance is a ceiling, not a prediction.

**Attainable performance.** The lesser of the relevant compute ceiling and bandwidth multiplied by operational intensity under a Roofline model. Real execution may fall below both because of dependencies, latency, imbalance, instruction mix, scheduling, and communication.

**FLOP.** A floating-point operation. Whether a fused multiply-add counts as one or two FLOPs must be stated when it affects a comparison.

**FLOPS.** Floating-point operations per second. Capitalization distinguishes the rate from the operation count.

**TOPS.** Tera operations per second. A TOPS value is uninterpretable across products unless the operation, precision, sparsity assumption, and comparison level are stated.

**Token throughput.** Tokens completed per second at a stated boundary. It must identify model, phase or end-to-end path, input/output lengths, batch or concurrency, quality method, latency constraint, and whether the value is per sequence, device, node, or service.

**Time to first token (TTFT).** Elapsed time from the chosen request boundary to availability of the first generated token. It commonly includes queueing and prefill when measured at the service boundary.

**Inter-token latency (ITL).** Time between successive generated tokens for a request, reported as a distribution when service conditions vary.

**Throughput.** Completed work per unit time at a stated boundary. Throughput without quality, latency, and admission conditions is incomplete for a service.

**Goodput.** Correct, accepted, in-objective work per unit time after failed work, retries, and recovery are accounted for.

**Utilization.** A vector rather than one number: arithmetic occupancy, memory utilization, fabric utilization, temporal activity, capacity residency, and useful-result utilization may differ (§4.3).

**Scaling efficiency.** Useful performance on \(N\) resources divided by \(N\) times useful performance on one comparable resource, under the same problem and measurement boundary.

**Scale-up.** Connecting accelerators within a tightly coupled domain intended to support high-bandwidth, low-latency communication and often load/store or collective semantics.

**Scale-out.** Connecting nodes or pods through a network to expand capacity or throughput, usually with higher latency and a larger failure domain than on-package or scale-up links.

**Tail latency.** A high percentile of an end-to-end latency distribution. The percentile, arrival process, load, and admission policy must be stated.

**SLO.** A service-level objective specifying required behavior such as latency, availability, throughput, or quality. It is an engineering constraint, not a benchmark decoration.

**Determinism.** A qualified property. It may mean repeatable numerical results, fixed instruction timing, bounded response, fixed communication schedule, or reproducible execution order. These are not interchangeable.

## A.7 Power, Energy, Reliability, and Economics

**Power.** Energy per unit time, measured at a stated boundary and operating condition. Package power, board power, rack power, and facility power are not interchangeable.

**Energy per useful result.** Total energy inside the chosen system boundary divided by correct, accepted work. It may include compute, memory, communication, idle, wake, cooling, and failed work.

**Thermal design power or thermal envelope.** A design and cooling boundary, not automatically measured workload power. Sustained performance claims should be made at thermal equilibrium.

**SWaP-C.** Size, weight, power, and cost. The components must be evaluated jointly for constrained systems rather than reduced to a synonym for low power.

**Wake scope.** The hardware and memory domains that must leave a low-power state to complete a function. Kernel energy can be a small part of system energy when wake scope is large.

**Reliability.** Probability of correct operation over a stated interval and environment.

**Availability.** Fraction of required service time during which the system can deliver the objective.

**Serviceability.** Ability to diagnose, isolate, repair, replace, or update a system while managing downtime and risk.

**Failure domain.** The set of work or service capacity affected by one fault or maintenance action.

**Total cost of ownership (TCO).** Lifecycle cost within a named accounting boundary. Hardware purchase price alone is not TCO; software enablement, integration, energy, facilities, operations, support, failure headroom, supply risk, and flexibility may be material.

**Cost per useful unit.** Fully loaded lifecycle cost divided by useful tokens, requests, training results, control cycles, or other accepted outcomes. The denominator must reflect quality and service objectives.

**Specialization budget.** The area, engineering, software, validation, operational, and flexibility cost an organization can spend to narrow a hardware contract (§4.6).

**Hardware-necessity test.** The four-condition decision structure of §2.14: a residual bound remains after reasonable software work; it causes a material consequence; a hardware lever changes the bound; and lifetime benefit exceeds complete transition cost and risk.

## A.8 Deployment and Product-Status Terms

**Hyperscale.** Owner-operated infrastructure at sufficient workload volume and organizational scale to co-design models, software, networks, and hardware and to amortize large fixed costs.

**Enterprise or private infrastructure.** Organization-operated compute serving internal or controlled workloads, commonly with lower and more variable demand, longer lifecycles, smaller operations teams, and stronger governance constraints than hyperscale.

**Non-mobile edge.** Infrastructure deployed near data sources or users but outside a battery-powered personal device, spanning compact servers, appliances, industrial systems, and access-network sites.

**Client.** A user-facing personal computing device such as a workstation, desktop, laptop, tablet, or phone. Client workloads share power, memory, and responsiveness constraints with the rest of the device.

**Embedded system.** A computing system integrated into a larger product or process, commonly with bounded resources, long lifecycle, fixed interfaces, or environmental constraints.

**Automotive or robotic system.** An embedded cyber-physical system in which perception interacts with planning, control, actuation, safety, timing, and certification obligations.

**AI PC.** A market and platform category for a personal computer with an integrated, software-exposed NPU meeting a platform owner’s current certification requirements. It is not a distinct microarchitecture.

**Evidence class A—shipping and verified.** Shipping hardware with public documentation and meaningful verification.

**Evidence class B—officially announced.** Officially announced hardware with specifications or architectural disclosure.

**Evidence class C—publicly disclosed development.** Prototype, research, patent, conference, or confirmed development evidence.

**Evidence class D—credibly reported.** Reputable reporting without sufficient primary disclosure to treat the claim as established product fact.

**Evidence class E—speculative or moonshot.** Early concepts or weakly documented projections confined to explicitly forward-looking analysis.

**Comparison level.** The physical and operational boundary of a metric: die, package, board, module, node, rack, pod, appliance, device, or cluster. Metrics at different comparison levels shall not be placed in one ranking without normalization and explanation.

## A.9 Units and Reporting Conventions

- Use **bit** and **byte** explicitly; \(1\) byte \(=8\) bits.
- Use **Gb/s** or **Gbps** for gigabits per second and **GB/s** for gigabytes per second. Do not infer one from the other without accounting for encoding and protocol overhead where relevant.
- Use **GB** for decimal vendor capacities and **GiB/MiB** for binary capacities when the source reports them that way. Do not silently convert one convention into the other.
- State whether a link bandwidth is per direction, bidirectional aggregate, per link, per device, or per fabric.
- State whether memory bandwidth is peak, measured sustained, or useful application bandwidth.
- State precision and sparsity assumptions beside FLOPS or TOPS.
- State whether power is typical, maximum, thermal-design, package, board, rack, or facility power.
- State the snapshot date for product and market tables.
- Prefer approximate markers (\(\approx\), “roughly,” “on the order of”) when inputs are rounded or vendor-reported.

These conventions are part of the evidence boundary, not editorial cosmetics: a correct number attached to the wrong level, direction, or unit is an incorrect architectural claim.
