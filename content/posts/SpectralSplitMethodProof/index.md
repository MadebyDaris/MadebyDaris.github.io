---
title: "The Math Behind the Method: Spectral Theory and the Split-Operator Algorithm"
date: 2026-01-01
description: " In this post, I derive the rigorous definition of the Hamiltonian. I will demonstrate how we handle the domain issues of unbounded operators and how this spectral decomposition justifies the Fourier-transform used in the Split-Operator algorithm."
tags: ["Physics", "Astronomy", "Quantum Mechanics", "Functional Analysis", "Algebra", "Math", "Measure Theory", "Analysis", "Complex & Real Analysis"]
type: post
weight: 25
katex: true
showTableOfContents: true
---
The Split-Operator method is a workhorse for solving the Time-Dependent Schrödinger Equation, but its derivation relies on mathematical machinery that is rarely explained in detail. Why are we allowed to split the exponential of an unbounded operator? The answer lies in the Spectral Theorem.

We begin with $\mathcal{H} = L^2(\mathbb{R})$

<!-- $$L^2(\mathbb{R}) = \left\{ \psi : \mathbb{R} \to \mathbb{C} \ \bigg|\ \int_{-\infty}^{\infty} |\psi(x)|^2 dx < \infty \right\}$$ -->

The kinetic energy term is a derivative: $\hat{T} \sim \frac{d^2}{dx^2}$. Differentiation is an **unbounded operator**. There are functions in $L^2$ (like high-frequency jagged fractals) that have finite area (norm) but infinite derivatives. If you try to apply $\hat{H}$ to them, the result is not in the Hilbert space.

we must define a **Domain** $D(\hat{H}) \subset \mathcal{H}$ (a dense subset of differentiable functions)

As such if $\hat{H}$ is some linear operator defined by some potential and kinetic energy, such that $\hat{H}$ is Self-Adjoint.
- **Symmetric/Hermitian:** $\langle \phi, \hat{H}\psi \rangle = \langle \hat{H}\phi, \psi \rangle$ for all $\phi, \psi$ in the domain.
- **Self-Adjoint:** The domain of the adjoint operator $\hat{H}^*$ must match the domain of $\hat{H}$.

## Theorem to prove

$\hat{H}$ is self-adjoint, there exists a unique Projection-Valued Measure $E(\lambda)$ to be defined such that $\hat{H}$ can be written as the following,
$$\hat{H} = \int_{S_p(\hat{H})} \lambda \, dE(\lambda)$$
Generalization of $H = \sum \lambda_i |v_i\rangle\langle v_i|$

defined as such, we can 
$$\hat{U}(t) = e^{-i\hat{H}t} = \int_{\sigma(\hat{H})} e^{-i\lambda t} \, dE(\lambda)$$
And so as a result,
$$e^{-i(\hat{T}+\hat{V})t} \approx (e^{-i\hat{T}t/n}e^{-i\hat{V}t/n})^n$$

## Proof

This is a bit confusing, especially since we're used to the classic definition and intuition of integration by the works done by Lebesgue and Riemann.

We extend the abstraction done by Lebesgue and Riemann to functions considered "measurable".

**Definition ($\sigma$-algebra):**

Given some set $\mathcal{A}$ of subsets of some set $X$, we say that these subsets impose a topology on $X$ if

1. $\emptyset \in \mathcal{A} \land X \in \mathcal{A}$
2. $A \in \mathcal{A} \implies A^c \in \mathcal{A}$
3. $\left( \forall n \in \mathbb{N}, A_n \in \mathcal{A} \right) \implies \bigcup_{n=1}^{\infty} A_n \in \mathcal{A}$

A measurable space is a pair $(X, \mathcal{A})$, where,
1. $X$ is a non-empty set.
2. $\mathcal{A}$ is a $\sigma$-algebra on $X$.
Let $(X, \mathcal{A})$ and $(Y, \mathcal{B})$ be two measurable spaces. A function $f: X \to Y$ is called $(\mathcal{A}, \mathcal{B})$-measurable (or simply measurable) if the inverse image of every set in $\mathcal{B}$ belongs to $\mathcal{A}$.

