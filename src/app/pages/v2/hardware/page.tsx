'use client'
import HeaderDefault from '@/components/ui/headers/HeaderDefault'
import { useDispatch, useSelector } from 'react-redux'
import { 
  updateConfig, 
  updateMqttAuth, 
  addTestResult,
  RootState
} from '@/store/store'

// app/pages/v2/microcontroleur/page.tsx
export default function MicrocontrollerPage() {
  const config = useSelector((state: RootState) => state.config)
  return (
     <div className="min-h-screen bg-black text-[#c7d0d9]">
          <HeaderDefault 
            title="Paramètres de connexion" 
            stationName={`[${config.stationName}]`} 
          />
      {/* Contenu de la page microcontrôleur */}
    </div>
  )
}