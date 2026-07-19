# Appendix G. Economic Primer: When AI Acceleration Pays

## G.1 What This Appendix Will Enable You to Do

An architect can demonstrate that a workload is limited by memory movement, latency, power, or insufficient parallelism without yet demonstrating that new hardware is a sound investment. The technical result is necessary evidence, but a business decision compares complete alternatives over a deployment lifecycle.

This appendix provides a practical bridge between those two analyses. It is written for system and AI architects who need to explain an acceleration proposal to product, finance, infrastructure, or business decision makers. It does not assume formal training in finance, and it does not attempt to provide market prices or a universal cost model.

By the end of the appendix, the reader should be able to:

1. distinguish technical feasibility, operational benefit, and economic justification;
2. define the existing platform and proposed alternative at the same system boundary;
3. translate latency, utilization, energy, battery life, and flexibility into economic consequences without treating them as accounting line items by themselves;
4. identify fixed, recurring, and risk-related lifecycle terms;
5. calculate a simple break-even volume or payback period;
6. test which assumptions actually control the decision;
7. present both a positive and a negative specialization result in language useful to technical and business participants.

The initial scope is deliberately limited to two environments:

- hyperscale and datacenter AI services;
- mobile AI devices and platforms.

Desktop, workstation, non-mobile edge, and embedded economics are deferred. Enterprise-private infrastructure appears only where it clarifies how lower utilization and smaller deployment volume can change a datacenter-style decision.

All numerical examples are hypothetical author assessments. They exist to demonstrate the method and arithmetic, not to establish current product prices, operating costs, performance, or market value. A real decision must replace every illustrative input with measured or organization-approved values.

The appendix follows one sequence throughout:

> Define the useful result → compare a baseline and candidate → identify the technical difference → translate it into lifecycle cost or value → test volume, time, uncertainty, flexibility, and risk → decide whether specialization pays

## G.2 Start with the Decision, Not the Accelerator

The economic question is not “Is the accelerator efficient?” It is:

> Does adopting this accelerator produce greater lifecycle value than continuing with the best credible alternative while meeting the same objective?

The **baseline** must be a real alternative, not an intentionally weak comparison. It may be:

- continued use of a CPU or GPU after reasonable software optimization;
- a newer generation of the same platform;
- rented specialized capacity rather than owned hardware;
- a less specialized integrated block;
- execution in the cloud rather than on the device;
- requirement renegotiation when the original objective is more expensive than its value.

The **candidate** includes more than silicon. It includes the hardware, compiler, runtime, libraries, memory and interconnect changes, model conversion, validation, deployment, observability, support, recovery, and migration path required to obtain the claimed result.

The comparison must hold the useful-result boundary constant. Datacenter alternatives should meet the same model-quality, response-latency, availability, security, and reliability requirements. Mobile alternatives should provide the same accepted feature behavior, responsiveness, privacy, sustained thermal operation, and battery-life objective. A cheaper result is not equivalent if it is late, unreliable, lower quality, unavailable offline, or unacceptable to users.

### Table G.1 — Minimum definition of an acceleration decision

| Decision element | Question that must be answered |
|---|---|
| Useful result | What accepted outcome is delivered: token, request, training target, mobile interaction, or enabled feature? |
| Deployment objective | Which latency, quality, availability, privacy, thermal, battery, or safety requirements must hold? |
| Baseline | What is the best credible nonadoption alternative after reasonable optimization? |
| Candidate | What complete hardware-and-software system is proposed? |
| Measurement boundary | Which host, memory, network, cooling, wake-up, fallback, and recovery effects are included? |
| Time horizon | Over how many years, product generations, or service periods is the decision evaluated? |
| Volume | How many useful results, deployed systems, active users, or shipped devices carry the benefit? |
| Uncertainty | Which values are measured, forecast, contractually known, or strategic assumptions? |

This structure is the economic continuation of the hardware-necessity test in §2.14 and Appendix B §B.12. The first three conditions establish a residual bound, a material consequence, and a hardware lever that actually changes the bound. Appendix G addresses the fourth condition: whether lifecycle benefit exceeds transition cost, flexibility surrendered, and risk.

