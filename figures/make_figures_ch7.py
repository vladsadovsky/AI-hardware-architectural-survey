#!/usr/bin/env python3
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import os
OUT = "/sessions/compassionate-blissful-planck/mnt/AI-hardware-architectural-survey/figures"
plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 9,
                     "axes.spines.top": False, "axes.spines.right": False})
fig, ax = plt.subplots(figsize=(9, 6))
# name, capacity GB, bandwidth TB/s, class, color, marker
pts = [
    ("B300-class (NVIDIA)\n[A/D]", 288, 8.0, "#555555", "o"),
    ("MI355X (AMD) [A]", 288, 8.0, "#b03a2e", "s"),
    ("MI400 (AMD, announced)\n[B]", 432, 19.6, "#b03a2e", "^"),
    ("Ironwood TPU v7\n(Google) [A/B]", 192, 7.37, "#1a6a9a", "o"),
    ("Trainium3 (AWS) [A]", 144, 4.9, "#1e8449", "o"),
    ("Maia 200 (Microsoft)\n[A/B]", 216, 7.0, "#6c3483", "o"),
]
offsets = {"B300-class (NVIDIA)\n[A/D]": (-10, 14), "MI355X (AMD) [A]": (8, -22)}
for name, cap, bw, c, m in pts:
    ax.scatter(cap, bw, s=90, color=c, marker=m, zorder=5)
    dx, dy = offsets.get(name, (8, 6))
    ax.annotate(name, (cap, bw), textcoords="offset points", xytext=(dx, dy), fontsize=8)
ax.set_xlabel("HBM capacity per package (GB)")
ax.set_ylabel("Memory bandwidth per package (TB/s)")
ax.set_xlim(100, 500); ax.set_ylim(3, 22)
ax.grid(alpha=0.15)
ax.set_title("Figure 7.1 — Mid-2026 flagship accelerators: the industry converged on the memory bound\n"
             "(per-package vendor figures; ^ = announced, not shipping; evidence classes in brackets)", fontsize=9.5)
fig.tight_layout()
for ext in ("svg", "png"):
    fig.savefig(f"{OUT}/fig07-01-flagship-memory-2026.{ext}", bbox_inches="tight", dpi=200)
print("done")
