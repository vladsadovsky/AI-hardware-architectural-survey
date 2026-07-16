---
writer_app: llm-aggregator
writer_version: 0.0.0
schema_version: 1
exported_at: 2026-07-15T21:22:47.267Z
export_type: thread
thread_name: Bukatin sparse matrix GPU shared
---

title: Hi, what is the current situation with GPU-friendly algorithms for ult...
source: unknown
url: 
tags: 
version: 0
original_id: 20260715_141755_254
original_timestamp: 2026-07-15T21:17:55.254Z

## Question

Hi, what is the current situation with GPU-friendly algorithms for ultra-sparse matrices and tensors?

## Answer

Bottom line

As of mid-2026, GPU sparse computing is quite mature for fixed-pattern sparse matrices, especially sparse–dense multiplication, but there is still no generally satisfactory solution for hypersparse, dynamically changing, higher-order sparse tensors.

The important distinction is not merely “how many zeros?” but:

how much work is performed per stored nonzero;
whether nonzeros have useful row, block, or fiber structure;
whether the sparsity pattern is reused;
whether the result is dense or itself sparse;
whether enough independent work can be batched to fill the GPU.

A matrix with one scalar multiply per nonzero can be too sparse to use a GPU efficiently, while the same sparsity pattern multiplying 128-dimensional feature vectors can be an excellent GPU workload.

Status by operation
Operation	Current situation
SpMV: sparse × vector	Production-quality, but intrinsically memory- and latency-bound. CSR, COO, SELL-like formats and adaptive row/NNZ partitioning are mature. Index compression is again an active research direction.
SpMM: sparse × dense matrix	The strongest GPU sparse regime. Each sparse index is amortized across multiple dense columns, making much better use of bandwidth and compute.
SDDMM: dense × dense, sampled at sparse locations	Reasonably well supported, especially for graph and attention workloads.
SpGEMM: sparse × sparse	Supported, but substantially harder: the output structure is unknown and may be much denser than either input. Symbolic analysis, allocation, hashing, sorting and duplicate reduction often dominate.
Higher-order sparse tensors	Improving rapidly at the compiler/representation level, but still much less turnkey than matrix operations.
Dynamic sparse structures	Still the hardest regime. Memory allocation, compaction, sorting and changing output shapes conflict with efficient GPU execution and tracing/JIT systems.

NVIDIA’s current cuSPARSE provides SpMV, SpMM, SpGEMM, sparse addition, solvers, format conversion and 32/64-bit indexing, with multiple selectable algorithms and preprocessing phases. NVIDIA describes its main target range as roughly 70%–99.9% zeros, although this does not imply that every matrix in that range is profitable on a GPU. CUDA 13.x has continued to improve small-matrix handling, BSR support, 64-bit SpGEMM and lower-overhead SpMV planning.

AMD’s rocSPARSE exposes essentially the same algorithmic toolkit: segmented COO, adaptive CSR, row-split, NNZ-split, merge-path, atomic and segmented-atomic SpMM, BSR/blocked ELL, and separate symbolic and numeric SpGEMM phases.

Why “ultra-sparse” is awkward on GPUs

Suppose an m×n matrix has only z nonzeros, with z≪m,n. A GPU kernel must still:

read one or more indices per value;
gather an irregular source value;
schedule highly unequal rows or fibers;
reduce contributions that target the same output;
possibly construct and sort a sparse result.

For scalar SpMV, this is often only one multiply-add for perhaps 8–16 bytes of values and indices, plus an irregular vector load. SpMV is consequently memory-bound; recent work even obtains gains by entropy-compressing index streams and decoding them during multiplication.

For SpMM with feature width F, a nonzero can generate F multiply-adds. Increasing F, batching matrices, or processing many independent sparse structures is therefore usually much more important than the nominal sparsity percentage.

At very small total nnz, even a theoretically efficient kernel may lose to a CPU because of kernel-launch, synchronization and device-memory latency. There is no stable universal crossover point; it depends strongly on GPU generation, feature width, index format and whether data already resides on the GPU.

