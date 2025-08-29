'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import {
  UserCircle,
  Settings,
  Cpu,
  Menu,
  X,
  LayoutDashboard,
  Upload,
  Download,
  Construction,
  BarChart3,
  Fuel
} from 'lucide-react'

interface SidebarLayoutProps {
  children: React.ReactNode
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeIcon, setActiveIcon] = useState<string>('dashboard')

  // Déterminer l'icône active en fonction du chemin
  useEffect(() => {
    const path = pathname.split('/').pop() || 'dashboard'
    setActiveIcon(path)
  }, [pathname])

  // Vérifier si on est en mode mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  // Gérer la sélection d'une icône du sidebar
  const handleSidebarIconSelect = (path: string) => {
    router.push(`/pages/v2/${path}`)
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  // Icônes du haut du sidebar (6 icônes)
  const topIcons = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'Carburant', name: 'Carburant', icon: Fuel},
    { id: 'construction', name: 'Construction', icon: Construction },
    { id: 'statistiques', name: 'Statistiques', icon: BarChart3 },
    { id: 'upload', name: 'Upload', icon: Upload },
    { id: 'download', name: 'Download', icon: Download },
  ]

  // Icônes du bas du sidebar (3 icônes)
  const bottomIcons = [
    { id: 'hardware', name: 'Hardware', icon: Cpu },
    { id: 'compte', name: 'Compte', icon: UserCircle },
    { id: 'parametres', name: 'Paramètres', icon: Settings },
  ]

  return (
    <div className="flex h-screen bg-black text-[#c7d0d9]">
      {/* Bouton menu mobile */}
      {isMobile && (
        <button
          className="fixed top-4 left-4 z-50 p-2 bg-[#202226] rounded-md text-[#8e9297] hover:text-[#58b3ea]"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`
          h-full bg-[#202226] flex flex-col
          transition-all duration-300 z-40
          ${isMobile ? 
            (sidebarOpen ? 'translate-x-0 w-[58px] fixed inset-y-0 left-0' : '-translate-x-full w-0') : 
            'w-[58px] translate-x-0'
          }
        `}
      >
        {/* Premier bloc: 56px de hauteur avec icône active */}
        <div className="h-10 bg-black border-b border-[#2c3235] flex items-center justify-center">
          <div className="flex items-center justify-center w-8 h-8 relative">
            {/* Icône active normale */}
            <div>
              {(() => {
                const activeIconData = [...topIcons, ...bottomIcons].find(icon => icon.id === activeIcon);
                const IconComponent = activeIconData?.icon || LayoutDashboard;
                return <IconComponent className="w-6 h-6 text-[#33a2e5]" />;
              })()}
            </div>
          </div>
        </div>

        {/* Second bloc: occupe le reste de la hauteur */}
        <div className="flex-1 flex flex-col justify-between border-r border-[#2c3235] ">
          {/* 6 icônes en haut */}
          <div className="py-2">
            {topIcons.map((item) => {
              const Icon = item.icon
              const isActive = activeIcon === item.id
              
              return (
                <SidebarIcon
                  key={item.id}
                  Icon={Icon}
                  tooltip={item.name}
                  active={isActive}
                  onClick={() => handleSidebarIconSelect(item.id)}
                />
              )
            })}
          </div>

          {/* 3 icônes en bas */}
          <div className="border-t border-[#2c3235] py-2">
            {bottomIcons.map((item) => {
              const Icon = item.icon
              const isActive = activeIcon === item.id
              
              return (
                <SidebarIcon
                  key={item.id}
                  Icon={Icon}
                  tooltip={item.name}
                  active={isActive}
                  onClick={() => handleSidebarIconSelect(item.id)}
                />
              )
            })}
          </div>
        </div>
      </aside>

      {/* Overlay mobile */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Contenu principal */}
      <main className={`flex-1 overflow-auto transition-all duration-300 ${isMobile && sidebarOpen ? 'ml-0' : 'ml-0'}`}>
        <div className="min-h-screen bg-black">
          {children}
        </div>
      </main>
    </div>
  )
}

// Composant SidebarIcon avec bordure droite bleue
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
        className={`w-full py-3 px-0 flex justify-center items-center transition-all relative
          ${active 
            ? 'text-[#33a2e5] bg-[rgba(51,162,229,0.1)] border-r-2 border-[#33a2e5]' 
            : 'text-[#8e9297] hover:text-[#58b3ea] hover:bg-[rgba(255,255,255,0.05)]'
          }`}
        onClick={onClick}
      >
        <Icon className="w-5 h-5" />
      </button>

      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2
        bg-[#202226] text-white px-3 py-1 rounded text-xs
        opacity-0 pointer-events-none transition-opacity
        whitespace-nowrap z-50 group-hover:opacity-100">
        {tooltip}
      </div>
    </div>
  )
}