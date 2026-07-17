#!/usr/bin/env python3
"""Generate draft figures for the AI accelerator survey (Chapters 2 and 5).
All numbers are author-computed from public vendor datasheets; see references.md.
"""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import numpy as np
import os

OUT = "/sessions/compassionate-blissful-planck/mnt/AI-hardware-architectural-survey/figures"
os.makedirs(OUT, exist_ok=True)

plt.rcParams.update({
    "font.family": "DejaVu Sans",
    "font.size": 9,
    "axes.spines.top": False,
    "axes.spines.right": False,
})

ACCENT = "#1a6a9a"   # blue
ACCENT2 = "#b03a2e"  # red
GRAY = "#555555"

# ----------------------------------------------------------------------------
# Figure 2.4 - Batch-one decode is a bandwidth bound
# ----------------------------------------------------------------------------
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10.5, 4.4))

# Left: roofline for H100 SXM (datasheet values)
BW = 3.35            # TB/s
FP8 = 1979.0         # TFLOPS dense
BF16 = 989.0         # TFLOPS dense
ai = np.logspace(-1, 4, 400)
mem_roof = BW * ai   # TFLOPS
ax1.plot(ai, np.minimum(mem_roof, FP8), color=ACCENT, lw=2,
         label="FP8 dense ceiling (1.98 PFLOPS)")
ax1.plot(ai, np.minimum(mem_roof, BF16), color=ACCENT, lw=1.4, ls="--",
         label="BF16 dense ceiling (0.99 PFLOPS)")
ax1.plot(ai[mem_roof < FP8], mem_roof[mem_roof < FP8], color=GRAY, lw=1.0, alpha=0.0)

# decode point: AI ~ 2 FLOP/byte -> 6.7 TFLOPS attainable
ax1.scatter([2], [BW * 2], color=ACCENT2, zorder=5, s=45)
ax1.annotate("batch-1 decode\nAI ≈ 2 FLOP/B\n≈ 0.3% of FP8 peak",
             xy=(2, BW * 2), xytext=(0.14, 60), fontsize=8.5, color=ACCENT2,
             arrowprops=dict(arrowstyle="->", color=ACCENT2, lw=1))
# prefill point: AI ~ 300
ax1.scatter([300], [min(BW * 300, BF16)], color="#1e8449", zorder=5, s=45)
ax1.annotate("batched prefill\nAI ≳ 300 FLOP/B",
             xy=(300, min(BW * 300, BF16)), xytext=(700, 200), fontsize=8.5,
             color="#1e8449",
             arrowprops=dict(arrowstyle="->", color="#1e8449", lw=1))
# ridge point FP8
ridge = FP8 / BW
ax1.axvline(ridge, color=GRAY, lw=0.7, ls=":")
ax1.text(ridge * 0.85, 2600, f"balance point ≈{ridge:.0f} FLOP/B",
         fontsize=8, color=GRAY, ha="right")
ax1.set_xscale("log"); ax1.set_yscale("log")
ax1.set_xlim(0.1, 1e4); ax1.set_ylim(0.3, 4000)
ax1.set_xlabel("Arithmetic intensity (FLOP per byte of HBM traffic)")
ax1.set_ylabel("Attainable throughput (TFLOPS)")
ax1.set_title("Roofline, current datacenter GPU (H100 SXM, datasheet)", fontsize=9.5)
ax1.legend(fontsize=8, loc="lower right", frameon=False)

# Right: batch-1 token ceiling for a 70 GB (70B @ 8-bit) model
platforms = [
    ("Server CPU\n8-ch DDR5-4800\n(0.31 TB/s)", 0.307),
    ("A100 80GB\nHBM2e (2.0 TB/s)", 2.039),
    ("H100 SXM\nHBM3 (3.35 TB/s)", 3.35),
    ("MI300X\nHBM3 (5.3 TB/s)", 5.3),
]
model_bytes = 70.0  # GB per token, weights only
names = [p[0] for p in platforms]
toks = [1000.0 * p[1] / model_bytes for p in platforms]
bars = ax2.bar(names, toks, color=[GRAY, ACCENT, ACCENT, ACCENT], width=0.62)
for b, t in zip(bars, toks):
    ax2.text(b.get_x() + b.get_width() / 2, t + 1.2, f"{t:.0f}", ha="center",
             fontsize=9, fontweight="bold")
