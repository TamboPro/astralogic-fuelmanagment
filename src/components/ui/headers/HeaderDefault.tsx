// components/ui/HeaderDefault.tsx
'use client'

import { 
  UserCircle, 
  Search, 
  RefreshCw, 
  X, 
  Wifi, 
  WifiOff, 
  CloudCog,
  Server,
  Database,
  Circle
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setConnected, setConnecting, setConnectionError, RootState } from '@/store/store'
import { useMqttActions } from '@/hooks/useMqttActions'
import Image from 'next/image'

interface HeaderDefaultProps {
  title: string
  stationName?: string
  className?: string
  onStationSearch?: (stationName: string) => void
  onRefresh?: () => void
  searchSuggestions?: string[]
}

export default function HeaderDefault({
  title,
  stationName = '[Nom de la station]',
  className = '',
  onStationSearch,
  onRefresh,
  searchSuggestions = []
}: HeaderDefaultProps) {
  const dispatch = useDispatch()
  const connection = useSelector((state: RootState) => state.connection)
  const config = useSelector((state: RootState) => state.config)
  
  const { connectMqtt, disconnectMqtt, isConnected } = useMqttActions()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const [showMqttStats, setShowMqttStats] = useState(false)
  const [showCameroon, setShowCameroon] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)

  // Alternance entre les logos toutes les 10 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCameroon(prev => !prev)
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  // Fermer la recherche et les stats si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false)
        setIsSearchFocused(false)
      }
      if (statsRef.current && !statsRef.current.contains(event.target as Node) && showMqttStats) {
        setShowMqttStats(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMqttStats])

  // Filtrer les suggestions en fonction de la recherche
  const updateFilteredSuggestions = () => {
    if (searchQuery.trim() && searchSuggestions.length > 0) {
      const filtered = searchSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredSuggestions(filtered)
    } else {
      setFilteredSuggestions([])
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim() && onStationSearch) {
      onStationSearch(searchQuery.trim())
      setShowSearch(false)
      setSearchQuery('')
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    if (onStationSearch) {
      onStationSearch(suggestion)
    }
    setSearchQuery('')
    setShowSearch(false)
    setFilteredSuggestions([])
  }

  const clearSearch = () => {
    setSearchQuery('')
    setFilteredSuggestions([])
  }

  // Gestion des actions MQTT
  const handleMqttAction = () => {
    if (connection.isConnected) {
      disconnectMqtt()
    } else {
      dispatch(setConnecting())
      connectMqtt()
    }
  }

  // Obtenir la classe CSS en fonction du statut MQTT
  const getMqttStatusClass = () => {
    switch (connection.connectionStatus) {
      case 'connected': return 'bg-green-600 hover:bg-green-700'
      case 'connecting': return 'bg-yellow-600 hover:bg-yellow-700 animate-pulse'
      case 'error': return 'bg-red-600 hover:bg-red-700'
      default: return 'bg-gray-600 hover:bg-gray-700'
    }
  }

  // Obtenir l'icône en fonction du statut MQTT
  const getMqttIcon = () => {
    switch (connection.connectionStatus) {
      case 'connected': return <Wifi className="w-3 h-3" />
      case 'connecting': return <RefreshCw className="w-3 h-3 animate-spin" />
      case 'error': return <WifiOff className="w-3 h-3" />
      default: return <WifiOff className="w-3 h-3" />
    }
  }

  // Obtenir le texte en fonction du statut MQTT
  const getMqttText = () => {
    switch (connection.connectionStatus) {
      case 'connected': return 'Connecté'
      case 'connecting': return 'Connexion...'
      case 'error': return 'Erreur'
      default: return 'Déconnecté'
    }
  }

  // Formater l'horodatage
  const formatTimestamp = (timestamp: number | null) => {
    if (!timestamp) return 'N/A'
    return new Date(timestamp).toLocaleTimeString()
  }

  return (
    <header className={`h-[40px] bg-gray-900 border-b border-gray-700 flex items-center justify-between px-4 ${className}`}>
      {/* Partie gauche - Alternance entre les logos */}
      <div className="flex items-center space-x-4">
        {showCameroon ? (
          // Mode Cameroon - Images + texte
          <div className="flex items-center space-x-2">
            <div className="relative w-6 h-6">
              <Image
                src="/assets/images/dacmir.png"
                alt="Dacmir Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-gray-300 font-semibold text-sm">Made in Cameroon</span>
            <div className="relative w-6 h-4">
              <Image
                src="/assets/images/Cameroun.png"
                alt="Drapeau Cameroun"
                fill
                className="object-contain"
              />
            </div>
          </div>
        ) : (
          // Mode normal - Cloud + texte
          <div className="flex items-center">
            <CloudCog className="w-5 h-5 text-blue-400 mr-2" />
            <span className="text-gray-300 font-semibold text-sm">FUEL MANAGEMENT SYSTEM</span>
          </div>
        )}
        
        <div className="h-4 w-px bg-gray-600"></div>
        <span className="text-gray-400 text-sm">{stationName}</span>
        <div className="h-4 w-px bg-gray-600"></div>
        <span className="text-white text-sm font-medium">{title}</span>
      </div>

      {/* Partie droite */}
      <div className="flex items-center space-x-3">
        {/* Contrôle MQTT avec indicateur de statut */}
        <div className="relative" ref={statsRef}>
          <button
            onClick={() => setShowMqttStats(!showMqttStats)}
            className={`px-3 py-1.5 rounded-full flex items-center gap-2 text-xs text-white ${getMqttStatusClass()} transition-all duration-200 hover:shadow-lg`}
          >
            {getMqttIcon()}
            <span className="hidden sm:inline">{getMqttText()}</span>
            <Circle className="w-2 h-2" fill="currentColor" />
          </button>

          {/* Popup des statistiques MQTT */}
          {showMqttStats && (
            <div className="absolute top-full right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 w-64 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">Statut MQTT</h3>
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    connection.connectionStatus === 'connected' ? 'bg-green-400' : 
                    connection.connectionStatus === 'connecting' ? 'bg-yellow-400' : 
                    connection.connectionStatus === 'error' ? 'bg-red-400' : 'bg-gray-400'
                  }`}></div>
                  <span className="text-xs text-gray-300">{getMqttText()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                <div className="bg-gray-700 p-2 rounded text-center">
                  <div className="font-bold text-white">{connection.connectionStats.messagesSent}</div>
                  <div className="text-gray-400">Messages envoyés</div>
                </div>
                <div className="bg-gray-700 p-2 rounded text-center">
                  <div className="font-bold text-white">{connection.connectionStats.messagesReceived}</div>
                  <div className="text-gray-400">Messages reçus</div>
                </div>
              </div>

              <div className="text-xs text-gray-400 mb-3">
                <div>Dernier message: {formatTimestamp(connection.connectionStats.lastMessageTimestamp)}</div>
                <div>Broker: {config.mqttUrl}</div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleMqttAction}
                  className={`flex-1 py-1.5 px-2 rounded text-xs font-medium ${
                    connection.connectionStatus === 'connected' 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  } transition-colors`}
                >
                  {connection.connectionStatus === 'connected' ? 'Déconnecter' : 'Connecter'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Indicateurs de statut des autres services */}
        <div className="flex items-center space-x-2">
          <div className="relative group">
            <Server className={`w-4 h-4 ${config.restUrl ? 'text-green-400' : 'text-gray-500'}`} />
            <div className="absolute invisible group-hover:visible bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-xs text-white rounded shadow-lg">
              REST API
            </div>
          </div>
          
          <div className="relative group">
            <Database className={`w-4 h-4 ${config.graphqlUrl ? 'text-green-400' : 'text-gray-500'}`} />
            <div className="absolute invisible group-hover:visible bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-xs text-white rounded shadow-lg">
              GraphQL
            </div>
          </div>
        </div>

        {/* Séparateur */}
        <div className="h-6 w-px bg-gray-600"></div>

        {/* Zone de recherche avec suggestions */}
        <div ref={searchRef} className="relative">
          {showSearch ? (
            <div className="relative">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    updateFilteredSuggestions()
                  }}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder="Rechercher une station..."
                  className="bg-gray-700 border border-gray-600 text-gray-200 text-xs rounded-full pl-3 pr-8 py-1.5 w-48 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>

              {/* Suggestions de recherche */}
              {filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  {filteredSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-3 py-2 text-left text-xs text-gray-200 hover:bg-blue-500 hover:text-white transition-colors first:rounded-t-lg last:rounded-b-lg"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-full transition-colors"
              title="Rechercher une station"
            >
              <Search className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Bouton rafraîchissement */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-full transition-colors"
            title="Rafraîchir les données"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}

        {/* Message de bienvenue + avatar */}
        <div className="flex items-center space-x-3 pl-2">
          <span className="text-gray-300 text-sm hidden md:block">Hi, Diletta</span>
          <div className="relative">
            <UserCircle className="w-6 h-6 text-blue-400" />
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 rounded-full border border-gray-900"></div>
          </div>
        </div>
      </div>
    </header>
  )
}