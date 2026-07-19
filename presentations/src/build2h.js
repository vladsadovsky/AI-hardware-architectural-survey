const pptxgen = require("pptxgenjs");
const A = "/sessions/compassionate-blissful-planck/mnt/outputs/deck_assets/";
const C = { SLATE:"16232E", INK:"263947", TEAL:"0E8C9B", AMBER:"E08A2B", BLUE:"2E6E9E",
  GRAY:"7C8B96", LGRAY:"E7ECEF", PANEL:"F4F7F8", GREEN:"3F9E6A", RED:"C0503C", WHITE:"FFFFFF" };
const HFONT="Cambria", BFONT="Calibri"; const W=13.333, H=7.5;
function newDeck(){ const p=new pptxgen(); p.defineLayout({name:"W",width:W,height:H}); p.layout="W"; return p; }
function footer(s,talk,n){ s.addText(talk,{x:0.5,y:H-0.42,w:8,h:0.3,fontFace:BFONT,fontSize:9,color:C.GRAY});
  s.addText(String(n),{x:W-1.0,y:H-0.42,w:0.5,h:0.3,fontFace:BFONT,fontSize:9,color:C.GRAY,align:"right"}); }
function header(s,k,t){ if(k)s.addText(k.toUpperCase(),{x:0.5,y:0.34,w:11,h:0.3,fontFace:BFONT,fontSize:12,color:C.TEAL,charSpacing:2,bold:true});
  s.addText(t,{x:0.5,y:0.6,w:12.3,h:0.9,fontFace:HFONT,fontSize:30,color:C.INK,bold:true}); }
function imageSlide(p,o){ const s=p.addSlide(); s.background={color:C.WHITE}; header(s,o.kicker,o.title);
  const side=o.bullets&&o.bullets.length; const b= side?{x:0.5,y:1.7,w:8.0,h:o.take?4.2:4.9}:{x:1.4,y:1.7,w:10.5,h:o.take?4.1:4.8};
  s.addImage({path:A+o.img,x:b.x,y:b.y,sizing:{type:"contain",w:b.w,h:b.h}});
  if(side){let by=1.95;o.bullets.forEach(t=>{s.addShape(p.ShapeType.rect,{x:8.9,y:by+0.07,w:0.12,h:0.12,fill:{color:C.AMBER}});
    s.addText(t,{x:9.15,y:by-0.12,w:3.6,h:0.8,fontFace:BFONT,fontSize:13.5,color:C.INK,valign:"top"});by+=0.86;});}
  if(o.take){s.addShape(p.ShapeType.roundRect,{x:0.5,y:H-1.25,w:12.33,h:0.62,rectRadius:0.06,fill:{color:C.PANEL},line:{color:C.LGRAY,width:1}});
    s.addText([{text:"⇒  ",options:{color:C.AMBER,bold:true}},{text:o.take,options:{color:C.INK}}],{x:0.8,y:H-1.25,w:11.8,h:0.62,fontFace:BFONT,fontSize:14,bold:true,valign:"middle"});}
  footer(s,o.talk,o.n); }
function titleSlide(p,o){const s=p.addSlide();s.background={color:C.SLATE};
  s.addShape(p.ShapeType.rect,{x:0,y:H-0.9,w:W,h:0.9,fill:{color:C.TEAL}});
  s.addText(o.title,{x:0.8,y:2.1,w:11.7,h:1.8,fontFace:HFONT,fontSize:48,color:C.WHITE,bold:true});
  s.addText(o.sub,{x:0.85,y:3.8,w:11.4,h:1.2,fontFace:BFONT,fontSize:20,color:C.LGRAY});
  s.addText(o.foot,{x:0.85,y:H-0.72,w:11,h:0.5,fontFace:BFONT,fontSize:14,color:C.WHITE,bold:true,valign:"middle"});}
function sectionSlide(p,o){const s=p.addSlide();s.background={color:C.SLATE};
  s.addText(o.num,{x:0.8,y:2.3,w:2.2,h:1.8,fontFace:HFONT,fontSize:80,color:C.AMBER,bold:true});
  s.addText(o.title,{x:3.1,y:2.75,w:9.4,h:1.4,fontFace:HFONT,fontSize:38,color:C.WHITE,bold:true});
  if(o.sub)s.addText(o.sub,{x:3.15,y:4.05,w:9.2,h:0.9,fontFace:BFONT,fontSize:16,color:C.LGRAY});
  footer(s,o.talk,o.n);}
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
  footer(s,o.talk,o.n);}