ax2.axhline(20, color=ACCENT2, lw=1.2, ls="--")
ax2.text(3.45, 21.5, "20 tok/s interactive target", color=ACCENT2, fontsize=8,
         ha="right")
ax2.set_ylabel("Max tokens/s, one sequence (weights-only ideal)")
ax2.set_title("Batch-1 ceiling, 70B model @ 8-bit (weights = 70 GB)", fontsize=9.5)
ax2.tick_params(axis="x", labelsize=7.5)
ax2.set_ylim(0, 90)

fig.suptitle("Figure 2.4 — Batch-one decode is a bandwidth bound, not a compute bound "
             "(author-computed upper bounds from vendor datasheets; no overheads, no KV traffic)",
             fontsize=9, y=1.02)
fig.tight_layout()
for ext in ("svg", "png"):
    fig.savefig(f"{OUT}/fig02-04-decode-bandwidth-bound.{ext}", bbox_inches="tight", dpi=200)
plt.close(fig)

# ----------------------------------------------------------------------------
# Figure 2.7 - The necessity test as a decision structure
# ----------------------------------------------------------------------------
fig, ax = plt.subplots(figsize=(11.6, 7.2))
ax.set_xlim(0, 12.6); ax.set_ylim(0, 10); ax.axis("off")

def gate(x, y, w, h, text, fc="#eaf2f8"):
    box = FancyBboxPatch((x - w/2, y - h/2), w, h,
                         boxstyle="round,pad=0.08", fc=fc, ec=ACCENT, lw=1.2)
    ax.add_patch(box)
    ax.text(x, y, text, ha="center", va="center", fontsize=8.6)

def exitbox(x, y, w, h, text):
    box = FancyBboxPatch((x - w/2, y - h/2), w, h,
                         boxstyle="round,pad=0.08", fc="#fdf2e9", ec=ACCENT2, lw=1.1)
    ax.add_patch(box)
    ax.text(x, y, text, ha="center", va="center", fontsize=8.2, color="#7b241c")

def arrow(x1, y1, x2, y2, label=None, color=GRAY):
    a = FancyArrowPatch((x1, y1), (x2, y2), arrowstyle="-|>", mutation_scale=13,
                        color=color, lw=1.2)
    ax.add_patch(a)
    if label:
        ax.text((x1 + x2) / 2 + 0.14, (y1 + y2) / 2 + 0.08, label, fontsize=8,
                color=color)

gy = [8.8, 6.7, 4.6, 2.5]
gx = 5.8
gw, gh = 4.4, 1.15
gate(gx, gy[0], gw, gh, "1. Residual bound demonstrated\nafter the software ceiling?")
gate(gx, gy[1], gw, gh, "2. Material consequence under\nthe deployment objective?")
gate(gx, gy[2], gw, gh, "3. Hardware lever changes the bound\n(rather than relocating it)?")
gate(gx, gy[3], gw, gh, "4. Lifetime economics repay transition\n(software enablement, volume,\nstability, flexibility loss)?")

ex = 10.6
exitbox(ex, gy[0], 3.4, 1.0, "No → keep optimizing\nalgorithms and software")
exitbox(ex, gy[1], 3.4, 1.0, "No → accept the inefficiency or\nrenegotiate the requirement")
exitbox(ex, gy[2], 3.4, 1.0, "No → fix the system boundary\n(runtime, storage, scheduling)")
exitbox(ex, gy[3], 3.4, 1.0, "No → buy the flexible platform;\nrevisit when volume/stability change")

