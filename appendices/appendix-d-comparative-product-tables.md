# Appendix D. Comparative Product Tables

## D.1 Scope, Snapshot, and Evidence Rules

This appendix expands the compact landscape tables in Chapters 7 and 8. It is a **mid-2026 draft snapshot**, not a purchasing guide. Product status and market events age faster than the architectural analysis; every revision should re-check official documentation and re-grade evidence classes.

The tables obey four rules:

1. Products are organized by architectural family and deployment role, not by a universal ranking.
2. A blank cell means the manuscript lacks a sufficiently comparable public value; it does not mean zero.
3. Vendor arithmetic ratings are omitted where precision, sparsity, or comparison boundaries would make them misleading.
4. Package, node, rack, appliance, SoC, and device quantities are never treated as the same comparison level.

Evidence classes follow Appendix A and the Charter: A shipping and verified; B officially announced; C publicly disclosed development; D credibly reported; E speculative.

## D.2 Datacenter and Enterprise Accelerators

### Table D.1 — GPU-platform products

| Product/system | Status | Comparison level | Fast memory | Documented bandwidth | Scale unit | Fabric direction | Software contract | Architectural reading |
|---|---:|---|---|---:|---|---|---|---|
| NVIDIA Blackwell Ultra B300-class | A/D | package within NVL rack | 288 GB HBM3e | ~8 TB/s per package | 72-GPU NVLink rack | proprietary scale-up; InfiniBand/Ethernet scale-out | CUDA platform | GPU baseline with absorbed narrow precision, scale-up, and serving features |
| AMD Instinct MI355X | A | package; 8-GPU node | 288 GB HBM3e | 8 TB/s per package | 8-GPU node; larger rack direction | Infinity Fabric plus Ethernet | ROCm/HIP | merchant GPU alternative; platform maturity and distributed tuning remain decisive |
| AMD Instinct MI400 | B | announced package/rack | 432 GB HBM4 | ~19.6 TB/s announced | 72-GPU Helios reference rack | Infinity Fabric/Ethernet; UALink direction | ROCm | announced memory-capacity and rack-scale response |

**Interpretation.** These rows are differentiated primarily by memory capacity, bandwidth, scale-up domain, software, and deployment model. Peak arithmetic is not the discriminating architectural quantity. The NVIDIA row’s product boundary increasingly includes the rack; the AMD rows must be evaluated against delivered system and software behavior rather than package specifications alone [7.1]–[7.3].

### Table D.2 — Hyperscaler tensor processors

| Owner/product | Status | Primary role | Fast memory | Bandwidth | Scale unit | Fabric | Software stack | Availability |
|---|---:|---|---|---:|---|---|---|---|
| Google TPU v7 Ironwood | A/B | inference-emphasized tensor processing | ~192 GB HBM | ~7.4 TB/s/chip | 9,216-chip-class pod | proprietary with OCS lineage | XLA/JAX | internal and cloud rental |
| AWS Trainium3 | A | training and token economics | 144 GB HBM3e | ~4.9 TB/s/chip | 144-chip UltraServer | NeuronSwitch | Neuron SDK | internal and cloud rental |
| Microsoft Maia 200 | A/B | inference-first | 216 GB HBM3e + 272 MB SRAM | ~7 TB/s/chip | ~6,144-accelerator cluster | standard Ethernet scale-out | Microsoft/ONNX-integrated path | internal; external interest class D |
| Meta MTIA, current disclosed lineage | A/C | recommendation and internal inference/training evolution | generation-dependent | — | rack-scale | Ethernet lineage | PyTorch-integrated | internal |

**Interpretation.** These are vertically integrated hardware–compiler–fleet products. Their strongest evidence is multi-generation deployment, not one benchmark. Internal workload volume satisfies the fixed software and design costs that make the same contract difficult for a merchant challenger (§6.3, §7.2).

### Table D.3 — Dataflow, tile, wafer-scale, and memory-tier challengers

