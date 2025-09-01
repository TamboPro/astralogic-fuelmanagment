import { Handle, Position } from 'reactflow'

interface SensorNodeProps {
  data: {
    label: string;
    type?: string;
    pin?: number;
  };
}

const SensorNode = ({ data }: SensorNodeProps) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-red-500 min-w-[120px]">
      <div className="flex flex-col items-center">
        <div className="rounded-full w-10 h-10 flex justify-center items-center bg-red-100 mb-2">
          <span className="text-red-700 font-bold">📡</span>
        </div>
        <div className="text-center">
          <div className="font-bold text-black text-sm">{data.label}</div>
          {data.type && (
            <div className="text-gray-500 text-xs capitalize">{data.type}</div>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-red-500" />
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-red-500" />
    </div>
  )
}

export default SensorNode