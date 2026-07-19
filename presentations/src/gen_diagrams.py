import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Rectangle, Circle, Ellipse
import numpy as np, os

OUT="/sessions/compassionate-blissful-planck/mnt/outputs/deck_assets"
os.makedirs(OUT, exist_ok=True)

SLATE="#16232E"; INK="#263947"; TEAL="#0E8C9B"; AMBER="#E08A2B"; BLUE="#2E6E9E"
GRAY="#7C8B96"; LGRAY="#E7ECEF"; GREEN="#3F9E6A"; RED="#C0503C"; PANEL="#F4F7F8"
plt.rcParams.update({"font.family":"DejaVu Sans","font.size":12,"axes.edgecolor":INK})

def box(ax,x,y,w,h,fc,ec=None,tc="white",text="",fs=12,bold=True,round=0.02,alpha=1,ha="center"):
    ax.add_patch(FancyBboxPatch((x,y),w,h,boxstyle=f"round,pad=0,rounding_size={round}",
        fc=fc,ec=ec or fc,lw=1.4,alpha=alpha,zorder=2))
    if text:
        ax.text(x+w/2 if ha=="center" else x+0.04, y+h/2, text, ha=ha, va="center",
            color=tc, fontsize=fs, fontweight="bold" if bold else "normal", zorder=3, wrap=True)
def arrow(ax,x1,y1,x2,y2,c=INK,lw=2.2,style="-|>",ms=14):
    ax.add_patch(FancyArrowPatch((x1,y1),(x2,y2),arrowstyle=style,mutation_scale=ms,
        color=c,lw=lw,zorder=1))
def save(fig,name):
    fig.savefig(f"{OUT}/{name}.png",dpi=200,bbox_inches="tight",facecolor="white",pad_inches=0.08)
    plt.close(fig)
def blank(w=9,h=4.8):
    fig,ax=plt.subplots(figsize=(w,h)); ax.set_xlim(0,10); ax.set_ylim(0,10*h/w)
    ax.axis("off"); return fig,ax

# 1 TWO TRANSITIONS
fig,ax=blank(10,4.6); H=10*4.6/10
lanes=["Hyperscale / datacenter","Client / mobile","Embedded / robotics"]
cols=[TEAL,BLUE,AMBER]
for i,(ln,c) in enumerate(zip(lanes,cols)):
    y=H-1.4-i*1.35
    ax.text(0.05,y+0.32,ln,fontsize=11,color=INK,fontweight="bold")
    box(ax,0.05,y-0.28,2.4,0.62,PANEL,LGRAY,INK,"CPU-centric\noptimization",9,False)
    box(ax,3.05,y-0.28,2.6,0.62,c,c,"white","Heterogeneous\nacceleration (GPU/DSP)",9)
    box(ax,6.25,y-0.28,3.4,0.62,SLATE,SLATE,"white","AI-specific specialization\n(TPU / NPU / µNPU)",9)
    arrow(ax,2.5,y+0.03,3.0,y+0.03,GRAY,2,"-|>",12)
    arrow(ax,5.7,y+0.03,6.2,y+0.03,GRAY,2,"-|>",12)
ax.text(2.75,H-0.35,"Transition 1",ha="center",fontsize=12,color=TEAL,fontweight="bold")
ax.text(7.9,H-0.35,"Transition 2",ha="center",fontsize=12,color=AMBER,fontweight="bold")
save(fig,"two_transitions")

# 2 DATA MOVEMENT ENERGY (relative, Horowitz-style 45nm)
fig,ax=plt.subplots(figsize=(8.2,4.4))
labels=["FP32\nadd","FP32\nmult","8KB SRAM\nread","DRAM\nword read"]
vals=[0.9,3.7,5,640]; cols=[TEAL,TEAL,BLUE,AMBER]
b=ax.bar(labels,vals,color=cols,zorder=3,width=0.62)
ax.set_yscale("log"); ax.set_ylabel("Energy per operation  (pJ, ~45nm)",fontsize=11)
for r,v in zip(b,vals): ax.text(r.get_x()+r.get_width()/2,v*1.15,f"{v:g} pJ",ha="center",fontsize=11,fontweight="bold",color=INK)
ax.set_ylim(0.4,1600); ax.grid(axis="y",ls=":",color=LGRAY,zorder=0)
for s in ["top","right"]: ax.spines[s].set_visible(False)
ax.text(0.5,0.94,"Moving a word from DRAM costs ~700× a FP add",transform=ax.transAxes,ha="center",fontsize=11.5,color=RED,fontweight="bold")
save(fig,"data_energy")

