const pptxgen = require("pptxgenjs");
const A = "/sessions/compassionate-blissful-planck/mnt/outputs/deck_assets/";
const C = { SLATE:"16232E", INK:"263947", TEAL:"0E8C9B", AMBER:"E08A2B", BLUE:"2E6E9E",
  GRAY:"7C8B96", LGRAY:"E7ECEF", PANEL:"F4F7F8", GREEN:"3F9E6A", RED:"C0503C", WHITE:"FFFFFF" };
const HFONT="Cambria", BFONT="Calibri"; const W=13.333, H=7.5;
function newDeck(){ const p=new pptxgen(); p.defineLayout({name:"W",width:W,height:H}); p.layout="W"; return p; }
function notes(s,o){ if(o.notes) s.addNotes(o.notes); }
function footer(s,talk,n){ s.addText(talk,{x:0.5,y:H-0.42,w:8,h:0.3,fontFace:BFONT,fontSize:9,color:C.GRAY});
  s.addText(String(n),{x:W-1.0,y:H-0.42,w:0.5,h:0.3,fontFace:BFONT,fontSize:9,color:C.GRAY,align:"right"}); }
function header(s,k,t){ if(k)s.addText(k.toUpperCase(),{x:0.5,y:0.34,w:11,h:0.3,fontFace:BFONT,fontSize:12,color:C.TEAL,charSpacing:2,bold:true});
  s.addText(t,{x:0.5,y:0.6,w:12.3,h:0.9,fontFace:HFONT,fontSize:30,color:C.INK,bold:true}); }
function imageSlide(p,o){ const s=p.addSlide(); s.background={color:C.WHITE}; header(s,o.kicker,o.title);
  const side=o.bullets&&o.bullets.length; const b= side?{x:0.5,y:1.7,w:8.0,h:o.take?4.2:4.9}:{x:1.4,y:1.7,w:10.5,h:o.take?4.1:4.8};
  s.addImage({path:A+o.img,x:b.x,y:b.y,sizing:{type:"contain",w:b.w,h:b.h}});
  if(side){let by=1.95;o.bullets.forEach(t=>{s.addShape(p.ShapeType.rect,{x:8.9,y:by+0.07,w:0.12,h:0.12,fill:{color:C.AMBER}});
    s.addText(t,{x:9.15,y:by-0.12,w:3.6,h:0.8,fontFace:BFONT,fontSize:13,color:C.INK,valign:"top"});by+=0.82;});}
  if(o.take){s.addShape(p.ShapeType.roundRect,{x:0.5,y:H-1.25,w:12.33,h:0.62,rectRadius:0.06,fill:{color:C.PANEL},line:{color:C.LGRAY,width:1}});
    s.addText([{text:"⇒  ",options:{color:C.AMBER,bold:true}},{text:o.take,options:{color:C.INK}}],{x:0.8,y:H-1.25,w:11.8,h:0.62,fontFace:BFONT,fontSize:14,bold:true,valign:"middle"});}
  footer(s,o.talk,o.n); notes(s,o); }
function titleSlide(p,o){const s=p.addSlide();s.background={color:C.SLATE};
  s.addShape(p.ShapeType.rect,{x:0,y:H-0.9,w:W,h:0.9,fill:{color:C.TEAL}});
  s.addText(o.title,{x:0.8,y:2.2,w:11.7,h:1.8,fontFace:HFONT,fontSize:48,color:C.WHITE,bold:true});
  s.addText(o.sub,{x:0.85,y:3.9,w:11.4,h:1.0,fontFace:BFONT,fontSize:20,color:C.LGRAY});
  s.addText(o.foot,{x:0.85,y:H-0.72,w:11,h:0.5,fontFace:BFONT,fontSize:14,color:C.WHITE,bold:true,valign:"middle"});notes(s,o);}
function sectionSlide(p,o){const s=p.addSlide();s.background={color:C.SLATE};
  s.addText(o.num,{x:0.8,y:2.4,w:2,h:1.6,fontFace:HFONT,fontSize:80,color:C.AMBER,bold:true});
  s.addText(o.title,{x:2.9,y:2.8,w:9.5,h:1.4,fontFace:HFONT,fontSize:40,color:C.WHITE,bold:true});
  if(o.sub)s.addText(o.sub,{x:2.95,y:4.05,w:9.3,h:0.8,fontFace:BFONT,fontSize:17,color:C.LGRAY});footer(s,o.talk,o.n);notes(s,o);}
