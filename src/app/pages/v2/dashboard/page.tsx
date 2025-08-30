'use client'

import HeaderDefault from "@/components/ui/headers/HeaderDefault"
import { useState } from 'react'
import { useSelector } from 'react-redux'
import MapPanel from '@/components/ui/dashboard/MapPanel'
import CameraPanel from '@/components/ui/dashboard/CameraPanel'
import FuelTanksPanel from '@/components/ui/dashboard/FuelTanksPanel'
import PumpsPanel from '@/components/ui/dashboard/PumpsPanel'
import SalesChart from '@/components/ui/dashboard/SalesChart'
import TransactionTable from '@/components/ui/dashboard/TransactionTable'
import { RootState } from '@/store/store'

// Définition du type Transaction pour correspondre à ce qu'attend TransactionTable
interface Transaction {
  id: number;
  date: string;
  time: string;
  buse: string;
  transaction: string;
  quantite: number;
  prixUnitaire: number;
  montant: number;
  quantiteRestante: number;
  serveur: string;
}

// Prix unitaires des carburants
const FUEL_PRICES = {
  essence1: 840,
  essence2: 840,
  petrol: 350,
  gazoil: 828
} as const

// Noms des buses correspondant aux types de carburant
const BUSES = {
  essence1: "Buse Essence 1",
  essence2: "Buse Essence 2",
  petrol: "Buse Pétrol",
  gazoil: "Buse Gazoil"
} as const

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('today')
  const [selectedFuel, setSelectedFuel] = useState('all')

  // Récupérer les données depuis le store Redux
  const stationData = useSelector((state: RootState) => state.stationData)
  const cameraData = useSelector((state: RootState) => state.cameraData)
  const config = useSelector((state: RootState) => state.config)

  // Générer les données de transaction basées sur les quantités vendues et les prix
  const transactionsData: Transaction[] = [
    {
      id: 1,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      buse: BUSES.essence1,
      transaction: 'Vente',
      quantite: stationData.fuels.essence1,
      prixUnitaire: FUEL_PRICES.essence1,
      montant: stationData.fuels.essence1 * FUEL_PRICES.essence1,
      quantiteRestante: 10000 - stationData.fuels.essence1, // Exemple de calcul
      serveur: 'Serveur1'
    },
    {
      id: 2,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      buse: BUSES.essence2,
      transaction: 'Vente',
      quantite: stationData.fuels.essence2,
      prixUnitaire: FUEL_PRICES.essence2,
      montant: stationData.fuels.essence2 * FUEL_PRICES.essence2,
      quantiteRestante: 10000 - stationData.fuels.essence2,
      serveur: 'Serveur2'
    },
    {
      id: 3,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      buse: BUSES.petrol,
      transaction: 'Vente',
      quantite: stationData.fuels.petrol,
      prixUnitaire: FUEL_PRICES.petrol,
      montant: stationData.fuels.petrol * FUEL_PRICES.petrol,
      quantiteRestante: 15000 - stationData.fuels.petrol,
      serveur: 'Serveur3'
    },
    {
      id: 4,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      buse: BUSES.gazoil,
      transaction: 'Vente',
      quantite: stationData.fuels.gazoil,
      prixUnitaire: FUEL_PRICES.gazoil,
      montant: stationData.fuels.gazoil * FUEL_PRICES.gazoil,
      quantiteRestante: 20000 - stationData.fuels.gazoil,
      serveur: 'Serveur4'
    }
  ]

  // Générer les données de vente en fonction du carburant sélectionné
  const getSalesData = () => {
    const now = new Date()
    const data = []
    
    // Générer des données pour les dernières 24 heures
    for (let i = 0; i < 24; i++) {
      const hour = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000)
      const hourStr = hour.getHours().toString().padStart(2, '0') + ':00'
      
      let value = 0
      switch (selectedFuel) {
        case 'essence1':
          value = Math.round(stationData.fuels.essence1 * (Math.random() * 0.1 + 0.9) / 24)
          break
        case 'essence2':
          value = Math.round(stationData.fuels.essence2 * (Math.random() * 0.1 + 0.9) / 24)
          break
        case 'petrol':
          value = Math.round(stationData.fuels.petrol * (Math.random() * 0.1 + 0.9) / 24)
          break
        case 'gazoil':
          value = Math.round(stationData.fuels.gazoil * (Math.random() * 0.1 + 0.9) / 24)
          break
        case 'all':
        default:
          value = Math.round((stationData.fuels.essence1 + stationData.fuels.essence2 + 
                            stationData.fuels.petrol + stationData.fuels.gazoil) * 
                            (Math.random() * 0.1 + 0.9) / 96)
          break
      }
      
      data.push({ x: hourStr, y: value })
    }
    
    return data
  }

  const salesData = getSalesData()

  return (
    <div className="min-h-screen bg-black">
      <HeaderDefault 
        title="Tableau de bord" 
        stationName={`[${config.stationName}]`} 
      />
      
      {/* Conteneur principal */}
      <div className="flex h-[calc((100vh-38px)/3)] pl-1 pr-1 pt-0.5 gap-1">
        <MapPanel />
        <CameraPanel 
          cameraNumber={1} 
          imageUrl={cameraData.camera1} 
        />
        <CameraPanel 
          cameraNumber={2} 
          imageUrl={cameraData.camera2} 
        />
      </div>

      {/* Conteneur principal 2 */}
      <div className="flex h-[calc((100vh-38px)/3)] pl-1 pr-1 pt-1 gap-1">
        <FuelTanksPanel 
          essence1={stationData.fuels.essence1}
          essence2={stationData.fuels.essence2}
          petrol={stationData.fuels.petrol}
          gazoil={stationData.fuels.gazoil}
        />
        <PumpsPanel 
          pompe1={stationData.pumps.pompe1}
          pompe2={stationData.pumps.pompe2}
          pompe3={stationData.pumps.pompe3}
          pompe4={stationData.pumps.pompe4}
        />
        <SalesChart 
          selectedPeriod={selectedPeriod}
          selectedFuel={selectedFuel}
          onPeriodChange={setSelectedPeriod}
          onFuelChange={setSelectedFuel}
          salesData={salesData}
        />
      </div>

      {/* Conteneur principal 3 */}
      <div className="flex h-[calc((100vh-38px)/3)] pl-1 pr-1 pt-1 pb-0.5 gap-1">
        <TransactionTable 
          transactions={transactionsData}
        />
      </div>
    </div>
  )
}