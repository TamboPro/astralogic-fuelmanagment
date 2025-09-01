import { Handle, Position } from 'reactflow'

interface TimerNodeProps {
  data: {
    label: string;
    duration?: number;
    unit?: string;
  };
}

const TimerNode = ({ data }: TimerNodeProps) => {
  return (
    <div className="px-2 py-1 shadow-md rounded-md bg-white border border-yellow-500 min-w-[60px] text-xs">
      <div className="flex flex-col items-center">
        <div className="rounded-full w-5 h-5 flex justify-center items-center bg-yellow-100 mb-1">
          <span className="text-yellow-700 text-xs">⏱</span>
        </div>
        <div className="text-center">
          <div className="font-bold text-black">{data.label}</div>
          {data.duration && (
            <div className="text-gray-500">
              {data.duration} {data.unit || 'ms'}
            </div>
          )}
        </div>
      </div>

      <Handle type="target" position={Position.Top} className="w-1.5 h-1.5 bg-yellow-500" />
      <Handle type="source" position={Position.Bottom} className="w-1.5 h-1.5 bg-yellow-500" />
    </div>
  )
}

export default TimerNode