function cardsSlide(p,o){const s=p.addSlide();s.background={color:C.WHITE};header(s,o.kicker,o.title);
  const cols=o.cols||3,cards=o.cards,rows=Math.ceil(cards.length/cols),gx=0.35,gy=0.3,x0=0.5,y0=1.75;
  const cw=(12.33-(cols-1)*gx)/cols,ch=(H-y0-(o.take?1.0:0.7)-(rows-1)*gy)/rows;
  cards.forEach((cd,i)=>{const cx=x0+(i%cols)*(cw+gx),cy=y0+Math.floor(i/cols)*(ch+gy);
    s.addShape(p.ShapeType.roundRect,{x:cx,y:cy,w:cw,h:ch,rectRadius:0.07,fill:{color:C.PANEL},line:{color:C.LGRAY,width:1}});
    s.addShape(p.ShapeType.roundRect,{x:cx+0.22,y:cy+0.22,w:0.5,h:0.5,rectRadius:0.06,fill:{color:cd.c||C.TEAL}});
    if(cd.tag)s.addText(cd.tag,{x:cx+0.22,y:cy+0.22,w:0.5,h:0.5,fontFace:HFONT,fontSize:15,color:C.WHITE,bold:true,align:"center",valign:"middle"});
    s.addText(cd.h,{x:cx+0.85,y:cy+0.2,w:cw-1.05,h:0.55,fontFace:BFONT,fontSize:14.5,bold:true,color:C.INK,valign:"middle"});
    s.addText(cd.b,{x:cx+0.24,y:cy+0.85,w:cw-0.48,h:ch-1.0,fontFace:BFONT,fontSize:12,color:C.INK,valign:"top"});});
  if(o.take)s.addText([{text:"⇒  ",options:{color:C.AMBER,bold:true}},{text:o.take,options:{color:C.INK}}],{x:0.5,y:H-0.82,w:12.33,h:0.4,fontFace:BFONT,fontSize:13.5,bold:true});
  footer(s,o.talk,o.n);notes(s,o);}
function statSlide(p,o){const s=p.addSlide();s.background={color:C.WHITE};header(s,o.kicker,o.title);
  const n=o.stats.length,gx=0.4,cw=(12.33-(n-1)*gx)/n,y0=2.2,ch=2.9;
  o.stats.forEach((st,i)=>{const cx=0.5+i*(cw+gx);
    s.addShape(p.ShapeType.roundRect,{x:cx,y:y0,w:cw,h:ch,rectRadius:0.08,fill:{color:C.PANEL},line:{color:C.LGRAY,width:1}});
    s.addText(st.v,{x:cx,y:y0+0.35,w:cw,h:1.2,fontFace:HFONT,fontSize:40,bold:true,color:st.c||C.TEAL,align:"center"});
    s.addText(st.l,{x:cx+0.15,y:y0+1.7,w:cw-0.3,h:1.0,fontFace:BFONT,fontSize:13,color:C.INK,align:"center",valign:"top"});});
  if(o.take){s.addShape(p.ShapeType.roundRect,{x:0.5,y:H-1.25,w:12.33,h:0.62,rectRadius:0.06,fill:{color:C.SLATE}});
    s.addText([{text:"⇒  ",options:{color:C.AMBER,bold:true}},{text:o.take,options:{color:C.WHITE}}],{x:0.8,y:H-1.25,w:11.8,h:0.62,fontFace:BFONT,fontSize:14,bold:true,valign:"middle"});}
  footer(s,o.talk,o.n);notes(s,o);}
function closingSlide(p,o){const s=p.addSlide();s.background={color:C.SLATE};
  s.addText("THE ARGUMENT IN ONE SENTENCE",{x:0.8,y:1.7,w:11,h:0.4,fontFace:BFONT,fontSize:13,color:C.AMBER,charSpacing:2,bold:true});
  s.addText(o.line,{x:0.8,y:2.3,w:11.7,h:3.0,fontFace:HFONT,fontSize:27,color:C.WHITE,bold:true,lineSpacingMultiple:1.1});
  if(o.foot)s.addText(o.foot,{x:0.85,y:H-1.1,w:11.5,h:0.6,fontFace:BFONT,fontSize:14,color:C.LGRAY,italic:true});footer(s,o.talk,o.n);notes(s,o);}

