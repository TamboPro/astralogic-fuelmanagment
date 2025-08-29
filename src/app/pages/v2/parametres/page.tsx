'use client'
import HeaderDefault from "@/components/ui/headers/HeaderDefault"
import { useState, useEffect, useRef } from "react"
import { Plus, Trash2, Play, Wifi, WifiOff, Server, Database, TestTube, Save, Download, CloudCog, Cable, Settings2, RefreshCw, Eye, EyeOff, Key, User } from "lucide-react"
import { Provider, useDispatch, useSelector } from 'react-redux'
import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit'
import mqtt, { MqttClient, IClientOptions } from 'mqtt'

interface Topic {
  id: string
  value: string
  qos: 0 | 1 | 2
  retain: boolean
}

interface MqttAuth {
  username: string
  password: string
  clientId: string
}

interface ConnectionConfig {
  mqttUrl: string
  restUrl: string
  graphqlUrl: string
  stationName: string
  topics: Topic[]
  saveToDatabase: boolean
  mqttAuth: MqttAuth
}

// Slice Redux pour la configuration
const configSlice = createSlice({
  name: 'config',
  initialState: {
    mqttUrl: 'ws://broker.emqx.io:8083/mqtt',
    restUrl: process.env.NEXT_PUBLIC_REST_URL || 'http://localhost:3001/api',
    graphqlUrl: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3001/graphql',
    stationName: 'Station_Logbessou',
    topics: [
      { id: '1', value: 'astralogic/Station_Logbessou/camera1', qos: 0, retain: false },
      { id: '2', value: 'astralogic/Station_Logbessou/camera2', qos: 0, retain: false },
      { id: '3', value: 'astralogic/Station_Logbessou/essence1', qos: 1, retain: false }
    ],
    saveToDatabase: true,
    mqttAuth: {
      username: '',
      password: '',
      clientId: `react-client-${Math.random().toString(16).substr(2, 8)}`
    }
  } as ConnectionConfig,
  reducers: {
    updateConfig: (state, action: PayloadAction<Partial<ConnectionConfig>>) => {
      return { ...state, ...action.payload }
    },
    updateMqttAuth: (state, action: PayloadAction<Partial<MqttAuth>>) => {
      state.mqttAuth = { ...state.mqttAuth, ...action.payload }
    },
    updateTopic: (state, action: PayloadAction<{ id: string; field: keyof Topic; value: string | number | boolean }>) => {
      const { id, field, value } = action.payload
      state.topics = state.topics.map(topic => 
        topic.id === id ? { ...topic, [field]: value } : topic
      )
    },
    addTopic: (state, action: PayloadAction<Topic>) => {
      if (state.topics.length < 15) {
        state.topics.push(action.payload)
      }
    },
    removeTopic: (state, action: PayloadAction<string>) => {
      state.topics = state.topics.filter(topic => topic.id !== action.payload)
    }
  }
})

// Slice Redux pour les connexions
interface ConnectionState {
  isConnected: boolean
  testResults: string[]
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error'
  connectionStats: {
    messagesSent: number
    messagesReceived: number
    lastMessageTimestamp: number | null
  }
}

const connectionSlice = createSlice({
  name: 'connection',
  initialState: {
    isConnected: false,
    testResults: [],
    connectionStatus: 'disconnected',
    connectionStats: {
      messagesSent: 0,
      messagesReceived: 0,
      lastMessageTimestamp: null
    }
  } as ConnectionState,
  reducers: {
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload
      state.connectionStatus = action.payload ? 'connected' : 'disconnected'
    },
    setConnecting: (state) => {
      state.connectionStatus = 'connecting'
    },
    setConnectionError: (state) => {
      state.connectionStatus = 'error'
    },
    addTestResult: (state, action: PayloadAction<string>) => {
      state.testResults.push(action.payload)
      if (state.testResults.length > 20) {
        state.testResults = state.testResults.slice(-20)
      }
    },
    clearTestResults: (state) => {
      state.testResults = []
    },
    incrementMessagesSent: (state) => {
      state.connectionStats.messagesSent += 1
      state.connectionStats.lastMessageTimestamp = Date.now()
    },
    incrementMessagesReceived: (state) => {
      state.connectionStats.messagesReceived += 1
    },
    resetStats: (state) => {
      state.connectionStats = {
        messagesSent: 0,
        messagesReceived: 0,
        lastMessageTimestamp: null
      }
    }
  }
})

