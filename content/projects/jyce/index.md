---
title: "Jyce Julia Bindings for Xyce Circuit Simulator"
date: 2025-08-01
description: "Jyce provides Julia bindings for the Xyce circuit simulator from Sandia National Laboratories, enabling high-performance circuit simulation workflows from Julia."
tags: ["Julia", "Circuit Simulation", "SPICE", "EDA", "HPC", "Tooling"]
type: project
status: "Active"
github: "https://github.com/MadebyDaris"
tech: ["Julia", "C++", "Xyce", "SPICE", "LLVM", "Build Systems"]
weight: 3
showTableOfContents: true
---

## What Is Jyce?

**Jyce** is a Julia package that provides high-level bindings to **[Xyce](https://xyce.sandia.gov/)** the open-source circuit simulator from Sandia National Laboratories. Xyce is built for large-scale, high-performance circuit simulation and supports parallel (MPI) execution, making it a natural fit for HPC workflows.

The goal of Jyce is simple: make it easy to run Xyce simulations, post-process results, and integrate circuit simulation into Julia's scientific computing ecosystem without having to manage shell scripts or raw file I/O, and perhaps the ability to develop tools in julia using circuit simulation for future EDA tooling.

## Motivation

Xyce is a powerful tool, but working with it directly involves:

- Writing raw SPICE netlists
- Invoking Xyce as a subprocess and parsing output files
- No native integration with Julia's plotting, data, or optimization ecosystems

Jyce wraps this into a clean Julia API:

```julia
using Jyce

# Define a simple RC circuit
netlist = xyce_netlist("""
    R1 in out 1k
    C1 out 0 1n
    V1 in 0 SIN(0 1 1MEG)
    .tran 1n 10u
    .end
""")

result = simulate(netlist)
plot(result, :time, :out)
```

---

## Architecture

Jyce is structured around three layers:

### 1. XyceSolver — Native Library Interface
The lowest layer is a C++ shared library (`XyceSolver`) that exposes Xyce's simulation API. Jyce links to this via Julia's `ccall` interface, avoiding subprocess overhead and enabling tight integration.

### 2. Julia Bindings Layer
The core Julia package manages:
- Netlist construction (string or programmatic)
- Simulation control (start, step, pause, query)
- Result extraction into Julia arrays/DataFrames
- Error handling and solver state management

### 3. High-Level API
Convenience functions for common simulation types (`.tran`, `.ac`, `.dc` sweep), result plotting via Plots.jl, and parameter sweep utilities.

---

## Installation

Jyce requires building XyceSolver from source (Xyce has non-trivial dependencies). The install script handles the full chain:

```bash
# Clone and build
git clone https://github.com/MadebyDaris/Jyce
cd Jyce
bash install.sh
```

The `install.sh` script:
1. Builds Xyce's trilinos dependencies
2. Compiles XyceSolver as a shared library
3. Sets up the Julia package to find the local library

---

## Status & Roadmap

Jyce is functional for basic transient and AC simulations. Current focus areas:

- **Stability** — Improving the install script for reproducibility across systems
- **API completeness** — Full `.tran`, `.ac`, `.dc`, `.hb` simulation support
- **Documentation** — Comprehensive examples and tutorials
- **Performance benchmarks** — Comparing Julia-driven workflows vs. direct Xyce CLI

---

## Resources

-  [GitHub Repository](https://github.com/MadebyDaris)
-  [Xyce Reference Guide (Sandia NL)](https://xyce.sandia.gov/documentation/)
