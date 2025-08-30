'use client'
import HeaderDefault from "@/components/ui/headers/HeaderDefault"
import { useState, useRef } from "react"
import { Plus, Trash2, Play, Wifi, WifiOff, Server, Database, TestTube, Save, Download, CloudCog, Cable, Settings2, RefreshCw, Eye, EyeOff, Key, User } from "lucide-react"
import { useDispatch, useSelector } from 'react-redux'
import mqtt, { MqttClient, IClientOptions, Packet } from 'mqtt'
import { 
  updateConfig, 
  updateMqttAuth, 
  updateTopic, 
  addTopic, 
  removeTopic,
  setConnected, 
  setConnecting, 
  setConnectionError, 
  addTestResult, 
  clearTestResults, 
  incrementMessagesSent, 
  incrementMessagesReceived,
  resetStats,
  updateFuelData,
  updatePumpData,
  updateCamera1,
  updateCamera2,
  RootState
} from '@/store/store'

// Hook personnalisé pour les actions MQTT avec mqtt.js
const useMqttActions = () => {
  const dispatch = useDispatch()
  const config = useSelector((state: RootState) => state.config)
  const stationData = useSelector((state: RootState) => state.stationData)
  
  const mqttClient = useRef<MqttClient | null>(null)

  // Fonction pour traiter les messages MQTT et mettre à jour le store
  const processMqttMessage = (topic: string, message: Buffer) => {
    try {
      const messageString = message.toString()
      const data = JSON.parse(messageString)
      const topicParts = topic.split('/')
      const station = topicParts[1]
      const sensorType = topicParts[2]

      if (station === config.stationName) {
        if (sensorType === 'data') {
          // Traitement du format complet des données de la station
          if (data.fuels) {
            Object.entries(data.fuels).forEach(([fuelType, value]) => {
              if (fuelType in stationData.fuels) {
                dispatch(updateFuelData({ 
                  type: fuelType as keyof typeof stationData.fuels, 
                  value: value as number 
                }))
              }
            })
          }

          if (data.pumps) {
            Object.entries(data.pumps).forEach(([pumpType, value]) => {
              if (pumpType in stationData.pumps) {
                dispatch(updatePumpData({ 
                  type: pumpType as keyof typeof stationData.pumps, 
                  value: value as number 
                }))
              }
            })
          }

          dispatch(addTestResult(`📊 Données station mises à jour`))
        } else {
          // Ancien format pour la rétrocompatibilité
          switch (sensorType) {
            case 'essence1':
              dispatch(updateFuelData({ type: 'essence1', value: data.value }))
              dispatch(addTestResult(`⛽ Essence 1 mis à jour: ${data.value}L`))
              break
            case 'essence2':
              dispatch(updateFuelData({ type: 'essence2', value: data.value }))
              dispatch(addTestResult(`⛽ Essence 2 mis à jour: ${data.value}L`))
              break
            case 'petrol':
              dispatch(updateFuelData({ type: 'petrol', value: data.value }))
              dispatch(addTestResult(`⛽ Pétrol mis à jour: ${data.value}L`))
              break
            case 'gazoil':
              dispatch(updateFuelData({ type: 'gazoil', value: data.value }))
              dispatch(addTestResult(`⛽ Gazoil mis à jour: ${data.value}L`))
              break
            case 'pompe1':
              dispatch(updatePumpData({ type: 'pompe1', value: data.value }))
              dispatch(addTestResult(`⛽ Pompe 1 mis à jour: ${data.value}L`))
              break
            case 'pompe2':
              dispatch(updatePumpData({ type: 'pompe2', value: data.value }))
              dispatch(addTestResult(`⛽ Pompe 2 mis à jour: ${data.value}L`))
              break
            case 'pompe3':
              dispatch(updatePumpData({ type: 'pompe3', value: data.value }))
              dispatch(addTestResult(`⛽ Pompe 3 mis à jour: ${data.value}L`))
              break
            case 'pompe4':
              dispatch(updatePumpData({ type: 'pompe4', value: data.value }))
              dispatch(addTestResult(`⛽ Pompe 4 mis à jour: ${data.value}L`))
              break
            case 'camera1':
              dispatch(updateCamera1(data.imageUrl))
              dispatch(addTestResult(`📷 Camera 1 image mise à jour`))
              break
            case 'camera2':
              dispatch(updateCamera2(data.imageUrl))
              dispatch(addTestResult(`📷 Camera 2 image mise à jour`))
              break
            default:
              dispatch(addTestResult(`📨 Message reçu sur ${topic}: ${JSON.stringify(data)}`))
          }
        }
      }
    } catch (error) {
      console.error('Error processing MQTT message:', error)
      dispatch(addTestResult(`❌ Erreur de traitement du message: ${error instanceof Error ? error.message : String(error)}`))
    }
  }

  const connectMqtt = () => {
    try {
      if (mqttClient.current && mqttClient.current.connected) {
        dispatch(addTestResult('✅ Déjà connecté au broker MQTT'))
        return
      }

      if (mqttClient.current) {
        mqttClient.current.end()
        mqttClient.current = null
      }

      dispatch(setConnecting())
      dispatch(addTestResult(`🔗 Tentative de connexion à ${config.mqttUrl}`))
      
      // Configuration des options MQTT
      const options: IClientOptions = {
        clientId: config.mqttAuth.clientId,
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: 1000,
      }

      // Ajouter l'authentification si fournie
      if (config.mqttAuth.username) {
        options.username = config.mqttAuth.username
      }
      if (config.mqttAuth.password) {
        options.password = config.mqttAuth.password
      }

      mqttClient.current = mqtt.connect(config.mqttUrl, options)
      
      mqttClient.current.on('connect', (packet: Packet) => {
        dispatch(setConnected(true))
        dispatch(addTestResult('✅ Connexion MQTT établie'))
        
        if (config.mqttAuth.username) {
          dispatch(addTestResult(`🔑 Authentifié en tant que: ${config.mqttAuth.username}`))
        }
        if (config.mqttAuth.clientId) {
          dispatch(addTestResult(`🆔 Client ID: ${config.mqttAuth.clientId}`))
        }
        
        // S'abonner à tous les topics
        config.topics.forEach((topic) => {
          mqttClient.current?.subscribe(topic.value, { qos: topic.qos }, (error: Error | null) => {
            if (error) {
              dispatch(addTestResult(`❌ Erreur d'abonnement à ${topic.value}: ${error.message}`))
            } else {
              dispatch(addTestResult(`✓ Abonné à: ${topic.value} (QoS: ${topic.qos})`))
            }
          })
        })
      })

      mqttClient.current.on('message', (topic: string, message: Buffer, packet: Packet) => {
        const messageString = message.toString()
        dispatch(incrementMessagesReceived())
        processMqttMessage(topic, message)
      })

      mqttClient.current.on('close', () => {
        dispatch(setConnected(false))
        dispatch(addTestResult('❌ Connexion MQTT fermée'))
      })

      mqttClient.current.on('error', (error: Error) => {
        dispatch(setConnectionError())
        dispatch(addTestResult(`❌ Erreur MQTT: ${error.message}`))
      })

      mqttClient.current.on('offline', () => {
        dispatch(setConnected(false))
        dispatch(addTestResult('❌ Connexion MQTT perdue'))
      })

      mqttClient.current.on('reconnect', () => {
        dispatch(setConnecting())
        dispatch(addTestResult('🔄 Tentative de reconnexion au broker MQTT...'))
      })

    } catch (error) {
      dispatch(setConnectionError())
      dispatch(addTestResult(`❌ Erreur de création de connexion: ${error instanceof Error ? error.message : String(error)}`))
    }
  }

  const sendTestMessage = (testMessage: string) => {
    if (mqttClient.current && mqttClient.current.connected && testMessage.trim()) {
      config.topics.forEach((topic) => {
        const messageData = {
          message: testMessage,
          timestamp: new Date().toISOString(),
          station: config.stationName,
          value: Math.random() * 1000
        }
        
        mqttClient.current!.publish(
          topic.value, 
          JSON.stringify(messageData), 
          { 
            qos: topic.qos, 
            retain: topic.retain 
          }
        )
      })
      dispatch(incrementMessagesSent())
      dispatch(addTestResult(`📤 Envoyé: "${testMessage}" à ${config.topics.length} topics`))
    } else {
      dispatch(addTestResult('❌ Impossible d\'envoyer - connexion non établie'))
    }
  }

  const disconnectMqtt = () => {
    if (mqttClient.current) {
      mqttClient.current.end(false, () => {
        dispatch(setConnected(false))
        dispatch(addTestResult('🔌 Connexion manuellement fermée'))
      })
      mqttClient.current = null
    } else {
      dispatch(setConnected(false))
      dispatch(addTestResult('ℹ️ Aucune connexion active à fermer'))
    }
  }

  return { 
    connectMqtt, 
    sendTestMessage, 
    disconnectMqtt, 
    mqttClient: mqttClient.current,
    isConnected: mqttClient.current?.connected || false
  }
}

