'use client'
import HeaderDefault from '@/components/ui/headers/HeaderDefault'
import { useDispatch, useSelector } from 'react-redux'
import { 
  updateConfig, 
  updateMqttAuth, 
  addTestResult,
  RootState
} from '@/store/store'
import { useState, useCallback } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  Connection,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
  Panel,
  BackgroundVariant
} from 'reactflow'
import 'reactflow/dist/style.css'

// Composants personnalisés pour les nœuds
import ESP32Node from '@/components/nodes/ESP32Node'
import GPIOOutputNode from '@/components/nodes/GPIOOutputNode'
import GPIOInputNode from '@/components/nodes/GPIOInputNode'
import TimerNode from '@/components/nodes/TimerNode'
import MQTTNode from '@/components/nodes/MQTTNode'
import SensorNode from '@/components/nodes/SensorNode'

// Types de nœuds personnalisés
const nodeTypes = {
  esp32: ESP32Node,
  gpioOutput: GPIOOutputNode,
  gpioInput: GPIOInputNode,
  timer: TimerNode,
  mqtt: MQTTNode,
  sensor: SensorNode
}

// Données initiales pour les nœuds et connexions
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'esp32',
    position: { x: 125, y: 50 },
    data: { label: 'ESP32-WROOM', model: 'ESP32-WROOM-32D' }
  }
]

const initialEdges: Edge[] = []

// Composants pour la toolbox
import Toolbox from '@/components/toolbox/Toolbox'
import ToolboxCategory from '@/components/toolbox/ToolboxCategory'
import ToolboxItem from '@/components/toolbox/ToolboxItem'

// Icônes dans le style chaiNNer
const Esp32Icon = () => <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
const GpioIcon = () => <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
const TimerIcon = () => <div className="w-4 h-4 bg-yellow-500 rounded-sm"></div>
const MqttIcon = () => <div className="w-4 h-4 bg-purple-500 rounded-sm"></div>
const SensorIcon = () => <div className="w-4 h-4 bg-red-500 rounded-sm"></div>