function statSlide(p,o){const s=p.addSlide();s.background={color:C.WHITE};header(s,o.kicker,o.title);
  const n=o.stats.length,gx=0.4,cw=(12.33-(n-1)*gx)/n,y0=2.2,ch=2.9;
  o.stats.forEach((st,i)=>{const cx=0.5+i*(cw+gx);
    s.addShape(p.ShapeType.roundRect,{x:cx,y:y0,w:cw,h:ch,rectRadius:0.08,fill:{color:C.PANEL},line:{color:C.LGRAY,width:1}});
    s.addText(st.v,{x:cx,y:y0+0.35,w:cw,h:1.2,fontFace:HFONT,fontSize:38,bold:true,color:st.c||C.TEAL,align:"center"});
    s.addText(st.l,{x:cx+0.15,y:y0+1.7,w:cw-0.3,h:1.0,fontFace:BFONT,fontSize:12.5,color:C.INK,align:"center",valign:"top"});});
  if(o.take){s.addShape(p.ShapeType.roundRect,{x:0.5,y:H-1.25,w:12.33,h:0.62,rectRadius:0.06,fill:{color:C.SLATE}});
    s.addText([{text:"⇒  ",options:{color:C.AMBER,bold:true}},{text:o.take,options:{color:C.WHITE}}],{x:0.8,y:H-1.25,w:11.8,h:0.62,fontFace:BFONT,fontSize:14,bold:true,valign:"middle"});}
  footer(s,o.talk,o.n);}
function closingSlide(p,o){const s=p.addSlide();s.background={color:C.SLATE};
  s.addText("THE ARGUMENT IN ONE SENTENCE",{x:0.8,y:1.7,w:11,h:0.4,fontFace:BFONT,fontSize:13,color:C.AMBER,charSpacing:2,bold:true});
  s.addText(o.line,{x:0.8,y:2.3,w:11.7,h:3.0,fontFace:HFONT,fontSize:26,color:C.WHITE,bold:true,lineSpacingMultiple:1.12});
  if(o.foot)s.addText(o.foot,{x:0.85,y:H-1.1,w:11.5,h:0.6,fontFace:BFONT,fontSize:14,color:C.LGRAY,italic:true});
  footer(s,o.talk,o.n);}

const p=newDeck(); const T="Beyond the GPU — 2-hour lecture"; let n=1;
titleSlide(p,{title:"Beyond the GPU",sub:"Driving factors, architectures, and economics of AI hardware acceleration — a systems lecture",foot:"In-depth lecture  ·  ~2 hours"});
cardsSlide(p,{talk:T,n:++n,kicker:"Roadmap",title:"Seven movements",cols:4,cards:[
  {tag:"1",c:C.TEAL,h:"Why offload",b:"The physical driving factors."},
  {tag:"2",c:C.BLUE,h:"Workload pressures",b:"The measured bounds."},
  {tag:"3",c:C.AMBER,h:"The framework",b:"Contracts + necessity test."},
  {tag:"4",c:C.GREEN,h:"The families",b:"Eight contract changes."},
  {tag:"5",c:C.SLATE,h:"Landscape",b:"Grouped, not cataloged."},
  {tag:"6",c:C.INK,h:"Substrate",b:"Software, packaging, cost."},
  {tag:"7",c:C.RED,h:"Futures",b:"Graded by evidence."},
  {tag:"★",c:C.TEAL,h:"Conclusions",b:"What holds everywhere."}]});
cardsSlide(p,{talk:T,n:++n,kicker:"Concepts primer",title:"The hardware vocabulary, in software terms",cols:3,cards:[
  {h:"GPU",c:C.TEAL,b:"Thousands of parallel lanes; fast on regular, batched, streamed work."},
  {h:"Matrix / tensor engine",c:C.TEAL,b:"A whole matrix tile per instruction; control cost amortized over many multiply-adds."},
  {h:"Systolic array",c:C.BLUE,b:"A grid where operands flow to neighbors — a value fetched once is reused many times."},
  {h:"HBM & scratchpad",c:C.BLUE,b:"Stacked DRAM for bandwidth; software-managed SRAM for reuse under compiler control."},
  {h:"NPU / dataflow / PIM",c:C.AMBER,b:"Blocks that change a contract: wake-scope energy, static schedule, or compute in memory."},
  {h:"TOPS vs contract",c:C.AMBER,b:"TOPS is a peak rating (marketing). A contract is what hardware promises software."}]});

