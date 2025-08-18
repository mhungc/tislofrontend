'use client'

import React, { useState, useEffect } from 'react'
import { ScheduleService, DayAvailability, TimeSlot } from '@/lib/services/schedule-service'
import { ServiceService } from '@/lib/services/service-service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { Calendar, ChevronLeft, ChevronRight, Clock, Check, X } from 'lucide-react'

interface AvailabilityCalendarProps {
  shopId: string
  onTimeSlotSelect?: (date: string, timeSlot: TimeSlot) => void
  selectedServiceId?: string
  className?: string
}

export function AvailabilityCalendar({
  shopId,
  onTimeSlotSelect,
  selectedServiceId,
  className = ''
}: AvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [availability, setAvailability] = useState<DayAvailability[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedService, setSelectedService] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null)

  const scheduleService = new ScheduleService()
  const serviceService = new ServiceService()

  // Cargar servicios de la tienda
  useEffect(() => {
    const loadServices = async () => {
      try {
        const shopServices = await serviceService.getShopServices(shopId)
        setServices(shopServices)
        
        // Si hay un servicio seleccionado, cargarlo
        if (selectedServiceId) {
          const service = shopServices.find(s => s.id === selectedServiceId)
          setSelectedService(service)
        }
      } catch (error) {
        console.error('Error al cargar servicios:', error)
      }
    }

    loadServices()
  }, [shopId, selectedServiceId])

  // Cargar disponibilidad cuando cambie la fecha o el servicio
  useEffect(() => {
    const loadAvailability = async () => {
      if (!selectedService) return

      setLoading(true)
      try {
        const startDate = new Date(currentDate)
        startDate.setDate(startDate.getDate() - 7) // Una semana antes
        
        const endDate = new Date(currentDate)
        endDate.setDate(endDate.getDate() + 21) // Tres semanas después

        const availabilityData = await scheduleService.calculateAvailability(
          shopId,
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0],
          selectedService.duration_minutes
        )

        setAvailability(availabilityData)
      } catch (error) {
        console.error('Error al cargar disponibilidad:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAvailability()
  }, [shopId, currentDate, selectedService])

  // Navegar al mes anterior
  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() - 1)
    setCurrentDate(newDate)
  }

  // Navegar al mes siguiente
  const goToNextMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + 1)
    setCurrentDate(newDate)
  }

  // Obtener días del mes actual
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Agregar días del mes anterior para completar la primera semana
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = new Date(year, month, -startingDayOfWeek + i + 1)
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        isToday: false
      })
    }

    // Agregar días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(year, month, i)
      const today = new Date()
      days.push({
        date: dayDate,
        isCurrentMonth: true,
        isToday: dayDate.toDateString() === today.toDateString()
      })
    }

    // Completar la última semana con días del siguiente mes
    const remainingDays = 42 - days.length // 6 semanas * 7 días
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i)
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        isToday: false
      })
    }

    return days
  }

  // Obtener disponibilidad para una fecha específica
  const getDayAvailability = (date: Date): DayAvailability | null => {
    const dateStr = date.toISOString().split('T')[0]
    return availability.find(day => day.date === dateStr) || null
  }

  // Manejar selección de fecha
  const handleDateSelect = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    setSelectedDate(dateStr)
    setSelectedTimeSlot(null)
  }

  // Manejar selección de slot de tiempo
  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    if (!timeSlot.available) return

    setSelectedTimeSlot(timeSlot)
    if (selectedDate && onTimeSlotSelect) {
      onTimeSlotSelect(selectedDate, timeSlot)
    }
  }

  // Obtener nombre del día
  const getDayName = (dayIndex: number) => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    return days[dayIndex]
  }

  // Obtener nombre del mes
  const getMonthName = (date: Date) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]
    return months[date.getMonth()]
  }

  const days = getDaysInMonth(currentDate)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Selector de servicio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Seleccionar Servicio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedService?.id || ''}
            onChange={(e) => {
              const value = e.target.value
              const service = services.find(s => s.id === value)
              setSelectedService(service)
            }}
            className="mt-1"
          >
            <option value="" disabled>Selecciona un servicio</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} ({service.duration_minutes} min)
              </option>
            ))}
          </Select>
        </CardContent>
      </Card>

      {/* Calendario */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calendario de Disponibilidad
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium">
                {getMonthName(currentDate)} {currentDate.getFullYear()}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextMonth}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Encabezados de días */}
              <div className="grid grid-cols-7 gap-1">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Días del calendario */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  const dayAvailability = getDayAvailability(day.date)
                  const isSelected = selectedDate === day.date.toISOString().split('T')[0]
                  const hasAvailableSlots = dayAvailability?.timeSlots.some(slot => slot.available) || false

                  return (
                    <div
                      key={index}
                      className={`
                        min-h-[80px] p-2 border rounded-lg cursor-pointer transition-colors
                        ${day.isCurrentMonth ? 'bg-background' : 'bg-muted/30'}
                        ${day.isToday ? 'ring-2 ring-primary' : ''}
                        ${isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'}
                        ${!day.isCurrentMonth ? 'opacity-50' : ''}
                      `}
                      onClick={() => day.isCurrentMonth && handleDateSelect(day.date)}
                    >
                      <div className="text-sm font-medium mb-1">
                        {day.date.getDate()}
                      </div>
                      
                      {dayAvailability && (
                        <div className="space-y-1">
                          {dayAvailability.isWorkingDay ? (
                            <div className="flex items-center gap-1">
                              {hasAvailableSlots ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <X className="h-3 w-3 text-red-500" />
                              )}
                              <span className="text-xs text-muted-foreground">
                                {dayAvailability.timeSlots.filter(slot => slot.available).length} disponible
                              </span>
                            </div>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Cerrado
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Slots de tiempo para la fecha seleccionada */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>
              Horarios Disponibles - {new Date(selectedDate).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const dayAvailability = availability.find(day => day.date === selectedDate)
              
              if (!dayAvailability) {
                return (
                  <div className="text-center text-muted-foreground py-8">
                    No hay información de disponibilidad para esta fecha
                  </div>
                )
              }

              if (!dayAvailability.isWorkingDay) {
                return (
                  <div className="text-center text-muted-foreground py-8">
                    <X className="h-8 w-8 mx-auto mb-2 text-red-500" />
                    <p>Cerrado en esta fecha</p>
                    {dayAvailability.exception && (
                      <p className="text-sm mt-1">{dayAvailability.exception.reason}</p>
                    )}
                  </div>
                )
              }

              const availableSlots = dayAvailability.timeSlots.filter(slot => slot.available)
              const unavailableSlots = dayAvailability.timeSlots.filter(slot => !slot.available)

              return (
                <div className="space-y-4">
                  {/* Horario de la tienda */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      Horario: {dayAvailability.openTime} - {dayAvailability.closeTime}
                    </span>
                  </div>

                  {/* Slots disponibles */}
                  {availableSlots.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 text-green-600">Horarios Disponibles</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {availableSlots.map((slot, index) => (
                          <Button
                            key={index}
                            variant={selectedTimeSlot === slot ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleTimeSlotSelect(slot)}
                            className="justify-start"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            {slot.start}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Slots no disponibles */}
                  {unavailableSlots.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 text-red-600">Horarios Ocupados</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {unavailableSlots.map((slot, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            disabled
                            className="justify-start opacity-50"
                          >
                            <X className="h-3 w-3 mr-1" />
                            {slot.start}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {availableSlots.length === 0 && unavailableSlots.length === 0 && (
                    <div className="text-center text-muted-foreground py-4">
                      No hay slots de tiempo configurados para este día
                    </div>
                  )}
                </div>
              )
            })()}
          </CardContent>
        </Card>
      )}

      {/* Información del servicio seleccionado */}
      {selectedService && (
        <Card>
          <CardHeader>
            <CardTitle>Servicio Seleccionado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Servicio:</span>
                <span>{selectedService.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Duración:</span>
                <span>{selectedService.duration_minutes} minutos</span>
              </div>
              {selectedService.price && (
                <div className="flex justify-between">
                  <span className="font-medium">Precio:</span>
                  <span>${selectedService.price}</span>
                </div>
              )}
              {selectedService.description && (
                <div>
                  <span className="font-medium">Descripción:</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedService.description}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

