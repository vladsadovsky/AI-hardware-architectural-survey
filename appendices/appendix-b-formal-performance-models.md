# Appendix B. Formal Performance Models

## B.1 Purpose and Limits

The main text uses compact quantitative bounds without turning the survey into a performance-modeling textbook. This appendix collects the formal models behind those bounds, states their assumptions, and shows how they compose. None predicts a production system from datasheet values alone. Their purpose is diagnostic: identify which resource or dependency can plausibly bind, determine which measurements are needed, and reject hardware claims that cannot change the governing term.

Symbols are local to this appendix unless otherwise stated. Rates use consistent units; bytes refer to the memory or communication boundary named by the model.

## B.2 Roofline and Operational Intensity

For peak arithmetic throughput \(P_{\mathrm{peak}}\), sustained bandwidth \(\beta\), and operational intensity \(I\),

\[
P_{\mathrm{attainable}} \leq \min\!\left(P_{\mathrm{peak}}, I\beta\right).
\]

The balance point is

\[
I^{*}=\frac{P_{\mathrm{peak}}}{\beta}.
\]

If \(I<I^{*}\), bandwidth is the Roofline ceiling; if \(I>I^{*}\), arithmetic peak is the ceiling. Operational intensity is

\[
I=\frac{O_{\mathrm{useful}}}{B_{\mathrm{boundary}}},
\]

where \(O_{\mathrm{useful}}\) excludes padding or discarded work and \(B_{\mathrm{boundary}}\) counts bytes crossing the chosen boundary. The same operation can have several intensities: one at register-to-local-memory, another at HBM, and another at host or network memory.

Quantization generally raises operational intensity at a weight-streaming boundary by reducing bytes per represented parameter. Tiling and fusion raise it by increasing reuse before values cross the boundary. Neither changes a compulsory dependency or creates admissible batch under a fixed latency objective.

### Hierarchical Rooflines

For memory levels \(j\), each with sustained bandwidth \(\beta_j\) and bytes \(B_j\),

\[
T \geq \max_j\left(\frac{B_j}{\beta_j}\right),
\qquad
P_{\mathrm{attainable}} \leq
\min\left(P_{\mathrm{peak}}, \min_j I_j\beta_j\right).
\]

This form prevents “memory-bound” from collapsing caches, SRAM, HBM, host memory, and networks into one resource. It also makes explicit that a design can relieve one level and expose the next.

## B.3 Compulsory-Byte Bounds for Transformer Decode

Let \(N_p\) be parameter count, \(q_w\) average stored bytes per weight including quantization metadata, \(B_{\mathrm{KV}}\) KV bytes read or written per generated token, and \(B_{\mathrm{other}}\) other compulsory traffic. Minimum bytes per token are

\[
B_{\mathrm{token}} \geq N_p q_w + B_{\mathrm{KV}} + B_{\mathrm{other}}.
\]

For sustained memory bandwidth \(\beta_{\mathrm{mem}}\),

\[
R_{\mathrm{token}} \leq
\frac{\beta_{\mathrm{mem}}}{B_{\mathrm{token}}}.
\]

The main-text §2.5 illustration deliberately sets \(B_{\mathrm{KV}}=B_{\mathrm{other}}=0\), uses \(N_p\approx70\times10^9\), \(q_w=1\) byte, and \(\beta_{\mathrm{mem}}=3.35\times10^{12}\) bytes/s:

\[
R_{\mathrm{token}} \lesssim 47.9\ \text{tokens/s}.
\]

This is an upper bound, not a benchmark. It assumes each weight is read once, bandwidth is fully sustained, transfers overlap perfectly, and all other traffic and overhead vanish.

With an admissible batch \(b\) sharing one weight read,

\[
B_{\mathrm{token,sequence}} \gtrsim
\frac{N_p q_w}{b}+B_{\mathrm{KV,sequence}}+B_{\mathrm{other,sequence}}.
\]

The weight term falls with \(b\), but KV capacity, queueing delay, and shape variance rise. The model therefore connects directly to the latency-throughput frontier rather than predicting that “larger batch is always better.”

### KV-cache capacity

