#!/usr/bin/env python3
"""Compare the real Palace electrostatic sweep against the naive
parallel-plate estimate, C = eps0 * A / d.

Real data points are the same Palace runs used in the report's
'capacitance vs clearance' figure (trace 9.3 um, slot 6.7 um, span 40 um,
bridge width 21.7 um; --fast preset, order 1, ~11 s/point):

    clearance (um): 2.8, 1.8, 1.2, 0.9
    trace self-capacitance (fF): 24.184, 24.839, 25.621, 26.413

Added capacitance relative to the healthy (2.8 um) case is what the
parallel-plate model is compared against, since the model has no notion of
the rest of the CPW line -- only of the bridge sheet suspended over the
trace.
"""
from pathlib import Path
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

OUT = Path(__file__).resolve().parent.parent / "figures" / "10_parallel_plate_vs_simulated.png"

EPS0 = 8.854e-12  # F/m
TRACE_W_UM = 9.3
BRIDGE_W_UM = 21.7
AREA_UM2 = TRACE_W_UM * BRIDGE_W_UM  # overlap between trace and bridge sheet

clr_um = np.array([2.8, 1.8, 1.2, 0.9])
C_fF_palace = np.array([24.184, 24.839, 25.621, 26.413])
dC_palace = C_fF_palace - C_fF_palace[0]

d_dense = np.linspace(0.7, 2.9, 200)
C_pp_fF = lambda d: EPS0 * (AREA_UM2 * 1e-12) / (d * 1e-6) * 1e15
dC_pp_dense = C_pp_fF(d_dense) - C_pp_fF(clr_um[0])
dC_pp_points = C_pp_fF(clr_um) - C_pp_fF(clr_um[0])

C_BLUE, C_ACC, C_GREY = "#2C5F8A", "#D98C1F", "#6B6B6B"

fig, ax = plt.subplots(figsize=(6.4, 4.6))
ax.plot(d_dense, dC_pp_dense, "-", color=C_GREY, lw=2.0,
        label=r"parallel-plate model, $\Delta C = \varepsilon_0 A/d - \varepsilon_0 A/d_0$")
ax.plot(clr_um, dC_pp_points, "o", color=C_GREY, ms=6)
ax.plot(clr_um, dC_palace, "o-", color=C_BLUE, lw=2.2, ms=8,
        label="Palace FEM (electrostatic solve, real geometry)")
for x, y in zip(clr_um, dC_palace):
    ax.annotate(f"{y:.2f}", (x, y), textcoords="offset points", xytext=(6, 6),
                fontsize=9, color=C_BLUE)
for x, y in zip(clr_um, dC_pp_points):
    ax.annotate(f"{y:.2f}", (x, y), textcoords="offset points", xytext=(6, -12),
                fontsize=9, color=C_GREY)

ax.axvline(1.0, color=C_ACC, ls="--", lw=1.3)
ax.text(1.03, ax.get_ylim()[1] * 0.02, "collapse\nthreshold", fontsize=8.5, color=C_ACC)
ax.invert_xaxis()
ax.set_xlabel("Airbridge clearance (µm)  —  bridge coming down →")
ax.set_ylabel("Added capacitance vs the healthy bridge (fF)")
ax.set_title("Where the simple parallel-plate picture breaks down", loc="left", fontsize=12)
ax.legend(fontsize=9, loc="upper left")
ax.grid(alpha=0.25)
fig.tight_layout()
fig.savefig(OUT, dpi=200)
print("wrote", OUT)