# 3 MEMORY HIERARCHY LADDER
fig,ax=blank(8.6,4.8); H=10*4.8/8.6
tiers=[("Registers","~KB","<1 cyc",TEAL),("On-chip SRAM / scratchpad","~10s MB","few cyc",TEAL),
       ("Cache","~10s MB","~10 cyc",BLUE),("HBM / device DRAM","10s–100s GB","~100s cyc",AMBER),
       ("Host / CXL memory","~TB","~1000s cyc",AMBER),("Remote / storage","∞","10^4+ cyc",SLATE)]
n=len(tiers)
for i,(name,cap,lat,c) in enumerate(tiers):
    w=2.6+i*1.15; x=(10-w)/2; y=H-0.9-i*(H-1.4)/n
    box(ax,x,y,w,0.62,c,c,"white",name,10)
    ax.text(x+w+0.12,y+0.31,f"{cap}",fontsize=9,color=INK,va="center",ha="left")
ax.annotate("",xy=(9.6,0.4),xytext=(9.6,H-0.6),arrowprops=dict(arrowstyle="-|>",color=RED,lw=2.5))
ax.text(9.85,H/2-0.3,"capacity ↑   latency ↑   energy/access ↑",rotation=90,va="center",ha="center",fontsize=10,color=RED,fontweight="bold")
ax.text(0.15,H-0.5,"arithmetic",fontsize=9,color=GRAY,style="italic")
save(fig,"mem_hierarchy")

# 4 CPU vs GPU silicon
fig,ax=blank(9,4.4); H=10*4.4/9
box(ax,0.2,0.4,4.3,H-1.0,PANEL,LGRAY,INK,"",0)
ax.text(2.35,H-0.75,"CPU",ha="center",fontsize=15,color=INK,fontweight="bold")
for i in range(2):
    for j in range(2):
        box(ax,0.6+i*1.9,0.9+j*1.4,1.5,1.1,TEAL,TEAL,"white","core",11)
ax.text(2.35,0.6,"few large cores · caches · prediction",ha="center",fontsize=8.5,color=GRAY)
box(ax,5.5,0.4,4.3,H-1.0,PANEL,LGRAY,INK,"",0)
ax.text(7.65,H-0.75,"GPU",ha="center",fontsize=15,color=INK,fontweight="bold")
for i in range(8):
    for j in range(5):
        box(ax,5.75+i*0.49,0.9+j*0.5,0.4,0.4,AMBER,AMBER,"","",0,round=0.05)
ax.text(7.65,0.6,"many throughput lanes · matrix units · HBM",ha="center",fontsize=8.5,color=GRAY)
save(fig,"cpu_gpu")

# 5 GPU EFFICIENCY ENVELOPE
fig,ax=plt.subplots(figsize=(8.4,4.6))
axes_lbl=["parallelism","coalesced\naccess","lane\nregularity","occupancy","batchability","amortized\noverhead"]
N=len(axes_lbl); ang=np.linspace(0,2*np.pi,N,endpoint=False)
hi=[0.95]*N; lo=[0.25,0.3,0.2,0.35,0.25,0.3]
for vals,c,lab,al in [(hi,TEAL,"efficient region",0.28),(lo,AMBER,"leakage region",0.30)]:
    v=vals+[vals[0]]; a=list(ang)+[ang[0]]
    ax.plot(a,v,color=c,lw=2.2,label=lab); ax.fill(a,v,color=c,alpha=al)
ax=plt.subplot(111,polar=True)
ax.clear()
for vals,c,lab,al in [(hi,TEAL,"GPU-efficient work",0.25),(lo,AMBER,"where GPUs leak",0.30)]:
    v=np.array(vals+[vals[0]]); a=np.append(ang,ang[0])
    ax.plot(a,v,color=c,lw=2.4,label=lab); ax.fill(a,v,color=c,alpha=al)
ax.set_xticks(ang); ax.set_xticklabels(axes_lbl,fontsize=9.5,color=INK)
ax.set_yticks([]); ax.set_ylim(0,1); ax.spines["polar"].set_color(LGRAY)
ax.legend(loc="upper right",bbox_to_anchor=(1.22,1.12),fontsize=9,frameon=False)
save(plt.gcf(),"gpu_envelope")