For \(L\) transformer layers, \(n_{\mathrm{kv}}\) key/value heads, head dimension \(d_h\), stored bytes \(q_{\mathrm{kv}}\), active sequence length \(s\), and \(r\) live requests,

\[
C_{\mathrm{KV}}
\approx
2L n_{\mathrm{kv}} d_h q_{\mathrm{kv}} s r,
\]

with the factor two representing keys and values. Architectural variants such as grouped-query attention change \(n_{\mathrm{kv}}\); paging changes allocation efficiency, not the information represented by the live state.

## B.4 Latency, Throughput, and Queueing

For arrival rate \(\lambda\), mean service time \(E[S]\), and \(m\) equivalent servers, offered load is

\[
\rho=\frac{\lambda E[S]}{m}.
\]

Stable mean behavior requires \(\rho<1\). As \(\rho\) approaches one, waiting time and high-percentile latency can rise sharply even if mean device utilization appears attractive.

Little’s Law applies to a stable boundary:

\[
L=\lambda W,
\]

where \(L\) is average work in the system and \(W\) average time in the system. In inference serving, admitting more concurrent requests increases \(L\), which may improve batching and arithmetic utilization, but also consumes KV capacity and can increase \(W\).

A simple response-time decomposition is

\[
T_{\mathrm{response}}=
T_{\mathrm{admission}}+
T_{\mathrm{queue}}+
T_{\mathrm{prefill}}+
\sum_{k=1}^{n_{\mathrm{out}}}T_{\mathrm{decode},k}+
T_{\mathrm{external}}+
T_{\mathrm{post}}.
\]

Accelerating a kernel changes the response only through its term. The decomposition is intentionally broader than the model graph: retrieval, tool calls, scheduling, and postprocessing remain visible.

### Batch-window bound

Let \(w\) be the maximum batching delay permitted by the SLO and \(\lambda\) the arrival rate for compatible work. Under a simple independent-arrival approximation, expected batch opportunity is

\[
E[b]\approx 1+\lambda w.
\]

Production arrivals are bursty and correlated, so this is only a first estimate. It nevertheless exposes why identical models yield different hardware verdicts at hyperscale and enterprise volume: admissible concurrency is partly a demand-distribution property.

## B.5 Parallel Speedup and the CPU–Accelerator Boundary

Amdahl’s Law gives an upper bound for parallel speedup:

\[
S(N)=\frac{1}{(1-f)+f/N},
\]

where \(f\) is the fraction accelerated perfectly across \(N\) resources. In heterogeneous systems, transfers, queueing, synchronization, and host work make the nonaccelerated fraction dependent on the partition. A more useful decomposition is

\[
T_{\mathrm{total}}=
T_{\mathrm{host}}+
T_{\mathrm{submit}}+
T_{\mathrm{transfer}}+
T_{\mathrm{accelerated}}+
T_{\mathrm{sync}}+
T_{\mathrm{fallback}}.
\]

If a proposed accelerator reduces \(T_{\mathrm{accelerated}}\) but increases the other terms, kernel speedup may produce no end-to-end gain. Shared physical memory can reduce explicit copies while leaving ownership transfer, cache maintenance, page migration, contention, and wake costs.

## B.6 Utilization as a Vector

Define:

\[
U_{\mathrm{arith}}=
\frac{\text{active useful arithmetic lanes-cycles}}
{\text{provisioned arithmetic lanes-cycles}},
\]

\[
U_{\mathrm{mem}}=
\frac{\text{useful operand bytes delivered}}
{\text{peak transferable bytes}},
\]

\[
U_{\mathrm{capacity}}=
\frac{\text{usefully resident state}}
{\text{provisioned capacity}},
\]

\[
U_{\mathrm{time}}=
\frac{\text{time executing admitted work}}
{\text{available time}},
\]

and

\[
U_{\mathrm{useful}}=
\frac{\text{correct in-objective completed work}}
{\text{nominal executed work}}.
\]

These quantities need not move together. Padding can raise \(U_{\mathrm{arith}}\) while lowering \(U_{\mathrm{useful}}\); reserving capacity can lower \(U_{\mathrm{capacity}}\) while improving tail latency and availability.

