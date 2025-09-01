import { Handle, Position } from 'reactflow'

interface GPIOInputNodeProps {
  data: {
    label: string;
    pin?: number;
  };
}

const GPIOInputNode = ({ data }: GPIOInputNodeProps) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-blue-500">
      <div className="flex items-center">
        <div className="rounded-full w-10 h-10 flex justify-center items-center bg-blue-100 mr-2">
          <span className="text-blue-700 font-bold">IN</span>
        </div>
        <div>
          <div className="font-bold text-black">{data.label}</div>
          {data.pin && <div className="text-gray-500 text-xs">Pin: {data.pin}</div>}
        </div>
      </div>

      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500" />
    </div>
  )
}

export default GPIOInputNode