sectionSlide(p,{talk:T,n:++n,num:"01",title:"Why work leaves the GPU",sub:"The physical pressures behind offload"});
imageSlide(p,{talk:T,n:++n,kicker:"The thesis",title:"Two transitions, across the whole continuum",img:"two_transitions.png",
  take:"Software succeeds until it hits a limit; each transition adds specialization rather than replacing what came before."});
cardsSlide(p,{talk:T,n:++n,kicker:"History as constraints",title:"Why general-purpose scaling stalled",cols:2,cards:[
  {h:"The memory wall",c:C.TEAL,b:"Compute outran memory; the question became which data is resident and reused, not raw latency."},
  {h:"The power wall",c:C.BLUE,b:"Frequency scaling ended; more transistors help only when software exposes parallelism."},
  {h:"Dark silicon",c:C.AMBER,b:"Not all transistors can switch at once in a fixed power budget — specialization does more per joule."},
  {h:"Data movement",c:C.GREEN,b:"Energy is dominated by moving operands, not computing on them — the recurring lever."}]});
imageSlide(p,{talk:T,n:++n,kicker:"Driving factor",title:"Data movement dominates energy",img:"data_energy.png",
  bullets:["Compute is nearly free.","Moving operands is not.","Locality sets efficiency, not FLOPS."],
  take:"Every family that follows is a different way to move less data, or move it a shorter distance."});
imageSlide(p,{talk:T,n:++n,kicker:"Driving factor",title:"Memory is a distance hierarchy",img:"mem_hierarchy.png",
  bullets:["Farther = more capacity.","Also more latency and energy.","Caches help only with reuse."],
  take:"'Memory-bound' is many distinct problems — each a lever a specialized design can pull."});
imageSlide(p,{talk:T,n:++n,kicker:"Concept",title:"CPU and GPU spend silicon differently",img:"cpu_gpu.png",
  bullets:["CPU: latency across diverse code.","GPU: throughput across regular work.","Neither wins every phase."],
  take:"Specialization narrows the job in exchange for more useful work per area and per joule."});
imageSlide(p,{talk:T,n:++n,kicker:"Concept",title:"The GPU efficiency envelope is real and bounded",img:"gpu_envelope.png",
  take:"GPUs are unbeatable inside the envelope and leak outside it — that boundary is where specialists live."});

sectionSlide(p,{talk:T,n:++n,num:"02",title:"The workload pressures",sub:"The measured bounds that reshape silicon"});
imageSlide(p,{talk:T,n:++n,kicker:"Method",title:"Signatures, not labels",img:"signatures.png",
  take:"Characterize each phase by its behavior — the same model is compute-, bandwidth-, and capacity-bound in one request."});
imageSlide(p,{talk:T,n:++n,kicker:"Two phases",title:"Prefill and decode want different machines",img:"prefill_decode.png",
  take:"One pooled device compromises; phase-specialized silicon is now reaching hyperscale roadmaps."});
imageSlide(p,{talk:T,n:++n,kicker:"Worked bound",title:"Batch-one decode is a bandwidth wall",img:"roofline_decode.png",
  bullets:["70B model, 8-bit, one sequence.","≈48 tokens/s ceiling on an H100.","~0.3% of matrix throughput used."],
  take:"Only batching or a changed memory contract moves this — the pressure behind inference-first silicon."});
imageSlide(p,{talk:T,n:++n,kicker:"Driving factor",title:"Energy spans four orders of magnitude",img:"wake_scope.png",
  bullets:["Always-on: microwatts.","Cloud round-trip: watts.","Wake scope sets the cost."],
  take:"Always-on features are impossible on a GPU contract — a structural bound, not an efficiency gap."});
imageSlide(p,{talk:T,n:++n,kicker:"Driving factor",title:"MoE turns compute into communication",img:"moe.png",
  take:"All-to-all routing can be ~1/3 of a training step — a bound in the fabric, not the arithmetic."});
imageSlide(p,{talk:T,n:++n,kicker:"Driving factor",title:"Irregular access defeats the cache",img:"irregular.png",
  take:"Embeddings, gather, and graph traversal are the bound no family yet owns cleanly."});