## B.7 Communication and Collective Bounds

For a message of size \(M\), per-message latency \(\alpha\), and sustained link bandwidth \(\beta_{\mathrm{link}}\), a basic transfer bound is

\[
T_{\mathrm{message}}\geq \alpha+\frac{M}{\beta_{\mathrm{link}}}.
\]

For a collective, topology and algorithm multiply these terms. A simplified ring all-reduce over \(N\) participants is

\[
T_{\mathrm{ring}}
\approx
2(N-1)\alpha+
2\frac{N-1}{N}\frac{M}{\beta_{\mathrm{effective}}},
\]

before contention, imbalance, protocol work, and overlap are considered.

Let \(T_c\) be compute time, \(T_m\) communication time, and \(0\leq\gamma\leq1\) the fraction of communication hidden by useful computation. Step time is bounded by

\[
T_{\mathrm{step}}\geq T_c+(1-\gamma)T_m.
\]

Overlap does not make communication free; it moves the visible term until communication exceeds the available independent compute window.

### Scaling efficiency

For useful performance \(P_N\) on \(N\) comparable resources,

\[
\eta_N=\frac{P_N}{N P_1}.
\]

For training, a stronger denominator is progress to a fixed quality target rather than raw steps. For serving, the comparison must preserve the SLO and request distribution.

### MoE routing

For token representations of \(d\) elements, stored bytes \(q_a\), \(r\) routed tokens, and replication or routing factor \(k\), minimum payload is on the order of

\[
B_{\mathrm{MoE}}\gtrsim r d q_a k,
\]

before metadata, padding, imbalance, and return traffic. Reducing expert arithmetic per token does not reduce this payload automatically; expert placement and topology determine how much becomes remote.

## B.8 Pipeline Parallelism and Imbalance

For \(p\) pipeline stages with stage times \(t_i\) and \(m\) microbatches, an idealized pipeline completion time is

\[
T_{\mathrm{pipe}}
\geq
\sum_{i=1}^{p}t_i+
(m-1)\max_i t_i.
\]

The first term is fill, the second steady-state cadence; drain is contained by the finite sequence. If stages are imbalanced, the maximum stage time sets throughput. More microbatches reduce bubble fraction but increase activation state and may change optimization behavior.

For variable work \(X_i\) across partitions, synchronized completion depends on

\[
T_{\mathrm{sync}}\geq \max_i X_i,
\]

not the mean. This is the mathematical source of straggler sensitivity in sparse, routed, and variable-sequence workloads.

## B.9 Energy and Thermal Models

Energy per useful result is

\[
E_{\mathrm{useful}}=
\frac{
E_{\mathrm{compute}}+
E_{\mathrm{memory}}+
E_{\mathrm{communication}}+
E_{\mathrm{host}}+
E_{\mathrm{idle/wake}}+
E_{\mathrm{cooling}}+
E_{\mathrm{failed}}
}{
N_{\mathrm{accepted\ results}}
}.
\]

The boundary should match the deployment. Cooling may be appropriate for facility comparison but not for a die-level mechanism study; host and wake energy are essential for client and embedded offload.

Dynamic energy for an event class \(j\) is approximately

\[
E_{\mathrm{dynamic}}=\sum_j n_j e_j,
\]

where \(n_j\) is event count and \(e_j\) energy per event at the measured implementation. Process-specific numbers cannot be transported unchanged across nodes, but the accounting structure is stable.

Average power over interval \(T\) is

\[
\bar P=\frac{E_{\mathrm{useful,total}}}{T}.
\]

A design satisfies a sustained thermal envelope only if long-run \(\bar P\) and spatial heat flux remain supportable. Short burst power does not establish sustained performance.

### Wake-scope break-even

If accelerator execution saves \(\Delta E_{\mathrm{kernel}}\) but activates additional domains with energy \(E_{\mathrm{wake}}\) and idle tail \(P_{\mathrm{tail}}t_{\mathrm{tail}}\), offload saves energy only if

\[
\Delta E_{\mathrm{kernel}}>
E_{\mathrm{wake}}+P_{\mathrm{tail}}t_{\mathrm{tail}}+E_{\mathrm{movement}}.
\]

