---
title: "Alice & Bob Quantum Hardware Internship"
date: 2025-09-01
description: "Internship at Alice & Bob, a Paris-based quantum computing startup working on cat-qubit hardware. Nanofabrication in a cleanroom environment and development of wafer inspection and measurement tooling."
tags: ["Quantum Computing", "Nanofabrication", "Cleanroom", "Instrumentation", "Python", "Physics"]
type: project
status: "Internship"
tech: ["Python", "Nanofabrication", "SEM", "Lithography", "Qubit Design", "Measurement Automation"]
weight: 2
showTableOfContents: true
---

## Overview

During the summer of 2025, I interned at **[Alice & Bob](https://alice-bob.com/)**, a Paris-based quantum computing startup building fault-tolerant quantum computers using **cat qubits**. Cat qubits are a novel qubit modality that exponentially suppresses bit-flip errors by using logical information in superpositions of coherent states, at the cost of more phase-flip errors. This tradeoff brings us closer to fault-tolerant quantum computing.

My time there split between two areas: **cleanroom nanofabrication** and **inspection/measurement tooling development**.

## The Physics: Cat Qubits

Alice & Bob's approach to quantum error correction is based on the insight that not all errors are equal. A **cat qubit** is a superconducting circuit (typically a Kerr-cat or dissipative cat) engineered so that:

- **Bit-flip errors** are exponentially suppressed as a function of the mean photon number
- **Phase-flip errors** occur at a polynomial rate (much more manageable for surface code correction)

This asymmetric error model means you need far fewer physical qubits per logical qubit compared to standard transmon-based approaches. The hardware consequence: the fabrication quality of each qubit matters enormously — any defect in the Josephson junction or the dielectric layers directly degrades coherence times.

## Cleanroom Work

Working in the cleanroom was one of the more demanding and rewarding parts of the internship. The fabrication of superconducting qubits involves nanometer-scale precision across several process steps:

### Process Steps

**Substrate preparation**
- Handling silicon-on-insulator (SOI) and sapphire wafers
- RCA cleaning sequences to remove organic and metallic contaminants before deposition

**Metal deposition & lift-off**
- Aluminum (Al) evaporation for Josephson junction formation (Dolan bridge or Manhattan-style)
- Niobium (Nb) sputtering for the base wiring layer
- Lift-off processes and yield optimization

**Etching**
- Reactive Ion Etching (RIE) for pattern transfer
- Understanding selectivity and etch rate calibration

**Packaging & Wire Bonding**
- Die cleaving, chip mounting on PCB sample holders
- Aluminum wire bonding for electrical connectivity to the measurement setup


## Tooling Development

A significant part of the internship involved building software tools to improve the **wafer inspection and characterization workflow**. Post-fabrication, every wafer goes through an inspection pipeline to catch defects before chips are diced and measured at cryogenic temperatures.

### Wafer Inspection Tooling

I developed tooling to automate and systematize the inspection process:

- **Automated image acquisition** scripted control of optical microscopes and SEM for systematic die-level scanning
- **Defect classification** Image processing pipelines using OpenCV to detect and categorize common fabrication defects: resist residues, junction shorts, lithography misalignment
- **Yield mapping** generating wafer maps that visually indicate pass/fail status per die and flag systematic vs. random defects
- **Report generation** structured output summarizing inspection results for process engineers

The goal was to reduce the manual bottleneck in the inspection loop and give the process team faster feedback on whether a given run was worth sending to cryo measurement.

### Measurement Automation

On the electrical characterization side, I contributed to scripts for automating room-temperature resistance measurements of Josephson junctions a fast proxy check for junction quality before committing to a full cryogenic cooldown.

## Key Learnings

**On quantum hardware:**
The gap between "working qubit" and "high-coherence qubit" is almost entirely a materials and fabrication story.

**On cleanroom discipline:**
Contamination is the enemy of yield. The rigor of cleanroom protocol is not bureaucracy but a necessity.

**On engineering at the frontier:**
Startups in deep tech move fast. Tooling that doesn't exist gets built, and the feedback loop between fabrication and measurement is tight. Every script I wrote had a real user (a process or measurement engineer) the next day.

## Related Work

- [Alice & Bob research publications](https://alice-bob.com/publications/)
- [Cat qubit primer (Alice & Bob)](https://alice-bob.com/blog/)
