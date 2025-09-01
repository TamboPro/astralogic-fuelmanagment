import { Handle, Position } from 'reactflow'
import { useState } from 'react'

interface ESP32NodeProps {
  data: {
    label: string;
    model?: string;
    features?: { id: string; config?: any }[];
  };
}

const Esp32Icon = () => <div className="w-4 h-4 bg-blue-500 rounded"></div>
const WifiIcon = () => <div className="w-3 h-3 bg-green-500 rounded-full"></div>
const BluetoothIcon = () => <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
const GpioIcon = () => <div className="w-3 h-3 bg-yellow-500 rounded"></div>
const AdcIcon = () => <div className="w-3 h-3 bg-purple-500 rounded"></div>
const SpiIcon = () => <div className="w-3 h-3 bg-red-500 rounded"></div>
const I2cIcon = () => <div className="w-3 h-3 bg-orange-500 rounded"></div>
const ThreeDotsIcon = () => (
  <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 16 16">
    <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
  </svg>
)

const FeatureIcons: { [key: string]: React.FC } = {
  wifi: WifiIcon,
  bluetooth: BluetoothIcon,
  gpio: GpioIcon,
  adc: AdcIcon,
  spi: SpiIcon,
  i2c: I2cIcon,
}

interface FeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFeature: (feature: string) => void;
}

