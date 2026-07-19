const pptxgen = require("pptxgenjs");
const A = "/sessions/compassionate-blissful-planck/mnt/outputs/deck_assets/";

const C = { SLATE:"16232E", INK:"263947", TEAL:"0E8C9B", AMBER:"E08A2B", BLUE:"2E6E9E",
  GRAY:"7C8B96", LGRAY:"E7ECEF", PANEL:"F4F7F8", GREEN:"3F9E6A", RED:"C0503C", WHITE:"FFFFFF" };
const HFONT="Cambria", BFONT="Calibri";
const W=13.333, H=7.5;

function newDeck(){ const p=new pptxgen(); p.defineLayout({name:"W",width:W,height:H}); p.layout="W"; return p; }

function footer(s, talk, n){
  s.addText(talk, {x:0.5,y:H-0.42,w:7,h:0.3,fontFace:BFONT,fontSize:9,color:C.GRAY,align:"left"});
  s.addText(String(n), {x:W-1.0,y:H-0.42,w:0.5,h:0.3,fontFace:BFONT,fontSize:9,color:C.GRAY,align:"right"});
}
function header(s, kicker, title){
  if(kicker) s.addText(kicker.toUpperCase(), {x:0.5,y:0.34,w:11,h:0.3,fontFace:BFONT,fontSize:12,color:C.TEAL,charSpacing:2,bold:true});
  s.addText(title, {x:0.5,y:0.6,w:12.3,h:0.9,fontFace:HFONT,fontSize:30,color:C.INK,bold:true});
}
// generic image slide: big diagram + optional short bullets + optional takeaway strip
function imageSlide(p, o){
  const s=p.addSlide(); s.background={color:C.WHITE};
  header(s,o.kicker,o.title);
  const hasSide = o.bullets && o.bullets.length;
  const imgBox = hasSide ? {x:0.5,y:1.7,w:8.0,h:o.take?4.2:4.9} : {x:1.4,y:1.7,w:10.5,h:o.take?4.1:4.8};
  s.addImage({path:A+o.img, x:imgBox.x,y:imgBox.y, sizing:{type:"contain",w:imgBox.w,h:imgBox.h}});
  if(hasSide){
    let by=1.9;
    o.bullets.forEach(b=>{
      s.addShape(p.ShapeType.rect,{x:8.9,y:by+0.07,w:0.12,h:0.12,fill:{color:C.AMBER}});
      s.addText(b,{x:9.15,y:by-0.12,w:3.6,h:0.7,fontFace:BFONT,fontSize:13.5,color:C.INK,valign:"top"});
      by+=0.82;
    });
  }
  if(o.take){
    s.addShape(p.ShapeType.roundRect,{x:0.5,y:H-1.25,w:12.33,h:0.62,rectRadius:0.06,fill:{color:C.PANEL},line:{color:C.LGRAY,width:1}});
    s.addText([{text:"⇒  ",options:{color:C.AMBER,bold:true}},{text:o.take,options:{color:C.INK}}],
      {x:0.8,y:H-1.25,w:11.8,h:0.62,fontFace:BFONT,fontSize:14,bold:true,valign:"middle"});
  }
  footer(s,o.talk,o.n);
}
function titleSlide(p,o){
  const s=p.addSlide(); s.background={color:C.SLATE};
  s.addShape(p.ShapeType.rect,{x:0,y:H-0.9,w:W,h:0.9,fill:{color:C.TEAL}});
  s.addText(o.title,{x:0.8,y:2.2,w:11.7,h:1.8,fontFace:HFONT,fontSize:48,color:C.WHITE,bold:true});
  s.addText(o.sub,{x:0.85,y:3.9,w:11.4,h:1.0,fontFace:BFONT,fontSize:20,color:C.LGRAY});
  s.addText(o.foot,{x:0.85,y:H-0.72,w:11,h:0.5,fontFace:BFONT,fontSize:14,color:C.WHITE,bold:true,valign:"middle"});
}
function sectionSlide(p,o){
  const s=p.addSlide(); s.background={color:C.SLATE};
  s.addText(o.num,{x:0.8,y:2.4,w:2,h:1.6,fontFace:HFONT,fontSize:80,color:C.AMBER,bold:true});
  s.addText(o.title,{x:2.9,y:2.8,w:9.5,h:1.4,fontFace:HFONT,fontSize:40,color:C.WHITE,bold:true});
  if(o.sub) s.addText(o.sub,{x:2.95,y:4.05,w:9.3,h:0.8,fontFace:BFONT,fontSize:17,color:C.LGRAY});
  footer(s,o.talk,o.n);
}
function cardsSlide(p,o){
  const s=p.addSlide(); s.background={color:C.WHITE};
  header(s,o.kicker,o.title);
  const cols=o.cols||3, cards=o.cards, rows=Math.ceil(cards.length/cols);
  const gx=0.35, gy=0.3, x0=0.5, y0=1.75;
  const cw=(12.33-(cols-1)*gx)/cols, ch=(H-y0-0.9-(rows-1)*gy)/rows;
  cards.forEach((cd,i)=>{
    const cx=x0+(i%cols)*(cw+gx), cy=y0+Math.floor(i/cols)*(ch+gy);
    s.addShape(p.ShapeType.roundRect,{x:cx,y:cy,w:cw,h:ch,rectRadius:0.07,fill:{color:C.PANEL},line:{color:C.LGRAY,width:1}});
    s.addShape(p.ShapeType.roundRect,{x:cx+0.22,y:cy+0.22,w:0.5,h:0.5,rectRadius:0.06,fill:{color:cd.c||C.TEAL}});
    if(cd.tag) s.addText(cd.tag,{x:cx+0.22,y:cy+0.22,w:0.5,h:0.5,fontFace:HFONT,fontSize:15,color:C.WHITE,bold:true,align:"center",valign:"middle"});
    s.addText(cd.h,{x:cx+0.85,y:cy+0.2,w:cw-1.05,h:0.55,fontFace:BFONT,fontSize:15,bold:true,color:C.INK,valign:"middle"});
    s.addText(cd.b,{x:cx+0.24,y:cy+0.85,w:cw-0.48,h:ch-1.0,fontFace:BFONT,fontSize:12.5,color:C.INK,valign:"top"});
  });
  if(o.take){
    s.addText([{text:"⇒  ",options:{color:C.AMBER,bold:true}},{text:o.take,options:{color:C.INK}}],
      {x:0.5,y:H-0.85,w:12.33,h:0.4,fontFace:BFONT,fontSize:13.5,bold:true});
  }
  footer(s,o.talk,o.n);
}
function statSlide(p,o){
  const s=p.addSlide(); s.background={color:C.WHITE};
  header(s,o.kicker,o.title);
  const n=o.stats.length, gx=0.4, cw=(12.33-(n-1)*gx)/n, y0=2.2, ch=2.9;
  o.stats.forEach((st,i)=>{
    const cx=0.5+i*(cw+gx);
    s.addShape(p.ShapeType.roundRect,{x:cx,y:y0,w:cw,h:ch,rectRadius:0.08,fill:{color:C.PANEL},line:{color:C.LGRAY,width:1}});
    s.addText(st.v,{x:cx,y:y0+0.35,w:cw,h:1.2,fontFace:HFONT,fontSize:40,bold:true,color:st.c||C.TEAL,align:"center"});
    s.addText(st.l,{x:cx+0.15,y:y0+1.7,w:cw-0.3,h:1.0,fontFace:BFONT,fontSize:13,color:C.INK,align:"center",valign:"top"});
  });
  if(o.take){
    s.addShape(p.ShapeType.roundRect,{x:0.5,y:H-1.25,w:12.33,h:0.62,rectRadius:0.06,fill:{color:C.SLATE}});
    s.addText([{text:"⇒  ",options:{color:C.AMBER,bold:true}},{text:o.take,options:{color:C.WHITE}}],
      {x:0.8,y:H-1.25,w:11.8,h:0.62,fontFace:BFONT,fontSize:14,bold:true,valign:"middle"});
  }
  footer(s,o.talk,o.n);
}
function closingSlide(p,o){
  const s=p.addSlide(); s.background={color:C.SLATE};
  s.addText("THE ARGUMENT IN ONE SENTENCE",{x:0.8,y:1.7,w:11,h:0.4,fontFace:BFONT,fontSize:13,color:C.AMBER,charSpacing:2,bold:true});
  s.addText(o.line,{x:0.8,y:2.3,w:11.7,h:3.0,fontFace:HFONT,fontSize:27,color:C.WHITE,bold:true,lineSpacingMultiple:1.1});
  if(o.foot) s.addText(o.foot,{x:0.85,y:H-1.1,w:11.5,h:0.6,fontFace:BFONT,fontSize:14,color:C.LGRAY,italic:true});
  footer(s,o.talk,o.n);
}

