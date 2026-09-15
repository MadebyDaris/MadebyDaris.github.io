# 

*Draft blog post. Math uses standard LaTeX delimiters (`$...$` inline, `$$...$$` display) — most Markdown blog engines with MathJax/KaTeX render this as-is; otherwise convert once with pandoc.*

*All figures referenced below are in `figures/`, numbered in the order they appear in this post. They were generated from real simulation runs and real measured chips, not mocked up — the numbers on them are the numbers the solver actually produced.*

---

## Why bother simulating a piece of bent metal

An airbridge is a small arch of metal, a few tens of micrometers long, that hops over a transmission line to tie the two ground planes on either side of it back together. On a superconducting quantum chip, thousands of these sit over coplanar waveguides (CPWs) carrying GHz signals to and from qubits. Optical and 3D inspection can tell you an airbridge sagged, or collapsed onto the line it's supposed to clear. What inspection *cannot* tell you is what that sag costs the circuit electrically — whether a 1.8 µm bridge is a cosmetic blemish or a source of crosstalk that will show up as a dip in a resonator's response two components away.

Answering that requires an electromagnetic simulation of the actual measured shape, not an idealized CAD bridge. This post walks through how that simulation is built and run, first with a fast frequency-domain finite-element solver (**Palace**), then with the slower time-domain approach that was tried first and abandoned (**meep**), and what the two together say about what a collapsing bridge does to a line.

---

## 1. The physical picture

The unit being simulated is one coplanar waveguide cross-section with one airbridge suspended over it. **Figure 1** shows the two views that matter: from above, a central signal trace of width $W$ running between two ground planes, separated from them by gaps of width $S$; and in cross-section, the airbridge arching over the trace with some clearance $h$ between its underside and the trace's top surface.

![Figure 1: the physical geometry, top view and cross-section](figures/01_cpw_geometry.png)

