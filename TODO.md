07/16/2026

- Synergies between R&D for 3 arch groups: research how they are possible, working or are they completely separarte. Analogy with NAND : back and forth, like nvme. Power/energy designs, use of high volume components for accelerators, etc. GPUs in phones ? 
- Is logic specific to current AI architecture, based on hyper scaled matrix algebra? How possible is fundamental shift with eg world models of AI?
- apply same or deeper depth from chap 1 to chap 2 on workloads : describe taxonomize them in more architectural terms (access doisitribution, temporal distributions, etc - stochastic processes)
- Capture separate research into TPUs ; are they really like GPUs, but specialized micro code? Or like DSPs, completely different silicon design? 
- Microsoft FPGAs compromise  cursory mention ? 
- Is rack design consideration in DC for offload devices evolution (physical separation in a rack of groups)

---

## Facts needing human verification (fact-checking phase)

Verify before publication; each is marked with its evidence class inline in the text and is written so the number can be corrected without structural change.

- **2026 landscape numbers resting on class-D reporting** (Ch7, Ch8): GB300 shipment status and per-package figures; Panther Lake (~50 TOPS) and Ryzen AI 400 (~60 TOPS) NPU ratings; Groq–NVIDIA licensing terms (~$20B); Cerebras–OpenAI agreement (~$10B) and IPO figures; Tenstorrent–Qualcomm acquisition talks; MI400/Helios shipping-vs-imminent status. Reconcile against best available sources.
- **Brainwave effective-throughput figure** (§6.6): text hedges to "tens of teraflops effective at batch one." Confirm the exact ISCA 2018 number (~39.5 TFLOPS recalled but unverified) against the paper before quoting it.
- **TPU v1 weight-FIFO / unified-buffer bandwidth** (§6.2 worked anchor): text states the array was fed "three to four orders of magnitude lower" than naive demand — conservative and safe. Substitute the precise unified-buffer and DDR3 figures from the ISCA paper to sharpen the anchor.

## Figures and diagrams (dedicated pass)

- Full figures/diagrams pass across the paper. Outstanding: Ch6 per-family engineering diagrams (tensor-processor block 6.3, dataflow timeline 6.4, NPU SoC power-domain 6.5, FPGA stack 6.6, wafer-scale 6.7, PIM organizations near 6.9), Ch7 ownership-resolution timeline 7.2, Ch8 client decode chart 8.1 (populate only once per-platform bandwidths are verified against vendor docs), Appendix G break-even curves G.1. Prototype script `figures/make_figures_ch6_families.py` drafted but not yet run, inserted, or design-reviewed.

## Chapter expansion (deferred)

- Expand Chapters 7 and 8 eventually. Both are deliberately compact now (~2.5k words each: analytical landscape plus template tables), with per-product depth deferred to Appendix D. When the full paper is assembled, revisit and consider adding vendor-by-vendor comparative depth (especially Ch8's client comparison) in the chapter bodies; the structure supports it without rework.