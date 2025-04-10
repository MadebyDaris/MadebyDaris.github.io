---
title: "Automated Trading System"
date: 2023-09-20
description: "Using a bot for finance stuff"
tags: ["Finance"]
type: post
weight: 35
showTableOfContents: true
katex: true
---
# ATS

### Overall Plan of the mini-project
1. **Implement an Automated Trading System in Julia**
    - **Explore Trading Libraries**: Use packages like `TradingLogic.jl` or `MarketData.jl` for handling financial data and trading logic.
    - **Design the System**: Outline the architecture of your trading system, including data ingestion, strategy implementation, and order execution.
    - **Develop and Test**: Start by coding simple trading strategies, backtest them with historical data, and iterate.
2. **Port the System to Rust**
    - **Find Equivalent Libraries**: Identify Rust libraries for trading, such as `tardis` for financial data analysis.
4. **Explore and Compare Different Algorithms**
    - **Research Algorithms**: Look into common strategies such as mean reversion, momentum trading, statistical arbitrage, and machine learning-based models.
    - **Implement and Backtest**: Code various algorithms and use historical data to evaluate their performance.
    - **Analyze Results**: Compare the profitability, risk, and computational efficiency of each algorithm.
5. **Simulate Algorithms with Fake Money**
    - **Create a Simulation Environment**: Use tools like `QuantLib.jl`
    - **Paper Trading**: Connect your system to paper trading platforms like Interactive Brokers' demo account to test in real market conditions.
    - **Evaluate Performance**: Monitor key metrics such as profit/loss, drawdown, and execution speed.
6. **Reduce Latency Between Data and the Script**
    - **Optimize Data Pipeline**: Ensure efficient data fetching, parsing, and storage.
    - **Use Low-Latency Programming Techniques**: Implement multi-threading, async processing, and memory management optimizations.
    - **Leverage Efficient Protocols**: Use protocols like FIX or websockets for real-time data streaming.
7. **Compile into an Application**
    - **Choose a Framework**: Use a suitable framework for building a desktop or web application, such as `Electron` for cross-platform desktop apps or `Rocket` for web apps in Rust.
    - **Integrate Components**: Combine the trading logic, user interface, and backend services.
    - **Deploy and Maintain**: Test the application rigorously, deploy it, and set up maintenance processes for updates and bug fixes.

### Resources

- **Books**
- **Libraries and Tools**:
    - Julia: `TradingLogic.jl`, `MarketData.jl`
    - Rust: `tardis`
    - Simulation: `QuantLib.jl`


#### What is Algorithmic trading?
**Algorithmic trading** is a method of executing orders using automated pre-programmed trading instructions accounting for variables such as time, price, and volume
 - Algos
	 - delta-neutral trading strategy: offsetting positive and negative deltas

##### **Some definitions**
 - **Moving Average (MA)** is a stock indicator commonly used in technical analysis. The reason for calculating the moving average of a stock is to help smooth out the price data by creating a constantly updated average price.
	 - An average of past data points that smooths out day-to-day price fluctuations and thereby identifies trends.)
 - **Mean reversion strategy** is based on the concept that the high and low prices of an asset are a temporary phenomenon that revert to their mean value 
 - **volume-weighted average price (VWAP)** is a technical analysis indicator used on intraday charts that resets at the start of every new trading session. It's the average price a security has traded at throughout the day


#### Types of Moving averages
let us denote A the moving average for each of the following indicators
#### Simple moving average (SMA)

Let $(t_i)_{i \in \![1,n]\!}$ be some set of prices of $n$ stocks 
$$
A =\frac{\sum^n_i{t_i}}{n}
$$