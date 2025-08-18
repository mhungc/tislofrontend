'use client'

import React, { useState, useEffect } from 'react'
import { ScheduleService } from '@/lib/services/schedule-service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Clock, Save, Calendar, Check, X } from 'lucide-react'
import { toast } from 'sonner'

interface WeeklyScheduleEditorProps {
  shopId: string
  onScheduleUpdated?: () => void
  className?: string
}

interface DaySchedule {
  dayOfWeek: number
  dayName: string
  isWorkingDay: boolean
  openTime: string
  closeTime: string
}

export function WeeklyScheduleEditor({
  shopId,
  onScheduleUpdated,
  className = ''
}: WeeklyScheduleEditorProps) {
  const [schedules, setSchedules] = useState<DaySchedule[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const scheduleService = new ScheduleService()

  const dayNames = [
    'Domingo',
    'Lunes', 
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado'
  ]

  // Inicializar horarios semanales
  useEffect(() => {
    const initializeSchedules = () => {
      const defaultSchedules: DaySchedule[] = dayNames.map((name, index) => ({
        dayOfWeek: index,
        dayName: name,
        isWorkingDay: index >= 1 && index <= 5, // Lunes a Viernes por defecto
        openTime: '09:00',
        closeTime: '18:00'
      }))
      setSchedules(defaultSchedules)
    }

    initializeSchedules()
  }, [])

  // Cargar horarios existentes
  useEffect(() => {
    const loadSchedules = async () => {
      setLoading(true)
      try {
        const existingSchedules = await scheduleService.getShopSchedules(shopId)
        
        if (existingSchedules.length > 0) {
          const updatedSchedules = schedules.map(schedule => {
            const existing = existingSchedules.find(s => s.day_of_week === schedule.dayOfWeek)
            if (existing) {
              return {
                ...schedule,
                isWorkingDay: existing.is_working_day,
                openTime: existing.open_time,
                closeTime: existing.close_time
              }
            }
            return schedule
          })
          setSchedules(updatedSchedules)
        }
      } catch (error) {
        console.error('Error al cargar horarios:', error)
        toast.error('Error al cargar los horarios existentes')
      } finally {
        setLoading(false)
      }
    }

    if (schedules.length > 0) {
      loadSchedules()
    }
  }, [shopId])

  // Actualizar horario de un día
  const updateDaySchedule = (dayOfWeek: number, updates: Partial<DaySchedule>) => {
    setSchedules(prev => prev.map(schedule => 
      schedule.dayOfWeek === dayOfWeek 
        ? { ...schedule, ...updates }
        : schedule
    ))
  }

  // Cambiar estado de día laborable
  const toggleWorkingDay = (dayOfWeek: number) => {
    updateDaySchedule(dayOfWeek, { isWorkingDay: !schedules.find(s => s.dayOfWeek === dayOfWeek)?.isWorkingDay })
  }

  // Actualizar hora de apertura
  const updateOpenTime = (dayOfWeek: number, time: string) => {
    updateDaySchedule(dayOfWeek, { openTime: time })
  }

  // Actualizar hora de cierre
  const updateCloseTime = (dayOfWeek: number, time: string) => {
    updateDaySchedule(dayOfWeek, { closeTime: time })
  }

  // Guardar horarios
  const saveSchedules = async () => {
    setSaving(true)
    try {
      const schedulesToSave = schedules
        .filter(schedule => schedule.isWorkingDay)
        .map(schedule => ({
          day_of_week: schedule.dayOfWeek,
          open_time: schedule.openTime,
          close_time: schedule.closeTime,
          is_working_day: schedule.isWorkingDay
        }))

      await scheduleService.setWeeklySchedule(shopId, schedulesToSave)
      
      toast.success('Horarios guardados correctamente')
      onScheduleUpdated?.()
    } catch (error) {
      console.error('Error al guardar horarios:', error)
      toast.error('Error al guardar los horarios')
    } finally {
      setSaving(false)
    }
  }

  // Validar horarios
  const validateSchedules = () => {
    const errors: string[] = []

    schedules.forEach(schedule => {
      if (schedule.isWorkingDay) {
        if (!schedule.openTime || !schedule.closeTime) {
          errors.push(`${schedule.dayName}: Horarios incompletos`)
        } else if (schedule.openTime >= schedule.closeTime) {
          errors.push(`${schedule.dayName}: Hora de cierre debe ser posterior a la de apertura`)
        }
      }
    })

    return errors
  }

  // Aplicar horario a todos los días laborables
  const applyToAllWorkingDays = (openTime: string, closeTime: string) => {
    setSchedules(prev => prev.map(schedule => 
      schedule.isWorkingDay 
        ? { ...schedule, openTime, closeTime }
        : schedule
    ))
  }

  // Copiar horario de un día a otro
  const copyDaySchedule = (fromDay: number, toDay: number) => {
    const fromSchedule = schedules.find(s => s.dayOfWeek === fromDay)
    if (fromSchedule) {
      updateDaySchedule(toDay, {
        isWorkingDay: fromSchedule.isWorkingDay,
        openTime: fromSchedule.openTime,
        closeTime: fromSchedule.closeTime
      })
    }
  }

  const validationErrors = validateSchedules()

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Encabezado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Configuración de Horarios Semanales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Configura los horarios de trabajo para cada día de la semana. 
            Los días marcados como "Cerrado" no tendrán disponibilidad para reservas.
          </p>
        </CardContent>
      </Card>

      {/* Horarios por día */}
      <div className="space-y-4">
        {schedules.map((schedule) => (
          <Card key={schedule.dayOfWeek}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={schedule.isWorkingDay}
                      onClick={() => toggleWorkingDay(schedule.dayOfWeek)}
                    />
                    <Label className="font-medium">
                      {schedule.dayName}
                    </Label>
                  </div>
                  
                  {schedule.isWorkingDay ? (
                    <Badge variant="default" className="flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Abierto
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <X className="h-3 w-3" />
                      Cerrado
                    </Badge>
                  )}
                </div>

                {schedule.isWorkingDay && (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`open-${schedule.dayOfWeek}`} className="text-sm">
                        Apertura:
                      </Label>
                      <Input
                        id={`open-${schedule.dayOfWeek}`}
                        type="time"
                        value={schedule.openTime}
                        onChange={(e) => updateOpenTime(schedule.dayOfWeek, e.target.value)}
                        className="w-24"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`close-${schedule.dayOfWeek}`} className="text-sm">
                        Cierre:
                      </Label>
                      <Input
                        id={`close-${schedule.dayOfWeek}`}
                        type="time"
                        value={schedule.closeTime}
                        onChange={(e) => updateCloseTime(schedule.dayOfWeek, e.target.value)}
                        className="w-24"
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {schedule.openTime} - {schedule.closeTime}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Acciones rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Label className="text-sm">Aplicar a todos los días laborables:</Label>
            <Input
              type="time"
              placeholder="09:00"
              className="w-24"
              onChange={(e) => {
                const openTime = e.target.value
                const closeTime = schedules.find(s => s.isWorkingDay)?.closeTime || '18:00'
                applyToAllWorkingDays(openTime, closeTime)
              }}
            />
            <span>-</span>
            <Input
              type="time"
              placeholder="18:00"
              className="w-24"
              onChange={(e) => {
                const closeTime = e.target.value
                const openTime = schedules.find(s => s.isWorkingDay)?.openTime || '09:00'
                applyToAllWorkingDays(openTime, closeTime)
              }}
            />
          </div>

          <div className="flex items-center gap-4">
            <Label className="text-sm">Copiar horario:</Label>
            <select 
              className="border rounded px-2 py-1 text-sm"
              onChange={(e) => {
                const [fromDay, toDay] = e.target.value.split('-').map(Number)
                if (fromDay !== undefined && toDay !== undefined) {
                  copyDaySchedule(fromDay, toDay)
                }
              }}
            >
              <option value="">Seleccionar...</option>
              {schedules.filter(s => s.isWorkingDay).map(schedule => 
                schedules.filter(s => s.isWorkingDay && s.dayOfWeek !== schedule.dayOfWeek).map(otherSchedule => (
                  <option key={`${schedule.dayOfWeek}-${otherSchedule.dayOfWeek}`} 
                          value={`${schedule.dayOfWeek}-${otherSchedule.dayOfWeek}`}>
                    {schedule.dayName} → {otherSchedule.dayName}
                  </option>
                ))
              )}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Errores de validación */}
      {validationErrors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <X className="h-4 w-4" />
              <span className="font-medium">Errores de validación:</span>
            </div>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-sm text-red-600">{error}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Botón de guardar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {schedules.filter(s => s.isWorkingDay).length} días laborables configurados
            </div>
            <Button
              onClick={saveSchedules}
              disabled={saving || validationErrors.length > 0}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Guardando...' : 'Guardar Horarios'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}