This is why a small always-on engine can beat a much more efficient kernel on a larger processor at the system boundary.

## B.10 Reliability and Goodput

Let raw useful throughput while operating be \(R\), availability \(A\), fraction of work lost or repeated \(f_{\mathrm{loss}}\), and fraction completed within the objective \(f_{\mathrm{SLO}}\). Then

\[
G=R A (1-f_{\mathrm{loss}}) f_{\mathrm{SLO}}
\]

is an approximate goodput model.

For \(N\) independent components each with failure rate \(\lambda_f\), system event rate often grows roughly with \(N\lambda_f\), while independence usually fails because power, cooling, firmware, network, and software create correlated faults. Checkpoint interval, restore bandwidth, spare capacity, and failure blast radius therefore belong in scale comparisons.

## B.11 Workload Signatures as Marked Processes

Let arrivals occur at times \(\{t_i\}\). Each task carries a mark

\[
M_i=(S_i, A_i, W_i, R_i, D_i, C_i, Q_i),
\]

where \(S_i\) describes shapes and operations, \(A_i\) access structure, \(W_i\) working state, \(R_i\) ready-work and dependencies, \(D_i\) deadline or service objective, \(C_i\) communication, and \(Q_i\) numerical or quality requirements.

A deployment model requires the joint distribution

\[
\Pr(M_i,\, t_i-t_{i-1},\, M_{i-1},\ldots),
\]

not only independent marginal averages. Correlations matter: long prompts may correlate with long outputs; burst arrivals may correlate with one model; scene complexity may correlate across consecutive video frames. Model fitting should therefore test stationarity, phase changes, and conditional distributions rather than assuming a memoryless queue.

The practical output is not a theorem but a trace-backed signature table with percentiles and correlations sufficient to drive simulation, capacity planning, or mapping evaluation.

## B.12 Formal Hardware-Necessity Test

Let:

- \(B_r\) be a demonstrated residual bound after reasonable software optimization;
- \(C(B_r,D)\) be its material consequence under deployment \(D\);
- \(H\) be a hardware change;
- \(\Delta B(H)\) be the degree to which \(H\) changes rather than relocates the bound;
- \(V_{\mathrm{life}}(H)\) be lifecycle benefit;
- \(K_{\mathrm{transition}}(H)\) be design, enablement, integration, and migration cost;
- \(O_{\mathrm{flex}}(H)\) be flexibility option value surrendered;
- \(R_{\mathrm{risk}}(H)\) be risk-adjusted supply, support, and obsolescence cost.

Specialization is justified only if

\[
B_r\ \text{is measured},
\]

\[
C(B_r,D)\geq C_{\min},
\]

\[
\Delta B(H)>0,
\]

and

\[
V_{\mathrm{life}}(H)>
K_{\mathrm{transition}}(H)+
O_{\mathrm{flex}}(H)+
R_{\mathrm{risk}}(H).
\]

Appendix G expands the final inequality economically. The formalization matters because it permits valid negative results: software work, requirement renegotiation, or continued use of a flexible platform may be the correct outcome.

## B.13 Measurement Checklist

Before applying any model:

1. Name the useful-result boundary and deployment objective.
2. Separate phases with different signatures.
3. Use sustained rather than peak bandwidth when predicting observed behavior.
4. Count metadata, padding, conversions, synchronization, and state movement.
5. Preserve latency, quality, precision, reliability, and thermal constraints across comparisons.
6. Report distributions for arrivals, service time, shapes, and tails.
7. Distinguish per-die, package, node, rack, and service quantities.
8. Validate the predicted binding term with counters or controlled perturbation.
9. Re-run the analysis after each optimization because the bottleneck may move.
10. Treat unexplained distance from a bound as a measurement question, not proof that the model is wrong or that new hardware is required.

The models in this appendix are most useful when they falsify a proposed explanation early. A Roofline bound can show that more tensor throughput cannot repair weight streaming; a queueing model can show that a faster device cannot create batchable demand; and the necessity inequality can show that a real silicon advantage still fails economically.
