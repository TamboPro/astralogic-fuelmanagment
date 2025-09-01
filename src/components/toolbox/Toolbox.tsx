import { ReactNode } from 'react'

interface ToolboxProps {
  children: ReactNode;
}

const Toolbox = ({ children }: ToolboxProps) => {
  return (
    <div className="h-full bg-[#1a1d21] border-r border-gray-700 w-40">
      {children}
    </div>
  )
}

export default Toolbox