// Hook personnalisé pour les tests API
const useApiActions = () => {
  const dispatch = useDispatch()
  const config = useSelector((state: RootState) => state.config)

  const testRestApi = async () => {
    try {
      dispatch(addTestResult('🌐 Test de l\'API REST en cours...'))
      const response = await fetch(`${config.restUrl}/status`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      dispatch(addTestResult(`✅ REST: ${JSON.stringify(data)}`))
    } catch (error) {
      dispatch(addTestResult(`❌ Erreur REST: ${error instanceof Error ? error.message : String(error)}`))
    }
  }

  const testGraphql = async () => {
    try {
      dispatch(addTestResult('🔄 Test de GraphQL en cours...'))
      const response = await fetch(config.graphqlUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: '{ status }'
        })
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      dispatch(addTestResult(`✅ GraphQL: ${JSON.stringify(data)}`))
    } catch (error) {
      dispatch(addTestResult(`❌ Erreur GraphQL: ${error instanceof Error ? error.message : String(error)}`))
    }
  }

  return { testRestApi, testGraphql }
}

// Composant principal
export default function SettingsPage() {
  const dispatch = useDispatch()
  const config = useSelector((state: RootState) => state.config)
  const connection = useSelector((state: RootState) => state.connection)
  
  const [activeTab, setActiveTab] = useState('mqtt')
  const [newTopic, setNewTopic] = useState('')
  const [newTopicQos, setNewTopicQos] = useState<0 | 1 | 2>(0)
  const [newTopicRetain, setNewTopicRetain] = useState(false)
  const [testMessage, setTestMessage] = useState('Test message from React App')
  const [showPassword, setShowPassword] = useState(false)

  const { connectMqtt, sendTestMessage, disconnectMqtt, mqttClient, isConnected } = useMqttActions()
  const { testRestApi, testGraphql } = useApiActions()

  const handleInputChange = (field: keyof typeof config, value: string | boolean) => {
    dispatch(updateConfig({ [field]: value }))
  }

  const handleMqttAuthChange = (field: keyof typeof config.mqttAuth, value: string) => {
    dispatch(updateMqttAuth({ [field]: value }))
  }

  const handleTopicChange = (id: string, field: keyof typeof config.topics[0], value: string | number | boolean) => {
    dispatch(updateTopic({ id, field, value }))
  }

  const addNewTopic = () => {
    if (newTopic.trim() && config.topics.length < 15) {
      dispatch(addTopic({ 
        id: Date.now().toString(), 
        value: newTopic.trim(),
        qos: newTopicQos,
        retain: newTopicRetain
      }))
      setNewTopic('')
      setNewTopicQos(0)
      setNewTopicRetain(false)
    }
  }

  const handleRemoveTopic = (id: string) => {
    dispatch(removeTopic(id))
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

  const generateClientId = () => {
    const newClientId = `react-client-${Math.random().toString(16).substr(2, 8)}`
    handleMqttAuthChange('clientId', newClientId)
    dispatch(addTestResult(`🆔 Nouveau Client ID généré: ${newClientId}`))
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
      dispatch(incrementMessagesSent())
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
        <div className="bg-[#202226] rounded border border-[#2c3235] p-4">
          <h2 className="text-md font-semibold mb-3 flex items-center gap-2">
            <Settings2 className="w-4 h-4" />
            Configuration de base
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <label className="block text-xs font-medium mb-1">Nom de la station</label>
              <input
                type="text"
                value={config.stationName}
                onChange={(e) => handleInputChange('stationName', e.target.value)}
                className="w-full bg-[#2c3235] border border-[#3a3f47] rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#33a2e5]"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="saveToDatabase"
                checked={config.saveToDatabase}
                onChange={(e) => handleInputChange('saveToDatabase', e.target.checked)}
                className="mr-2 h-3 w-3 rounded bg-[#2c3235] border-[#3a3f47] text-[#33a2e5] focus:ring-[#33a2e5]"
              />
              <label htmlFor="saveToDatabase" className="text-xs font-medium">
                Sauvegarder en BDD
              </label>
            </div>
          </div>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'mqtt' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Panel Configuration MQTT */}
            <div className="bg-[#202226] rounded border border-[#2c3235] p-4">
              <h2 className="text-md font-semibold mb-3 flex items-center gap-2">
                <CloudCog className="w-4 h-4" />
                Configuration MQTT
              </h2>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1">URL MQTT</label>
                  <input
                    type="url"
                    value={config.mqttUrl}
                    onChange={(e) => handleInputChange('mqttUrl', e.target.value)}
                    className="w-full bg-[#2c3235] border border-[#3a3f47] rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#33a2e5]"
                    placeholder="ws:// ou wss://"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Client ID</label>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={config.mqttAuth.clientId}
                      onChange={(e) => handleMqttAuthChange('clientId', e.target.value)}
                      className="flex-1 bg-[#2c3235] border border-[#3a3f47] rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#33a2e5]"
                      placeholder="Client ID unique"
                    />
                    <button
                      onClick={generateClientId}
                      className="px-2 bg-[#33a2e5] text-white rounded hover:bg-[#2b91d5] transition-colors flex items-center text-xs"
                      title="Générer un nouveau Client ID"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Username</label>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#8e9297]" />
                    <input
                      type="text"
                      value={config.mqttAuth.username}
                      onChange={(e) => handleMqttAuthChange('username', e.target.value)}
                      className="flex-1 bg-[#2c3235] border border-[#3a3f47] rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#33a2e5]"
                      placeholder="Nom d'utilisateur"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Password</label>
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-[#8e9297]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={config.mqttAuth.password}
                      onChange={(e) => handleMqttAuthChange('password', e.target.value)}
                      className="flex-1 bg-[#2c3235] border border-[#3a3f47] rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#33a2e5]"
                      placeholder="Mot de passe"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 text-[#8e9297] hover:text-[#33a2e5] transition-colors"
                      title={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Panel Topics MQTT */}
            <div className="bg-[#202226] rounded border border-[#2c3235] p-4">
              <h2 className="text-md font-semibold mb-3 flex items-center gap-2">
                <Cable className="w-4 h-4" />
                Topics MQTT ({config.topics.length}/15)
              </h2>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {config.topics.map((topic) => (
                  <div key={topic.id} className="grid grid-cols-12 gap-1 items-center text-xs">
                    <div className="col-span-5">
                      <input
                        type="text"
                        value={topic.value}
                        onChange={(e) => handleTopicChange(topic.id, 'value', e.target.value)}
                        className="w-full bg-[#2c3235] border border-[#3a3f47] rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#33a2e5]"
                      />
                    </div>
                    <div className="col-span-2">
                      <select
                        value={topic.qos}
                        onChange={(e) => handleTopicChange(topic.id, 'qos', parseInt(e.target.value))}
                        className="w-full bg-[#2c3235] border border-[#3a3f47] rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-[#33a2e5]"
                      >
                        <option value={0}>QoS 0</option>
                        <option value={1}>QoS 1</option>
                        <option value={2}>QoS 2</option>
                      </select>
                    </div>
                    <div className="col-span-2 flex items-center justify-center">
                      <input
                        type="checkbox"
                        id={`retain-${topic.id}`}
                        checked={topic.retain}
                        onChange={(e) => handleTopicChange(topic.id, 'retain', e.target.checked)}
                        className="h-3 w-3 rounded bg-[#2c3235] border-[#3a3f47] text-[#33a2e5] focus:ring-[#33a2e5]"
                      />
                    </div>
                    <div className="col-span-3 flex justify-end">
                      <button
                        onClick={() => handleRemoveTopic(topic.id)}
                        className="p-1 text-[#8e9297] hover:text-[#ed1c24] transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {config.topics.length < 15 && (
                <div className="mt-3 p-2 bg-[#2c3235] rounded border border-dashed border-[#3a3f47] text-xs">
                  <div className="grid grid-cols-12 gap-1 items-center">
                    <div className="col-span-5">
                      <input
                        type="text"
                        value={newTopic}
                        onChange={(e) => setNewTopic(e.target.value)}
                        className="w-full bg-[#2c3235] border border-[#3a3f47] rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#33a2e5]"
                        placeholder="Nouveau topic..."
                        onKeyPress={(e) => e.key === 'Enter' && addNewTopic()}
                      />
                    </div>
                    <div className="col-span-2">
                      <select
                        value={newTopicQos}
                        onChange={(e) => setNewTopicQos(parseInt(e.target.value) as 0 | 1 | 2)}
                        className="w-full bg-[#2c3235] border border-[#3a3f47] rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-[#33a2e5]"
                      >
                        <option value={0}>QoS 0</option>
                        <option value={1}>QoS 1</option>
                        <option value={2}>QoS 2</option>
                      </select>
                    </div>
                    <div className="col-span-2 flex items-center justify-center">
                      <input
                        type="checkbox"
                        id="newTopicRetain"
                        checked={newTopicRetain}
                        onChange={(e) => setNewTopicRetain(e.target.checked)}
                        className="h-3 w-3 rounded bg-[#2c3235] border-[#3a3f47] text-[#33a2e5] focus:ring-[#33a2e5]"
                      />
                    </div>
                    <div className="col-span-3">
                      <button
                        onClick={addNewTopic}
                        className="w-full p-1 bg-[#33a2e5] text-white rounded hover:bg-[#2b91d5] transition-colors flex items-center justify-center"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Panel Tests MQTT */}
        {activeTab === 'mqtt' && (
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
        )}

        {activeTab === 'rest' && (
          <div className="bg-[#202226] rounded border border-[#2c3235] p-4">
            <h2 className="text-md font-semibold mb-3 flex items-center gap-2">
              <Server className="w-4 h-4" />
              REST API
            </h2>
            
            <div className="mb-3">
              <label className="block text-xs font-medium mb-1">URL REST</label>
              <input
                type="url"
                value={config.restUrl}
                onChange={(e) => handleInputChange('restUrl', e.target.value)}
                className="w-full bg-[#2c3235] border border-[#3a3f47] rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#33a2e5]"
              />
            </div>

            <button
              onClick={testRestApi}
              className="px-3 py-1 bg-[#33a2e5] rounded hover:bg-[#2b91d5] transition-colors flex items-center gap-1 text-xs"
            >
              <TestTube className="w-3 h-3" />
              Tester REST
            </button>
          </div>
        )}

        {activeTab === 'graphql' && (
          <div className="bg-[#202226] rounded border border-[#2c3235] p-4">
            <h2 className="text-md font-semibold mb-3 flex items-center gap-2">
              <Database className="w-4 h-4" />
              GraphQL
            </h2>
            
            <div className="mb-3">
              <label className="block text-xs font-medium mb-1">URL GraphQL</label>
              <input
                type="url"
                value={config.graphqlUrl}
                onChange={(e) => handleInputChange('graphqlUrl', e.target.value)}
                className="w-full bg-[#2c3235] border border-[#3a3f47] rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#33a2e5]"
              />
            </div>

            <button
              onClick={testGraphql}
              className="px-3 py-1 bg-[#33a2e5] rounded hover:bg-[#2b91d5] transition-colors flex items-center gap-1 text-xs"
            >
              <TestTube className="w-3 h-3" />
              Tester GraphQL
            </button>
          </div>
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