// components/settings/SettingsPage.tsx
'use client'
import HeaderDefault from "@/components/ui/headers/HeaderDefault"
import { useState } from "react"
import { useDispatch, useSelector } from 'react-redux'
import { CloudCog, Server, Database, Save, Download } from "lucide-react"
import { 
  updateConfig, 
  updateMqttAuth, 
  addTestResult,
  RootState
} from '@/store/store'

// Import des composants
import BasicSettings from '@/components/settings/BasicSettings'
import MqttSettings from '@/components/settings/MqttSettings'
import MqttTopics from '@/components/settings/MqttTopics'
import MqttTesting from '@/components/settings/MqttTesting'
import RestSettings from '@/components/settings/RestSettings'
import GraphqlSettings from '@/components/settings/GraphqlSettings'

// Import des hooks
import { useMqttActions } from '@/hooks/useMqttActions'

// Composant principal
export default function SettingsPage() {
  const dispatch = useDispatch()
  const config = useSelector((state: RootState) => state.config)
  const connection = useSelector((state: RootState) => state.connection)
  
  const [activeTab, setActiveTab] = useState('mqtt')
  const [testMessage, setTestMessage] = useState('Message pour tester la liaison')

  const { connectMqtt, sendTestMessage, disconnectMqtt } = useMqttActions()

  const handleInputChange = (field: keyof typeof config, value: string | boolean) => {
    dispatch(updateConfig({ [field]: value }))
  }

  const handleMqttAuthChange = (field: keyof typeof config.mqttAuth, value: string) => {
    dispatch(updateMqttAuth({ [field]: value }))
  }

  const generateClientId = () => {
    const newClientId = `react-client-${Math.random().toString(16).substr(2, 8)}`
    handleMqttAuthChange('clientId', newClientId)
    dispatch(addTestResult(`🆔 Nouveau Client ID généré: ${newClientId}`))
  }

  const saveConfiguration = () => {
    localStorage.setItem('connectionConfig', JSON.stringify(config))
    dispatch(addTestResult('💾 Configuration sauvegardée'))
  }

  const loadConfiguration = () => {
    const saved = localStorage.getItem('connectionConfig')
    if (saved) {
      try {
        const savedConfig = JSON.parse(saved)
        dispatch(updateConfig(savedConfig))
        dispatch(addTestResult('📂 Configuration chargée'))
      } catch (error) {
        dispatch(addTestResult(`❌ Erreur lors du chargement de la configuration: ${error instanceof Error ? error.message : String(error)}`))
      }
    } else {
      dispatch(addTestResult('ℹ️ Aucune configuration sauvegardée'))
    }
  }

  return (
    <div className="min-h-screen bg-black text-[#c7d0d9]">
      <HeaderDefault 
        title="Paramètres de connexion" 
        stationName={`[${config.stationName}]`} 
      />

      <div className="p-4 space-y-4">
        {/* Navigation par onglets */}
        <div className="flex border-b border-[#2c3235] text-sm">
          <button
            onClick={() => setActiveTab('mqtt')}
            className={`px-3 py-2 flex items-center gap-1 font-medium ${activeTab === 'mqtt' ? 'text-[#33a2e5] border-b-2 border-[#33a2e5]' : 'text-[#8e9297] hover:text-[#c7d0d9]'}`}
          >
            <CloudCog className="w-4 h-4" />
            MQTT
          </button>
          <button
            onClick={() => setActiveTab('rest')}
            className={`px-3 py-2 flex items-center gap-1 font-medium ${activeTab === 'rest' ? 'text-[#33a2e5] border-b-2 border-[#33a2e5]' : 'text-[#8e9297] hover:text-[#c7d0d9]'}`}
          >
            <Server className="w-4 h-4" />
            REST
          </button>
          <button
            onClick={() => setActiveTab('graphql')}
            className={`px-3 py-2 flex items-center gap-1 font-medium ${activeTab === 'graphql' ? 'text-[#33a2e5] border-b-2 border-[#33a2e5]' : 'text-[#8e9297] hover:text-[#c7d0d9]'}`}
          >
            <Database className="w-4 h-4" />
            GraphQL
          </button>
        </div>

        {/* Configuration de base */}
        <BasicSettings />

        {/* Contenu des onglets */}
        {activeTab === 'mqtt' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <MqttSettings generateClientId={generateClientId} />
              <MqttTopics />
            </div>
            <MqttTesting testMessage={testMessage} setTestMessage={setTestMessage} />
          </>
        )}

        {activeTab === 'rest' && (
          <RestSettings />
        )}

        {activeTab === 'graphql' && (
          <GraphqlSettings />
        )}

        {/* Boutons sauvegarde/chargement */}
        <div className="flex gap-2">
          <button
            onClick={saveConfiguration}
            className="px-3 py-1 bg-green-600 rounded hover:bg-green-700 transition-colors flex items-center gap-1 text-xs"
          >
            <Save className="w-3 h-3" />
            Sauvegarder
          </button>
          <button
            onClick={loadConfiguration}
            className="px-3 py-1 bg-[#33a2e5] rounded hover:bg-[#2b91d5] transition-colors flex items-center gap-1 text-xs"
            disabled={connection.connectionStatus === 'connecting'}
          >
            <Download className="w-3 h-3" />
            Charger
          </button>
        </div>
      </div>
    </div>
  )
}