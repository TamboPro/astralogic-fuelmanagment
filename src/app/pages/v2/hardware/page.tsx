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

// Icônes réduites de moitié
const Esp32Icon = () => <div className="w-3 h-3 bg-blue-500 rounded"></div>
const GpioIcon = () => <div className="w-3 h-3 bg-green-500 rounded"></div>
const TimerIcon = () => <div className="w-3 h-3 bg-yellow-500 rounded"></div>
const MqttIcon = () => <div className="w-3 h-3 bg-purple-500 rounded"></div>
const SensorIcon = () => <div className="w-3 h-3 bg-red-500 rounded"></div>

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
    <div className="min-h-screen bg-black text-[#c7d0d9] flex flex-col">
      <HeaderDefault 
        title="Programmation Graphique ESP32" 
        stationName={`[${config.stationName}]`} 
      />
      
      <div className="flex flex-1" style={{ height: 'calc(100vh - 64px)' }}>
        {/* Toolbox latérale - largeur réduite */}
        <div 
          className={`bg-[#1a1d21] transition-all duration-300 overflow-y-auto ${isToolboxOpen ? 'w-40' : 'w-7'}`}
          style={{ minHeight: '100%' }}
        >
          {isToolboxOpen ? (
            <Toolbox>
              <div className="p-2">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-sm font-semibold">Composants</h2>
                  <button 
                    onClick={() => setIsToolboxOpen(false)}
                    className="text-gray-400 hover:text-white p-0.5 rounded text-xs"
                  >
                    ◀
                  </button>
                </div>
                
                <ToolboxCategory title="Cartes ESP32" defaultOpen={true}>
                  <ToolboxItem 
                    icon={<Esp32Icon />}
                    label="ESP32-WROOM"
                    onDragStart={(e) => onDragStart(e, 'esp32')}
                    onClick={() => addNode('esp32', { x: 50, y: 50 })}
                  />
                  <ToolboxItem 
                    icon={<Esp32Icon />}
                    label="ESP32-S3"
                    onDragStart={(e) => onDragStart(e, 'esp32')}
                    onClick={() => addNode('esp32', { x: 50, y: 50 })}
                  />
                </ToolboxCategory>
                
                <ToolboxCategory title="GPIO" defaultOpen={true}>
                  <ToolboxItem 
                    icon={<GpioIcon />}
                    label="Sortie Numérique"
                    onDragStart={(e) => onDragStart(e, 'gpioOutput')}
                    onClick={() => addNode('gpioOutput', { x: 50, y: 50 })}
                  />
                  <ToolboxItem 
                    icon={<GpioIcon />}
                    label="Entrée Numérique"
                    onDragStart={(e) => onDragStart(e, 'gpioInput')}
                    onClick={() => addNode('gpioInput', { x: 50, y: 50 })}
                  />
                  <ToolboxItem 
                    icon={<GpioIcon />}
                    label="PWM"
                    onDragStart={(e) => onDragStart(e, 'gpioOutput')}
                    onClick={() => addNode('gpioOutput', { x: 50, y: 50 })}
                  />
                </ToolboxCategory>
                
                <ToolboxCategory title="Communication" defaultOpen={true}>
                  <ToolboxItem 
                    icon={<MqttIcon />}
                    label="MQTT"
                    onDragStart={(e) => onDragStart(e, 'mqtt')}
                    onClick={() => addNode('mqtt', { x: 50, y: 50 })}
                  />
                </ToolboxCategory>
                
                <ToolboxCategory title="Capteurs" defaultOpen={true}>
                  <ToolboxItem 
                    icon={<SensorIcon />}
                    label="Température"
                    onDragStart={(e) => onDragStart(e, 'sensor')}
                    onClick={() => addNode('sensor', { x: 50, y: 50 })}
                  />
                  <ToolboxItem 
                    icon={<SensorIcon />}
                    label="Mouvement"
                    onDragStart={(e) => onDragStart(e, 'sensor')}
                    onClick={() => addNode('sensor', { x: 50, y: 50 })}
                  />
                </ToolboxCategory>
                
                <ToolboxCategory title="Temporisation" defaultOpen={true}>
                  <ToolboxItem 
                    icon={<TimerIcon />}
                    label="Minuterie"
                    onDragStart={(e) => onDragStart(e, 'timer')}
                    onClick={() => addNode('timer', { x: 50, y: 50 })}
                  />
                  <ToolboxItem 
                    icon={<TimerIcon />}
                    label="Délai"
                    onDragStart={(e) => onDragStart(e, 'timer')}
                    onClick={() => addNode('timer', { x: 50, y: 50 })}
                  />
                </ToolboxCategory>
              </div>
            </Toolbox>
          ) : (
            <div className="p-1">
              <button 
                onClick={() => setIsToolboxOpen(true)}
                className="text-gray-400 hover:text-white p-1 rounded mb-1 w-full text-left text-xs"
              >
                ▶
              </button>
              <div className="space-y-1">
                <button className="p-1 w-full flex justify-center text-gray-400 hover:text-white">
                  <Esp32Icon />
                </button>
                <button className="p-1 w-full flex justify-center text-gray-400 hover:text-white">
                  <GpioIcon />
                </button>
                <button className="p-1 w-full flex justify-center text-gray-400 hover:text-white">
                  <MqttIcon />
                </button>
                <button className="p-1 w-full flex justify-center text-gray-400 hover:text-white">
                  <TimerIcon />
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Zone d'édition principale */}
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
              color="#2d3748" 
              gap={10} 
              size={0.5} 
              variant={BackgroundVariant.Dots} 
            />
            <Controls />
            <MiniMap 
              nodeColor="#3182ce"
              maskColor="rgba(13, 17, 23, 0.6)"
              style={{
                width: 100,
                height: 75
              }}
            />
            
            <Panel position="top-right" className="bg-[#1a1d21] rounded p-1">
              <button className="px-1.5 py-0.5 bg-blue-600 rounded mr-1 text-xs">Sauvegarder</button>
              <button className="px-1.5 py-0.5 bg-green-600 rounded text-xs">Téléverser</button>
            </Panel>
          </ReactFlow>
        </div>
      </div>
    </div>
  )
}