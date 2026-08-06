---
title: "NexusV Julia-to-Silicon HLS Compiler"
date: 2026-01-01
description: "An open-source Hardware/Software Co-Design framework and High-Level Synthesis compiler. Write algorithms in Julia, get RISC-V hardware accelerators."
tags: ["RISC-V", "HLS", "Julia", "SystemVerilog", "Hardware", "Compilers", "LLVM", "HPC"]
type: project
status: "Active"
github: "https://github.com/MadebyDaris/NexusV"
tech: ["Julia", "LLVM IR", "SystemVerilog", "RISC-V", "Verilator", "C++"]
weight: 1
showTableOfContents: true
---

## What Is NexusV?

**NexusV** is an open-source, automated Hardware/Software Co-Design framework and High-Level Synthesis (HLS) compiler.

It enables developers to write compute-intensive mathematical algorithms in **Julia** targeting Edge AI (TinyML) and Lattice-Based Post-Quantum Cryptography (PQC) and automatically synthesizes them into **RISC-V CV-X-IF compliant hardware accelerators**.

Unlike traditional EDA macro-generators, Nexus-V is an *algorithmic synthesizer*. It intercepts Julia code at the LLVM IR level, performs hardware-specific optimizations (loop unrolling, pipelining), schedules the dataflow graph, and emits both the physical SystemVerilog RTL and the corresponding RISC-V C software bindings.

---

## Why Build This?

The standard flow for custom hardware accelerators is painfully manual: write a Verilog template, maintain YAML descriptors, hand-craft C driver code. Tools like Cadence Xtensa exist but are expensive and proprietary.

NexusV takes a different approach:

- **Zero Core Modifications** — Uses the standardized OpenHW [CV-X-IF coprocessor interface](https://docs.openhwgroup.org/projects/openhw-group-core-v-xif/en/latest/). Generated hardware is loosely coupled — you never need to re-verify the host RISC-V CPU.
- **Pure Algorithmic Input** — No hand-written Verilog templates, no YAML. Your Julia algorithm *is* your hardware specification.
- **Modern Workloads** — Built to tackle Edge AI (neural network MAC arrays) and Post-Quantum Cryptography (modular polynomial arithmetic for Kyber/CRYSTALS).
- **ASIP Paradigm** — Operates like commercial ASIP generators (Cadence Xtensa), but fully open-source and RISC-V native.

---

## System Architecture

NexusV bridges software intent and silicon execution through a 4-stage pipeline:

### Stage 1 — Frontend (Julia Metaprogramming)
The user annotates a Julia function with `@nexus_accelerate`. NexusV's macro intercepts the function before JIT compilation.

```julia
@nexus_accelerate
function kyber_ntt(poly::Vector{Int32})
    # Pure Julia — this becomes hardware
    for i in 1:256
        poly[i] = butterfly_op(poly[i], ZETA_TABLE[i])
    end
    return poly
end
```

### Stage 2 — Middle-End (LLVM IR Extraction)
Using `GPUCompiler.jl`, NexusV bypasses standard CPU compilation and extracts **bare-metal LLVM IR** — a pure mathematical representation of the computation with no OS calls, no GC references. Hardware-specific optimizations (loop unrolling, constant folding, vectorization) are applied at this stage.

### Stage 3 — Backend (HLS & DFG Scheduling)
The LLVM IR is parsed into a **Data-Flow Graph (DFG)**. NexusV performs:
- **ALAP/ASAP scheduling** — assigns operations to hardware clock cycles
- **Resource binding** — maps logical operations to physical hardware units (adders, multipliers)
- **Pipeline insertion** — identifies and inserts register stages for timing closure

### Stage 4 — Emitter (HW/SW Generation)
The scheduled DFG is emitted as:
1. A synthesizable `datapath.sv` (pure SystemVerilog combinational/sequential logic)
2. Automatically routed inside a pre-written **CV-X-IF FSM shell** (`cvxif_nexus_shell.sv`)
3. A `nexus_bindings.h` C header with inline-assembly (`.insn`) to invoke the hardware from software

---

## Repository Structure

```
NexusV/
├── src/                  # The HLS compiler (Julia)
│   ├── NexusV.jl         # Core: @nexus_accelerate macro
│   ├── IR_Extractor.jl   # GPUCompiler.jl hooks → LLVM IR
│   ├── DFG_Builder.jl    # Parse IR into Data-Flow Graph
│   ├── Scheduler.jl      # ALAP/ASAP scheduling
│   └── Emitters/         # SystemVerilog + C header generation
├── hw/
│   ├── rtl_static/       # Hand-written CV-X-IF FSM shell
│   └── rtl_generated/    # Output directory for Julia-generated datapaths
├── tests/                # Verilator C++ testbenches
├── examples/             # Kyber NTT, MAC array examples
└── docs/                 # Architecture specs & integration guides
```

---

## Target Workloads

| Workload | Algorithm | Hardware Output |
|---|---|---|
| **Post-Quantum Crypto** | Kyber NTT (polynomial multiplication) | Modular butterfly datapath |
| **Edge AI** | Neural network MAC (convolution) | Systolic MAC array |

---

## Current Status

NexusV is actively under development. The Julia frontend (macro infrastructure) and IR extraction pipeline via `GPUCompiler.jl` are in place. The DFG builder and scheduler are in progress. The CV-X-IF hardware shell is designed and documented.

**Next milestones:**
- Complete DFG → schedule → SystemVerilog emission for a Kyber NTT kernel
- End-to-end Verilator simulation on X-HEEP RISC-V platform
- Benchmark vs. software baseline (cycles, area, throughput)

---

## Resources

- [GitHub Repository](https://github.com/MadebyDaris/NexusV)
- [CV-X-IF Specification (OpenHW Group)](https://docs.openhwgroup.org/projects/openhw-group-core-v-xif/)
