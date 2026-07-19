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



## Questioned observations in slide decks



*Immediate quesiton: slide 17 in short presentation claims NPUs own the client. Provide as hard as you can find factual proof and explain how you came to this observation? Is it an observation or prediction?*

<u>Thought process</u>

Good question to press on — that slide compresses a careful survey claim into a slogan, and the distinction you're asking about matters. Let me verify the current facts before I answer rather than lean on training data.

Searched the web, loaded tools

Straight answer first: **it's an observation with an analytical backbone — not a prediction — but the word "own" overstates it, and the honest version is narrower than the slogan.** Here's the decomposition, with the hard evidence on each side.

**What is solidly observed (evidence class A — verifiable today)**

The defensible, factual core is *ubiquity and positioning*, not dominance of compute:

- Every mainstream client silicon line now ships a dedicated NPU, and there's an explicit certification floor: Microsoft's Copilot+ program requires an NPU of **≥40 TOPS** (plus 16 GB RAM), and features like Recall, live translation, and Studio Effects simply don't run below it. Current parts clear it comfortably — Intel Core Ultra ~48 TOPS, AMD Ryzen AI 300 ~50, Qualcomm Snapdragon X Elite ~45 (X2 Elite ~80–85). Apple has shipped a Neural Engine in every A-series and M-series chip since 2017, and runs its on-device ~3B foundation model on it.
- Vendors position the NPU explicitly for **sustained and ambient low-power inference** — camera pipelines, live captions, presence/wake features — not for peak throughput.

So "NPUs are now the standard, universally-present client AI block for low-power sustained work" is a true present-tense observation.

**The structural argument behind the slide (analysis, not measurement)**

The *reason* I asserted it — and where the takeaway line comes from ("wake-scope energy and per-unit cost floors are structurally outside the GPU contract") — is reasoning from the survey's §5.11 absorption partition and §6.5, not an empirical count. Wake-scope energy spans ~4 orders of magnitude; an always-on feature at sub-milliwatt is *impossible* within a battery budget on a GPU's submission/memory contract, and a few-mm² µNPU hits a component-cost floor no general engine reaches. Those are physics-and-economics arguments — strong, but arguments.

**What is NOT proven — and where "own" fails**

If "own" is read as "NPUs execute most client AI compute," the evidence points the *other way*. Heavy client generative AI still runs largely on the **GPU** (CUDA/DirectML); most popular local-LLM tools don't touch the NPU at all, and NPU support is spotty (e.g., Qualcomm Hexagon has some backends; Intel/AMD NPU LLM support lags). PCWorld's blunt framing — "the great NPU failure: two years later, local AI is still all about GPUs" — captures it. TOPS ratings are not usage; measured NPU utilization is gated by operator/software coverage. This is exactly the caveat the survey's own Chapter 8 makes ("the NPU's role is energy and residency, not peak speed… coverage, not TOPS, decides… the GPU can outrun the NPU on burst inference"). The slide compressed that careful claim into a slogan and lost the qualifier.

**So: observation or prediction?**

Primarily an **observation** (ubiquity + structural niche) plus a **conditional forward claim** (they'll *keep* that niche because the bounds are structural). It is *not* a prediction that NPUs will win the client outright, and it should not be read as "NPUs do the client's AI compute today."

**Recommendation for the slide:** retitle 17 from "NPUs own the client and edge" to something like **"The client and edge is where NPUs are structurally safe"** or **"NPUs are the client's standard low-power AI block."** Keep the current takeaway; add one caveat bullet — *"heavy generative inference still runs on the client GPU; NPU value is gated by software coverage."* That makes it defensible and consistent with Chapter 8. Want me to make that edit (and mirror it on the 2-hour deck's NPU slide)?

Sources:

- [ITdaily — Copilot+ requires 16 GB RAM and 40+ TOPS NPU](https://itdaily.com/news/workplace/windows-copilot-plus-pc-system-requirements/)
- [SolidAITech — NPU Guide 2026: TOPS, Copilot+ PCs](https://www.solidaitech.com/2026/05/npu-neural-processing-unit-complete-guide.html)
- [PCWorld — "The great NPU failure: two years later, local AI is still all about GPUs"](https://www.pcworld.com/article/2965927/the-great-npu-failure-two-years-later-local-ai-is-still-all-about-gpus.html)
- [Microsoft Learn — FAQs about using AI in Windows apps (execution providers / GPU fallback)](https://learn.microsoft.com/en-us/windows/ai/faq)