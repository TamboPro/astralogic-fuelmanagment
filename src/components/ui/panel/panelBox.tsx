'use client'

import React from 'react'
interface PanelProps {
  title: string;
  children: React.ReactNode;
  showSelect?: boolean;
  selectOptions?: { value: string; label: string }[];
  onSelectChange?: (value: string) => void;
  selectValue?: string;
  className?: string; // Ajoutez cette ligne
}

const Panel: React.FC<PanelProps> = ({ 
  title, 
  children, 
  showSelect = true,
  selectOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' }
  ],
  onSelectChange,
  selectValue,
  className = '' // Ajoutez cette ligne
}) => {
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onSelectChange) {
      onSelectChange(e.target.value);
    }
  };

  return (
     <div className={`flex-1 bg-[#202226] rounded-[0.5px] border border-[#2c3235] flex flex-col ${className}`}>
      {/* Header - 1/8 de la hauteur */}
      <div className="h-1/8 flex items-center justify-between bg-[#25292d] border-b border-[#2c3235] px-4">
        {/* Texte à gauche (1/4 de l'espace) */}
        <span className="text-[#8e9297] text-xs flex-1">
          {title}
        </span>
        
        {/* Selectbox à droite (3/4 de l'espace) - Conditionnellement affiché */}
        {showSelect && (
          <select 
            className="bg-[#2c3235] border border-[#3a3f47] text-[#c7d0d9] text-[10px] rounded pr-1 py-1 w-2/5 h-6.5/7 focus:outline-none focus:ring-1 focus:ring-[#33a2e5]"
            value={selectValue}
            onChange={handleSelectChange}
          >
            {selectOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      </div>
      
      {/* Body - 7/8 de la hauteur */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}

export default Panel