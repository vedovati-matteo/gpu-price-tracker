"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Button } from '@/components/ui/button'
import { RefreshCw, ArrowUpDown } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortColumn, setSortColumn] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')
  const [selectedCondition, setSelectedCondition] = useState('all')

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [productsData, sourcesData, currentPricesData] = await Promise.all([
        fetch('/api/next/products', { cache: 'no-store' }).then(res => res.json()),
        fetch('/api/next/sources', { cache: 'no-store' }).then(res => res.json()),
        fetch('/api/next/prices/current', { cache: 'no-store' }).then(res => res.json())
      ])
      setProducts(productsData)
      setSources(sourcesData)
      setCurrentPrices(currentPricesData)
      setFilteredCurrentPrices(currentPricesData.prices || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to fetch data. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchHistoricalData = useCallback(async () => {
    if (selectedProduct === 'all' && selectedSource === 'all') {
      setHistoricalData([])
      return
    }

    setIsLoading(true)
    try {
      let url = selectedProduct !== 'all'
        ? `/api/next/prices/product/${selectedProduct}`
        : `/api/next/prices/source/${selectedSource}`

      const data = await fetch(url, { cache: 'no-store' }).then(res => res.json())
      const processedData = processHistoricalData(data)
      setHistoricalData(processedData)
    } catch (error) {
      console.error("Error fetching historical data:", error)
      setError('Failed to fetch historical data. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }, [selectedProduct, selectedSource])

  useEffect(() => {
    if (selectedProduct || selectedSource) {
      fetchHistoricalData()
    }
  }, [selectedProduct, selectedSource, fetchHistoricalData])

  const processHistoricalData = (data) => {
    if (!data || data.length === 0) return [];
  
    // Group data by date
    const groupedData = data.reduce((acc, item) => {
      const date = new Date(item.date).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {};
      }
      if (selectedProduct !== 'all') {
        acc[date][item.source] = item.price;
      } else {
        acc[date][item.productId] = item.price;
      }
      return acc;
    }, {});
  
    // Convert grouped data to array and sort by date
    const sortedData = Object.entries(groupedData)
      .map(([date, prices]) => ({ date, ...prices }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  
    return sortedData;
  };

  const getChartLines = () => {
    if (selectedProduct !== 'all' && selectedSource !== 'all') {
      return [<Line 
        key={`${selectedProduct}-${selectedSource}`} 
        type="monotone" 
        dataKey={selectedSource} 
        stroke={getProductColor(selectedProduct, selectedSource)} 
        name={`${selectedProduct} - ${selectedSource}`} 
        connectNulls={true}
      />];
    } else if (selectedProduct !== 'all') {
      return sources.map((source) => (
        <Line 
          key={source.source} 
          type="monotone" 
          dataKey={source.source} 
          stroke={getSourceColor(source.source)} 
          name={source.source} 
          connectNulls={true}
        />
      ));
    } else if (selectedSource !== 'all') {
      return products.map((product) => (
        <Line 
          key={product.productId} 
          type="monotone" 
          dataKey={product.productId} 
          stroke={getProductColor(product.productId, selectedSource)} 
          name={product.name} 
          connectNulls={true}
        />
      ));
    }
    return [];
  };

  const sortData = useCallback((data, column, direction) => {
    return [...data].sort((a, b) => {
      if (column === 'name') {
        const nameA = a.name || ''; // Provide a default value if name is undefined
        const nameB = b.name || ''; // Provide a default value if name is undefined
        return direction === 'asc' 
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      } else if (column === 'price') {
        return direction === 'asc' 
          ? (a.price || 0) - (b.price || 0)  // Ensure undefined prices don't break sorting
          : (b.price || 0) - (a.price || 0);
      }
      return 0;
    });
  }, []);

  useEffect(() => {
    if (currentPrices.prices) {
      const filtered = currentPrices.prices.filter(price => {
        const productMatch = selectedProduct === 'all' || price.productId === selectedProduct
        const sourceMatch = selectedSource === 'all' || price.source === selectedSource
        const conditionMatch = selectedCondition === 'all' || price.condition === selectedCondition
        return productMatch && sourceMatch && conditionMatch
      })
      const sorted = sortData(filtered, sortColumn, sortDirection)
      setFilteredCurrentPrices(sorted)
    }
  }, [selectedProduct, selectedSource, selectedCondition, currentPrices, sortColumn, sortDirection, sortData])

  const handleSort = (column) => {
    setSortColumn(column)
    setSortDirection(sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc')
  }

  const handleRefresh = () => {
    fetchData()
    if (selectedProduct !== 'all' || selectedSource !== 'all') {
      fetchHistoricalData()
    }
  }

  const handleProductClick = (href) => {
    if (href) {
      window.open(href, '_blank', 'noopener,noreferrer')
    }
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <main className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">GPU Price Tracker</h1>
        <Button onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh Data
        </Button>
      </div>
      
      <Tabs defaultValue="current">
        <TabsList>
          <TabsTrigger value="current">Current Prices</TabsTrigger>
          <TabsTrigger value="historical">Historical Prices</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current">
          <Card>
            <CardHeader>
              <CardTitle>Current GPU Prices ({new Date(currentPrices.date).toLocaleDateString()})</CardTitle>
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
                <ToggleGroup type="single" value={selectedCondition} onValueChange={(value) => setSelectedCondition(value || 'all')}>
                  <ToggleGroupItem value="all">All</ToggleGroupItem>
                  <ToggleGroupItem value="new">New</ToggleGroupItem>
                  <ToggleGroupItem value="used">Used</ToggleGroupItem>
                </ToggleGroup>
              </div>
              {isLoading ? (
                <p>Loading current prices...</p>
              ) : filteredCurrentPrices.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button variant="ghost" onClick={() => handleSort('name')}>
                          GPU <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>E-commerce</TableHead>
                      <TableHead>
                        <Button variant="ghost" onClick={() => handleSort('price')}>
                          Price <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Condition</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCurrentPrices.map((price, index) => (
                      <TableRow 
                        key={index} 
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => handleProductClick(price.href)}
                      >
                        <TableCell>{price.name || 'Unknown GPU'}</TableCell>
                        <TableCell>{price.source}</TableCell>
                        <TableCell>€{price.price}</TableCell>
                        <TableCell>{price.condition}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p>No data available for the selected filters.</p>
              )}
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
              isLoading ? (
                <p>Loading historical data...</p>
              ) : historicalData.length > 0 ? (
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
                <p>No historical data available for the selected filters.</p>
              )
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