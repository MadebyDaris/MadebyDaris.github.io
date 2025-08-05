---
title: "Dogonomics Financial Assistant development"
date: 2025-08-01
description: "A recounting of Dogonomics my financial assistant that I'm developing, currently in the making."
tags: ["AI/Machine learning", "Finance", "App Development"]
type: post
weight: 25
katex: true
showTableOfContents: true
---

# Dogonomics Documentation
## WORK IN PROGRESS STILL IN THE MAKING

Dogonomics is a Go-based project designed to provide insights and analytics related to dog-related data. This documentation serves as a comprehensive guide for understanding the structure, usage, and resources of the project.

Anyone interested you can contact me and help with Dogonomics.

## Table of Contents
- [Dogonomics Documentation](#dogonomics-documentation)
  - [Table of Contents](#table-of-contents)
    - [Insider Sentiment](#insider-sentiment)
    - [What is an IPO](#what-is-an-ipo)


### Insider Sentiment
Insiders’ sentiment gives investors a glimpse at what the executives are thinking about the stock price and valuation in the near future. In this article, we will walk you through the methodology used by Finnhub to calculate Insiders Sentiment and examine the correlation between it and stock prices in the case of AAPL.


### What is an IPO
An initial public offering (IPO) or stock launch is a public offering in which shares of a company are sold to institutional investors and usually also to retail (individual) investors. An IPO is typically underwritten by one or more investment banks, who also arrange for the shares to be listed on one or more stock exchanges

# Data Fetching
The project revolves around fetching data from various sources, primarily using the Finnhub API. The data is fetched in a structured manner to ensure that it can be processed and utilized effectively within the application.

Here I will go through the different components involved in data fetching, including the use of the different data sources towards a Stock view Data that will recevied in dart and displayed in the app in the StockViewPage widget.

## The different structures I use to fetch data from the Finnhub API:
### Quotes
```go
type Quote struct {
	CurrentPrice  float64 `json:"c"`
	Change        float64 `json:"d"`
	PercentChange float64 `json:"dp"`
	HighPrice     float64 `json:"h"`
	LowPrice      float64 `json:"l"`
	OpenPrice     float64 `json:"o"`
	PreviousClose float64 `json:"pc"`
	Timestamp     int64   `json:"t"`
}
```
Here is the Quote struct that represents the data fetched from the Finnhub API. It includes fields for the current price, change, percent change, high price, low price, open price, previous close, and timestamp.
This data is availabl in the free tier of the Finnhub API, which allows for real-time stock data fetching.

### Company Profile
I will use the company profile 2 endpoint to fetch the company profile data, which includes information about the company such as its country, currency, exchange, IPO date, market capitalization, name, phone number, outstanding shares, ticker symbol, website URL, logo, and industry.
```go
type CompanyProfile struct {
	Country          string  `json:"country"`
	Currency         string  `json:"currency"`
	Exchange         string  `json:"exchange"`
	Ipo              string  `json:"ipo"`
	MarketCap        float64 `json:"marketCapitalization"`
	Name             string  `json:"name"`
	Phone            string  `json:"phone"`
	ShareOutstanding float64 `json:"shareOutstanding"`
	Ticker           string  `json:"ticker"`
	WebURL           string  `json:"weburl"`
	Logo             string  `json:"logo"`
	FinnhubIndustry  string  `json:"finnhubIndustry"`
}
```
You can query by symbol, ISIN or CUSIP. This is the free version of Company Profile.

```json
{
  "country": "US",
  "currency": "USD",
  "exchange": "NASDAQ/NMS (GLOBAL MARKET)",
  "ipo": "1980-12-12",
  "marketCapitalization": 1415993,
  "name": "Apple Inc",
  "phone": "14089961010",
  "shareOutstanding": 4375.47998046875,
  "ticker": "AAPL",
  "weburl": "https://www.apple.com/",
  "logo": "https://static.finnhub.io/logo/87cb30d8-80df-11ea-8951-00000000092a.png",
  "finnhubIndustry":"Technology"
}
```

### Basic Financial data
The basic financial data is fetched using the financials1 endpoint, which provides information such as as margin, P/E ratio, 52-week high/low etc.

P/E ratio: The price–earnings ratio, also known as P/E ratio, P/E, or PER, is the ratio of a company's share (stock) price to the company's earnings per share.


```go
type BasicFinancials struct {
	Series struct {
		Annual    map[string][]AnnualData    `json:"annual"`
		Quarterly map[string][]QuarterlyData `json:"quarterly"`
	} `json:"series"`
	Metric map[string]float64 `json:"metric"`
}
```
#### Deeper look at some of the inforation provided byt he basic financial GET endpoint:
```json
{
   "series": {
    "annual": {
      "currentRatio": [
        {
          "period": "2019-09-28",
          "v": 1.5401
        },
        {
          "period": "2018-09-29",
          "v": 1.1329
        }
      ],
      "salesPerShare": [
        {
          "period": "2019-09-28",
          "v": 55.9645
        },
        {
          "period": "2018-09-29",
          "v": 53.1178
        }
      ],
      "netMargin": [
        {
          "period": "2019-09-28",
          "v": 0.2124
        },
        {
          "period": "2018-09-29",
          "v": 0.2241
        }
      ]
    }
  },
  "metric": {
    "10DayAverageTradingVolume": 32.50147,
    "52WeekHigh": 310.43,
    "52WeekLow": 149.22,
    "52WeekLowDate": "2019-01-14",
    "52WeekPriceReturnDaily": 101.96334,
    "beta": 1.2989,
  },
  "metricType": "all",
  "symbol": "AAPL"
}
```

Above is a sample of the basic financial data fetched from the Finnhub API. It includes annual and quarterly data for various financial metrics such as current ratio, sales per share, and net margin, along with other key metrics like 10-day average trading volume, 52-week high/low, and beta.
A look into the metric field:  
| Key                         | Meaning                                                                                                              |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `10DayAverageTradingVolume` | The **average number of shares traded** daily over the last 10 days. High volume suggests high investor interest. |
| `52WeekHigh`                | The **highest price** the stock has reached in the last 52 weeks (1 year).                                        |
| `52WeekLow`                 | The **lowest price** in the last 52 weeks.                                                                        |
| `52WeekLowDate`             | The exact **date** when the 52-week low occurred. Useful for timing.                                              |
| `52WeekPriceReturnDaily`    | **Percentage return** from the price 1 year ago to now. In this case, \~**+102%** in a year — very strong.        |
| `beta`                      | A measure of **volatility relative to the market**.                                                               |