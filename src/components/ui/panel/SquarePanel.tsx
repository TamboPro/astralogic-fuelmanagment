'use client'

import React from 'react'

interface SquarePanelProps {
  width?: number | string
  height?: number | string
  title: string
  topText: string
  mainValue: string
  subtitle?: string
  className?: string
  mainValueSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  // Nouvelles props pour les couleurs
  backgroundColor?: string
  borderColor?: string
  titleColor?: string
  topTextColor?: string
  mainValueColor?: string
  subtitleColor?: string
}

const SquarePanel: React.FC<SquarePanelProps> = ({
  width,
  height,
  title,
  topText,
  mainValue,
  subtitle,
  className = '',
  mainValueSize = '2xl',
  // Nouvelles props avec valeurs par défaut
  backgroundColor = '#202226',
  borderColor = '#2c3235',
  titleColor = '#c7d0d9',
  topTextColor = '#8e9297',
  mainValueColor = '#c7d0d9',
  subtitleColor = '#8e9297'
}) => {
  // Mapping des tailles de texte responsive
  const sizeClasses = {
    sm: 'text-sm md:text-base lg:text-lg',
    md: 'text-base md:text-lg lg:text-xl',
    lg: 'text-lg md:text-xl lg:text-2xl',
    xl: 'text-xl md:text-2xl lg:text-3xl',
    '2xl': 'text-2xl md:text-3xl lg:text-4xl'
  }

  // Styles inline pour les dimensions et couleurs
  const panelStyle: React.CSSProperties = {
    backgroundColor,
    borderColor
  }
  
  if (width !== undefined) {
    panelStyle.width = typeof width === 'number' ? `${width}px` : width
  }
  
  if (height !== undefined) {
    panelStyle.height = typeof height === 'number' ? `${height}px` : height
  }

  return (
    <div 
      className={`
        rounded-[0.5px] border
        flex flex-col items-center justify-between p-2 md:p-3
        ${className}
      `}
      style={panelStyle}
    >
      {/* Titre en haut */}
      <div className="text-center flex-shrink-0">
        <h3 
          className="text-xs md:text-sm font-regular leading-tight"
          style={{ color: titleColor }}
        >
          {title}
        </h3>
      </div>

      {/* Contenu central */}
      <div className="flex flex-col items-center justify-center flex-1 w-full py-1 md:py-2">
        {/* Sous-titre optionnel */}
        {subtitle && (
          <p 
            className="text-[10px] md:text-xs font-regular mb-1 leading-tight"
            style={{ color: subtitleColor }}
          >
            {subtitle}
          </p>
        )}
        
        {/* Valeur principale */}
        <div 
          className={`font-bold leading-none ${sizeClasses[mainValueSize]}`}
          style={{ color: mainValueColor }}
        >
          {mainValue}
        </div>
      </div>

      {/* Texte en bas */}
      <div className="text-center flex-shrink-0">
        <p 
          className="text-[10px] md:text-xs font-regular leading-tight"
          style={{ color: topTextColor }}
        >
          {topText}
        </p>
      </div>
    </div>
  )
}

export default SquarePanel