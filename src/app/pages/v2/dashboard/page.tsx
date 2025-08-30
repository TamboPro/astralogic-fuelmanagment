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

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('today')
  const [selectedFuel, setSelectedFuel] = useState('all')

  // Récupérer les données depuis le store Redux
  const stationData = useSelector((state: RootState) => state.stationData)
  const config = useSelector((state: RootState) => state.config)

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
          imageUrl={stationData.cameras.camera1} 
        />
        <CameraPanel 
          cameraNumber={2} 
          imageUrl={stationData.cameras.camera2} 
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
          salesData={stationData.sales}
        />
      </div>

      {/* Conteneur principal 3 */}
      <div className="flex h-[calc((100vh-38px)/3)] pl-1 pr-1 pt-1 pb-0.5 gap-1">
        <TransactionTable 
          transactions={stationData.transactions}
        />
      </div>
    </div>
  )
}