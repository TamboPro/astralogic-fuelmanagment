'use client'
import HeaderDefault from "@/components/ui/headers/HeaderDefault"
import { useState, useEffect } from "react"
import { Plus, Trash2, Play, Wifi, WifiOff, Server, Database, TestTube, Save, Download, CloudCog, Cable, Settings2 } from "lucide-react"

interface Topic {
  id: string
  value: string
  qos: 0 | 1 | 2
  retain: boolean
}

interface ConnectionConfig {
  mqttUrl: string
  restUrl: string
  graphqlUrl: string
  stationName: string
  topics: Topic[]
  saveToDatabase: boolean
}

type TabType = 'mqtt' | 'rest' | 'graphql'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('mqtt')
  const [config, setConfig] = useState<ConnectionConfig>({
    mqttUrl: process.env.NEXT_PUBLIC_MQTT_URL || 'ws://localhost:9001',
    restUrl: process.env.NEXT_PUBLIC_REST_URL || 'http://localhost:3001/api',
    graphqlUrl: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3001/graphql',
    stationName: 'Station_Logbessou',
    topics: [
      { id: '1', value: 'astralogic/Station_Logbessou/camera1', qos: 0, retain: false },
      { id: '2', value: 'astralogic/Station_Logbessou/camera2', qos: 0, retain: false },
      { id: '3', value: 'astralogic/Station_Logbessou/station_data', qos: 1, retain: false }
    ],
    saveToDatabase: true
  })

  const [newTopic, setNewTopic] = useState('')
  const [newTopicQos, setNewTopicQos] = useState<0 | 1 | 2>(0)
  const [newTopicRetain, setNewTopicRetain] = useState(false)
  const [testMessage, setTestMessage] = useState('')
  const [testResults, setTestResults] = useState<string[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null)

  // Connexion WebSocket/MQTT
  useEffect(() => {
    connectWebSocket()
    return () => {
      if (wsConnection) {
        wsConnection.close()
      }
    }
  }, [config.mqttUrl])

  const connectWebSocket = () => {
    try {
      if (wsConnection) {
        wsConnection.close()
      }

      const ws = new WebSocket(config.mqttUrl)
      
      ws.onopen = () => {
        setIsConnected(true)
        setTestResults(prev => [...prev, '✅ Connexion MQTT établie'])
        
        config.topics.forEach(topic => {
          ws.send(JSON.stringify({
            type: 'subscribe',
            topic: topic.value,
            qos: topic.qos
          }))
        })
      }

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          setTestResults(prev => [...prev, `📨 Reçu: ${JSON.stringify(message)}`])
        } catch (error) {
          setTestResults(prev => [...prev, `📨 Message: ${event.data}`])
        }
      }

      ws.onclose = () => {
        setIsConnected(false)
        setTestResults(prev => [...prev, '❌ Connexion MQTT fermée'])
      }

      ws.onerror = (error) => {
        setTestResults(prev => [...prev, `❌ Erreur MQTT: ${error}`])
      }

      setWsConnection(ws)

    } catch (error) {
      setTestResults(prev => [...prev, `❌ Erreur de connexion: ${error}`])
    }
  }

  const handleInputChange = (field: keyof ConnectionConfig, value: string | boolean) => {
    setConfig(prev => ({ ...prev, [field]: value }))
  }

  const handleTopicChange = (id: string, field: keyof Topic, value: string | number | boolean) => {
    setConfig(prev => ({
      ...prev,
      topics: prev.topics.map(topic => 
        topic.id === id ? { ...topic, [field]: value } : topic
      )
    }))
  }

  const addTopic = () => {
    if (newTopic.trim() && config.topics.length < 15) {
      setConfig(prev => ({
        ...prev,
        topics: [...prev.topics, { 
          id: Date.now().toString(), 
          value: newTopic.trim(),
          qos: newTopicQos,
          retain: newTopicRetain
        }]
      }))
      setNewTopic('')
      setNewTopicQos(0)
      setNewTopicRetain(false)
    }
  }

  const removeTopic = (id: string) => {
    setConfig(prev => ({
      ...prev,
      topics: prev.topics.filter(topic => topic.id !== id)
    }))
  }

  const sendTestMessage = () => {
    if (wsConnection && wsConnection.readyState === WebSocket.OPEN && testMessage.trim()) {
      config.topics.forEach(topic => {
        wsConnection.send(JSON.stringify({
          topic: topic.value,
          message: testMessage,
          qos: topic.qos,
          retain: topic.retain
        }))
      })
      setTestResults(prev => [...prev, `📤 Envoyé: "${testMessage}" à tous les topics`])
      setTestMessage('')
    }
  }

  const testRestApi = async () => {
    try {
      const response = await fetch(`${config.restUrl}/status`)
      const data = await response.json()
      setTestResults(prev => [...prev, `🌐 REST: ${JSON.stringify(data)}`])
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Erreur REST: ${error}`])
    }
  }

  const testGraphql = async () => {
    try {
      const response = await fetch(config.graphqlUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: '{ status }'
        })
      })
      const data = await response.json()
      setTestResults(prev => [...prev, `🔄 GraphQL: ${JSON.stringify(data)}`])
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Erreur GraphQL: ${error}`])
    }
  }

  const saveConfiguration = () => {
    localStorage.setItem('connectionConfig', JSON.stringify(config))
    setTestResults(prev => [...prev, '💾 Configuration sauvegardée'])
  }

  const loadConfiguration = () => {
    const saved = localStorage.getItem('connectionConfig')
    if (saved) {
      setConfig(JSON.parse(saved))
      setTestResults(prev => [...prev, '📂 Configuration chargée'])
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
            {/* Panel MQTT */}
            <div className="bg-[#202226] rounded border border-[#2c3235] p-4">
              <h2 className="text-md font-semibold mb-3 flex items-center gap-2">
                <CloudCog className="w-4 h-4" />
                MQTT
              </h2>
              
              <div className="mb-4">
                <label className="block text-xs font-medium mb-1">URL MQTT</label>
                <input
                  type="url"
                  value={config.mqttUrl}
                  onChange={(e) => handleInputChange('mqttUrl', e.target.value)}
                  className="w-full bg-[#2c3235] border border-[#3a3f47] rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#33a2e5]"
                />
              </div>

              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Cable className="w-4 h-4" />
                Topics ({config.topics.length}/15)
              </h3>

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
                        onClick={() => removeTopic(topic.id)}
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
                        onKeyPress={(e) => e.key === 'Enter' && addTopic()}
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
                        onClick={addTopic}
                        className="w-full p-1 bg-[#33a2e5] text-white rounded hover:bg-[#2b91d5] transition-colors flex items-center justify-center"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Panel Tests */}
            <div className="bg-[#202226] rounded border border-[#2c3235] p-4">
              <h2 className="text-md font-semibold mb-3 flex items-center gap-2">
                <TestTube className="w-4 h-4" />
                Tests
              </h2>

              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  onClick={connectWebSocket}
                  className={`px-3 py-1 rounded flex items-center gap-1 text-xs ${
                    isConnected 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-[#33a2e5] hover:bg-[#2b91d5]'
                  } transition-colors`}
                >
                  {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  {isConnected ? 'Connecté' : 'MQTT'}
                </button>

                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    className="bg-[#2c3235] border border-[#3a3f47] rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#33a2e5] w-32"
                    placeholder="Message test..."
                    onKeyPress={(e) => e.key === 'Enter' && sendTestMessage()}
                  />
                  <button
                    onClick={sendTestMessage}
                    className="px-2 py-1 bg-[#33a2e5] rounded hover:bg-[#2b91d5] transition-colors flex items-center gap-1 text-xs"
                  >
                    <Play className="w-3 h-3" />
                    Envoyer
                  </button>
                </div>
              </div>

              {/* Résultats des tests compact */}
              <div className="bg-[#2c3235] rounded p-2 h-64 overflow-y-auto text-xs">
                <h3 className="font-medium mb-1">Journal:</h3>
                <div className="space-y-0.5 font-mono">
                  {testResults.slice(-12).map((result, index) => (
                    <div key={index} className="text-[#8e9297]">
                      {result}
                    </div>
                  ))}
                </div>
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