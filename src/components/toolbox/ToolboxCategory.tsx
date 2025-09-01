import { ReactNode, useState } from 'react'

interface ToolboxCategoryProps {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

const ToolboxCategory = ({ title, defaultOpen = false, children }: ToolboxCategoryProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  
  return (
    <div className="mb-2 w-full">
      <button 
        className="flex justify-between items-center w-full py-1 px-0.5 text-left font-medium text-gray-300 hover:text-white text-xs"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{title}</span>
        <span className="flex-shrink-0">{isOpen ? '▼' : '▶'}</span>
      </button>
      
      {isOpen && (
        <div className="pl-1 space-y-0.5 w-full">
          {children}
        </div>
      )}
    </div>
  )
}

export default ToolboxCategory