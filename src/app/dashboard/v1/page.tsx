'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Draggable from 'react-draggable'
import { Resizable } from 'react-resizable'
import 'react-resizable/css/styles.css'
import dynamic from 'next/dynamic'
import {
  LayoutDashboard,
  Upload,
  Download,
  Settings,
  Cpu,
  UserCircle,
  Settings2,
  Construction,
  PanelTop,
  PanelTopClose,
  Radio,
  ChevronDown,
  RefreshCw,
  Clock,
  Zap,
  X,
  Gauge,
  Image,
  Map,
  Type,
  BarChart2,
  LineChart,
  PieChart,
  Disc,
  BoxSelect,
} from 'lucide-react'
import { GeistSans } from 'geist/font'

// Dynamically import ApexCharts to avoid SSR issues
const ApexCharts = dynamic(() => import('react-apexcharts'), { ssr: false })

type Position = { x: number; y: number }
type Size = { width: number; height: number }

type TextPosition = 'hg' | 'hc' | 'hd' | 'cg' | 'c' | 'cd' | 'bg' | 'bc' | 'bd'

type TextContent = {
  [key in TextPosition]?: {
    text: string
    fontSize: number
    color: string
  }
}

type CardData = {
  id: string
  position: Position
  size: Size
  hasBackground: boolean
  content: {
    type: 'gauge' | 'image' | 'map' | 'text' | 'bar' | 'line' | 'pie' | 'radialBar' | null
    subtype?: string
    data: any
    textContent?: TextContent // Nouveau champ pour stocker les textes positionnés
  }
}

type RefreshFrequency = {
  label: string
  value: string
  ms: number
}

