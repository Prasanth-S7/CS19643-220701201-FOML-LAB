"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, TrendingDown, Loader2, ExternalLink, BarChart3, CandlestickChart, Coins } from "lucide-react"
import { TokenIcon } from '@web3icons/react'
import { Button } from "@/components/ui/button"

// Supported tokens matching your backend
const SUPPORTED_TOKENS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", color: "#F7931A", icon: "btc" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", color: "#627EEA", icon: "eth" },
  { id: "solana", symbol: "SOL", name: "Solana", color: "#00FFBD", icon: "sol" },
  { id: "cardano", symbol: "ADA", name: "Cardano", color: "#0033AD", icon: "ada" },
  { id: "ripple", symbol: "XRP", name: "Ripple", color: "#23292F", icon: "xrp" },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin", color: "#C3A634", icon: "doge" },
  { id: "polkadot", symbol: "DOT", name: "Polkadot", color: "#E6007A", icon: "dot" },
  { id: "avalanche-2", symbol: "AVAX", name: "Avalanche", color: "#E84142", icon: "avax" },
  { id: "matic-network", symbol: "MATIC", name: "Polygon", color: "#8247E5", icon: "matic" },
  { id: "chainlink", symbol: "LINK", name: "Chainlink", color: "#2A5ADA", icon: "link" },
]

