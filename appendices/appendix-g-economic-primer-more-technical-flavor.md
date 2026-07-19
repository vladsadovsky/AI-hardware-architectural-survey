# Appendix G. Economic Primer: When AI Acceleration Pays

All worked numbers in this appendix are **illustrative author assessments** unless a citation says otherwise: they are chosen to be plausible against the public anchors cited in the main text, but their purpose is to teach the sensitivity structure of the decision, never to serve as market data. Real decisions must substitute measured values; §G.7's checklist states exactly which ones.

## G.1 Purpose: Translating Between Two Vocabularies

This appendix prepares system and AI architects to participate effectively in the meeting where hardware decisions are made, alongside business, finance, product, and infrastructure leadership. Its premise is that the two sides of that meeting routinely talk past each other: the architect argues from bounds and utilization; the business side hears an appeal for budget; and the decision defaults to purchase price and vendor relationships. The survey's central instrument—the four-condition necessity test of §2.14—serves as the bridge, because its first three conditions are the architect's analysis and its fourth is the business case. This appendix expands condition 4 into a working financial vocabulary, two sensitivity analyses (datacenter and mobile, per the approved scope), and a checklist that converts architectural findings into the numbers a finance partner can actually use. Desktop, workstation, non-mobile edge, and embedded economics remain deferred; enterprise-private deployments appear where their differences from hyperscale illuminate the model.

## G.2 Terminology Guardrails

Five distinctions prevent most of the confusion this appendix exists to fix.

**Technically possible → operationally beneficial → economically justified.** These are three different claims requiring three different kinds of evidence. A specialized engine that demonstrably speeds a kernel is *possible*; if the kernel is on the critical path of a service objective, the speedup may be *beneficial*; it is *justified* only when the lifetime benefit repays the complete cost stack of §10.6 including flexibility loss and risk. The survey's case record (§2.14, §7.3) shows the third bar is where most proposals fail, and that clearing the first two bars is routinely mistaken for clearing the third.

**Latency is not an operating expense—it is a capacity multiplier and a value term.** Tightening a tail-latency objective constrains batching freedom (§4.3), which lowers achievable utilization, which raises the fleet size needed for the same demand: latency enters the model as *capacity required per unit of demand* and as service value, never as a line item of its own. An architect who says "the SLO costs us 30% of fleet capacity" is speaking finance; one who says "latency matters" is not.

**Battery life is not an operating expense either—it is product value and design freedom.** On-device energy savings monetize as feature feasibility (an always-on capability that would otherwise be thermally or energetically impossible, §2.10), component and thermal design freedom, and customer-visible battery life. None of these appears on an energy bill; all of them appear in product value and bill of materials.

**CAPEX/OPEX framing misleads more than it helps.** Amortized acquisition, energy, facility, software enablement, and operations blend into one number that matters: **fully loaded cost per useful unit of work per unit time**. The appendix uses that number throughout and lets the finance organization decompose it into its preferred accounting categories afterward.

**Utilization means the §4.3 vector, at the useful-result boundary.** Every ratio in this appendix uses *useful* work (correct, in-SLO, non-padding, non-retried) at the system boundary (§4.1). Nominal occupancy numbers silently inflate every downstream calculation and are the single most common source of broken hardware business cases.

## G.3 The Lifecycle Model

Every acceleration decision—buying different silicon, building custom silicon, or adding a specialized block to an SoC—compares two complete lifecycles, not two devices:

> **Decide to specialize when:** Fixed cost of specialization (design + verification + software enablement + integration + validation + migration) **<** Σ over the lifetime of (recurring savings + enabled value) **−** (flexibility option value surrendered) **−** (risk-adjusted cost of the ways it can go wrong)

Four properties of this expression do most of the analytical work.