const p=newDeck(); const T="Beyond the GPU — 1-hour walkthrough"; let n=1;
titleSlide(p,{title:"Beyond the GPU",sub:"Why AI is driving a second hardware transition — a systems view for software engineers",foot:"Condensed walkthrough  ·  ~1 hour",
  notes:`Framing. Two hardware transitions: CPU→GPU, and now GPU→specialized accelerators. Audience is software/systems, so I introduce each hardware concept conceptually. Core thesis: software optimization keeps hitting PHYSICAL limits — the limits, not software failure, drive specialization. Set expectation: light on products, heavy on the physics and economics.`});
cardsSlide(p,{talk:T,n:++n,kicker:"Roadmap",title:"Where we are going",cols:3,cards:[
  {tag:"1",c:C.TEAL,h:"The driving factors",b:"The physical pressures that push work off the GPU: data movement, memory bandwidth, energy, determinism."},
  {tag:"2",c:C.BLUE,h:"The decision framework",b:"Six architectural contracts and a four-condition test for when specialization is actually justified."},
  {tag:"3",c:C.AMBER,h:"The families",b:"How beyond-GPU accelerators group by which contract they change — not by vendor."},
  {tag:"4",c:C.GREEN,h:"The landscape, grouped",b:"Incumbents, hyperscaler silicon, and challengers — read through the framework, not as a catalog."},
  {tag:"5",c:C.SLATE,h:"Economics",b:"Why lifetime cost and software capital decide most outcomes."},
  {tag:"6",c:C.INK,h:"Conclusions",b:"What holds across the whole compute continuum."}],
  take:"Less time on products; more on the physics and economics that make the choice decidable.",
  notes:`Roadmap. Deliberately NOT a product tour — the products change every quarter; the framework doesn't. Six movements. Tell them the payoff up front: by the end they'll have a repeatable test for "is a specialized accelerator justified here?"`});
cardsSlide(p,{talk:T,n:++n,kicker:"Concepts primer",title:"Six hardware ideas, in software terms",cols:3,cards:[
  {h:"GPU",c:C.TEAL,b:"Thousands of parallel lanes. Fast when work is regular, batched, and streamed from high-bandwidth memory."},
  {h:"Matrix / tensor engine",c:C.TEAL,b:"A block that does a whole matrix tile per instruction — amortizes control over many multiply-adds."},
  {h:"HBM",c:C.BLUE,b:"Stacked DRAM giving multi-TB/s. The scarce resource: capacity and bandwidth, not arithmetic."},
  {h:"NPU",c:C.BLUE,b:"An SoC block plus a compiler that maps a whole model graph onto it at low energy."},
  {h:"TOPS",c:C.AMBER,b:"A peak arithmetic rating. Rarely the bottleneck — treat as marketing, not a benchmark."},
  {h:"Contract",c:C.AMBER,b:"What hardware promises software about execution, memory, numbers, scheduling, comms, and tooling."}],
  notes:`Vocabulary for a software audience — spend ~2 min. The two ideas to plant: (1) HBM bandwidth, not FLOPS, is usually the scarce resource; (2) "contract" — hardware makes promises to software, and specialization means CHANGING one of those promises. TOPS is marketing; return to this when we hit the client landscape.`});
imageSlide(p,{talk:T,n:++n,kicker:"The thesis",title:"Two transitions, across the whole continuum",img:"two_transitions.png",
  take:"Software optimization keeps hitting limits; each transition adds specialization, it does not replace what came before.",
  notes:`The organizing thesis. Both transitions occurred because software optimization exposed limits it could no longer move economically — not because software failed. Stress: each transition ADDS an execution domain; CPUs and GPUs don't go away. The three lanes (datacenter / mobile / embedded) hit the SAME pattern under DIFFERENT dominant constraints — we'll follow all three.`});