## G.3 One Lifecycle Model for Both Environments

Let \(H\) denote adopting the candidate hardware rather than the baseline. A useful simplified expression for its incremental lifecycle advantage is:

\[
A(H)=
\operatorname{PV}\!\left[
\Delta C_{\mathrm{recurring}}(H)+
\Delta V_{\mathrm{enabled}}(H)
\right]
-
K_{\mathrm{transition}}(H)
-
O_{\mathrm{flex}}(H)
-
R_{\mathrm{risk}}(H).
\]

Where:

- \(\Delta C_{\mathrm{recurring}}\) is the recurring cost avoided by the candidate relative to the baseline;
- \(\Delta V_{\mathrm{enabled}}\) is additional service or product value that the baseline cannot provide economically;
- \(K_{\mathrm{transition}}\) is the incremental design, acquisition, enablement, integration, validation, and migration cost;
- \(O_{\mathrm{flex}}\) is the value of flexibility surrendered by choosing the candidate;
- \(R_{\mathrm{risk}}\) is the risk-adjusted incremental cost of supply, support, schedule, adoption, obsolescence, and failure modes;
- \(\operatorname{PV}\) means that future costs and benefits are evaluated over a common time horizon and, when material, converted to present value using the organization’s approved discounting method.

Specialization is economically justified in this simplified model when \(A(H)>0\), provided that both alternatives have been evaluated at the same useful-result boundary and the candidate meets the deployment objective.

This is an **incremental** comparison. Costs shared equally by both alternatives cancel. A datacenter building already required by either alternative should not be charged only to the candidate. A mobile application team required in either case is not entirely an NPU transition cost. Conversely, candidate-specific compiler work, parallel operation during migration, additional package cost, or a new recovery system must not be omitted merely because it is outside the accelerator die.

### Fixed and recurring terms

A fixed cost is incurred largely independently of the eventual workload or shipment volume. Examples include architecture design, verification, compiler enablement, model validation, integration, qualification, and migration tooling.

A recurring term scales with time, useful work, deployed capacity, active users, or shipped devices. Examples include:

- datacenter equipment, energy, cooling, network capacity, operations, and failed work;
- per-device silicon area, memory, package, test, cloud-service use, and warranty exposure;
- service or product value earned repeatedly while the capability remains useful.

The distinction is analytical rather than purely accounting. Hardware acquisition may be recorded as capital expenditure but becomes a time-dependent cost when amortized over its useful life. Software engineering may be recorded as operating expense but behave as a fixed transition investment for one platform decision. CAPEX and OPEX remain useful accounting categories; they are insufficient by themselves to explain architectural break-even.

### Simple break-even volume

If a candidate has fixed incremental cost \(K\), produces a constant net benefit \(s\) per useful unit, and flexibility and risk are temporarily included in \(K\), the undiscounted break-even volume is:

\[
Q_{\mathrm{BE}}=\frac{K}{s},
\qquad s>0.
\]

For a datacenter service, \(Q\) may be useful tokens, requests, or completed training runs. For a mobile product, \(Q\) may be shipped devices or active device-years.

If \(s\leq0\), no increase in volume rescues the proposal under the stated assumptions. The candidate must reduce its recurring cost, create additional value, or change the technical objective. If \(s>0\), higher volume amortizes the fixed transition cost more quickly.

### Payback is not the complete decision

Payback period is easy to communicate, but it ignores benefits after payback and may ignore the time value of money. A real finance organization may prefer net present value, internal rate of return, total cost of ownership, contribution margin, or another approved measure. The architect’s responsibility is not to select the corporate financial method. It is to provide technically defensible inputs and ensure that both alternatives use the same scope, time horizon, and assumptions.

### Table G.2 — Shared lifecycle terms, different manifestations

