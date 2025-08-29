'use client'

import HeaderDefault from "@/components/ui/headers/HeaderDefault"
import { useState } from 'react'
import MapPanel from '@/components/ui/dashboard/MapPanel'
import CameraPanel from '@/components/ui/dashboard/CameraPanel'
import FuelTanksPanel from '@/components/ui/dashboard/FuelTanksPanel'
import PumpsPanel from '@/components/ui/dashboard/PumpsPanel'
import SalesChart from '@/components/ui/dashboard/SalesChart'
import TransactionTable from '@/components/ui/dashboard/TransactionTable'

// Types pour les données de la station
export interface StationData {
  cameras: {
    camera1: string
    camera2: string
  }
  fuels: {
    essence1: number
    essence2: number
    petrol: number
    gazoil: number
  }
  pumps: {
    pompe1: number
    pompe2: number
    pompe3: number
    pompe4: number
  }
  sales: any[]
  transactions: any[]
}

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('today')
  const [selectedFuel, setSelectedFuel] = useState('all')
  const [stationName, setStationName] = useState('Station_Logbessou')

  // Données statiques pour la démonstration
  const data: StationData = {
    cameras: {
      camera1: "/assets/images/camera-placeholder.jpg",
      camera2: "/assets/images/camera-placeholder.jpg"
    },
    fuels: {
      essence1: 450,
      essence2: 250,
      petrol: 1500,
      gazoil: 1200
    },
    pumps: {
      pompe1: 45,
      pompe2: 67,
      pompe3: 89,
      pompe4: 23
    },
    sales: [
      { x: '06:00', y: 150 },
      { x: '07:00', y: 280 },
      { x: '08:00', y: 420 },
      { x: '09:00', y: 380 },
      { x: '10:00', y: 500 }
    ],
    transactions: [
      {
        id: 1,
        date: '2024-01-15',
        time: '08:30',
        buse: 'Gasoil',
        transaction: 'Vente',
        quantite: 45.5,
        prixUnitaire: 650,
        montant: 29575,
        quantiteRestante: 1200,
        serveur: 'Serveur1'
      }
    ]
  }

  return (
    <div className="min-h-screen bg-black">
      <HeaderDefault 
        title="Tableau de bord" 
        stationName={`[${stationName}]`} 
      />
      
      {/* Conteneur principal */}
      <div className="flex h-[calc((100vh-38px)/3)] pl-1 pr-1 pt-0.5 gap-1">
        <MapPanel />
        <CameraPanel 
          cameraNumber={1} 
          imageUrl={data.cameras.camera1} 
        />
        <CameraPanel 
          cameraNumber={2} 
          imageUrl={data.cameras.camera2} 
        />
      </div>

      {/* Conteneur principal 2 */}
      <div className="flex h-[calc((100vh-38px)/3)] pl-1 pr-1 pt-1 gap-1">
        <FuelTanksPanel 
          essence1={data.fuels.essence1}
          essence2={data.fuels.essence2}
          petrol={data.fuels.petrol}
          gazoil={data.fuels.gazoil}
        />
        <PumpsPanel 
          pompe1={data.pumps.pompe1}
          pompe2={data.pumps.pompe2}
          pompe3={data.pumps.pompe3}
          pompe4={data.pumps.pompe4}
        />
        <SalesChart 
          selectedPeriod={selectedPeriod}
          selectedFuel={selectedFuel}
          onPeriodChange={setSelectedPeriod}
          onFuelChange={setSelectedFuel}
          salesData={data.sales}
        />
      </div>

      {/* Conteneur principal 3 */}
      <div className="flex h-[calc((100vh-38px)/3)] pl-1 pr-1 pt-1 pb-0.5 gap-1">
        <TransactionTable 
          transactions={data.transactions}
        />
      </div>
    </div>
  )
}