Storage formats that currently matter
COO or edge-list form

For truly hypersparse data—huge dimensions but relatively few active rows—COO is often the natural baseline:

(row[k],col[k],value[k]).

It avoids CSR’s O(m) row-pointer array. If entries are sorted by destination row, segmented scans or reductions can accumulate outputs efficiently. Current vendor libraries explicitly include segmented and atomic COO algorithms.

Its disadvantages are duplicated row indices and more expensive row traversal. Unsorted duplicates usually require sort-plus-reduce or atomics.

CSR and compressed active-row formats

CSR is generally preferable when:

a significant fraction of rows is nonempty;
rows are traversed repeatedly;
row boundaries are useful for scheduling;
the sparsity structure remains fixed.

For hypersparse matrices, a useful hybrid is essentially “CSR over active rows”: store the IDs of nonempty rows plus pointers into their entries. This avoids allocating a pointer for every logically possible row.

Block formats

BSR, blocked ELL and block-COO are excellent when nonzeros cluster into reasonably dense blocks. They amortize metadata and make vector loads and Tensor Core use possible.

But ordinary NVIDIA sparse Tensor Cores do not accelerate arbitrary ultra-sparse matrices directly. cuSPARSELt primarily targets fixed 50%-sparse N:M patterns—typically 2:4—not arbitrary 99.9%-sparse structures.

Recent research does make Tensor Cores useful for some unstructured matrices by reordering, packing, zero-filling selected tiles and using sparsity-aware scheduling. Acc-SpMM, cuTeSpMM and the 2026 AsyncSparse preprint exemplify this direction; the latter adds Hopper-era TMA, warp specialization and window-compressed CSR. These are promising, but their advantages depend on local tile density and amortizing preprocessing, and they are not yet a universal replacement for scalar-core sparse kernels.

CSF and other hierarchical tensor formats

For order-d tensors, compressed sparse fiber formats generalize CSR by recursively compressing coordinates at each dimension. They work well when repeated prefixes—fibers—are common. Plain COO remains attractive when tensors are exceptionally sparse or frequently mutated.

The difficult part is that the optimal dimension ordering and compression scheme depend on the contraction. A format excellent for one contraction may be poor for its transpose or for a different sequence of index joins.

The emerging sparse-tensor compiler ecosystem

This area has advanced noticeably.

MLIR now treats sparse tensor layouts as first-class types and has a sparsification pipeline capable of generating code or dispatching operations to libraries such as cuSPARSE.

Finch provides a richer language for sparse and structured tensors, including control flow and diverse storage structures, although its strongest established implementations have historically been CPU-oriented.

Research systems such as Insum translate sparse operations into “indirect einsums” that can be lowered through dense GPU compiler machinery; this reflects a broader trend toward representing sparse metadata traversal explicitly while delegating dense subcomputations to highly optimized GPU code.

A particularly interesting 2026 development is NVIDIA’s Universal Sparse Tensor in nvmath-python. UST separates logical sparsity from physical layout, permits user-defined formats, and either dispatches to handwritten kernels or generates specialized code. It currently emphasizes sparse–dense matrix multiplication and uses a planning/execution split so compilation and format analysis can be amortized over repeated calls. It remains a relatively new and partly experimental system rather than a complete general sparse-tensor algebra environment.

Dynamic sparsity remains a major dividing line

GPUs are happiest when the structure is fixed and only values change. The normal production strategy for dynamic sparsity is therefore not a fully dynamic pointer structure, but something like:

fixed-capacity COO arrays;
an active-entry count or mask;
parallel prefix-sum for insertion/deletion;
occasional compaction;
periodic sorting and duplicate coalescing;
overallocated output workspaces;
reuse of execution plans between structural changes.

For SpGEMM and similar operations, implementations commonly separate:

symbolic structure determination⟶allocation⟶numeric computation.

That separation is visible in current cuSPARSE and rocSPARSE APIs.

