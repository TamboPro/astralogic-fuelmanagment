'use client'

import dynamic from 'next/dynamic'
import { useState, useMemo } from 'react'

// Import dynamique d'ApexCharts pour éviter les problèmes SSR
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface SalesData {
  x: string
  y: number
  fuelType?: string
}

interface SalesChartProps {
  selectedPeriod: string
  selectedFuel: string
  onPeriodChange: (period: string) => void
  onFuelChange: (fuel: string) => void
  salesData?: SalesData[]
  loading?: boolean
}

export default function SalesChart({ 
  selectedPeriod, 
  selectedFuel, 
  onPeriodChange, 
  onFuelChange,
  salesData = [],
  loading = false
}: SalesChartProps) {
  const [localSalesData, setLocalSalesData] = useState<SalesData[]>([])

  // Initialisation des données
  useMemo(() => {
    if (salesData.length > 0) {
      setLocalSalesData(salesData)
    } else {
      // Données par défaut si aucune donnée n'est fournie
      setLocalSalesData(generateDefaultData())
    }
  }, [salesData])

  const generateDefaultData = () => {
    const baseData = [
      { x: '06:00', y: 150 },
      { x: '07:00', y: 280 },
      { x: '08:00', y: 420 },
      { x: '09:00', y: 380 },
      { x: '10:00', y: 500 },
      { x: '11:00', y: 650 },
      { x: '12:00', y: 720 },
      { x: '13:00', y: 580 },
      { x: '14:00', y: 690 },
      { x: '15:00', y: 820 },
      { x: '16:00', y: 750 },
      { x: '17:00', y: 880 },
      { x: '18:00', y: 920 },
      { x: '19:00', y: 680 },
      { x: '20:00', y: 450 },
      { x: '21:00', y: 280 },
    ]

    const multiplier = selectedFuel === 'essence' ? 0.8 : selectedFuel === 'gazoil' ? 1.2 : selectedFuel === 'petrole' ? 0.6 : 1
    return baseData.map(item => ({
      ...item,
      y: Math.round(item.y * multiplier)
    }))
  }

  // Filtrer les données selon le carburant sélectionné
  const filteredData = useMemo(() => {
    if (selectedFuel === 'all') return localSalesData
    
    return localSalesData.filter(item => 
      item.fuelType === selectedFuel || !item.fuelType
    )
  }, [localSalesData, selectedFuel])

  // Agrégation des données par période
  const aggregatedData = useMemo(() => {
    if (selectedPeriod === 'today') {
      return filteredData
    }

    // Simulation d'agrégation pour les autres périodes
    return filteredData.map(item => ({
      ...item,
      y: Math.round(item.y * (selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 365))
    }))
  }, [filteredData, selectedPeriod])

  const chartOptions = {
    chart: {
      id: 'sales-brush-chart',
      type: 'area' as const,
      height: '100%',
      background: 'transparent',
      toolbar: {
        show: false
      },
      zoom: {
        enabled: true
      },
      selection: {
        enabled: true,
        type: 'x' as const,
        fill: {
          color: '#33a2e5',
          opacity: 0.1
        },
        stroke: {
          color: '#33a2e5'
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth' as const,
      width: 2,
      colors: ['#33a2e5']
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 90, 100],
        colorStops: [
          {
            offset: 0,
            color: '#33a2e5',
            opacity: 0.4
          },
          {
            offset: 100,
            color: '#33a2e5',
            opacity: 0.1
          }
        ]
      }
    },
    grid: {
      borderColor: '#2c3235',
      strokeDashArray: 3
    },
    xaxis: {
      type: 'category' as const,
      labels: {
        style: {
          colors: '#8e9297',
          fontSize: '10px'
        }
      },
      axisBorder: {
        color: '#2c3235'
      },
      axisTicks: {
        color: '#2c3235'
      }
    },
    yaxis: {
      title: {
        text: 'Litres vendus',
        style: {
          color: '#8e9297',
          fontSize: '10px'
        }
      },
      labels: {
        style: {
          colors: '#8e9297',
          fontSize: '10px'
        },
        formatter: (value: number) => `${value}L`
      }
    },
    tooltip: {
      theme: 'dark',
      style: {
        fontSize: '10px'
      },
      x: {
        formatter: (value: number, { seriesIndex, dataPointIndex, w }: any) => {
          if (selectedPeriod === 'today') {
            return w.globals.categoryLabels[dataPointIndex] || value.toString();
          }
          return `Jour ${value}`
        }
      },
      y: {
        formatter: (value: number) => `${value} litres`
      },
      marker: {
        show: true
      }
    },
    legend: {
      show: false
    }
  }

  const chartSeries = [
    {
      name: 'Ventes',
      data: aggregatedData
    }
  ]

  if (loading) {
    return (
      <div className="flex-1 bg-[#202226] rounded-[0.5px] border border-[#2c3235] flex flex-col">
        <div className="h-8 flex items-center justify-between bg-[#25292d] border-b border-[#2c3235] px-4">
          <span className="text-[#c7d0d9] text-xs flex-1">
            Evolution des ventes
          </span>
          <div className="flex items-center space-x-2">
            <div className="bg-[#2c3235] border border-[#3a3f47] rounded px-2 py-1 h-7 w-20 animate-pulse" />
            <div className="bg-[#2c3235] border border-[#3a3f47] rounded px-2 py-1 h-7 w-24 animate-pulse" />
          </div>
        </div>
        <div className="flex-1 p-2 bg-[#2c3235] animate-pulse rounded" />
      </div>
    )
  }

  return (
    <div className="flex-1 bg-[#202226] rounded-[0.5px] border border-[#2c3235] flex flex-col">
      {/* Header personnalisé avec titre et sélecteurs */}
      <div className="h-8 flex items-center justify-between bg-[#25292d] border-b border-[#2c3235] px-4">
        {/* Titre à gauche */}
        <span className="text-[#c7d0d9] text-xs flex-1">
          Evolution des ventes
        </span>
        
        {/* Sélecteurs à droite */}
        <div className="flex items-center space-x-2">
          {/* Selectbox pour la période */}
          <select 
            value={selectedPeriod}
            onChange={(e) => onPeriodChange(e.target.value)}
            className="bg-[#2c3235] border border-[#3a3f47] text-[#c7d0d9] text-xs rounded px-2 py-1 h-7 focus:outline-none focus:ring-1 focus:ring-[#33a2e5]"
            disabled={loading}
          >
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="year">Cette année</option>
          </select>

          {/* Selectbox pour le type de carburant */}
          <select 
            value={selectedFuel}
            onChange={(e) => onFuelChange(e.target.value)}
            className="bg-[#2c3235] border border-[#3a3f47] text-[#c7d0d9] text-xs rounded px-2 py-1 h-7 focus:outline-none focus:ring-1 focus:ring-[#33a2e5]"
            disabled={loading}
          >
            <option value="all">Tous carburants</option>
            <option value="essence">Essence</option>
            <option value="gazoil">Gazoil</option>
            <option value="petrole">Pétrole</option>
          </select>
        </div>
      </div>
      
      {/* Body - Chart ApexCharts */}
      <div className="flex-1 p-2">
        {aggregatedData.length > 0 ? (
          <Chart
            options={chartOptions}
            series={chartSeries}
            type="area"
            height="100%"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-[#8e9297] text-sm">
            Aucune donnée de vente disponible
          </div>
        )}
      </div>
    </div>
  )
}