export default function MicrocontrollerPage() {
  const config = useSelector((state: RootState) => state.config)
  const dispatch = useDispatch()
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [isToolboxOpen, setIsToolboxOpen] = useState(true)
  
  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )
  
  // Fonction pour ajouter un nouveau nœud
  const addNode = useCallback((type: string, position: { x: number; y: number }) => {
    const newNode = {
      id: `${nodes.length + 1}`,
      type,
      position,
      data: { label: `${type} Node` }
    }
    setNodes((nds) => [...nds, newNode])
  }, [nodes.length, setNodes])
  
  // Fonction pour gérer le drag and drop depuis la toolbox
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c7d0d9] flex flex-col overflow-hidden">
      <HeaderDefault 
        title="Programmation Graphique ESP32" 
        stationName={`[${config.stationName}]`} 
      />
      
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
        {/* Toolbox latérale - style chaiNNer */}
        <div 
          className={`bg-[#161b22] border-r border-[#30363d] transition-all duration-300 overflow-y-auto flex flex-col ${isToolboxOpen ? 'w-60' : 'w-10'}`}
        >
          {isToolboxOpen ? (
            <div className="flex flex-col h-full">
              <div className="p-3 border-b border-[#30363d]">
                <div className="flex justify-between items-center">
                  <h2 className="text-sm font-medium text-[#e6edf3]">Composants</h2>
                  <button 
                    onClick={() => setIsToolboxOpen(false)}
                    className="text-[#7d8590] hover:text-[#e6edf3] p-1 rounded hover:bg-[#30363d]"
                    title="Réduire la boîte à outils"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                
                {/* Barre de recherche style chaiNNer */}
                <div className="mt-3 relative">
                  <input 
                    type="text" 
                    placeholder="Rechercher des composants..." 
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-md py-1.5 px-2.5 text-sm text-[#e6edf3] placeholder-[#7d8590] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg className="absolute right-2 top-1.5 text-[#7d8590]" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2">
                <ToolboxCategory title="Cartes ESP32" defaultOpen={true}>
                  <ToolboxItem 
                    icon={<Esp32Icon />}
                    label="ESP32-WROOM"
                    onDragStart={(e) => onDragStart(e, 'esp32')}
                    onClick={() => addNode('esp32', { x: 250, y: 150 })}
                  />
                  <ToolboxItem 
                    icon={<Esp32Icon />}
                    label="ESP32-S3"
                    onDragStart={(e) => onDragStart(e, 'esp32')}
                    onClick={() => addNode('esp32', { x: 250, y: 150 })}
                  />
                </ToolboxCategory>
                
                <ToolboxCategory title="GPIO" defaultOpen={true}>
                  <ToolboxItem 
                    icon={<GpioIcon />}
                    label="Sortie Numérique"
                    onDragStart={(e) => onDragStart(e, 'gpioOutput')}
                    onClick={() => addNode('gpioOutput', { x: 250, y: 150 })}
                  />
                  <ToolboxItem 
                    icon={<GpioIcon />}
                    label="Entrée Numérique"
                    onDragStart={(e) => onDragStart(e, 'gpioInput')}
                    onClick={() => addNode('gpioInput', { x: 250, y: 150 })}
                  />
                  <ToolboxItem 
                    icon={<GpioIcon />}
                    label="PWM"
                    onDragStart={(e) => onDragStart(e, 'gpioOutput')}
                    onClick={() => addNode('gpioOutput', { x: 250, y: 150 })}
                  />
                </ToolboxCategory>
                
                <ToolboxCategory title="Communication" defaultOpen={true}>
                  <ToolboxItem 
                    icon={<MqttIcon />}
                    label="MQTT"
                    onDragStart={(e) => onDragStart(e, 'mqtt')}
                    onClick={() => addNode('mqtt', { x: 250, y: 150 })}
                  />
                </ToolboxCategory>
                
                <ToolboxCategory title="Capteurs" defaultOpen={true}>
                  <ToolboxItem 
                    icon={<SensorIcon />}
                    label="Température"
                    onDragStart={(e) => onDragStart(e, 'sensor')}
                    onClick={() => addNode('sensor', { x: 250, y: 150 })}
                  />
                  <ToolboxItem 
                    icon={<SensorIcon />}
                    label="Mouvement"
                    onDragStart={(e) => onDragStart(e, 'sensor')}
                    onClick={() => addNode('sensor', { x: 250, y: 150 })}
                  />
                </ToolboxCategory>
                
                <ToolboxCategory title="Temporisation" defaultOpen={true}>
                  <ToolboxItem 
                    icon={<TimerIcon />}
                    label="Minuterie"
                    onDragStart={(e) => onDragStart(e, 'timer')}
                    onClick={() => addNode('timer', { x: 250, y: 150 })}
                  />
                  <ToolboxItem 
                    icon={<TimerIcon />}
                    label="Délai"
                    onDragStart={(e) => onDragStart(e, 'timer')}
                    onClick={() => addNode('timer', { x: 250, y: 150 })}
                  />
                </ToolboxCategory>
              </div>
            </div>
          ) : (
            <div className="p-2 flex flex-col items-center space-y-3 mt-2">
              <button 
                onClick={() => setIsToolboxOpen(true)}
                className="text-[#7d8590] hover:text-[#e6edf3] p-1.5 rounded-md hover:bg-[#30363d]"
                title="Ouvrir la boîte à outils"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <div className="w-full border-t border-[#30363d] my-1"></div>
              <button className="p-1.5 rounded-md hover:bg-[#30363d] text-[#7d8590] hover:text-[#e6edf3]" title="Cartes ESP32">
                <Esp32Icon />
              </button>
              <button className="p-1.5 rounded-md hover:bg-[#30363d] text-[#7d8590] hover:text-[#e6edf3]" titleGPIO>
                <GpioIcon />
              </button>
              <button className="p-1.5 rounded-md hover:bg-[#30363d] text-[#7d8590] hover:text-[#e6edf3]" title="Communication">
                <MqttIcon />
              </button>
              <button className="p-1.5 rounded-md hover:bg-[#30363d] text-[#7d8590] hover:text-[#e6edf3]" title="Capteurs">
                <SensorIcon />
              </button>
              <button className="p-1.5 rounded-md hover:bg-[#30363d] text-[#7d8590] hover:text-[#e6edf3]" title="Temporisation">
                <TimerIcon />
              </button>
            </div>
          )}
        </div>
        
        {/* Zone d'édition principale style chaiNNer */}
        <div className="flex-1 relative bg-[#0d1117]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background 
              color="#21262d" 
              gap={20} 
              size={1} 
              variant={BackgroundVariant.Dots} 
            />
            <Controls 
              style={{
                display: 'flex',
                backgroundColor: '#161b22',
                border: '1px solid #30363d',
                borderRadius: '6px',
                overflow: 'hidden'
              }}
            />
            <MiniMap 
              nodeColor="#1f6feb"
              maskColor="rgba(13, 17, 23, 0.6)"
              style={{
                backgroundColor: '#161b22',
                border: '1px solid #30363d',
                borderRadius: '6px',
                width: 150,
                height: 100
              }}
            />
            
            <Panel position="top-right" className="bg-[#161b22] rounded-md border border-[#30363d] p-1.5 flex space-x-2">
              <button className="px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] rounded-md text-sm font-medium text-white flex items-center">
                <svg className="mr-1.5" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17 21v-8H7v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 3v5h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Sauvegarder
              </button>
              <button className="px-3 py-1.5 bg-[#1f6feb] hover:bg-[#2c83f3] rounded-md text-sm font-medium text-white flex items-center">
                <svg className="mr-1.5" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Téléverser
              </button>
            </Panel>
          </ReactFlow>
        </div>
      </div>
    </div>
  )
}