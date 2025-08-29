'use client'

import SquarePanel from "@/components/ui/panel/SquarePanel"
import Image from "next/image"
import { useEffect, useState } from 'react'
import { Activity, AlertCircle, CheckCircle } from 'lucide-react'

interface PumpsPanelProps {
  pompe1?: number
  pompe2?: number
  pompe3?: number
  pompe4?: number
  loading?: boolean
  status?: {
    pompe1: 'active' | 'inactive' | 'error'
    pompe2: 'active' | 'inactive' | 'error'
    pompe3: 'active' | 'inactive' | 'error'
    pompe4: 'active' | 'inactive' | 'error'
  }
}

export default function PumpsPanel({ 
  pompe1 = 0, 
  pompe2 = 0, 
  pompe3 = 0, 
  pompe4 = 0,
  loading = false,
  status = {
    pompe1: 'inactive',
    pompe2: 'inactive',
    pompe3: 'inactive',
    pompe4: 'inactive'
  }
}: PumpsPanelProps) {
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981' // vert
      case 'error': return '#EF4444' // rouge
      default: return '#6B7280' // gris
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Activity className="w-3 h-3" />
      case 'error': return <AlertCircle className="w-3 h-3" />
      default: return <CheckCircle className="w-3 h-3" />
    }
  }

  const pumpPanelColors = {
    backgroundColor: '#202226',
    borderColor: '#2c3235',
    titleColor: '#c7d0d9',
    mainValueColor: '#FBB03B',
    topTextColor: '#8e9297'
  }

  const [animatedValues, setAnimatedValues] = useState({
    pompe1: 0,
    pompe2: 0,
    pompe3: 0,
    pompe4: 0
  })

  useEffect(() => {
    const animateValue = (current: number, target: number, callback: (value: number) => void) => {
      if (current === target) return

      const diff = target - current
      const step = diff / 10
      let currentValue = current

      const interval = setInterval(() => {
        currentValue += step
        if ((step > 0 && currentValue >= target) || (step < 0 && currentValue <= target)) {
          currentValue = target
          clearInterval(interval)
        }
        callback(Math.round(currentValue))
      }, 50)

      return () => clearInterval(interval)
    }

    animateValue(animatedValues.pompe1, pompe1, (value) => {
      setAnimatedValues(prev => ({ ...prev, pompe1: value }))
    })

    animateValue(animatedValues.pompe2, pompe2, (value) => {
      setAnimatedValues(prev => ({ ...prev, pompe2: value }))
    })

    animateValue(animatedValues.pompe3, pompe3, (value) => {
      setAnimatedValues(prev => ({ ...prev, pompe3: value }))
    })

    animateValue(animatedValues.pompe4, pompe4, (value) => {
      setAnimatedValues(prev => ({ ...prev, pompe4: value }))
    })

  }, [pompe1, pompe2, pompe3, pompe4])

  if (loading) {
    return (
      <div className="flex-1 flex gap-1">
        <div className="flex-1 bg-[#000000] rounded-[0.5px] border border-[#2c3235] flex items-center justify-center">
          <div className="w-2/3 h-2/3 relative">
            <div className="absolute inset-0 bg-[#2c3235] rounded animate-pulse" />
          </div>
        </div>
        
        <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-1">
          {[1, 2, 3, 4].map((pump) => (
            <div key={pump} className="bg-[#202226] rounded-[0.5px] border border-[#2c3235] flex flex-col items-center justify-center p-3">
              <div className="h-4 w-16 bg-[#2c3235] rounded animate-pulse mb-2" />
              <div className="h-8 w-20 bg-[#2c3235] rounded animate-pulse" />
              <div className="h-3 w-8 bg-[#2c3235] rounded animate-pulse mt-2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex gap-1">
      {/* Partie gauche avec image de pompe */}
      <div className="flex-1 bg-[#000000] rounded-[0.5px] border border-[#2c3235] flex items-center justify-center">
        <div className="w-2/3 h-2/3 relative">
          <Image
            src="/assets/images/Pompe_img.png"
            alt="Image de pompe à essence"
            fill
            style={{ objectFit: "contain" }}
            priority
          />
        </div>
      </div>
      
      {/* Partie droite avec SquarePanels */}
      <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-1">
        {[1, 2, 3, 4].map((pumpNumber) => {
          const value = animatedValues[`pompe${pumpNumber}` as keyof typeof animatedValues]
          const pumpStatus = status[`pompe${pumpNumber}` as keyof typeof status]
          
          return (
            <div key={pumpNumber} className="relative">
              <SquarePanel
                width="100%"
                height="100%"
                title={`Pompe ${pumpNumber}`}
                topText="L"
                mainValue={value.toString()}
                mainValueSize="md"
                {...pumpPanelColors}
              />
              {/* Indicateur de statut */}
              <div 
                className="absolute top-2 right-2 w-3 h-3 rounded-full flex items-center justify-center"
                style={{ backgroundColor: getStatusColor(pumpStatus) }}
                title={pumpStatus === 'active' ? 'Active' : pumpStatus === 'error' ? 'Erreur' : 'Inactive'}
              >
                {getStatusIcon(pumpStatus)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}