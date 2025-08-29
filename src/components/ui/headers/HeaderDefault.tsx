// components/ui/HeaderDefault.tsx
'use client'

import { UserCircle, Search, RefreshCw, X } from 'lucide-react'
import { useState, useRef } from 'react'

interface HeaderDefaultProps {
  title: string
  stationName?: string
  className?: string
  onStationSearch?: (stationName: string) => void
  onRefresh?: () => void
  searchSuggestions?: string[] // Suggestions de stations
}

export default function HeaderDefault({
  title,
  stationName = '[Nom de la station]',
  className = '',
  onStationSearch,
  onRefresh,
  searchSuggestions = []
}: HeaderDefaultProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const searchRef = useRef<HTMLDivElement>(null)

  // Fermer la recherche si on clique en dehors
  const handleClickOutside = (event: MouseEvent) => {
    if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
      setShowSearch(false)
      setIsSearchFocused(false)
    }
  }

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

  return (
    <header className={`h-[38px] bg-black flex items-center justify-between pl-1.5 pr-6 ${className}`}>
      {/* Partie gauche */}
      <div className="flex items-center space-x-4">
        <span className="text-[#8e9297] font-semibold text-sm">FUEL MANAGEMENT SYSTEME</span>
        <span className="text-[#8e9297] text-sm">{stationName}</span>
        <span className="text-[#8e9297] text-sm">-</span>
        <span className="text-white text-sm">{title}</span>
      </div>

      {/* Partie droite */}
      <div className="flex items-center space-x-4">
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
                  className="bg-[#2c3235] border border-[#3a3f47] text-[#c7d0d9] text-xs rounded-full pl-3 pr-8 py-1.5 w-48 focus:outline-none focus:ring-1 focus:ring-[#33a2e5]"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-8 top-1/2 transform -translate-y-1/2 text-[#8e9297] hover:text-[#33a2e5]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#8e9297] hover:text-[#33a2e5]"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>

              {/* Suggestions de recherche */}
              {filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#2c3235] border border-[#3a3f47] rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  {filteredSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-3 py-2 text-left text-xs text-[#c7d0d9] hover:bg-[#33a2e5] hover:text-white transition-colors first:rounded-t-lg last:rounded-b-lg"
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
              className="p-1.5 text-[#8e9297] hover:text-[#33a2e5] hover:bg-[#2c3235] rounded-full transition-colors"
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
            className="p-1.5 text-[#8e9297] hover:text-[#33a2e5] hover:bg-[#2c3235] rounded-full transition-colors"
            title="Rafraîchir les données"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}

        {/* Message de bienvenue + avatar */}
        <div className="flex items-center space-x-3">
          <span className="text-[#c7d0d9] text-sm hidden md:block">Hi, Diletta</span>
          <UserCircle className="w-6 h-6 text-[#33a2e5]" />
        </div>
      </div>
    </header>
  )
}