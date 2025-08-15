---
title: "Inertia devlog n°1 Enhanced UI"
date: 2025-08-11
description: "Devlog n1 for Inertia the physics Engine."
tags: ["Software Engineering", "Physics", "Astronomy"]
type: post
weight: 25
katex: true
showTableOfContents: true
---
# Inertia Devlog #1 : UI enhancements

*by Daris*

Welcome to the first devlog of **Inertia**, my Rust-based physics engine project After a week of tinkering with ui design, I'm excited to share what I've added so far.

## What is Inertia?

Inertia is a real-time physics simulation engine that focuses on gravitational interactions between celestial bodies. Think of it as a sandbox where you can experiment with orbital mechanics, watch planets dance around each other, and observe the elegant chaos of N-body gravitational systems.

![Physics Simulation](https://img.shields.io/badge/Physics-Orbital%20Mechanics-blue) ![Language](https://img.shields.io/badge/Language-Rust-orange) ![Graphics](https://img.shields.io/badge/Graphics-OpenGL-green)

## Enhanced UI System

One of the biggest additions this week has been a complete overhaul of the user interface. I moved from basic parameter display to a full control system using `egui`.

### Modular Widget Architecture

The new UI system is built around expandable widgets:

```rust
#[derive(Clone)]
pub enum WidgetEnum {
    AstralBodyInfo(AstralBodyInfoWidget),
    SimulationInfo(SimulationInfoWidget),
    ControlBar(ControlBarWidget),
    ObjectCreator(ObjectCreatorWidget),
    TimeController(TimeControllerWidget),
    ForceManager(ForceManagerWidget),
    OrbitVisualizer(OrbitVisualizerWidget),
}
```

### Control Bar

The bottom control bar gives quick access to all major features:

- **Add Object**: Create new celestial bodies with custom mass, velocity, and textures
- **Time Control**: Speed up, slow down, or pause the simulation
- **Force Manager**: Apply custom forces and adjust gravitational parameters
- **Orbit Trails**: Visualize the paths objects take through space

### Dynamic Object Creation

Users can now create objects on-the-fly through the UI:

```rust
pub struct ObjectCreationRequest {
    pub name: String,
    pub mass: f32,
    pub radius: f32,
    pub position: Vector,
    pub velocity: Vector,
    pub texture_path: String,
}
```

## Orbit Trail Visualization

One of my favorite new features is the orbit trail system. Each object can leave a colored trail showing its path through space:

```rust
pub struct OrbitTrail {
    pub positions: Vec<Vector>,
    pub max_length: usize,
    pub color: [f32; 3],
    pub enabled: bool,
}
```

The trails fade over time and can be toggled per-object, making it easy to visualize complex orbital patterns and interactions.

## Technical Architecture

The engine follows a clean separation of concerns:

```
Inertia Engine
├── Simulation Layer      # Physics world management
├── Physics Engine        # Force calculations & integration  
├── Rendering System      # OpenGL graphics pipeline
├── Mesh Management       # 3D geometry and texturing
├── UI System            # Real-time parameter visualization
└── Utilities            # Math, vectors, and app framework
```

### Key Systems

**AstralBody Structure**: Each celestial object tracks position, velocity, acceleration, angular momentum, and more:

```rust
pub struct AstralBody {
    pub mesh: MeshObject,
    pub velocity: Vector,
    pub acceleration: Vector,
    pub angular_velocity: Vector,
    pub mass: f32,
    pub forces: Vec<Force>,
    pub moment_of_inertia: f32,
    // ... and more
}
```

**Force System**: All forces (gravitational, damping, custom) go through a unified system:

```rust
impl Add for Force {
    type Output = Self;
    fn add(self, other: Self) -> Self::Output {
        let resultant_direction = self.direction * self.magnitude + other.direction * other.magnitude;
        let resultant_magnitude = resultant_direction.magnitude();
        
        Self {
            direction: resultant_direction.normalized(),
            magnitude: resultant_magnitude,
        }
    }
}
```

## What's Working

- **Real-time N-body simulation** with stable orbits
- **Interactive 3D camera** with WASD movement
- **Dynamic object creation** through UI
- **Force visualization** and parameter tweaking
- **Orbit trail rendering** with customizable colors
- **Collision detection** between bodies
- **Time control** (speed up/slow down simulation)

## Current Challenges

The biggest challenge has been maintaining numerical stability in the physics integration. Small floating-point errors can accumulate over time, causing orbits to spiral or objects to fly off unexpectedly. I'm using Euler integration for now, but I'm considering implementing more sophisticated methods like Runge-Kutta.

Another interesting problem is the UI-to-simulation communication. The response system handles commands from widgets:

```rust
pub enum WidgetResponse {
    None,
    CreateObject(ObjectCreationRequest),
    TimeControl(TimeControlCommand),
    ForceCommand(ForceCommand),
    VisualCommand(VisualCommand),
}
```

## What's Next

I'm planning several major features for the next update:

1. **Time Travel System**: Save simulation states and allow rewinding to previous moments
2. **Better Integration Methods**: Implement Runge-Kutta for more stable orbits  
3. **Particle Effects**: Add visual flair with engine trails and gravitational field visualization
4. **Save/Load Systems**: Persistent simulation scenarios
5. **Performance Optimization**: Better handling of large numbers of objects

## Try It Yourself

The project is open source and available on [GitHub](https://github.com/MadebyDaris/Inertia). If you have Rust installed, you can clone and run it:

```bash
git clone https://github.com/MadebyDaris/Inertia.git
cd Inertia
cargo run --release
```

The engine runs best on modern graphics cards, but integrated graphics should handle basic simulations just fine.

---

This has been an incredibly fun project to work on. There's something mesmerizing about watching little digital worlds evolve under the laws of physics. Each feature addition opens up new possibilities for experimentation and discovery.

Stay tuned for the next devlog where I'll be diving into time travel mechanics and more advanced physics integration!

*Happy coding,*  
*Daris*

---

**Links:**
- [Project Repository](https://github.com/MadebyDaris/Inertia)
- [Issues & Feature Requests](https://github.com/MadebyDaris/Inertia/issues)
- [Documentation](https://github.com/MadebyDaris/Inertia/tree/main/docs)