# 6 WAKE SCOPE 4 ORDERS
fig,ax=plt.subplots(figsize=(8.4,4.4))
tiers=["Always-on\nsensor tap","Sensor hub /\nmicroNPU","SoC NPU\n(on-device LLM)","Cloud round-trip\n(datacenter)"]
p=[0.0003,0.05,3,50]; cols=[GREEN,TEAL,BLUE,AMBER]
b=ax.barh(range(4),p,color=cols,zorder=3,height=0.6)
ax.set_yticks(range(4)); ax.set_yticklabels(tiers,fontsize=10)
ax.set_xscale("log"); ax.set_xlabel("Approx. power / energy scale per inference  (log)",fontsize=10)
for r,v in zip(b,p): ax.text(v*1.3,r.get_y()+0.3,f"~{v:g}",va="center",fontsize=10,fontweight="bold",color=INK)
ax.invert_yaxis(); ax.set_xlim(0.0001,300); ax.grid(axis="x",ls=":",color=LGRAY,zorder=0)
for s in ["top","right"]: ax.spines[s].set_visible(False)
ax.text(0.98,0.06,"~4 orders of magnitude",transform=ax.transAxes,ha="right",fontsize=11,color=RED,fontweight="bold")
save(fig,"wake_scope")

# 7 SIX CONTRACTS
fig,ax=blank(10,4.8); H=10*4.8/10
box(ax,0.1,H/2-0.7,2.1,1.4,SLATE,SLATE,"white","Workload\nsignature\n(Ch.2)",11)
cs=["Execution","Data placement","Numerical","Scheduling","Communication","Software"]
for i,c in enumerate(cs):
    y=H-0.7-i*(H-0.9)/6
    box(ax,3.4,y-0.28,3.2,0.56,TEAL if i%2==0 else BLUE,None,"white",c,10)
    arrow(ax,2.2,H/2,3.35,y,GRAY,1.4,"-|>",9)
box(ax,7.8,H/2-0.7,2.1,1.4,AMBER,AMBER,"white","Deployment\nobjectives\n& metrics",10.5)
for i in range(6):
    y=H-0.7-i*(H-0.9)/6
    arrow(ax,6.6,y,7.75,H/2,GRAY,1.4,"-|>",9)
ax.text(5,H-0.15,"Six architectural contracts",ha="center",fontsize=12,color=INK,fontweight="bold")
save(fig,"six_contracts")

# 8 NECESSITY CASES
fig,ax=blank(10,3.6); H=10*3.6/10
cases=[("TPU v1","all 4 conditions hold","SPECIALIZE",GREEN),
       ("Nervana / Graphcore","condition 4 fails","MARKET SAYS NO",RED),
       ("Enterprise private serving","conditions 2 & 4 fail","STAY ON GPU",BLUE)]
for i,(t,d,v,c) in enumerate(cases):
    x=0.2+i*3.3
    box(ax,x,0.5,3.0,H-1.0,PANEL,LGRAY,INK,"",0)
    ax.text(x+1.5,H-1.0,t,ha="center",fontsize=12,color=INK,fontweight="bold")
    ax.text(x+1.5,H-1.5,d,ha="center",fontsize=9.5,color=GRAY)
    box(ax,x+0.45,0.75,2.1,0.6,c,c,"white",v,10)
save(fig,"necessity_cases")

# 9 COST STACK
fig,ax=blank(6.6,5.0); H=10*5.0/6.6
layers=["Die (node, yield)","Memory (HBM / LPDDR)","Packaging (interposer)","Board / node","Fabric (switch, optics)","Rack + cooling","Facility power","Software enablement","Ops + risk"]
cols=[AMBER,AMBER,BLUE,BLUE,TEAL,TEAL,SLATE,GREEN,GRAY]
for i,(l,c) in enumerate(zip(layers,cols)):
    y=0.4+i*(H-0.9)/len(layers)
    box(ax,1.6,y,6.8,(H-0.9)/len(layers)-0.08,c,c,"white",l,9.5)
ax.text(5,H-0.25,"Cost per unit of useful work",ha="center",fontsize=11,color=INK,fontweight="bold")
save(fig,"cost_stack")

