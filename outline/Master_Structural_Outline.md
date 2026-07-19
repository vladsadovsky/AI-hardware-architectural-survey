# Survey of Modern AI Compute Accelerator Hardware

## Master Structural Outline (Architecture-First, Workload-Driven)

**Core Narrative**

AI Workloads → Software Optimization → Architectural Bottlenecks →
Hardware Innovations → Commercial Systems → Deployment Across the AI
Compute Continuum → Future Directions

------------------------------------------------------------------------

# Preface

-   The two architectural transitions motivating the study
-   Purpose: connect workloads, software-visible bottlenecks,
    architectural responses, and commercial implementations
-   Workload and systems concerns covered by the survey
-   AI compute continuum and architecture-first treatment of products
-   Survey deliverables, evidence separation, intended audience, and
    reading roadmap

------------------------------------------------------------------------

# Chapter 1. Historical Context and Architectural Transitions

-   Concise historical context for modern AI acceleration
-   The two architectural transitions
    -   CPU software optimization → GPU acceleration
    -   GPU software optimization → Domain-specific accelerators
-   Software optimizations preceding each transition
-   Architectural, physical, energy, and economic limits exposed by
    those optimizations
-   Why specialization produced multiple accelerator families rather
    than a single successor architecture

**Engineering Takeaways**

------------------------------------------------------------------------

# Part I --- Understanding the Problem

## Chapter 2. Computational Characteristics of Modern AI Workloads (Cornerstone Chapter)

Goal: Explain AI workloads from a systems engineering perspective.

Analytical framework:

-   Workload-signature taxonomy based on computation, memory and access
    structure, temporal behavior, communication, and deployment constraints
-   Optional stochastic-process formalization deferred to an appendix
-   Conditional hardware-necessity test: residual technical bound, direct
    consequence, hardware lever, and lifecycle economic threshold

For each workload:

- Computational characteristics
- Software optimization techniques
- Why software eventually stops scaling
- Architectural bottlenecks
- Emerging hardware responses
- Remaining research challenges

Workloads:

-   Dense training
-   Fine tuning
-   Transformer inference
-   Prefill
-   Decode
-   CNNs
-   Vision Transformers
-   Diffusion
-   Recommendation
-   Retrieval / Vector Search
-   Sparse computation
-   Mixture of Experts
-   Graph AI
-   Scientific AI
-   Robotics
-   Multimodal AI
-   Edge inference
-   Always-on mobile AI

Cross-cutting bottlenecks:

-   Cache locality
-   Memory hierarchy
-   Arithmetic intensity
-   Memory movement
-   Sparse matrices
-   Irregular execution
-   Branch divergence
-   Communication
-   Synchronization
-   Load balancing
-   KV cache
-   Thermal constraints
-   Battery constraints
-   Energy efficiency
-   SWaP-C

Transition synthesis:

-   GPU efficiency envelope and workload phases that fall outside it
-   Future-workload stress test, including predictive world models
-   Reusable architectural principles and divergent implementations across
    datacenter, enterprise, non-mobile edge, mobile, and embedded systems

Representative deployment analysis:

Phone → Laptop → Workstation → Enterprise Edge → Datacenter →
Hyperscaler

**Engineering Takeaways**

------------------------------------------------------------------------

## Chapter 3. Fundamental Architectural Principles

Goal: Translate Chapter 2 workload signatures into the architectural
contracts used to reason about hardware, without selecting product families.

-   Workload signatures mapped to execution, data-placement, numerical,
    scheduling, communication, and software contracts
-   Execution models
    -   Scalar and superscalar
    -   Vector and SIMD
    -   SIMT
    -   Spatial and dataflow
    -   Systolic, reconfigurable, and fixed-function structures
    -   Heterogeneous combinations
-   Parallelism as a multidimensional property
    -   Instruction, data, thread, task, and pipeline parallelism
    -   Model, data, device, and fleet-level parallelism
    -   Available parallelism versus provisioned execution width
-   Dataflow and mapping
    -   Spatial and temporal mapping
    -   Stationary and streaming dataflows
    -   Dense, sparse, graph, and routed workloads
