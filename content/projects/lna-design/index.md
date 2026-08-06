---
title: "LNA 2.4GHz Inductive Degeneration Cascode"
date: 2024-05-01
description: "Design and simulation of a 2.4 GHz Low Noise Amplifier (LNA) using an Inductive Degeneration Cascode topology in LTspice."
tags: ["Electronics", "RF Design", "LTspice", "Hardware"]
type: project
status: "Complete"
github: "https://github.com/MadebyDaris/LNA-2-4GHz-induc-degen-casc-design"
tech: ["LTspice", "RF Design", "Analog Electronics"]
weight: 7
showTableOfContents: true
---

## Overview

This project involves the design, simulation, and performance analysis of a 2.4 GHz Low Noise Amplifier (LNA) using an **Inductive Degeneration Cascode** topology. The LNA is a critical component in RF receivers, designed to amplify weak signals from the antenna while adding the absolute minimum amount of noise possible.

The 2.4 GHz frequency targets the ISM (Industrial, Scientific, and Medical) band, widely used for Wi-Fi, Bluetooth, and other wireless communications.

[Full Design Paper (PDF)](https://github.com/MadebyDaris/LNA-2-4GHz-induc-degen-casc-design/blob/main/lnapaper.pdf)


## Topology Choice

I utilized an **Inductive Degeneration Cascode** topology because it provides an excellent balance of several competing RF design requirements:

1.  **Input Matching:** The source degeneration inductor allows us to achieve a 50-ohm input impedance (real part) without using noisy resistive components.
2.  **Low Noise Figure (NF):** By avoiding resistors in the signal path for matching, the noise figure is kept extremely low.
3.  **High Gain & Isolation:** The cascode configuration (a common-source amplifier feeding into a common-gate amplifier) significantly reduces the Miller effect. This extends the bandwidth and provides excellent reverse isolation (S12).

## Key Metrics & S-Parameters

The design was fully simulated in **LTspice**, analyzing the standard S-parameters used in microwave engineering:

-   **S11 (Input Return Loss):** Measures how well the input is matched to 50 ohms.
-   **S21 (Forward Gain):** The actual amplification provided by the circuit at 2.4 GHz.
-   **S12 (Reverse Isolation):** Measures how much signal leaks back from output to input. In this design, the cascode topology ensures a very low S12 (e.g., -30 dB or lower), preventing positive feedback and ensuring unconditional stability.
-   **S22 (Output Return Loss):** Measures the output matching.
-   **Noise Figure (NF):** The signal-to-noise ratio degradation caused by the amplifier itself.


## Resources

-  [GitHub Repository](https://github.com/MadebyDaris/LNA-2-4GHz-induc-degen-casc-design)
- [Design Documentation (PDF)](https://github.com/MadebyDaris/LNA-2-4GHz-induc-degen-casc-design/blob/main/lnapaper.pdf)
- [LTspice Schematic (.asc)](https://github.com/MadebyDaris/LNA-2-4GHz-induc-degen-casc-design/blob/main/LNA-induc-degen-cascode.asc)
