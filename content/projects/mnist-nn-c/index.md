---
title: "MNIST Neural Network in C"
date: 2024-12-01
description: "A fully connected neural network built entirely from scratch in C for MNIST digit classification, featuring a Go web interface for real-time inference."
tags: ["Machine Learning", "C", "Go", "Neural Networks", "Software Engineering"]
type: project
status: "Complete"
github: "https://github.com/nmizern/mnist-neural-network-c"
tech: ["C", "Go", "Linear Algebra", "WebSockets"]
weight: 8
showTableOfContents: true
---

## Overview

This project is a high-performance, fully connected dense neural network library written in pure C, designed specifically for classifying the MNIST handwritten digit dataset. It was developed as a university project for the TEI S7 Neural Networks course, where it received the highest grade in the L3 E3A promotion (19/20).

What sets this project apart is its strict adherence to building from first principles. It uses no external machine learning frameworks — all matrix multiplications, activation functions, and backpropagation algorithms are implemented manually in C.

## Features & Architecture

### The Core C Library
- **Pure C implementation** without heavy ML dependencies (requires only standard libraries and `libpng`).
- Configurable architectures: supports swapping activation functions (Sigmoid, ReLU, Tanh) and output layers (Softmax).
- Customizable optimizers: implemented both standard Stochastic Gradient Descent (SGD) and Adam.
- Loss functions: Mean Squared Error (MSE) and Categorical Cross-Entropy (CCE).

### The Go Web Interface
To demonstrate the model in action, the project includes a real-time web application built in Go (using the Gin framework). 

1.  A user draws a digit on an HTML5 canvas in their browser.
2.  The client-side JavaScript handles preprocessing (centering, scaling to 28x28).
3.  The preprocessed image is sent to the Go backend.
4.  The Go server parses the trained binary model (`mnist_model.bin`) and performs the forward propagation entirely in pure Go (without CGO overhead) to predict the digit.


## Building and Training

The project utilizes CMake for cross-platform building. The training pipeline is highly modular, allowing for experimentation with different hyperparameters and network depths.

```bash
# Example build process
mkdir build && cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
cmake --build . --config Release

# Running the training executable
./build/examples/mnist_train examples/mnist-pngs
```

## Collaborators

This was a joint project developed alongside Mikita Mizerkin.

## Resources

- [GitHub Repository](https://github.com/nmizern/mnist-neural-network-c)
- [Project Presentation (PDF)](https://github.com/nmizern/mnist-neural-network-c/blob/main/TEI-S7-NNv2.pdf)