statSlide(p,{talk:T,n:++n,kicker:"The honest baseline",title:"Software succeeds — until it meets physics",stats:[
  {v:"3×",l:"IO-aware attention throughput (FlashAttention)",c:C.TEAL},
  {v:"2–4×",l:"KV paging / continuous batching (vLLM)",c:C.BLUE},
  {v:"~34%",l:"of a training step in MoE all-to-all",c:C.AMBER},
  {v:"<300 µW",l:"always-on keyword spotting budget",c:C.GREEN}],
  take:"Each gain is real and each exposes a residual bound software cannot move — that residue is the case for hardware."});

sectionSlide(p,{talk:T,n:++n,num:"03",title:"The decision framework",sub:"Contracts, and a test for when to specialize"});
imageSlide(p,{talk:T,n:++n,kicker:"The framework",title:"Hardware defines six contracts",img:"six_contracts.png",
  take:"A signature stresses some contracts, not others — that mismatch is where a new architecture earns its place."});
cardsSlide(p,{talk:T,n:++n,kicker:"The necessity test",title:"Four conditions — all must hold",cols:4,cards:[
  {tag:"1",c:C.TEAL,h:"Residual bound",b:"A limit remains after software has done its best."},
  {tag:"2",c:C.BLUE,h:"Material consequence",b:"The bound actually hurts under the deployment's objective."},
  {tag:"3",c:C.AMBER,h:"Effective lever",b:"Hardware changes the bound rather than relocating it."},
  {tag:"4",c:C.GREEN,h:"Lifetime economics",b:"Recurring benefit repays fixed cost, software, and lost flexibility."}],
  take:"Conditions 1–3 are the architect's analysis; condition 4 is the business case — and it decides most outcomes."});
imageSlide(p,{talk:T,n:++n,kicker:"The test, executed",title:"Same architecture, opposite verdicts",img:"necessity_cases.png",
  take:"TPU v1 specialized; Nervana/Graphcore were right on architecture but failed condition 4; enterprise stays on GPU."});
imageSlide(p,{talk:T,n:++n,kicker:"GPU vs specialization",title:"What the GPU absorbs — and what it cannot",img:"fig05-05-absorption-partition.png",
  take:"Absorbable bounds join the platform; structural bounds (wake scope, determinism, near-sensor, cost floors) do not."});

sectionSlide(p,{talk:T,n:++n,num:"04",title:"The accelerator families",sub:"Eight contract changes, two organizing axes"});
imageSlide(p,{talk:T,n:++n,kicker:"The map",title:"When uncertainty resolves × where state lives",img:"fig06-01-family-landscape.png",
  take:"Every family is a displacement from the CPU/GPU baseline on these two axes — no point dominates."});
imageSlide(p,{talk:T,n:++n,kicker:"Family · mechanism",title:"Systolic arrays: reuse from geometry",img:"fig06-02-systolic-walkthrough.png",
  take:"A value fetched once is reused across the array — memory traffic only at the edges. Absorbed by everyone, including the GPU."});
imageSlide(p,{talk:T,n:++n,kicker:"Family · device",title:"Tensor processors: one compiler-owned schedule",img:"tensor_block.png",
  take:"Matrix engine + software-managed SRAM. Wins dense portfolios at owner scale (TPU, Trainium, MTIA)."});
imageSlide(p,{talk:T,n:++n,kicker:"Family",title:"Deterministic dataflow / tile processors",img:"dataflow_timeline.png",
  take:"Schedule fixed at compile time → zero variance. Bids for latency-bounded decode and reproducible execution (Groq)."});
imageSlide(p,{talk:T,n:++n,kicker:"Family",title:"NPUs and near-sensor engines",img:"npu_domains.png",
  bullets:["Power-domain-first design.","Value = wake-scope energy.","Coverage, not TOPS, decides."],
  take:"The most secure beyond-GPU territory: wake scope and cost floors are structurally outside the GPU contract."});
imageSlide(p,{talk:T,n:++n,kicker:"Family",title:"FPGAs: flexibility after manufacturing",img:"fpga_speeds.png",
  take:"Two compilation speeds. Wins where post-manufacture structure is the requirement; elsewhere a staging tier to ASIC."});
imageSlide(p,{talk:T,n:++n,kicker:"Family",title:"Wafer-scale: state at SRAM distance",img:"wafer.png",
  take:"Inter-chip communication becomes on-wafer routing; model-scale state stays close. Survives on anchor tenants."});
imageSlide(p,{talk:T,n:++n,kicker:"Family",title:"Memory-centric / processing-in-memory",img:"pim_flavors.png",
  take:"Strongest condition-3 case in the survey — gated only by the lack of a portable programming model."});