# 10 NARROW WAIST
fig,ax=blank(7.2,4.8); H=10*4.8/7.2
top=["PyTorch / JAX  (authoring)"]; waist="Kernel DSL (Triton-class)  ·  the narrow waist"
bot=["GPU","Tensor proc.","Dataflow","NPU"]
box(ax,1.5,H-1.1,7,0.7,TEAL,TEAL,"white",top[0],11)
box(ax,2.2,H/2-0.35,5.6,0.7,AMBER,AMBER,"white",waist,10.5)
for i,bname in enumerate(bot):
    box(ax,0.7+i*2.25,0.5,2.0,0.7,SLATE,SLATE,"white",bname,10)
    arrow(ax,5,H/2-0.35,1.7+i*2.25,1.25,GRAY,1.4,"-|>",9)
arrow(ax,5,H-1.1,5,H/2+0.4,GRAY,2,"-|>",12)
ax.text(5,H-0.2,"Where the moat sits: not syntax, but the layers above and below",ha="center",fontsize=9.5,color=GRAY,style="italic")
save(fig,"narrow_waist")

# 11 FUTURE EVIDENCE GRADES
fig,ax=plt.subplots(figsize=(8.6,4.4))
items=["HBM4 / CPO / FP4 (scheduled)","PIM primitives (standardizing)","Photonic interconnect","Analog in-memory","Photonic computation","Post-CMOS logic"]
grade=[5,3.5,4.5,2.5,1.5,0.7]; cols=[GREEN,TEAL,GREEN,AMBER,RED,RED]
b=ax.barh(range(len(items)),grade,color=cols,height=0.6,zorder=3)
ax.set_yticks(range(len(items))); ax.set_yticklabels(items,fontsize=10)
ax.invert_yaxis(); ax.set_xlim(0,5.5)
ax.set_xticks([0.7,2.5,4,5]); ax.set_xticklabels(["E\nspeculative","C\ndeveloping","B\nannounced","A\nshipping"],fontsize=9)
ax.grid(axis="x",ls=":",color=LGRAY,zorder=0)
for s in ["top","right","left"]: ax.spines[s].set_visible(False)
ax.text(0.5,1.02,"Futures graded by evidence class",transform=ax.transAxes,ha="center",fontsize=11,color=INK,fontweight="bold")
save(fig,"future_grades")

# 12 BREAK-EVEN
fig,ax=plt.subplots(figsize=(8.2,4.4))
v=np.logspace(8,12,100)
for adv,c in [(0.15,BLUE),(0.30,TEAL),(0.50,AMBER)]:
    payback=3e7/(v*0.69e-6*adv)/365.0
    ax.plot(v,payback,color=c,lw=2.4,label=f"{int(adv*100)}% advantage")
ax.axhline(2,color=RED,ls="--",lw=1.6); ax.text(1.2e8,2.4,"2-year payback line",color=RED,fontsize=9.5,fontweight="bold")
ax.set_xscale("log"); ax.set_yscale("log")
ax.set_xlabel("Sustained useful tokens / day",fontsize=10); ax.set_ylabel("Payback (years)",fontsize=10)
ax.set_ylim(0.03,1000); ax.legend(fontsize=9,frameon=False)
ax.grid(ls=":",color=LGRAY); 
for s in ["top","right"]: ax.spines[s].set_visible(False)
ax.text(0.5,1.02,"Volume decides — architecture held constant (illustrative)",transform=ax.transAxes,ha="center",fontsize=10.5,color=INK,fontweight="bold")
save(fig,"break_even")

# 13 DATAFLOW TIMELINE
fig,ax=blank(9,3.8); H=10*3.8/9
ax.text(0.1,H-0.4,"GPU: uncertainty discovered at run time",fontsize=10.5,color=INK,fontweight="bold")
np.random.seed(1); x=0.3
for i in range(7):
    w=0.7+np.random.rand()*0.7
    box(ax,x,H-1.25,w,0.5,TEAL,TEAL,"white","",0,round=0.03)
    x+=w+0.15+np.random.rand()*0.25
ax.text(x+0.05,H-1.0,"variance",fontsize=9,color=RED,style="italic")
ax.text(0.1,H-2.0,"Dataflow / tile: schedule fixed at compile time",fontsize=10.5,color=INK,fontweight="bold")
x=0.3
for i in range(7):
    box(ax,x,H-2.85,0.85,0.5,AMBER,AMBER,"white","",0,round=0.03)
    x+=1.0