| Lifecycle term | Datacenter manifestation | Mobile manifestation |
|---|---|---|
| Fixed transition cost | Platform qualification, compiler and serving work, migration, parallel fleet operation | NPU or SoC design, verification, model toolchain, OS integration, application validation |
| Per-unit recurring cost | Amortized node, memory, fabric, power, cooling, operations | Incremental die area, yield effect, package, memory, test, per-device cloud use |
| Enabled value | Higher served demand, lower latency, new service tier, faster quality attainment | New local feature, responsiveness, privacy, offline use, longer feature duration |
| Utilization or volume | Useful demand relative to provisioned capacity | Shipment volume and fraction of devices or applications using the block |
| Flexibility | Ability to redeploy general hardware across models and services | Ability to support future operators, models, and product features |
| Risk | Supply, vendor support, software maturity, workload drift, stranded fleet | Schedule, yield, model drift, unsupported operators, long support lifecycle |

[**Figure G.1 placeholder — One lifecycle decision model applied twice.** Place the baseline and candidate at the left, followed by the common terms: useful-result boundary, transition cost, recurring cost difference, enabled value, flexibility, risk, time, and volume. Split the right side into datacenter and mobile applications using the same sequence. The figure should make clear that the variables differ but the decision logic does not.]

## G.4 Translating Technical Metrics into Economic Terms

Architectural measurements enter the business case through their consequences. The translation must be explicit.

### Latency

Latency is not itself an operating expense. In a datacenter service it can affect:

- the number of requests completed within the service objective;
- admissible batching and therefore useful accelerator utilization;
- capacity and headroom required for peak and tail conditions;
- user retention, conversion, productivity, or another organization-specific value metric;
- penalties or lost value associated with violating an agreement.

The architect should therefore avoid statements such as “latency costs 30 percent.” A defensible statement is: “Meeting the 99th-percentile objective restricts batching to this range, which reduces useful throughput per node by this measured amount and requires this additional capacity at forecast demand.”

### Utilization

Utilization affects economics only through useful work and required capacity. A device can be busy executing padding, retries, late responses, or imbalanced work without producing proportional value.

The relevant datacenter relationship is:

\[
\text{fully loaded cost per useful result}
=
\frac{\text{fully loaded system cost per unit time}}
{\text{accepted in-objective results per unit time}}.
\]

The phrase “per unit time” belongs in both numerator and denominator and cancels. The result is cost per useful token, request, training step, or quality target—not cost per useful unit per unit time.

### Energy and power

Energy consumption can create a direct recurring cost, but its architectural importance may be larger than the utility bill:

- rack or facility power availability may limit deployable capacity;
- cooling and power delivery may require additional infrastructure;
- higher power can reduce density or constrain frequency;
- energy spent on failed, late, or nonuseful work increases cost without increasing output.

An energy improvement should therefore be translated separately into energy-cost savings, capacity enabled under a power ceiling, and any infrastructure avoided. These terms must not be counted twice.

### Battery life and mobile energy

Battery life is not a mobile operating expense. Lower energy per accepted feature result may create value through:

- longer device or feature duration;
- an always-on function that fits within the power budget;
- reduced skin temperature or thermal throttling;
- a smaller battery or additional space for another component;
- less cloud execution and network use;
- improved responsiveness, privacy, or offline availability.

The architect measures energy, wake scope, memory traffic, sustained temperature, latency, and fallback behavior. Product and finance teams determine how those measurements affect expected margin, product positioning, cloud expenditure, or customer value.

### Flexibility

A flexible platform can be redeployed when models, demand, or software change. Specialization may surrender part of that option.

Flexibility should not be represented by an arbitrary penalty chosen to protect the incumbent. It should be investigated through scenarios:

- What does migration cost if the operator set changes?
- What fraction of the candidate becomes unused if demand moves?
- Can the baseline capacity be reassigned to another workload?
- Is the candidate reusable, resalable, or accessible through a rental model?
- How long is the payback period relative to the expected workload-stability horizon?

The resulting cost range can enter \(O_{\mathrm{flex}}\), or the decision can be evaluated under several explicit workload futures.

## G.5 Datacenter Application