$$\forall B \in \mathcal{B}, \quad f^{-1}(B) \in \mathcal{A}$$


**Open Set:**

Let $(X, \|\cdot\|)$ be a Normed Vector Space

Consider some subset $U \subseteq X$

$U$ is open if:$$\forall x \in U, \exists \epsilon > 0, B(x, \epsilon) \subseteq U$$

Where $B(x, \epsilon) = \{ y \in X \mid \|x - y\| < \epsilon \}$ for $\epsilon \in \mathbb{R}$.

**Borel Set:**

The collection of Borel sets is the smallest sigma-algebra which contains all of the open sets. Every Borel set, in particular every open and closed set, is measurable.

In other words,
Let $X$ be a topological space (e.g., $\mathbb{R}$).

Let $\mathcal{T}$ be the collection of all open sets in $X$.

$$\mathfrak{S} = \{ \mathcal{B} \subseteq \mathcal{P}(X) \mid \mathcal{B} \text{ is a } \sigma\text{-algebra } \land \ \mathcal{T} \subseteq \Sigma \}$$
Where $\mathcal{P}(X)$ are all the subsets of some abstract set $X$

Hence the Borel $\sigma$-algebra denoted $\mathcal{B}(X)$, is defined by $$\mathcal{B}(X) = \bigcap_{\Sigma \in \mathfrak{S}} \Sigma$$

Then Starting with a measurable set $(\mathbb{R}, \mathcal{B}(\mathbb{R}))$. Equiping it with an application referred to as a measure $\mu$ defined by $\mu: \mathcal{B}(\mathbb{R}) \to [0, \infty]$ that assigns a non-negative number to every Borel set.

**Definition (Simple Function):**

Let $n$ be some positive whole number of $\mathbf{N}$
Let $s: \mathbb{R} \to \mathbb{C}$ be a simple function. This means $s(\lambda)$ takes only a finite number of values $\alpha_1, \dots, \alpha_n$ over disjointed Borel sets $\Delta_1, \dots, \Delta_n$.
Such that,
$$\forall i \in \{1, \dots, n\}, \forall \lambda \in\Delta_i, s(\lambda_i) = \alpha_i$$
In other words we can also define $s$ using characteristic functions, defined by,
$$\forall i \in \{1, \dots, n\}, \forall \lambda \in \mathbb{R}, (\chi_{\Delta_i}(\lambda) = 1 \implies \lambda \in \Delta_i) \lor (\chi_{\Delta_i}(\lambda) = 0 \implies \lambda \notin \Delta_i)$$
$$s(\lambda) = \sum_{j=1}^n \alpha_j \chi_{\Delta_j}(\lambda)$$
	The standard measure where the "size" of an interval is just its length: $\mu([a, b]) = b - a$.

The integral of a simple function is defined and noted as,
$$\int s \, d\mu = \sum_{i=1}^n \alpha_i \mu(\Delta_i)$$

**Definition (Projection-Valued Measure):**

Let $\mathcal{H}$ be a Hilbert space. A Projection-Valued Measure is a map $E: \mathcal{B}(\mathbb{R}) \to \mathcal{L}(\mathcal{H})$ such that:
1. **Values are Projections:** For every Borel set $\Delta$, the operator $E(\Delta)$ satisfies $E(\Delta)^2 = E(\Delta)$ and $E(\Delta)^* = E(\Delta)$.
2. normalization $E(\emptyset) = 0$ (the zero operator) and $E(\mathbb{R}) = I$ (the identity operator).
3. Additivity (Key Property): If we have a sequence of disjoint sets $\Delta_1, \Delta_2, \dots$ (e.g., disjoint energy ranges), the projection for the union is the sum of the projections: $$E\left(\bigcup_{n=1}^\infty \Delta_n\right) = \sum_{n=1}^\infty E(\Delta_n)$$
4. **Multiplicativity:** $E(\Delta_1 \cap \Delta_2) = E(\Delta_1) E(\Delta_2)$.
Keep in mind that for some $\Delta \subset \mathbb{R}$, $E(\Delta)$ is the **orthogonal projection** onto a specific subspace $\mathcal{H}_\Delta \subset \mathcal{H}$.

