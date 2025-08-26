'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarProps {
  selectedDate: string
  onDateSelect: (date: string) => void
  minDate?: string
  maxDate?: string
  disabledDates?: string[]
}

export function Calendar({ 
  selectedDate, 
  onDateSelect, 
  minDate,
  maxDate,
  disabledDates = []
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const today = new Date()
  const minDateObj = minDate ? new Date(minDate) : today
  const maxDateObj = maxDate ? new Date(maxDate) : new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())

  useEffect(() => {
    if (selectedDate) {
      setCurrentMonth(new Date(selectedDate))
    }
  }, [selectedDate])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Días del mes anterior para completar la primera semana
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i)
      const prevYear = prevDate.getFullYear()
      const prevMonth = prevDate.getMonth()
      const prevDay = prevDate.getDate()
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        dateString: `${prevYear}-${(prevMonth + 1).toString().padStart(2, '0')}-${prevDay.toString().padStart(2, '0')}`
      })
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      days.push({
        date,
        isCurrentMonth: true,
        dateString: `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
      })
    }

    // Días del mes siguiente para completar la última semana
    const remainingDays = 42 - days.length // 6 semanas * 7 días
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day)
      const nextYear = nextDate.getFullYear()
      const nextMonth = nextDate.getMonth()
      const nextDay = nextDate.getDate()
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        dateString: `${nextYear}-${(nextMonth + 1).toString().padStart(2, '0')}-${nextDay.toString().padStart(2, '0')}`
      })
    }

    return days
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1)
      } else {
        newMonth.setMonth(prev.getMonth() + 1)
      }
      return newMonth
    })
  }

  const isDateDisabled = (dateString: string, date: Date, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return true
    if (date < minDateObj || date > maxDateObj) return true
    if (disabledDates.includes(dateString)) return true
    return false
  }

  const isDateSelected = (dateString: string) => {
    return selectedDate === dateString
  }

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString()
  }

  const days = getDaysInMonth(currentMonth)
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  const canNavigatePrev = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1) > minDateObj
  const canNavigateNext = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0) < maxDateObj

  return (
    <div className="bg-white rounded-lg border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateMonth('prev')}
          disabled={!canNavigatePrev}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h2 className="text-lg font-semibold">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateMonth('next')}
          disabled={!canNavigateNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 border-b">
        {dayNames.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map(({ date, isCurrentMonth, dateString }, index) => {
          const disabled = isDateDisabled(dateString, date, isCurrentMonth)
          const selected = isDateSelected(dateString)
          const today = isToday(date)

          return (
            <button
              key={index}
              onClick={() => !disabled && onDateSelect(dateString)}
              disabled={disabled}
              className={`
                p-3 text-sm border-r border-b hover:bg-gray-50 transition-colors
                ${!isCurrentMonth ? 'text-gray-300' : ''}
                ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                ${selected ? 'bg-primary text-primary-foreground hover:bg-primary' : ''}
                ${today && !selected ? 'bg-blue-50 text-blue-600 font-semibold' : ''}
                ${index % 7 === 6 ? 'border-r-0' : ''}
              `}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}