The datacenter case applies the common model in six steps.

### Step 1: Define the useful result and objective

Choose a unit appropriate to the decision:

- accepted tokens under a response-latency objective;
- completed requests at required quality and availability;
- training runs reaching a stated quality target;
- useful training progress after failures and recovery.

Do not mix theoretical operations, unconstrained benchmark throughput, and production results in one denominator.

### Step 2: Measure the optimized baseline

The baseline should include reasonable batching, quantization, fusion, memory management, model placement, serving optimization, and communication overlap. Measure:

- useful throughput under the objective;
- host, memory, network, and accelerator utilization;
- provisioned capacity and required headroom;
- power and energy at the relevant system boundary;
- failure, retry, and recovery losses;
- fully loaded cost using the organization’s approved cost stack.

Chapter 10 §10.6 identifies the physical and operational categories that may be relevant. Not every category differs between alternatives, so only incremental differences enter the decision.

### Step 3: Measure the candidate at the same boundary

The candidate must run the same accepted workload under the same quality, latency, availability, and security conditions. Include fallback, unsupported operators, host work, transfers, communication, and recovery. A vendor kernel advantage is not yet a system cost advantage.

### Step 4: Estimate transition cost

Candidate-specific transition cost may include:

- hardware qualification and acquisition differences;
- compiler, runtime, framework, and serving enablement;
- model conversion and numerical validation;
- observability, security, recovery, and operations;
- parallel operation during migration;
- team training, support contracts, and exit planning.

These terms vary substantially by organization. The model does not assume that software always dominates hardware acquisition; it requires both to be estimated.

### Step 5: Calculate recurring advantage

For an inference service:

\[
c_{\mathrm{useful}}
=
\frac{C_{\mathrm{fleet/hour}}}
{q_{\mathrm{useful/hour}}},
\]

where \(C_{\mathrm{fleet/hour}}\) is the fully loaded cost of the compared capacity and \(q_{\mathrm{useful/hour}}\) is accepted throughput under the service objective.

If the candidate’s cost per useful unit is \(c_C\) and the baseline’s is \(c_B\), then recurring saving per useful unit is:

\[
s=c_B-c_C.
\]

### Step 6: Test volume, time, and uncertainty

Calculate break-even at several demand levels, not only the forecast midpoint. Repeat the calculation for lower candidate advantage, lower utilization, delayed deployment, faster baseline improvement, and a shorter workload-stability horizon.

### Hypothetical datacenter example

Assume an optimized baseline has:

- fully loaded node cost: **$10 per hour**;
- accepted throughput under the service objective: **4,000 useful tokens per second**.

Its illustrative cost per million useful tokens is:

\[
\frac{\$10}
{4{,}000\times3{,}600}
\times 10^6
\approx \$0.69.
\]

Suppose a candidate platform produces the same accepted service at **30 percent lower cost per useful token**, giving an illustrative saving of:

\[
\$0.69\times0.30=\$0.207
\quad\text{per million useful tokens}.
\]

Assume complete incremental transition cost is **$30 million**. Ignoring discounting for this teaching example:

### Table G.3 — Datacenter payback sensitivity at 30 percent recurring advantage

| Sustained useful volume | Daily saving | Approximate payback |
|---|---:|---:|
| 1 billion tokens/day | $207/day | 397 years |
| 60 billion tokens/day | $12,420/day | 6.6 years |
| 199 billion tokens/day | $41,193/day | 2.0 years |
| 1 trillion tokens/day | $207,000/day | 145 days |

The two-year break-even volume is approximately:

\[
\frac{\$30{,}000{,}000}
{730\times \$0.207/\text{million tokens}}
\approx 199\ \text{billion useful tokens/day}.
\]

The conclusion is conditional, not “specialization always requires hyperscale.” Under these assumptions, the 30 percent advantage requires roughly 199 billion useful tokens per day for a two-year simple payback. A smaller transition cost, larger recurring advantage, longer permitted payback, or additional enabled value lowers the threshold. A smaller advantage, migration delay, weak utilization, or workload drift raises it.

