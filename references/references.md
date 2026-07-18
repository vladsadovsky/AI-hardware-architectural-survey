# References

The paper uses one consolidated reference list placed after all chapters and appendices. References are grouped by the chapter in which they are first or principally used. A source used by multiple chapters should have one canonical entry, with cross-references from later chapter groups if useful.

## Chapter 1 — Historical Context and Architectural Transitions

1. W. A. Wulf and S. A. McKee, [“Hitting the Memory Wall: Implications of the Obvious,”](https://libraopen.lib.virginia.edu/downloads/4b29b598d) *Computer Architecture News*, 23(1), 1995.
2. S. Williams, A. Waterman, and D. Patterson, [“Roofline: An Insightful Visual Performance Model for Multicore Architectures,”](https://www2.eecs.berkeley.edu/Pubs/TechRpts/2008/EECS-2008-134.pdf) University of California, Berkeley, 2008.
3. H. Esmaeilzadeh et al., [“Dark Silicon and the End of Multicore Scaling,”](https://www.cs.cmu.edu/~18742/papers/Esmaeilzadeh2011.pdf) *Proceedings of ISCA*, 2011.
4. L. A. Barroso and U. Hölzle, [“The Case for Energy-Proportional Computing,”](https://research.google/pubs/the-case-for-energy-proportional-computing/) *IEEE Computer*, 40, 2007.
5. X. Fan, W.-D. Weber, and L. A. Barroso, [“Power Provisioning for a Warehouse-sized Computer,”](https://research.google/pubs/power-provisioning-for-a-warehouse-sized-computer/) *Proceedings of ISCA*, 2007.
6. A. Verma et al., [“Large-scale Cluster Management at Google with Borg,”](https://research.google/pubs/large-scale-cluster-management-at-google-with-borg/) *Proceedings of EuroSys*, 2015.
7. S. Dev et al., [“Autonomous Warehouse-Scale Computers,”](https://research.google/pubs/autonomous-warehouse-scale-computers/) *Proceedings of DAC*, 2020.
8. NVIDIA, [“CUDA Programming Guide: Introduction,”](https://docs.nvidia.com/cuda/cuda-programming-guide/01-introduction/introduction.html), [“Programming Model,”](https://docs.nvidia.com/cuda/cuda-programming-guide/01-introduction/programming-model.html), and [“Writing CUDA SIMT Kernels,”](https://docs.nvidia.com/cuda/archive/13.1.1/cuda-programming-guide/02-basics/writing-cuda-kernels.html).
9. A. Krizhevsky, I. Sutskever, and G. E. Hinton, [“ImageNet Classification with Deep Convolutional Neural Networks,”](https://papers.neurips.cc/paper_files/paper/2012/file/c399862d3b9d6b76c8436e924a68c45b-Paper.pdf) *Advances in Neural Information Processing Systems 25*, 2012.
10. Y.-H. Chen et al., [“Eyeriss: An Energy-Efficient Reconfigurable Accelerator for Deep Convolutional Neural Networks,”](https://dspace.mit.edu/bitstream/handle/1721.1/101151/eyeriss_isscc_2016.pdf) *ISSCC*, 2016.
11. Z. Du et al., [“ShiDianNao: Shifting Vision Processing Closer to the Sensor,”](https://www.epfl.ch/labs/lap/wp-content/uploads/2018/05/DuJun15_ShiDianNaoShiftingVisionProcessingCloserToTheSensor_ISCA15.pdf) *Proceedings of ISCA*, 2015.
12. N. P. Jouppi et al., [“In-Datacenter Performance Analysis of a Tensor Processing Unit,”](https://research.google/pubs/in-datacenter-performance-analysis-of-a-tensor-processing-unit/) *Proceedings of ISCA*, 2017.
13. Arm, [“Ethos-U55 NPU Technical Reference Manual,”](https://documentation-service.arm.com/static/6305faeffc87ea23a5e0aa18) 2022.
14. Qualcomm Technologies, [“Hexagon SDK 3.0—DSP Power and Efficiency,”](https://www.qualcomm.com/news/onq/2016/09/qualcomm-hexagon-sdk-30-dsp-power-and-efficiency) 2016. Vendor engineering source; qualitative architectural evidence only.
15. A. Vaswani et al., [“Attention Is All You Need,”](https://papers.neurips.cc/paper_files/paper/2017/hash/3f5ee243547dee91fbd053c1c4a845aa-Abstract.html) *Advances in Neural Information Processing Systems 30*, 2017.
16. J. L. Hennessy and D. A. Patterson, [“A New Golden Age for Computer Architecture,”](https://doi.org/10.1145/3282307) *Communications of the ACM*, 62(2), 2019.
17. A. Firoozshahian et al., [“MTIA: First Generation Silicon Targeting Meta’s Recommendation Systems,”](https://dl.acm.org/doi/10.1145/3579371.3589348) *Proceedings of ISCA*, 2023. Peer-reviewed disclosure of an internally deployed hyperscaler inference accelerator.
18. AWS, [“AWS Trainium,”](https://aws.amazon.com/ai/machine-learning/trainium/) product documentation. Vendor source; establishes production deployment status only.
19. Cerebras, [“Cerebras Wafer-Scale Engine,”](https://www.cerebras.ai/chip) technical overview. Vendor source; architectural claims require the qualifications of Chapter 6.

Second-transition production systems referenced in §1.7 are cited canonically where principally analyzed: TPU v4 under Chapter 2 (Ref. 24) and the Groq tensor streaming processor under Chapter 5 (Ref. 10).

## Chapter 2 — Computational Characteristics of Modern AI Workloads

1. MLCommons, [“MLPerf Training Benchmark,”](https://mlcommons.org/benchmarks/training/) workload definitions, quality targets, rules, and results.
2. T. Dao et al., [“FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness,”](https://papers.neurips.cc/paper_files/paper/2022/hash/67d57c32e20fd0a7a302cb81d36e40d5-Abstract-Conference.html) *Advances in Neural Information Processing Systems 35*, 2022.
3. W. Kwon et al., [“Efficient Memory Management for Large Language Model Serving with PagedAttention,”](https://arxiv.org/abs/2309.06180) *Proceedings of SOSP*, 2023.
4. M. Naumov et al., [“Deep Learning Recommendation Model for Personalization and Recommendation Systems,”](https://arxiv.org/abs/1906.00091) 2019.
5. A. Mudigere et al., [“High-Performance, Distributed Training of Large-Scale Deep Learning Recommendation Models,”](https://arxiv.org/abs/2104.05158) 2021. See also the production-system characterization in [“Deep Learning Training in Facebook Data Centers: Design of Scale-up and Scale-out Systems,”](https://arxiv.org/abs/2003.09518) 2020.
6. M. Yan et al., [“HyGCN: A GCN Accelerator with Hybrid Architecture,”](https://arxiv.org/abs/2001.02514) *Proceedings of HPCA*, 2020.
7. MLCommons, [“MLPerf Tiny Inference Benchmark,”](https://mlcommons.org/2021/06/mlperf-tiny-inference-benchmark/) 2021, and [MLPerf Tiny benchmark specifications](https://mlcommons.org/benchmarks/inference-tiny/).
8. MLCommons, [“MLPerf Client Benchmark,”](https://mlcommons.org/benchmarks/client/).
9. E. J. Hu et al., [“LoRA: Low-Rank Adaptation of Large Language Models,”](https://arxiv.org/abs/2106.09685) *Proceedings of ICLR*, 2022.
10. W. Fedus, B. Zoph, and N. Shazeer, [“Switch Transformers: Scaling to Trillion Parameter Models with Simple and Efficient Sparsity,”](https://arxiv.org/abs/2101.03961) *Journal of Machine Learning Research*, 23, 2022.
11. J. Ho, A. Jain, and P. Abbeel, [“Denoising Diffusion Probabilistic Models,”](https://arxiv.org/abs/2006.11239) *Advances in Neural Information Processing Systems 33*, 2020.
12. MLCommons, [“MLPerf Automotive Benchmark Suite,”](https://mlcommons.org/benchmarks/mlperf-automotive/), scenario definitions and latency metrics.
13. C. Ding and Y. Zhong, [“Predicting Whole-Program Locality through Reuse Distance Analysis,”](https://doi.org/10.1145/780822.781159) *Proceedings of PLDI*, 2003.
14. N. Bell and M. Garland, [“Sparse Matrix-Vector Multiplication on Multicore and Accelerators,”](https://research.nvidia.com/publication/2010-12_sparse-matrix-vector-multiplication-multicore-and-accelerators) NVIDIA Technical Report NVR-2010-004, 2010.
15. M. Assran et al., [“V-JEPA 2: Self-Supervised Video Models Enable Understanding, Prediction and Planning,”](https://ai.meta.com/research/publications/v-jepa-2-self-supervised-video-models-enable-understanding-prediction-and-planning/) 2025. Research system; used as evidence of an emerging workload direction, not an established future architecture.
16. K. T. Malladi et al., [“Towards Energy-Proportional Datacenter Memory with Mobile DRAM,”](https://mast.stanford.edu/pubs/towards_energy_proportional_datacenter_memory_with_mobile_dram/) *Proceedings of ISCA*, 2012.
17. A. Yazdanbakhsh, B. Akin, and K. S. Seshadri, [“An Evaluation of Edge TPU Accelerators for Convolutional Neural Networks,”](https://research.google/pubs/an-evaluation-of-edge-tpu-accelerators-for-convolutional-neural-networks/) 2021.
18. A. Grattafiori et al., [“The Llama 3 Herd of Models,”](https://arxiv.org/abs/2407.21783) 2024. Used to document the parameter counts and memory footprints of openly released 70B-scale dense transformers for the worked bounds in §2.5.
19. NVIDIA, [“NVIDIA H100 Tensor Core GPU Datasheet,”](https://resources.nvidia.com/en-us-gpu-resources/h100-datasheet-24306) 2023. Vendor specification; used only for documented bandwidth and dense throughput ratings in author-computed bounds, not as performance validation.
20. J. Li, Y. Jiang, Y. Zhu, C. Wang, and H. Xu, [“Accelerating Distributed MoE Training and Inference with Lina,”](https://www.usenix.org/conference/atc23/presentation/li-jiamin) *Proceedings of USENIX ATC*, 2023. Source of the measured ~34% average all-to-all share of MoE step time. See also C. Hwang et al., [“Tutel: Adaptive Mixture-of-Experts at Scale,”](https://arxiv.org/abs/2206.03382) *Proceedings of MLSys*, 2023.
21. Syntiant, [“Edge AI Chip Company Syntiant Announces Support for ‘Hey Google’ and ‘Ok Google’ Hotwords,”](https://www.syntiant.com/news/edge-ai-chip-company-syntiant-announces-support-for-hey-google-and-ok-google-hotwords) vendor announcement. Vendor claim of sub-280 µW always-on wake-word detection; used as an order-of-magnitude anchor only.
22. Intel Nervana cancellation reporting: [“Intel Officially Axes Nervana,”](https://www.eetimes.com/intel-officially-axes-nervana/) *EE Times*, 2020; [“Two startups enter, one leaves: Intel kills off much-delayed Nervana AI training chip, pushes on with Habana,”](https://www.theregister.com/2020/01/31/intel_kills_spring_crest/) *The Register*, January 2020. Evidence class D (reputable industry reporting of officially confirmed decisions).
23. Graphcore–SoftBank acquisition: [“Graphcore joins SoftBank Group to build next generation of AI compute,”](https://www.graphcore.ai/posts/graphcore-joins-softbank-group-to-build-next-generation-of-ai-compute) company announcement, July 2024; [“SoftBank acquires UK AI chipmaker Graphcore,”](https://techcrunch.com/2024/07/11/softbank-acquires-uk-ai-chipmaker-graphcore/) *TechCrunch*, July 2024. Evidence class D.
24. N. P. Jouppi et al., [“TPU v4: An Optically Reconfigurable Supercomputer for Machine Learning with Hardware Support for Embeddings,”](https://arxiv.org/abs/2304.01433) *Proceedings of ISCA*, 2023. Documents the TPU line’s continuation into training at supercomputer scale.

Sources principally listed under Chapter 1 but also used as background in Chapter 2 include the Roofline model (Chapter 1, Ref. 2), Eyeriss data-movement analysis (Chapter 1, Ref. 10), ShiDianNao near-sensor processing (Chapter 1, Ref. 11), and *Attention Is All You Need* (Chapter 1, Ref. 15).

## Chapter 3 — Fundamental Architectural Principles

1. H. T. Kung, [“Why Systolic Architectures?”](https://doi.org/10.1109/MC.1982.1653825) *Computer*, 15(1), 1982.
2. A. Parashar et al., [“Timeloop: A Systematic Approach to DNN Accelerator Evaluation,”](https://doi.org/10.1109/ISPASS.2019.00042) *Proceedings of ISPASS*, 2019.
3. H. Kwon et al., [“Understanding Reuse, Performance, and Hardware Cost of DNN Dataflows: A Data-Centric Approach,”](https://doi.org/10.1145/3352460.3358252) *Proceedings of MICRO-52*, 2019.
4. P. Micikevicius et al., [“Mixed Precision Training,”](https://iclr.cc/virtual/2018/poster/288) *Proceedings of ICLR*, 2018.
5. D. Kalamkar et al., [“A Study of BFLOAT16 for Deep Learning Training,”](https://arxiv.org/abs/1905.12322) 2019.
6. T. Chen et al., [“TVM: An Automated End-to-End Optimizing Compiler for Deep Learning,”](https://www.usenix.org/conference/osdi18/presentation/chen) *Proceedings of OSDI*, 2018.
7. C. Lattner et al., [“MLIR: Scaling Compiler Infrastructure for Domain Specific Computation,”](https://research.google/pubs/mlir-scaling-compiler-infrastructure-for-domain-specific-computation/) *Proceedings of CGO*, 2021.
8. J. Ragan-Kelley et al., [“Halide: A Language and Compiler for Optimizing Parallelism, Locality, and Recomputation in Image Processing Pipelines,”](https://people.csail.mit.edu/jrk/halide12/) *Proceedings of PLDI*, 2013.
9. M. Cho, U. Finkler, D. Kung, and H. Hunter, [“BlueConnect: Decomposing All-Reduce for Deep Learning on Heterogeneous Network Hierarchy,”](https://proceedings.mlsys.org/paper_files/paper/2019/hash/0c8abcf158ed12d0dd94480681186fda-Abstract.html) *Proceedings of Machine Learning and Systems 1*, 2019.

Sources principally listed under earlier chapters but also used in Chapter 3 include CUDA’s SIMT programming model (Chapter 1, Ref. 8), Eyeriss dataflow analysis (Chapter 1, Ref. 10), and PagedAttention (Chapter 2, Ref. 3).

## Chapter 4 — Architectural Stressors and Design Tradeoffs

1. M. Horowitz, [“Computing’s Energy Problem (and What We Can Do About It),”](https://doi.org/10.1109/ISSCC.2014.6757323) *ISSCC*, 2014.
2. Y. Zu et al., [“Resiliency at Scale: Managing Google’s TPUv4 Machine Learning Supercomputer,”](https://www.usenix.org/conference/nsdi24/presentation/zu) *Proceedings of NSDI*, 2024.

Sources principally listed under earlier chapters but also used in Chapter 4 include energy-proportional computing and the first production TPU analysis (Chapter 1, Refs. 4 and 12); reuse-distance analysis and mobile-DRAM energy proportionality (Chapter 2, Refs. 13 and 16); and TVM, MLIR, and BlueConnect (Chapter 3, Refs. 6, 7, and 9).

## Chapter 5 — CPUs and GPUs

1. Intel, [*Intel 64 and IA-32 Architectures Optimization Reference Manual*](https://www.intel.com/content/www/us/en/developer/articles/technical/intel64-and-ia32-architectures-optimization.html), current documentation.
2. G. M. Amdahl, [“Validity of the Single Processor Approach to Achieving Large Scale Computing Capabilities,”](https://doi.org/10.1145/1465482.1465560) *Proceedings of the AFIPS Spring Joint Computer Conference*, 1967.
3. N. Stephens et al., [“The ARM Scalable Vector Extension,”](https://developer.arm.com/community/arm-research/b/articles/posts/the-arm-scalable-vector-extension-sve) *IEEE Micro*, 37(2), 2017.
4. E. Lindholm, J. Nickolls, S. Oberman, and J. Montrym, [“NVIDIA Tesla: A Unified Graphics and Computing Architecture,”](https://doi.org/10.1109/MM.2008.31) *IEEE Micro*, 28(2), 2008.
5. J. Nickolls, I. Buck, M. Garland, and K. Skadron, [“Scalable Parallel Programming with CUDA,”](https://doi.org/10.1145/1365490.1365500) *ACM Queue*, 6(2), 2008.
6. S. Chetlur et al., [“cuDNN: Efficient Primitives for Deep Learning,”](https://arxiv.org/abs/1410.0759) 2014.
7. AMD, [“Understanding the HIP Programming Model,”](https://rocm.docs.amd.com/projects/HIP/en/latest/understand/programming_model.html) *ROCm Documentation*.
8. NVIDIA, [*NVIDIA Tesla V100 GPU Architecture*](https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/tesla-product-literature/volta-architecture-whitepaper.pdf), architecture whitepaper, 2017. Vendor architecture source; used to document the integration and programming exposure of early GPU tensor cores, not as independent performance validation.
9. NVIDIA, [*NVIDIA H100 Tensor Core GPU Architecture* (Hopper architecture whitepaper)](https://resources.nvidia.com/en-us-tensor-core/gtc22-whitepaper-hopper), 2022. Vendor architecture source; used in §5.11 to document shipped absorption mechanisms (transformer engine, FP8 paths, structured sparsity, asynchronous movement, NVLink scale-up), not as performance validation.
10. D. Abts et al., [“Think Fast: A Tensor Streaming Processor (TSP) for Accelerating Deep Learning Workloads,”](https://doi.org/10.1109/ISCA45697.2020.00023) *Proceedings of ISCA*, 2020. Peer-reviewed disclosure of a deterministic, distributed-SRAM accelerator architecture; cited in §5.11 as a contract-changing response to the decode bound.

Sources principally listed under earlier chapters but also used in Chapter 5 include CUDA’s programming model (Chapter 1, Ref. 8), AlexNet (Chapter 1, Ref. 9), the first production TPU analysis (Chapter 1, Ref. 12), TVM and MLIR (Chapter 3, Refs. 6 and 7), the necessity-test case sources (Chapter 2, Refs. 22–24), and the workload and GPU-efficiency analysis developed throughout Chapters 2 through 4.

## Chapter 6 — Domain-Specific AI Accelerators Across the Compute Continuum

1. T. Norrie et al., [“The Design Process for Google’s Training Chips: TPUv2 and TPUv3,”](https://ieeexplore.ieee.org/document/9351692) *IEEE Micro*, 41(2), 2021.
2. J. Fowers et al., [“A Configurable Cloud-Scale DNN Processor for Real-Time AI,”](https://www.microsoft.com/en-us/research/publication/a-configurable-cloud-scale-dnn-processor-for-real-time-ai/) *Proceedings of ISCA*, 2018. Project Brainwave; batch-one soft-NPU serving with weights pinned in on-chip RAM.
3. A. Putnam et al., [“A Reconfigurable Fabric for Accelerating Large-Scale Datacenter Services,”](https://www.microsoft.com/en-us/research/publication/a-reconfigurable-fabric-for-accelerating-large-scale-datacenter-services/) *Proceedings of ISCA*, 2014. Project Catapult production pilot.
4. I. Kuon and J. Rose, [“Measuring the Gap Between FPGAs and ASICs,”](https://doi.org/10.1109/TCAD.2006.884574) *IEEE Transactions on Computer-Aided Design*, 26(2), 2007. Canonical area/speed/power gap measurements.
5. R. Prabhakar et al., [“SambaNova SN40L: Scaling the AI Memory Wall with Dataflow and Composition of Experts,”](https://arxiv.org/abs/2405.07518) 2024; see also the ISSCC 2025 disclosure. Vendor-authored architecture paper; three-tier memory figures are vendor specifications.
6. D. Abts et al., [“Answer Fast: Accelerating BERT on the Tensor Streaming Processor,”](https://arxiv.org/abs/2206.11062) 2022. Batch-one transformer inference on the deterministic TSP.
7. Cerebras, [“Cerebras Announces Third-Generation Wafer-Scale Engine,”](https://www.cerebras.ai/press-release/cerebras-announces-third-generation-wafer-scale-engine) 2024, and [Hot Chips 2024 presentation](https://hc2024.hotchips.org/assets/program/conference/day2/72_HC2024.Cerebras.Sean.v03.final.pdf). Vendor disclosure; per-wafer figures (transistors, cores, SRAM, bandwidth) are vendor specifications.
8. Y.-C. Kwon, S. H. Lee, et al., [“Aquabolt-XL: Samsung HBM2-PIM with In-Memory Processing for ML Accelerators and Beyond,”](https://ieeexplore.ieee.org/document/9567191) *Hot Chips 33*, 2021; slides [available from Hot Chips](https://www.hc33.hotchips.org/assets/program/conference/day1/20210813_HC33_Aquabolt-XL_PIM_Jin_Kim_slide.pdf). Includes the LPDDR5-PIM mobile variant.
9. F. Devaux, [“The True Processing-in-Memory Accelerator,”](https://ieeexplore.ieee.org/document/8875680) *Hot Chips 31*, 2019. UPMEM DDR4 DPUs.
10. D. S. Modha et al., [“Neural Inference at the Frontier of Energy, Space, and Time,”](https://www.science.org/doi/10.1126/science.adh1174) *Science*, 382, 2023. NorthPole; comparison boundary is a same-process-node (12 nm) GPU on models fitting on-chip.
11. P. A. Merolla et al., [“A Million Spiking-Neuron Integrated Circuit with a Scalable Communication Network and Interface,”](https://www.science.org/doi/10.1126/science.1254642) *Science*, 345, 2014. TrueNorth.
12. M. Davies et al., [“Loihi: A Neuromorphic Manycore Processor with On-Chip Learning,”](https://ieeexplore.ieee.org/document/8259423) *IEEE Micro*, 38(1), 2018.
13. Intel, [“Neuromorphic Computing and Loihi 2,”](https://www.intel.com/content/www/us/en/research/neuromorphic-computing.html) research overview. Vendor source for Loihi 2 scale and the Lava framework.
14. Apple, [“Apple Introduces M4 Chip,”](https://www.apple.com/newsroom/2024/05/apple-introduces-m4-chip/) newsroom announcement, 2024. Vendor claim for neural-engine throughput; nominal TOPS, not comparable across vendors without workload boundaries.
15. Tenstorrent, [hardware and developer documentation](https://tenstorrent.com/hardware), vendor disclosure of tile-based RISC-V architecture with Ethernet scale-out.
16. AMD, [“AI Engine Technology,”](https://www.amd.com/en/products/adaptive-socs-and-fpgas/technologies/ai-engine.html) adaptive-SoC documentation. Hardened spatial-vector engines beside reconfigurable fabric.

Sources principally listed under earlier chapters but also used in Chapter 6 include TPU v1 (Chapter 1, Ref. 12), Ethos-U55 (Chapter 1, Ref. 13), Eyeriss (Chapter 1, Ref. 10), Edge TPU evaluation (Chapter 2, Ref. 17), always-on wake-word silicon (Chapter 2, Ref. 21), TPU v4 (Chapter 2, Ref. 24), Kung’s systolic rationale (Chapter 3, Ref. 1), Horowitz energy figures (Chapter 4, Ref. 1), GPU tensor cores (Chapter 5, Ref. 8), and the Groq TSP (Chapter 5, Ref. 10).

## Chapter 7 — Enterprise Accelerator Landscape (snapshot: mid-2026)

Time-sensitive landscape facts in this chapter were verified against the sources below in July 2026; entries marked class D are reputable reporting pending or supplementing vendor documentation.

1. Blackwell Ultra / GB300 status and Rubin cadence: [“NVIDIA’s next-gen GB300 AI servers now in production,”](https://www.tweaktown.com/news/106480/nvidias-next-gen-gb300-ai-servers-now-in-production-will-begin-shipping-september/index.html) *TweakTown*; [“NVIDIA’s ‘Blackwell Ultra’ GB300 AI Servers to Lead the AI Infrastructure Race In 2026,”](https://wccftech.com/nvidia-blackwell-ultra-ai-servers-to-lead-the-ai-infrastructure-race-moving-into-2026/) *Wccftech*. Class D.
2. AMD, [Instinct MI355X product page](https://www.amd.com/en/products/accelerators/instinct/mi350/mi355x.html) and [MI355X datasheet](https://www.amd.com/content/dam/amd/en/documents/instinct-tech-docs/product-briefs/amd-instinct-mi355x-gpu-brochure.pdf). Vendor specifications (class A).
3. MI400 series and Helios rack announcement: [VideoCardz coverage](https://videocardz.com/newz/amd-launches-instinct-mi350-series-confirms-mi400-in-2026-with-432gb-hbm4-memory) and [TechPowerUp](https://www.techpowerup.com/337987/amd-previews-432-gb-hbm4-instinct-mi400-gpus-and-helios-rack-scale-ai-solution). Class B (officially announced, reported).
4. Google, [“Ironwood TPUs and new Axion-based VMs for your AI workloads,”](https://cloud.google.com/blog/products/compute/ironwood-tpus-and-new-axion-based-vms-for-your-ai-workloads/) Google Cloud blog, and [TPU7x documentation](https://docs.cloud.google.com/tpu/docs/tpu7x). Vendor disclosure (class A/B); eighth-generation split per [reporting](https://thenextweb.com/news/google-ironwood-tpu-inference-cloud-next) (class C/D).
5. AWS, [“Announcing Amazon EC2 Trn3 UltraServers,”](https://aws.amazon.com/about-aws/whats-new/2025/12/amazon-ec2-trn3-ultraservers/) and [Trainium3 architecture documentation](https://awsdocs-neuron.readthedocs-hosted.com/en/latest/about-neuron/arch/neuron-hardware/trainium3.html). Vendor (class A).
6. Microsoft, [“Maia 200: The AI accelerator built for inference,”](https://blogs.microsoft.com/blog/2026/01/26/maia-200-the-ai-accelerator-built-for-inference/) official blog, January 2026 (class A/B); third-party interest per [CNBC](https://www.cnbc.com/2026/05/21/anthropic-microsoft-maia-200-ai-chip.html) (class D).
7. Groq–NVIDIA licensing arrangement: [“After Nvidia’s Groq deal, these are the AI chip startups sitting pretty,”](https://fortune.com/2026/01/05/nvidia-groq-deal-ai-chip-startups-in-play/) *Fortune*, January 2026; [“Groq, Cerebras, and Tenstorrent: the non-GPU inference bet, one year in,”](https://www.siliconreport.com/inference-chip-startups-groq-cerebras-tenstorrent-51b3c733) *Silicon Report*. Class D.
8. Cerebras 2026 financing, OpenAI agreement, and IPO: *Silicon Report* and *Fortune* as above. Class D.
9. Tenstorrent Blackhole availability and acquisition discussions: *Silicon Report* as above; vendor hardware documentation under Chapter 6, Ref. 15. Class A (product) / D (talks).
10. Meta, [“Introducing the Next Generation of the Meta Training and Inference Accelerator,”](https://ai.meta.com/blog/next-generation-meta-training-inference-accelerator-AI-MTIA/) engineering blog. Vendor disclosure (class B); first generation per Chapter 1, Ref. 17.

## Chapter 8 — Client and Edge AI Landscape (snapshot: mid-2026)

1. Microsoft, [“Develop AI applications for Copilot+ PCs,”](https://learn.microsoft.com/en-us/windows/ai/npu-devices/) developer documentation. Defines the 40+ TOPS certification floor (class A).
2. Qualcomm, [Snapdragon AI laptop platform page](https://www.qualcomm.com/snapdragon/laptops-and-tablets/consumer/ai). Vendor claims for X2-generation NPU and memory configurations (class A, nominal ratings).
3. Windows NPU landscape ratings (Panther Lake, Ryzen AI 400): [“NPU Benchmarks 2026,”](https://www.solidaitech.com/2026/06/npu-explained.html) and [“NPU Comparison 2026,”](https://localaimaster.com/blog/npu-comparison-2026) aggregate reporting. Class D; nominal TOPS at undisclosed precisions—not cross-vendor comparable.
4. Apple, [“Apple unleashes M5,”](https://www.apple.com/newsroom/2025/10/apple-unleashes-m5-the-next-big-leap-in-ai-performance-for-apple-silicon/) October 2025, and [“Apple debuts M5 Pro and M5 Max,”](https://www.apple.com/newsroom/2026/03/apple-debuts-m5-pro-and-m5-max-to-supercharge-the-most-demanding-pro-workflows/) March 2026. Vendor disclosure (class A).
5. Apple, [“Introducing Apple’s On-Device and Server Foundation Models,”](https://machinelearning.apple.com/research/introducing-apple-foundation-models) machine learning research publication. Architecture of the production on-device model tier with adapters (class A/B).
6. Jetson Thor and Drive AGX Thor: [“Nvidia’s ‘robot brain’ chip, Thor, goes on sale,”](https://www.cnbc.com/2025/08/25/nvidias-thor-t5000-robot-brain-chip.html) *CNBC*, August 2025; [TechRepublic coverage](https://www.techrepublic.com/article/news-nvidia-thor/). Vendor claims plus reporting (class A/D).
7. Edge and automotive AI silicon market context: [“Edge AI Chips Markets, Technologies, and Forecasts Report 2026–2036,”](https://www.globenewswire.com/news-release/2026/03/11/3253565/28124/en/edge-ai-chips-markets-technologies-and-forecasts-report-2026-2036-architectures-applications-competitive-dynamics-geographic-forecasts-and-54-detailed-company-profiles.html) GlobeNewswire. Class D; market-shape context only.

Sources principally listed under earlier chapters but also used in Chapters 7 and 8 include the H100 datasheet and TPU v4 paper (Chapter 2, Refs. 19 and 24), ROCm/HIP (Chapter 5, Ref. 7), SN40L (Chapter 6, Ref. 5), Cerebras WSE-3 (Chapter 6, Ref. 7), Tenstorrent (Chapter 6, Ref. 15), Ethos-U55 (Chapter 1, Ref. 13), MLPerf Tiny and Client (Chapter 2, Refs. 7 and 8), and MTIA (Chapter 1, Ref. 17).