Pointer-rich structures such as trees and hash tables can be implemented on GPUs, but they generally sacrifice memory coalescing and deterministic scheduling. Sort-and-reduce pipelines often outperform them unless incremental updates vastly outnumber complete traversals.

Implications for your tree-shaped tensor/dataflow work

For your DMM/V-value-style system, I would currently treat the structure primarily as a dynamic graph/message-passing problem, not as generic sparse tensor algebra.

Flatten the active tree addresses and ports into integer IDs and represent each connection approximately as:

src_id[k]
dst_id[k]
weight[k]
connection_type[k]   # only when genuinely necessary

The core linear movement becomes:

y
dst[k]
	​

+=w
k
	​

x
src[k]
	​

,

implemented as:

gather source values;
apply the per-edge multiplication or typed operation;
segmented reduction or scatter-add by destination.

That is effectively COO SpMM/message passing. It is a very standard GPU pattern.

The most important design choices would be:

Sort by destination when topology changes infrequently; this allows segmented reduction instead of heavy atomic contention.
Keep topology separate from values, so gradient updates do not force structural reconstruction.
Use 32-bit local IDs whenever possible, even if global symbolic IDs are 64-bit.
Batch population members, time steps, machines or feature channels. Scalar messages over a modest number of edges will underutilize a GPU.
Represent dynamic growth with capacity plus an active count, rather than changing array shapes every cycle.
Coalesce duplicate edges periodically, rather than requiring uniqueness during every update.
Exploit block structure when several leaf values or ports travel along the same logical connection.

For JAX specifically, jax.experimental.sparse is now explicitly described as an experimental reference implementation, no longer actively developed and not recommended for performance-critical work. Its BCOO representation is nevertheless conceptually useful: fixed nse, explicit coordinate arrays, JIT compatibility and summation of duplicate entries.

Thus I would prototype the GPU representation using ordinary JAX arrays plus gather/scatter or segment operations, and only later replace the dominant kernel with a custom implementation. On the RTX 2080 Super you mentioned previously, the current recommended Pallas Mosaic GPU backend is unavailable—it requires Hopper or newer—and the legacy Triton backend is documented only down to Ampere and is being deprecated. For that Turing GPU, an XLA composition, CUDA custom call/FFI, or a CuPy/PyTorch implementation is currently more realistic than modern Pallas.

So the present answer for your use case is: COO-style message passing is still the right starting point, but GPU success will depend on batching enough independent leaf/edge work, not merely on storing the matrix sparsely.

A quarterly watch for new sparse-GPU compilers, JAX support and UST developments would be useful here; want me to set that up?

---

title: Now let's consider V-values, which are prefix trees with numeric leaves
source: unknown
url: 
tags: 
version: 1
original_id: 20260715_141918_886
original_timestamp: 2026-07-15T21:19:18.886Z

## Question

Thanks a lot! Now let's consider the following generalization of the typical ultrasparse case: so-called V-values, which are prefix trees with numeric leaves, which is the same thing as finite linear combinations of strings, which is the same thing as tensors of mixed rank (but they can also be flattened), see section 3 of https://arxiv.org/abs/1712.07447. What if I want a relatively GPU-friendly processing of those?

## Answer

Yes. The key is to flatten the numerical payload without discarding the tree semantics. V-values are actually unusually well suited to this because, algebraically,

V=R
(L
∗
)
,

the space of finitely supported functions from finite strings to numbers. Thus every string is simply a basis vector, and a V-value is an ordinary ultra-sparse vector indexed by strings. The prefix-tree, mixed-rank-tensor, and recurrent-map presentations are equivalent views of this same object.

1. Use global integer IDs for strings

Intern every currently active label as an integer token_id, and every currently active string as an integer word_id.

A particularly convenient representation reflects the recurrent-map decomposition directly:

head[word_id]    # first token
tail[word_id]    # word_id of the remaining suffix
depth[word_id]

with

word_id = 0      # empty string ε

For example:

word_id  head       tail
0        —          —             # ε
1        :bar       0             # (:bar)
2        :foo       1             # (:foo :bar)
3        :baz       2             # (:baz :foo :bar)

This is a hash-consed string DAG. It shares suffixes rather than storing variable-length token arrays with every coefficient.

It fits the recurrent-map interpretation especially well. A nonempty word has the exact decomposition

(l
1
	​

,l
2
	​

,…,l
n
	​

)=(l
1
	​

,(l
2
	​

,…,l
n
	​

)),

which becomes two integer gathers:

first = head[word_id]
rest  = tail[word_id]

The paper’s isomorphism

V≅R⊕(L→V)

is therefore not merely mathematically elegant: it gives a very natural SIMD representation.

2. Represent a batch of V-values as one sparse matrix

Suppose there are B active V-values and N interned strings. Define

X
b,s
	​

=coefficient of string s in V-value b.

Then the complete batch is simply a sparse matrix

X∈R
B×N
.

Its COO-like physical form can be:

owner[K]     int32   # V-value, port, or neuron-row ID
word[K]      int32   # interned string ID
value[K]     float32

Usually sort it by the composite key

(owner, word)

and optionally maintain:

owner_ptr[B + 1]

so each V-value is a CSR row.

For your example

{:number 3.5,
 :foo {:number 2,
       :bar 7},
 :baz {:foo {:bar -4}}}

the numerical representation is only:

word                        value
ε                            3.5
(:foo)                       2.0
(:foo :bar)                  7.0
(:baz :foo :bar)            -4.0

There is no need to store the intermediate prefix-tree nodes separately in each V-value.

Why this is preferable to a packed tree per V-value

A per-value tree representation introduces:

pointers or variable offsets;
many small allocations;
divergent traversal;
duplicated structural information;
difficult batching.

The global word dictionary turns all of those into integer-array operations. The dynamically changing part consists mostly of owner, word, and value records.

3. Core V-value operations become standard GPU primitives
Linear combination

For

z=
i
∑
	​

α
i
	​

x
i
	​

,

concatenate the relevant entries, multiply their values by α
i
	​

, and reduce equal (owner, word) keys:

concatenate
→ sort by (owner, word)
→ segmented sum
→ optional threshold/compaction

For two already-sorted inputs, a batched merge is preferable to a fresh global sort.

It can also be profitable to permit duplicates temporarily:

(owner=7, word=42, value=1.3)
(owner=7, word=42, value=-0.2)

and only periodically coalesce them. JAX’s BCOO similarly permits duplicate indices and defines them as summing together; JAX also exposes segment reductions directly.

Scalar multiplication

Only the values change:

value *= alpha[owner]
Norms

For example,

∥x
b
	​

∥
∞
	​

=
k:owner[k]=b
max
	​

∣value[k]∣

is a segmented maximum.

Trimming
keep[k] = abs(value[k]) >= threshold[owner[k]]

followed by prefix-sum compaction.

Pointwise multiplication or support intersection

Merge-join two streams sorted by (owner, word), retaining matching word IDs.

Extracting a top-level subtree

The operation analogous to

(get x :foo {})

becomes:

keep = head[word] == foo_token
new_word = tail[word]

followed by compaction.

Thus

(:foo)          2
(:foo :bar)     7

becomes

ε               2
(:bar)          7

without recursive tree traversal.

Wrapping a V-value under a key

To construct

{:foo x}

map every word s to the interned word (:foo,s):

new_word = cons_lookup[foo_token, word]

The cons_lookup table may be an immutable hash table or a sorted table of (token, tail) → word_id.

This pair of operations—head/tail and cons—is sufficient for a large fraction of recurrent-map processing.

4. The DMM down movement becomes ordinary sparse matrix multiplication

This is perhaps the strongest reason to use the string-basis representation.

Let:

W∈R
P
in
	​

×P
out
	​

 be the DMM connectivity matrix;
X∈R
P
out
	​

×N
 contain the output V-values;