| Product/system | Status | Family | Fast/local memory | Local bandwidth | Scaling form | Software | Deployment model | Principal trade |
|---|---:|---|---|---:|---|---|---|---|
| Groq TSP / LPU lineage | A architecture; D market event | deterministic dataflow | 220 MiB SRAM per TSP die (~230 MB decimal) | ~80 TB/s aggregate on die | compiled multi-chip fabric | Groq compiler | rack/service; reported licensing into incumbent | exchanges HBM bandwidth for SRAM capacity and multi-chip placement |
| Cerebras WSE-3 / CS-3 | A/B | wafer-scale | 44 GB on-wafer SRAM | ~21 PB/s on wafer | wafer plus external memory appliances; appliance cluster | Cerebras SDK | appliance and hosted service | collapses many device boundaries; pays wafer power, cooling, and appliance granularity |
| SambaNova SN40L | A/B | reconfigurable dataflow plus tiered memory | ~520 MB SRAM + 64 GB HBM + 1.5 TB DDR/socket | tier-dependent | multi-socket system | SambaFlow | enterprise appliance | buys capacity composition at software and appliance cost |
| Tenstorrent Blackhole p150a | A product; D market event | programmable tile processor | 32 GB GDDR6 | — | Ethernet mesh | open developer stack | merchant card/system | trades strict determinism for tile programmability and open scaling |
| IBM NorthPole | C/peer-reviewed prototype | all-SRAM near-memory inference | 224 MB distributed SRAM | architecture-local aggregate | single die in published work | research toolchain | research/development | exceptional fit for models resident on die; hard capacity cliff |

**Interpretation.** “Fast memory” is not one comparable tier across these rows. On-die aggregate SRAM bandwidth is distributed and local; HBM bandwidth is package-interface bandwidth; wafer bandwidth applies across a much larger physical boundary. The comparison is architectural, not a normalized performance ranking.

## D.3 Architecture-Family Comparison

### Table D.4 — Contract and envelope matrix

| Family | Time resolved | Primary state residence | Best-fit signatures | Fallback or miss behavior | Strongest deployment | Dominant adoption risk |
|---|---|---|---|---|---|---|
| GPU | runtime hardware scheduling | registers/cache/HBM | broad parallel portfolios; training; prefill; flexible inference | co-resident SIMT path; host for system work | all scales, strongest datacenter/workstation | efficiency under narrow, irregular, or underfilled work |
| Tensor processor | mostly compile time | SRAM buffers + HBM | stable dense portfolios at owner scale | host or compiler coverage cliff | hyperscale; smaller curated edge forms | workload drift and software stack |
| Deterministic tile/dataflow | compile-time placement/routing/time | distributed SRAM, sometimes added HBM/DDR tiers | low-batch stable inference; reproducibility | padding, variants, boundary handling | datacenter/enterprise appliance | dynamic shapes and software capital |
| NPU/microNPU | graph compile plus OS policy | local SRAM + shared LPDDR/flash | client inference; always-on; camera pipelines | CPU/GPU/DSP fallback with wake/copy tax | client, mobile, embedded, automotive | operator coverage |
| FPGA/reconfigurable | design time or overlay compile | BRAM plus attached memory | streaming, interface-adjacent, novel formats | remap, overlay, or host | infrastructure and long-lifecycle embedded | tools, skills, density, compilation |
| Wafer-scale | compile-time mesh placement | on-wafer distributed SRAM | communication-heavy training/scientific AI | external memory/appliance scale-out | datacenter appliance | ecosystem and appliance economics |
| PIM/near-memory | host-orchestrated placement | in/beside memory | gather, reduction, weight streaming | host/accelerator path | potential across continuum | programming and memory standards |
| Neuromorphic | input/event driven | synaptic local state | sparse-in-time sensory workloads | conventional processor boundary | extreme edge/research | lack of mainstream workload mapping |

## D.4 Client and Edge Platforms

### Table D.5 — AI-PC and client SoC positions

| Platform lineage | Status | NPU position | Memory organization | Other AI-capable engines | Software path | Architectural distinction | Public-evidence limitation |
|---|---:|---|---|---|---|---|---|
| Qualcomm Snapdragon X2 Elite-class | A vendor disclosure | ~80+ nominal TOPS class | on-package LPDDR5X configurations up to 128 GB | CPU, GPU, DSP | Windows ML/vendor EP; Qualcomm tooling | high nominal NPU width and large client memory configurations | cross-vendor TOPS and sustained bandwidth require controlled comparison |
| Intel Panther Lake-class | A/D | ~50 nominal TOPS class | shared client memory | CPU with vector/matrix features; GPU; media | Windows ML, OpenVINO lineage | heterogeneous x86 client integration | current rating evidence in manuscript is partly class D |
| AMD Ryzen AI 400-class | A/D | ~60 nominal TOPS class | shared client memory | CPU, integrated GPU | Windows ML, Ryzen AI/ROCm-related tooling | CPU/GPU/NPU portfolio integration | current rating evidence in manuscript is partly class D |
| Apple M5 family | A vendor disclosure | 16-core neural-engine lineage | unified physical memory; Pro/Max bandwidth emphasis | CPU, GPU with per-core neural acceleration, media | Core ML and curated on-device models | neural capability distributed across NPU and GPU plus unified memory | vendor claims; no cross-platform useful-coverage table yet |

