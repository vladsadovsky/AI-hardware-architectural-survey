#!/usr/bin/env python3
"""Chapter 6 prototype figures. Prototype quality by design; content over aesthetics.
All numeric values from public disclosures cited in references.md."""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Ellipse, FancyArrowPatch, Rectangle
import numpy as np
import os

OUT = "/sessions/compassionate-blissful-planck/mnt/AI-hardware-architectural-survey/figures"
plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 9,
                     "axes.spines.top": False, "axes.spines.right": False})
ACCENT = "#1a6a9a"; ACCENT2 = "#b03a2e"; GRAY = "#555555"

# ---------------------------------------------------------------- fig06-01
fig, ax = plt.subplots(figsize=(10, 7))
ax.set_xlim(0, 10); ax.set_ylim(0, 10)
ax.set_xlabel("When execution uncertainty is resolved  →")
ax.set_ylabel("Where state lives relative to arithmetic  →")
ax.set_xticks([1, 4, 7, 9.2])
ax.set_xticklabels(["runtime\n(hardware discovers)", "compile time\n(compiler owns)",
                    "design time\n(geometry owns)", "input-driven\n(events own)"], fontsize=8)
ax.set_yticks([1.2, 4, 6.5, 9])
ax.set_yticklabels(["off-package DRAM\nvia caches", "explicit on-chip\nSRAM", "model-scale\nSRAM", "inside the\nmemory itself"], fontsize=8)

def blob(x, y, w, h, label, sec, color, fc):
    ax.add_patch(Ellipse((x, y), w, h, fc=fc, ec=color, lw=1.5, alpha=0.85))
    ax.text(x, y, f"{label}\n{sec}", ha="center", va="center", fontsize=8.3, color="#222")

blob(1.3, 1.6, 2.3, 1.7, "CPU / GPU\nbaseline", "(Ch. 5)", GRAY, "#eeeeee")
blob(3.9, 2.6, 2.4, 1.5, "Tensor\nprocessors", "§6.3", ACCENT, "#eaf2f8")
blob(7.3, 3.0, 2.2, 1.4, "Systolic\nmechanism", "§6.2", ACCENT, "#eaf2f8")
blob(4.6, 4.6, 2.4, 1.4, "Dataflow / tile\n(deterministic)", "§6.4", ACCENT, "#eaf2f8")
blob(4.2, 3.6, 1.9, 1.1, "NPUs", "§6.5", "#1e8449", "#e8f6ef")
blob(6.9, 5.0, 2.1, 1.4, "FPGA /\nreconfigurable", "§6.6", "#9a7d0a", "#fef9e7")
blob(4.9, 6.6, 2.3, 1.3, "Wafer-scale", "§6.7", ACCENT, "#eaf2f8")
blob(4.3, 8.9, 2.6, 1.3, "Memory-centric\n/ PIM", "§6.8", ACCENT2, "#fdf2e9")
blob(9.0, 8.6, 1.9, 1.5, "Neuromorphic", "§6.9", "#6c3483", "#f4ecf7")
ax.annotate("", xy=(4.0, 2.4), xytext=(1.6, 1.7),
            arrowprops=dict(arrowstyle="->", color=GRAY, lw=1, ls="--"))
ax.set_title("Figure 6.1 — The family landscape in contract space (qualitative regions)")
fig.tight_layout()
for ext in ("svg", "png"):
    fig.savefig(f"{OUT}/fig06-01-family-landscape.{ext}", bbox_inches="tight", dpi=200)
plt.close(fig)

# ---------------------------------------------------------------- fig06-02
fig, axes = plt.subplots(1, 3, figsize=(11, 4.2))
N = 4
for p, (axp, t) in enumerate(zip(axes, ["t", "t+1", "t+2"])):
    axp.set_xlim(-1.8, N + 0.8); axp.set_ylim(-1.6, N + 0.6)
    axp.set_aspect("equal"); axp.axis("off")
    axp.set_title(f"cycle {t}", fontsize=10)
    for i in range(N):
        for j in range(N):
            # wavefront: PE (i=row from top, j=col) active if j <= p+? show staggered diagonal
            active = (i + j) <= p + 1
            fc = "#eaf2f8" if not active else "#aed6f1"
            axp.add_patch(Rectangle((j, N - 1 - i), 0.86, 0.86, fc=fc, ec=ACCENT, lw=1))
            axp.text(j + 0.43, N - 1 - i + 0.43, "w", ha="center", va="center",
                     fontsize=8, color="#333")
    # activations entering left edge
    for i in range(N):
        axp.annotate("", xy=(-0.06, N - 1 - i + 0.43), xytext=(-1.0, N - 1 - i + 0.43),
                     arrowprops=dict(arrowstyle="->", color="#1e8449", lw=1.4))
    axp.text(-1.5, N / 2, "activations\nstream in", fontsize=7.5, color="#1e8449",
             ha="center", va="center", rotation=90)
    # partial sums exiting bottom
    for j in range(N):
        axp.annotate("", xy=(j + 0.43, -1.0), xytext=(j + 0.43, -0.08),
                     arrowprops=dict(arrowstyle="->", color=ACCENT2, lw=1.4))
    axp.text(N / 2, -1.45, "partial sums flow down; results exit staggered",
             fontsize=7.5, color=ACCENT2, ha="center")