imageSlide(p,{talk:T,n:++n,kicker:"Driving factor",title:"Data movement — not arithmetic — dominates energy",img:"data_energy.png",
  bullets:["Compute is nearly free.","Moving operands is not.","So locality and reuse set efficiency, not FLOPS."],
  take:"Every architecture that follows is a different answer to 'move less data, or move it a shorter distance.'",
  notes:`The single most important hardware fact for software people. Horowitz 45nm numbers: an FP add ~0.9 pJ; a DRAM word read ~640 pJ — roughly 700×. So the bottleneck and the energy bill are set by data movement, not by the math unit. This one slide justifies almost every family later: they all move less data or move it a shorter distance. (Numbers are process-node specific but the ratio holds.)`});
imageSlide(p,{talk:T,n:++n,kicker:"Driving factor",title:"Memory is a distance hierarchy",img:"mem_hierarchy.png",
  bullets:["Each step out: more capacity.","Also more latency and energy.","Caches help only if data is reused before eviction."],
  take:"'Memory-bound' is many different problems — each one a lever a specialized design can pull.",
  notes:`Memory is not one thing — it's a ladder trading capacity for latency and energy. "Memory-bound" hides many distinct problems: bandwidth, capacity, cache-line overfetch, irregular access, too little reuse. Caches only pay off when the working set is reused before eviction. Each rung is a different lever a specialized design can pull — remember this at the families section.`});
imageSlide(p,{talk:T,n:++n,kicker:"Concept",title:"CPU and GPU spend silicon differently",img:"cpu_gpu.png",
  bullets:["CPU: low-latency across diverse code.","GPU: throughput across regular work.","Neither is optimal for every phase."],
  take:"Specialization narrows what a design does in exchange for more useful work per unit area and energy.",
  notes:`Where the transistors go. CPU spends area on making diverse, branchy code fast at low latency (caches, prediction, out-of-order). GPU spends it on many throughput lanes. Specialization is just the next step on the same axis: narrow the job further, get more useful work per mm² and per joule — but only for work that fits.`});
imageSlide(p,{talk:T,n:++n,kicker:"Worked bound",title:"Batch-one decode is a bandwidth wall",img:"roofline_decode.png",
  bullets:["70B model, 8-bit, one sequence.","≈48 tokens/s ceiling on an H100.","~0.3% of the matrix throughput usable."],
  take:"No amount of extra arithmetic moves this — it is set by memory bandwidth. This is the pressure that reshapes serving silicon.",
  notes:`The keystone worked example. Generating one token for one sequence means streaming ALL ~70 GB of weights through HBM. At ~3.35 TB/s that's ~48 tokens/s — and you use ~0.3% of the matrix throughput. Author-computed from published datasheets; idealized upper bound. Punchline: adding FLOPS does nothing; only batching (amortize weight reads across sequences) or a changed memory contract helps. This is WHY 2025-26 silicon is going "inference-first" and memory-first.`});
imageSlide(p,{talk:T,n:++n,kicker:"Driving factor",title:"Energy per inference spans four orders of magnitude",img:"wake_scope.png",
  bullets:["Always-on tap: microwatts.","Cloud round-trip: ~watts.","Which domains wake sets the cost."],
  take:"On-device always-on features are impossible on a GPU contract — the wake-scope bound is structural, not an efficiency gap.",
  notes:`"Wake scope" = which power domains must be awake to answer. It spans ~4 orders of magnitude, microwatts (always-on keyword spotting) to watts (cloud round-trip). Key: an always-on feature isn't just cheaper on a tiny engine — it's IMPOSSIBLE within a phone's battery budget on a GPU's submission/memory contract. This is a structural bound, and it's the strongest beyond-GPU territory (comes back at the NPU slide).`});
imageSlide(p,{talk:T,n:++n,kicker:"Driving factor",title:"Mixture-of-experts turns compute into communication",img:"moe.png",
  take:"Routing and all-to-all can be ~1/3 of step time — a bound in the fabric, not the math unit.",
  notes:`Mixture-of-experts routes each token to a few experts, which may live on different devices. The all-to-all exchange can be ~1/3 of a training step. So as models get sparser, the bottleneck moves into the NETWORK FABRIC, not the arithmetic — which is why interconnect (NVLink, UALink, Ethernet) becomes a competitive axis later.`});