// Configuration du store Redux
const store = configureStore({
  reducer: {
    config: configSlice.reducer,
    connection: connectionSlice.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: ['config.topics'],
      },
    }),
})

// Actions exportées
export const { updateConfig, updateMqttAuth, updateTopic, addTopic, removeTopic } = configSlice.actions
export const { 
  setConnected, 
  setConnecting, 
  setConnectionError, 
  addTestResult, 
  clearTestResults, 
  incrementMessagesSent, 
  incrementMessagesReceived,
  resetStats
} = connectionSlice.actions

// Types pour le state Redux
interface RootState {
  config: ConnectionConfig
  connection: ConnectionState
}

// Hook personnalisé pour les actions MQTT avec mqtt.js
const useMqttActions = () => {
  const dispatch = useDispatch()
  const config = useSelector((state: RootState) => state.config)
  
  const mqttClient = useRef<MqttClient | null>(null)

  const connectMqtt = () => {
    try {
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
        reconnectPeriod: 0, // Désactive la reconnexion automatique
      }

      // Ajouter l'authentification si fournie
      if (config.mqttAuth.username) {
        options.username = config.mqttAuth.username
      }
      if (config.mqttAuth.password) {
        options.password = config.mqttAuth.password
      }

      mqttClient.current = mqtt.connect(config.mqttUrl, options)
      
      mqttClient.current.on('connect', () => {
        dispatch(setConnected(true))
        dispatch(addTestResult('✅ Connexion MQTT établie'))
        
        if (config.mqttAuth.username) {
          dispatch(addTestResult(`🔑 Authentifié en tant que: ${config.mqttAuth.username}`))
        }
        if (config.mqttAuth.clientId) {
          dispatch(addTestResult(`🆔 Client ID: ${config.mqttAuth.clientId}`))
        }
        
        // S'abonner à tous les topics
        config.topics.forEach((topic: Topic) => {
          mqttClient.current?.subscribe(topic.value, { qos: topic.qos }, (error) => {
            if (error) {
              dispatch(addTestResult(`❌ Erreur d'abonnement à ${topic.value}: ${error.message}`))
            } else {
              dispatch(addTestResult(`✓ Abonné à: ${topic.value} (QoS: ${topic.qos})`))
            }
          })
        })
      })

      mqttClient.current.on('message', (topic, message) => {
        const messageString = message.toString()
        dispatch(incrementMessagesReceived())
        dispatch(addTestResult(`📨 Reçu sur ${topic}: ${messageString}`))
      })

      mqttClient.current.on('close', () => {
        dispatch(setConnected(false))
        dispatch(addTestResult('❌ Connexion MQTT fermée'))
      })

      mqttClient.current.on('error', (error) => {
        dispatch(setConnectionError())
        dispatch(addTestResult(`❌ Erreur MQTT: ${error.message}`))
        dispatch(addTestResult('💡 Vérifiez les paramètres de connexion'))
      })

      mqttClient.current.on('offline', () => {
        dispatch(setConnected(false))
        dispatch(addTestResult('❌ Connexion MQTT perdue'))
      })

    } catch (error) {
      dispatch(setConnectionError())
      dispatch(addTestResult(`❌ Erreur de création de connexion: ${error}`))
    }
  }

  const sendTestMessage = (testMessage: string) => {
    if (mqttClient.current && mqttClient.current.connected && testMessage.trim()) {
      config.topics.forEach((topic: Topic) => {
        mqttClient.current!.publish(
          topic.value, 
          JSON.stringify({
            message: testMessage,
            timestamp: new Date().toISOString(),
            station: config.stationName
          }), 
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
      mqttClient.current.end()
      mqttClient.current = null
    }
    dispatch(setConnected(false))
    dispatch(addTestResult('🔌 Connexion manuellement fermée'))
  }

  return { connectMqtt, sendTestMessage, disconnectMqtt, mqttClient: mqttClient.current }
}

// Hook personnalisé pour les tests API
const useApiActions = () => {
  const dispatch = useDispatch()
  const config = useSelector((state: RootState) => state.config)

  const testRestApi = async () => {
    try {
      dispatch(addTestResult('🌐 Test de l\'API REST en cours...'))
      const response = await fetch(`${config.restUrl}/status`)
      const data = await response.json()
      dispatch(addTestResult(`✅ REST: ${JSON.stringify(data)}`))
    } catch (error) {
      dispatch(addTestResult(`❌ Erreur REST: ${error}`))
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
      const data = await response.json()
      dispatch(addTestResult(`✅ GraphQL: ${JSON.stringify(data)}`))
    } catch (error) {
      dispatch(addTestResult(`❌ Erreur GraphQL: ${error}`))
    }
  }

  return { testRestApi, testGraphql }
}

// Composant principal avec Redux
function SettingsPageContent() {
  const dispatch = useDispatch()
  const config = useSelector((state: RootState) => state.config)
  const connection = useSelector((state: RootState) => state.connection)
  
  const [activeTab, setActiveTab] = useState('mqtt')
  const [newTopic, setNewTopic] = useState('')
  const [newTopicQos, setNewTopicQos] = useState<0 | 1 | 2>(0)
  const [newTopicRetain, setNewTopicRetain] = useState(false)
  const [testMessage, setTestMessage] = useState('Test message from React App')
  const [showPassword, setShowPassword] = useState(false)

  const { connectMqtt, sendTestMessage, disconnectMqtt } = useMqttActions()
  const { testRestApi, testGraphql } = useApiActions()

  // Connexion MQTT
  useEffect(() => {
    connectMqtt()
    return () => {
      disconnectMqtt()
    }
  }, [config.mqttUrl, config.mqttAuth.username, config.mqttAuth.password, config.mqttAuth.clientId])

  const handleInputChange = (field: keyof ConnectionConfig, value: string | boolean) => {
    dispatch(updateConfig({ [field]: value }))
  }

  const handleMqttAuthChange = (field: keyof MqttAuth, value: string) => {
    dispatch(updateMqttAuth({ [field]: value }))
  }

  const handleTopicChange = (id: string, field: keyof Topic, value: string | number | boolean) => {
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
      dispatch(updateConfig(JSON.parse(saved)))
      dispatch(addTestResult('📂 Configuration chargée'))
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

  return (
    <div className="min-h-screen bg-black text-[#c7d0d9]">
      <HeaderDefault 
        title="Paramètres de connexion" 
        stationName={`[${config.stationName}]`} 
      />

      <div className="p-4 space-y-4">
        {/* Navigation par onglets compacte */}
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

        {/* Configuration de base compacte */}
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

        {/* Contenu des onglets compact */}
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
                  <p className="text-xs text-[#8e9297] mt-1">
                    Exemples: <span className="text-[#33a2e5]">ws://localhost:9001</span>,{' '}
                    <span className="text-[#33a2e5]">wss://broker.emqx.io:8084/mqtt</span>
                  </p>
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

              <div className="mt-4 p-3 bg-[#2c3235] rounded text-xs">
                <h3 className="font-medium mb-2">Conseils de connexion:</h3>
                <ul className="list-disc list-inside space-y-1 text-[#8e9297]">
                  <li><strong>ws://</strong> - WebSocket non sécurisé (port 9001)</li>
                  <li><strong>wss://</strong> - WebSocket sécurisé (port 8084)</li>
                  <li>Client ID doit être unique par connexion</li>
                  <li>Laissez username/password vide pour les brokers publics</li>
                </ul>
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
              >
                {getConnectionIcon()}
                {getConnectionText()}
              </button>

              <button
                onClick={testConnection}
                className="px-3 py-1 bg-purple-600 rounded hover:bg-purple-700 transition-colors flex items-center gap-1 text-xs"
              >
                <TestTube className="w-3 h-3" />
                Tester
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

        {/* Boutons sauvegarde/chargement compact */}
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
          >
            <Download className="w-3 h-3" />
            Charger
          </button>
        </div>
      </div>
    </div>
  )
}

// Composant parent avec Provider Redux
export default function SettingsPage() {
  return (
    <Provider store={store}>
      <SettingsPageContent />
    </Provider>
  )
}