fig.suptitle("Figure 6.2 — Weight-stationary systolic execution: weights resident (w), activation\n"
             "wavefront advances one hop per cycle; every fetched value is reused across the array",
             fontsize=9.5)
fig.tight_layout(rect=[0, 0, 1, 0.9])
for ext in ("svg", "png"):
    fig.savefig(f"{OUT}/fig06-02-systolic-walkthrough.{ext}", bbox_inches="tight", dpi=200)
plt.close(fig)

# ---------------------------------------------------------------- fig06-08
fig, ax = plt.subplots(figsize=(9.5, 6.4))
# (name, capacity_GB, bandwidth_TBs, tier note, color)
pts = [
    ("A100 80GB (HBM2e)", 80, 2.04, GRAY),
    ("H100 SXM (HBM3)", 80, 3.35, GRAY),
    ("MI300X (HBM3)", 192, 5.3, GRAY),
    ("TPU v4 (HBM)", 32, 1.2, ACCENT),
    ("Groq TSP (SRAM)", 0.22, 80, ACCENT2),
    ("WSE-3 (wafer SRAM)", 44, 21000, ACCENT2),
    ("SN40L HBM tier", 64, 2.0, "#9a7d0a"),
    ("SN40L DDR tier", 1536, 0.2, "#9a7d0a"),
]
for name, cap, bw, c in pts:
    ax.scatter(cap, bw, s=55, color=c, zorder=5)
    ax.annotate(name, (cap, bw), textcoords="offset points", xytext=(7, 4), fontsize=8)
ax.plot([64, 1536], [2.0, 0.2], color="#9a7d0a", lw=0.9, ls=":")
# capacity-only annotations
ax.axvline(0.224, color="#6c3483", lw=0.8, ls="--", alpha=0.6)
ax.text(0.224, 0.035, " NorthPole: 0.224 GB all-on-die\n (aggregate b/w not published)",
        fontsize=7.5, color="#6c3483")
ax.axvline(0.52, color="#1e8449", lw=0.8, ls="--", alpha=0.6)
ax.text(0.55, 0.008, " SN40L on-die SRAM: 0.52 GB\n (b/w not published)", fontsize=7.5, color="#1e8449")
ax.set_xscale("log"); ax.set_yscale("log")
ax.set_xlabel("Fast-memory capacity per device (GB, log)")
ax.set_ylabel("Bandwidth serving compute (TB/s, log)")
ax.set_title("Figure 6.8 — Capacity versus bandwidth across families: no design dominates\n"
             "(published figures; comparison levels differ — package vs socket vs wafer — as annotated in text)",
             fontsize=9.5)
ax.grid(True, which="both", alpha=0.15)
fig.tight_layout()
for ext in ("svg", "png"):
    fig.savefig(f"{OUT}/fig06-08-onchip-memory-landscape.{ext}", bbox_inches="tight", dpi=200)
plt.close(fig)

# ---------------------------------------------------------------- fig06-10
fig, ax = plt.subplots(figsize=(10, 5.6))
families = ["Systolic mechanism (§6.2)", "Tensor processor (§6.3)", "Dataflow/tile (§6.4)",
            "NPU family (§6.5)", "FPGA/reconfig. (§6.6)", "Wafer-scale (§6.7)",
            "Memory-centric/PIM (§6.8)", "Neuromorphic (§6.9)"]
classes = ["Hyperscale", "Enterprise /\nedge infra", "Workstation /\nclient", "Mobile",
           "Embedded / auto /\nrobotics"]
# 3 primary home, 2 viable, 1 ideas migrate, 0 structurally absent
M = np.array([
    [2, 2, 2, 2, 2],
    [3, 2, 1, 1, 2],
    [2, 2, 0, 0, 1],
    [0, 1, 3, 3, 3],
    [2, 2, 0, 0, 3],
    [2, 2, 0, 0, 0],
    [2, 1, 1, 2, 1],
    [0, 0, 0, 1, 2],
])
cmap = matplotlib.colors.ListedColormap(["#f5f5f5", "#fdf2e9", "#d4e6f1", "#7fb3d5"])
ax.imshow(M, cmap=cmap, aspect="auto", vmin=0, vmax=3)
labels = {0: "—", 1: "ideas", 2: "viable", 3: "home"}
for i in range(M.shape[0]):
    for j in range(M.shape[1]):
        ax.text(j, i, labels[M[i, j]], ha="center", va="center", fontsize=8.5)
ax.set_xticks(range(len(classes))); ax.set_xticklabels(classes, fontsize=8.5)
ax.set_yticks(range(len(families))); ax.set_yticklabels(families, fontsize=8.5)
ax.set_title("Figure 6.10 — Family fit across the compute continuum\n"
             "(home = primary deployment; viable = deployed/deployable; ideas = principles migrate; — = structurally absent)",
             fontsize=9.5)
fig.tight_layout()
for ext in ("svg", "png"):
    fig.savefig(f"{OUT}/fig06-10-continuum-fit.{ext}", bbox_inches="tight", dpi=200)
plt.close(fig)

print("done:", [f for f in os.listdir(OUT) if f.startswith("fig06")])
