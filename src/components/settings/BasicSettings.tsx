// components/settings/BasicSettings.tsx
import { Settings2 } from "lucide-react"
import { useDispatch, useSelector } from 'react-redux'
import { updateConfig, RootState } from '@/store/store'

const BasicSettings = () => {
  const dispatch = useDispatch()
  const config = useSelector((state: RootState) => state.config)

  const handleInputChange = (field: keyof typeof config, value: string | boolean) => {
    dispatch(updateConfig({ [field]: value }))
  }

  return (
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
  )
}

export default BasicSettings