Y∈R
P
in
	​

×N
 contain the input V-values.

Then the down movement is exactly

Y=WX.

Indeed, for every string s,

Y
i,s
	​

=
j
∑
	​

W
ij
	​

X
j,s
	​

.

The connectivity matrix acts on ports or neurons and leaves the string coordinate unchanged. Algebraically, the transformation is W⊗I
V
	​

.

This gives three regimes:

Sparse W, moderately dense X: SpMM.
Sparse W, sparse X: SpGEMM or a specialized sparse propagation kernel.
Very sparse X, low-degree W: expand each (source-port, word, value) across outgoing edges and reduce by (destination-port, word).

The third implementation looks like:

for each X entry (src, word, x):
    for each W edge (dst, src, w):
        emit (dst, word, w*x)

reduce equal (dst, word)

That is standard GPU message passing. Crucially, the variable string lengths never appear in this kernel.

5. Keep two orderings when the structure is reused

The DMM’s two strokes want different layouts:

the down movement often benefits from grouping by word;
neuron activation functions benefit from grouping by owner or neuron.

For a relatively stable support, maintain two indexings over the same entries:

owner-major permutation: sorted by (owner, word)
word-major permutation:  sorted by (word, owner)

This is analogous to retaining CSR and CSC views of a sparse matrix.

The numerical values can remain in one canonical buffer, with permutation arrays providing the two traversals. When only values change, neither ordering needs rebuilding. When support changes, rebuild them in bulk.

6. Prefix-aware operations

The head/tail DAG is ideal for repeatedly peeling off the first label. A conventional prefix trie is better for questions such as:

“find all coefficients below this arbitrary prefix”;
“reduce over an entire subtree”;
“test whether one path is a prefix of another.”

When those operations are frequent, retain additional structural metadata:

prefix_parent[word]
last_token[word]
dfs_in[word]
dfs_out[word]

With a static trie and DFS numbering, descendants of a prefix occupy an interval:

descendants(p)=[dfs_in(p),dfs_out(p)).

So subtree selection becomes a range query. It is reasonable to maintain both:

a suffix-oriented head/tail representation for recurrent-map operations;
prefix-trie metadata for arbitrary prefix operations.

The word IDs remain the common bridge.

7. Mixed-rank tensor operations

The mixed-rank interpretation should generally be a derived view, not the primary representation.

Store:

depth[word_id]

and group entries by depth when an operation genuinely treats rank d tensors differently.

For a hot fixed-rank operation, materialize a temporary COO representation:

owner_d[nnz_d]
coords_d[nnz_d, d]
values_d[nnz_d]

For instance, the rank-two part becomes an ordinary sparse matrix coordinate list.

This suggests a tiered strategy:

Keep everything primarily as sparse coefficients over word_id.
Cache decoded coordinates for frequently used words.
Materialize fixed-rank sparse tensor views only for contractions that benefit from them.
Convert the result back to word IDs.

Generic sparse-tensor systems commonly organize storage around positions, coordinates, and values at a fixed sequence of tensor levels. That machinery is useful for the materialized rank-specific views, but a single unbounded mixed-rank V-value does not naturally fit one ordinary fixed-rank sparse-tensor type.

8. More complicated recursive masks

Operations in which a scalar mask at an ancestor affects an entire descendant subtree are less trivial, but they can still be flattened.

Suppose a mask coefficient m
p
	​

 at prefix p acts on every x
s
	​

 with p⪯s. Possible implementations are:

Levelwise propagation

Maintain a value at every active trie node and propagate inherited mask information from depth d to depth d+1. Nodes at the same depth are processed in parallel.

Euler-interval range updates

If every subtree is a DFS interval, an ancestor mask produces a range update. Difference arrays followed by a prefix scan can combine many such updates.

Prefix join

Treat mask prefixes and value paths as two relations and perform a containment join using trie intervals:

p⪯s⟺in(p)≤in(s)<out(p).

Which method wins depends on whether masks or values are sparser.