**Interpretation.** Nominal TOPS is retained only as market-position context. The meaningful comparison requires model coverage, sustained thermal behavior, usable memory bandwidth, residency, fallback, latency, and energy. Figure 8.1 remains pending because these inputs are not yet public at a sufficiently uniform boundary.

### Table D.6 — Mobile, embedded, robotics, and automotive roles

| Segment | Representative evidence anchors | Compute organization | Memory path | Binding objective | Correct comparison boundary |
|---|---|---|---|---|---|
| Flagship mobile SoC | Apple/Qualcomm/Google-class heterogeneous SoCs | CPU + GPU + NPU + DSP/ISP/media | shared LPDDR, local engine SRAM, power domains | battery, skin temperature, responsiveness, privacy | complete device task at thermal equilibrium |
| microNPU/always-on | Arm Ethos-U55; sub-mW wake-word silicon | offline-compiled matrix/vector engine beside MCU | local SRAM/flash; optional DRAM avoidance | wake scope, milliwatts, component cost | complete sensing function including wakeups |
| Industrial/embedded edge | licensed NPU IP, FPGA, compact accelerator modules | heterogeneous fixed and programmable engines | local DDR/LPDDR plus explicit SRAM | SWaP-C, environment, lifecycle | deployed product or control subsystem |
| Robotics | Jetson Thor-class modules plus real-time controllers | GPU/NPU perception above deterministic control | high-bandwidth module memory plus sensor I/O | throughput, latency distribution, mission energy, safety partition | closed perception–planning–control loop |
| Automotive | Drive AGX Thor-class; automotive NPUs | high-throughput perception with isolated safety domains | high-bandwidth memory and qualified interconnect | worst-case timing, isolation, homologation, lifecycle | qualified vehicle compute platform, not chip TOPS |

## D.5 Software and Deployment Comparison

### Table D.7 — Ecosystem contract

| Platform | Authoring waist | Kernel/operator layer | Distributed/serving layer | Fallback behavior | Portability risk |
|---|---|---|---|---|---|
| NVIDIA GPU | PyTorch/JAX/frameworks | CUDA, cuBLAS/cuDNN, Triton ecosystem | mature collectives, serving, profiling, operations | graceful on co-resident programmable cores | proprietary distributed and operational residue |
| AMD GPU | same major frameworks | ROCm/HIP, vendor libraries, Triton direction | improving distributed/serving integration | programmable GPU path | long-tail tuning and operational maturity |
| TPU | TensorFlow/JAX/PyTorch bridges | XLA and TPU libraries | pod/fleet integration | host or unsupported-lowering boundary | vertically integrated stack and cloud availability |
| AWS Trainium | major framework integrations | Neuron compiler/libraries | UltraServer and AWS service integration | compiler/host boundary | cloud-specific tooling |
| NPU client stacks | OS/framework APIs | execution providers/Core ML/vendor compilers | OS scheduling and curated model tier | CPU/GPU/DSP subgraphs | operator coverage and vendor-specific mapping |
| Deterministic/dataflow | framework import | load-bearing whole-model compiler | vendor serving stack | padding, variants, or host boundary | vendor compiler and model-change risk |

## D.6 Procurement and Review Checklist

Before promoting any row into a procurement comparison, add:

1. exact source date and product status;
2. comparison level for every metric;
3. precision, sparsity, and operation counted by arithmetic ratings;
4. peak and measured sustained memory bandwidth;
5. per-direction and aggregate convention for links;
6. model, sequence, batch, concurrency, latency, and quality conditions;
7. complete power boundary and sustained thermal condition;
8. software version, compiler path, operator coverage, and fallback;
9. failure-domain, serviceability, and spare-capacity assumptions;
10. price and availability at the buyer’s actual volume.

Until those fields are populated, these tables support architectural orientation only. Their durable result is the comparison structure: state residence, time resolution, fabric, software contract, deployment boundary, and risk remain useful after every product row expires.
