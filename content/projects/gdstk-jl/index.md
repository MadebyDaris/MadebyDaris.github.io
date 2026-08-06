---
title: "Gdstk.jl Julia GDSII/OASIS Layout Engine"
date: 2026-07-01
description: "A Julia wrapper for the gdstk C++ library, providing a fast, full-featured GDSII and OASIS layout engine for chip design and nanofabrication mask generation."
tags: ["Julia", "Nanofabrication", "EDA", "GDSII", "Hardware"]
type: project
status: "Active"
github: "https://github.com/MadebyDaris/Gdstk.jl"
tech: ["Julia", "C++", "GDSII", "OASIS", "FFI"]
weight: 4
showTableOfContents: true
---

## What Is Gdstk.jl?

**Gdstk.jl** is a Julia package wrapping the [gdstk](https://github.com/heitzmann/gdstk) C++ library, a high-performance GDSII and OASIS layout engine. GDSII (Graphic Data System II) is the standard file format used in semiconductor fabrication to describe the physical layout of integrated circuits: every transistor, wire, via, and contact pad on a chip starts as geometry in a GDSII file.

This package brings that capability into Julia's scientific computing ecosystem, making it straightforward to **programmatically generate, manipulate, and export chip layouts** without leaving your Julia workflow.


## Why Julia for Layout?

The traditional EDA workflow for mask generation involves proprietary tools (Cadence Virtuoso, KLayout scripts, or Python-based gdspy/gdstk). Gdstk.jl enables:

- **Programmatic layout generation** directly from Julia, integrating with optimization loops, simulation results, or parametric sweeps
- **High performance** via the underlying C++ engine, where boolean operations, polygon offsetting, and fracturing run at native speed
- **Seamless integration** with Julia packages for EM simulation, quantum device design, and statistical analysis

This is particularly useful for **quantum device fabrication** (where layout geometry is tightly coupled to simulation parameters) and **parametric cell generation** in research environments.

## Core Features

### Geometry Primitives
Full support for the fundamental GDSII building blocks:

| Primitive | Description |
|---|---|
| `Polygon` | Arbitrary polygonal shapes with N vertices |
| `FlexPath` | Flexible paths with varying widths (waveguides, wires) |
| `RobustPath` | Numerically robust paths for complex curves |
| `Label` | Text annotations on layers |
| `Reference` | Cell references for hierarchical design |

### Shape Generators
Convenience functions for common shapes:
- `rectangle`, `ellipse`, `regular_polygon`, `racetrack`, `cross_shape`

### Geometric Operations
- **Boolean operations**: `union_polygons`, `intersect_polygons`, `subtract_polygons`, `xor_polygons`
- **Transformations**: `translate!`, `rotate!`, `scale!`, `mirror!`
- **Processing**: `fillet!`, `fracture`, `slice_polygon`, `gds_offset`
- **Queries**: `area`, `signed_area`, `perimeter`, `bounding_box`

### Path Operations
- `segment!`, `arc!`, `turn!`, `horizontal!`, `vertical!` — build complex routing paths incrementally

### Library & Cell Management
- Hierarchical cell management with `add_polygon!`, `add_label!`, `flatten!`
- GDSII/OASIS file I/O with `read_gds`, `write_gds`, `read_oas`, `write_oas`
- `top_level_cells` for navigating cell hierarchy


## Example Usage

```julia
using Gdstk

# Create a library and cell
lib = Library("MyChip")
cell = Cell("resonator")

# Add a coplanar waveguide resonator
centerline = FlexPath([(0.0, 0.0)], 10.0; layer=1)
segment!(centerline, (100.0, 0.0))
arc!(centerline, 50.0, 0, π; layer=1)
segment!(centerline, (-100.0, 100.0))

add_polygon!(cell, centerline)

# Boolean subtract to create the gap
gap = gds_offset(centerline, 5.0)
ground = rectangle((-20, -20), (200, 200); layer=0)
ground_plane = subtract_polygons(ground, gap)
add_polygon!(cell, ground_plane)

# Export
add_cell!(lib, cell)
write_gds(lib, "resonator.gds")
```

---

## Resources

- [GitHub Repository](https://github.com/MadebyDaris/Gdstk.jl)
- [gdstk C++ library](https://github.com/heitzmann/gdstk)