ax.text(x+0.05,H-2.6,"zero variance",fontsize=9,color=GREEN,style="italic")
save(fig,"dataflow_timeline")

# 14 NPU POWER DOMAINS
fig,ax=blank(8.6,4.4); H=10*4.4/8.6
box(ax,0.3,0.4,9.4,H-0.8,PANEL,LGRAY,INK,"",0)
ax.text(5,H-0.65,"One SoC, staged wake domains",ha="center",fontsize=12,color=INK,fontweight="bold")
dm=[("Always-on tap","µW",GREEN),("Sensor hub / µNPU","mW",TEAL),("NPU","100s mW",BLUE),("CPU + GPU","W",AMBER)]
for i,(n,pw,c) in enumerate(dm):
    x=0.7+i*2.28
    box(ax,x,0.9,2.0,1.5,c,c,"white",n,10)
    ax.text(x+1.0,0.62,pw,ha="center",fontsize=10,color=INK,fontweight="bold")
    if i<3: arrow(ax,x+2.0,1.65,x+2.28,1.65,GRAY,1.6,"-|>",10)
ax.text(5,H-1.15,"each tier gates the next's wake — energy ∝ wake scope",ha="center",fontsize=9.5,color=GRAY,style="italic")
save(fig,"npu_domains")

# 15 PREFILL vs DECODE
fig,ax=blank(9,3.6); H=10*3.6/9
box(ax,0.3,0.6,4.3,H-1.2,PANEL,LGRAY,INK,"",0)
ax.text(2.45,H-1.05,"PREFILL",ha="center",fontsize=13,color=TEAL,fontweight="bold")
ax.text(2.45,H-1.6,"compute-bound",ha="center",fontsize=10.5,color=INK)
ax.text(2.45,0.95,"high arithmetic intensity\nparallel over the prompt",ha="center",fontsize=9.5,color=GRAY)
box(ax,5.4,0.6,4.3,H-1.2,PANEL,LGRAY,INK,"",0)
ax.text(7.55,H-1.05,"DECODE",ha="center",fontsize=13,color=AMBER,fontweight="bold")
ax.text(7.55,H-1.6,"bandwidth-bound",ha="center",fontsize=10.5,color=INK)
ax.text(7.55,0.95,"one token at a time\nstream all weights per token",ha="center",fontsize=9.5,color=GRAY)
save(fig,"prefill_decode")

# 16 MoE all-to-all
fig,ax=blank(8.6,4.0); H=10*4.0/8.6
for i in range(4):
    box(ax,0.5,0.6+i*0.85,1.6,0.6,TEAL,TEAL,"white",f"token {i+1}",9)
for j in range(4):
    box(ax,6.6,0.6+j*0.85,1.7,0.6,AMBER,AMBER,"white",f"expert {j+1}",9)
np.random.seed(3)
for i in range(4):
    for j in range(4):
        if np.random.rand()<0.5:
            arrow(ax,2.1,0.9+i*0.85,6.6,0.9+j*0.85,LGRAY,0.8,"-",6)
ax.text(4.35,H-0.4,"all-to-all routing  ≈ 1/3 of step time",ha="center",fontsize=11,color=RED,fontweight="bold")
save(fig,"moe")

# 17 IRREGULAR GATHER
fig,ax=blank(9,3.6); H=10*3.6/9
ax.text(2.5,H-0.4,"Dense tile",ha="center",fontsize=11,color=TEAL,fontweight="bold")
for i in range(6):
    box(ax,0.6+i*0.62,H-1.7,0.55,0.55,TEAL,TEAL,"","",0,round=0.03)
ax.text(2.5,H-2.1,"contiguous · reused · prefetchable",ha="center",fontsize=8.5,color=GRAY)
ax.text(7.0,H-0.4,"Irregular gather",ha="center",fontsize=11,color=AMBER,fontweight="bold")
np.random.seed(5)
for i in range(6):
    yy=H-1.7+np.random.rand()*0.1
    box(ax,5.2+i*0.62,H-1.7,0.55,0.55,LGRAY,GRAY,"","",0,round=0.03)
    box(ax,5.2+i*0.62+0.15,H-1.55,0.18,0.25,AMBER,AMBER,"","",0,round=0.02)
