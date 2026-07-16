# Survey of Modern AI Compute Accelerator Hardware

## Master Structural Outline v0.2 (Architecture-First, Workload-Driven)

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

For each workload:

1.  Computational characteristics
2.  Software optimization techniques
3.  Why software eventually stops scaling
4.  Architectural bottlenecks
5.  Emerging hardware responses
6.  Remaining research challenges

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

Representative deployment analysis:

Phone → Laptop → Workstation → Enterprise Edge → Datacenter →
Hyperscaler

**Engineering Takeaways**

------------------------------------------------------------------------

## Chapter 3. Fundamental Architectural Principles

-   Execution models
-   Parallelism
-   Dataflow
-   Memory systems
-   Precision evolution
-   Scheduling
-   Compiler interaction
-   Communication

**Engineering Takeaways**

------------------------------------------------------------------------

## Chapter 4. Architectural Stressors and Design Tradeoffs

Ground every topic in real engineering scenarios.

Topics:

-   Data movement
-   Locality
-   Bandwidth
-   Synchronization
-   Network communication
-   Utilization
-   Determinism
-   Programmability
-   Scalability
-   Energy
-   Reliability

For every stressor:

Real workload → Software mitigation → Hardware limitation →
Architectural response

**Engineering Takeaways**

------------------------------------------------------------------------

# Part II --- Architecture Families

## Chapter 5. CPUs and GPUs

-   Modern CPUs
-   Evolution of GPU computing
-   CUDA ecosystem
-   Why GPUs became dominant
-   Why GPUs alone are no longer sufficient

**Engineering Takeaways**

------------------------------------------------------------------------

## Chapter 6. Domain-Specific AI Accelerators Across the Compute Continuum (Cornerstone Chapter)

Architectural families:

-   Tensor processors
-   Systolic arrays
-   NPUs
-   FPGA and reconfigurable computing
-   Wafer-scale computing
-   Memory-centric architectures
-   Neuromorphic overview

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

------------------------------------------------------------------------

# References

-   Consolidated paper-level reference list
-   Organized by chapter for authoring and review
-   Sources used by multiple chapters retained as one canonical entry