const Index = () => {
  const [selectedToken, setSelectedToken] = useState(null)
  const [predictionData, setPredictionData] = useState(null)
  const [priceHistory, setPriceHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("all-coins")

  const fetchTokenPrediction = async (tokenId) => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:5000/predict?token=${tokenId}`)
      const data = await response.json()

      if (data.error) throw new Error(data.error)

      // Format data for chart
      const history = Array.from({ length: 30 }, (_, i) => ({
        day: `Day -${30 - i}`,
        price: 0, // We'll fill this from another API
      }))

      const predictions = data.next_5_days.map((price, i) => ({
        day: `Day +${i + 1}`,
        price: price,
        predicted: true,
      }))

      setPredictionData(data)
      setPriceHistory([...history, ...predictions])

      setTimeout(() => {
        const mockHistory = history.map((item, i) => ({
          ...item,
          price: data.next_5_days[0] * (0.95 + (i / 30) * 0.1), // Mock trend
        }))
        setPriceHistory([...mockHistory, ...predictions])
      }, 500)
    } catch (error) {
      console.error("Prediction error:", error)
      alert(`Prediction failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handlePredict = (token) => {
    setSelectedToken(token)
    fetchTokenPrediction(token.id)
  }

  const openMarket = (symbol) => {
    window.open(`https://www.binance.com/en/trade/${symbol}_USDT`, '_blank')
  }

  useEffect(() => {
    if (selectedToken) {
      fetchTokenPrediction(selectedToken.id)
      setActiveTab("predictions")
    }
  }, [selectedToken])

  return (
    <div className="min-h-screen bg-black text-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="flex items-center gap-3 w-full">
            {/* <div className="bg-black p-2 rounded-lg">
              <CandlestickChart className="h-8 w-8 text-white" />
            </div> */}
            <h1 className="text-5xl text-center font-bold md:text-4xl w-full font-primary text-white ">
            TokenTrend – Multi-Asset Crypto Forecasting
            </h1>
          </div>
          <Badge variant="outline" className="absolute right-10 bottom-5 mt-2 md:mt-0 border text-white border-white/10 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-red-500 bg-animate-pulse mr-2"></span>
            LIVE PREDICTIONS
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 bg-black border border-white/10 rounded-xl">
            <TabsTrigger
              value="all-coins"
              className="rounded-l-lg data-[state=active]:bg-gradient-to-r data-[state=active]:bg-gray-900 data-[state=active]:text-white text-white"
            >
              <Coins className="h-4 w-4 mr-2" />
              All Coins
            </TabsTrigger>
            <TabsTrigger
              value="predictions"
              className="rounded-l-lg data-[state=active]:bg-gradient-to-r data-[state=active]:bg-gray-900 data-[state=active]:text-white text-white"
              disabled={!selectedToken}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Predictions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all-coins" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {SUPPORTED_TOKENS.map((token) => (
                <Card
                  key={token.id}
                  className="bg-[#050505] h-56 transition-all cursor-pointer border-white/[0.1] text-white rounded-none flex flex-col py-0"
                  onClick={() => setSelectedToken(token)}
                >
                  <CardContent className="p-0 flex flex-col h-full">
                    <div className="flex items-center justify-center flex-grow gap-4">
                      <TokenIcon symbol={token.icon} variant="branded" size="54" color="#FFFFFF" />
                      <div>
                        <h3 className="font-primary text-lg text-center">{token.name}</h3>
                        <p className="text-sm text-slate-400 text-center">{token.symbol}</p>
                      </div>
                    </div>

                    <div className="flex justify-between cursor-pointer">
                      <Button className="w-1/2 h-10 py-6 bg-black border border-l-0 border-white/10 rounded-none" onClick={() => openMarket(token.symbol)}>Current Price</Button>
                      <Button className="w-1/2 h-10 py-6 bg-black border border-r-0 border-white/10 rounded-none"  onClick={() => handlePredict(token)}>Predict</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="predictions" className="mt-0">
            {loading ? (
              <div className="flex justify-center items-center h-96">
                <div className="text-center">
                  <Loader2 className="h-16 w-16 animate-spin text-teal-500 mx-auto mb-4" />
                  <p className="text-slate-400">Analyzing market data...</p>
                </div>
              </div>
            ) : selectedToken && predictionData ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-black border-white/10 text-white overflow-hidden">
                    <div className="h-2 w-full"></div>
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <Avatar className="h-16 w-16 mr-4 border-2 border-slate-600">
                          <AvatarFallback
                            className="text-lg font-primary"
                            style={{ backgroundColor: selectedToken.color + "33", color: selectedToken.color }}
                          >
                            {selectedToken.symbol.slice(0, 3)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h2 className="text-2xl font-primary">{selectedToken.name}</h2>
                          <p className="text-slate-400">{selectedToken.symbol}</p>
                        </div>
                      </div>
                      <Separator className="bg-slate-700 my-4" />
                      <div className="mt-4">
                        <h3 className="text-lg font-primary mb-3 text-teal-400">Next 5 Days Prediction</h3>
                        <div className="grid grid-cols-5 gap-2">
                          {predictionData.next_5_days.map((price, i) => {
                            const prevPrice =
                              i > 0
                                ? predictionData.next_5_days[i - 1]
                                : priceHistory[priceHistory.length - 6]?.price || price
                            const change = ((price - prevPrice) / prevPrice) * 100
                            const isUp = change >= 0

                            return (
                              <div
                                key={i}
                                className={`${isUp ? "bg-teal-500/10 border-teal-500/30" : "bg-rose-500/10 border-rose-500/30"} 
                                  px-3 py-3 border text-center`}
                              >
                                <p className="text-sm text-slate-300 mb-1">Day {i + 1}</p>
                                <p className="font-primary text-lg">${price.toFixed(2)}</p>
                                <p
                                  className={`text-xs mt-1 flex items-center justify-center ${isUp ? "text-teal-400" : "text-rose-400"}`}
                                >
                                  {isUp ? (
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                  ) : (
                                    <TrendingDown className="h-3 w-3 mr-1" />
                                  )}
                                  {change.toFixed(2)}%
                                </p>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black border border-white/10 overflow-hidden">
                    <div className="h-2 w-full"></div>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-primary mb-4 text-teal-400">Prediction Trend</h3>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={priceHistory}>
                            <CartesianGrid strokeDasharray="1 1" stroke="#334155" />
                            <XAxis dataKey="day" stroke="#94A3B8" tick={{ fontSize: 12 }} />
                            <YAxis stroke="#94A3B8" tickFormatter={(value) => `$${value}`} />
                            <Tooltip
                              contentStyle={{ backgroundColor: "#1E293B", borderColor: "#475569", borderRadius: "8px" }}
                              formatter={(value) => [`$${value}`, "Price"]}
                              labelStyle={{ color: "#E2E8F0" }}
                            />
                            <Line
                              type="monotone"
                              dataKey="price"
                              stroke={selectedToken.color || "#14B8A6"}
                              strokeWidth={3}
                              dot={{ r: 4, strokeWidth: 2, fill: "#0F172A" }}
                              activeDot={{ r: 6, stroke: "#E2E8F0", strokeWidth: 2 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-black border-white/10 overflow-hidden">
                  <div className="h-2 w-full"></div>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-primary mb-4 text-teal-400">Detailed Prediction Analysis</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-white font-primary">
                            <th className="py-3 px-4 text-left font-primary">Day</th>
                            <th className="py-3 px-4 text-right  font-primary">Predicted Price</th>
                            <th className="py-3 px-4 text-right font-primary">Change</th>
                            <th className="py-3 px-4 text-right font-primary">Trend</th>
                            <th className="py-3 px-4 text-right font-primary">Confidence</th>
                          </tr>
                        </thead>
                        <tbody>
                          {predictionData.next_5_days.map((price, i) => {
                            const prevPrice =
                              i > 0
                                ? predictionData.next_5_days[i - 1]
                                : priceHistory[priceHistory.length - 6]?.price || price
                            const change = ((price - prevPrice) / prevPrice) * 100
                            const isUp = change >= 0
                            // Mock confidence level that decreases with time
                            const confidence = Math.max(95 - i * 5, 75)

                            return (
                              <tr
                                key={i}
                                className="border-b border-slate-700/50 last:border-0 hover:bg-slate-700/20 transition-colors"
                              >
                                <td className="py-4 px-4 text-slate-200 font-primary">Day {i + 1}</td>
                                <td className="py-4 px-4 text-right font-primary text-white">${price.toFixed(2)}</td>
                                <td
                                  className={`py-4 px-4 text-right font-primary ${isUp ? "text-teal-400" : "text-rose-400"}`}
                                >
                                  {isUp ? "+" : ""}
                                  {change.toFixed(2)}%
                                </td>
                                <td className="py-4 px-4 text-right">
                                  {isUp ? (
                                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-teal-500/20">
                                      <TrendingUp className="h-4 w-4 text-teal-400" />
                                    </div>
                                  ) : (
                                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-rose-500/20">
                                      <TrendingDown className="h-4 w-4 text-rose-400" />
                                    </div>
                                  )}
                                </td>
                                <td className="py-4 px-4 text-right">
                                  <div className="w-full bg-slate-700 rounded-full h-2.5 max-w-[100px] ml-auto">
                                    <div
                                      className="h-2.5 rounded-full bg-gradient-to-r from-teal-500 to-violet-500"
                                      style={{ width: `${confidence}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs text-slate-400 mt-1 block">{confidence}%</span>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 overflow-hidden">
                <div className="h-2 w-full bg-gradient-to-r from-teal-500 to-violet-500"></div>
                <CardContent className="p-8 text-center">
                  <div className="mx-auto max-w-md py-8">
                    <div className="bg-slate-700/30 p-6 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                      <CandlestickChart className="h-10 w-10 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-primary mb-3">No Token Selected</h3>
                    <p className="text-slate-400 mb-6">
                      Select a cryptocurrency from the list to view price predictions and analysis
                    </p>
                    <button
                      onClick={() => setActiveTab("all-coins")}
                      className="px-6 py-3 bg-gradient-to-r from-teal-500 to-violet-500 hover:from-teal-600 hover:to-violet-600 rounded-lg font-primary text-white shadow-lg shadow-teal-500/20 transition-all hover:shadow-teal-500/30"
                    >
                      Browse Tokens
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default Index
