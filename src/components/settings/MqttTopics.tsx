// components/settings/MqttTopics.tsx
import { Cable, Trash2, Plus } from "lucide-react"
import { useState } from "react"
import { useDispatch, useSelector } from 'react-redux'
import { updateTopic, addTopic, removeTopic, RootState } from '@/store/store'

const MqttTopics = () => {
  const dispatch = useDispatch()
  const config = useSelector((state: RootState) => state.config)
  const [newTopic, setNewTopic] = useState('')
  const [newTopicQos, setNewTopicQos] = useState<0 | 1 | 2>(0)
  const [newTopicRetain, setNewTopicRetain] = useState(false)

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

  return (
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
  )
}

export default MqttTopics