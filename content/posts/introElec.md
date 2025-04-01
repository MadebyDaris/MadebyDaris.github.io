---
title: "Electrical Engineering"
date: 2020-10-01T17:55:28+08:00
description: "A bunch of notes."
tags: ["Electronics"]
type: post
weight: 25
katex: true
showTableOfContents: true
---

#### sources
- https://github.com/ARM-software/CMSIS-NN
- https://www.st.com/en/microcontrollers-microprocessors/stm32-32-bit-arm-cortex-mcus.html
- https://www.st.com/en/microcontrollers-microprocessors/stm32l5-series.html
- STM Crolles
- AI on ARM https://arm-software.github.io/CMSIS_5/DSP/html/index.html 
- https://github.com/ARM-software/CMSIS-NN
- https://developer.arm.com/Architectures/Digital%20Signal%20Processing
- https://hanlab.mit.edu/projects/tinyml

#### Decoupling Capacitors
In electronics we come across sometimes, electrical signal noise. This can affect performance.
Capacitors takes charge, and supplies energy, when needed.
Using a Decoupling Capacitors, with a voltage regulator.

![[Excalidraw/Example-Decoupling.md]]

#### A ferrite bead 
Also called a ferrite block, ferrite core, ferrite ring, EMI filter, or ferrite choke – is a type of choke that suppresses high-frequency electronic noise in electronic circuits.
Ferrite beads employ high-frequency current dissipation in a ferrite ceramic to build high-frequency noise suppression devices.

#### Fuse
In electronics and electrical engineering, a fuse is an electrical safety device that operates to provide overcurrent protection of an electrical circuit

A resettable fuse or polymeric positive temperature coefficient device (PPTC) is a passive electronic component used to protect against overcurrent faults in electronic circuits. 
Daris Idirene
## Overall Goals
- [x] 755 timer
- [ ] ESP32 Board in Kicad
- [ ] RC circuit testing in Spice in KiCad

***
## Resources

- **NGSpice - https://ngspice.sourceforge.io/  .**
	SPICE is a general-purpose, open-source analog electronic circuit simulator. It is a program used in integrated circuit and board-level design
	**a hardware description language (HDL) used to model electronic systems.**
	https://www.kicad.org/discover/spice

- **Verilog - https://www.chipverify.com/tutorials/verilog .**

- **QEMU - https://github.com/qemus/qemu-docker .**
***
# **Using the KiCad  Schematic Symbol Designer.**
### Example design - **NE7555 timer**
I will be using the following datasheet for this example by Texas Instruments
[xx555 Precision Timers](https://www.ti.com/lit/ds/symlink/ne555.pdf?ts=1724379168692&ref_url=https%253A%252F%252Fwww.mouser.com%252F)

555 timers are **monolithic ICs that provide signals to a digital system to change its state**. They also can be used as a multivibrator or a form of oscillator, which has two stages and can be output by either of the states. In essence, it's two amplifier circuits arranged with regenerative feedback.

used for generating precise timing and waveform functions in electronic circuits. It can be used in various configurations to perform tasks like:
#### 1. **Monostable Mode (One-Shot Pulse)**
- **Purpose:** Generates a single pulse of a specific duration when triggered.
- **Applications:** Timer circuits, pulse generation, debouncing switches.

#### 2. **Astable Mode (Oscillator)**
- **Purpose:** Produces a continuous square wave signal, where the output toggles between high and low states at a regular interval.
- **Applications:** Clock pulses for digital circuits, LED flashers, tone generation.

#### 3. **Bistable Mode (Flip-Flop)**
- **Purpose:** Operates as a flip-flop, maintaining a stable high or low output until triggered to switch states.
- **Applications:** Simple memory storage, toggle switches, signal conditioning.

#### **Block Diagram**

![[Pasted image 20240823165313.png]]

GND and VCC pins power the comparators
	Input of compartor 1 getting 
	$\frac23Vcc$ and comparator 2 getting $\frac13Vcc$ 
	Supply vol tage 4.5-15 Volts

A **reference designator** unambiguously identifies the location of a [component](https://en.wikipedia.org/wiki/Electronic_component "Electronic component") within an [electrical schematic](https://en.wikipedia.org/wiki/Circuit_diagram "Circuit diagram") or on a [printed circuit board](https://en.wikipedia.org/wiki/Printed_circuit_board "Printed circuit board"). The reference designator usually consists of one or two letters followed by a number, e.g. C3, D1, R4, U15. The number is sometimes followed by a letter, indicating that components are grouped or matched with each other

#### NE555 Symbol

In our case the NE555 timer is an **IC**, so U.
From the Datasheet we will use the pin configuration given.

![[Pasted image 20240823165243.png]]

Then arranging the pins such that its fits the feature description fiven in the data-sheet

![[Pasted image 20240823171348.png]]

We'll be making a simple flashing LED using the NE555 timer

We will need some resistors and capacitors, more precisely a non-polarized and a polarized capacitor.
	**A polarized capacitor is actually a capacitor that can only be used in one voltage direction.** **For non-polarized capacitors, both voltage directions can be used**.
	
![[SchematicFound.png]]

As the controller pin is not used, it will be connected to a 10 nF decoupling capacitor.
	In [electronics](https://en.wikipedia.org/wiki/Electronics "Electronics"), a **decoupling capacitor** is a [capacitor](https://en.wikipedia.org/wiki/Capacitor "Capacitor") used to [decouple](https://en.wikipedia.org/wiki/Decoupling_(electronics) "Decoupling (electronics)") (i.e. prevent [electrical energy](https://en.wikipedia.org/wiki/Electrical_energy "Electrical energy") from transferring to) one part of a [circuit](https://en.wikipedia.org/wiki/Electrical_network "Electrical network") from another.

Result with KiCad - 

![[Schematic2.png]]

Before, designing a board, its good to look for a company to fabricate your PCB,
In this example, I will use OskPark's PCB design rules, even if it's just an example.

![[Pasted image 20240824000933.png]]