cardsSlide(p,{talk:T,n:++n,kicker:"Family · forward-looking",title:"Neuromorphic: energy proportional to activity",cols:3,cards:[
  {h:"Mechanism",c:C.TEAL,b:"Event-driven spikes; synaptic state beside the neurons; nothing switches when nothing changes."},
  {h:"Evidence",c:C.BLUE,b:"Research-class (TrueNorth, Loihi). Validates the energy model, not yet a mainstream workload."},
  {h:"Beachhead",c:C.AMBER,b:"Extreme edge: always-on sensory, reflex loops, event cameras — sparse-in-time signals."}],
  take:"The theoretical endpoint of wake-scope logic — a direction of development, not yet a destination."});
imageSlide(p,{talk:T,n:++n,kicker:"Synthesis",title:"Same families, different binding constraints",img:"fig06-10-continuum-fit.png",
  take:"Ideas migrate both ways; implementations diverge because each deployment prices the stressors differently."});

sectionSlide(p,{talk:T,n:++n,num:"05",title:"The landscape, grouped",sub:"Read through the framework — not a product catalog"});
imageSlide(p,{talk:T,n:++n,kicker:"Grouped landscape",title:"Three groups, one deciding variable",img:"grouped_landscape.png",
  take:"None of the challengers failed on architecture — every trajectory was decided by condition 4."});
cardsSlide(p,{talk:T,n:++n,kicker:"Group · hyperscaler silicon",title:"The TPU verdict, replicated four times",cols:4,cards:[
  {h:"Google TPU",c:C.TEAL,b:"Seventh generation; inference-emphasized; pods of thousands."},
  {h:"AWS Trainium",c:C.BLUE,b:"Generally available; proprietary switch fabric; 'token economics.'"},
  {h:"Microsoft Maia",c:C.AMBER,b:"Inference-first; large on-chip SRAM; standard Ethernet."},
  {h:"Meta MTIA",c:C.GREEN,b:"Recommendation-first; peer-reviewed first generation."}],
  take:"Every major cloud fields internal tensor processors at generation depth — the second transition as industrial fact."});
imageSlide(p,{talk:T,n:++n,kicker:"Group · GPU incumbents",title:"The competition is a memory race",img:"fig07-01-flagship-memory-2026.png",
  take:"Flagships cluster on capacity and bandwidth, not FLOPS — the absorption thesis operating in public."});
cardsSlide(p,{talk:T,n:++n,kicker:"Group · challengers",title:"The contested middle consolidates",cols:3,cards:[
  {h:"License in",c:C.TEAL,b:"A deterministic-dataflow architecture licensed into the incumbent platform."},
  {h:"Anchor tenancy",c:C.BLUE,b:"Wafer-scale survives on a few enormous compute agreements, then IPO."},
  {h:"Acquisition",c:C.AMBER,b:"Programmable tile processors absorbed by a larger incumbent."}],
  take:"Condition 4 — software capital, volume, distribution — decided each, not architectural merit."});
cardsSlide(p,{talk:T,n:++n,kicker:"Group · client & edge",title:"The continuum's other half",cols:3,cards:[
  {h:"AI PC",c:C.TEAL,b:"NPU + GPU under shared memory; bandwidth and coverage, not TOPS, decide."},
  {h:"Mobile SoC",c:C.BLUE,b:"Three wake tiers; on-device foundation models; thermal equilibrium separates the field."},
  {h:"Embedded / µNPU",c:C.AMBER,b:"IP-licensed; cost floor and decade lifecycle dominate."},
  {h:"Robotics",c:C.GREEN,b:"GPU-class perception above a deterministic control floor — flexibility wins when algorithms churn."},
  {h:"Automotive",c:C.SLATE,b:"Determinism and lifecycle become certification objects; supply sovereignty joins economics."},
  {h:"Shared taxonomy",c:C.INK,b:"Same families as the datacenter — different binding constraints."}]});

sectionSlide(p,{talk:T,n:++n,num:"06",title:"Substrate & economics",sub:"Software capital, packaging, and cost"});
imageSlide(p,{talk:T,n:++n,kicker:"Software ecosystem",title:"The moat is not the kernel language",img:"narrow_waist.png",
  take:"Portability efforts aimed at the kernel layer solve the cheapest part; the moat sits above and below the waist."});