In our quantum mechanics framework, we can define $\mathcal{H}_\Delta$ as being the subspace of all quantum states who lie within $\Delta$.

Such that if we have some state $\psi \in \mathcal{H}$, the vector $E(\Delta)\psi$ is the "component" of $\psi$ that has energy in $\Delta$.

**Definition (Integral of a Simple Function using a Projection-Valued Measure):**

Since we know $E(\Delta_j)$ is the projection operator associated with the set $\Delta_j$, we note the integral of $s$ with respect to the PVM $E$ as simply the linear combination of these operators,
$$\Phi(s) = \int s(\lambda) \, dE(\lambda) = \sum_{j=1}^n \alpha_j E(\Delta_j)$$

**Theorem (Approximation):**

Let $f: \mathbb{R} \to \mathbb{C}$ be a **bounded measurable** function can be uniformly approximated by a sequence of simple functions $(s_n)_{n\in\mathbf{N}}$.

$$\lim_{n \to \infty} \sup_{\lambda \in \mathbb{R}} |f(\lambda) - s_n(\lambda)| = 0$$

Hence,
$$(s_n)_{n\in\mathbf{N}} \xrightarrow{n \to \infty} f$$

Since the sequence of scalar functions $(s_n)_{n \in \mathbb	{N}}$ converges to $f$, let us show that the sequence of operators $(\Phi(s_n))_{n \in\mathbb{N}}$ converges to a specific operator.

$$\|\Phi(s)\|_{op} = \|s\|_\infty$$

Let us define $\forall n \in \mathbb{N}, T_n = \Phi(s_n)$.
Given some $(n, m)\in\mathbb{N}$, using the linearity of $\Phi$,
$$\|T_n - T_m\| = \|\Phi(s_n - s_m)\|$$
Using the isometry of the operator,
$$|\Phi(s_n - s_m)\| = \sup_{\lambda} |s_n(\lambda) - s_m(\lambda)|$$

The distance between the _operators_ is **exactly the same** as the distance between the _functions_.

Since the sequence of scalar functions $(s_n)$ converges uniformly to $f$, it is a Cauchy sequence in the space of bounded measurable functions $L^\infty(\mathbb{R})$.

$$\forall \epsilon > 0, \exists N, \forall n,m > N \implies \|s_n - s_m\|_\infty < \epsilon$$

this implies:

$$\|T_n - T_m\|_{op} < \epsilon$$

Therefore, $(T_n)_{n \in \mathbb{N}}$ is a **Cauchy sequence** in the space of bounded linear operators $\mathcal{L}(\mathcal{H})$.

Because $\mathcal{H}$ is a Hilbert space, the space of bounded operators $\mathcal{L}(\mathcal{H})$ is complete. This guarantees that the sequence $(T_n)$ converges to a unique bounded operator $T \in \mathcal{L}(\mathcal{H})$.

$$\lim_{n \to \infty} \Phi(s_n) = \lim_{n \to \infty} \int_{\mathbb{R}} s_n(\lambda) \, dE(\lambda) = T$$

Hence we can define the integral of $f$ as being $T$.
$$\int_{\mathbb{R}} f(\lambda) \, dE(\lambda) = \lim_{n \to \infty} \int_{\mathbb{R}} s_n(\lambda) \, dE(\lambda)$$

## Quantum Mechanics

### Setup and notation
Let $\mathcal{H}$ be a Hilbert space and $E:\mathcal B(\mathbb R)\to\mathcal L(\mathcal H)$ a projection-valued measure (PVM). For any subset of energies $B \subset \mathbb{R}$, $E(B)$ is a projection operator. It projects a vector onto the subspace of states that have energy inside $B$.

