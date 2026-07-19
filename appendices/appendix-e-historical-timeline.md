# Appendix E. Historical Timeline

## E.1 Purpose and Selection Rule

This timeline records milestones that explain the survey’s two transitions or establish one of its enduring architectural contracts. It is deliberately selective. A product launch belongs here only when it demonstrates a new relationship among workloads, software, execution, memory, communication, or deployment—not merely because it improved a specification.

Dates refer to publication, disclosure, or documented deployment as stated. A milestone may have antecedents; the entry identifies why this particular point matters to the survey. Sources are cited through the consolidated chapter reference groups.

## E.2 Foundations Before Modern AI Acceleration

### 1967 — Amdahl formalizes the limit of partial acceleration

Gene Amdahl’s speedup argument established that accelerating one fraction of a workload leaves the remainder as a system bound [5.2]. The modern heterogeneous interpretation is broader than the original fixed-workload formula: host work, transfers, synchronization, and queueing change when a graph is partitioned. The enduring lesson is that a fast accelerator does not define application speed.

### 1982 — Systolic architectures make communication geometry explicit

H. T. Kung’s systolic argument described arrays in which data advances rhythmically through local processing elements [3.1]. The contribution was not one neural-network chip but a reusable answer to the data-movement problem: schedule and reuse can be embedded in physical geometry.

### 1995 — The “memory wall” names a widening architectural gap

Wulf and McKee described the increasing fraction of execution time processors could spend waiting for memory [1.1]. Cache hierarchies, prefetching, wider interfaces, and NUMA systems mitigated the gap without eliminating the underlying locality and movement problem.

### 2006–2007 — Reconfigurability and energy proportionality clarify two costs

Kuon and Rose quantified the density, speed, and power gap between FPGA fabric and ASIC implementation [6.4], establishing the price of post-manufacturing flexibility. Barroso and Hölzle argued that datacenter systems should consume energy in proportion to useful load [1.4], an idea that later reappeared in inference-fleet and mobile wake-scope analysis.

## E.3 First Transition: CPU-Centered Optimization to GPU Acceleration

### 2007–2008 — Unified GPU computing and CUDA expose a scalable platform

The Tesla architecture and CUDA programming model turned programmable GPU execution into a general kernel platform with thread hierarchies, memory spaces, synchronization, and a host runtime [5.4][5.5]. This was not the first programmable GPU work, but it established the contract that software libraries and frameworks could accumulate around.

### 2012 — AlexNet demonstrates the workload–platform match

AlexNet’s training on GPUs made visible the fit between deep convolutional networks and programmable throughput hardware [1.9]. Large dense tensors, repeated operations, and sufficient parallelism could exploit a platform already supported by graphics volume and a growing software ecosystem.

### 2014 — Libraries and fleet reconfigurability broaden acceleration

cuDNN showed how tuned reusable primitives could convert GPU architecture into framework-level performance [5.6]. Microsoft’s Catapult demonstrated production FPGA deployment inside datacenter services [6.3], establishing reconfigurable fabric as infrastructure rather than a laboratory-only technology. TrueNorth demonstrated million-neuron neuromorphic scale [6.11], while remaining outside the mainstream dense-training path.

### 2015 — Near-sensor computing and internal TPU deployment separate two specialization pressures

ShiDianNao showed the benefit of moving vision computation close to sensor data [1.11]. In the datacenter, Google deployed the first TPU internally, later documented as a response to production inference volume and tail-latency constraints [1.12]. The two systems sit at opposite ends of the compute continuum but share the same logic: move computation toward the state and objective that dominate the deployment.

### 2016 — Eyeriss turns neural-accelerator dataflow into a comparable design problem

Eyeriss demonstrated an energy-efficient spatial architecture and helped establish systematic reasoning about where weights, activations, and partial sums should remain stationary [1.10]. The contribution was a data-movement methodology, not a claim that one dataflow dominates every workload.

## E.4 Second Transition: GPU Optimization to Specialized AI Contracts

### 2017 — TPU v1, transformers, Volta, and the dual path of specialization

The TPU v1 paper reported a 256×256 matrix unit, software-managed memory, deterministic execution, and production latency-driven results [1.12]. *Attention Is All You Need* introduced the transformer architecture that would later reshape both training and serving [1.15]. NVIDIA Volta integrated tensor cores into a programmable GPU [5.8]. Together these events established the second transition’s lasting pattern: specialization appears both as a separate architecture and as a mechanism absorbed into the GPU platform.

### 2018 — Compiler and reconfigurable-serving systems mature

TVM separated computation from schedules and used automated search to map models across hardware [3.6]. Mixed-precision training demonstrated that narrow arithmetic could be adopted without treating all numerical state identically [3.4]. Project Brainwave used an FPGA soft NPU with pinned weights for real-time batch-one serving [6.2]. Loihi demonstrated programmable neuromorphic manycore execution with on-chip learning [6.12].

### 2019 — Mapping and collective models become reusable infrastructure

Timeloop and data-centric mapping work made reuse, performance, and hardware cost comparable across accelerator organizations [3.2][3.3]. BlueConnect decomposed all-reduce against heterogeneous network hierarchies [3.9]. Together they marked a shift from describing accelerators as blocks to modeling the mappings and communication algorithms that determine achieved system behavior.

### 2020 — Irregular workloads and deterministic tensor streaming receive explicit architectures

HyGCN combined dense and sparse organizations for graph convolution [2.6], illustrating why graph workloads resist one homogeneous engine. Groq’s peer-reviewed TSP disclosure removed caches and dynamic scheduling from a distributed-SRAM architecture whose compiler owns placement and timing [5.10]. These systems attacked different parts of the GPU efficiency envelope: dynamic irregularity and deterministic low-latency execution.

