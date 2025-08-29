'use client'

import Panel from "@/components/ui/panel/panelBox"
import { VideoOff, Video, RefreshCw } from "lucide-react"
import Image from "next/image"
import { useState } from 'react'

interface CameraPanelProps {
  cameraNumber: number
  imageUrl?: string
  loading?: boolean
  status?: 'connected' | 'disconnected' | 'error'
  onRefresh?: () => void
}

export default function CameraPanel({ 
  cameraNumber, 
  imageUrl, 
  loading = false, 
  status = 'connected',
  onRefresh 
}: CameraPanelProps) {
  const [imageError, setImageError] = useState(false)

  const handleImageError = () => {
    setImageError(true)
  }

  const handleRefresh = () => {
    setImageError(false)
    onRefresh?.()
  }

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'bg-green-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'connected': return 'Connecté'
      case 'error': return 'Erreur'
      default: return 'Déconnecté'
    }
  }

  if (loading) {
    return (
      <Panel title={`Camera ${cameraNumber}`} showSelect={false}>
        <div className="h-full flex flex-col items-center justify-center p-4 text-[#c7d0d9]">
          <div className="flex flex-col items-center justify-center flex-1 w-full">
            <div className="w-16 h-16 bg-[#2c3235] rounded-full animate-pulse mb-4" />
            <div className="h-4 w-20 bg-[#2c3235] rounded animate-pulse" />
          </div>
        </div>
      </Panel>
    )
  }

  return (
    <Panel title={`Camera ${cameraNumber}`} showSelect={false}>
      <div className="h-full flex flex-col items-center justify-center p-4 text-[#c7d0d9] relative">
        
        {/* Indicateur de statut */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
          <span className="text-xs text-[#8e9297]">{getStatusText()}</span>
        </div>

        {/* Bouton de rafraîchissement */}
        {onRefresh && (
          <button
            onClick={handleRefresh}
            className="absolute top-3 right-3 z-10 p-1 bg-[#00000080] rounded hover:bg-[#000000] transition-colors"
            title="Rafraîchir l'image"
          >
            <RefreshCw className="w-4 h-4 text-[#c7d0d9]" />
          </button>
        )}

        {imageUrl && !imageError ? (
          <div className="w-full h-full relative">
            <Image
              src={imageUrl}
              alt={`Vue de la caméra ${cameraNumber}`}
              fill
              style={{ objectFit: "cover" }}
              className="rounded"
              onError={handleImageError}
            />
            
            {/* Overlay d'information */}
            <div className="absolute bottom-2 left-2 bg-[#00000080] px-2 py-1 rounded">
              <span className="text-xs text-[#c7d0d9]">Static</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1">
            <VideoOff className="w-16 h-16 text-[#8e9297] mb-4" />
            <div className="text-[#8e9297] text-sm font-medium text-center">
              {status === 'error' ? 'Erreur de connexion' : 'No Signal'}
            </div>
            
            {onRefresh && (
              <button
                onClick={handleRefresh}
                className="mt-4 px-4 py-2 bg-[#33a2e5] text-white text-xs rounded hover:bg-[#2b91d5] transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Réessayer
              </button>
            )}
          </div>
        )}
      </div>
    </Panel>
  )
}