### Utilization sensitivity

If the $0.69 baseline represents full use of provisioned useful capacity and the fixed fleet cost does not fall with demand, cost per useful token rises inversely with useful utilization:

### Table G.4 — Illustrative effect of useful utilization

| Useful utilization of provisioned capacity | Approximate cost per million useful tokens |
|---:|---:|
| 70% | $0.99 |
| 40% | $1.73 |
| 15% | $4.60 |
| 5% | $13.80 |

This does not mean a cloud service automatically gives a customer the provider’s utilization economics. Rental prices include provider cost, margin, contract, and risk allocation. It means that pooled demand can change the underlying capacity efficiency, making rented or shared specialization an alternative that must be compared with ownership.

### What the datacenter example teaches

The example is not evidence that $0.69 per million tokens, $30 million transition cost, or 30 percent advantage applies to a real service. It demonstrates four sensitivities:

1. fixed enablement cost is amortized by useful workload volume;
2. latency and demand distribution affect batching, useful utilization, and required capacity;
3. a percentage advantage has economic meaning only after the baseline cost and useful-result boundary are known;
4. the correct decision can be continued GPU use, rented specialization, or owned specialization depending on volume and lifecycle assumptions.

## G.6 Mobile Application

The mobile case uses the same six steps, but the unit of volume and the meaning of value change.

### Step 1: Define the useful result and objective

The useful result may be:

- one accepted local interaction;
- a continuously available feature over a defined interval;
- an image, audio, or language operation completed within a response and energy budget;
- a product capability that must function offline or preserve local privacy.

The objective should specify accepted quality, response time, energy boundary, sustained thermal condition, privacy, network dependence, and required device lifetime.

### Step 2: Define the baseline

The baseline may use:

- CPU or GPU execution on the same SoC;
- a DSP, ISP, or sensor hub;
- a smaller licensed accelerator;
- cloud execution;
- omission or reduction of the feature.

An NPU should not be compared with “no cost” if the baseline would require cloud service, more CPU/GPU capacity, a larger battery, or a reduced feature. Conversely, an enabled feature should not be credited entirely to the NPU if software, sensors, cloud services, or other hardware are equally necessary.

### Step 3: Measure system behavior

Measure the complete path:

- accepted operator and graph coverage;
- fallback and CPU wake-ups;
- shared-memory traffic;
- energy per accepted interaction or monitoring interval;
- idle and wake energy;
- sustained temperature and throttling;
- response time and quality;
- cloud and network activity avoided or introduced.

Peak TOPS does not determine these values.

### Step 4: Estimate transition and per-device cost

Fixed transition cost can include NPU or SoC design, verification, compiler and runtime development, OS integration, application conversion, model validation, and long-term support.

Incremental per-device cost can include:

- die area and its yield implications;
- memory, package, power delivery, and test;
- licensing or royalty;
- additional component or board requirements;
- expected warranty or support differences.

The opportunity cost of silicon area also matters. An NPU block competes with CPU, GPU, cache, ISP, modem, security, and other product functions.

### Step 5: Estimate per-device benefit

Per-device benefit may combine:

- cloud inference and network cost avoided over the device lifetime;
- component or battery cost avoided;
- expected contribution from an enabled or differentiated feature;
- reduced support or service cost;
- value of privacy, offline operation, or responsiveness as estimated by the product organization.

These terms must be nonoverlapping. For example, do not count the same energy improvement once as a smaller battery and again as longer battery life unless the product design actually realizes both benefits.

### Step 6: Test shipment volume, coverage, and model change

Shipment volume amortizes fixed design and enablement cost. Operator coverage determines whether the block produces value or becomes idle area. The analysis should test lower shipments, lower feature adoption, more fallback, delayed software readiness, and a model change during the support period.

### Hypothetical mobile example

Assume a candidate integrated accelerator has:

- fixed hardware-and-software transition cost: **$60 million**;
- incremental die-area cost: **$1.25 per shipped device**;
- incremental package, memory, test, and licensing cost: **$0.20 per device**;
- total recurring incremental cost: **$1.45 per device**.