/* ---------------- 1-HOUR DECK ---------------- */
function build1h(){
  const p=newDeck(); const T="Beyond the GPU — 1-hour walkthrough"; let n=1;
  titleSlide(p,{title:"Beyond the GPU",sub:"Why AI is driving a second hardware transition — a systems view for software engineers",foot:"Condensed walkthrough  ·  ~1 hour"});
  cardsSlide(p,{talk:T,n:++n,kicker:"Roadmap",title:"Where we are going",cols:3,cards:[
    {tag:"1",c:C.TEAL,h:"The driving factors",b:"The physical pressures that push work off the GPU: data movement, memory bandwidth, energy, determinism."},
    {tag:"2",c:C.BLUE,h:"The decision framework",b:"Six architectural contracts and a four-condition test for when specialization is actually justified."},
    {tag:"3",c:C.AMBER,h:"The families",b:"How beyond-GPU accelerators group by which contract they change — not by vendor."},
    {tag:"4",c:C.GREEN,h:"The landscape, grouped",b:"Incumbents, hyperscaler silicon, and challengers — read through the framework, not as a catalog."},
    {tag:"5",c:C.SLATE,h:"Economics",b:"Why lifetime cost and software capital decide most outcomes."},
    {tag:"6",c:C.INK,h:"Conclusions",b:"What holds across the whole compute continuum."}],
    take:"Less time on products; more on the physics and economics that make the choice decidable."});
  cardsSlide(p,{talk:T,n:++n,kicker:"Concepts primer",title:"Six hardware ideas, in software terms",cols:3,cards:[
    {h:"GPU",c:C.TEAL,b:"Thousands of parallel lanes. Fast when work is regular, batched, and streamed from high-bandwidth memory."},
    {h:"Matrix / tensor engine",c:C.TEAL,b:"A block that does a whole matrix tile per instruction — amortizes control over many multiply-adds."},
    {h:"HBM",c:C.BLUE,b:"Stacked DRAM giving multi-TB/s. The scarce resource: capacity and bandwidth, not arithmetic."},
    {h:"NPU",c:C.BLUE,b:"An SoC block plus a compiler that maps a whole model graph onto it at low energy."},
    {h:"TOPS",c:C.AMBER,b:"A peak arithmetic rating. Rarely the bottleneck — treat as marketing, not a benchmark."},
    {h:"Contract",c:C.AMBER,b:"What hardware promises software about execution, memory, numbers, scheduling, comms, and tooling."}]});
  imageSlide(p,{talk:T,n:++n,kicker:"The thesis",title:"Two transitions, across the whole continuum",img:"two_transitions.png",
    take:"Software optimization keeps hitting limits; each transition adds specialization, it does not replace what came before."});
  imageSlide(p,{talk:T,n:++n,kicker:"Driving factor",title:"Data movement — not arithmetic — dominates energy",img:"data_energy.png",
    bullets:["Compute is nearly free.","Moving operands is not.","So locality and reuse set efficiency, not FLOPS."],
    take:"Every architecture that follows is a different answer to 'move less data, or move it a shorter distance.'"});
  imageSlide(p,{talk:T,n:++n,kicker:"Driving factor",title:"Memory is a distance hierarchy",img:"mem_hierarchy.png",
    bullets:["Each step out: more capacity.","Also more latency and energy.","Caches help only if data is reused before eviction."],
    take:"'Memory-bound' is many different problems — each one a lever a specialized design can pull."});
  imageSlide(p,{talk:T,n:++n,kicker:"Concept",title:"CPU and GPU spend silicon differently",img:"cpu_gpu.png",
    bullets:["CPU: low-latency across diverse code.","GPU: throughput across regular work.","Neither is optimal for every phase."],
    take:"Specialization narrows what a design does in exchange for more useful work per unit area and energy."});
  imageSlide(p,{talk:T,n:++n,kicker:"Worked bound",title:"Batch-one decode is a bandwidth wall",img:"roofline_decode.png",
    bullets:["70B model, 8-bit, one sequence.","≈48 tokens/s ceiling on an H100.","~0.3% of the matrix throughput usable."],
    take:"No amount of extra arithmetic moves this — it is set by memory bandwidth. This is the pressure that reshapes serving silicon."});
  imageSlide(p,{talk:T,n:++n,kicker:"Driving factor",title:"Energy per inference spans four orders of magnitude",img:"wake_scope.png",
    bullets:["Always-on tap: microwatts.","Cloud round-trip: ~watts.","Which domains wake sets the cost."],
    take:"On-device always-on features are impossible on a GPU contract — the wake-scope bound is structural, not an efficiency gap."});
  imageSlide(p,{talk:T,n:++n,kicker:"Driving factor",title:"Mixture-of-experts turns compute into communication",img:"moe.png",
    take:"Routing and all-to-all can be ~1/3 of step time — a bound in the fabric, not the math unit."});
  statSlide(p,{talk:T,n:++n,kicker:"The honest baseline",title:"Software succeeds — until it meets physics",stats:[
    {v:"3×",l:"IO-aware attention (FlashAttention) throughput",c:C.TEAL},
    {v:"2–4×",l:"KV paging / continuous batching (vLLM)",c:C.BLUE},
    {v:"~34%",l:"of a training step spent in MoE all-to-all",c:C.AMBER},
    {v:"<300 µW",l:"always-on keyword spotting budget",c:C.GREEN}],
    take:"Every gain is real; every gain eventually exposes a residual bound software cannot move. That residue is the case for hardware."});
  imageSlide(p,{talk:T,n:++n,kicker:"The framework",title:"Hardware defines six contracts",img:"six_contracts.png",
    take:"A workload signature stresses some contracts, not others — that mismatch is where a new architecture earns its place."});
  imageSlide(p,{talk:T,n:++n,kicker:"The framework",title:"Is specialization justified? A four-condition test",img:"necessity_cases.png",
    bullets:["1 · residual bound remains","2 · it has a material consequence","3 · hardware changes the bound","4 · lifetime economics repay it"],
    take:"Same architecture, opposite verdicts. Condition 4 — volume and software cost — decides most cases."});
  imageSlide(p,{talk:T,n:++n,kicker:"GPU vs specialization",title:"What the GPU absorbs — and what it cannot",img:"fig05-05-absorption-partition.png",
    take:"Absorbable bounds go to the platform; structural bounds (wake scope, determinism, near-sensor, cost floors) belong to specialists."});
  imageSlide(p,{talk:T,n:++n,kicker:"The families",title:"One map: when uncertainty resolves × where state lives",img:"fig06-01-family-landscape.png",
    take:"Every family is a displacement from the CPU/GPU baseline on these two axes — no point dominates."});
  cardsSlide(p,{talk:T,n:++n,kicker:"The families, grouped",title:"Eight families = eight contract changes",cols:4,cards:[
    {h:"Systolic array",c:C.TEAL,b:"Reuse from geometry; data flows through a grid."},
    {h:"Tensor processor",c:C.TEAL,b:"Compiler-owned; matrix engine + managed SRAM (TPU)."},
    {h:"Dataflow / tile",c:C.BLUE,b:"Static schedule; deterministic, low-latency (Groq)."},
    {h:"NPU / near-sensor",c:C.BLUE,b:"Power-domain-first; wake-scope energy (mobile, µNPU)."},
    {h:"FPGA / reconfigurable",c:C.AMBER,b:"Structure set after manufacturing; flexibility."},
    {h:"Wafer-scale",c:C.AMBER,b:"Whole wafer; inter-chip comms become on-wafer."},
    {h:"Memory-centric / PIM",c:C.GREEN,b:"Compute moves to the data; interface carries results."},
    {h:"Neuromorphic",c:C.SLATE,b:"Event-driven; energy ∝ activity (forward-looking)."}],
    take:"Grouped by contract changed, not by company — the taxonomy outlives the products."});
  imageSlide(p,{talk:T,n:++n,kicker:"Most secure territory",title:"NPUs own the client and edge",img:"npu_domains.png",
    bullets:["Value = energy + wake scope.","Coverage, not TOPS, decides.","Fallback behavior is everything."],
    take:"Wake-scope energy and per-unit cost floors are structurally outside the GPU contract."});
  imageSlide(p,{talk:T,n:++n,kicker:"Strongest lever",title:"Memory-centric designs attack the measured bounds",img:"pim_flavors.png",
    take:"Best condition-3 case in the survey — gated only by the lack of a portable programming model."});
  imageSlide(p,{talk:T,n:++n,kicker:"The continuum",title:"Same families, different binding constraints",img:"fig06-10-continuum-fit.png",
    take:"Ideas migrate both ways; implementations diverge because each deployment prices the stressors differently."});
  imageSlide(p,{talk:T,n:++n,kicker:"The landscape, grouped",title:"Three groups, one deciding variable",img:"grouped_landscape.png",
    take:"None of the challengers failed on architecture — every trajectory was decided by condition 4."});
  imageSlide(p,{talk:T,n:++n,kicker:"Economics",title:"Volume decides — architecture held constant",img:"break_even.png",
    bullets:["Fixed cost ≈ software enablement.","Recurring savings scale with volume.","Flexibility has option value."],
    take:"Below a volume threshold, no efficiency percentage rescues the case; above it, small percentages justify large programs."});
  cardsSlide(p,{talk:T,n:++n,kicker:"Conclusions",title:"What holds across the whole picture",cols:2,cards:[
    {tag:"A",c:C.TEAL,h:"Software converges on physics",b:"Both transitions are software succeeding until it exposes a hard, measurable bound."},
    {tag:"B",c:C.BLUE,h:"Necessity is decidable",b:"A four-condition test returns specialize / market-no / stay-on-GPU — from measurable inputs."},
    {tag:"C",c:C.AMBER,h:"Condition 4 dominates",b:"Software capital, volume, and distribution decide outcomes more than silicon merit."},
    {tag:"D",c:C.GREEN,h:"Families, not a successor",b:"Each changes a contract the GPU cannot adopt without ceasing to be a GPU."},
    {tag:"E",c:C.SLATE,h:"Bounds moved to memory & power",b:"Capacity, bandwidth, fabric, and facility power now separate contenders — not FLOPS."},
    {tag:"F",c:C.INK,h:"One continuum",b:"The same taxonomy reads microwatt silicon and megawatt pods."}]});
  closingSlide(p,{talk:T,n:++n,line:"Software optimization succeeds until it exposes a bound; the bound is absorbed by the GPU platform, escaped by changing a contract, or lived with — and the deployment class decides which.",
    foot:"Everything else — signatures, contracts, families, economics — is the machinery that makes that choice decidable."});
  return p.writeFile({fileName:"/sessions/compassionate-blissful-planck/mnt/outputs/AI_Accelerators_1hr_walkthrough.pptx"});
}
build1h().then(f=>console.log("1h ->",f)).catch(e=>{console.error(e);process.exit(1)});
