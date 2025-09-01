import { Handle, Position } from 'reactflow'

interface MQTTNodeProps {
  data: {
    label: string;
    topic?: string;
    broker?: string;
  };
}

const MQTTNode = ({ data }: MQTTNodeProps) => {
  return (
    <div className="px-2 py-1 shadow-md rounded-md bg-white border border-purple-500 min-w-[70px] text-xs">
      <div className="flex flex-col items-center">
        <div className="rounded-full w-5 h-5 flex justify-center items-center bg-purple-100 mb-1">
          <span className="text-purple-700 font-bold text-xs">M</span>
        </div>
        <div className="text-center">
          <div className="font-bold text-black">{data.label}</div>
          {data.topic && (
            <div className="text-gray-500 truncate" title={data.topic}>
              {data.topic}
            </div>
          )}
        </div>
      </div>

      <Handle type="target" position={Position.Top} className="w-1.5 h-1.5 bg-purple-500" />
      <Handle type="source" position={Position.Bottom} className="w-1.5 h-1.5 bg-purple-500" />
    </div>
  )
}

export default MQTTNode