### 2021 — Training TPUs, PIM, and formal mapping infrastructure broaden the family landscape

The TPUv2/v3 design retrospective documented the move from inference-only specialization to HBM-backed training systems with dedicated interconnect [6.1]. Aquabolt-XL demonstrated HBM-based processing-in-memory and a mobile LPDDR direction [6.8]. MLIR’s published architecture and Timeloop/data-centric mapping work made compiler and dataflow analysis more reusable across accelerator families [3.2][3.3][3.7].

### 2022 — IO-aware attention and deterministic transformer serving expose software’s ceiling

FlashAttention showed that disciplined tiling could produce large gains by reducing HBM traffic without approximating attention [2.2]. Groq’s BERT work showed batch-one transformer execution on the deterministic TSP [6.6]. These are complementary evidence for the survey’s “software before hardware” rule: software must first remove avoidable movement; architecture becomes relevant at the compulsory traffic and scheduling bound that remains.

### 2023 — Serving memory, rack-scale TPU systems, internal accelerators, and all-SRAM inference converge

PagedAttention applied virtual-memory ideas to KV-cache allocation and materially improved serving throughput [2.3]. TPU v4 documented an optically reconfigurable 4,096-chip ML supercomputer with embedding-specific hardware [2.24]. MTIA’s peer-reviewed disclosure documented internal recommendation silicon [1.17]. NorthPole demonstrated distributed all-SRAM inference with a carefully bounded same-node comparison [6.10]. Hopper-class GPUs embodied the absorption path through FP8, tensor cores, asynchronous movement, structured sparsity, and fourth-generation NVLink [5.9].

### 2024 — Wafer-scale generation and merchant consolidation sharpen condition 4

Cerebras disclosed WSE-3 with four trillion transistors, roughly 900,000 cores, 44 GB on-wafer SRAM, and 21 PB/s aggregate on-wafer bandwidth [6.7]. Graphcore’s acquisition by SoftBank followed the earlier Nervana cancellation record [2.22][2.23], reinforcing the survey’s distinction between architectural merit and the software, distribution, capital, and timing needed for independent merchant survival.

## E.5 Landscape Snapshot: 2025–Mid-2026

The following entries are lower-stability evidence and inherit Chapters 7–8’s snapshot caveat.

### 2025 — Rack-scale systems and inference-first roadmaps dominate disclosure

GPU products increasingly arrived as liquid-cooled, coherent rack-scale systems rather than isolated cards. HBM capacity, package bandwidth, narrow precision, and scale-up domain size became the visible axes of competition. Trainium3 and the continuing TPU lineage reinforced the internal tensor-processor model [7.1]–[7.5].

### 2025 — Client NPUs become a platform requirement rather than an optional block

Copilot+ certification fixed a 40+ TOPS market floor, while Apple, Qualcomm, Intel, and AMD continued integrating NPU paths alongside CPU and GPU resources [8.1]–[8.4]. The architectural significance is not the nominal rating; it is that OS runtimes, curated models, and graph partitioning became standard client platform layers.

### 2026 — Inference-first silicon makes phase specialization explicit

Microsoft Maia 200 emphasized inference, large on-chip SRAM, HBM bandwidth, and Ethernet scale-out [7.6]. Ironwood’s positioning and reporting of future training/inference splits extended the workload distinction of §2.5 into roadmap organization [7.4]. The stable conclusion is that serving telemetry now shapes silicon budgets; individual roadmap details remain snapshot facts.

### 2026 — Challenger value resolves through ownership and contracting structures

Reported licensing, acquisition discussions, anchor-tenant agreements, and financing events around Groq, Tenstorrent, and Cerebras are class-D evidence [7.7]–[7.9]. They should not be treated as architectural validation by transaction value alone. Their analytical importance is that specialized hardware increasingly reaches deployment through incumbent platforms, hyperscaler ownership, cloud rental, appliances, or anchor contracts rather than through broad standalone merchant replacement.

### 2026 — Packaging, fabrics, and optics become first-class product constraints

HBM allocation, advanced-packaging capacity, liquid cooling, UALink, Ultra Ethernet, and co-packaged optics moved into the architecture decision boundary described in Chapter 10. This is the physical culmination of the timeline: after software and silicon expose compulsory movement, the package, rack, and facility become the next design units.

## E.6 The Timeline’s Architectural Reading

Five patterns recur across the milestones:

1. **Software succeeds before architecture changes.** Vectorization, GPU kernels, libraries, IO-aware attention, paging, and compilers recover large gains before residual bounds justify new contracts.
2. **The platform absorbs specialization.** Tensor cores, narrow precision, structured sparsity, asynchronous movement, graph execution, and scale-up fabrics moved into GPUs.
3. **Separate families survive where the contract cannot be absorbed cheaply.** Wake-scope energy, near-sensor locality, compiler-owned deterministic time, model-scale SRAM, and in-memory execution define more durable territory.
4. **Deployment volume decides industrial outcomes.** TPU and MTIA succeed inside owner-scale portfolios; merchant challengers face software and distribution barriers even when the architecture works.
5. **The unit of architecture expands.** The historical unit moves from core to device, package, rack, appliance, and facility as memory, communication, power, cooling, and supply become binding.

The timeline therefore does not describe a sequence of universal replacements. It describes a repeated negotiation between a broad platform that absorbs valuable mechanisms and narrower contract-changing systems that hold deployment-specific ground.