-   Memory-system contracts
    -   Capacity, bandwidth, latency, locality, and placement
    -   Caches, scratchpads, registers, and distributed local state
    -   Shared, unified, coherent, and virtual memory
-   Precision as a storage, arithmetic, accumulation, conversion, and
    numerical-quality contract
-   Static, dynamic, and hybrid scheduling
-   Compiler, runtime, driver, firmware, and operating-system interaction
-   On-chip, device, package, collective, and system communication
-   Architectural-contract comparison across the AI compute continuum

**Engineering Takeaways**

------------------------------------------------------------------------

## Chapter 4. Architectural Stressors and Design Tradeoffs

Goal: Apply Chapter 3's architectural vocabulary to interacting system
stressors and make the cost of each architectural response explicit, while
deferring architecture-family and product comparison to Chapters 5 and 6.

Required analytical chain:

Real-world scenario → Workload behavior → Software mitigation → Residual
architectural limit → Direct consequence → Architectural response → New
tradeoff

Topics:

-   Interaction among stressors; useful utilization versus nominal activity
-   Data movement, locality, and useful sustained bandwidth
-   Parallelism, utilization, latency, and queueing
-   Synchronization, communication, and scalability
-   Determinism, dynamism, control, and bounded execution
-   Programmability, portability, and the specialization budget
-   Energy, power, and thermal constraints
-   Reliability, availability, serviceability, and safety
-   Silicon, system, lifecycle, and flexibility economics
-   Stressor priorities and response costs across the AI compute continuum
-   Design questions that lead to architecture families without surveying
    their current commercial implementations

**Engineering Takeaways**

------------------------------------------------------------------------

# Part II --- Architecture Families

## Chapter 5. CPUs and GPUs

Goal: Establish the CPU–GPU system as the broad programmable baseline,
explain why GPU computing became the dominant general AI acceleration
platform, and define the conditional efficiency and economic limits that
motivate Chapter 6.

-   CPU and GPU architectural centers of gravity
-   Modern CPUs
    -   Dynamic scheduling, prediction, caches, coherence, and system role
    -   Vector and matrix extensions
    -   Multicore, NUMA, and heterogeneous cores
    -   CPU roles in end-to-end AI paths
-   Evolution of GPU computing
    -   Fixed and programmable graphics pipelines
    -   Unified programmable architectures and general kernels
    -   AI-era matrix operations and system scaling
-   GPU architectural contract
    -   Hierarchical parallelism and SIMT
    -   Latency tolerance, residency, and occupancy
    -   Coalescing, locality, and memory hierarchy
    -   Matrix specialization within a programmable GPU
-   CUDA as a platform
    -   Programming and execution model
    -   Compatibility, libraries, compilers, frameworks, and tools
    -   Software capital, portability, and operational maturity
-   Why GPUs became the dominant broad AI accelerator
-   CPU–GPU system boundaries
    -   Discrete and shared-memory integration
    -   Submission, synchronization, power, and recovery
-   Conditions that narrow the GPU efficiency envelope
-   Precise interpretation of why GPUs alone are not sufficient
-   CPU and GPU roles across the AI compute continuum
-   Design questions that lead into domain-specific architecture families

**Engineering Takeaways**

------------------------------------------------------------------------

## Chapter 6. Domain-Specific AI Accelerators Across the Compute Continuum (Cornerstone Chapter)

Architectural families (presented as microarchitectural organizations per Charter §13):

-   Systolic arrays (mechanism family; presented before the device classes built on it)
-   Tensor processors
-   Deterministic dataflow and tile processors (added; Groq/SambaNova/Tenstorrent class)
-   NPUs, including microNPU and near-sensor engines
-   FPGA and reconfigurable computing
-   Wafer-scale computing
-   Memory-centric architectures and processing-in-memory
-   Neuromorphic overview (forward-looking)

For each:

-   Design philosophy
-   Execution model
-   Memory hierarchy
-   Compiler/runtime
-   Strengths
-   Weaknesses
-   Best workloads
-   Deployment continuum: Phone → Embedded → Desktop → Edge Server →
    Enterprise → Hyperscaler

**Engineering Takeaways**

