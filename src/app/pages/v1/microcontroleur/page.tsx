// app/pages/microcontroleur/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Settings,
  Cpu,
  UserCircle,
  Settings2,
  Construction,
  Upload,
  Download,
  RefreshCw,
  Power,
  Wifi,
  HardDrive,
} from 'lucide-react'
import { GeistSans } from 'geist/font'

// Type pour les appareils ESP32
type ESP32Device = {
  id: string
  name: string
  ip: string
  connected: boolean
  lastSeen: string
}

export default function MicrocontroleurPage() {
  const router = useRouter()
  const pathname = usePathname()
  
  const menuItems = {
    top: [
      { id: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
      { id: 'Réglages', icon: Settings2, path: '/pages/reglages' },
      { id: 'Construction', icon: Construction, path: '/pages/construction' },
    ],
    bottom: [
      { id: 'Microcontrôleur', icon: Cpu, path: '/pages/microcontroleur' },
      { id: 'Paramètres', icon: Settings, path: '/pages/parametres' },
      { id: 'Compte', icon: UserCircle, path: '/pages/compte' },
    ]
  } as const

  // États pour la gestion des appareils
  const [devices, setDevices] = useState<ESP32Device[]>([
    { id: '1', name: 'ESP32-Salon', ip: '192.168.1.10', connected: true, lastSeen: '2 min ago' },
    { id: '2', name: 'ESP32-Cuisine', ip: '192.168.1.11', connected: false, lastSeen: '15 min ago' },
    { id: '3', name: 'ESP32-Chambre', ip: '192.168.1.12', connected: true, lastSeen: '1 min ago' },
  ])
  const [selectedDevice, setSelectedDevice] = useState<string>('1')
  const [otaEnabled, setOtaEnabled] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [firmwareFile, setFirmwareFile] = useState<File | null>(null)

  const getActiveItem = () => {
    const path = pathname.split('/').pop() || 'dashboard'
    const allItems = [...menuItems.top, ...menuItems.bottom]
    const foundItem = allItems.find(item => 
      item.path.toLowerCase().includes(path.toLowerCase())
    )
    return foundItem?.id || 'Dashboard'
  }

  const [activeItem, setActiveItem] = useState(getActiveItem())

  const navigateTo = (path: string) => {
    router.push(path)
    setActiveItem(
      [...menuItems.top, ...menuItems.bottom].find(item => item.path === path)?.id || 'Dashboard'
    )
  }

  // Simuler la recherche de nouveaux appareils
  const scanDevices = () => {
    setIsUploading(true)
    setTimeout(() => {
      setDevices([
        ...devices,
        { id: '4', name: 'ESP32-Nouveau', ip: '192.168.1.13', connected: true, lastSeen: 'maintenant' }
      ])
      setIsUploading(false)
    }, 2000)
  }

  // Simuler le téléversement OTA
  const handleOtaUpload = () => {
    if (!firmwareFile) return
    
    setIsUploading(true)
    setUploadProgress(0)
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  // Simuler le téléversement local
  const handleLocalUpload = () => {
    if (!firmwareFile) return
    
    setIsUploading(true)
    setUploadProgress(0)
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          return 100
        }
        return prev + 5
      })
    }, 300)
  }

  const selectedDeviceData = devices.find(device => device.id === selectedDevice)

  return (
    <div className={`flex h-screen bg-[#141619] text-[#c7d0d9] ${GeistSans.className}`}>
      {/* Sidebar */}
      <aside className="w-16 bg-[#202226] border-r border-[#2c3235] flex flex-col">
        <div className="flex flex-col items-stretch pt-4 space-y-1">
          {menuItems.top.map((item) => (
            <SidebarIcon
              key={item.id}
              Icon={item.icon}
              tooltip={item.id}
              active={activeItem === item.id}
              onClick={() => navigateTo(item.path)}
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
              onClick={() => navigateTo(item.path)}
            />
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 text-sm font-light">
        <h1 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <Cpu className="w-6 h-6" />
          Gestion des Microcontrôleurs
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Section Liste des appareils */}
          <div className="bg-[#202226] rounded-lg p-5 lg:col-span-1">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium flex items-center gap-2">
                <HardDrive className="w-5 h-5" />
                Appareils ESP32
              </h2>
              <button 
                onClick={scanDevices}
                disabled={isUploading}
                className="p-1 text-[#8e9297] hover:text-[#33a2e5] disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isUploading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            
            <div className="space-y-2">
              <select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="w-full bg-[#141619] border border-[#2c3235] rounded px-3 py-2 text-sm mb-4"
              >
                {devices.map(device => (
                  <option key={device.id} value={device.id}>
                    {device.name} ({device.connected ? 'Connecté' : 'Déconnecté'})
                  </option>
                ))}
              </select>
              
              {selectedDeviceData && (
                <div className="space-y-3 p-3 bg-[#141619] rounded">
                  <div className="flex justify-between">
                    <span className="text-[#8e9297]">IP:</span>
                    <span>{selectedDeviceData.ip}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8e9297]">Statut:</span>
                    <span className={`flex items-center ${selectedDeviceData.connected ? 'text-green-400' : 'text-red-400'}`}>
                      {selectedDeviceData.connected ? 'Connecté' : 'Déconnecté'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8e9297]">Dernière activité:</span>
                    <span>{selectedDeviceData.lastSeen}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section Configuration OTA */}
          <div className="bg-[#202226] rounded-lg p-5 lg:col-span-2">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Mise à jour du firmware
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-3 bg-[#141619] rounded">
                <span>Activer le mode OTA</span>
                <ToggleSwitch 
                  enabled={otaEnabled} 
                  setEnabled={setOtaEnabled} 
                />
              </div>
              
              {otaEnabled && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[#8e9297] mb-2">Sélectionner le firmware</label>
                    <div className="flex items-center gap-3">
                      <label className="flex-1 cursor-pointer">
                        <div className="border border-dashed border-[#2c3235] rounded p-4 text-center hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                          {firmwareFile ? (
                            <span className="text-[#33a2e5]">{firmwareFile.name}</span>
                          ) : (
                            <span>Glisser-déposer ou <span className="text-[#33a2e5]">parcourir</span></span>
                          )}
                        </div>
                        <input 
                          type="file" 
                          className="hidden"
                          accept=".bin"
                          onChange={(e) => setFirmwareFile(e.target.files?.[0] || null)}
                        />
                      </label>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={handleOtaUpload}
                      disabled={!firmwareFile || isUploading}
                      className="px-4 py-2 bg-[#33a2e5] text-white rounded-md text-sm hover:bg-[#2a8fd6] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Wifi className="w-4 h-4" />
                      Téléverser via OTA
                    </button>
                    
                    <button
                      onClick={handleLocalUpload}
                      disabled={!firmwareFile || isUploading}
                      className="px-4 py-2 border border-[#33a2e5] text-[#33a2e5] rounded-md text-sm hover:bg-[rgba(51,162,229,0.1)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <HardDrive className="w-4 h-4" />
                      Téléverser localement
                    </button>
                  </div>
                  
                  {isUploading && (
                    <div className="space-y-2">
                      <div className="w-full bg-[#141619] rounded-full h-2.5">
                        <div 
                          className="bg-[#33a2e5] h-2.5 rounded-full" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-[#8e9297]">
                        <span>Progression...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {!otaEnabled && (
                <div className="p-4 bg-[#141619] rounded text-sm text-[#8e9297]">
                  <p>Le mode OTA doit être activé pour permettre les mises à jour à distance.</p>
                  <p className="mt-2">Assurez-vous que votre ESP32 est configuré pour accepter les connexions OTA.</p>
                </div>
              )}
            </div>
          </div>

          {/* Section Actions */}
          <div className="bg-[#202226] rounded-lg p-5 lg:col-span-3">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Power className="w-5 h-5" />
              Actions
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button className="px-3 py-2 bg-[#2e343a] hover:bg-[#3a424a] rounded-md text-sm transition-colors flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Redémarrer
              </button>
              <button className="px-3 py-2 bg-[#2e343a] hover:bg-[#3a424a] rounded-md text-sm transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Télécharger logs
              </button>
              <button className="px-3 py-2 bg-[#2e343a] hover:bg-[#3a424a] rounded-md text-sm transition-colors flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Config. avancée
              </button>
              <button className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-md text-sm transition-colors flex items-center gap-2">
                <Power className="w-4 h-4" />
                Éteindre
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

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

function ToggleSwitch({ enabled, setEnabled }: { enabled: boolean, setEnabled: (val: boolean) => void }) {
  return (
    <button
      type="button"
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        enabled ? 'bg-[#33a2e5]' : 'bg-gray-600'
      }`}
      onClick={() => setEnabled(!enabled)}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}