The important point is that recursive semantics need not imply recursive GPU code.

9. Dynamic creation of strings

Individual device-side insertions into tries or dictionaries are undesirable. I would use bulk interning:

kernels produce requested pairs (token, tail_word);
sort and unique those pairs;
look up existing word IDs;
append IDs for previously unseen pairs;
update head, tail, and depth;
resume numerical processing.

When new strings are rare, this control-plane step can happen on the CPU. When they are frequent and batched, GPU hash tables or sort-unique pipelines become viable; NVIDIA’s cuCollections, for example, provides fixed and growing GPU hash maps with bulk operations.

A practical system can preserve the conceptually unbounded address space while running in finite epochs:

allocate capacities N
max
	​

 and K
max
	​

;
run many numerical steps with static array shapes;
occasionally enlarge or rebuild the word dictionary and sparse indices.
10. A concrete JAX representation

For your implementation, I would start with ordinary JAX arrays rather than nested PyTrees:

# Immutable or slowly changing global dictionary
word_head:  int32[N_WORD_CAP]
word_tail:  int32[N_WORD_CAP]
word_depth: int16[N_WORD_CAP]

# Dynamic sparse V-value pool
entry_owner: int32[ENTRY_CAP]
entry_word:  int32[ENTRY_CAP]
entry_value: float32[ENTRY_CAP]
entry_active: bool[ENTRY_CAP]

num_words:   int32
num_entries: int32

Use sentinel entries beyond num_entries so shapes remain JIT-static.

The main primitives would be:

scale_values
concatenate_entries
sort_and_coalesce
segment_sum / segment_max
compact
uncons_entries
cons_entries
propagate_through_W

After words have been interned, the numerical batch can also be viewed as a rank-two BCOO matrix with indices (owner, word). JAX’s sparse facilities already provide batched COO structure and duplicate reduction, although custom flat arrays will probably give you more control over capacities and structural mutation.

Recommended architecture

I would therefore use:

semantic level:
    nested maps / prefix trees / V-values

global structural level:
    token interner
    word_id dictionary
    head[word], tail[word], depth[word]
    optional prefix-trie intervals

numeric GPU level:
    sparse matrix X[owner, word]
    sparse connectivity matrix W
    segmented array primitives

The central idea is:

Do not execute nested dictionaries on the GPU.Execute sparse coefficient tables over interned strings.
	​


For the DMM linear phase, this collapses exactly to Y=WX. For recurrent-map primitives, the head/tail word DAG turns recursive decomposition into gathers, filters, grouping, and segmented reductions. That combination is likely the most GPU-friendly exact representation of V-values.

Sources

---

title: Some people are trying to map general purpose computations onto GPU
source: unknown
url: 
tags: 
version: 1
original_id: 20260715_142009_836
original_timestamp: 2026-07-15T21:20:09.836Z

## Question

That's awesome, thanks! Some people are trying to map general purpose computations onto GPU, the notable example is 
HigherOrderCo/Bendpowered by 
HigherOrderCO/HVM2(Bend2 is in progress and is expected to be a major upgrade). Could you take a look and see if this is relevant, or is this too general and insufficiently optimized?

## Answer

Verdict

Bend/HVM is relevant to V-values, but mostly as a structural-computation layer—not as a replacement for specialized sparse-array kernels.

A direct recursive-trie implementation could be attractive when the work consists of irregular tree rewriting, persistent updates, branch-local transformations, and dynamically generated structure. But for the dominant numerical operations in a DMM—linear combinations, propagation through a sparse connectivity matrix, duplicate coalescing, thresholding, and reductions over many V-values—the flattened (owner, word, value) representation should be substantially more GPU-efficient.

The most promising architecture is therefore:

Bend/HVM structural control+native bulk V-value primitives
	​


rather than representing every coefficient update as an interaction-net reduction.

Why it is genuinely relevant

V-values fit Bend’s surface language very naturally. Bend has recursive algebraic data types, folds, and tree-generating recursion, and explicitly recommends tree folds as a way to expose branch parallelism.