Suppose the product organization estimates nonoverlapping lifetime benefit of **$2.25 per shipped device**, combining validated cloud-cost avoidance and expected product value. Net recurring benefit is therefore:

\[
s=\$2.25-\$1.45=\$0.80
\quad\text{per device}.
\]

The undiscounted break-even shipment volume is:

\[
Q_{\mathrm{BE}}
=
\frac{\$60{,}000{,}000}{\$0.80}
=75\ \text{million devices}.
\]

### Table G.5 — Mobile break-even sensitivity

| Lifetime benefit per device | Net benefit after $1.45 recurring cost | Break-even shipment volume |
|---:|---:|---:|
| $1.20 | −$0.25 | No break-even under these assumptions |
| $1.75 | $0.30 | 200 million devices |
| $2.25 | $0.80 | 75 million devices |
| $3.00 | $1.55 | 38.7 million devices |

This table exposes a distinction that shipment volume alone cannot hide. When per-device benefit is lower than incremental per-device cost, additional volume increases the loss. When per-device benefit exceeds recurring cost, volume amortizes the fixed transition cost.

The $2.25 value is not an architectural measurement. The architect can provide measured energy, latency, thermal, coverage, fallback, and cloud-usage effects. Product and finance teams must determine whether those effects create $2.25 of expected lifetime value. The proposal should show the result at several approved value estimates.

### What the mobile example teaches

1. shipment volume amortizes fixed NRE but does not repair negative per-device economics;
2. energy and battery improvements matter through realized product or component consequences;
3. coverage, fallback, wake scope, and sustained thermals determine whether nominal NPU capability becomes per-device value;
4. programmability and software support protect against model change and therefore affect flexibility and risk;
5. local acceleration may be justified by cost avoidance, enabled value, or both, but the same benefit must not be counted twice.

## G.7 Comparing Datacenter and Mobile Decisions

### Table G.6 — Same decision logic, different dominant sensitivities

| Question | Datacenter | Mobile |
|---|---|---|
| Useful volume | Tokens, requests, training progress, service-years | Shipped devices, active devices, feature interactions, device-years |
| Common baseline | Optimized CPU/GPU platform or rented service | CPU, GPU, DSP, sensor hub, smaller accelerator, or cloud |
| Frequent fixed costs | Platform enablement, migration, qualification, parallel operations | Design and verification NRE, toolchain, OS and application integration |
| Frequent recurring costs | Capacity, memory, network, energy, cooling, operations, failed work | Die area, yield, package, memory, licensing, cloud usage |
| Latency consequence | Batching freedom, useful throughput, capacity, service value | Responsiveness, feature acceptance, cloud dependence |
| Energy consequence | Utility cost, cooling, rack density, capacity under a power ceiling | Battery duration, thermals, form factor, feature feasibility |
| Volume sensitivity | Useful demand and fleet utilization | Shipment volume and feature use |
| Flexibility value | Redeployment across workloads and changing models | Future operator coverage and product support life |
| Common alternative to ownership | Rental or hosted specialized capacity | Licensed IP, cloud execution, or existing SoC engines |

The two environments differ, but neither can be reduced to “OPEX savings” or “CAPEX spending.”

Datacenter decisions often turn on useful demand, utilization, service objectives, and the cost of provisioned capacity. Mobile decisions often turn on fixed NRE, per-device area and integration cost, shipment volume, coverage, sustained energy, and enabled product value. Both still use the same lifecycle comparison.

## G.8 Handling Uncertainty Without False Precision

Economic inputs are uncertain because demand, model architecture, software maturity, product adoption, power prices, supply, and competitor platforms change.

A useful analysis should provide at least three cases:

- **downside:** lower volume or adoption, smaller technical advantage, delayed readiness, and earlier workload change;
- **base:** the organization’s approved planning assumptions;
- **upside:** stronger volume, stable workload, and full realization of the measured advantage.

For each case, show which inputs are:

