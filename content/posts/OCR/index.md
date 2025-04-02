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
![](conv.png)
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
$let \ n \in \mathbb {N}$ 
and
$let \ X \in M_n (\mathbb{R})$
we can consider an MLP $H$ as their immediate hidden representations represented as matrices of size $n * n$

### 1.0.1 [The Multilayer Perceptron](https://towardsai.net/p/machine-learning/the-multilayer-perceptron-built-and-implemented-from-scratch)
We define a multilayer Perceptron (MLP) $H$ with the following:

$\exists (U, V) \in  M_n (\mathbb{R})^2, $ 
$$
\forall (i, j) \in [1, n]^2, \quad
H_{i, j} = U_{i, j} + \sum_k \sum_l W_{i, j, k, l} X_{k, l}
= U_{i, j} + \sum_a \sum_b V_{i, j, a, b} X_{i+a, j+b}.
$$
such that $V_{i, j, a, b} = W_{i, j, i+a, j+b}$
### 1.0.2 Principle of translation invariance

This implies that a shift in the input \( X \) should simply lead to a shift in the hidden representation \( H \). This is only possible if \( U \) and \( V \) do not actually depend on \( (i,j) \). We can then note \( V_{i,j,a,b} = V_{a,b} \) and that \( U \) is a constant, allowing us to simplify the definition for \( H \):

\[
H_{i, j} = U + \sum_a\sum_b V_{a,b} X_{i+a,j+b}.
\]
### 2.0.1 Convolution of functions
In mathematics, the convolution product is a bilinear operator and a commutative product (commutativity), generally denoted by "∗", which, given two functions  𝑓 and 𝑔 over the same infinite domain, associates another function "𝑓∗𝑔" on this domain.
$$
\forall (f,g) \in {\mathbb (R}^{\mathbb{R}})^2, \forall x \in \mathbb{R} \qquad
(f*g)(x) = \int_{-\infty}^{_{+\infty}} g(t-x)f(t)dt
$$

### 3.0.1 Convolution for images
https://towardsdatascience.com/intuitively-understanding-convolutions-for-deep-learning-1f6f42faee1

![](avg.png)
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

![](plot_2.png) 

## IV | Implementing Convolutions

A `Sequential` model is appropriate for **a plain stack of layers** where each layer has **exactly one input matrix and one output Matrix**.

I will use the LeNet model as inpsiration and first get an undestanting on how the LeNet model works on the infamous MNIST database, and Implement that for the OCR database


![](layers.png)
![](layerdetails.png)

### Implementation
we're going to use the FluxML package for Julia to implement the convolution

Here's a way to implement fitting a line with Flux in Julia
```julia
using Flux
func(x) = 2x + 9

x_train, x_test = hcat(0:5...), hcat(6:10...)
y_train, y_test = func.(x_train), func.(x_test)
```