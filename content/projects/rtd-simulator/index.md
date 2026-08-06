---
title: "Resonant Tunneling Diode Simulator (NEGF)"
date: 2025-06-01
description: "Quantum transport simulation of Resonant Tunneling Diodes using Non-Equilibrium Green's Functions (NEGF) in Julia. Computes transmission spectra, I-V characteristics, and local density of states."
tags: ["Quantum Mechanics", "Physics", "Julia", "Simulation", "NEGF", "Research"]
type: project
status: "Complete"
github: "https://github.com/MadebyDaris/ResonantTunnelingDiodeSimulator"
tech: ["Julia", "NEGF", "Quantum Transport", "Sparse Linear Algebra"]
weight: 6
showTableOfContents: true
---

## Overview

This project simulates **Resonant Tunneling Diodes (RTDs)** — nanoscale quantum devices that exploit the wave nature of electrons. Unlike classical electronic components where electrons move as particles over barriers, in RTDs electrons behave as waves that **tunnel** through potential barriers. When the electron energy aligns with a resonant state trapped between two barriers, transmission probability spikes electrons pass through efficiently. Shift the alignment, and current drops despite increasing voltage.

This phenomenon **Negative Differential Resistance (NDR)** — makes RTDs uniquely useful for ultra-high-frequency oscillators, multi-valued logic, and terahertz electronics.

[Full Paper (PDF)](https://github.com/MadebyDaris/ResonantTunnelingDiodeSimulator/blob/master/RTD_NEGF_Julia.pdf) · [ResearchGate Preprint](https://www.researchgate.net/publication/398537007)

## Physics

### The Quantum Double-Barrier Structure

Two thin barriers (typically AlGaAs) sandwich a quantum well (GaAs). The well traps quasi-bound states at discrete energies $E_n = n^2\pi^2\hbar^2 / 2m^*w^2$, where $w$ is the well width. When incoming electrons from the source contact have energy matching a quasi-bound state, transmission peaks sharply.

### Negative Differential Resistance

The hallmark of RTDs:
1. **Low bias**: resonant level aligns with the Fermi sea → high current
2. **Peak bias**: maximum alignment → peak current
3. **Valley**: level shifts out of alignment → current *drops* despite higher voltage

This I-V characteristic is purely quantum mechanical — no classical model predicts it.

---

## The NEGF Formalism

The simulator implements the **Non-Equilibrium Green's Function** method — the rigorous quantum mechanical framework for calculating electron transport in open systems connected to reservoirs (contacts).

Key components:
- **Retarded Green's Function**: $G^R(E) = [(E+i\eta)I - H - \Sigma_L - \Sigma_R]^{-1}$
- **Self-Energies** $\Sigma_{L,R}$: encode the effect of semi-infinite contacts on the finite device region
- **Transmission**: $T(E) = \text{Tr}[\Gamma_L G^R \Gamma_R G^A]$ (Landauer-Büttiker formula)
- **Current**: $I = \frac{2e}{h}\int T(E)[f_L(E) - f_R(E)]dE$

The implementation uses sparse linear algebra for efficiency, discretizing the Hamiltonian on a finite-difference grid with tight-binding coupling.

---

## Computed Quantities

| Output | Description |
|---|---|
| **Transmission spectrum** $T(E)$ | Energy-resolved tunneling probability |
| **I-V characteristics** | Current vs. bias showing NDR peak |
| **Local Density of States** | Spatial map of electron density at each energy |
| **Resonance widths** | Linewidths of quasi-bound states |

---

## Theoretical Foundation

This work builds on a prior study: *"Numerically Solving the Time-Dependent Schrödinger Equation: Analysis of Unitarity, Stability, and Real-Time GPU Implementation"* ([ResearchGate](https://www.researchgate.net/publication/398537007)), which explored wavepacket dynamics and split-operator methods. The RTD simulator extends that foundation from time-dependent dynamics to **steady-state quantum transport** with open boundary conditions.

---

## Resources

- [GitHub Repository](https://github.com/MadebyDaris/ResonantTunnelingDiodeSimulator)
- [Paper (PDF)](https://github.com/MadebyDaris/ResonantTunnelingDiodeSimulator/blob/master/RTD_NEGF_Julia.pdf)
- [Interactive Notebook](https://github.com/MadebyDaris/ResonantTunnelingDiodeSimulator/blob/master/rtd_simulation.ipynb)
