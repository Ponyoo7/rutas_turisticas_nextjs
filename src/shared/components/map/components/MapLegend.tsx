'use client'

import { legendItems } from '../mapIcons'

export function MapLegend() {
  return (
    <div className="absolute bottom-2 right-2 z-1000 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-xl min-w-[160px] animate-in fade-in slide-in-from-top-2 duration-500">
      <ul className="space-y-2.5">
        {legendItems.map((item) => (
          <li key={item.label} className="flex items-center gap-3 group">
            <div
              className={`flex items-center justify-center w-7 h-7 rounded-full ${item.color} shadow-sm border border-white transition-transform group-hover:scale-110`}
            >
              <item.icon size={16} color="white" stroke={2} />
            </div>
            <span className="text-xs font-medium text-stone-600 group-hover:text-stone-900 transition-colors">
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
