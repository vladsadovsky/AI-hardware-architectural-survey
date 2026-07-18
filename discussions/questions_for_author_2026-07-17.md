# Questions and Decisions Needing Author Input — 2026-07-17

Running list from the Chapter 6–8 drafting session. None block reading the drafts; all affect finalization.

## Decisions I made that need your confirmation or reversal

1. **Section order in Chapter 6: systolic arrays before tensor processors.** You asked to keep them separate (done); I additionally placed the mechanism (§6.2) before the device class (§6.3) because the primer logic builds cleanly. The outline listed tensor processors first. Confirm the order or ask me to swap back.
2. **Groq framing after the NVIDIA licensing deal.** Chapter 6 uses the Groq TSP as the §6.4 architecture exemplar (historically valid, peer-reviewed); Chapter 7 §7.3 treats the late-2025 licensing arrangement as landscape evidence about how the contested middle resolves. Confirm this split is acceptable, or direct a different treatment (e.g., moving the deal analysis into Chapter 6).
3. **NorthPole classified under memory-centric (§6.8), not neuromorphic (§6.9)**, with an explicit note about its TrueNorth lineage. This follows the Charter's taxonomy discipline but contradicts some press categorization. Confirm.
4. **Outline edited in place with a dated note** (Ch6 family list updated 2026-07-17) rather than bumping to v0.3. Charter §16 suggests substantive changes warrant a revision; say the word and I'll cut a v0.3 with a change log.
5. **Chapters 7–8 carry an explicit "Snapshot date: mid-2026" header** and evidence-class markers on time-sensitive facts. Confirm this convention, or specify a different dating/versioning scheme for the volatile chapters.
6. **Product depth in Ch7/8 kept to the analytical minimum**, with full specification tables deferred to Appendix D (not yet drafted). Confirm Appendix D as the destination.

## Facts needing your verification pass (beyond my web checks)

7. **2026 landscape numbers resting on class-D reporting**: GB300 shipment status and per-package figures; Panther Lake (~50 TOPS) and Ryzen AI 400 (~60 TOPS) NPU ratings; Groq–NVIDIA deal terms (~$20B); Cerebras OpenAI agreement (~$10B) and IPO figures; Tenstorrent–Qualcomm talks. All are marked class D inline; if any contradict better sources you have, the text is written so numbers can be corrected without structural change.
8. **Brainwave effective-throughput figure**: I hedged to "tens of teraflops effective at batch one" rather than quoting the exact ISCA 2018 number (39.5 TFLOPS is my recollection but I could not verify the precise figure in this session). Worth checking against the paper PDF before publication.
9. **TPU v1 weight-FIFO bandwidth** in the §6.2 worked anchor: I stated the array was fed at "bandwidths three to four orders of magnitude lower" than naive demand—conservative and safe, but the precise unified-buffer and DDR3 figures from the ISCA paper would sharpen it.

## Open items not yet done (candidates for next session)

10. **Figures needing design taste** remain placeholders: Ch6 (tensor-processor block diagram 6.3, dataflow timeline 6.4, NPU graph-partition 6.5, FPGA stack 6.6, wafer diagram 6.7, PIM organization 6.9-adjacent), Ch7 (ownership-resolution timeline 7.2), Ch8 (client decode chart 8.1 — deliberately unpopulated pending verified per-platform bandwidth figures).
11. **Chapter 2 §2.14 could gain a fourth case** (Groq licensing as "condition-3 vindicated, condition-4 failed for independence") once you confirm the Ch7 framing — currently the event lives only in Ch7.
12. **Appendix D (product tables) and Appendix G (economic primer)** are the next structural gaps; Charter says G follows Ch6 and finalizes after Ch10.
13. **Chapter 9 (software ecosystem)** now has substantial hooks written into Ch5–Ch8 (CUDA capital, compiler-owned families, coverage/fallback, Ethernet-vs-proprietary fabrics) — ready to draft on your go.
14. **MI400/Helios status ambiguity**: sources conflict on whether MI400 systems are shipping or imminent as of July 2026; I marked it "announced/ramping, class B." Adjust if you have current knowledge.
15. **Chapter 7/8 depth calibration**: both are drafted deliberately compact (~2.5k words each) — analytical landscape plus template tables, with per-product depth deferred to Appendix D per decision 6. If you want the outline's "deep comparative analysis" (especially Ch8's vendor-by-vendor client comparison) in the chapter bodies instead, say so and I'll expand them section by section; the structure supports it without rework.
