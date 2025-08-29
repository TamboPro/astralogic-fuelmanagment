// app/compte/page.tsx
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
} from 'lucide-react'
import { GeistSans } from 'geist/font'

export default function AccountPage() {
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
      <main className="flex-1 overflow-y-auto p-4 text-sm font-light">
        <h1 className="text-2xl font-semibold mb-4">Compte</h1>
        <div className="text-[#8e9297]">
          <p>Gestion de compte utilisateur</p>
          {/* Ajoutez ici le contenu spécifique de la page Compte */}
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