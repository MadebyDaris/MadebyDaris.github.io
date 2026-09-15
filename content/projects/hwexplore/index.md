---
title: "HWExplore — Julia-to-Silicon HLS Compiler"
date: 2026-01-01
description: "An open-source Hardware/Software Co-Design framework and High-Level Synthesis compiler. Write algorithms in Julia, get RISC-V hardware accelerators. Formerly known as NexusV."
tags: ["RISC-V", "HLS", "Julia", "SystemVerilog", "Hardware", "Compilers", "LLVM", "HPC"]
type: project
status: "Active"
github: "https://github.com/MadebyDaris/HWExplore"
tech: ["Julia", "LLVM IR", "SystemVerilog", "RISC-V", "Verilator", "C++"]
weight: 1
showTableOfContents: true
---

## What Is HWExplore?

**HWExplore** (previously developed under the name NexusV) is an open-source, automated Hardware/Software Co-Design framework and High-Level Synthesis (HLS) compiler.

It lets you write compute-intensive algorithms in **Julia**, targeting Edge AI (TinyML) and lattice-based Post-Quantum Cryptography (PQC), and have them automatically synthesized into **RISC-V CV-X-IF compliant hardware accelerators**.

Unlike traditional EDA macro-generators, HWExplore is an *algorithmic synthesizer*. It intercepts Julia code at the LLVM IR level, performs hardware-specific optimizations (loop unrolling, pipelining), schedules the dataflow graph, and emits both the physical SystemVerilog RTL and the corresponding RISC-V C software bindings.

## Why Build This?

The standard flow for custom hardware accelerators is painfully manual: write a Verilog template, maintain YAML descriptors, hand-craft C driver code. Tools like Cadence Xtensa exist but are expensive and proprietary.

HWExplore takes a different approach:

- **Zero Core Modifications** — Uses the standardized OpenHW [CV-X-IF coprocessor interface](https://docs.openhwgroup.org/projects/openhw-group-core-v-xif/en/latest/). Generated hardware is loosely coupled — you never need to re-verify the host RISC-V CPU.
- **Pure Algorithmic Input** — No hand-written Verilog templates, no YAML. Your Julia algorithm *is* your hardware specification.
- **Modern Workloads** — Built to tackle Edge AI (neural network MAC arrays) and Post-Quantum Cryptography (modular polynomial arithmetic for Kyber/CRYSTALS).
- **ASIP Paradigm** — Operates like commercial ASIP generators (Cadence Xtensa), but fully open-source and RISC-V native.

## System Architecture

HWExplore bridges software intent and silicon execution through a 4-stage pipeline:

### Stage 1 — Frontend (Julia Metaprogramming)
The user annotates a Julia function with `@hw_accelerate`. HWExplore's macro intercepts the function before JIT compilation.

```julia
@hw_accelerate
function kyber_ntt(poly::Vector{Int32})
    # Pure Julia — this becomes hardware
    for i in 1:256
        poly[i] = butterfly_op(poly[i], ZETA_TABLE[i])
    end
    return poly
end
```

### Stage 2 — Middle-End (LLVM IR Extraction)
Using `GPUCompiler.jl`, HWExplore bypasses standard CPU compilation and extracts **bare-metal LLVM IR** — a pure mathematical representation of the computation with no OS calls, no GC references. Hardware-specific optimizations (loop unrolling, constant folding, vectorization) are applied at this stage.

### Stage 3 — Backend (HLS & DFG Scheduling)
The LLVM IR is parsed into a **Data-Flow Graph (DFG)**. HWExplore performs:
- **ALAP/ASAP scheduling** — assigns operations to hardware clock cycles
- **Resource binding** — maps logical operations to physical hardware units (adders, multipliers)
- **Pipeline insertion** — identifies and inserts register stages for timing closure

### Stage 4 — Emitter (HW/SW Generation)
The scheduled DFG is emitted as:
1. A synthesizable `datapath.sv` (pure SystemVerilog combinational/sequential logic)
2. Automatically routed inside a pre-written **CV-X-IF FSM shell** (`cvxif_hw_shell.sv`)
3. A `hw_bindings.h` C header with inline-assembly (`.insn`) to invoke the hardware from software

## Beyond Stateless Accelerators: Memory-Backed Datapaths

The first accelerators to come out of the compiler were purely combinational: two operands in, one result out, a few cycles later. That model breaks the moment an algorithm needs to *remember* something across instructions — an NTT butterfly walking over an array, or an HDC hypervector too wide to fit in two 32-bit registers.

To support that class of workload, the generated hardware can now be backed by an on-chip **dual-port scratchpad SRAM**: one port wired to the datapath, the other reachable from software over a hand-built **AXI-Lite master**, with **skid buffers** decoupling the multi-cycle AXI handshake from the single-cycle request/response interface upstream. A small three-instruction command protocol (write address, write data, start) lets a sequence of ordinary custom instructions behave like one longer "load array, then compute" operation. This piece is documented in more depth in the [memory architecture write-up](/posts/hwexploremilestonezero/).

## Repository Structure

```
HWExplore/
├── src/                  # The HLS compiler (Julia)
│   ├── HWExplore.jl      # Core: @hw_accelerate macro
│   ├── IR_Extractor.jl   # GPUCompiler.jl hooks → LLVM IR
│   ├── DFG_Builder.jl    # Parse IR into Data-Flow Graph
│   ├── Scheduler.jl      # ALAP/ASAP scheduling
│   └── Emitters/         # SystemVerilog + C header generation
├── hw/
│   ├── rtl_static/       # Hand-written CV-X-IF FSM shell, scratchpad, AXI-Lite master
│   └── rtl_generated/    # Output directory for Julia-generated datapaths
├── tests/                # Verilator C++ testbenches
├── examples/             # Kyber NTT, MAC array examples
└── docs/                 # Architecture specs & integration guides
```

## Target Workloads

| Workload | Algorithm | Hardware Output |
|---|---|---|
| **Post-Quantum Crypto** | Kyber NTT (polynomial multiplication) | Modular butterfly datapath |
| **Edge AI** | Neural network MAC (convolution) | Systolic MAC array |

## Current Status

HWExplore is actively under development. The Julia frontend (macro infrastructure) and IR extraction pipeline via `GPUCompiler.jl` are in place. The DFG builder and scheduler are in progress. The CV-X-IF hardware shell, scratchpad, and AXI-Lite master are designed, implemented, and pass unit tests.

**Next milestones:**
- Wire the scratchpad up to the CV-X-IF memory/memory-result channels directly, instead of relying only on the write-address/write-data command sequence
- Complete DFG → schedule → SystemVerilog emission for a Kyber NTT kernel
- End-to-end Verilator simulation on the X-HEEP RISC-V platform
- Benchmark vs. software baseline (cycles, area, throughput)

## Resources

- [GitHub Repository](https://github.com/MadebyDaris/HWExplore)
- [CV-X-IF Specification (OpenHW Group)](https://docs.openhwgroup.org/projects/openhw-group-core-v-xif/)
