# Appendix G. Economic Primer: When AI Acceleration Pays

## Status and Purpose

**Status:** Approved future-work placeholder; design now, develop after Chapters 6 and 10.

This appendix will prepare system and AI architects to discuss acceleration decisions with business, finance, product, and infrastructure decision makers. It will translate architectural effects into lifecycle economics without reducing the decision to peak performance, purchase price, or a simplistic CAPEX-versus-OPEX comparison.

The governing question is:

> When do the lifecycle benefits of specialization exceed its fixed cost, integration cost, flexibility loss, and risk?

The initial scope covers two deliberately different economic environments:

1. hyperscale and datacenter AI services;
2. mobile AI devices and platforms.

Desktop, workstation, non-mobile edge, and embedded economics are deferred. Enterprise private AI may be mentioned where it clarifies why datacenter-like architecture can have different utilization, staffing, capital, and lifecycle economics.

## Terminology Guardrails

Latency and battery life are technically and economically important, but neither is itself an operating expense.

- **Datacenter latency** affects service-level compliance, user or business value, batching freedom, required capacity, capacity headroom, and the number of systems needed to serve demand.
- **Mobile battery life** affects product utility, feature feasibility, thermal and form-factor design, component sizing, customer experience, and potentially avoided cloud-service cost.

The appendix must distinguish:

> technically possible → operationally beneficial → economically justified

Hardware “necessity” is therefore conditional. A residual architectural bound may establish that software cannot reach an objective on the existing platform, but specialization is economically justified only when its recurring benefit or enabled product value repays the complete lifecycle cost and risk.

## Common Lifecycle Model

The analysis will use a common model broad enough to cover both datacenter and mobile decisions:

- hardware and infrastructure acquisition;
- accelerator or SoC design, verification, masks, licensing, and non-recurring engineering;
- software enablement, compiler and runtime work, model conversion, validation, and operations;
- power, cooling, memory, storage, networking, and facility effects;
- unused, reserved, or stranded capacity;
- reliability, failure recovery, serviceability, and safe fallback;
- product or service value affected by response time, availability, privacy, or offline operation;
- flexibility and option value under workload or model evolution;
- schedule, supply, integration, and adoption risk;
- retirement, migration, and support over the deployment lifecycle.

A simplified break-even expression may be introduced for intuition:

> Fixed specialization and enablement cost < cumulative recurring savings + enabled product or service value − added lifecycle risk

The expression is a decision framework, not a claim that every term can be estimated precisely. Each example must state its measurement boundary, time horizon, workload stability, utilization or shipment assumptions, and uncertainty.

## Datacenter Economics

The datacenter section will connect architectural decisions to:

- cost per useful token, request, training run, or achieved quality target;
- throughput and goodput under service-level and tail-latency constraints;
- capacity required for average, peak, and failure conditions;
- useful utilization rather than nominal occupancy;
- batching efficiency versus queueing and response latency;
- energy and cooling per useful result;
- memory capacity, bandwidth, and residency;
- scale-up and scale-out networking, communication exposure, and topology;
- failed work, checkpointing, recovery, redundancy, and capacity headroom;
- software-platform and migration cost;
- hyperscale amortization of custom silicon and enablement;
- the different economics of enterprise-private or smaller-scale infrastructure.

The primary architectural question is not whether an accelerator produces more operations per second. It is whether the complete system can deliver the required useful work with less deployed capacity, energy, communication, operational burden, or service risk over its lifecycle.

## Mobile Economics

The mobile section will connect architectural decisions to:

- accelerator silicon area and opportunity cost within the SoC;
- package, memory, board, and component cost per device;
- design and software non-recurring engineering amortized over shipped units;
- yield and product-segmentation implications where evidence permits;
- energy per inference, interaction, or continuously monitored interval;
- CPU, GPU, NPU, memory, and power-domain wake cost;
- shared-memory bandwidth and contention;
- sustained thermal limits, skin temperature, and device form factor;
- battery sizing, product weight, and feature duration;
- responsiveness, privacy, offline operation, and user-visible product value;
- local inference that avoids or reduces cloud inference and network cost;
- long device-support cycles and the risk that model architectures change;
- opportunity cost of area assigned to an NPU rather than CPU, GPU, ISP, modem, cache, or another product feature.

The economic benefit of mobile acceleration may appear as a lower component cost, but it may instead appear as longer battery life, an otherwise infeasible always-on feature, better responsiveness, reduced cloud usage, privacy, or differentiation across a high shipment volume.

## Representative Break-Even Examples

At least two simple, transparent examples will be developed:

1. **Datacenter service:** a specialized accelerator or execution path lowers fleet capacity and energy while meeting a specified response-latency objective. The example should show how batching freedom, useful utilization, memory, network exposure, failure headroom, software enablement, and workload volume affect break-even.
2. **Mobile feature:** an integrated accelerator is justified through shipment volume, energy per interaction, reduced wake scope, or an otherwise thermally infeasible feature. The example should include silicon-area opportunity cost, software support, memory traffic, device lifecycle, and model-change risk.

These examples should use normalized or hypothetical values unless reliable public evidence supports real values. Their purpose is to teach sensitivity analysis, not to publish an apparently precise universal cost model.

## Architect-to-Business Decision Checklist

For every proposed offload, the appendix will ask:

1. What recurring workload phase is being accelerated?
2. Which residual technical bound remains after software optimization?
3. Which system cost, service objective, or product constraint does that bound affect?
4. What is the useful-result measurement boundary?
5. How stable is the workload, operator set, precision, shape distribution, and deployment volume?
6. What fixed design, software, validation, and integration costs does specialization introduce?
7. What recurring hardware, energy, cooling, network, cloud, or operational costs does it change?
8. What flexibility, portability, and option value are surrendered?
9. At what utilization, fleet scale, service volume, or shipment volume does the choice break even?
10. What happens if demand, models, quality requirements, or software platforms change?
11. Who owns support, observability, failure recovery, security, and migration?
12. Which assumptions are measured, forecast, uncertain, or strategic?

## Relationship to the Main Paper

- Chapters 1 through 5 establish why technical and economic limits must be separated.
- Chapter 6 will identify the architectural choices whose economic implications require comparison.
- Chapter 10 will supply memory, packaging, interconnect, power, cooling, manufacturing, and total-cost inputs.
- This appendix will synthesize those inputs into a plain-language decision framework rather than duplicate either chapter.

Development should therefore begin after the first substantive iteration of Chapter 6 and should be finalized after Chapter 10.
