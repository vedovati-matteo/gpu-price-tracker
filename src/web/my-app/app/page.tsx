"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Color utility functions
const getSourceColor = (source) => {
  switch(source) {
    case 'ebay': return '#00FF00'; // Green
    case 'mediaworld': return '#FF0000'; // Red
    case 'hardware-planet': return '#0000FF'; // Blue
    default: return '#000000'; // Black for unknown sources
  }
}

const getProductColor = (productId, source) => {
  const baseColor = getSourceColor(source);
  const productNumber = parseInt(productId.split('-')[1]);
  const opacity = 1 - (productNumber - 1) * 0.2; // 1, 0.8, 0.6, 0.4 for gpu-1 to gpu-4
  return adjustColorOpacity(baseColor, opacity);
}

const adjustColorOpacity = (color, opacity) => {
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export default function Home() {
  const [products, setProducts] = useState([])
  const [sources, setSources] = useState([])
  const [currentPrices, setCurrentPrices] = useState({ date: new Date(), prices: [] })
  const [selectedProduct, setSelectedProduct] = useState('all')
  const [selectedSource, setSelectedSource] = useState('all')
  const [historicalData, setHistoricalData] = useState([])
  const [filteredCurrentPrices, setFilteredCurrentPrices] = useState([])

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      const [productsData, sourcesData, currentPricesData] = await Promise.all([
        fetch('/api/products').then(res => res.json()),
        fetch('/api/sources').then(res => res.json()),
        fetch('/api/prices/current').then(res => res.json())
      ])

      setProducts(productsData)
      setSources(sourcesData)
      setCurrentPrices(currentPricesData)
      setFilteredCurrentPrices(currentPricesData.prices)
    } catch (error) {
      console.error('Error fetching initial data:', error)
    }
  }

  useEffect(() => {
    // Filter current prices based on selected product and source
    const filtered = currentPrices.prices.filter(price => {
      const productMatch = selectedProduct === 'all' || price.productId === selectedProduct
      const sourceMatch = selectedSource === 'all' || price.source === selectedSource
      return productMatch && sourceMatch
    })
    setFilteredCurrentPrices(filtered)
  }, [selectedProduct, selectedSource, currentPrices])

  const fetchHistoricalData = async () => {
    try {
      if (selectedProduct === 'all' && selectedSource === 'all') {
        setHistoricalData([])
        return
      }

      let url
      if (selectedProduct !== 'all') {
        url = `/api/prices/product/${selectedProduct}`
      } else if (selectedSource !== 'all') {
        url = `/api/prices/source/${selectedSource}`
      }

      const data = await fetch(url).then(res => res.json())
      const processedData = processHistoricalData(data)
      setHistoricalData(processedData)
    } catch (error) {
      console.error("Error fetching historical data:", error)
    }
  }

  const processHistoricalData = (data) => {
    if (!data || data.length === 0) return []

    const groupedData = data.reduce((acc, item) => {
      const date = new Date(item.date.$date).toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = {}
      }
      if (selectedProduct !== 'all') {
        acc[date][item.source] = item.price
      } else {
        acc[date][item.productId] = item.price
      }
      return acc
    }, {})

    return Object.entries(groupedData).map(([date, prices]) => ({
      date,
      ...prices
    }))
  }

  useEffect(() => {
    if (selectedProduct || selectedSource) {
      fetchHistoricalData()
    }
  }, [selectedProduct, selectedSource])

  const getChartLines = () => {
    if (selectedProduct !== 'all' && selectedSource !== 'all') {
      return [<Line 
        key={`${selectedProduct}-${selectedSource}`} 
        type="monotone" 
        dataKey={selectedSource} 
        stroke={getProductColor(selectedProduct, selectedSource)} 
        name={`${selectedProduct} - ${selectedSource}`} 
      />];
    } else if (selectedProduct !== 'all') {
      return sources.map((source) => (
        <Line 
          key={source.source} 
          type="monotone" 
          dataKey={source.source} 
          stroke={getSourceColor(source.source)} 
          name={source.source} 
        />
      ));
    } else if (selectedSource !== 'all') {
      return products.map((product) => (
        <Line 
          key={product.productId} 
          type="monotone" 
          dataKey="price" 
          stroke={getProductColor(product.productId, selectedSource)} 
          name={product.name} 
        />
      ));
    }
    return [];
  };

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">GPU Price Tracker</h1>
      
      <Tabs defaultValue="current">
        <TabsList>
          <TabsTrigger value="current">Current Prices</TabsTrigger>
          <TabsTrigger value="historical">Historical Prices</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current">
          <Card>
            <CardHeader>
              <CardTitle>Current GPU Prices ({new Date(currentPrices.date?.$date).toLocaleDateString()})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4 mb-4">
                <Select onValueChange={setSelectedProduct} value={selectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select GPU" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All GPUs</SelectItem>
                    {products.map(product => (
                      <SelectItem key={product.productId} value={product.productId}>{product.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select onValueChange={setSelectedSource} value={selectedSource}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select E-commerce" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All E-commerce</SelectItem>
                    {sources.map(source => (
                      <SelectItem key={source.source} value={source.source}>{source.source}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>GPU</TableHead>
                    <TableHead>E-commerce</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCurrentPrices.map((price, index) => (
                    <TableRow key={index}>
                      <TableCell>{products.find(product => product.productId === price.productId)?.name || 'Unknown GPU'}</TableCell>
                      <TableCell>{price.source}</TableCell>
                      <TableCell>€{price.price}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="historical">
        <Card>
          <CardHeader>
            <CardTitle>Historical Price Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4 mb-4">
              <Select onValueChange={setSelectedProduct} value={selectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Select GPU" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All GPUs</SelectItem>
                  {products.map(product => (
                    <SelectItem key={product.productId} value={product.productId}>{product.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select onValueChange={setSelectedSource} value={selectedSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Select E-commerce" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All E-commerce</SelectItem>
                  {sources.map(source => (
                    <SelectItem key={source.source} value={source.source}>{source.source}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(selectedProduct !== 'all' || selectedSource !== 'all') ? (
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {getChartLines()}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p>Please select a GPU or an E-commerce site to view historical data.</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      </Tabs>
    </main>
  )
}