ax.text(7.0,H-2.1,"scattered · one useful word per line · evicts",ha="center",fontsize=8.5,color=GRAY)
save(fig,"irregular")

# 18 GROUPED LANDSCAPE
fig,ax=blank(10,4.4); H=10*4.4/10
groups=[("GPU platform\nincumbents","NVIDIA · AMD","absorb bounds\nrack-scale",TEAL),
        ("Hyperscaler\ntensor processors","TPU · Trainium · Maia · MTIA","condition 4 met\nat owner scale",BLUE),
        ("Independent\nchallengers","Groq · Cerebras · SambaNova · Tenstorrent","license / anchor /\nacquire",AMBER)]
for i,(t,names,note,c) in enumerate(groups):
    x=0.2+i*3.3
    box(ax,x,0.5,3.05,H-1.0,PANEL,LGRAY,INK,"",0)
    box(ax,x+0.2,H-1.55,2.65,0.9,c,c,"white",t,11)
    ax.text(x+1.52,H-2.1,names,ha="center",fontsize=9,color=INK)
    ax.text(x+1.52,0.95,note,ha="center",fontsize=9.5,color=c,fontweight="bold")
ax.text(5,H-0.2,"Grouped by how condition 4 resolves — not a product catalog",ha="center",fontsize=10,color=GRAY,style="italic")
save(fig,"grouped_landscape")

# 19 TENSOR BLOCK
fig,ax=blank(9,4.4); H=10*4.4/9
box(ax,0.3,0.5,9.4,H-1.0,PANEL,LGRAY,INK,"",0)
box(ax,3.6,H-1.9,2.8,1.1,AMBER,AMBER,"white","Matrix / tensor\nengine",11)
box(ax,3.9,1.0,2.2,0.7,TEAL,TEAL,"white","Vector unit",10)
box(ax,0.7,1.6,2.3,1.6,BLUE,BLUE,"white","Software-\nmanaged SRAM",10)
box(ax,7.0,1.6,2.3,1.6,BLUE,BLUE,"white","HBM +\ninter-chip links",10)
arrow(ax,3.0,2.4,3.6,H-1.5,GRAY,1.6,"-|>",10)
arrow(ax,6.4,H-1.5,7.0,2.4,GRAY,1.6,"-|>",10)
ax.text(5,H-0.75,"Tensor processor: one compiler-owned schedule",ha="center",fontsize=11,color=INK,fontweight="bold")
save(fig,"tensor_block")

# 20 FPGA TWO SPEEDS
fig,ax=blank(9,3.8); H=10*3.8/9
box(ax,0.4,0.6,4.2,H-1.2,PANEL,LGRAY,INK,"",0)
ax.text(2.5,H-1.05,"Hardware compile",ha="center",fontsize=12,color=AMBER,fontweight="bold")
ax.text(2.5,H-1.7,"hours · max efficiency\nhardware skills",ha="center",fontsize=9.5,color=GRAY)
box(ax,5.4,0.6,4.2,H-1.2,PANEL,LGRAY,INK,"",0)
ax.text(7.5,H-1.05,"Overlay / soft NPU",ha="center",fontsize=12,color=TEAL,fontweight="bold")
ax.text(7.5,H-1.7,"seconds · lower efficiency\nsoftware skills",ha="center",fontsize=9.5,color=GRAY)
ax.text(5,H-0.35,"Reconfigurable fabric: two compilation speeds",ha="center",fontsize=11,color=INK,fontweight="bold")
save(fig,"fpga_speeds")

# 21 WAFER SCALE
fig,ax=blank(8,4.4); H=10*4.4/8
cx,cy,R=3.2,H/2,1.9
ax.add_patch(Circle((cx,cy),R,fc=PANEL,ec=INK,lw=1.6,zorder=1))
for i in range(-2,3):
    for j in range(-2,3):
        if (i*0.62)**2+(j*0.62)**2<(R-0.3)**2:
            c=RED if (i==1 and j==-1) else TEAL
            box(ax,cx+i*0.64-0.28,cy+j*0.64-0.28,0.56,0.56,c,"white","","",0,round=0.02)
