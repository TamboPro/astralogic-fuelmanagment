import { Handle, Position } from 'reactflow'

interface GPIOOutputNodeProps {
  data: {
    label: string;
    pin?: number;
  };
}

const GPIOOutputNode = ({ data }: GPIOOutputNodeProps) => {
  return (
    <div className="px-2 py-1 shadow-md rounded-md bg-white border border-green-500 text-xs min-w-[60px]">
      <div className="flex items-center">
        <div className="rounded-full w-5 h-5 flex justify-center items-center bg-green-100 mr-1">
          <span className="text-green-700 font-bold text-xs">OUT</span>
        </div>
        <div>
          <div className="font-bold text-black">{data.label}</div>
          {data.pin && <div className="text-gray-500">Pin: {data.pin}</div>}
        </div>
      </div>

      <Handle type="target" position={Position.Top} className="w-1.5 h-1.5 bg-green-500" />
      <Handle type="source" position={Position.Bottom} className="w-1.5 h-1.5 bg-green-500" />
    </div>
  )
}

export default GPIOOutputNode