// Chart configuration presets
const chartPresets = {
  radialBar: {
    basic: {
      series: [70],
      options: {
        chart: {
          type: 'radialBar',
        },
        plotOptions: {
          radialBar: {
            hollow: {
              size: '70%',
            }
          }
        },
        labels: ['Basic Radial']
      }
    },
    gradient: {
      series: [75],
      options: {
        chart: {
          type: 'radialBar',
        },
        plotOptions: {
          radialBar: {
            hollow: {
              size: '70%',
            },
            dataLabels: {
              name: {
                show: false,
              },
              value: {
                fontSize: '30px',
                show: true
              }
            }
          }
        },
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'dark',
            type: 'horizontal',
            gradientToColors: ['#33a2e5'],
            stops: [0, 100]
          }
        },
        labels: ['Gradient Circle']
      }
    },
    stroked: {
      series: [80],
      options: {
        chart: {
          type: 'radialBar',
        },
        plotOptions: {
          radialBar: {
            startAngle: -135,
            endAngle: 135,
            hollow: {
              margin: 0,
              size: '70%',
            },
            track: {
              background: '#2c3235',
              strokeWidth: '97%',
              margin: 5,
            },
            dataLabels: {
              name: {
                show: false,
              },
              value: {
                offsetY: -10,
                fontSize: '22px'
              }
            }
          }
        },
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'dark',
            shadeIntensity: 0.15,
            inverseColors: false,
            opacityFrom: 1,
            opacityTo: 1,
            stops: [0, 50, 65, 91]
          },
        },
        stroke: {
          dashArray: 4
        },
        labels: ['Stroked Gauge']
      }
    },
    semi: {
      series: [76],
      options: {
        chart: {
          type: 'radialBar',
          offsetY: -20,
        },
        plotOptions: {
          radialBar: {
            startAngle: -90,
            endAngle: 90,
            hollow: {
              size: '60%',
            },
            dataLabels: {
              name: {
                offsetY: -10,
              },
              value: {
                fontSize: '24px',
                offsetY: -20,
              },
              total: {
                show: true,
                label: 'Total',
                color: '#c7d0d9',
                formatter: function (w: any) {
                  return '79%'
                }
              }
            }
          }
        },
        labels: ['Semi Circle']
      }
    }
  },
  line: {
    basic: {
      series: [{
        name: 'Series 1',
        data: [30, 40, 45, 50, 49, 60, 70, 91]
      }],
      options: {
        chart: {
          zoom: {
            enabled: false
          }
        },
        stroke: {
          curve: 'straight'
        },
        xaxis: {
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
        }
      }
    },
    zoomable: {
      series: [{
        name: 'Series 1',
        data: [30, 40, 45, 50, 49, 60, 70, 91, 80, 75, 82, 90]
      }],
      options: {
        chart: {
          zoom: {
            enabled: true,
            type: 'x',
            autoScaleYaxis: true
          }
        },
        xaxis: {
          type: 'datetime',
          categories: [
            '01/01/2023', '02/01/2023', '03/01/2023', '04/01/2023',
            '05/01/2023', '06/01/2023', '07/01/2023', '08/01/2023',
            '09/01/2023', '10/01/2023', '11/01/2023', '12/01/2023'
          ]
        }
      }
    },
    annotations: {
      series: [{
        name: 'Series 1',
        data: [30, 40, 45, 50, 49, 60, 70, 91]
      }],
      options: {
        annotations: {
          points: [{
            x: 'Mar',
            y: 45,
            marker: {
              size: 8,
              fillColor: '#33a2e5',
              strokeColor: '#fff',
              strokeWidth: 2
            },
            label: {
              text: 'Point Annotation',
              offsetY: 0,
              style: {
                color: '#fff',
                background: '#33a2e5'
              }
            }
          }],
          yaxis: [{
            y: 50,
            borderColor: '#00E396',
            label: {
              text: 'Y-axis Annotation',
              style: {
                color: '#fff',
                background: '#00E396'
              }
            }
          }]
        },
        xaxis: {
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
        }
      }
    },
    brush: {
      series: [{
        name: 'Series 1',
        data: [30, 40, 45, 50, 49, 60, 70, 91, 80, 75, 82, 90]
      }],
      options: {
        chart: {
          brush: {
            enabled: true,
            target: 'chart1'
          }
        },
        xaxis: {
          type: 'datetime',
          categories: [
            '01/01/2023', '02/01/2023', '03/01/2023', '04/01/2023',
            '05/01/2023', '06/01/2023', '07/01/2023', '08/01/2023',
            '09/01/2023', '10/01/2023', '11/01/2023', '12/01/2023'
          ]
        }
      }
    },
    realtime: {
      series: [{
        name: 'Realtime',
        data: []
      }],
      options: {
        chart: {
          animations: {
            enabled: true,
            easing: 'linear',
            dynamicAnimation: {
              speed: 1000
            }
          },
          toolbar: {
            show: false
          }
        },
        xaxis: {
          type: 'datetime',
          range: 60000 // 1 minute
        }
      }
    }
  },
  bar: {
    basic: {
      series: [{
        name: 'Series 1',
        data: [30, 40, 45, 50, 49, 60, 70, 91]
      }],
      options: {
        chart: {
          type: 'bar'
        },
        xaxis: {
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
        }
      }
    }
  },
  pie: {
    basic: {
      series: [44, 55, 13, 43, 22],
      options: {
        chart: {
          type: 'pie'
        },
        labels: ['Team A', 'Team B', 'Team C', 'Team D', 'Team E']
      }
    }
  }
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [cards, setCards] = useState<CardData[]>([])
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0
  })
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null)
  const [showCardModal, setShowCardModal] = useState(false)
  const [refreshFrequency, setRefreshFrequency] = useState<RefreshFrequency>({
    label: 'Temps réel',
    value: 'realtime',
    ms: 100
  })
  const [showFrequencyDropdown, setShowFrequencyDropdown] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const refreshFrequencies: RefreshFrequency[] = [
    { label: 'Temps réel', value: 'realtime', ms: 100 },
    { label: '100ms', value: '100ms', ms: 100 },
    { label: '1s', value: '1s', ms: 1000 },
    { label: '2s', value: '2s', ms: 2000 },
    { label: '5s', value: '5s', ms: 5000 },
    { label: '10s', value: '10s', ms: 10000 },
    { label: '30s', value: '30s', ms: 30000 },
    { label: '1 min', value: '1min', ms: 60000 },
    { label: '5 min', value: '5min', ms: 300000 },
    { label: '1 heure', value: '1h', ms: 3600000 }
  ]

  // Initialize realtime data for charts
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      setCards(prevCards => {
        return prevCards.map(card => {
          if (card.content.type === 'line' && card.content.subtype === 'realtime') {
            const now = new Date()
            const newData = [...(card.content.data.series[0].data as { x: number, y: number }[])]
            const newValue = Math.floor(Math.random() * 100)

            if (newData.length > 10) {
              newData.shift()
            }

            newData.push({
              x: now.getTime(),
              y: newValue
            })

            return {
              ...card,
              content: {
                ...card.content,
                data: {
                  ...card.content.data,
                  series: [{
                    name: 'Realtime',
                    data: newData
                  }]
                }
              }
            }
          }
          return card
        })
      })
    }, refreshFrequency.ms)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshFrequency.ms])

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const result = event.target?.result
        if (typeof result === 'string') {
          const data = JSON.parse(result)
          if (data.cards && Array.isArray(data.cards)) {
            const validCards = data.cards.filter((card: any) =>
              card.id &&
              card.position && typeof card.position.x === 'number' && typeof card.position.y === 'number' &&
              card.size && typeof card.size.width === 'number' && typeof card.size.height === 'number' &&
              typeof card.hasBackground === 'boolean'
            )
            setCards(validCards)
          }
        }
      } catch (error) {
        console.error('Error parsing JSON file:', error)
        alert('Invalid file format')
      }
    }
    reader.readAsText(file)
    if (e.target) e.target.value = ''
  }

  const handleDownload = () => {
    const dashboardData = {
      version: '1.0',
      cards: cards,
      savedAt: new Date().toISOString()
    }

    const jsonData = JSON.stringify(dashboardData, null, 2)
    const blob = new Blob([jsonData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dashboard-config-${new Date().toISOString().slice(0, 10)}.json`

    document.body.appendChild(a)
    a.click()

    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const menuItems = {
    top: [
      { id: 'Dashboard', icon: LayoutDashboard, path: 'dashboard' },
      { id: 'Réglages', icon: Settings2, path: 'reglages' },
      { id: 'Construction', icon: Construction, path: 'construction' },
      { id: 'Upload', icon: Upload, action: handleUploadClick },
      { id: 'Download', icon: Download, action: handleDownload },
    ],
    bottom: [
      { id: 'Microcontrôleur', icon: Cpu, path: 'microcontroleur' },
      { id: 'Paramètres', icon: Settings, path: 'parametres' },
      { id: 'Compte', icon: UserCircle, path: 'compte' },
    ]
  }

  const getActiveItem = (): string => {
    const path = pathname.split('/').pop() || 'dashboard'
    const foundItem = menuItems.top.concat(menuItems.bottom).find(item =>
      item.id.toLowerCase() === path.toLowerCase()
    )
    return foundItem?.id || 'Dashboard'
  }

  const [activeItem, setActiveItem] = useState(getActiveItem())

  useEffect(() => {
    setActiveItem(getActiveItem())
  }, [pathname])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowFrequencyDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY
    })
  }

  const isPositionValid = (newPos: Position, newSize: Size, ignoreId?: string) => {
    return !cards.some(card => {
      if (card.id === ignoreId) return false
      return !(
        newPos.x + newSize.width + 0.5 <= card.position.x ||
        newPos.x >= card.position.x + card.size.width + 0.5 ||
        newPos.y + newSize.height + 0.5 <= card.position.y ||
        newPos.y >= card.position.y + card.size.height + 0.5
      )
    })
  }

  const findValidPosition = (size: Size) => {
    let x = contextMenu.x - 50
    let y = contextMenu.y - 50
    let attempts = 0
    const maxAttempts = 100

    while (attempts < maxAttempts) {
      if (isPositionValid({ x, y }, size)) {
        return { x, y }
      }

      x += 20
      y += 20
      attempts++

      if (x > window.innerWidth - size.width) {
        x = 10
        y += 50
      }
    }

    return { x: contextMenu.x - 50, y: contextMenu.y - 50 }
  }

  const addCard = (hasBackground: boolean) => {
    const size = { width: 200, height: 200 }
    const position = findValidPosition(size)

    const newCard = {
      id: `card-${Date.now()}`,
      position,
      size,
      hasBackground,
      content: {
        type: null,
        data: null
      }
    }
    setCards([...cards, newCard])
    setContextMenu({ ...contextMenu, visible: false })
  }

  const updateCardPosition = (id: string, newPosition: Position) => {
    const cardIndex = cards.findIndex(card => card.id === id)
    if (cardIndex === -1) return false

    const card = cards[cardIndex]

    if (isPositionValid(newPosition, card.size, id)) {
      const newCards = [...cards]
      newCards[cardIndex] = { ...card, position: newPosition }
      setCards(newCards)
      return true
    }
    return false
  }

  const updateCardContent = (id: string, content: any) => {
    const cardIndex = cards.findIndex(card => card.id === id)
    if (cardIndex === -1) return

    const newCards = [...cards]
    newCards[cardIndex] = {
      ...newCards[cardIndex],
      content
    }
    setCards(newCards)
  }

  const handleClickOutside = () => {
    if (contextMenu.visible) {
      setContextMenu({ ...contextMenu, visible: false })
    }
  }

  useEffect(() => {
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [contextMenu])

  const navigateTo = (path: string) => {
    router.push(`/pages/${path.toLowerCase()}`)
  }

  const handleFrequencySelect = (frequency: RefreshFrequency) => {
    setRefreshFrequency(frequency)
    setShowFrequencyDropdown(false)
  }

  const handleCardDoubleClick = (card: CardData) => {
    setSelectedCard(card)
    setShowCardModal(true)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      if (selectedCard) {
        updateCardContent(selectedCard.id, {
          type: 'image',
          data: {
            src: event.target?.result as string,
            alt: file.name
          }
        })
      }
    }
    reader.readAsDataURL(file)
    if (e.target) e.target.value = ''
  }

  const handleContentTypeChange = (type: CardData['content']['type'], subtype?: string) => {
    if (!selectedCard) return

    let initialData = null
    let initialTextContent = undefined

    if (type === 'gauge') {
      initialData = {
        value: 50,
        min: 0,
        max: 100,
        label: 'Gauge'
      }
    } else if (type === 'text') {
      initialTextContent = {} // Initialisation pour les 9 zones de texte
    } else if (type === 'bar' || type === 'line' || type === 'pie' || type === 'radialBar') {
      const chartType = type as keyof typeof chartPresets
      if (subtype && chartPresets[chartType] && (chartPresets[chartType] as any)[subtype]) {
        initialData = (chartPresets[chartType] as any)[subtype]
      } else {
        initialData = {
          series: [{
            name: 'Series 1',
            data: [30, 40, 45, 50, 49, 60, 70, 91]
          }],
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
        }
      }
    } else if (type === 'map') {
      initialData = {
        location: 'Paris, France',
        zoom: 10
      }
    }

    updateCardContent(selectedCard.id, {
      type,
      subtype,
      data: initialData,
      textContent: initialTextContent,
    })
  }

  const updateTextContent = (position: TextPosition, field: string, value: string | number) => {
    if (!selectedCard) return

    const newTextContent = {
      ...selectedCard.content.textContent,
      [position]: {
        ...selectedCard.content.textContent?.[position],
        [field]: value
      }
    }

    updateCardContent(selectedCard.id, {
      ...selectedCard.content,
      textContent: newTextContent
    })
  }

  const renderCardContent = (card: CardData) => {
    if (!card.content.type) return null

    switch (card.content.type) {
      case 'gauge':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <div className="text-lg font-medium mb-2">{card.content.data.label}</div>
            <div className="text-3xl font-bold">
              {card.content.data.value}%
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5 mt-4">
              <div
                className="bg-[#33a2e5] h-2.5 rounded-full"
                style={{ width: `${card.content.data.value}%` }}
              ></div>
            </div>
            <div className="flex justify-between w-full text-xs mt-1">
              <span>{card.content.data.min}</span>
              <span>{card.content.data.max}</span>
            </div>
          </div>
        )
      case 'image':
        return (
          <div className="w-full h-full flex items-center justify-center overflow-hidden">
            {card.content.data?.src ? (
              <img
                src={card.content.data.src}
                alt={card.content.data.alt || 'Image'}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-gray-500">No image selected</div>
            )}
          </div>
        )
      case 'map':
        return (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <Map className="w-12 h-12 mx-auto text-gray-500" />
              <div className="mt-2">{card.content.data?.location || 'No location set'}</div>
            </div>
          </div>
        )
      case 'text':
        return (
          <div className="w-full h-full relative">
            {/* Haut Gauche */}
            {card.content.textContent?.hg && (
              <div
                className="absolute top-1 left-1 p-1"
                style={{
                  fontSize: card.content.textContent.hg.fontSize,
                  color: card.content.textContent.hg.color
                }}
              >
                {card.content.textContent.hg.text}
              </div>
            )}
            {/* Haut Centre */}
            {card.content.textContent?.hc && (
              <div
                className="absolute top-1 left-1/2 transform -translate-x-1/2 p-1"
                style={{
                  fontSize: card.content.textContent.hc.fontSize,
                  color: card.content.textContent.hc.color
                }}
              >
                {card.content.textContent.hc.text}
              </div>
            )}
            {/* Haut Droit */}
            {card.content.textContent?.hd && (
              <div
                className="absolute top-1 right-1 p-1"
                style={{
                  fontSize: card.content.textContent.hd.fontSize,
                  color: card.content.textContent.hd.color
                }}
              >
                {card.content.textContent.hd.text}
              </div>
            )}
            {/* Centre Gauche */}
            {card.content.textContent?.cg && (
              <div
                className="absolute top-1/2 left-1 transform -translate-y-1/2 p-1"
                style={{
                  fontSize: card.content.textContent.cg.fontSize,
                  color: card.content.textContent.cg.color
                }}
              >
                {card.content.textContent.cg.text}
              </div>
            )}
            {/* Centre */}
            {card.content.textContent?.c && (
              <div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-1"
                style={{
                  fontSize: card.content.textContent.c.fontSize,
                  color: card.content.textContent.c.color
                }}
              >
                {card.content.textContent.c.text}
              </div>
            )}
            {/* Centre Droit */}
            {card.content.textContent?.cd && (
              <div
                className="absolute top-1/2 right-1 transform -translate-y-1/2 p-1"
                style={{
                  fontSize: card.content.textContent.cd.fontSize,
                  color: card.content.textContent.cd.color
                }}
              >
                {card.content.textContent.cd.text}
              </div>
            )}
            {/* Bas Gauche */}
            {card.content.textContent?.bg && (
              <div
                className="absolute bottom-1 left-1 p-1"
                style={{
                  fontSize: card.content.textContent.bg.fontSize,
                  color: card.content.textContent.bg.color
                }}
              >
                {card.content.textContent.bg.text}
              </div>
            )}
            {/* Bas Centre */}
            {card.content.textContent?.bc && (
              <div
                className="absolute bottom-1 left-1/2 transform -translate-x-1/2 p-1"
                style={{
                  fontSize: card.content.textContent.bc.fontSize,
                  color: card.content.textContent.bc.color
                }}
              >
                {card.content.textContent.bc.text}
              </div>
            )}
            {/* Bas Droit */}
            {card.content.textContent?.bd && (
              <div
                className="absolute bottom-1 right-1 p-1"
                style={{
                  fontSize: card.content.textContent.bd.fontSize,
                  color: card.content.textContent.bd.color
                }}
              >
                {card.content.textContent.bd.text}
              </div>
            )}
          </div>
        )
      case 'bar':
      case 'line':
      case 'pie':
      case 'radialBar':
        return (
          <div className="w-full h-full">
            {ApexCharts && (
              <ApexCharts
                options={{
                  chart: {
                    type: card.content.type,
                    toolbar: {
                      show: false
                    },
                    background: 'transparent',
                    ...(card.content.data?.options?.chart || {})
                  },
                  colors: ['#33a2e5'],
                  xaxis: {
                    categories: card.content.data?.categories || [],
                    labels: {
                      style: {
                        colors: '#c7d0d9'
                      }
                    },
                    ...(card.content.data?.options?.xaxis || {})
                  },
                  yaxis: {
                    labels: {
                      style: {
                        colors: '#c7d0d9'
                      }
                    },
                    ...(card.content.data?.options?.yaxis || {})
                  },
                  legend: {
                    labels: {
                      colors: '#c7d0d9'
                    }
                  },
                  grid: {
                    borderColor: '#2c3235'
                  },
                  tooltip: {
                    theme: 'dark'
                  },
                  plotOptions: {
                    radialBar: {
                      hollow: {
                        margin: 15,
                        size: '70%'
                      },
                      dataLabels: {
                        name: {
                          offsetY: -10,
                          color: '#c7d0d9',
                          fontSize: '13px'
                        },
                        value: {
                          color: '#c7d0d9',
                          fontSize: '30px',
                          show: true
                        }
                      }
                    }
                  },
                  fill: {
                    type: 'gradient',
                    gradient: {
                      shade: 'dark',
                      type: 'vertical',
                      gradientToColors: ['#33a2e5'],
                      stops: [0, 100]
                    }
                  },
                  ...(card.content.data?.options || {})
                }}
                series={card.content.data?.series || []}
                type={card.content.type}
                width="100%"
                height="100%"
              />
            )}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className={`flex h-screen bg-[#141619] text-[#c7d0d9] ${GeistSans.className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".json"
        style={{ display: 'none' }}
      />

      <input
        type="file"
        ref={imageInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* Sidebar */}
      <aside className="w-16 bg-[#202226] border-r border-[#2c3235] flex flex-col">
        <div className="flex flex-col items-stretch pt-4 space-y-1">
          {menuItems.top.map((item) => (
            <SidebarIcon
              key={item.id}
              Icon={item.icon}
              tooltip={item.id}
              active={activeItem === item.id}
              onClick={() => {
                setActiveItem(item.id)
                if (item.action) {
                  item.action()
                } else if (item.path) {
                  navigateTo(item.path)
                }
              }}
            />
          ))}
        </div>

        <div className="mt-auto mb-4 flex flex-col items-stretch space-y-1">
          {menuItems.bottom.map((item) => (
            <SidebarIcon
              key={item.id}
              Icon={item.icon}
              tooltip={item.id}
              active={activeItem === item.id}
              onClick={() => {
                setActiveItem(item.id)
                navigateTo(item.path)
              }}
            />
          ))}
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Header with app name and controls */}
        <header className="bg-transparent px-8 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-2 pt-4">
            <Radio className="w-5 h-5 text-[#33a2e5]" />
            <h1 className="text-lg font-medium text-[#c7d0d9]">
              Astralogic <span className="text-[#8e9297] font-normal text-base">- Dashboard</span>
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded text-xs transition-all ${
                autoRefresh
                  ? 'bg-[#33a2e5] bg-opacity-20 text-[#33a2e5] border border-[#33a2e5] border-opacity-30'
                  : 'bg-[#2c3235] text-[#8e9297] border border-[#3a3f47] hover:bg-[#323740]'
              }`}
            >
              <RefreshCw className={`w-3 h-3 ${autoRefresh ? 'animate-spin' : ''}`} />
              <span>Auto</span>
            </button>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowFrequencyDropdown(!showFrequencyDropdown)}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-[#2c3235] border border-[#3a3f47]
                           rounded text-xs text-[#c7d0d9] hover:bg-[#323740] transition-all min-w-[100px] justify-between"
              >
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3 h-3" />
                  <span>{refreshFrequency.label}</span>
                </div>
                <ChevronDown className={`w-3 h-3 transition-transform ${showFrequencyDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showFrequencyDropdown && (
                <div className="absolute right-0 mt-2 w-44 bg-[#202226] border border-[#3a3f47] rounded shadow-lg z-50 max-h-64 overflow-y-auto">
                  <div className="py-1">
                    {refreshFrequencies.map((freq) => (
                      <button
                        key={freq.value}
                        onClick={() => handleFrequencySelect(freq)}
                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#2c3235] flex items-center justify-between ${
                          refreshFrequency.value === freq.value ? 'text-[#33a2e5] bg-[#2c3235]' : 'text-[#c7d0d9]'
                        }`}
                      >
                        <span>{freq.label}</span>
                        {freq.value === 'realtime' && <Zap className="w-2.5 h-2.5" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-[#1a4a2e] bg-opacity-30 border border-[#2d5a3d] rounded">
              <div className="w-1.5 h-1.5 bg-[#4ade80] rounded-full animate-pulse"></div>
              <span className="text-xs text-[#4ade80]">Connecté</span>
            </div>
          </div>
        </header>

        {/* Main dashboard area */}
        <main
          className="flex-1 overflow-y-auto pl-1 pr-1 pt-1 pb-1 text-sm font-light relative"
          onContextMenu={handleContextMenu}
        >
          {cards.map((card) => (
            <DraggableCard
              key={card.id}
              id={card.id}
              position={card.position}
              size={card.size}
              hasBackground={card.hasBackground}
              updatePosition={updateCardPosition}
              onDoubleClick={() => handleCardDoubleClick(card)}
            >
              {renderCardContent(card)}
            </DraggableCard>
          ))}

          {contextMenu.visible && (
            <div
              className="fixed bg-[#202226] border border-[#2c3235] rounded shadow-lg py-1 z-50"
              style={{
                left: `${contextMenu.x}px`,
                top: `${contextMenu.y}px`
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="px-4 py-2 text-sm hover:bg-[#25292d] cursor-pointer flex items-center"
                onClick={() => addCard(true)}
              >
                <PanelTop className="w-4 h-4 mr-2" /> Ajouter une carte
              </div>
              <div
                className="px-4 py-2 text-sm hover:bg-[#25292d] cursor-pointer flex items-center"
                onClick={() => addCard(false)}
              >
                <PanelTopClose className="w-4 h-4 mr-2" /> Ajouter une carte sans couleur
              </div>
            </div>
          )}

          {/* Card Configuration Modal */}
          {showCardModal && selectedCard && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-[#202226] border border-[#2c3235] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="border-b border-[#2c3235] p-4 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-[#c7d0d9]">Configurer la carte</h3>
                  <button
                    onClick={() => setShowCardModal(false)}
                    className="text-[#8e9297] hover:text-[#c7d0d9]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6">
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-[#c7d0d9] mb-2">
                      Type de contenu
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      <ContentTypeButton
                        icon={Gauge}
                        label="Jauge"
                        active={selectedCard.content.type === 'gauge'}
                        onClick={() => handleContentTypeChange('gauge')}
                      />
                      <ContentTypeButton
                        icon={Image}
                        label="Image"
                        active={selectedCard.content.type === 'image'}
                        onClick={() => handleContentTypeChange('image')}
                      />
                      <ContentTypeButton
                        icon={Map}
                        label="Carte"
                        active={selectedCard.content.type === 'map'}
                        onClick={() => handleContentTypeChange('map')}
                      />
                      <ContentTypeButton
                        icon={Type}
                        label="Texte"
                        active={selectedCard.content.type === 'text'}
                        onClick={() => handleContentTypeChange('text')}
                      />
                      <ContentTypeButton
                        icon={BarChart2}
                        label="Barres"
                        active={selectedCard.content.type === 'bar'}
                        onClick={() => handleContentTypeChange('bar')}
                      />
                      <ContentTypeButton
                        icon={LineChart}
                        label="Lignes"
                        active={selectedCard.content.type === 'line'}
                        onClick={() => handleContentTypeChange('line')}
                      />
                      <ContentTypeButton
                        icon={PieChart}
                        label="Secteurs"
                        active={selectedCard.content.type === 'pie'}
                        onClick={() => handleContentTypeChange('pie')}
                      />
                      <ContentTypeButton
                        icon={Disc}
                        label="Radial"
                        active={selectedCard.content.type === 'radialBar'}
                        onClick={() => handleContentTypeChange('radialBar')}
                      />
                    </div>
                  </div>

                  {/* Content type specific configuration */}
                  {selectedCard.content.type === 'gauge' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#c7d0d9] mb-1">
                          Libellé
                        </label>
                        <input
                          type="text"
                          className="w-full bg-[#25292d] border border-[#2c3235] rounded px-3 py-2 text-sm text-[#c7d0d9] focus:outline-none focus:ring-1 focus:ring-[#33a2e5]"
                          value={selectedCard.content.data?.label || ''}
                          onChange={(e) => updateCardContent(selectedCard.id, {
                            ...selectedCard.content,
                            data: {
                              ...selectedCard.content.data,
                              label: e.target.value
                            }
                          })}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#c7d0d9] mb-1">
                            Valeur
                          </label>
                          <input
                            type="number"
                            className="w-full bg-[#25292d] border border-[#2c3235] rounded px-3 py-2 text-sm text-[#c7d0d9] focus:outline-none focus:ring-1 focus:ring-[#33a2e5]"
                            value={selectedCard.content.data?.value || 0}
                            onChange={(e) => updateCardContent(selectedCard.id, {
                              ...selectedCard.content,
                              data: {
                                ...selectedCard.content.data,
                                value: parseInt(e.target.value)
                              }
                            })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#c7d0d9] mb-1">
                            Minimum
                          </label>
                          <input
                            type="number"
                            className="w-full bg-[#25292d] border border-[#2c3235] rounded px-3 py-2 text-sm text-[#c7d0d9] focus:outline-none focus:ring-1 focus:ring-[#33a2e5]"
                            value={selectedCard.content.data?.min || 0}
                            onChange={(e) => updateCardContent(selectedCard.id, {
                              ...selectedCard.content,
                              data: {
                                ...selectedCard.content.data,
                                min: parseInt(e.target.value)
                              }
                            })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#c7d0d9] mb-1">
                            Maximum
                          </label>
                          <input
                            type="number"
                            className="w-full bg-[#25292d] border border-[#2c3235] rounded px-3 py-2 text-sm text-[#c7d0d9] focus:outline-none focus:ring-1 focus:ring-[#33a2e5]"
                            value={selectedCard.content.data?.max || 100}
                            onChange={(e) => updateCardContent(selectedCard.id, {
                              ...selectedCard.content,
                              data: {
                                ...selectedCard.content.data,
                                max: parseInt(e.target.value)
                              }
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedCard.content.type === 'image' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#c7d0d9] mb-1">
                          Image
                        </label>
                        {selectedCard.content.data?.src ? (
                          <div className="flex items-center space-x-4">
                            <img
                              src={selectedCard.content.data.src}
                              alt="Preview"
                              className="h-20 w-auto object-contain border border-[#2c3235] rounded"
                            />
                            <button
                              onClick={() => imageInputRef.current?.click()}
                              className="bg-[#25292d] border border-[#2c3235] hover:bg-[#2c3235] text-[#c7d0d9] px-3 py-1.5 rounded text-sm"
                            >
                              Changer
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => imageInputRef.current?.click()}
                            className="w-full bg-[#25292d] border border-[#2c3235] hover:bg-[#2c3235] text-[#c7d0d9] px-3 py-2 rounded text-sm flex items-center justify-center"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Sélectionner une image
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedCard.content.type === 'map' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#c7d0d9] mb-1">
                          Localisation
                        </label>
                        <input
                          type="text"
                          className="w-full bg-[#25292d] border border-[#2c3235] rounded px-3 py-2 text-sm text-[#c7d0d9] focus:outline-none focus:ring-1 focus:ring-[#33a2e5]"
                          value={selectedCard.content.data?.location || ''}
                          onChange={(e) => updateCardContent(selectedCard.id, {
                            ...selectedCard.content,
                            data: {
                              ...selectedCard.content.data,
                              location: e.target.value
                            }
                          })}
                          placeholder="Paris, France"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#c7d0d9] mb-1">
                          Zoom
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="20"
                          className="w-full h-2 bg-[#25292d] rounded-lg appearance-none cursor-pointer"
                          value={selectedCard.content.data?.zoom || 10}
                          onChange={(e) => updateCardContent(selectedCard.id, {
                            ...selectedCard.content,
                            data: {
                              ...selectedCard.content.data,
                              zoom: parseInt(e.target.value)
                            }
                          })}
                        />
                        <div className="text-xs text-[#8e9297] mt-1">
                          Niveau de zoom: {selectedCard.content.data?.zoom || 10}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedCard.content.type === 'text' && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium text-[#c7d0d9] mb-3">Zones de texte</h4>

                        {/* Grille des 9 positions */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          {/* Haut Gauche */}
                          <TextPositionBlock
                            position="hg"
                            label="Haut Gauche"
                            content={selectedCard.content.textContent?.hg}
                            onUpdate={updateTextContent}
                          />
                          {/* Haut Centre */}
                          <TextPositionBlock
                            position="hc"
                            label="Haut Centre"
                            content={selectedCard.content.textContent?.hc}
                            onUpdate={updateTextContent}
                          />
                          {/* Haut Droit */}
                          <TextPositionBlock
                            position="hd"
                            label="Haut Droit"
                            content={selectedCard.content.textContent?.hd}
                            onUpdate={updateTextContent}
                          />
                          {/* Centre Gauche */}
                          <TextPositionBlock
                            position="cg"
                            label="Centre Gauche"
                            content={selectedCard.content.textContent?.cg}
                            onUpdate={updateTextContent}
                          />
                          {/* Centre */}
                          <TextPositionBlock
                            position="c"
                            label="Centre"
                            content={selectedCard.content.textContent?.c}
                            onUpdate={updateTextContent}
                          />
                          {/* Centre Droit */}
                          <TextPositionBlock
                            position="cd"
                            label="Centre Droit"
                            content={selectedCard.content.textContent?.cd}
                            onUpdate={updateTextContent}
                          />
                          {/* Bas Gauche */}
                          <TextPositionBlock
                            position="bg"
                            label="Bas Gauche"
                            content={selectedCard.content.textContent?.bg}
                            onUpdate={updateTextContent}
                          />
                          {/* Bas Centre */}
                          <TextPositionBlock
                            position="bc"
                            label="Bas Centre"
                            content={selectedCard.content.textContent?.bc}
                            onUpdate={updateTextContent}
                          />
                          {/* Bas Droit */}
                          <TextPositionBlock
                            position="bd"
                            label="Bas Droit"
                            content={selectedCard.content.textContent?.bd}
                            onUpdate={updateTextContent}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {(selectedCard.content.type === 'bar' ||
                    selectedCard.content.type === 'line' ||
                    selectedCard.content.type === 'pie' ||
                    selectedCard.content.type === 'radialBar') && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#c7d0d9] mb-1">
                          Type de graphique
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {selectedCard.content.type === 'radialBar' && (
                            <>
                              <ChartSubtypeButton
                                label="Basique"
                                active={selectedCard.content.subtype === 'basic'}
                                onClick={() => handleContentTypeChange('radialBar', 'basic')}
                              />
                              <ChartSubtypeButton
                                label="Dégradé"
                                active={selectedCard.content.subtype === 'gradient'}
                                onClick={() => handleContentTypeChange('radialBar', 'gradient')}
                              />
                              <ChartSubtypeButton
                                label="Jauge"
                                active={selectedCard.content.subtype === 'stroked'}
                                onClick={() => handleContentTypeChange('radialBar', 'stroked')}
                              />
                              <ChartSubtypeButton
                                label="Semi-cercle"
                                active={selectedCard.content.subtype === 'semi'}
                                onClick={() => handleContentTypeChange('radialBar', 'semi')}
                              />
                            </>
                          )}
                          {selectedCard.content.type === 'line' && (
                            <>
                              <ChartSubtypeButton
                                label="Basique"
                                active={selectedCard.content.subtype === 'basic'}
                                onClick={() => handleContentTypeChange('line', 'basic')}
                              />
                              <ChartSubtypeButton
                                label="Zoomable"
                                active={selectedCard.content.subtype === 'zoomable'}
                                onClick={() => handleContentTypeChange('line', 'zoomable')}
                              />
                              <ChartSubtypeButton
                                label="Annotations"
                                active={selectedCard.content.subtype === 'annotations'}
                                onClick={() => handleContentTypeChange('line', 'annotations')}
                              />
                              <ChartSubtypeButton
                                label="Pinceau"
                                active={selectedCard.content.subtype === 'brush'}
                                onClick={() => handleContentTypeChange('line', 'brush')}
                              />
                              <ChartSubtypeButton
                                label="Temps réel"
                                active={selectedCard.content.subtype === 'realtime'}
                                onClick={() => handleContentTypeChange('line', 'realtime')}
                              />
                            </>
                          )}
                          {selectedCard.content.type === 'bar' && (
                            <ChartSubtypeButton
                              label="Basique"
                              active={selectedCard.content.subtype === 'basic'}
                              onClick={() => handleContentTypeChange('bar', 'basic')}
                            />
                          )}
                          {selectedCard.content.type === 'pie' && (
                            <ChartSubtypeButton
                              label="Basique"
                              active={selectedCard.content.subtype === 'basic'}
                              onClick={() => handleContentTypeChange('pie', 'basic')}
                            />
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#c7d0d9] mb-1">
                          Données
                        </label>
                        <div className="bg-[#25292d] border border-[#2c3235] rounded p-3">
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <label className="block text-xs font-medium text-[#8e9297] mb-1">
                                Nom de la série
                              </label>
                              <input
                                type="text"
                                className="w-full bg-[#2c3235] border border-[#3a3f47] rounded px-2 py-1 text-sm text-[#c7d0d9] focus:outline-none focus:ring-1 focus:ring-[#33a2e5]"
                                value={selectedCard.content.data?.series?.[0]?.name || 'Series 1'}
                                onChange={(e) => {
                                  const newSeries = [...selectedCard.content.data.series]
                                  newSeries[0].name = e.target.value
                                  updateCardContent(selectedCard.id, {
                                    ...selectedCard.content,
                                    data: {
                                      ...selectedCard.content.data,
                                      series: newSeries
                                    }
                                  })
                                }}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-[#8e9297] mb-1">
                                Couleur
                              </label>
                              <input
                                type="color"
                                className="w-full h-8 border border-[#2c3235] rounded cursor-pointer"
                                value="#33a2e5"
                                readOnly
                              />
                            </div>
                          </div>

                          {selectedCard.content.type !== 'radialBar' && (
                            <>
                              <div className="mb-3">
                                <label className="block text-xs font-medium text-[#8e9297] mb-1">
                                  Valeurs (séparées par des virgules)
                                </label>
                                <input
                                  type="text"
                                  className="w-full bg-[#2c3235] border border-[#3a3f47] rounded px-2 py-1 text-sm text-[#c7d0d9] focus:outline-none focus:ring-1 focus:ring-[#33a2e5]"
                                  value={selectedCard.content.data?.series?.[0]?.data?.join(', ') || ''}
                                  onChange={(e) => {
                                    const values = e.target.value.split(',').map(v => parseInt(v.trim()) || 0)
                                    const newSeries = [...selectedCard.content.data.series]
                                    newSeries[0].data = values
                                    updateCardContent(selectedCard.id, {
                                      ...selectedCard.content,
                                      data: {
                                        ...selectedCard.content.data,
                                        series: newSeries
                                      }
                                    })
                                  }}
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-[#8e9297] mb-1">
                                  Catégories (séparées par des virgules)
                                </label>
                                <input
                                  type="text"
                                  className="w-full bg-[#2c3235] border border-[#3a3f47] rounded px-2 py-1 text-sm text-[#c7d0d9] focus:outline-none focus:ring-1 focus:ring-[#33a2e5]"
                                  value={selectedCard.content.data?.categories?.join(', ') || ''}
                                  onChange={(e) => {
                                    const categories = e.target.value.split(',').map(v => v.trim())
                                    updateCardContent(selectedCard.id, {
                                      ...selectedCard.content,
                                      data: {
                                        ...selectedCard.content.data,
                                        categories
                                      }
                                    })
                                  }}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-[#2c3235] p-4 flex justify-end">
                  <button
                    onClick={() => setShowCardModal(false)}
                    className="bg-[#33a2e5] hover:bg-[#2c8fd1] text-white px-4 py-2 rounded text-sm"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  )
}

// DraggableCard component
function DraggableCard({
  id,
  position,
  size,
  hasBackground,
  updatePosition,
  onDoubleClick,
  children
}: {
  id: string
  position: Position
  size: Size
  hasBackground: boolean
  updatePosition: (id: string, newPosition: Position) => boolean
  onDoubleClick: () => void
  children?: React.ReactNode
}) {
  const [currentPosition, setCurrentPosition] = useState(position)
  const [currentSize, setCurrentSize] = useState(size)
  const [isDragging, setIsDragging] = useState(false)
  const draggableRef = useRef<HTMLDivElement>(null)

  const handleDoubleClick = () => {
    onDoubleClick()
    setIsDragging(true)
  }

  const handleDrag = (_e: unknown, data: { x: number; y: number }) => {
    if (isDragging) {
      setCurrentPosition({ x: data.x, y: data.y })
    }
  }

  const handleDragStop = (_e: unknown, data: { x: number; y: number }) => {
    const success = updatePosition(id, { x: data.x, y: data.y })
    if (!success) {
      setCurrentPosition(position)
    } else {
      setCurrentPosition({ x: data.x, y: data.y })
    }
    setIsDragging(false)
  }

  const handleResize = (_e: unknown, { size }: { size: Size }) => {
    setCurrentSize(size)
  }

  return (
    <Draggable
      nodeRef={draggableRef}
      position={currentPosition}
      onDrag={handleDrag}
      onStop={handleDragStop}
      bounds="parent"
      cancel=".react-resizable-handle"
    >
      <div ref={draggableRef} className="absolute">
        <Resizable
          width={currentSize.width}
          height={currentSize.height}
          onResize={handleResize}
          resizeHandles={['se']}
          handle={(handleAxis, ref) => (
            <div
              ref={ref}
              className={`react-resizable-handle react-resizable-handle-${handleAxis}`}
              style={{
                width: '10px',
                height: '10px',
                position: 'absolute',
                bottom: 0,
                right: 0,
                cursor: 'se-resize'
              }}
            />
          )}
        >
          <div
            className="flex flex-col cursor-default"
            style={{
              width: currentSize.width + 'px',
              height: currentSize.height + 'px',
              backgroundColor: hasBackground ? '#202226' : 'transparent',
              border: '1px solid #2c3231',
              borderRadius: '0.15rem'
            }}
            onDoubleClick={handleDoubleClick}
          >
            {children}
          </div>
        </Resizable>
      </div>
    </Draggable>
  )
}

// SidebarIcon component
function SidebarIcon({
  Icon,
  tooltip,
  active = false,
  onClick
}: {
  Icon: React.ComponentType<{ className?: string }>
  tooltip: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <div className="relative group w-full">
      <button
        className={`w-full py-3 px-0 flex justify-center items-center transition-all
          ${active ? 'text-[#33a2e5] bg-[rgba(51,162,229,0.1)]'
           : 'text-[#8e9297] hover:text-[#58b3ea] hover:bg-[rgba(255,255,255,0.05)]'}`}
        onClick={onClick}
      >
        <Icon className="w-5 h-5" />
      </button>

      {active && (
        <div className="absolute right-0 top-0 h-full w-[3px] bg-[#33a2e5]" />
      )}

      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2
        bg-[#202226] text-white px-3 py-1 rounded text-xs
        opacity-0 pointer-events-none transition-opacity
        whitespace-nowrap z-50 group-hover:opacity-100">
        {tooltip}
      </div>
    </div>
  )
}

// ContentTypeButton component
function ContentTypeButton({
  icon: Icon,
  label,
  active,
  onClick
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-3 rounded border transition-all ${
        active
          ? 'border-[#33a2e5] bg-[#33a2e5] bg-opacity-10 text-[#33a2e5]'
          : 'border-[#2c3235] hover:border-[#3a3f47] text-[#8e9297] hover:text-[#c7d0d9]'
      }`}
    >
      <Icon className="w-5 h-5 mb-1" />
      <span className="text-xs">{label}</span>
    </button>
  )
}

// ChartSubtypeButton component
function ChartSubtypeButton({
  label,
  active,
  onClick
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded text-xs transition-all ${
        active
          ? 'bg-[#33a2e5] text-white'
          : 'bg-[#2c3235] text-[#c7d0d9] hover:bg-[#3a3f47]'
      }`}
    >
      {label}
    </button>
  )
}

// Nouveau composant pour gérer chaque zone de texte
function TextPositionBlock({
  position,
  label,
  content,
  onUpdate
}: {
  position: TextPosition
  label: string
  content?: { text: string; fontSize: number; color: string }
  onUpdate: (position: TextPosition, field: string, value: string | number) => void
}) {
  return (
    <div className="bg-[#25292d] border border-[#2c3235] rounded p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-[#c7d0d9]">{label}</span>
        <BoxSelect className="w-3 h-3 text-[#8e9297]" />
      </div>

      <textarea
        className="w-full bg-[#2c3235] border border-[#3a3f47] rounded px-2 py-1 text-sm text-[#c7d0d9] focus:outline-none focus:ring-1 focus:ring-[#33a2e5] mb-2"
        rows={2}
        placeholder="Texte..."
        value={content?.text || ''}
        onChange={(e) => onUpdate(position, 'text', e.target.value)}
      />

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-[#8e9297] mb-1">Taille</label>
          <input
            type="number"
            className="w-full bg-[#2c3235] border border-[#3a3f47] rounded px-2 py-1 text-xs text-[#c7d0d9] focus:outline-none focus:ring-1 focus:ring-[#33a2e5]"
            value={content?.fontSize || 12}
            onChange={(e) => onUpdate(position, 'fontSize', parseInt(e.target.value) || 12)}
          />
        </div>
        <div>
          <label className="block text-xs text-[#8e9297] mb-1">Couleur</label>
          <div className="flex items-center">
            <input
              type="color"
              className="w-6 h-6 border border-[#2c3235] rounded cursor-pointer"
              value={content?.color || '#ffffff'}
              onChange={(e) => onUpdate(position, 'color', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}