- **The fixed cost is dominated by software** for any externally sourced platform (Chapter 9): compiler maturity, model conversion, validation, retraining of teams, and parallel operation during migration routinely exceed hardware acquisition deltas.
- **The recurring term scales with volume; the fixed term does not.** This explains why identical architecture yields opposite verdicts at hyperscale and enterprise scale (§2.14 cases 1 and 3), and why this appendix's two worked examples differ mainly in their denominators.
- **Flexibility has a price even when unused**: the option to redeploy general hardware against next year's workload is worth a calculable premium wherever workload stability is low (§4.9); a specialized bid that beats the GPU by 20% on today's workload is really asking whether today's workload survives the payback period.
- **Risk enters as expected cost, not as a veto**: supply concentration (§10.5), vendor viability (§7.3's consolidations are the cautionary record), model-architecture drift, and stranded-software exposure can each be expressed as probability-weighted cost and argued explicitly, which is more productive than treating them as unquantifiable risk.

## G.4 Datacenter Sensitivity Analysis

### The master quantity

Everything in datacenter AI economics reduces to one quantity and its sensitivities:

> **Cost per useful token (or request, or training step) = fully loaded fleet cost per hour ÷ useful tokens per hour under the SLO**

The numerator assembles from §10.6's stack: amortized hardware and integration, energy × PUE, facility and cooling share, network share, software and operations share, and reserved-capacity overhead (failure headroom, burst headroom, canary and rollback capacity). The denominator is where architecture lives: it is set by the achieved point on the §4.3 latency-throughput frontier—batching policy under the SLO, serving-layer quality (§9.5), model efficiency, and the hardware's fit to the workload signature (Chapter 2).

### An illustrative baseline

Take a serving fleet of 8-accelerator nodes, each node fully loaded at **$10/hour** (illustrative: amortization over a 4-year life, energy at ~10 kW/node with PUE 1.3, facility, network, and operations shares). Under a production SLO with disciplined continuous batching, suppose one node sustains **4,000 useful tokens/second** on the survey's running-example 70B model (illustrative but shaped by the §2.5 bounds: this is far below kernel-peak numbers precisely because admissible batch, KV capacity, and tail control—not arithmetic—set it).

- Cost per million useful tokens ≈ $10 / (4,000 × 3,600) × 10⁶ ≈ **$0.69**.
- Energy's share of that (240 kWh/day × $0.10 × 1.3 PUE ≈ $31/day against $240/day) is ≈ **13%**—which teaches the first sensitivity: at current prices, *amortized capital dominates energy* per node, so utilization improvements (spreading capital over more useful work) usually beat efficiency improvements of equal percentage. Energy's share grows with cheaper hardware, longer lives, and rising power prices, and energy *availability* can bind before energy cost does (§10.4).

### The sensitivity that decides real cases: utilization

Cost per useful token scales inversely with useful utilization, and useful utilization is mostly a *demand-statistics* property, not a hardware property (§4.3, §6.4). Illustrative, same node:

| Useful utilization of provisioned capacity | Cost per million useful tokens |
|---|---|
| 70% (hyperscale, pooled demand) | ≈ $0.99 |
| 40% (large enterprise, business-hours peaked) | ≈ $1.73 |
| 15% (governance-driven private cluster) | ≈ $4.61 |
| 5% (department-scale, bursty) | ≈ $13.82 |

This one table explains most of the survey's economic verdicts: the same silicon is 14× more expensive per token at the bottom row than the top, which is why consumption models (renting the top row's utilization) dominate below hyperscale (§7.5, §12.6), and why any specialized device pitched to the bottom rows must first answer "against which utilization?"

### The specialization break-even, worked

Now let a specialized platform credibly offer **30% lower cost per useful token at equal SLO** (a large, real advantage—of the order hyperscaler internal programs claim), at a fixed adoption cost of **$30M** (illustrative: software enablement, model validation, parallel operation, retraining, integration—Chapter 9 explains why this number is rarely smaller for an organization of substance).

- **At 1B useful tokens/day** (a substantial enterprise service): baseline cost ≈ $690/day; savings ≈ $207/day; payback ≈ **397 years**. Verdict: absurd—stay on the flexible platform (§2.14 case 3, re-derived financially).
- **At 1T useful tokens/day** (hyperscale): baseline ≈ $690K/day; savings ≈ $207K/day; payback ≈ **145 days**. Verdict: compelling—build or adopt (§2.14 case 1, re-derived).
- **Break-even volume** at a 2-year payback requirement: ≈ **60B useful tokens/day** sustained. Below it, no efficiency percentage rescues the case; above it, even smaller percentages justify large programs.

