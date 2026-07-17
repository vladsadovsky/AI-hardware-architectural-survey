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
8. NVIDIA, [“CUDA Programming Guide: Introduction,”](https://docs.nvidia.com/cuda/cuda-programming-guide/01-introduction/introduction.html) and [“Programming Model,”](https://docs.nvidia.com/cuda/cuda-programming-guide/01-introduction/programming-model.html).
9. A. Krizhevsky, I. Sutskever, and G. E. Hinton, [“ImageNet Classification with Deep Convolutional Neural Networks,”](https://papers.neurips.cc/paper_files/paper/2012/file/c399862d3b9d6b76c8436e924a68c45b-Paper.pdf) *Advances in Neural Information Processing Systems 25*, 2012.
10. Y.-H. Chen et al., [“Eyeriss: An Energy-Efficient Reconfigurable Accelerator for Deep Convolutional Neural Networks,”](https://dspace.mit.edu/bitstream/handle/1721.1/101151/eyeriss_isscc_2016.pdf) *ISSCC*, 2016.
11. Z. Du et al., [“ShiDianNao: Shifting Vision Processing Closer to the Sensor,”](https://www.epfl.ch/labs/lap/wp-content/uploads/2018/05/DuJun15_ShiDianNaoShiftingVisionProcessingCloserToTheSensor_ISCA15.pdf) *Proceedings of ISCA*, 2015.
12. N. P. Jouppi et al., [“In-Datacenter Performance Analysis of a Tensor Processing Unit,”](https://research.google/pubs/in-datacenter-performance-analysis-of-a-tensor-processing-unit/) *Proceedings of ISCA*, 2017.
13. Arm, [“Ethos-U55 NPU Technical Reference Manual,”](https://documentation-service.arm.com/static/6305faeffc87ea23a5e0aa18) 2022.
14. Qualcomm Technologies, [“Hexagon SDK 3.0—DSP Power and Efficiency,”](https://www.qualcomm.com/news/onq/2016/09/qualcomm-hexagon-sdk-30-dsp-power-and-efficiency) 2016. Vendor engineering source; qualitative architectural evidence only.
15. A. Vaswani et al., [“Attention Is All You Need,”](https://papers.neurips.cc/paper_files/paper/2017/hash/3f5ee243547dee91fbd053c1c4a845aa-Abstract.html) *Advances in Neural Information Processing Systems 30*, 2017.
16. J. L. Hennessy and D. A. Patterson, [“A New Golden Age for Computer Architecture,”](https://doi.org/10.1145/3282307) *Communications of the ACM*, 62(2), 2019.

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

Sources principally listed under Chapter 1 but also used as background in Chapter 2 include the Roofline model (Chapter 1, Ref. 2), Eyeriss data-movement analysis (Chapter 1, Ref. 10), ShiDianNao near-sensor processing (Chapter 1, Ref. 11), and *Attention Is All You Need* (Chapter 1, Ref. 15).