In fact, the new HigherOrderCO benchmark repository already contains a Bend benchmark for a pure functional persistent trie, with immutable insertion, lookup, and folding. Its trie is represented in almost exactly the obvious recursive way:

Trie = empty | node(optional_value, left, right)

and is updated persistently by rebuilding the path to an inserted key.

So a V-value could be represented directly as something like:

type V:
  zero{}
  leaf{F32}
  node{Map(Label, V)}

or, with a fixed small alphabet:

type V:
  emp{}
  nod{Maybe(F32), V, V, ...}

Operations such as:

recursive map;
subtree extraction;
persistent insertion;
pruning;
recursive masking;
shape-dependent control flow;

are precisely the sort of code Bend makes easy to express.

HVM’s interaction rules are local, lock-free graph rewrites; independent redexes can proceed concurrently. That is a conceptually good fit for many independent branches of a V-value trie. HVM2 was explicitly designed around compact interaction-net nodes, atomic wires, and a redex work pool.

Where the mismatch appears
1. HVM exposes tree parallelism, not sparse-linear-algebra structure

Consider the DMM down movement:

Y
i,s
	​

=
j
∑
	​

W
ij
	​

X
j,s
	​

.

In a flattened implementation this is one sparse propagation or SpMM-like operation over millions of homogeneous records:

(src_owner, dst_owner, word_id, coefficient)

The GPU can sort, gather, multiply and reduce these records in large uniform batches.

In a direct Bend representation, the same computation becomes many combinations of:

function calls;
pattern matches;
constructor allocation;
duplicator interactions;
recursive traversal;
arithmetic interactions;
rebuilding result trees.

The HVM interaction rate can be impressive, but an “interaction” is not equivalent to a floating-point operation or a processed nonzero. One logical operation on a coefficient may require many interactions and several temporary nodes.

This is the same reason a high-performance graph-reduction machine does not automatically become a high-performance SpMM implementation.

2. Warp divergence remains fundamental

The HVM2 paper reports that regular tree-map programs worked very well, but irregular communication in bitonic sorting caused warp-local threads to evaluate different functions and branches. That divergence turned GPU parallelism into partial sequential execution. A scheduler annotation improved this particular benchmark by about 9×, showing both that the problem was important and that program structure had to be exposed to the scheduler.

A heterogeneous population of V-values is likely to have the same issue:

different depths;
different branching factors;
missing branches;
different activation functions;
some leaves being trimmed while others expand;
highly unequal subtree sizes.

A uniform map over a large balanced V-value forest could work well. A multiway merge over unrelated sparse tries is a much less favorable workload.

3. Memory layout dominates

Recent HVM4 CUDA work reinforces this. An April 2026 experiment reported a 5.7× gain—from about 4 to 22.7 billion interactions/s—by making heap allocation warp-cooperative, interleaving stacks by depth, and improving memory coalescing.

That is encouraging: the team understands the GPU memory problem. But it also demonstrates that general interaction-net parallelism alone is insufficient. Performance depends heavily on arranging simultaneous reductions so their heap and stack accesses are coalesced.

For flattened V-values we can arrange the data directly:

owner[k]
word[k]
value[k]

For recursively allocated interaction nets, recovering an equally regular layout is harder.

4. Bend/HVM2’s old numerical model is unsuitable for serious ML numerics

HVM2’s published architecture uses 32-bit ports with only 29 payload bits; its native floating-point format is F24, with a 15-bit significand.

The HVM2 paper also explicitly acknowledges:

poor performance for mutable-array-style loops;
absence of native arrays;
lambda encoding overhead for algebraic constructors;
the need for native vector and array-like nodes.

These are exactly the facilities needed for efficient numerical V-values.

HVM4 is a substantial redesign and appears to be where active work has moved. Its public README currently labels it “before launch.” Recent 2026 commits show serious CUDA experimentation, including profiling, memory coalescing, occupancy tuning, and proposed superinstructions. The public-facing architecture is nevertheless still evolving.