ax.text(cx,cy-R-0.4,"one wafer · reticle grid · SRAM per core",ha="center",fontsize=9.5,color=GRAY)
box(ax,6.0,cy+0.2,3.2,0.7,AMBER,AMBER,"white","inter-chip hops\ndisappear",9.5)
box(ax,6.0,cy-0.9,3.2,0.7,SLATE,SLATE,"white","defects routed\naround (red)",9.5)
ax.text(4.0,H-0.35,"Wafer-scale integration",ha="left",fontsize=12,color=INK,fontweight="bold")
save(fig,"wafer")

# 22 PIM FLAVORS
fig,ax=blank(10,3.8); H=10*3.8/10
fl=[("In-DRAM PIM","SIMD beside banks","Aquabolt-XL · UPMEM",TEAL),
    ("All-SRAM inference","no off-chip tier","NorthPole",BLUE),
    ("Memory-tier composition","cheap capacity attached","SN40L",AMBER)]
for i,(t,d,ex,c) in enumerate(fl):
    x=0.2+i*3.3
    box(ax,x,0.6,3.05,H-1.2,PANEL,LGRAY,INK,"",0)
    box(ax,x+0.2,H-1.55,2.65,0.75,c,c,"white",t,10.5)
    ax.text(x+1.52,H-2.05,d,ha="center",fontsize=9.5,color=INK)
    ax.text(x+1.52,0.95,ex,ha="center",fontsize=9,color=c,fontweight="bold")
ax.text(5,H-0.2,"Compute moves to the data — three flavors",ha="center",fontsize=11,color=INK,fontweight="bold")
save(fig,"pim_flavors")

# 23 SIGNATURES MATRIX
fig,ax=plt.subplots(figsize=(9,4.2))
rows=["Training matmul","Transformer decode","Embedding lookup","Graph aggregation","Robotic planning"]
cols=["arith.\nintensity","locality","parallelism","regularity","batchable","deadline"]
data=np.array([[3,3,3,3,3,0],[0,1,1,3,1,1],[0,0,3,0,2,0],[0,0,2,0,1,1],[1,1,1,1,0,3]])
cmap=matplotlib.colors.ListedColormap([LGRAY,"#BFD8DA",TEAL,INK])
ax.imshow(data,cmap=cmap,aspect="auto")
ax.set_xticks(range(len(cols))); ax.set_xticklabels(cols,fontsize=9)
ax.set_yticks(range(len(rows))); ax.set_yticklabels(rows,fontsize=10)
for i in range(len(rows)):
    for j in range(len(cols)):
        ax.text(j,i,["–","lo","hi","▮"][data[i,j]],ha="center",va="center",color="white" if data[i,j]>=2 else GRAY,fontsize=9,fontweight="bold")
ax.set_title("Workload signatures, not labels",fontsize=12,color=INK,fontweight="bold",pad=10)
for s in ax.spines.values(): s.set_visible(False)
ax.tick_params(length=0)
save(fig,"signatures")

# 24 ROOFLINE DECODE
fig,ax=plt.subplots(figsize=(8.4,4.4))
oi=np.logspace(-0.5,3,100); peak=1980; bw=3.35
roof=np.minimum(peak,bw*oi)
ax.plot(oi,roof,color=INK,lw=2.4)
ax.axhline(peak,ls=":",color=GRAY)
ax.scatter([2],[bw*2],color=AMBER,zorder=5,s=70); ax.text(2,bw*2*1.4,"decode\n≈2 FLOP/byte",color=AMBER,fontsize=9.5,ha="center",fontweight="bold")
ax.scatter([400],[peak],color=TEAL,zorder=5,s=70); ax.text(400,peak*0.5,"prefill\n(compute-bound)",color=TEAL,fontsize=9.5,ha="center",fontweight="bold")
ax.set_xscale("log"); ax.set_yscale("log")
ax.set_xlabel("Arithmetic intensity (FLOP / byte)",fontsize=10); ax.set_ylabel("Attainable TFLOP/s",fontsize=10)
ax.grid(ls=":",color=LGRAY)
for s in ["top","right"]: ax.spines[s].set_visible(False)
ax.text(0.5,1.03,"Batch-one decode: ~48 tok/s ceiling for a 70B model — bandwidth, not compute",transform=ax.transAxes,ha="center",fontsize=9.8,color=RED,fontweight="bold")
save(fig,"roofline_decode")

print("done", len(os.listdir(OUT)), "assets")
