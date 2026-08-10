---
title: "Theoretical Foundations of Modular Reduction: Barrett and Montgomery Algorithms"
date: 2026-01-08
description: "A dive into the theory of modular arithmetic optimizations, specifically the Barrett and Montgomery algorithms."
tags: ["Computer Science", "Cryptography", "Number Theory"]
type: post
weight: 25
katex: true
showTableOfContents: true
---

Welcome to  mini dive into modular arithmetic optimizations as a part of my new project NexusV! The theory outlined below forms the mathematical backbone of the hardware IPs, it's pretty simple but useful for computer arithmetics in general and to wrap your head around cryptographic implementations.

NexusV is an open-source hardware acceleration framework for RISC-V. It allows you to describe a computation and generate a library of hand-optimized IP blocks and compiles it directly into a pipelined, CV-X-IF-compliant coprocessor.

This post is a quick reminder of how these algorithms and the proofs behind them can be implemented in hardware as simple IPs, it can be simple for the barrett reduction for instance, but montgomery multiplication is a bit more intricate these algorithms consitute some of the arithmetic algorithms used in post-quantum cryptography.

## 1. Defining the Modulo Operation
The primary goal is to optimize the calculation of $a \pmod n$. Before jumping into the reduction algorithms, let us formally define our rounding integer approximation functions:

**Definition 1 (Rounding Functions):** 
Let $x \in \mathbb{R}$. We define the floor and ceiling functions as maps from $\mathbb{R}$ to $\mathbb{Z}$:
- $\lfloor x \rfloor = \max \{ k \in \mathbb{Z} \mid k \le x \}$
- $\lceil x \rceil = \min \{ k \in \mathbb{Z} \mid k \ge x \}$

**Definition 2 (Modulo Operation):** Let $n \in \mathbb{N}^*$. For any integer $a \in \mathbb{Z}$, we define $a \pmod n$ as the unique representative in the interval $[0, n-1]$ such that:

$$a \pmod n = a - \left\lfloor \frac{a}{n} \right\rfloor n$$
## 2. Barrett Reduction
Compute $a \pmod n$ for $a, n \in \mathbb{N}^*$, avoiding the computational cost of exact division in hardware.

Let $k \in \mathbb{N}$ be our bit-width and define our radix as $R = 2^k$. with $R > n$. 

We can rewrite the standard modulo expression by introducing $R$:
$$a \pmod n = a - \left\lfloor \frac{a}{R} \frac{R}{n} \right\rfloor n$$

**Proposition 1 (Barrett Approximation):** Let $m \in \mathbb{N}$ be a precomputed constant defined by $m = \left\lfloor \frac{R}{n} \right\rfloor = \left\lfloor \frac{2^k}{n} \right\rfloor$. An approximation of the quotient $q = \lfloor \frac{a}{n} \rfloor$ can be computed using purely multiplication and bit-shift operations (division by $2^k$):

$$q \approx \left\lfloor \frac{a \cdot m}{2^k} \right\rfloor$$


The final remainder is then obtained via a simple subtraction:


$$a \pmod n \approx a - q \cdot n$$

_(Note: Depending on the bounds of $a$, a final conditional subtraction of $n$ may be required to bring the result fully into the range $[0, n-1]$)._

  

## 3. Montgomery Modular Multiplication
**Objective:** Compute the modular product $(a \times b) \pmod n$ efficiently, heavily utilized in cryptographic algorithms and modular exponentiation.

Let $R \in \mathbb{N}$ such that $R > n$ and $\gcd(n, R) = 1$. 
Because $n$ and $R$ are coprime, Bézout's identity guarantees the existence of integers $(R', n') \in \mathbb{N}$ such that,
$$R R' - n n' = 1$$
This identity implies two critical modular relations:
1. $R R' \equiv 1 \pmod n$, making $R'$ the modular inverse of $R$, denoted as $R^{-1}$.
2. $n n' \equiv -1 \pmod R$.
3. 
Let us define a bijection $f: \mathbb{Z}_n \to \mathbb{Z}_n$ given by $a \mapsto aR \pmod n$. We denote this "Montgomery form" as $\tilde{a}$. This mapping is a trivial isomorphism that preserves addition and facilitates extremely fast multiplication.

**Definition 3 (Montgomery Form):** We define the mapping $f: \mathbb{Z}/n\mathbb{Z} \to \mathbb{Z}/n\mathbb{Z}$ such that $x \mapsto xR \pmod n$. This function is a trivial isomorphism that preserves addition. For any $a \in \mathbb{Z}/n\mathbb{Z}$, its representation in the Montgomery space is denoted $\tilde{a} = aR \pmod n$.

### The REDC Theorem (Reduction Algorithm)
**Theorem 1 (Montgomery Reduction / REDC Algorithm):** Let $T = \tilde{a} \cdot \tilde{b} \in \mathbb{N}$ such that $0 \le T < nR$. We define $m = (T \bmod R) \cdot n' \bmod R$. Let $t \in \mathbb{Q}$ be defined by:
$$t = \frac{T + m n}{R}$$
Then, the following properties hold: i) $t \in \mathbb{N}$ (The division by $R$ is exact). ii) $t \equiv T R^{-1} \pmod n$. iii) $t$ is strictly bounded such that $0 \le t < 2n$.

**Proof**

**1. Integrity of $t$ (Divisibility by $R$)** We must prove that $T + mn$ is a multiple of $R$. Evaluating the expression modulo $R$:
$$T + m n \equiv T + ((T \bmod R) \cdot n' \bmod R) \cdot n \pmod R$$
$$T + m n \equiv T + T \cdot n' \cdot n \pmod R$$
By substituting the Bézout relation $n n' \equiv -1 \pmod R$, we obtain as a result
$$T + m n \equiv T + T(-1) \equiv 0 \pmod R$$
Hence $t$ is divisible by $R$


**2. Congruence Modulo $n$** Let us evaluate $t R = T + m n$ modulo $n$:
$$t R \equiv T + m(0) \pmod n \implies t R \equiv T \pmod n$$
Multiplying both sides by the modular inverse $R^{-1}$ yields:
$$t \equiv T R^{-1} \pmod n$$
# A look into the NexusV implementation of these algorithms
Translating these formal mathematical proofs into cycle-accurate digital logic is the crux of Nexus-V.
## **The Barrett Reduction Primitive**
The Barrett IP utilizes a purely combinational datapath to execute the approximation logic. By parameterizing the word width and the precomputed constant $m$, the module efficiently resolves the quotient estimation and conditional remainder correction. This avoids complex division hardware, though careful synthesis is required to ensure the multiplication which get simplified in some cases to simple bit shifts followed by subsequent subtraction as to not bottleneck the critical path of the target frequency. Division is expensive in hardware they can't be easily parallelized like multiplication While adders and multipliers use massive webs of concurrent logic gates to compute results in a single clock tick or a short pipeline.
## **The Montgomery Multiplier**
For multi-word modular operations, the Montgomery IP employs an FSM-driven architecture. The state machine effectively separates memory addressing from core REDC arithmetic.

🔗 **[Explore the Nexus-V IP Library on GitHub](https://github.com/MadebyDaris/Nexusv)** 

May your clock cycles be short, bye ;-)