const FeatureModal = ({ isOpen, onClose, onSelectFeature }: FeatureModalProps) => {
  if (!isOpen) return null

  const features = [
    { id: 'wifi', name: 'Wi-Fi', icon: WifiIcon },
    { id: 'bluetooth', name: 'Bluetooth', icon: BluetoothIcon },
    { id: 'gpio', name: 'GPIO', icon: GpioIcon },
    { id: 'adc', name: 'ADC', icon: AdcIcon },
    { id: 'spi', name: 'SPI', icon: SpiIcon },
    { id: 'i2c', name: 'I2C', icon: I2cIcon },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-[#1e2125] border border-gray-600 rounded-lg p-6 w-96 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white font-semibold text-lg">Ajouter une fonctionnalité</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl transition-colors"
          >
            ×
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {features.map((feature) => {
            const IconComponent = feature.icon
            return (
              <button
                key={feature.id}
                onClick={() => onSelectFeature(feature.id)}
                className="flex flex-col items-center p-4 bg-[#2a2e33] rounded-lg hover:bg-[#353a40] transition-all duration-200 hover:scale-105 border border-gray-700"
              >
                <div className="mb-2">
                  <IconComponent />
                </div>
                <span className="text-white text-sm font-medium">{feature.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: { id: string; config?: any };
  onUpdateConfig: (config: any) => void;
  onDelete: () => void;
}

const ConfigModal = ({ isOpen, onClose, feature, onUpdateConfig, onDelete }: ConfigModalProps) => {
  const [config, setConfig] = useState(feature.config || {})

  if (!isOpen) return null

  const handleSave = () => {
    onUpdateConfig(config)
    onClose()
  }

  const getCheckboxColor = (pin: number) => {
    // Une fois qu'une broche est sélectionnée, elle garde sa couleur d'origine
    const isChecked = config.pins?.includes(pin) || false
    if (!isChecked) return 'border-gray-600 bg-[#2a2e33]'
    
    // Couleur basée sur le mode actuel
    switch (config.mode) {
      case 'output': return 'border-blue-400 bg-blue-400/20'
      case 'input': return 'border-green-400 bg-green-400/20'
      case 'input_pullup': return 'border-yellow-400 bg-yellow-400/20'
      case 'input_pulldown': return 'border-purple-400 bg-purple-400/20'
      default: return 'border-blue-400 bg-blue-400/20'
    }
  }

  const renderConfigForm = () => {
    switch (feature.id) {
      case 'wifi':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-white text-sm font-medium mb-2 block">SSID</label>
              <input
                type="text"
                value={config.ssid || ''}
                onChange={(e) => setConfig({ ...config, ssid: e.target.value })}
                className="w-full bg-[#2a2e33] border border-gray-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Nom du réseau Wi-Fi"
              />
            </div>
            <div>
              <label className="text-white text-sm font-medium mb-2 block">Mot de passe</label>
              <input
                type="password"
                value={config.password || ''}
                onChange={(e) => setConfig({ ...config, password: e.target.value })}
                className="w-full bg-[#2a2e33] border border-gray-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Mot de passe"
              />
            </div>
          </div>
        )
      
      case 'adc':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-white text-sm font-medium mb-2 block">ADC</label>
              <select
                value={config.adcNumber || '1'}
                onChange={(e) => setConfig({ ...config, adcNumber: e.target.value })}
                className="w-full bg-[#2a2e33] border border-gray-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="1">ADC1</option>
                <option value="2">ADC2</option>
              </select>
            </div>
            <div>
              <label className="text-white text-sm font-medium mb-2 block">Résolution</label>
              <select
                value={config.resolution || '12'}
                onChange={(e) => setConfig({ ...config, resolution: e.target.value })}
                className="w-full bg-[#2a2e33] border border-gray-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="12">12 bits</option>
                <option value="10">10 bits</option>
                <option value="9">9 bits</option>
                <option value="8">8 bits</option>
              </select>
            </div>
            <div>
              <label className="text-white text-sm font-medium mb-2 block">Broches ADC</label>
              <div className="grid grid-cols-4 gap-2">
                {[32, 33, 34, 35, 36, 39].map((pin) => (
                  <label key={pin} className="flex items-center p-2 bg-[#2a2e33] rounded-md border border-gray-600 hover:border-gray-500 transition-colors">
                    <input
                      type="checkbox"
                      checked={config.pins?.includes(pin) || false}
                      onChange={(e) => {
                        const pins = config.pins || []
                        if (e.target.checked) {
                          setConfig({ ...config, pins: [...pins, pin] })
                        } else {
                          setConfig({ ...config, pins: pins.filter(p => p !== pin) })
                        }
                      }}
                      className="mr-2 accent-blue-500"
                    />
                    <span className="text-white text-xs">{pin}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )
      
      case 'gpio':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-white text-sm font-medium mb-2 block">Mode GPIO</label>
              <select
                value={config.mode || 'output'}
                onChange={(e) => setConfig({ ...config, mode: e.target.value })}
                className="w-full bg-[#2a2e33] border border-gray-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="output">Sortie</option>
                <option value="input">Entrée</option>
                <option value="input_pullup">Entrée Pull-up</option>
                <option value="input_pulldown">Entrée Pull-down</option>
              </select>
            </div>
            <div>
              <label className="text-white text-sm font-medium mb-2 block">Broches GPIO</label>
              <div className="grid grid-cols-4 gap-2">
                {[2, 4, 5, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 25, 26, 27].map((pin) => {
                  const isChecked = config.pins?.includes(pin) || false
                  const checkboxClass = getCheckboxColor(pin)
                  
                  return (
                    <label key={pin} className={`flex items-center p-2 rounded-md border transition-all duration-200 ${checkboxClass} ${isChecked ? 'scale-105' : 'hover:border-gray-500'}`}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const pins = config.pins || []
                          if (e.target.checked) {
                            setConfig({ ...config, pins: [...pins, pin] })
                          } else {
                            setConfig({ ...config, pins: pins.filter(p => p !== pin) })
                          }
                        }}
                        className="mr-2 accent-blue-500"
                      />
                      <span className="text-white text-xs font-medium">{pin}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          </div>
        )
      
      default:
        return (
          <div className="text-white text-sm text-center py-4">
            Configuration non disponible pour cette fonctionnalité.
          </div>
        )
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-[#1e2125] border border-gray-600 rounded-lg p-6 w-full max-w-md backdrop-blur-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white font-semibold text-lg capitalize">Configurer {feature.id}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl transition-colors"
          >
            ×
          </button>
        </div>
        
        <div className="max-h-96 overflow-y-auto pr-2">
          {renderConfigForm()}
        </div>
        
        <div className="flex justify-between mt-8 pt-4 border-t border-gray-700">
          <button
            onClick={onDelete}
            className="px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Supprimer
          </button>
          <div className="space-x-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Sauvegarder
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const ESP32Node = ({ data }: ESP32NodeProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)
  const [selectedFeature, setSelectedFeature] = useState<{ id: string; config?: any } | null>(null)
  const [features, setFeatures] = useState<{ id: string; config?: any }[]>(data.features || [])

  const handleAddFeature = (featureId: string) => {
    if (!features.some(f => f.id === featureId)) {
      setFeatures([...features, { id: featureId }])
    }
    setIsModalOpen(false)
  }

  const handleOpenConfig = (feature: { id: string; config?: any }) => {
    setSelectedFeature(feature)
    setIsConfigModalOpen(true)
  }

  const handleUpdateConfig = (config: any) => {
    if (selectedFeature) {
      setFeatures(features.map(f => 
        f.id === selectedFeature.id ? { ...f, config } : f
      ))
    }
  }

  const handleDeleteFeature = () => {
    if (selectedFeature) {
      setFeatures(features.filter(f => f.id !== selectedFeature.id))
      setIsConfigModalOpen(false)
      setSelectedFeature(null)
    }
  }

  // Récupérer les broches GPIO configurées
  const getGpioPins = () => {
    const gpioFeature = features.find(f => f.id === 'gpio')
    return gpioFeature?.config?.pins || []
  }

  const gpioPins = getGpioPins()

  return (
    <>
      <div className="px-4 py-3 bg-[#1a1d21] border border-gray-700 rounded-lg shadow-xl min-w-[140px] relative">
        {/* En-tête du nœud */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3">
              <Esp32Icon />
            </div>
            <div>
              <div className="text-white font-semibold text-sm">{data.label}</div>
              {data.model && (
                <div className="text-gray-400 text-xs">{data.model}</div>
              )}
            </div>
          </div>
          
          {/* Bouton d'ajout de fonctionnalité */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-all duration-200 hover:scale-110"
          >
            <span className="text-white text-sm font-bold">+</span>
          </button>
        </div>

        {/* Liste des fonctionnalités */}
        {features.length > 0 && (
          <div className="border-t border-gray-700 pt-3 mt-3">
            <div className="text-gray-400 text-xs font-medium mb-2">Fonctionnalités:</div>
            <div className="space-y-2">
              {features.map((feature) => {
                const IconComponent = FeatureIcons[feature.id]
                return (
                  <div key={feature.id} className="flex items-center justify-between bg-[#2a2e33] rounded-lg px-3 py-2 border border-gray-600">
                    <div className="flex items-center">
                      {IconComponent && <IconComponent />}
                      <span className="text-white text-xs font-medium ml-2 capitalize">
                        {feature.id}
                      </span>
                    </div>
                    <button
                      onClick={() => handleOpenConfig(feature)}
                      className="p-1 hover:bg-[#353a40] rounded-md transition-colors"
                    >
                      <ThreeDotsIcon />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Bordure colorée pour les broches GPIO */}
        {gpioPins.length > 0 && (
          <div className="absolute inset-0 border-2 rounded-lg pointer-events-none" style={{
            borderColor: '#3B82F6',
            opacity: 0.8
          }} />
        )}

        {/* Handles pour les connexions */}
        <Handle
          type="target"
          position={Position.Top}
          className="w-2.5 h-2.5 bg-blue-500 border-2 border-white"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-2.5 h-2.5 bg-blue-500 border-2 border-white"
        />
        <Handle
          type="source"
          position={Position.Right}
          className="w-2 h-2 bg-blue-400 border-2 border-white"
        />
        <Handle
          type="target"
          position={Position.Left}
          className="w-2 h-2 bg-blue-400 border-2 border-white"
        />

        {/* Handles supplémentaires pour les broches GPIO */}
        {gpioPins.map((pin: number, index: number) => (
          <Handle
            key={`gpio-${pin}`}
            type="source"
            position={Position.Right}
            id={`gpio-${pin}`}
            style={{
              top: `${20 + (index * 7)}%`,
              background: '#3B82F6',
              border: '2px solid white'
            }}
            className="w-2 h-2"
          />
        ))}
      </div>

      {/* Modal d'ajout de fonctionnalités */}
      <FeatureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectFeature={handleAddFeature}
      />

      {/* Modal de configuration */}
      {selectedFeature && (
        <ConfigModal
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
          feature={selectedFeature}
          onUpdateConfig={handleUpdateConfig}
          onDelete={handleDeleteFeature}
        />
      )}
    </>
  )
}

export default ESP32Node