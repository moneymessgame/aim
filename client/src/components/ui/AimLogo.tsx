'use client'

import React from 'react'

interface AimLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function AimLogo({ className = '', size = 'md' }: AimLogoProps) {
  // Определяем размеры в зависимости от параметра size
  const getFontSize = () => {
    switch (size) {
      case 'sm': return 'text-2xl'
      case 'lg': return 'text-5xl'
      case 'md':
      default: return 'text-3xl'
    }
  }

  return (
    <div className={`font-bebas ${getFontSize()} font-bold ${className}`}>
      <span 
        className="text-[#2e2f2f]"
        style={{ 
          textShadow: '0px 0px 5px rgba(220, 220, 255, 0.6)' 
        }}
      >
        AI
      </span>
      <span 
        className="text-[#ff0f0f]"
        style={{ 
          textShadow: '0px 0px 5px rgba(255, 15, 15, 1)' 
        }}
      >
        M
      </span>
    </div>
  )
}

export default AimLogo