cardsSlide(p,{talk:T,n:++n,kicker:"The package is the new node",title:"Integration is the frontier",cols:3,cards:[
  {h:"HBM",c:C.TEAL,b:"Sets every bandwidth bound; three-vendor supply; rivals the logic die in cost share."},
  {h:"Packaging",c:C.BLUE,b:"Reticle limit drives 2.5D, chiplets, hybrid bonding; capacity itself gates supply."},
  {h:"Fabric & optics",c:C.AMBER,b:"Scale-up vs Ethernet; co-packaged optics attacks network power, not latency."}],
  take:"The competitive frontier moved from logic to integration — the package, the rack, the facility."});
imageSlide(p,{talk:T,n:++n,kicker:"Economics",title:"The full cost stack of useful work",img:"cost_stack.png",
  bullets:["Every family redistributes weight.","None shrinks the stack uniformly.","Power now gates deployments."],
  take:"The necessity test, in cost terms: does a redistribution lower the total for this workload at this volume?"});
imageSlide(p,{talk:T,n:++n,kicker:"Economics",title:"Volume decides — architecture held constant",img:"break_even.png",
  bullets:["Fixed cost ≈ software enablement.","Savings scale with volume.","Flexibility has option value."],
  take:"Below the volume threshold no efficiency percentage rescues the case; above it, small percentages justify large programs."});

sectionSlide(p,{talk:T,n:++n,num:"07",title:"Futures & conclusions",sub:"Graded by evidence; what holds everywhere"});
imageSlide(p,{talk:T,n:++n,kicker:"Futures",title:"Graded by evidence class",img:"future_grades.png",
  take:"New memories arrive before new logic; the nearest contract changes enter inside incumbent platforms, via packaging."});
cardsSlide(p,{talk:T,n:++n,kicker:"Demand-side wildcards",title:"What could move the bounds first",cols:3,cards:[
  {h:"Test-time compute",c:C.TEAL,b:"Reasoning longer, not larger — deepens the decode bound, strengthens inference silicon."},
  {h:"Persistent-state agents",c:C.BLUE,b:"Promote state residency and freshness to first-class bounds — a possible new family."},
  {h:"Default sparsity",c:C.AMBER,b:"MoE and retrieval push routing and gather up the priority list."}],
  take:"If the signatures move, the family taxonomy should be re-derived — the method predicts its own revision."});
cardsSlide(p,{talk:T,n:++n,kicker:"Conclusions",title:"What holds across the whole picture",cols:2,cards:[
  {tag:"A",c:C.TEAL,h:"Software converges on physics",b:"Both transitions are software succeeding until it exposes a hard, measurable bound."},
  {tag:"B",c:C.BLUE,h:"Necessity is decidable",b:"A four-condition test returns specialize / market-no / stay-on-GPU from measurable inputs."},
  {tag:"C",c:C.AMBER,h:"Condition 4 dominates",b:"Software capital, volume, and distribution decide outcomes more than silicon merit."},
  {tag:"D",c:C.GREEN,h:"Families, not a successor",b:"Each changes a contract the GPU cannot adopt without ceasing to be a GPU."},
  {tag:"E",c:C.SLATE,h:"Bounds moved to memory & power",b:"Capacity, bandwidth, fabric, and facility power separate contenders — not FLOPS."},
  {tag:"F",c:C.INK,h:"One continuum",b:"The same taxonomy reads microwatt silicon and megawatt pods."}]});
cardsSlide(p,{talk:T,n:++n,kicker:"Guidance",title:"How to use the framework",cols:3,cards:[
  {h:"Software architects",c:C.TEAL,b:"Design against signatures; respect batch-one; measure at the useful-result boundary; the test, not the catalog."},
  {h:"Platform architects",c:C.BLUE,b:"Evaluate at pod and facility; prefer consumption to ownership until volume proves otherwise; protect software seams."},
  {h:"Hardware selection",c:C.AMBER,b:"Signatures → software ceiling → locate the bound in the partition → weight the stack → run the test."}]});
closingSlide(p,{talk:T,n:++n,line:"Software optimization succeeds until it exposes a bound; the bound is absorbed by the GPU platform, escaped by changing a contract, or lived with — and the deployment class decides which.",
  foot:"Everything else — signatures, contracts, families, economics — is the machinery that makes that choice decidable."});

p.writeFile({fileName:"/sessions/compassionate-blissful-planck/mnt/outputs/AI_Accelerators_2hr_lecture.pptx"}).then(f=>console.log("2h ->",f,"slides:",n)).catch(e=>{console.error(e);process.exit(1)});
