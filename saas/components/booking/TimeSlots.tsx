'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Clock } from 'lucide-react'

interface TimeSlot {
  time: string
  available: boolean
}

interface TimeSlotsProps {
  slots: TimeSlot[]
  selectedTime: string
  onTimeSelect: (time: string) => void
  loading?: boolean
}

export function TimeSlots({ slots, selectedTime, onTimeSelect, loading }: TimeSlotsProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>Cargando horarios disponibles...</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay horarios disponibles
        </h3>
        <p className="text-gray-600">
          Selecciona otro día para ver los horarios disponibles
        </p>
      </div>
    )
  }

  const availableSlots = slots.filter(slot => slot.available)
  const unavailableSlots = slots.filter(slot => !slot.available)

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  const groupSlotsByPeriod = (slots: TimeSlot[]) => {
    const morning = slots.filter(slot => {
      const hour = parseInt(slot.time.split(':')[0])
      return hour < 12
    })
    
    const afternoon = slots.filter(slot => {
      const hour = parseInt(slot.time.split(':')[0])
      return hour >= 12 && hour < 18
    })
    
    const evening = slots.filter(slot => {
      const hour = parseInt(slot.time.split(':')[0])
      return hour >= 18
    })

    return { morning, afternoon, evening }
  }

  const { morning, afternoon, evening } = groupSlotsByPeriod(availableSlots)

  const renderSlotGroup = (title: string, slots: TimeSlot[]) => {
    if (slots.length === 0) return null

    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">{title}</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {slots.map(slot => (
            <Button
              key={slot.time}
              variant={selectedTime === slot.time ? "default" : "outline"}
              size="sm"
              onClick={() => onTimeSelect(slot.time)}
              className="justify-center text-sm"
            >
              {formatTime(slot.time)}
            </Button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Clock className="h-4 w-4" />
        <span>{availableSlots.length} horarios disponibles</span>
      </div>

      {renderSlotGroup('Mañana', morning)}
      {renderSlotGroup('Tarde', afternoon)}
      {renderSlotGroup('Noche', evening)}

      {unavailableSlots.length > 0 && (
        <details className="mt-6">
          <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
            Ver horarios no disponibles ({unavailableSlots.length})
          </summary>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {unavailableSlots.map(slot => (
              <Button
                key={slot.time}
                variant="outline"
                size="sm"
                disabled
                className="justify-center text-sm opacity-50"
              >
                {formatTime(slot.time)}
              </Button>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}