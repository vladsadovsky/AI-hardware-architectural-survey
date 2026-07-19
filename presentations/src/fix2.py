import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import numpy as np
OUT="/sessions/compassionate-blissful-planck/mnt/outputs/deck_assets"
SLATE="#16232E"; INK="#263947"; TEAL="#0E8C9B"; AMBER="#E08A2B"; BLUE="#2E6E9E"; GRAY="#7C8B96"; LGRAY="#E7ECEF"
plt.rcParams.update({"font.family":"DejaVu Sans"})
def save(fig,n): fig.savefig(f"{OUT}/{n}.png",dpi=200,bbox_inches="tight",facecolor="white",pad_inches=0.08); plt.close(fig)

# gpu_envelope clean polar
fig=plt.figure(figsize=(8.0,4.6)); ax=fig.add_subplot(111,polar=True)
lbl=["parallelism","coalesced\naccess","lane\nregularity","occupancy","batchability","amortized\noverhead"]
N=len(lbl); ang=np.linspace(0,2*np.pi,N,endpoint=False)
hi=[0.95]*N; lo=[0.28,0.32,0.22,0.38,0.27,0.33]
for vals,c,lab,al in [(hi,TEAL,"GPU-efficient work",0.22),(lo,AMBER,"where GPUs leak",0.32)]:
    v=np.append(vals,vals[0]); a=np.append(ang,ang[0])
    ax.plot(a,v,color=c,lw=2.6,label=lab); ax.fill(a,v,color=c,alpha=al)
ax.set_xticks(ang); ax.set_xticklabels(lbl,fontsize=10,color=INK)
ax.set_yticks([]); ax.set_ylim(0,1.05); ax.spines["polar"].set_color(LGRAY)
ax.grid(color=LGRAY)
ax.legend(loc="lower center",bbox_to_anchor=(0.5,-0.22),ncol=2,fontsize=10,frameon=False)
save(fig,"gpu_envelope")

# narrow_waist fixed
def box(ax,x,y,w,h,fc,tc="white",text="",fs=12,round=0.02):
    ax.add_patch(FancyBboxPatch((x,y),w,h,boxstyle=f"round,pad=0,rounding_size={round}",fc=fc,ec=fc,lw=1.4,zorder=2))
    ax.text(x+w/2,y+h/2,text,ha="center",va="center",color=tc,fontsize=fs,fontweight="bold",zorder=3)
def arrow(ax,x1,y1,x2,y2,c=INK,lw=2,ms=12):
    ax.add_patch(FancyArrowPatch((x1,y1),(x2,y2),arrowstyle="-|>",mutation_scale=ms,color=c,lw=lw,zorder=1))
fig,ax=plt.subplots(figsize=(7.6,4.8)); H=10*4.8/7.6; ax.set_xlim(0,10); ax.set_ylim(0,H); ax.axis("off")
box(ax,1.3,H-1.15,7.4,0.72,TEAL,"white","PyTorch / JAX  (authoring)",12)
box(ax,1.1,H/2-0.4,7.8,0.8,AMBER,"white","Kernel DSL (Triton-class)  —  the narrow waist",11)
for i,b in enumerate(["GPU","Tensor proc.","Dataflow","NPU"]):
    box(ax,0.7+i*2.25,0.5,2.0,0.72,SLATE,"white",b,10.5)
    arrow(ax,5,H/2-0.4,1.7+i*2.25,1.28,GRAY,1.4,9)
arrow(ax,5,H-1.15,5,H/2+0.4,GRAY,2,12)
ax.text(5,H-0.25,"The moat is not syntax — it is the layers above and below",ha="center",fontsize=9.5,color=GRAY,style="italic")
save(fig,"narrow_waist")
print("fixed")
