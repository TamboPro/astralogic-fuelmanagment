// components/settings/MqttSettings.tsx
import { CloudCog, RefreshCw, User, Key, Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { useDispatch, useSelector } from 'react-redux'
import { updateConfig, updateMqttAuth, RootState } from '@/store/store'

interface MqttSettingsProps {
  generateClientId: () => void
}

const MqttSettings = ({ generateClientId }: MqttSettingsProps) => {
  const dispatch = useDispatch()
  const config = useSelector((state: RootState) => state.config)
  const [showPassword, setShowPassword] = useState(false)

  const handleInputChange = (field: keyof typeof config, value: string | boolean) => {
    dispatch(updateConfig({ [field]: value }))
  }

  const handleMqttAuthChange = (field: keyof typeof config.mqttAuth, value: string) => {
    dispatch(updateMqttAuth({ [field]: value }))
  }

  return (
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
  )
}

export default MqttSettings