// components/settings/RestSettings.tsx
import { Server, TestTube } from "lucide-react"
import { useDispatch, useSelector } from 'react-redux'
import { updateConfig, RootState } from '@/store/store'
import { useApiActions } from '@/hooks/useApiActions'

const RestSettings = () => {
  const dispatch = useDispatch()
  const config = useSelector((state: RootState) => state.config)
  const { testRestApi } = useApiActions()

  const handleInputChange = (field: keyof typeof config, value: string | boolean) => {
    dispatch(updateConfig({ [field]: value }))
  }

  return (
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
  )
}

export default RestSettings