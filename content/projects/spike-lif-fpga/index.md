---
title: "Spike LIF FPGA: Neuromorphic Hardware Simulation"
date: 2025-01-01
description: "A comprehensive environment for exploring neuromorphic computing through Leaky Integrate-and-Fire (LIF) neuron models on FPGAs using SystemVerilog, with CPU performance comparisons in Julia."
tags: ["FPGA", "SystemVerilog", "Neuromorphics", "Hardware", "Julia"]
type: project
status: "Complete"
github: "https://github.com/MadebyDaris/spike-lif-fpga"
tech: ["SystemVerilog", "Verilator", "Julia", "Neuromorphics"]
weight: 9
showTableOfContents: true
---

## Overview

The **Spike LIF FPGA** project is an exploration into neuromorphic computing hardware. It provides a complete environment for designing, simulating, and analyzing **Leaky Integrate-and-Fire (LIF)** neuron models synthesized for FPGAs using SystemVerilog.

To evaluate the efficiency of hardware acceleration, the project explicitly compares the performance of the FPGA-targeted SystemVerilog implementation against a CPU-based software simulation written in Julia.

---

## What is a LIF Neuron?

The Leaky Integrate-and-Fire model is a fundamental abstraction in spiking neural networks (SNNs). It models a biological neuron's membrane potential:
1.  **Integrate:** Incoming spikes (current) charge up the membrane potential (acting like a capacitor).
2.  **Leak:** Over time, the potential leaks back down to a resting state.
3.  **Fire:** If the potential crosses a specific threshold, the neuron emits an action potential (a spike) and resets its voltage.
4.  **Refractory Period:** After firing, the neuron enters a brief period where it ignores further inputs.

Implementing this natively in digital hardware (FPGA) allows for massive parallelism and high energy efficiency compared to classical von Neumann architectures processing floating-point calculations.

---

## Project Structure

The repository serves as a self-contained testbed:

-   `hdl/lifmodule.sv`: The core SystemVerilog implementation of the LIF neuron logic.
-   `sim/`: Build automation (Makefiles) and C++ testbenches utilizing **Verilator** for fast cycle-accurate simulation.
-   `notebooks/main.ipynb`: The baseline Julia implementation used for software profiling and theoretical analysis.
-   Shell scripts (`check_setup.sh`, `run_sim.sh`, `graphic.sh`) to automate the verification pipeline and view output waveforms in GTKWave.

---

## Simulation & Waveforms

Using Verilator, the hardware design is simulated and verified against expected biological behavior. The `graphic.sh` script launches GTKWave to visually inspect the internal states of the FPGA logic: the accumulating membrane potential, the discrete threshold triggers, the output spikes, and the refractory locking mechanism.

---

## Resources

- [GitHub Repository](https://github.com/MadebyDaris/spike-lif-fpga)
