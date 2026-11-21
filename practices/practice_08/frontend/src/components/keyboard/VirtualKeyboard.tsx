import React from 'react'
import { Keyboard3D } from './Keyboard3D'

interface VirtualKeyboardProps {
  activeChar?: string
  heatmapMode?: boolean
  heatmapData?: Record<string, number>
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = (props) => {
  return <Keyboard3D {...props} />
}
