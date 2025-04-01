---
title: "How do Convolution Neural Networks Work?"
date: 2024-09-30
description: "A bunch of notes."
tags: ["Electronics"]
type: post
weight: 25
katex: true
showTableOfContents: true
---


# Convolution Neural Network implementation
![](convex.png) 
This uses the MNIST dataset but with the OCR font we can create our own synthetic dataset
## I | Math
Source of the following model inspired by : 
https://d2l.ai
https://www.deeplearningbook.org/  by Ian Goodfellow and Yoshua Bengio and Aaron Courville
#### Probability
If we know the probability distribution over a set of variables and we want
to know the probability distribution over just a subset of them. The probability
distribution over the subset is known as the marginal probability distribution

suppose we have discrete random variables $X$ and $Y$
$$ \forall x \in X,P(X = x) $$
## II | What are convolutions and MLP's
$let \; n \in \mathbb {N}$ 
$let \quad X \in M_n (\mathbb{R})$
we can consider an MLP $H$ as their immediate hidden representations represented as matrices of size $n * n$

### 1.0.1 [The Multilayer Perceptron](https://towardsai.net/p/machine-learning/the-multilayer-perceptron-built-and-implemented-from-scratch)
We define a multilayer Perceptron (MLP) $H$ with the following
$$
\begin{split}
\begin{aligned} 
\exists (U, V) \in  M_n (\mathbb{R})^2, \;
\forall(i, j) \in [1, n]^2 \qquad
\\
\left[\mathbf{H}\right]_{i, j} &= [\mathbf{U}]_{i, j} + \sum_k \sum_l[\mathsf{W}]_{i, j, k, l}  [\mathbf{X}]_{k, l}\\ &=  [\mathbf{U}]_{i, j} +
\sum_a \sum_b [\mathsf{V}]_{i, j, a, b}  [\mathbf{X}]_{i+a, j+b}.\end{aligned}\end{split}
such \;that \
[\mathsf{V}]_{i, j, a, b} = [\mathsf{W}]_{i, j, i+a, j+b}
$$
### 1.0.2 Principle of translation invariance

This implies that a shift in the input $X$ should simply lead to a shift in the hidden representation $H$. This is only possible if $U$ and $V$ do not actually depend on $(i,j)$. we can then note $[V]_{i,j,a,b}=[V]_{i,j}$ and $U$ is a constant, we can simplify the definition for $\mathbf{H}$:
$$[\mathbf{H}]_{i, j} = [U]_{i,j} + \sum_a\sum_b [\mathbf{V}]_{a,b}[\mathbf{X}]_{i+a,j+b}.$$

### 2.0.1 Convolution of functions
En [mathématiques](https://fr.wikipedia.org/wiki/Math%C3%A9matiques "Mathématiques"), le **produit de convolution** est un [opérateur bilinéaire](https://fr.wikipedia.org/wiki/Application_bilin%C3%A9aire "Application bilinéaire") et un [produit](https://fr.wikipedia.org/wiki/Produit_(math%C3%A9matiques) "Produit (mathématiques)") [commutatif](https://fr.wikipedia.org/wiki/Commutativit%C3%A9 "Commutativité"), généralement noté « ∗ », qui, à deux [fonctions](https://fr.wikipedia.org/wiki/Fonction_(math%C3%A9matiques) "Fonction (mathématiques)") f et g sur un même domaine infini, fait correspondre une autre fonction « _f_ ∗ _g_ » sur ce domaine
$$
\forall (f,g) \in {\mathbb (R}^{\mathbb{R}})^2, \forall x \in \mathbb{R} \qquad
(f*g)(x) = \int_{-\infty}^{_{+\infty}} g(t-x)f(t)dt
$$

### 3.0.1 Convolution for images
https://towardsdatascience.com/intuitively-understanding-convolutions-for-deep-learning-1f6f42faee1

![[Pasted image 20240413131408.png]]
- we get the edges trimmed off this isn't useful, as we want theinput to be the same size as the output
- we can add fake pixels in order to circumvent this issue
- we call this **padding**
We also have another method called striding in order to effectuate a convolution on separate kernels of the input
#excalidraw 

## III | Example with cross-correlation

*Implementation in julia using JuliaImage and DSP(digital signal processing)* 

```julia
float_array = float64.(channelview(Gray.(img)))

conv_mat =  [-1 -1 -1
             -1  8 -1
             -1 -1 -1]

output = conv(float_array, conv_mat)
img_out = colorview(Gray, output)
img_out
```

Output :

![[plot_2.png]] 

## IV | Implementing Convolutions

A `Sequential` model is appropriate for **a plain stack of layers** where each layer has **exactly one input matrix and one output Matrix**.

I will use the LeNet model as inpsiration and first get an undestanting on how the LeNet model works on the infamous MNIST database, and Implement that for the OCR database


![[Pasted image 20240416204132.png]]
![[Pasted image 20240416204630.png]]

### Implementation
we're going to use the FluxML package for Julia to implement the convolution

Here's a way to implement fitting a line with Flux in Julia
```julia
using Flux
func(x) = 2x + 9

x_train, x_test = hcat(0:5...), hcat(6:10...)
y_train, y_test = func.(x_train), func.(x_test)
```