Two numbers do almost all the work in what follows: $h$ (the clearance, which is what "collapse" means running out of) and the aspect ratio of $W$ and $S$ (which sets the line's characteristic impedance, below).

---

## 2. Why the airbridge is there at all: two modes on a CPW

A coplanar waveguide with two separate ground planes actually supports **two** independent guided modes, and this is the entire reason airbridges exist on real chips.

**Figure 2** shows both. In the **even (CPW) mode**, the transverse field goes from the central conductor to each ground plane, in opposite senses in the two gaps — and crucially, both ground planes sit at the *same* potential, $V_{g1} = V_{g2}$. This is the useful mode: it's what a CPW is designed to carry.

![Figure 2: the two CPW modes, and what the airbridge does to them](figures/02_cpw_modes.png)

In the **odd (slotline) mode**, the field points the same way in both gaps, and the two ground planes are driven to *different* potentials, $V_{g1} \neq V_{g2}$. Any asymmetry along the line — a bend, a T-junction, a fabrication defect, a nearby bond wire — couples some energy from the even mode into this odd one. Once a signal is partly in the slotline mode, it starts leaking, radiating, and coupling to whatever else happens to be at the "wrong" potential nearby: a recipe for crosstalk and stray coupling between qubits.

The airbridge's job is to make the odd mode impossible to sustain. By galvanically tying $V_{g1}$ to $V_{g2}$ at regular intervals, it *forces* $V_{g1} = V_{g2}$ locally, which is exactly the odd mode's forbidden condition. A bridge that has sagged enough to lose contact, electrically, is a bridge that has stopped doing this job — which is a separate (and arguably more important) failure mode than the added parasitic capacitance discussed below, though harder to quantify with a two-port simulation of a single cross-section.

---

## 3. Describing the airbridge's effect: S-parameters and the two-port measurement

To turn "does this bridge disturb the line" into a number, the bridge is treated as a black box inserted into an otherwise uniform line, probed from one end. Three waves matter:

- the **incident** wave, sent in;
- the **reflected** wave, which comes back out the same end;
- the **transmitted** wave, which comes out the far end.

The **S-parameters** are simply amplitude ratios between these:

$$S_{11} = \frac{\text{reflected amplitude}}{\text{incident amplitude}}, \qquad S_{21} = \frac{\text{transmitted amplitude}}{\text{incident amplitude}}$$

$S_{11}$ is reflection, $S_{21}$ is transmission. A healthy airbridge should be nearly invisible to the line: $S_{21} \approx 1$, $S_{11} \approx 0$.

**Because power goes as amplitude squared**, conservation of energy in a lossless two-port becomes

$$|S_{11}|^2 + |S_{21}|^2 \le 1$$

with equality when nothing is lost along the way. This inequality is really a statement about Poynting flux conservation between the two ports of a domain with no internal loss: any power that is neither reflected nor transmitted has to have gone *somewhere* — radiated or absorbed — which a closed guide simply doesn't allow. In practice this is the single most useful sanity check on a simulation: a result that violates it is wrong by construction, and a result well below 1 is quietly leaking power somewhere in the mesh or the boundary conditions.

**Why both ends have to be loaded.** For $S_{11}$ and $S_{21}$ to describe the *bridge itself* and nothing else, the transmitted wave has to permanently leave the simulated domain. If the far end were left open, it would reflect that wave straight back to superpose with the incident one, and the measurement would silently become "bridge + whatever is at the far end" — impossible to disentangle after the fact. So each end is terminated in a **matched load**, a resistor equal to the line's own characteristic impedance $Z_0$, which absorbs without reflecting.

![Figure 3: the two-port measurement setup](figures/03_sparam_ports.png)

**Getting $Z_0$ right matters more than it looks.** A load only absorbs completely if it equals $Z_0$ exactly; otherwise it reflects a fraction

$$\Gamma = \frac{Z_L - Z_0}{Z_L + Z_0}$$

of the incident wave. On a real chip, $Z_0$ is not a clean 50 Ω — it depends on the actual fabricated trace and gap widths, which vary. **Figure 4** shows the measured spread across 607 waveguide cross-sections on one chip: median 53.4 Ω, but with deciles spanning 42–74 Ω. A fixed 50 Ω load against the top decile ($Z_0 = 74\,\Omega$) gives $|\Gamma| \approx 0.19$, i.e. **−14 dB of reflection before an airbridge even exists** — comparable in size to the effect the whole simulation is trying to measure. This is why ports get matched to the *line's own* impedance rather than a textbook 50 Ω default.

![Figure 4: measured CPW impedance distribution across one chip](figures/04_cpw_impedance_distribution.png)

---

## 4. The geometry comes from the measurement, not a CAD model

The simulated airbridge is not an idealized arch — it's built directly from a 3D point-cloud scan (confocal profilometry) of a real, fabricated bridge. The analysis fits a polynomial to the measured underside profile, records the span and the free-standing clearance, and hands that profile straight to the mesher.

![Figure 5: geometry built for a healthy measured bridge](figures/05_measured_geometry_construction.png)

Two details here are not cosmetic. The **ramps** connecting the flat anchor pads to the arch are necessary: the measurement window ends where the profile crosses half its own clearance, which is *not* where it meets the pad, so without a ramp the arch would be a floating conductor with no current path to ground — a different circuit, not a simplified one. And a **collapsed** bridge must not be modeled as an arch with negative clearance (metal poking down *inside* the ground plane) — that would perturb the line *less* than a real collapsed bridge does. Instead the profile is clamped flat against the surface.

**Figure 6** shows this applied across several real bridges from one chip, all on the same vertical scale: the healthy cases show a full arch; the collapsed case no longer clears its own anchor pads at all.

![Figure 6: measured profiles across several bridges, shared scale](figures/06_measured_profiles_overview.png)

---

## 5. Palace: a fast frequency-domain FEM solver

The tool actually used for the physics results below is **Palace**, an open-source finite-element electromagnetics solver. Two things make it a good fit here, compared to the time-domain alternative discussed later: its **unstructured tetrahedral mesh** can refine aggressively right under the airbridge while staying coarse in the bulk substrate, and it natively supports **impedance (Robin) boundary conditions** on ports — exactly the matched-load condition described above — so S-parameters come out directly rather than being reconstructed after the fact.

### 5.1 Electrostatics: extracting the parasitic capacitance

A healthy airbridge is nearly transparent to the line; its entire measurable effect reduces to a small **parasitic capacitance** between the central conductor and ground, since the suspended metal ribbon over an air gap is exactly a capacitor geometry.

This is computed **electrostatically** — no time dependence, the field derives from a potential, $\vect{E} = -\nabla\varphi$, and Gauss's law in an inhomogeneous dielectric becomes

$$\nabla \cdot \big(\varepsilon(\vect{r})\, \nabla \varphi(\vect{r})\big) = 0$$

with the potential fixed on every conductor. The central trace is set to 1 V, everything else to 0 V, the equation is solved, and the induced charge is integrated back off the trace's surface:

$$Q = \oiint_S \varepsilon\, \vect{E} \cdot \hat{\vect{n}}\, \mathrm{d}A \qquad \Longrightarrow \qquad C = \frac{Q}{V} = Q \quad (\text{since } V = 1\,\text{V})$$

This is much cheaper than a full driven solve, which is why it's the workhorse for anything parametric (sweeping clearance, comparing many bridges, and so on).

**A 1×1 capacitance matrix is normal, not a bug.** You might expect a capacitance *matrix* between the airbridge and the line — but a real airbridge has both feet resting on the ground planes: it is galvanically **part of the ground**, just an oddly shaped part of it. From the line's point of view there is exactly one conductor at an independent potential (the trace), so the matrix really is $1\times1$: one number, the parasitic capacitance $C$.

![Figure 7: the capacitance matrix for one measured airbridge — a single number](figures/07_capacitance_matrix.png)

The quantity that actually matters is not this raw capacitance but its **change** relative to the bare line:

$$\Delta C = C_{\text{with airbridge}} - C_{\text{without airbridge}}$$

obtained by solving the identical cell twice. For one healthy bridge from the dataset, this gives $21.36 - 20.64 = 0.72\,\text{fF}$.

**A sanity check worth knowing:** the crude parallel-plate estimate, $C \approx \varepsilon_0 A / d$ with $A$ the trace–bridge overlap area and $d$ the clearance, gets the right *order of magnitude* but systematically **underestimates**, because it ignores fringing fields — which, at these length scales, are the same order as the main term, not a small correction. **Figure 10** makes this quantitative: it overlays the naive parallel-plate prediction against the real Palace sweep across four measured clearances. The two agree reasonably well for a healthy, well-cleared bridge, but diverge as the bridge sags — at 0.9 µm clearance the simulated added capacitance (+2.23 fF) is nearly 65% higher than the parallel-plate number (+1.35 fF). Trust the FEM number; use the parallel-plate one only as a "does this look insane" gut check.

![Figure 10: the naive parallel-plate model against the real FEM sweep](figures/10_parallel_plate_vs_simulated.png)

### 5.2 Driven mode: getting S-parameters directly

The driven solve answers the S-parameter question directly, by solving the **frequency-domain vector wave equation** obtained by eliminating $\vect{H}$ from the harmonic Maxwell equations:

$$\nabla \times \left(\frac{1}{\mu_r}\nabla \times \vect{E}\right) - k_0^2\,\varepsilon_r\,\vect{E} = 0, \qquad k_0 = \frac{\omega}{c}$$

with a Robin (impedance) condition on each port face that plays exactly the role of the matched loads in Figure 3: it absorbs the outgoing wave without reflecting it. Discretized with edge (Nédélec) finite elements on the same tetrahedral mesh, this equation gives direct access to $S_{11}$ and $S_{21}$ — unlike the scalar electrostatic potential above, which is only valid in the quasi-static limit.

**Figure 8** shows a raw driven-solve output: magnitude and phase of all four $S$-parameters (the four curves overlap exactly, as they must for a reciprocal, symmetric device), and the passivity check across the swept band, flat at 1.0000. This is the automatic self-check that comes with every driven run — reciprocity ($S_{12}=S_{21}$) and symmetry ($S_{22}=S_{11}$) both measured at 0.000 dB, passivity at 1.0000.

![Figure 8: raw S-parameter solver output for one bridge](figures/08_driven_sparams_output.png)

### 5.3 What a collapsing bridge costs the line

Sweeping the electrostatic solve across measured clearance values on one chip's median cross-section gives a direct answer to "what does this defect cost electrically." **Figure 9** shows both views: the trace's total self-capacitance climbing as clearance shrinks, and the same data recast as capacitance *added* relative to a healthy bridge.

![Figure 9: capacitance vs. clearance, and the electrical penalty of collapse](figures/09_capacitance_vs_clearance.png)

A healthy bridge (~2.8 µm clearance) adds a small reference capacitance; a fully collapsed one (0.9 µm) adds **+2.23 fF** relative to that baseline — and the added capacitance grows non-linearly (closer to $1/d$ than linear) as the gap closes, exactly the same nonlinearity the parallel-plate model in section 5.1 also shows, just underestimated in magnitude.

On a chip with dozens of bridges in series, each one contributing a small, localized impedance discontinuity, these small reflections can interfere constructively enough to build up standing waves that measurably distort the transmitted signal — which is the concrete electrical reason to care about a defect that inspection alone reports only as a binary "collapsed" verdict.

---

## 6. meep: the time-domain alternative, and why it was set aside

The first attempt at this simulation used **meep**, a finite-difference time-domain (FDTD) solver, before the work moved to Palace. It's worth understanding both how it was built and exactly where it ran into trouble — because it's a genuinely reasonable next thing for someone to pick back up, on the right problem.

### Geometry construction

The meep geometry is built the same way Palace's is — from the same measured `summary.csv`/`cpw.csv` fields — but as an explicit sequence of five segments per bridge foot rather than a single fitted sheet:

$$\text{pad} \to \text{ramp} \to \text{arch} \to \text{ramp} \to \text{pad}$$

The **pad** rests flat on the ground plane; the **ramp** is a short sloped staircase climbing from the pad up to where the measured arch begins (needed for the same electrical-continuity reason described in section 4 — without it the arch is a floating conductor); the **arch** itself follows the fitted polynomial. Because the measurement gives the total footprint length and the suspended span separately, the pad length falls out as `(footprint − span) / 2` per side, with no extra fitting needed.

Orientation matters and is easy to get backwards: the airbridge arches **across** the line (its span runs transverse to propagation, with its feet on the two ground planes), while its *width* — the dimension the traveling wave actually sees end-on — runs *along* the line.

### How the simulation works

meep discretizes Maxwell's equations directly in the time domain on a **Yee grid**: a leapfrogged E/H staggered lattice, stepped forward in time, with the fields simply *evolving* rather than being solved for as a boundary-value problem. This is conceptually the most direct possible simulation — no frequency-domain abstraction, just watch the fields propagate — and it's why meep is attractive for broadband results in a single run.

The trouble is port excitation. The obvious approach — an `EigenModeSource` paired with `get_eigenmode_coefficients`, so S-parameters come out per-mode automatically — doesn't work here, and not as a bug to fix: both call MPB (meep's mode solver) to find the guided mode, and MPB requires a positive-definite dielectric function. The conductors here are modeled as perfect electric conductors (`mp.metal`), and any source plane cutting through a PEC trips MPB's assumption instantly.

