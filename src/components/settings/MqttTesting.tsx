// components/settings/MqttTesting.tsx
import { TestTube, Wifi, WifiOff, RefreshCw, Trash2, Play, Database } from "lucide-react"
import { useState } from "react"
import { useDispatch, useSelector } from 'react-redux'
import { addTestResult, clearTestResults, resetStats, RootState } from '@/store/store'
import { useMqttActions } from '@/hooks/useMqttActions'

interface MqttTestingProps {
  testMessage: string
  setTestMessage: (message: string) => void
}

const MqttTesting = ({ testMessage, setTestMessage }: MqttTestingProps) => {
  const dispatch = useDispatch()
  const connection = useSelector((state: RootState) => state.connection)
  const config = useSelector((state: RootState) => state.config)
  
  const { connectMqtt, sendTestMessage, disconnectMqtt, mqttClient, isConnected } = useMqttActions()

  const testConnection = () => {
    dispatch(addTestResult('🧪 Test de connexion au broker...'))
    connectMqtt()
    
    setTimeout(() => {
      if (connection.isConnected) {
        sendTestMessage('Message de test de connexion')
      }
    }, 1000)
  }

  const clearTestLogs = () => {
    dispatch(clearTestResults())
    dispatch(resetStats())
  }

  // Fonction pour envoyer des données de test au format complet
  const sendTestDataMessage = () => {
    if (mqttClient && mqttClient.connected) {
      const testData = {
        station: config.stationName,
        timestamp: new Date().toISOString(),
        fuels: {
          essence1: Math.floor(Math.random() * 1000),
          essence2: Math.floor(Math.random() * 1000),
          petrol: Math.floor(Math.random() * 2000),
          gazoil: Math.floor(Math.random() * 2000)
        },
        pumps: {
          pompe1: Math.floor(Math.random() * 100),
          pompe2: Math.floor(Math.random() * 100),
          pompe3: Math.floor(Math.random() * 100),
          pompe4: Math.floor(Math.random() * 100)
        },
        status: "online",
        temperature: 25 + Math.random() * 10,
        humidity: 40 + Math.random() * 40,
        pressure: 1000 + Math.random() * 30,
        battery: 80 + Math.random() * 20,
        uptime: 86400 + Math.floor(Math.random() * 10000),
        version: "1.2.3"
      }

      const dataTopic = `astralogic/${config.stationName}/data`
      mqttClient.publish(
        dataTopic, 
        JSON.stringify(testData), 
        { qos: 1, retain: false }
      )
      dispatch(addTestResult(`📤 Données test envoyées sur ${dataTopic}`))
    } else {
      dispatch(addTestResult('❌ Impossible d\'envoyer - connexion non établie'))
    }
  }

  const getConnectionStatusClass = () => {
    switch (connection.connectionStatus) {
      case 'connected': return 'bg-green-600 hover:bg-green-700'
      case 'connecting': return 'bg-yellow-600 hover:bg-yellow-700'
      case 'error': return 'bg-red-600 hover:bg-red-700'
      default: return 'bg-[#33a2e5] hover:bg-[#2b91d5]'
    }
  }

  const getConnectionIcon = () => {
    switch (connection.connectionStatus) {
      case 'connected': return <Wifi className="w-3 h-3" />
      case 'connecting': return <RefreshCw className="w-3 h-3 animate-spin" />
      case 'error': return <WifiOff className="w-3 h-3" />
      default: return <WifiOff className="w-3 h-3" />
    }
  }

  const getConnectionText = () => {
    switch (connection.connectionStatus) {
      case 'connected': return 'Connecté'
      case 'connecting': return 'Connexion...'
      case 'error': return 'Erreur'
      default: return 'Déconnecté'
    }
  }

  const formatTimestamp = (timestamp: number | null) => {
    if (!timestamp) return 'N/A'
    return new Date(timestamp).toLocaleTimeString()
  }

  return (
    <div className="bg-[#202226] rounded border border-[#2c3235] p-4">
      <h2 className="text-md font-semibold mb-3 flex items-center gap-2">
        <TestTube className="w-4 h-4" />
        Tests MQTT
      </h2>

      <div className="flex flex-wrap gap-2 mb-3">
        <button
          onClick={connectMqtt}
          className={`px-3 py-1 rounded flex items-center gap-1 text-xs ${getConnectionStatusClass()} transition-colors`}
          disabled={connection.connectionStatus === 'connecting'}
        >
          {getConnectionIcon()}
          {getConnectionText()}
        </button>

        <button
          onClick={testConnection}
          className="px-3 py-1 bg-purple-600 rounded hover:bg-purple-700 transition-colors flex items-center gap-1 text-xs"
          disabled={connection.connectionStatus === 'connecting'}
        >
          <TestTube className="w-3 h-3" />
          Tester
        </button>

        <button
          onClick={sendTestDataMessage}
          className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition-colors flex items-center gap-1 text-xs"
          disabled={!isConnected}
        >
          <Database className="w-3 h-3" />
          Données Test
        </button>

        <button
          onClick={disconnectMqtt}
          className="px-3 py-1 bg-red-600 rounded hover:bg-red-700 transition-colors flex items-center gap-1 text-xs"
          disabled={!connection.isConnected}
        >
          <WifiOff className="w-3 h-3" />
          Déconnecter
        </button>

        <button
          onClick={clearTestLogs}
          className="px-3 py-1 bg-gray-600 rounded hover:bg-gray-700 transition-colors flex items-center gap-1 text-xs"
        >
          <Trash2 className="w-3 h-3" />
          Effacer
        </button>
      </div>

      <div className="flex items-center gap-1 mb-3">
        <input
          type="text"
          value={testMessage}
          onChange={(e) => setTestMessage(e.target.value)}
          className="flex-1 bg-[#2c3235] border border-[#3a3f47] rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#33a2e5]"
          placeholder="Message test..."
          onKeyPress={(e) => e.key === 'Enter' && sendTestMessage(testMessage)}
          disabled={!connection.isConnected}
        />
        <button
          onClick={() => sendTestMessage(testMessage)}
          className="px-2 py-1 bg-[#33a2e5] rounded hover:bg-[#2b91d5] transition-colors flex items-center gap-1 text-xs"
          disabled={!connection.isConnected}
        >
          <Play className="w-3 h-3" />
          Envoyer
        </button>
      </div>

      {/* Statistiques de connexion */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
        <div className="bg-[#2c3235] p-2 rounded text-center">
          <div className="font-semibold">{connection.connectionStats.messagesSent}</div>
          <div className="text-[#8e9297]">Messages envoyés</div>
        </div>
        <div className="bg-[#2c3235] p-2 rounded text-center">
          <div className="font-semibold">{connection.connectionStats.messagesReceived}</div>
          <div className="text-[#8e9297]">Messages reçus</div>
        </div>
        <div className="bg-[#2c3235] p-2 rounded text-center">
          <div className="font-semibold">{formatTimestamp(connection.connectionStats.lastMessageTimestamp)}</div>
          <div className="text-[#8e9297]">Dernier message</div>
        </div>
      </div>

      {/* Résultats des tests */}
      <div className="bg-[#2c3235] rounded p-2 h-32 overflow-y-auto text-xs">
        <h3 className="font-medium mb-1">Journal de connexion:</h3>
        <div className="space-y-0.5 font-mono">
          {connection.testResults.slice(-12).map((result, index) => (
            <div key={index} className="text-[#8e9297]">
              {result}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MqttTesting