- measured directly;
- derived from measurements;
- contractually known;
- forecast;
- strategic estimates supplied by product or business teams.

Sensitivity analysis should change one important assumption at a time before combining scenarios. This reveals whether the decision is controlled by:

- transition cost;
- recurring technical advantage;
- useful utilization;
- demand or shipment volume;
- product value;
- time to deployment;
- workload-stability horizon;
- flexibility or supply risk.

A conclusion that changes under a small, plausible input variation is not necessarily unusable. It is a close decision that may justify a staged commitment, rental, prototype, FPGA validation, dual-platform software path, or contractual protection rather than immediate full ownership.

## G.9 Architect-to-Business Decision Checklist

For every proposed offload, document:

1. **Useful result:** What accepted output or enabled capability is being purchased?
2. **Objective:** Which quality, latency, availability, privacy, energy, thermal, or lifecycle requirement must hold?
3. **Baseline:** What is the best credible alternative after reasonable software optimization?
4. **Residual bound:** What measured technical limit remains, and what consequence does it cause?
5. **Hardware lever:** Does the candidate change the bound or merely move it into memory, communication, software, or another subsystem?
6. **Complete candidate:** Which hardware, software, integration, migration, operations, and recovery components are required?
7. **Transition cost:** Which incremental fixed costs occur, when, and who owns them?
8. **Recurring difference:** What cost is avoided or added per useful unit or shipped device?
9. **Enabled value:** What capability or service value exists only because of the candidate, and who approved its valuation?
10. **Volume:** Which demand, utilization, active-user, or shipment assumption amortizes the investment?
11. **Time:** What is the evaluation horizon, deployment delay, payback requirement, and discounting method?
12. **Flexibility:** What can the baseline be reassigned to, and what becomes stranded if the workload changes?
13. **Risk:** How are supply, vendor, schedule, software, reliability, and obsolescence represented?
14. **Alternatives:** Can rental, licensed IP, staged deployment, or requirement change obtain the benefit with less fixed commitment?
15. **Uncertainty:** Which conclusion holds in downside, base, and upside cases?

The checklist is intentionally capable of producing a negative result. “Continue optimizing software,” “remain on the flexible platform,” “rent rather than own,” and “renegotiate the requirement” are valid architectural-economic decisions.

## G.10 Summary: What the Reader Should Take Away

The economic case for AI acceleration begins after the technical case has identified a real residual bound and a hardware lever that changes it. Faster hardware is not automatically operationally valuable, and operational value is not automatically sufficient to repay specialization.

The reader should retain seven principles:

1. **Compare complete alternatives.** The baseline must be credible, and the candidate includes its software, integration, operations, and recovery obligations.
2. **Hold the useful-result boundary constant.** Cost and performance comparisons are meaningful only when quality, latency, availability, privacy, thermal, and reliability objectives are equivalent.
3. **Translate technical metrics through consequences.** Latency affects batching, capacity, and service value; battery life affects product capability and design freedom. Neither is an expense by itself.
4. **Separate fixed and recurring economics.** Volume amortizes transition cost only when the candidate produces positive net benefit per useful unit or device.
5. **Treat flexibility and risk as decision variables.** A general platform’s ability to absorb workload change has value, while a specialized platform can create migration, supply, and obsolescence exposure.
6. **Use sensitivity analysis rather than one precise forecast.** The important output is often the break-even condition and the variables that move it, not a single predicted dollar value.
7. **Allow the analysis to reject specialization.** A technically superior accelerator may still be the wrong ownership decision at the available volume, time horizon, or software maturity.

The practical conversation between architect and business decision maker should therefore end with a conditional statement:

> Under this useful-result boundary, workload or shipment volume, lifecycle horizon, measured technical advantage, transition cost, enabled value, flexibility assumption, and risk range, the candidate does—or does not—produce greater lifecycle value than the best credible alternative.

That statement is the intended outcome of this primer. It converts an acceleration proposal from an appeal to performance into a transparent decision whose assumptions can be measured, challenged, and revised.