So the port is instead a **hand-built approximation** of the CPW mode: an $E_y$ field imposed across the two gaps, antisymmetric between them — matching the field pattern of the fundamental even mode from Figure 2, but without ever actually solving for that mode. S-parameters then come from the standard **flux-normalization** recipe: run the bare line once as a reference, run the line with the bridge, and subtract the reference's incident field from the device run's input monitor.

This costs two things. First, **only magnitude, no phase** — flux carries no phase information, so full S-parameters (needed for reactance, or to disambiguate a capacitive from an inductive effect) are out of reach this way. Second, and more subtly, **no mode separation**: a bridge can leak power into the odd (slotline) mode described in section 2, and a total-power flux monitor simply counts that as "transmitted," regardless of which mode it's actually in. The output monitor here is sized to the CPW mode's own transverse extent rather than the full cell, which helps — power that has spread into a wide slotline-like pattern mostly misses a narrow monitor — but this is a much weaker guarantee than an actual modal decomposition.

Layered on top of this, the underlying disparity of scales is brutal in practice: an airbridge a few tens of micrometers across, sitting on a line that's millimeters long, simulated at GHz frequencies, forces meep's uniform Cartesian grid into a mesh far finer than the line itself would need — and the reference (bare-line) run in this project never actually reached its own quality target (a transmitted/incident power ratio of 0.477 against a 0.85 threshold), which is the real reason the effort moved to Palace's unstructured, locally-refinable mesh instead.

