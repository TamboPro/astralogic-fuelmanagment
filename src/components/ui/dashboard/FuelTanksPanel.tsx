'use client'

import SquarePanel from "@/components/ui/panel/SquarePanel"
import Image from "next/image"
import { useEffect, useState } from 'react'

interface FuelTanksPanelProps {
  essence1?: number
  essence2?: number
  petrol?: number
  gazoil?: number
  loading?: boolean
  capacity?: {
    essence1: number
    essence2: number
    petrol: number
    gazoil: number
  }
}

export default function FuelTanksPanel({ 
  essence1 = 0, 
  essence2 = 0, 
  petrol = 0, 
  gazoil = 0,
  loading = false,
  capacity = {
    essence1: 1000,
    essence2: 1000,
    petrol: 2000,
    gazoil: 1500
  }
}: FuelTanksPanelProps) {
  
  const [animatedValues, setAnimatedValues] = useState({
    essence1: 0,
    essence2: 0,
    petrol: 0,
    gazoil: 0
  })

  // Calcul du pourcentage de remplissage
  const getFillPercentage = (current: number, max: number) => {
    return Math.min(100, Math.max(0, (current / max) * 100))
  }

  // Obtenir la couleur en fonction du niveau de remplissage
  const getLevelColor = (percentage: number) => {
    if (percentage > 55) return '#10B981' // Vert (haut)
    if (percentage > 25) return '#FBB03B' // Orange (moyen)
    return '#ED1C24' // Rouge (bas)
  }

  // Obtenir la couleur du texte en fonction du niveau de remplissage
  const getTextColor = (percentage: number) => {
    if (percentage > 55) return '#10B981' // Vert
    if (percentage > 25) return '#FBB03B' // Orange
    return '#ED1C24' // Rouge
  }

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

    animateValue(animatedValues.essence1, essence1, (value) => {
      setAnimatedValues(prev => ({ ...prev, essence1: value }))
    })

    animateValue(animatedValues.essence2, essence2, (value) => {
      setAnimatedValues(prev => ({ ...prev, essence2: value }))
    })

    animateValue(animatedValues.petrol, petrol, (value) => {
      setAnimatedValues(prev => ({ ...prev, petrol: value }))
    })

    animateValue(animatedValues.gazoil, gazoil, (value) => {
      setAnimatedValues(prev => ({ ...prev, gazoil: value }))
    })

  }, [essence1, essence2, petrol, gazoil])

  if (loading) {
    return (
      <div className="flex-1 flex gap-1">
        <div className="flex-1 bg-[#000000] rounded-[0.5px] border border-[#2c3235] flex items-center justify-center">
          <div className="w-2/3 h-2/3 relative">
            <div className="absolute inset-0 bg-[#2c3235] rounded animate-pulse" />
          </div>
        </div>
        
        <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-1">
          {[1, 2, 3, 4].map((tank) => (
            <div key={tank} className="bg-[#202226] rounded-[0.5px] border border-[#2c3235] flex flex-col items-center justify-center p-3">
              <div className="h-4 w-20 bg-[#2c3235] rounded animate-pulse mb-2" />
              <div className="h-8 w-24 bg-[#2c3235] rounded animate-pulse" />
              <div className="h-3 w-8 bg-[#2c3235] rounded animate-pulse mt-2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const tanks = [
    { 
      id: 1, 
      type: 'essence', 
      value: animatedValues.essence1, 
      capacity: capacity.essence1, 
      baseTitle: 'Essence 1',
    },
    { 
      id: 2, 
      type: 'essence', 
      value: animatedValues.essence2, 
      capacity: capacity.essence2, 
      baseTitle: 'Essence 2',
    },
    { 
      id: 3, 
      type: 'petrole', 
      value: animatedValues.petrol, 
      capacity: capacity.petrol, 
      baseTitle: 'Pétrole',
    },
    { 
      id: 4, 
      type: 'gazoil', 
      value: animatedValues.gazoil, 
      capacity: capacity.gazoil, 
      baseTitle: 'Gazoil',
    }
  ]

  return (
    <div className="flex-1 flex gap-1">
      {/* Partie gauche avec image de tank */}
      <div className="flex-1 bg-[#000000] rounded-[0.5px] border border-[#2c3235] flex items-center justify-center">
        <div className="w-2/3 h-2/3 relative">
          <Image
            src="/assets/images/Tank.png"
            alt="Réservoir de carburant"
            fill
            style={{ objectFit: "contain" }}
            priority
          />
        </div>
      </div>
      
      {/* Partie droite avec SquarePanels */}
      <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-1">
        {tanks.map((tank) => {
          const percentage = getFillPercentage(tank.value, tank.capacity)
          const levelColor = getLevelColor(percentage)
          const textColor = getTextColor(percentage)
          
          // Concaténer le pourcentage au titre
          const titleWithPercentage = `${tank.baseTitle} (${Math.round(percentage)}%)`
          
          return (
            <div key={tank.id} className="relative">
              <SquarePanel
                width="100%"
                height="100%"
                title={titleWithPercentage} // Titre avec pourcentage
                topText="L"
                mainValue={tank.value.toString()}
                mainValueSize="md"
                backgroundColor="#202226"
                borderColor="#2c3235"
                titleColor="#ffffff"
                mainValueColor={textColor} // Couleur dynamique basée sur le pourcentage
                topTextColor="#8e9297"
              />
              {/* Barre de niveau */}
              <div className="absolute bottom-2 left-2 right-2 h-1 bg-[#2c3235] rounded">
                <div 
                  className="h-full rounded transition-all duration-300"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: levelColor
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}