For each $\psi\in\mathcal H$ denote the scalar measure, $$\mu_\psi(B)=\langle\psi,E(B)\psi\rangle$$
For a specific vector $\psi$, $\mu_\psi(B)$ is a scalar. Giving the probability that the state $\psi$ has energy in the range $B$.

We assume that for any bounded measurable $g:\mathbb R\to\mathbb C$ we can define the bounded operator
$$\Phi(g)=\int_\mathbb{R}g(\lambda)dE(\lambda),$$
Let us also assume that,
$$\|\Phi(g)\psi\|^2=\int_{\mathbb R}|g(\lambda)|^2\,d\mu_\psi(\lambda).$$

### Sequence of Bounded functions

We want to define the operator corresponding to the function $f(\lambda)=\lambda$ and prove it equals the self-adjoint operator $\hat H$ associated to $E$ by the spectral theorem.

Let us define, for all $n\in\mathbb{N}$
$$h_n(\lambda) = \lambda \cdot \chi_{[-n, n]}(\lambda) = \begin{cases} \lambda & \text{if } |\lambda| \le n \\ 0 & \text{if } |\lambda| > n \end{cases}$$
Since each $h_n$ is bounded, we can legitimately define the approximate operators $H_n$:
$$H_n = \Phi(h_n) = \int_{\mathbb{R}} h_n(\lambda) \, dE(\lambda)$$
Since each $h_n$ is bounded, the operators $H_n = \int h_n(\lambda) \, dE(\lambda)$ are well-defined bounded operators.
$$\|H_n\psi\|^2=\int_{\mathbb R}|s_n(\lambda)|^2\,d\mu_\psi(\lambda) =\int_{|\lambda|\le n}\lambda^2\,d\mu_\psi(\lambda).$$

We define the domain $D(\hat{H})$ as the set of vectors where the "energy variance" is finite.
$$D(\hat{H}) = \left\{ \psi \in \mathcal{H} \bigg| \int_{-\infty}^{\infty} |\lambda|^2 \, d\mu_\psi(\lambda) < \infty \right\}$$
We must show that for any valid vector $\psi \in D(\hat{H})$, the approximate operators $H_n \psi$ converge to something.

Let $\psi \in D(\hat{H})$. Consider the distance between two approximations $H_n \psi$ and $H_m \psi$.
$$\|H_n \psi - H_m \psi\|^2 = \| \Phi(h_n - h_m) \psi \|^2$$
$$\| \Phi(h_n - h_m) \psi \|^2 = \int_{\mathbb{R}} |h_n(\lambda) - h_m(\lambda)|^2 \, d\mu_\psi(\lambda)$$
The integrand is $|h_n - h_m|^2$. As $n, m \to \infty$, the functions $h_n$ and $h_m$ both approach $f(\lambda) = \lambda$. 

Hence, 

$$\lim_{n, m \to \infty} \|H_m \psi - H_n \psi\|^2 = 0$$

So $(H_n\psi)_{n\in\mathbb{N}}$​ is a Cauchy sequence in $\mathcal H$ which is complete and thus converges to a unique vector.

$$\hat H\psi=\lim_{n\to\infty}H_n\psi,\qquad \psi\in\mathcal D.$$

Specifically, on the domain $D(\hat{H})$,
$$\hat{H} = \int_{\sigma(H)} \lambda \, dE(\lambda)$$

## Stone's Theorem

Let $(U_t)_{t\in\mathbb{R}}$ be a continuous one-parameter unitary group. Then there exists a unique operator  $A:\mathbf{D}_A→H$ that  is self-adjoint on $\mathcal{D}_A$ and such that,

$$\forall t \in \mathbb{R},U_t=e^{itA}$$

Where,

$${{\mathcal {D}}_{A}=\left\{\psi \in {\mathcal {H}}\left|\lim _{\varepsilon \to 0}{\frac {-i}{\varepsilon }}\left(U_{\varepsilon }(\psi )-\psi \right){\text{ exists}}\right.\right\}}$$

We can now define,
$$\hat{U}(t) = e^{-i\hat{H}t} = \int_{\sigma(\hat{H})} e^{-i\lambda t} \, dE_H(\lambda)$$