statSlide(p,{talk:T,n:++n,kicker:"The honest baseline",title:"Software succeeds — until it meets physics",stats:[
  {v:"3×",l:"IO-aware attention (FlashAttention) throughput",c:C.TEAL},
  {v:"2–4×",l:"KV paging / continuous batching (vLLM)",c:C.BLUE},
  {v:"~34%",l:"of a training step spent in MoE all-to-all",c:C.AMBER},
  {v:"<300 µW",l:"always-on keyword spotting budget",c:C.GREEN}],
  take:"Every gain is real; every gain eventually exposes a residual bound software cannot move. That residue is the case for hardware.",
  notes:`Be fair to software first — this earns credibility. FlashAttention ~3× from IO-awareness, vLLM 2-4× from paged KV + continuous batching. These are huge and real. BUT each success reveals a residual bound it can't cross (MoE all-to-all still ~34%; always-on still <300µW). The hardware case is exactly that RESIDUE — never "software failed."`});
imageSlide(p,{talk:T,n:++n,kicker:"The framework",title:"Hardware defines six contracts",img:"six_contracts.png",
  take:"A workload signature stresses some contracts, not others — that mismatch is where a new architecture earns its place.",
  notes:`Framework, part 1. Any processor makes six promises to software: execution, data placement, numerical, scheduling, communication, software/tooling. A workload's "signature" stresses only SOME of them. A new architecture is justified only where it changes a contract the workload actually stresses — otherwise you've built a faster answer to a question nobody asked.`});
imageSlide(p,{talk:T,n:++n,kicker:"The framework",title:"Is specialization justified? A four-condition test",img:"necessity_cases.png",
  bullets:["1 · residual bound remains","2 · it has a material consequence","3 · hardware changes the bound","4 · lifetime economics repay it"],
  take:"Same architecture, opposite verdicts. Condition 4 — volume and software cost — decides most cases.",
  notes:`Framework, part 2 — the test that makes the whole talk decidable. Four conditions, ALL must hold. Three real outcomes from identical reasoning: TPU v1 → specialize (all four held, published 15-30× throughput, 30-80× perf/W under latency SLOs); Nervana/Graphcore → good silicon, condition 4 failed (no volume, CUDA switching cost); enterprise private serving → stay on GPU (conditions 2 & 4 fail). Condition 4 = volume + software enablement cost — it decides the majority of real cases.`});
imageSlide(p,{talk:T,n:++n,kicker:"GPU vs specialization",title:"What the GPU absorbs — and what it cannot",img:"fig05-05-absorption-partition.png",
  take:"Absorbable bounds go to the platform; structural bounds (wake scope, determinism, near-sensor, cost floors) belong to specialists.",
  notes:`Why the GPU keeps winning the middle — and where it can't. ABSORBED into the GPU platform: matrix density, narrow precision (FP8/FP4), movement overhead, scale-up comms — these just become GPU features (tensor cores, NVLink). STRUCTURALLY NOT absorbable: wake-scope energy, provable worst-case timing, near-sensor locality, embedded cost floors — absorbing them would mean abandoning what makes a GPU a GPU. The CONTESTED middle (low-batch decode, MoE routing, near-memory lookup) is exactly where the commercial fights happen.`});
imageSlide(p,{talk:T,n:++n,kicker:"The families",title:"One map: when uncertainty resolves × where state lives",img:"fig06-01-family-landscape.png",
  take:"Every family is a displacement from the CPU/GPU baseline on these two axes — no point dominates.",
  notes:`Two axes organize every family. Horizontal: WHEN execution uncertainty is resolved — runtime (GPU) → compile time (tensor/dataflow) → design time (fixed-function) → input-driven (neuromorphic). Vertical: WHERE state lives relative to arithmetic — DRAM → on-chip SRAM → inside memory. Every family is a displacement from the CPU/GPU baseline. No point dominates — each purchase of efficiency narrows a envelope — which is why the landscape stays permanently plural.`});
