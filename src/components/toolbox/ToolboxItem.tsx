import { ReactNode, DragEvent } from 'react'

interface ToolboxItemProps {
  icon: ReactNode;
  label: string;
  onDragStart: (event: DragEvent<HTMLDivElement>, nodeType: string) => void;
  onClick: () => void;
}

const ToolboxItem = ({ icon, label, onDragStart, onClick }: ToolboxItemProps) => {
  return (
    <div
      className="flex items-center p-1 rounded cursor-move hover:bg-gray-700 text-xs w-full"
      draggable
      onDragStart={(e) => onDragStart(e, label.toLowerCase().replace(' ', '-'))}
      onClick={onClick}
    >
      <div className="mr-1 flex-shrink-0">{icon}</div>
      <span className="text-xs truncate">{label}</span>
    </div>
  )
}

export default ToolboxItem