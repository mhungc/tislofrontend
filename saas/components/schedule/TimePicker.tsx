'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Clock } from 'lucide-react'

interface TimePickerProps {
  value: string
  onChange: (time: string) => void
  className?: string
}

export function TimePicker({ value, onChange, className = '' }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hours, minutes] = value.split(':')
  const containerRef = useRef<HTMLDivElement>(null)

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside as any)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside as any)
    }
  }, [isOpen])

  const handleHourClick = (hour: string) => {
    onChange(`${hour.padStart(2, '0')}:${minutes}`)
  }

  const handleMinuteClick = (minute: string) => {
    onChange(`${hours}:${minute.padStart(2, '0')}`)
  }

  const hoursArray = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
  const minutesArray = ['00', '15', '30', '45']

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Input
          type="text"
          value={value}
          readOnly={true}
          onClick={() => setIsOpen(!isOpen)}
          className="cursor-pointer text-center font-medium text-base pr-8 h-10 md:h-12 touch-manipulation"
          placeholder="--:--"
        />
        <Clock 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" 
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border rounded-lg shadow-xl p-3 min-w-[280px] md:min-w-[320px]">
          <div className="grid grid-cols-2 gap-3">
            {/* Horas */}
            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-2 text-center">
                Hora
              </div>
              <div className="grid grid-cols-4 gap-1 max-h-64 overflow-y-auto custom-scrollbar">
                {hoursArray.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => handleHourClick(hour)}
                    className={`
                      p-2 md:p-3 rounded text-sm md:text-base font-medium
                      transition-all duration-150 cursor-pointer touch-manipulation
                      hover:bg-primary hover:text-white
                      active:scale-95
                      ${hours === hour 
                        ? 'bg-primary text-white shadow-md' 
                        : 'bg-gray-50 hover:bg-primary/90'
                      }
                    `}
                  >
                    {hour}
                  </button>
                ))}
              </div>
            </div>

            {/* Minutos */}
            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-2 text-center">
                Minutos
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {minutesArray.map((minute) => (
                  <button
                    key={minute}
                    type="button"
                    onClick={() => handleMinuteClick(minute)}
                    className={`
                      p-3 md:p-4 rounded text-sm md:text-base font-medium
                      transition-all duration-150 cursor-pointer touch-manipulation
                      hover:bg-primary hover:text-white
                      active:scale-95
                      ${minutes === minute 
                        ? 'bg-primary text-white shadow-md' 
                        : 'bg-gray-50 hover:bg-primary/90'
                      }
                    `}
                  >
                    {minute}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t flex gap-2">
            <button
              type="button"
              onClick={() => {
                onChange(value)
                setIsOpen(false)
              }}
              className="flex-1 bg-primary text-white px-3 py-2 rounded text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer touch-manipulation active:scale-95"
            >
              Aplicar
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-2 rounded text-sm font-medium bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer touch-manipulation active:scale-95"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  )
}