cardsSlide(p,{talk:T,n:++n,kicker:"The families, grouped",title:"Eight families = eight contract changes",cols:4,cards:[
  {h:"Systolic array",c:C.TEAL,b:"Reuse from geometry; data flows through a grid."},
  {h:"Tensor processor",c:C.TEAL,b:"Compiler-owned; matrix engine + managed SRAM (TPU)."},
  {h:"Dataflow / tile",c:C.BLUE,b:"Static schedule; deterministic, low-latency (Groq)."},
  {h:"NPU / near-sensor",c:C.BLUE,b:"Power-domain-first; wake-scope energy (mobile, µNPU)."},
  {h:"FPGA / reconfigurable",c:C.AMBER,b:"Structure set after manufacturing; flexibility."},
  {h:"Wafer-scale",c:C.AMBER,b:"Whole wafer; inter-chip comms become on-wafer."},
  {h:"Memory-centric / PIM",c:C.GREEN,b:"Compute moves to the data; interface carries results."},
  {h:"Neuromorphic",c:C.SLATE,b:"Event-driven; energy ∝ activity (forward-looking)."}],
  take:"Grouped by contract changed, not by company — the taxonomy outlives the products.",
  notes:`The eight families — each is ONE contract change, not "a faster chip." Read them as answers to "which promise did you renegotiate?": systolic = reuse geometry; tensor processor = compiler owns the schedule; dataflow = static, deterministic timing; NPU = design around power domains; FPGA = set structure after manufacturing; wafer-scale = make inter-chip comms on-wafer; PIM = move compute into memory; neuromorphic = let the input schedule the machine. Grouped by contract, not vendor — that's why the taxonomy outlives the product names.`});
imageSlide(p,{talk:T,n:++n,kicker:"Most secure territory",title:"NPUs are the client's standard low-power AI block",img:"npu_domains.png",
  bullets:["Universal in client SoCs (≥40 TOPS floor).","Built for sustained / ambient work — not peak.","Heavy generative inference still runs on the GPU.","Coverage, not TOPS, decides real value."],
  take:"Structural claim: wake-scope energy + cost floors sit outside the GPU contract, so the edge is where specialization is safest — not that NPUs win the client outright.",
  notes:`IMPORTANT — this is an OBSERVATION about ubiquity + structural fit, NOT a claim that NPUs do most client AI compute. Hard facts (class A): every mainstream client SoC ships an NPU; Microsoft Copilot+ mandates ≥40 TOPS (Intel ~48, AMD ~50, Qualcomm 45-85, Apple Neural Engine in every chip since 2017). They're positioned for sustained/ambient low-power work. COUNTER-FACT: heavy local generative inference still runs mostly on the client GPU (CUDA/DirectML) — PCWorld's "the great NPU failure" — because NPU software/operator coverage lags; measured NPU utilization is low. So TOPS ≠ usage. The defensible claim is the takeaway: wake-scope energy and per-unit cost floors are structurally OUTSIDE the GPU contract, so the edge is where specialization is safest. If asked "observation or prediction?": mostly observation (ubiquity + structural niche) plus a conditional forward claim; the word "own" overstates and I've softened it.`});
imageSlide(p,{talk:T,n:++n,kicker:"Strongest lever",title:"Memory-centric designs attack the measured bounds",img:"pim_flavors.png",
  take:"Best condition-3 case in the survey — gated only by the lack of a portable programming model.",
  notes:`Processing-in-memory attacks exactly the bounds we measured (decode streaming, embedding gather, mobile wake energy). Three flavors: in-DRAM SIMD (Samsung Aquabolt-XL, UPMEM), all-SRAM inference (IBM NorthPole), tiered capacity (SambaNova SN40L). It has the STRONGEST condition-3 case in the survey — the lever genuinely changes the bound, doesn't just relocate it. Gated by ONE thing: no portable programming model. Watch for the first mainstream part whose datasheet advertises in-memory ops.`});
imageSlide(p,{talk:T,n:++n,kicker:"The continuum",title:"Same families, different binding constraints",img:"fig06-10-continuum-fit.png",
  take:"Ideas migrate both ways; implementations diverge because each deployment prices the stressors differently.",
  notes:`The same families appear from microwatt silicon to megawatt pods — resized against different binding constraints. Ideas migrate BOTH ways: unified memory and power discipline go up from phones into the datacenter; quantization and compilation come down. Implementations diverge because each deployment class prices the stressors differently (rack power vs battery, tenancy vs wake scope). Argues for ONE shared taxonomy, not two industries.`});