for i in range(3):
    arrow(gx, gy[i] - gh/2 - 0.06, gx, gy[i+1] + gh/2 + 0.10, "yes", ACCENT)
for i in range(4):
    arrow(gx + gw/2 + 0.08, gy[i], ex - 1.72, gy[i], "no", ACCENT2)

gate(gx, 0.7, 4.0, 0.95, "SPECIALIZE\n(all four conditions hold)", fc="#e8f6ef")
arrow(gx, gy[3] - gh/2 - 0.12, gx, 0.7 + 0.55, "yes", "#1e8449")

# case paths annotation
ax.text(0.15, 9.6, "Case paths (§2.14):", fontsize=8.8, fontweight="bold")
ax.text(0.15, 9.15, "• TPU v1: yes at all four gates → specialize\n"
                    "• Nervana / Graphcore: fails gate 4\n"
                    "• Enterprise private serving: fails gates 2 and 4",
        fontsize=8.4, va="top")
ax.set_title("Figure 2.7 — The conditional hardware-necessity test as a decision structure",
             fontsize=10)
fig.tight_layout()
for ext in ("svg", "png"):
    fig.savefig(f"{OUT}/fig02-07-necessity-test.{ext}", bbox_inches="tight", dpi=200)
plt.close(fig)

# ----------------------------------------------------------------------------
# Figure 5.5 - Absorption partition
# ----------------------------------------------------------------------------
fig, ax = plt.subplots(figsize=(11, 6.6))
ax.set_xlim(0, 12); ax.set_ylim(0, 10); ax.axis("off")

cols = [
    (2.0, "#eaf2f8", ACCENT, "ABSORBED INTO THE GPU PLATFORM\n(evidence class A)",
     ["Matrix density → tensor cores",
      "Precision → FP16/BF16/FP8 engines",
      "Structured sparsity → 2:4 paths",
      "Movement overhead → async copy / TMA",
      "Launch overhead → graph capture",
      "Scale-up comms → NVLink domains",
      "Isolation → device partitioning"]),
    (6.0, "#fef9e7", "#9a7d0a", "CONTESTED MIDDLE\n(decided by §2.14 condition 4)",
     ["Low-batch decode bandwidth bound",
      "MoE routing / all-to-all (~1/3 step time)",
      "Near-memory embedding lookup",
      "Phase-disaggregated serving",
      "",
      "GPU trajectory + software capital\nvs. contract-changing designs"]),
    (10.0, "#e8f6ef", "#1e8449", "STRUCTURALLY OUTSIDE THE\nTHROUGHPUT CONTRACT",
     ["Wake-scope / always-on energy\n(µW vs W domains)",
      "Provable worst-case timing\nand certification",
      "Near-sensor locality",
      "Embedded per-unit cost floors",
      "",
      "Secure basis of the\nbeyond-GPU case"]),
]
for x, fc, ec, title, items in cols:
    box = FancyBboxPatch((x - 1.85, 0.6), 3.7, 7.6, boxstyle="round,pad=0.1",
                         fc=fc, ec=ec, lw=1.4)
    ax.add_patch(box)
    ax.text(x, 8.6, title, ha="center", va="center", fontsize=9, fontweight="bold",
            color=ec)
    y = 7.6
    for it in items:
        if it:
            ax.text(x, y, it, ha="center", va="top", fontsize=8.3)
        y -= 1.05

ax.text(6.0, 9.7, "Residual bounds from Chapter 2, partitioned by whether GPU evolution can absorb them\nwithout abandoning the platform contract (host-driven submission, SIMT programmability, shared software capital)",
        ha="center", fontsize=9)
ax.set_title("Figure 5.5 — Partition of residual bounds by absorbability", fontsize=10.5)
fig.tight_layout()
for ext in ("svg", "png"):
    fig.savefig(f"{OUT}/fig05-05-absorption-partition.{ext}", bbox_inches="tight", dpi=200)
plt.close(fig)

print("done:", os.listdir(OUT))
