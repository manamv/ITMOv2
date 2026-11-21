import React, { useState } from 'react'
import { BlindTypingKeyboard } from './BlindTypingKeyboard'
import { Keyboard3D } from './Keyboard3D'

interface VirtualKeyboardProps {
  activeChar?: string
  heatmapMode?: boolean
  heatmapData?: Record<string, number>
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = (props) => {
  const [mode, setMode] = useState<'blindtyping' | 'isometric'>('blindtyping')

  const toggleMode = () => setMode(m => m === 'blindtyping' ? 'isometric' : 'blindtyping')

  return (
    <div className="w-full relative">
      {mode === 'blindtyping' ? (
        <BlindTypingKeyboard {...props} mode={mode} onToggleMode={toggleMode} />
      ) : (
        <div className="w-full">
          <div className="flex justify-end mb-2">
            <button
              onClick={toggleMode}
              className="text-[11px] font-mono px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
            >
              🖐 Вернуться к силуэтным рукам
            </button>
          </div>
          <Keyboard3D {...props} />
        </div>
      )}
    </div>
  )
}
