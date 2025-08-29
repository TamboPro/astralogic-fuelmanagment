// app/pages/parametres/page.tsx
'use client'

import React, { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Settings,
  Cpu,
  UserCircle,
  Settings2,
  Construction,
  Key,
  Server,
  Wifi,
  Lock,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  TestTube2,
} from 'lucide-react'
import { GeistSans } from 'geist/font'

type ApiConfig = {
  id: string
  name: string
  endpoint: string
  apiKey: string
  isActive: boolean
}

type MqttConfig = {
  id: string
  name: string
  brokerUrl: string
  username: string
  password: string
  useTLS: boolean
  port: number
}

type WsConfig = {
  id: string
  name: string
  url: string
  protocol: string
  autoReconnect: boolean
}

export default function ParametresPage() {
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

  // États pour les configurations
  const [apiConfigs, setApiConfigs] = useState<ApiConfig[]>([
    {
      id: '1',
      name: 'API Météo',
      endpoint: 'https://api.weatherapi.com/v1',
      apiKey: 'w3ath3r4p1k3y123',
      isActive: true
    }
  ])
  
  const [mqttConfigs, setMqttConfigs] = useState<MqttConfig[]>([
    {
      id: '1',
      name: 'Broker Principal',
      brokerUrl: 'mqtt://home.broker',
      username: 'iotuser',
      password: 'securepassword',
      useTLS: false,
      port: 1883
    }
  ])
  
  const [wsConfigs, setWsConfigs] = useState<WsConfig[]>([
    {
      id: '1',
      name: 'WS Temps Réel',
      url: 'wss://realtime.example.com/ws',
      protocol: 'wss',
      autoReconnect: true
    }
  ])
  
  const [showApiKey, setShowApiKey] = useState(false)
  const [showMqttPassword, setShowMqttPassword] = useState(false)
  const [activeTab, setActiveTab] = useState<'api' | 'mqtt' | 'ws'>('api')
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{success: boolean, message: string} | null>(null)

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

  // Gestion des configurations API
  const addApiConfig = () => {
    setApiConfigs([
      ...apiConfigs,
      {
        id: Date.now().toString(),
        name: `Nouvelle API ${apiConfigs.length + 1}`,
        endpoint: '',
        apiKey: '',
        isActive: false
      }
    ])
  }

  const updateApiConfig = (id: string, field: keyof ApiConfig, value: any) => {
    setApiConfigs(apiConfigs.map(config => 
      config.id === id ? { ...config, [field]: value } : config
    ))
  }

  const removeApiConfig = (id: string) => {
    setApiConfigs(apiConfigs.filter(config => config.id !== id))
  }

  // Gestion des configurations MQTT
  const addMqttConfig = () => {
    setMqttConfigs([
      ...mqttConfigs,
      {
        id: Date.now().toString(),
        name: `Nouveau Broker ${mqttConfigs.length + 1}`,
        brokerUrl: '',
        username: '',
        password: '',
        useTLS: false,
        port: 1883
      }
    ])
  }

  const updateMqttConfig = (id: string, field: keyof MqttConfig, value: any) => {
    setMqttConfigs(mqttConfigs.map(config => 
      config.id === id ? { ...config, [field]: value } : config
    ))
  }

  const removeMqttConfig = (id: string) => {
    setMqttConfigs(mqttConfigs.filter(config => config.id !== id))
  }

  // Gestion des configurations WebSocket
  const addWsConfig = () => {
    setWsConfigs([
      ...wsConfigs,
      {
        id: Date.now().toString(),
        name: `Nouvelle Connexion ${wsConfigs.length + 1}`,
        url: '',
        protocol: 'wss',
        autoReconnect: true
      }
    ])
  }

  const updateWsConfig = (id: string, field: keyof WsConfig, value: any) => {
    setWsConfigs(wsConfigs.map(config => 
      config.id === id ? { ...config, [field]: value } : config
    ))
  }

  const removeWsConfig = (id: string) => {
    setWsConfigs(wsConfigs.filter(config => config.id !== id))
  }

  // Tester la connexion
  const testConnection = () => {
    setIsTesting(true)
    setTestResult(null)
    
    // Simulation de test de connexion
    setTimeout(() => {
      setIsTesting(false)
      setTestResult({
        success: Math.random() > 0.3,
        message: Math.random() > 0.3 
          ? 'Connexion établie avec succès' 
          : 'Échec de la connexion - Vérifiez vos paramètres'
      })
    }, 2000)
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
          <Settings className="w-6 h-6" />
          Paramètres Avancés
        </h1>
        
        {/* Navigation par onglets */}
        <div className="flex border-b border-[#2c3235] mb-6">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'api' ? 'text-[#33a2e5] border-b-2 border-[#33a2e5]' : 'text-[#8e9297] hover:text-[#c7d0d9]'}`}
            onClick={() => setActiveTab('api')}
          >
            <Key className="inline mr-2 w-4 h-4" />
            Configurations API
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'mqtt' ? 'text-[#33a2e5] border-b-2 border-[#33a2e5]' : 'text-[#8e9297] hover:text-[#c7d0d9]'}`}
            onClick={() => setActiveTab('mqtt')}
          >
            <Server className="inline mr-2 w-4 h-4" />
            Connexion MQTT
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'ws' ? 'text-[#33a2e5] border-b-2 border-[#33a2e5]' : 'text-[#8e9297] hover:text-[#c7d0d9]'}`}
            onClick={() => setActiveTab('ws')}
          >
            <Wifi className="inline mr-2 w-4 h-4" />
            WebSockets
          </button>
        </div>
        
        {/* Contenu des onglets */}
        <div className="space-y-6">
          {/* Onglet API */}
          {activeTab === 'api' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Configurations API
                </h2>
                <button
                  onClick={addApiConfig}
                  className="px-3 py-1 bg-[#33a2e5] text-white rounded-md text-sm hover:bg-[#2a8fd6] transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </button>
              </div>
              
              {apiConfigs.map((config) => (
                <div key={config.id} className="bg-[#202226] rounded-lg p-5">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={config.isActive}
                        onChange={(e) => updateApiConfig(config.id, 'isActive', e.target.checked)}
                        className="h-4 w-4 rounded border-[#2c3235] bg-[#141619] text-[#33a2e5] focus:ring-[#33a2e5]"
                      />
                      <input
                        type="text"
                        value={config.name}
                        onChange={(e) => updateApiConfig(config.id, 'name', e.target.value)}
                        className="bg-transparent border-b border-[#2c3235] focus:border-[#33a2e5] outline-none"
                      />
                    </div>
                    <button
                      onClick={() => removeApiConfig(config.id)}
                      className="text-[#8e9297] hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[#8e9297] mb-1">Endpoint</label>
                      <input
                        type="text"
                        value={config.endpoint}
                        onChange={(e) => updateApiConfig(config.id, 'endpoint', e.target.value)}
                        className="w-full bg-[#141619] border border-[#2c3235] rounded px-3 py-2 text-sm"
                        placeholder="https://api.example.com/v1"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[#8e9297] mb-1">Clé API</label>
                      <div className="relative">
                        <input
                          type={showApiKey ? "text" : "password"}
                          value={config.apiKey}
                          onChange={(e) => updateApiConfig(config.id, 'apiKey', e.target.value)}
                          className="w-full bg-[#141619] border border-[#2c3235] rounded px-3 py-2 text-sm pr-10"
                        />
                        <button
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#8e9297] hover:text-[#c7d0d9]"
                        >
                          {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Onglet MQTT */}
          {activeTab === 'mqtt' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  Configuration MQTT
                </h2>
                <button
                  onClick={addMqttConfig}
                  className="px-3 py-1 bg-[#33a2e5] text-white rounded-md text-sm hover:bg-[#2a8fd6] transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </button>
              </div>
              
              {mqttConfigs.map((config) => (
                <div key={config.id} className="bg-[#202226] rounded-lg p-5">
                  <div className="flex justify-between items-center mb-4">
                    <input
                      type="text"
                      value={config.name}
                      onChange={(e) => updateMqttConfig(config.id, 'name', e.target.value)}
                      className="bg-transparent border-b border-[#2c3235] focus:border-[#33a2e5] outline-none font-medium"
                    />
                    <button
                      onClick={() => removeMqttConfig(config.id)}
                      className="text-[#8e9297] hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#8e9297] mb-1">URL du Broker</label>
                      <input
                        type="text"
                        value={config.brokerUrl}
                        onChange={(e) => updateMqttConfig(config.id, 'brokerUrl', e.target.value)}
                        className="w-full bg-[#141619] border border-[#2c3235] rounded px-3 py-2 text-sm"
                        placeholder="mqtt://broker.example.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[#8e9297] mb-1">Port</label>
                      <input
                        type="number"
                        value={config.port}
                        onChange={(e) => updateMqttConfig(config.id, 'port', parseInt(e.target.value))}
                        className="w-full bg-[#141619] border border-[#2c3235] rounded px-3 py-2 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[#8e9297] mb-1">Nom d'utilisateur</label>
                      <input
                        type="text"
                        value={config.username}
                        onChange={(e) => updateMqttConfig(config.id, 'username', e.target.value)}
                        className="w-full bg-[#141619] border border-[#2c3235] rounded px-3 py-2 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[#8e9297] mb-1">Mot de passe</label>
                      <div className="relative">
                        <input
                          type={showMqttPassword ? "text" : "password"}
                          value={config.password}
                          onChange={(e) => updateMqttConfig(config.id, 'password', e.target.value)}
                          className="w-full bg-[#141619] border border-[#2c3235] rounded px-3 py-2 text-sm pr-10"
                        />
                        <button
                          onClick={() => setShowMqttPassword(!showMqttPassword)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#8e9297] hover:text-[#c7d0d9]"
                        >
                          {showMqttPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between md:col-span-2 pt-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={config.useTLS}
                          onChange={(e) => updateMqttConfig(config.id, 'useTLS', e.target.checked)}
                          className="h-4 w-4 rounded border-[#2c3235] bg-[#141619] text-[#33a2e5] focus:ring-[#33a2e5]"
                        />
                        <span>Utiliser TLS/SSL</span>
                      </label>
                      
                      <button
                        onClick={testConnection}
                        disabled={isTesting}
                        className="px-3 py-1 bg-[#33a2e5] text-white rounded-md text-sm hover:bg-[#2a8fd6] transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        <TestTube2 className="w-4 h-4" />
                        {isTesting ? 'Test en cours...' : 'Tester la connexion'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {testResult && (
                <div className={`p-3 rounded-md ${testResult.success ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                  {testResult.message}
                </div>
              )}
            </div>
          )}
          
          {/* Onglet WebSockets */}
          {activeTab === 'ws' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium flex items-center gap-2">
                  <Wifi className="w-5 h-5" />
                  Configurations WebSocket
                </h2>
                <button
                  onClick={addWsConfig}
                  className="px-3 py-1 bg-[#33a2e5] text-white rounded-md text-sm hover:bg-[#2a8fd6] transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </button>
              </div>
              
              {wsConfigs.map((config) => (
                <div key={config.id} className="bg-[#202226] rounded-lg p-5">
                  <div className="flex justify-between items-center mb-4">
                    <input
                      type="text"
                      value={config.name}
                      onChange={(e) => updateWsConfig(config.id, 'name', e.target.value)}
                      className="bg-transparent border-b border-[#2c3235] focus:border-[#33a2e5] outline-none font-medium"
                    />
                    <button
                      onClick={() => removeWsConfig(config.id)}
                      className="text-[#8e9297] hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[#8e9297] mb-1">URL WebSocket</label>
                      <input
                        type="text"
                        value={config.url}
                        onChange={(e) => updateWsConfig(config.id, 'url', e.target.value)}
                        className="w-full bg-[#141619] border border-[#2c3235] rounded px-3 py-2 text-sm"
                        placeholder="wss://example.com/socket"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[#8e9297] mb-1">Protocole</label>
                        <select
                          value={config.protocol}
                          onChange={(e) => updateWsConfig(config.id, 'protocol', e.target.value)}
                          className="w-full bg-[#141619] border border-[#2c3235] rounded px-3 py-2 text-sm"
                        >
                          <option value="ws">ws:// (non sécurisé)</option>
                          <option value="wss">wss:// (sécurisé)</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center justify-between pt-6">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={config.autoReconnect}
                            onChange={(e) => updateWsConfig(config.id, 'autoReconnect', e.target.checked)}
                            className="h-4 w-4 rounded border-[#2c3235] bg-[#141619] text-[#33a2e5] focus:ring-[#33a2e5]"
                          />
                          <span>Reconnexion automatique</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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