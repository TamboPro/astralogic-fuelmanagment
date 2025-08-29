// app/pages/reglages/page.tsx
'use client'

import React, { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Upload,
  Download,
  Settings,
  Cpu,
  UserCircle,
  Settings2,
  Construction,
  Wifi,
  Bell,
  Clock,
  Shield,
} from 'lucide-react'
import { GeistSans } from 'geist/font'

export default function ReglagesPage() {
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

  const getActiveItem = () => {
    const path = pathname.split('/').pop() || 'dashboard'
    const allItems = [...menuItems.top, ...menuItems.bottom]
    const foundItem = allItems.find(item => 
      item.path.toLowerCase().includes(path.toLowerCase())
    )
    return foundItem?.id || 'Dashboard'
  }

  const [activeItem, setActiveItem] = useState(getActiveItem())
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const [autoUpdate, setAutoUpdate] = useState(false)

  const navigateTo = (path: string) => {
    router.push(path)
    setActiveItem(
      [...menuItems.top, ...menuItems.bottom].find(item => item.path === path)?.id || 'Dashboard'
    )
  }

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
          <Settings2 className="w-6 h-6" />
          Réglages
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
          {/* Section Connexion */}
          <div className="bg-[#202226] rounded-lg p-5">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Wifi className="w-5 h-5" />
              Connexion
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[#8e9297] mb-1">SSID WiFi</label>
                <input 
                  type="text" 
                  className="w-full bg-[#141619] border border-[#2c3235] rounded px-3 py-2 text-sm"
                  defaultValue="MonRéseauWiFi"
                />
              </div>
              
              <div>
                <label className="block text-[#8e9297] mb-1">Mot de passe WiFi</label>
                <input 
                  type="password" 
                  className="w-full bg-[#141619] border border-[#2c3235] rounded px-3 py-2 text-sm"
                  defaultValue="••••••••"
                />
              </div>
              
              <button className="mt-2 px-4 py-2 bg-[#33a2e5] text-white rounded-md text-sm hover:bg-[#2a8fd6] transition-colors">
                Enregistrer les paramètres WiFi
              </button>
            </div>
          </div>

          {/* Section Notifications */}
          <div className="bg-[#202226] rounded-lg p-5">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Activer les notifications</span>
                <ToggleSwitch 
                  enabled={notificationsEnabled} 
                  setEnabled={setNotificationsEnabled} 
                />
              </div>
              
              <div className="pt-2">
                <label className="block text-[#8e9297] mb-1">Fréquence des alertes</label>
                <select className="w-full bg-[#141619] border border-[#2c3235] rounded px-3 py-2 text-sm">
                  <option>Immédiatement</option>
                  <option>Toutes les heures</option>
                  <option>Quotidiennes</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section Apparence */}
          <div className="bg-[#202226] rounded-lg p-5">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <UserCircle className="w-5 h-5" />
              Apparence
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Mode sombre</span>
                <ToggleSwitch 
                  enabled={darkMode} 
                  setEnabled={setDarkMode} 
                />
              </div>
              
              <div>
                <label className="block text-[#8e9297] mb-1">Taille de texte</label>
                <select className="w-full bg-[#141619] border border-[#2c3235] rounded px-3 py-2 text-sm">
                  <option>Petit</option>
                  <option selected>Moyen</option>
                  <option>Grand</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section Système */}
          <div className="bg-[#202226] rounded-lg p-5">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Cpu className="w-5 h-5" />
              Système
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Mises à jour automatiques</span>
                <ToggleSwitch 
                  enabled={autoUpdate} 
                  setEnabled={setAutoUpdate} 
                />
              </div>
              
              <div>
                <label className="block text-[#8e9297] mb-1">Intervalle de sauvegarde</label>
                <select className="w-full bg-[#141619] border border-[#2c3235] rounded px-3 py-2 text-sm">
                  <option>Quotidien</option>
                  <option selected>Hebdomadaire</option>
                  <option>Mensuel</option>
                </select>
              </div>
              
              <button className="mt-2 px-4 py-2 border border-red-500 text-red-500 rounded-md text-sm hover:bg-[rgba(239,68,68,0.1)] transition-colors">
                Réinitialiser les paramètres
              </button>
            </div>
          </div>

          {/* Section Sécurité */}
          <div className="bg-[#202226] rounded-lg p-5 lg:col-span-2">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Sécurité
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#8e9297] mb-1">Mot de passe admin</label>
                <input 
                  type="password" 
                  className="w-full bg-[#141619] border border-[#2c3235] rounded px-3 py-2 text-sm"
                  placeholder="Nouveau mot de passe"
                />
              </div>
              
              <div>
                <label className="block text-[#8e9297] mb-1">Confirmation</label>
                <input 
                  type="password" 
                  className="w-full bg-[#141619] border border-[#2c3235] rounded px-3 py-2 text-sm"
                  placeholder="Confirmer le mot de passe"
                />
              </div>
              
              <div className="md:col-span-2 flex justify-end space-x-3 pt-2">
                <button className="px-4 py-2 border border-[#33a2e5] text-[#33a2e5] rounded-md text-sm hover:bg-[rgba(51,162,229,0.1)] transition-colors">
                  Tester la connexion
                </button>
                <button className="px-4 py-2 bg-[#33a2e5] text-white rounded-md text-sm hover:bg-[#2a8fd6] transition-colors">
                  Sauvegarder
                </button>
              </div>
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