import React from 'react'
import type { ViewMode } from '../types'
import WorldBuilder from '../components/WorldBuilder'

interface WorldEditorProps {
  onNavigate: (view: ViewMode) => void
}

const WorldEditor: React.FC<WorldEditorProps> = ({ onNavigate }) => {
  return (
    <WorldBuilder onNavigate={onNavigate} />
  )
}

export default WorldEditor