imageSlide(p,{talk:T,n:++n,kicker:"The landscape, grouped",title:"Three groups, one deciding variable",img:"grouped_landscape.png",
  take:"None of the challengers failed on architecture — every trajectory was decided by condition 4.",
  notes:`The landscape in three buckets, read through condition 4 — NOT a product catalog. (1) GPU incumbents (NVIDIA, AMD): absorb bounds, sell rack-scale. (2) Hyperscaler tensor processors (TPU, Trainium, Maia, MTIA): condition 4 met at owner scale — every major cloud now builds one. (3) Independent challengers: Groq licensed into NVIDIA, Cerebras survives on anchor tenancy + IPO, Tenstorrent in acquisition talks, SambaNova an appliance vendor. Punchline: NONE failed on architecture — every outcome was decided by software capital, volume, and distribution.`});
imageSlide(p,{talk:T,n:++n,kicker:"Economics",title:"Volume decides — architecture held constant",img:"break_even.png",
  bullets:["Fixed cost ≈ software enablement.","Recurring savings scale with volume.","Flexibility has option value."],
  take:"Below a volume threshold, no efficiency percentage rescues the case; above it, small percentages justify large programs.",
  notes:`Economics in one chart (numbers illustrative). The fixed cost of specialization is dominated by SOFTWARE enablement (compiler, validation, migration), not silicon. Recurring savings scale with volume; the fixed cost doesn't. So there's a volume threshold: below it, no efficiency percentage rescues the case; above it, even small percentages justify huge programs. This is the arithmetic behind "same architecture, opposite verdicts" — hyperscale vs enterprise differ mainly in the denominator. Also price flexibility as option value: a 20% win today assumes the workload holds still.`});
cardsSlide(p,{talk:T,n:++n,kicker:"Conclusions",title:"What holds across the whole picture",cols:2,cards:[
  {tag:"A",c:C.TEAL,h:"Software converges on physics",b:"Both transitions are software succeeding until it exposes a hard, measurable bound."},
  {tag:"B",c:C.BLUE,h:"Necessity is decidable",b:"A four-condition test returns specialize / market-no / stay-on-GPU — from measurable inputs."},
  {tag:"C",c:C.AMBER,h:"Condition 4 dominates",b:"Software capital, volume, and distribution decide outcomes more than silicon merit."},
  {tag:"D",c:C.GREEN,h:"Families, not a successor",b:"Each changes a contract the GPU cannot adopt without ceasing to be a GPU."},
  {tag:"E",c:C.SLATE,h:"Bounds moved to memory & power",b:"Capacity, bandwidth, fabric, and facility power now separate contenders — not FLOPS."},
  {tag:"F",c:C.INK,h:"One continuum",b:"The same taxonomy reads microwatt silicon and megawatt pods."}],
  notes:`Six findings, each traceable to evidence shown earlier. The two to leave ringing: (C) condition 4 — software capital — decides most outcomes, so audit the software stack before comparing silicon; and (E) the bounds have moved to memory, fabric, and facility power — arithmetic peak no longer separates serious contenders. If they remember one test, it's the four conditions.`});
closingSlide(p,{talk:T,n:++n,line:"Software optimization succeeds until it exposes a bound; the bound is absorbed by the GPU platform, escaped by changing a contract, or lived with — and the deployment class decides which.",
  foot:"Everything else — signatures, contracts, families, economics — is the machinery that makes that choice decidable.",
  notes:`Land the one-sentence summary and stop. Software succeeds until it exposes a bound; that bound is absorbed / escaped by changing a contract / lived with — and the DEPLOYMENT CLASS decides which. Invite the necessity test as the takeaway tool. Q&A prompts likely: NPU-vs-GPU on client, whether hyperscaler silicon kills NVIDIA (no — absorption + condition 4), and PIM timing.`});
p.writeFile({fileName:"/sessions/compassionate-blissful-planck/mnt/outputs/AI_Accelerators_1hr_walkthrough.pptx"}).then(f=>console.log("1h ->",f,"slides",n)).catch(e=>{console.error(e);process.exit(1)});
