---
title: "Building Acceleration RoCC Hardware for Hyperdimensional Computing"
date: 2026-01-08
description: "This post introduces hyperdimensional computing, explains why its primitive operations make it an interesting target for custom hardware, and walks through the design of a small HDC accelerator built as a RoCC unit for the Chipyard/RocketChip ecosystem."
tags: ["Hyperdimensional Computing", "Neuroscience", "Computer Architecture"]
type: post
weight: 1
katex: true
showTableOfContents: true
---


Most of the AI hardware conversation right now is about doing matrix multiplication faster by increasing the size of systolic arrays and working on the memory wall problem using smart dataflows. That's a real and important problem. But it's not the only way to make a machine reason about data, and lately I've been much more interested in a family of models that sidesteps multiply-accumulate almost entirely: **Hyperdimensional Computing (HDC)**, also known as Vector Symbolic Architectures. I learned about targetting architectural efficiency for neural networks.

## The core idea

HDC represents information as very high-dimensional vectors, typically thousands of bits drawn pseudo-randomly from the space $\{0,1\}^D$ or $\{-1,1\}^D$. The key fact that makes this useful isn't the vectors themselves, it's a property of high-dimensional spaces: two random hypervectors are, with overwhelming probability, nearly orthogonal. Distance between random points concentrates tightly around a predictable value. That single geometric fact is enough to build a small algebra on top of:

- **Binding** (`⊗`, usually elementwise XOR for binary vectors) combines two hypervectors into a new one that is dissimilar to both inputs useful for associating a value with a role, e.g. `color ⊗ red`.
- **Bundling** (`⊕`, elementwise majority vote / thresholded sum) superimposes several hypervectors into one that *is* similar to each of its inputs.
- **Permutation** (`ρ`, typically a cyclic shift) reorders a vector's dimensions to encode sequence or position without losing similarity structure.
- **Similarity** (Hamming distance for binary vectors, cosine for bipolar/real ones) is how you ever get information back out.

That's essentially the whole instruction set. No backpropagation, no floating point, no large weight matrices. Learning is often a single pass: bundle the encoded examples of a class together, and the result *is* the class prototype. Classification is a nearest-neighbor search over a handful of these prototypes.

## Why that matters for hardware

The reason I find HDC interesting is that from an architecture standpoint, **the primitive operations are XOR, popcount, and majority vote.** No multipliers, no wide floating-point datapaths. The vectors are also strikingly tolerant of noise and bit errors if you flip a meaningful fraction of the bits in a hypervector and its similarity to the correct class barely moves as the dimensions are higher, and it can be trained in a single pass as well as transmit information such as symbolic reasoning and **analogies**, which is an unusual and genuinely useful property to have at the hardware level. The resilience to bit flipping (Having learned the impact bit flips can have in Quantum computing during my internships) is a compelling feature that means you can push voltage down, run closer to the noise floor, and tolerate the occasional bit flip in a way a quantized CNN never could.

Combine cheap bitwise primitives with graceful degradation and you get a model that's a plausible fit for exactly the class of devices that usually can't afford real ML.

## HyperDim RoCC

That's what led to my current project: a small hyperdimensional computing accelerator built as a **RoCC** (Rocket Custom Coprocessor) unit for the [Chipyard](https://github.com/ucb-bar/chipyard)/RocketChip RISC-V ecosystem. The idea is to expose HDC's core operations as custom instructions a RISC-V core can issue directly, with the accelerator streaming hypervector data straight out of the L1 cache instead of shuttling it through general-purpose registers.

The current architecture:

- A small **ISA extension** with a `funct` field selecting the HDC primitive.
- Two **`VectorStreamer`** units, one per input vector, each independently issuing cache loads and tagging every request so responses can be matched up even if the cache returns them out of order.
- A shared, arbitrated port back into the core's data cache, since both streamers are competing for one RoCC memory interface.
- A compute unit, currently `HammingOp`, that consumes one word from each stream per cycle, XORs, pops the bit count, and accumulates, asserting `valid` once the whole vector's been compared.

None of this is exotic as accelerator architecture goes, but building it bottom-up was the point: I wanted to actually feel where a "trivial" bitwise operation stops being trivial once you have to stream two independent vectors out of a shared memory port without stalling the whole pipeline on every load.

## Testing it on something real: ECG classification

Toy benchmarks only tell you so much, so I paired the accelerator with an HDC-based ECG arrhythmia classifier trained on the [MIT-BIH dataset](https://github.com/MadebyDaris/HDC_MIT_BIH_dataset), encoding heartbeat features into hypervectors, bundling per-class training examples into class prototypes, and classifying new beats via nearest-prototype Hamming distance, with the distance computation itself offloaded to the RoCC unit.

ECG is a good stress test for this whole thesis: it's inherently a low-power, always-on, edge-device problem (a wearable can't afford a GPU), the signal is noisy by nature, and the class distribution is heavily imbalanced.

## Where this goes next

A few directions I'm actively chewing on:

- **Finishing the op set.** Bind and bundle need their own streaming compute units (mirroring `HammingOp`'s structure), and bundle in particular is interesting because it needs a *write* path back to memory, not just reads — the accelerator has to produce a vector, not just a scalar.
- **Pushing memory-level parallelism further.** The tagged reorder-buffer streamers are the first step; the next is deeper outstanding-request queues and pipelining the compute stage itself against the memory stage rather than treating vector comparison as a single serial burst.
- **Quantifying the actual efficiency claim.** It's not enough to say bitwise ops are "cheaper" — I want cycle counts and, eventually, power figures against a baseline (even a small quantized CNN doing the same ECG classification) to see whether the theoretical argument survives contact with a real memory hierarchy.
- **On-chip training**, i.e. doing the bundling step for new class prototypes directly on the accelerator instead of only using it for inference.

In parallel, I've been sketching out **NexusV**, a separate, broader exploration of RISC-V accelerator design, less about HDC specifically and more about the general question of how much of an accelerator's control logic and memory interface can be made reusable across very different compute kernels. HyperDim RoCC has been a useful concrete case study for that bigger question: how much of `VectorStreamer` is actually HDC-specific, versus just "a generic streaming engine that happens to be feeding an HDC op right now"?

If you work on accelerator architecture, RISC-V, or HDC/VSA and any of this overlaps with what you're doing, I'd genuinely like to talk, as this is exactly the kind of computer-architecture-for-efficient-AI direction I want to go deeper on.
