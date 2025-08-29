'use client'

import { Download, Copy, Printer, ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect, useMemo } from 'react'

export interface Transaction {
  id: number
  date: string
  time: string
  buse: string
  transaction: string
  quantite: number
  prixUnitaire: number
  montant: number
  quantiteRestante: number
  serveur: string
}

interface TransactionTableProps {
  transactions?: Transaction[]
  loading?: boolean
  onExport?: (format: 'csv' | 'xlsx') => void
  onRefresh?: () => void
}

export default function TransactionTable({ 
  transactions = [],
  loading = false,
  onExport,
  onRefresh
}: TransactionTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedPeriod, setSelectedPeriod] = useState('today')
  const [selectedBuse, setSelectedBuse] = useState('all')
  const itemsPerPage = 3

  // Filtrer les transactions selon les sélecteurs
  const filteredTransactions = useMemo(() => {
    let filtered = transactions

    // Filtre par période (simplifié)
    if (selectedPeriod !== 'all') {
      filtered = filtered.filter(tx => {
        // Logique de filtrage par période
        return true // À adapter selon la structure de vos dates
      })
    }

    // Filtre par buse
    if (selectedBuse !== 'all') {
      filtered = filtered.filter(tx => tx.buse === selectedBuse)
    }

    return filtered
  }, [transactions, selectedPeriod, selectedBuse])

  // Pagination
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredTransactions, currentPage])

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedPeriod, selectedBuse])

  // Fonctions d'export
  const handleExport = (format: 'csv' | 'xlsx') => {
    onExport?.(format)
    // Fallback si aucune callback n'est fournie
    if (!onExport) {
      const dataStr = JSON.stringify(filteredTransactions, null, 2)
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`
      const link = document.createElement('a')
      link.setAttribute('href', dataUri)
      link.setAttribute('download', `transactions_${new Date().toISOString()}.${format}`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleCopy = async () => {
    try {
      const text = filteredTransactions.map(tx => 
        Object.values(tx).join('\t')
      ).join('\n')
      
      await navigator.clipboard.writeText(text)
      // Vous pourriez ajouter une notification toast ici
    } catch (err) {
      console.error('Erreur lors de la copie:', err)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex-1 bg-[#202226] rounded-[0.5px] border border-[#2c3235] flex flex-col">
        {/* Header avec skeleton */}
        <div className="h-12 flex items-center justify-between bg-[#25292d] border-b border-[#2c3235] px-4">
          <div className="h-4 w-40 bg-[#2c3235] rounded animate-pulse" />
          <div className="flex items-center space-x-2">
            <div className="h-7 w-24 bg-[#2c3235] rounded animate-pulse" />
            <div className="h-7 w-32 bg-[#2c3235] rounded animate-pulse" />
            <div className="h-7 w-16 bg-[#2c3235] rounded animate-pulse" />
            <div className="h-7 w-16 bg-[#2c3235] rounded animate-pulse" />
            <div className="h-7 w-16 bg-[#2c3235] rounded animate-pulse" />
            <div className="h-7 w-16 bg-[#2c3235] rounded animate-pulse" />
          </div>
        </div>
        
        {/* Body skeleton */}
        <div className="flex-1 overflow-auto p-4 space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-[#2c3235] rounded animate-pulse" />
          ))}
        </div>

        {/* Pagination skeleton */}
        <div className="flex items-center justify-between bg-[#25292d] border-t border-[#2c3235] px-4 py-1 h-8">
          <div className="h-4 w-20 bg-[#2c3235] rounded animate-pulse" />
          <div className="flex space-x-2">
            <div className="h-6 w-16 bg-[#2c3235] rounded animate-pulse" />
            <div className="h-6 w-6 bg-[#2c3235] rounded animate-pulse" />
            <div className="h-6 w-16 bg-[#2c3235] rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-[#202226] rounded-[0.5px] border border-[#2c3235] flex flex-col">
      {/* Header */}
      <div className="h-12 flex items-center justify-between bg-[#25292d] border-b border-[#2c3235] px-4">
        <span className="text-[#c7d0d9] text-xs flex-1">
          Historique des transactions ({filteredTransactions.length} éléments)
        </span>
        
        <div className="flex items-center space-x-2">
          {/* Selectbox pour la période */}
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-[#2c3235] border border-[#3a3f47] text-[#c7d0d9] text-xs rounded px-2 py-1 h-7 focus:outline-none focus:ring-1 focus:ring-[#33a2e5]"
          >
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="all">Toutes</option>
          </select>

          {/* Selectbox pour les buses */}
          <select 
            value={selectedBuse}
            onChange={(e) => setSelectedBuse(e.target.value)}
            className="bg-[#2c3235] border border-[#3a3f47] text-[#c7d0d9] text-xs rounded px-2 py-1 h-7 focus:outline-none focus:ring-1 focus:ring-[#33a2e5]"
          >
            <option value="all">Toutes les buses</option>
            <option value="Gasoil">Gasoil</option>
            <option value="Super">Super</option>
            <option value="Pétrole">Pétrole</option>
          </select>

          {/* Boutons d'action */}
          <button 
            onClick={() => handleExport('csv')}
            className="bg-[#2c3235] border border-[#3a3f47] text-[#c7d0d9] text-xs rounded px-3 py-1 h-7 flex items-center hover:bg-[#33a2e5] hover:text-white transition-colors"
          >
            <Download className="w-3 h-3 mr-1" />
            CSV
          </button>
          <button 
            onClick={() => handleExport('xlsx')}
            className="bg-[#2c3235] border border-[#3a3f47] text-[#c7d0d9] text-xs rounded px-3 py-1 h-7 flex items-center hover:bg-[#33a2e5] hover:text-white transition-colors"
          >
            <Download className="w-3 h-3 mr-1" />
            XLSX
          </button>
          <button 
            onClick={handleCopy}
            className="bg-[#2c3235] border border-[#3a3f47] text-[#c7d0d9] text-xs rounded px-3 py-1 h-7 flex items-center hover:bg-[#33a2e5] hover:text-white transition-colors"
          >
            <Copy className="w-3 h-3 mr-1" />
            Copier
          </button>
          <button 
            onClick={handlePrint}
            className="bg-[#2c3235] border border-[#3a3f47] text-[#c7d0d9] text-xs rounded px-3 py-1 h-7 flex items-center hover:bg-[#33a2e5] hover:text-white transition-colors"
          >
            <Printer className="w-3 h-3 mr-1" />
            Imprimer
          </button>

          {/* Bouton rafraîchissement */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="bg-[#2c3235] border border-[#3a3f47] text-[#c7d0d9] text-xs rounded px-2 py-1 h-7 hover:bg-[#33a2e5] hover:text-white transition-colors"
              title="Rafraîchir"
            >
              ↻
            </button>
          )}
        </div>
      </div>
      
      {/* Body - Tableau */}
      <div className="flex-1 overflow-auto">
        {paginatedTransactions.length > 0 ? (
          <table className="w-full text-xs text-[#c7d0d9]">
            <thead>
              <tr className="bg-[#25292d] border-b border-[#2c3235]">
                <th className="px-3 py-1 text-center font-medium">N°</th>
                <th className="px-3 py-1 text-center font-medium">Date et heure</th>
                <th className="px-3 py-1 text-center font-medium">Buse</th>
                <th className="px-3 py-1 text-center font-medium">Transaction</th>
                <th className="px-3 py-1 text-center font-medium">Quantité (L)</th>
                <th className="px-3 py-1 text-center font-medium">Prix unitaire</th>
                <th className="px-3 py-1 text-center font-medium">Montant (F)</th>
                <th className="px-3 py-1 text-center font-medium">Reste (L)</th>
                <th className="px-3 py-1 text-center font-medium">Serveur</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.map((transaction, index) => {
                const globalIndex = (currentPage - 1) * itemsPerPage + index + 1
                return (
                  <tr key={transaction.id} className="border-b border-[#2c3235] hover:bg-[#25292d] transition-colors">
                    <td className="px-3 py-1 text-center">{globalIndex}</td>
                    <td className="px-3 py-1 text-center">{transaction.date} {transaction.time}</td>
                    <td className="px-3 py-1 text-center">{transaction.buse}</td>
                    <td className="px-3 py-1 text-center">{transaction.transaction}</td>
                    <td className="px-3 py-1 text-center">{transaction.quantite.toFixed(2)}</td>
                    <td className="px-3 py-1 text-center">{transaction.prixUnitaire}</td>
                    <td className="px-3 py-1 text-center">{transaction.montant.toLocaleString()}</td>
                    <td className="px-3 py-1 text-center">{transaction.quantiteRestante.toLocaleString()}</td>
                    <td className="px-3 py-1 text-center">{transaction.serveur}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="h-full flex items-center justify-center text-[#8e9297] text-sm">
            Aucune transaction trouvée
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredTransactions.length > 0 && (
        <div className="flex items-center justify-between bg-[#25292d] border-t border-[#2c3235] px-4 py-1 h-8">
          <span className="text-xs text-[#8e9297]">
            {filteredTransactions.length} élément{filteredTransactions.length > 1 ? 's' : ''}
          </span>
          <div className="flex space-x-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="bg-[#2c3235] border border-[#3a3f47] text-[#c7d0d9] text-xs rounded px-3 py-1 h-6 hover:bg-[#33a2e5] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <ChevronLeft className="w-3 h-3 mr-1" />
              Précédent
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                if (pageNum > totalPages) return null
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-6 h-6 text-xs rounded ${
                      currentPage === pageNum
                        ? 'bg-[#33a2e5] border border-[#33a2e5] text-white'
                        : 'bg-[#2c3235] border border-[#3a3f47] text-[#c7d0d9] hover:bg-[#33a2e5] hover:text-white'
                    } transition-colors`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>

            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="bg-[#2c3235] border border-[#3a3f47] text-[#c7d0d9] text-xs rounded px-3 py-1 h-6 hover:bg-[#33a2e5] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              Suivant
              <ChevronRight className="w-3 h-3 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}