### What's worth picking back up

Reviving this is not pointless — it would be a genuine **independent cross-check** on the Palace numbers above, on a broadband basis, once done properly. Concretely, whoever picks this up next should:

1. **First get the bare-line reference run past its own 0.85 quality threshold** before simulating any bridge at all — a reference that fails its own test invalidates every downstream number, however plausible it looks.
2. Only then compare its capacitance extraction (via the low-frequency limit of the complex shunt admittance, $Y = \frac{2}{Z_0}\frac{1 - S_{21}}{S_{21}}$, whose imaginary part gives $\omega C$) against the Palace electrostatic $\Delta C$ from section 5.1 — the two are independent physics routes to the same number, and should agree once the reference is trustworthy.
3. Treat any resulting dip in $S_{21}$ with suspicion until checked against a raw field plot (`plot2D` / field output) — a shallow dip could be a real resonance, or could be power that quietly left through the untracked odd mode.

---

## Summary

- An airbridge's real job is topological, not just mechanical: it forces the two CPW ground planes to the same potential and kills the parasitic odd (slotline) mode. A collapsed bridge has stopped doing that.
- Its electrical side-effect, in the mode it's designed to support, is a small added shunt capacitance — a few tenths of an fF healthy, growing non-linearly to a couple of fF as it collapses, on the specific geometry measured here.
- The naive parallel-plate estimate gets the right order of magnitude but underestimates by a widening margin as the gap closes — fringing fields are not a small correction at these scales.
- Palace (FEM, frequency-domain) is the current workhorse: fast electrostatic sweeps for capacitance, exact S-parameters from a driven solve, with reciprocity/symmetry/passivity as free, automatic sanity checks.
- meep (FDTD, time-domain) was the original approach and is not a dead end, just incomplete: its own reference line needs to pass its own quality bar first, and it's missing phase and clean mode separation — both solvable, and both would make it a genuinely useful cross-check rather than a replacement.

---

## Figure index

| # | File | What it shows |
|---|---|---|
| 1 | `01_cpw_geometry.png` | The simulated unit cell: top view and cross-section |
| 2 | `02_cpw_modes.png` | The even (CPW) and odd (slotline) modes, and the airbridge's role |
| 3 | `03_sparam_ports.png` | The two-port measurement setup: incident, reflected, transmitted |
| 4 | `04_cpw_impedance_distribution.png` | Measured $Z_0$ spread across 607 real waveguide cross-sections |
| 5 | `05_measured_geometry_construction.png` | Simulation geometry built from one real measured bridge |
| 6 | `06_measured_profiles_overview.png` | Several real measured bridge profiles, healthy through collapsed |
| 7 | `07_capacitance_matrix.png` | The 1×1 capacitance matrix for one bridge (Palace, electrostatic) |
| 8 | `08_driven_sparams_output.png` | Raw driven-solve output: magnitude, phase, passivity |
| 9 | `09_capacitance_vs_clearance.png` | Capacitance vs. clearance sweep — the cost of collapse |
| 10 | `10_parallel_plate_vs_simulated.png` | Parallel-plate estimate vs. real FEM result |
