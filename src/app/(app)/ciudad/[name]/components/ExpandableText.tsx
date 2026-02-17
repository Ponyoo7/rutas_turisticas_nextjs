'use client'

import { useState } from 'react'

interface Props {
  text: string
  limit: number
}

export const ExpandableText = ({ text, limit }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const words = text.split(/\s+/)
  const isOverLimit = words.length > limit

  const displayText =
    isExpanded || !isOverLimit ? text : words.slice(0, limit).join(' ') + '...'

  if (!text) return null

  return (
    <div>
      <p>{displayText}</p>
      {isOverLimit && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-artis-primary hover:text-artis-primary/50 text-sm font-semibold mt-1"
        >
          {isExpanded ? 'Leer menos' : 'Leer más'}
        </button>
      )}
    </div>
  )
}
