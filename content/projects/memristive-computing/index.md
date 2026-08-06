---
title: "Memristive Computing: Crossbar Simulation Framework"
date: 2026-01-01
description: "Research paper and simulation framework exploring memristor device physics, resistive switching, crossbar architectures, and scalable IR-drop-aware simulation in Julia with Xyce integration."
tags: ["Memristors", "Neuromorphics", "Julia", "SPICE", "Hardware", "Research", "Physics"]
type: project
status: "Complete"
github: "https://github.com/MadebyDaris/memris-research"
tech: ["Julia", "Xyce", "SPICE", "LTSpice", "ODE Solvers", "Sparse MNA"]
weight: 5
showTableOfContents: true
---

## Overview

This project accompanies the paper *"Memristive Computing: Device Physics, Crossbar Architectures, and Scalable Simulation"*. It provides a comprehensive study of memristors the "fourth circuit element" theorized by Leon Chua in 1971 and physically realized by HP Labs in 2008.

The work covers both the **physics** (resistive switching mechanisms, ECM/VCM models) and the **engineering** (crossbar Matrix-Vector Multiplication, sneak-path currents, IR drop analysis) needed to design memristive computing systems for neuromorphic inference.

## The Paper

The full document explores:

- **Theoretical Foundations**: The missing circuit element, bipolar vs. unipolar switching, and the HP Labs TiO₂ device
- **Resistive Switching Physics**: Electrochemical metallization (ECM) and valence change mechanisms (VCM) at the atomic scale
- **Crossbar Architectures**: Passive 0T1R vs. active 1T1R arrays for Matrix-Vector Multiplication (MVM) the fundamental operation in neural network inference
- **Non-Idealities**: IR drop formulations, read noise, and device-to-device variability that limit scaling
- **Simulation Framework**: Custom Julia packages bridging analytical models with industrial SPICE engines

[Full paper (PDF)](https://github.com/MadebyDaris/memris-research/blob/master/memristor-sota.pdf)


## Simulation Framework

## MemristorODE Pure Julia Engine

A lightweight ODE-based memristor simulator supporting Threshold and VTEAM (voltage-controlled) models. It models device state evolution explicitly without external circuit simulators.

Key capabilities:
- **Crossbar MVM**: Matrix-vector multiplication through resistive arrays
- **IR Drop Analysis**: Sparse Modified Nodal Analysis (MNA) to trace voltage degradation across large arrays the critical non-ideality that limits crossbar scaling
- **Differentiable Physics**: ForwardDiff.jl integration for extracting gradients, enabling hardware-aware neural network training directly on memristor physics

```julia
using MemristorODE

# Build a 32×32 crossbar array
xbar = CrossbarArray(32, 32, R_on=1e3, R_off=100e3)
V_in = rand(32)

# MVM with IR drop simulation
I_out = simulate_crossbar_mvm_with_ir(xbar, V_in)
```

## XyceSim Xyce Integration

A high-performance wrapper bridging the Julia analytical framework with Sandia National Labs' Xyce simulator (via the [Jyce](/projects/jyce/) package). Enables:

- Extreme-scale crossbar netlist generation with ADMS memristor plugins
- Rigorous SPICE-level validation of abstract threshold models against industry engines

```julia
using XyceSim

sim = XyceSim.create_simulator()
xbar = XyceSim.create_crossbar_array(32, 32)
results = XyceSim.run_and_plot_crossbar(sim, xbar)
```

## Architecture Comparisons

The project compares **passive 0T1R** and **active 1T1R** crossbar topologies using LTSpice formulations. Active selection transistors drastically reduce sneak-path currents at the cost of increased cell footprint — a fundamental density-vs-accuracy tradeoff in neuromorphic memory design.


## Key References

- L. Chua (1971). "Memristor—The missing circuit element." *IEEE Trans. Circuit Theory*
- D. Strukov et al. (2008). "The missing memristor found." *Nature*
- S. Kvatinsky et al. (2015). "VTEAM: A general model for voltage-controlled memristors."

## Resources

-  [GitHub Repository](https://github.com/MadebyDaris/memris-research)
-  [Full Paper (PDF)](https://github.com/MadebyDaris/memris-research/blob/master/memristor-sota.pdf)
-  [ResearchGate Profile](https://www.researchgate.net/profile/Daris-Idirene)