The example's teaching points: the verdict flipped on *volume alone*, with architecture held constant; the fixed cost was software-dominated; and the honest uncertainty is in the 30% (which must survive *your* workload signatures, not the vendor's benchmark suite) and in workload stability across the payback window (§G.3's option-value term). Training-side analyses follow the same template with "useful training throughput to target quality" (§2.3) as the denominator and checkpoint/failure goodput (§4.8) in the numerator.

## G.5 Mobile Sensitivity Analysis

### The master quantities

Mobile inverts the structure: recurring costs shrink to near-irrelevance per device, and the decision concentrates in **per-unit silicon cost versus per-unit lifetime value**, both multiplied by enormous shipment volumes.

> **Per-unit cost of an integrated accelerator = (area × finished-silicon cost per mm²) + (NRE ÷ shipment volume) + incremental memory/package/power-delivery cost**
> **Per-unit value = avoided cloud cost + battery-and-thermal design value + feature-feasibility value + privacy/latency product value**

### An illustrative accounting

Take an NPU block of **5 mm²** on a leading-node mobile SoC. At an illustrative finished-silicon cost (wafer price, yield, test) of ~$0.25/mm², the area costs ≈ **$1.25/unit**; add hardware-and-software NRE of **$60M** amortized over **150M units** (≈ $0.40) for ≈ **$1.65/unit**, before any incremental memory cost. Against that:

- **Avoided cloud inference**: if on-device execution absorbs interactions that would otherwise cost the platform ~$1/user/year in served inference (illustrative; the real number is a closely held blend of model size, query mix, and infrastructure cost), a 4-year device life returns ≈ **$4/unit**—already 2.4× the cost, before any other term.
- **Feature feasibility**: the always-on tier (§2.10's four-orders wake-scope ladder) is not cheaper on the NPU—it is *impossible* off it within the battery budget. Features that define the product (ambient assistants, live translation, computational photography) carry value far exceeding cost lines, which is why every flagship SoC vendor converged on the family (§6.5) without needing the cloud-offset arithmetic at all.
- **The real negotiation is opportunity cost**: those 5 mm² compete against more GPU, more cache, or more modem—not against zero. The architect's honest framing to product leadership is "which 5 mm² creates more product value," and the NPU's answer rests on the coverage argument of §6.5: silicon that the OS's curated model tier (§9.5) demonstrably keeps busy.

### The sensitivities that decide real cases

**Volume**: at 10M units, the same NRE is $6/unit and the case strains; at 200M it vanishes. Mobile specialization is a volume business, which is why the microNPU tier reaches small-volume products only as licensed IP with shared NRE (§8.3). **Model-change risk**: a fixed-function block stranded by an operator-set shift (§6.5's coverage race) still costs its area on every unit shipped; programmability inside the NPU is the insurance premium against exactly this. **Wake-scope accounting**: the correct energy boundary is the §2.10 system boundary—an NPU that wins kernels but loses wakeups (fallback copies, DRAM activation) delivers negative value; measured coverage, not TOPS, is the value driver. **Sustained thermals**: burst benchmarks do not monetize; the camera-pipeline and assistant features that sell devices run at thermal equilibrium (§8.2), where the NPU's perf/W advantage is the difference between a feature and a throttled demo.

## G.6 Break-Even Patterns Worth Memorizing

Across both environments, five patterns recur and are worth carrying into any meeting. **Volume is the master switch**: every worked example in this survey flipped its verdict on volume (or its cousin, utilization) with architecture held constant. **Software enablement is the fixed cost that matters**, and it is chronically underestimated because it looks like engineering time rather than a purchase order. **Percentages don't transfer**: an efficiency advantage measured on the vendor's workload portfolio must be re-derived on yours (signatures, §2.2) before it enters the model. **Flexibility is a number, not a sentiment**: price the option value by asking what it costs to be wrong about workload stability for the payback period. **Value beats savings in the client world**: datacenter cases are usually won on cost per useful token; mobile cases are usually won on feature feasibility and product value—arguing a phone NPU on cost offsets alone concedes its strongest ground.

[**Figure G.1 placeholder — Break-even volume curves.** Two panels. Left (datacenter): payback time versus sustained useful-token volume for several efficiency-advantage levels (10/20/30/50%) at fixed enablement cost, log-x; mark the 2-year line and annotate where §2.14's three cases fall. Right (mobile): per-unit cost versus shipment volume for several NRE levels, against a per-unit lifetime-value band; annotate the microNPU licensed-IP region at low volume. All curves labeled illustrative.]

## G.7 Architect-to-Business Decision Checklist

The checklist converts the survey's method into the artifact a finance partner needs. For every proposed offload, arrive with answers—and with the measurement boundary of each answer stated:

1. Which recurring workload phase is accelerated, what is its signature (§2.2), and what fraction of total fleet cost or device value does it represent today?
2. What did disciplined software optimization achieve, with measurements, and which residual bound remains (§2.14 conditions 1–2)?
3. What is the claimed advantage *on our workloads and SLOs*, who measured it, and at which comparison level (§10.6)?
4. What is the complete fixed cost: hardware delta, software enablement, validation, migration, parallel running, training?
5. What volume/utilization assumption does the payback rest on, and what is the payback at half that assumption?
6. What is the workload-stability horizon, and what strands if models shift within the payback window?
7. What flexibility is surrendered (redeployment, multi-use, resale, consumption-model exit), priced as option value?
8. What are the supply, vendor-viability, and support risks (§7.3, §10.5), probability-weighted?
9. For client silicon: what is the area's opportunity cost, and what does measured coverage—not TOPS—say the block will actually run?
10. Which consumption-model alternative (rental, hosted API, appliance) satisfies the same conditions without the fixed cost, and why is ownership still preferred?
11. Who owns operations, observability, failure recovery, and migration for the life of the decision?
12. Which of the numbers above are measured, which are forecast, and which are strategic assertions?

A proposal that survives this checklist is, in the survey's terms, one that has passed the necessity test with its condition-4 homework shown—which is the only kind the record suggests deserves funding.

## G.8 Relationship to the Main Text and Remaining Work

This appendix operationalizes §2.14 (the test), §4.9 (flexibility economics), §7.5 and §12.6–12.7 (portfolio guidance), and §10.6 (the cost stack), and deliberately duplicates none of their argumentation. Its worked numbers are illustrative by design; the survey's research-gap finding (§12.8) applies with full force here—real utilization, enablement, and TCO data are competitive secrets, and readers with access to their own measured values should treat this appendix as the spreadsheet structure into which those values go. Remaining work before finalization: substitute any newly citable public cost anchors, produce Figure G.1, extend the deferred deployment classes (desktop, non-mobile edge, embedded) if the main text's treatment creates demand, and reconcile terminology with Appendix A when it is drafted.