------------------------------------------------------------------------

# Part III --- Commercial Ecosystem

## Chapter 7. Enterprise Accelerator Landscape

Organized by architecture, not vendor chronology.

Representative implementations:

NVIDIA, AMD, Google, AWS, Microsoft, Meta, OpenAI, Cerebras, Groq,
SambaNova, Tenstorrent and other significant startups.

Comparison template applied uniformly.

**Engineering Takeaways**

------------------------------------------------------------------------

## Chapter 8. Client and Edge AI Landscape

AI PCs

Mobile SoCs

Embedded systems

Robotics

Automotive

Deep comparative analysis:

Apple

Qualcomm

Intel

AMD

NVIDIA Client

Google Edge TPU

Emerging startups

Focus:

-   always-on inference
-   unified memory
-   heterogeneous scheduling
-   privacy
-   latency
-   battery
-   thermal envelopes

Relationship with enterprise architectures.

**Engineering Takeaways**

------------------------------------------------------------------------

# Part IV --- Software and Infrastructure

## Chapter 9. Software Ecosystem

CUDA

ROCm

oneAPI

MLIR

XLA

Triton

Compilers

Runtime systems

Hardware/software co-design

**Engineering Takeaways**

------------------------------------------------------------------------

## Chapter 10. Packaging, Memory, Interconnects and Economics

HBM

LPDDR

Chiplets

CoWoS

NVLink

Infinity Fabric

Ethernet/InfiniBand

TCO

Power

Cooling

Manufacturing constraints

**Engineering Takeaways**

------------------------------------------------------------------------

# Chapter 11. Future Directions

Evidence classes:

Shipping

Announced

Research

Moonshots

Topics:

Processing-in-Memory

Photonics

Analog AI

Spintronics

Post-CMOS

Quantum computing (future edition only)

**Engineering Takeaways**

------------------------------------------------------------------------

# Chapter 12. Conclusions

-   Lessons from the two architectural transitions
-   Why specialization continues
-   Convergence and divergence across the AI compute continuum
-   Guidance for software architects
-   Guidance for platform architects
-   Guidance for hardware selection
-   Research gaps
-   Roadmap for future editions

------------------------------------------------------------------------

# Appendices

A. Normative Terminology

B. Formal Performance Models

C. Microarchitectural Deep Dives

D. Comparative Product Tables

E. Historical Timeline

F. Annotated Bibliography

G. Economic Primer: When AI Acceleration Pays

-   Reader expectations and learning objectives
    -   Translate technical bounds into lifecycle cost or enabled value
    -   Calculate and challenge break-even conditions
    -   Present positive and negative specialization results to technical and
        business decision makers
-   Initial scope
    -   Hyperscale and datacenter AI services
    -   Mobile AI devices and platforms
    -   Desktop, workstation, non-mobile edge, and embedded economics deferred
-   Decision definition
    -   Best credible baseline and complete candidate
    -   Common useful-result boundary, objective, time horizon, and volume
-   Shared incremental lifecycle model
    -   Recurring savings and enabled value
    -   Transition cost, flexibility surrendered, and risk
    -   Fixed and recurring terms, present value, simple break-even, and
        limits of payback
-   Translation of technical metrics into economic consequences
    -   Latency, utilization, energy and power, battery life, and flexibility
-   Datacenter application using the common model
    -   Cost per useful token, request, training run, or quality target
    -   Useful utilization, latency, capacity, energy, communication, goodput,
        and recovery
    -   Hypothetical payback and utilization sensitivities
-   Mobile application using the same model
    -   Silicon area, NRE, shipment volume, memory and package cost, coverage,
        wake scope, battery, thermals, and product value
    -   Hypothetical per-device and shipment-volume break-even sensitivities
-   Direct comparison of datacenter and mobile decision variables
-   Uncertainty, downside/base/upside cases, and avoidance of false precision
-   Architect-to-business decision checklist
-   Explicit summary of the seven principles readers should retain

------------------------------------------------------------------------

# References

-   Consolidated paper-level reference list
-   Organized by chapter for authoring and review
-   Sources used by multiple chapters retained as one canonical entry