The benchmark repository identifies the new Bend implementation as bend2-ts and supports both JavaScript and HVM compilation paths. That Bend2 repository was not publicly retrievable through the connected GitHub view, so I cannot yet evaluate its compiler internals or its planned GPU lowering.

Operation-by-operation assessment
V-value operation	Direct Bend/HVM suitability
Independent map over all leaves	Good candidate, particularly for large similarly shaped trees
Recursive fold or norm	Reasonable, though segmented reduction over flat arrays will usually be leaner
Extract or wrap top-level subtree	Good semantically, but integer head/tail gathers are probably faster
Persistent insertion/deletion	Interesting, especially when only a small path changes
Recursive nonlinear activation	Potentially good when branches perform substantial work
Merge two similarly shaped tries	Plausible
Merge many unrelated sparse tries	Likely poor because of divergence and allocation
Weighted linear combination of many V-values	Poor direct target
DMM down movement Y=WX	Use SpMM/message-passing kernels
Sort, coalesce duplicate strings	Use radix sort/segmented reduction
Threshold-and-compact millions of leaves	Flat stream compaction likely superior
Dense vectors or matrices stored at leaves	Use native CUDA/tensor kernels
Reverse-mode differentiation through many steps	No evident advantage; difficult ecosystem integration
The hybrid design I would pursue
HVM-level value

Instead of making each trie node an ordinary Bend constructor, introduce a native abstract value:

VHandle

whose physical representation is a GPU-resident flattened table:

owner: int32[K]
word:  int32[K]
value: float32[K]

The HVM graph manipulates handles, while operations on them invoke bulk primitives:

v_scale(alpha, x)
v_add(x, y)
v_lincomb(weights, xs)
v_trim(epsilon, x)
v_max_norm(x)
v_uncons(label, x)
v_cons(label, x)
v_mask(mask, x)
v_propagate(W, X)

Each primitive performs one large CUDA operation rather than millions of interaction-net rewrites.

This resembles adding arrays or vector nodes to HVM—an extension the HVM2 paper itself describes as natural.

Structural escape hatch

A V-handle could also expose a recursive view when genuinely structural computation is required:

inspect_root(x)
→ scalar_at_empty_string
→ collection of (label, child_handle)

Bend/HVM could then dynamically recurse over child handles, while leaves and large regular subtrees remain flat.

Conceptually:

interaction-net layer:
    recursion, control flow, dynamic structure, persistent sharing

V-value runtime:
    sorted COO/CSR data
    word interning
    segmented reductions
    sparse propagation

dense numeric runtime:
    cuBLAS/cuSPARSE/custom CUDA
Fusion would be decisive

For example, Bend code expressing

trim(eps, scale(a, add(x, y)))

should not allocate three intermediate V-values. It should lower to one fused kernel:

z
s
	​

={
a(x
s
	​

+y
s
	​

),
0,
	​

∣a(x
s
	​

+y
s
	​

)∣≥ϵ,
otherwise.
	​


Without this sort of bulk lowering, Bend’s expressive convenience would probably be overwhelmed by interaction and allocation overhead.

My overall judgment

Bend/HVM is not too general to be relevant. Its model is unusually relevant to the dynamic recursive structure of V-values, and it may offer elegant automatic parallelization for algorithms that are awkward to write as static CUDA kernels.

But direct tree encoding is likely insufficiently specialized for the primary numerical data path. The key distinction is:

structural work per node
one or two arithmetic operations per leaf
	​

≫runtime overhead
	​

⇒flattened sparse kernels should dominate.
	​

⇒Bend/HVM may excel,

I would regard Bend2/HVM4 as:

a promising structural scheduler and language frontend;
a good platform for experimenting with persistent recursive V-value algorithms;
a possible way to express self-modifying or dynamically branching machinery;

but not, without native V-value/array primitives and fusion, as the numerical backend for DMM down movement or large-scale V-value linear algebra.

Sources
