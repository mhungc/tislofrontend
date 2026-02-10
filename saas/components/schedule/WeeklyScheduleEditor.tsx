'use client'

import React, { useState, useEffect } from 'react'
import { ScheduleService } from '@/lib/services/schedule-service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { TimePicker } from '@/components/schedule/TimePicker'
import { Clock, Save, Calendar, Check, X, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface WeeklyScheduleEditorProps {
  shopId: string
  onScheduleUpdated?: () => void
  className?: string
  existingSchedules?: any[]
}

interface TimeBlock {
  id?: string
  openTime: string
  closeTime: string
}

interface DaySchedule {
  dayOfWeek: number
  dayName: string
  isWorkingDay: boolean
  timeBlocks: TimeBlock[]
}

export function WeeklyScheduleEditor({
  shopId,
  onScheduleUpdated,
  className = '',
  existingSchedules = []
}: WeeklyScheduleEditorProps) {
  const [schedules, setSchedules] = useState<DaySchedule[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)

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

  useEffect(() => {
    const initializeSchedules = () => {
      // Si hay horarios existentes, no inicializar con defaults
      if (existingSchedules.length > 0) return
      
      const defaultSchedules: DaySchedule[] = dayNames.map((name, index) => ({
        dayOfWeek: index,
        dayName: name,
        isWorkingDay: index >= 1 && index <= 5,
        timeBlocks: [{ openTime: '09:00', closeTime: '18:00' }]
      }))
      setSchedules(defaultSchedules)
    }

    initializeSchedules()
  }, [existingSchedules])

  useEffect(() => {
    const loadSchedules = async () => {
      setLoading(true)
      try {
        // Si se pasan horarios existentes, usarlos directamente
        const schedulesToLoad = existingSchedules.length > 0 ? existingSchedules : await scheduleService.getShopSchedules(shopId)
        
        // Crear estructura completa para todos los días
        const fullSchedules: DaySchedule[] = dayNames.map((name, index) => {
          const daySchedules = schedulesToLoad.filter(s => s.day_of_week === index)
          
          if (daySchedules.length > 0) {
            // Día con horarios configurados
            return {
              dayOfWeek: index,
              dayName: name,
              isWorkingDay: true, // Si existe en BD, es día laborable
              timeBlocks: daySchedules.map(s => {
                // Formatear tiempo desde la base de datos
                const formatTime = (timeString: string) => {
                  if (timeString.includes('T')) {
                    return new Date(timeString).toLocaleTimeString('en-GB', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    })
                  }
                  return timeString
                }
                
                return {
                  id: s.id,
                  openTime: formatTime(s.open_time),
                  closeTime: formatTime(s.close_time)
                }
              })
            }
          } else {
            // Día sin horarios = día cerrado
            return {
              dayOfWeek: index,
              dayName: name,
              isWorkingDay: false,
              timeBlocks: [{ openTime: '09:00', closeTime: '18:00' }]
            }
          }
        })
        
        setSchedules(fullSchedules)
      } catch (error) {
        console.error('Error al cargar horarios:', error)
        toast.error('Error al cargar los horarios existentes')
      } finally {
        setLoading(false)
      }
    }

    // Solo cargar si hay horarios existentes o si no hay schedules inicializados
    if (existingSchedules.length > 0 || schedules.length === 0) {
      loadSchedules()
    }
  }, [shopId, existingSchedules])

  const updateDaySchedule = (dayOfWeek: number, updates: Partial<DaySchedule>) => {
    setSchedules(prev => prev.map(schedule => 
      schedule.dayOfWeek === dayOfWeek 
        ? { ...schedule, ...updates }
        : schedule
    ))
  }

  const toggleWorkingDay = (dayOfWeek: number) => {
    updateDaySchedule(dayOfWeek, { isWorkingDay: !schedules.find(s => s.dayOfWeek === dayOfWeek)?.isWorkingDay })
  }

  const updateTimeBlock = (dayOfWeek: number, blockIndex: number, field: 'openTime' | 'closeTime', value: string) => {
    setSchedules(prev => prev.map(schedule => {
      if (schedule.dayOfWeek === dayOfWeek) {
        const newTimeBlocks = [...schedule.timeBlocks]
        newTimeBlocks[blockIndex] = { ...newTimeBlocks[blockIndex], [field]: value }
        return { ...schedule, timeBlocks: newTimeBlocks }
      }
      return schedule
    }))
  }

  const addTimeBlock = (dayOfWeek: number) => {
    setSchedules(prev => prev.map(schedule => {
      if (schedule.dayOfWeek === dayOfWeek) {
        return {
          ...schedule,
          timeBlocks: [...schedule.timeBlocks, { openTime: '09:00', closeTime: '18:00' }]
        }
      }
      return schedule
    }))
  }

  const removeTimeBlock = (dayOfWeek: number, blockIndex: number) => {
    setSchedules(prev => prev.map(schedule => {
      if (schedule.dayOfWeek === dayOfWeek && schedule.timeBlocks.length > 1) {
        return {
          ...schedule,
          timeBlocks: schedule.timeBlocks.filter((_, index) => index !== blockIndex)
        }
      }
      return schedule
    }))
  }

  const saveSchedules = async () => {
    setSaving(true)
    try {
      const schedulesToSave = schedules
        .filter(schedule => schedule.isWorkingDay)
        .flatMap(schedule => 
          schedule.timeBlocks.map((block, index) => ({
            day_of_week: schedule.dayOfWeek,
            open_time: block.openTime,
            close_time: block.closeTime,
            is_working_day: schedule.isWorkingDay,
            block_order: index + 1
          }))
        )

      await scheduleService.setWeeklySchedule(shopId, schedulesToSave)
      
      // Toast de éxito con información útil
      const workingDays = schedules.filter(s => s.isWorkingDay).length
      toast.success(`✅ Horarios guardados correctamente`, {
        description: `${workingDays} días laborables configurados. ¡Tu tienda ya tiene horarios!`,
        duration: 4000
      })
      
      // Mostrar estado de éxito temporalmente
      setJustSaved(true)
      setTimeout(() => setJustSaved(false), 3000)
      
      onScheduleUpdated?.()
    } catch (error) {
      console.error('Error al guardar horarios:', error)
      toast.error('❌ Error al guardar los horarios', {
        description: 'Por favor, inténtalo de nuevo o contacta soporte si persiste.'
      })
    } finally {
      setSaving(false)
    }
  }

  const validateSchedules = () => {
    const errors: string[] = []

    schedules.forEach(schedule => {
      if (schedule.isWorkingDay) {
        schedule.timeBlocks.forEach((block, index) => {
          if (!block.openTime || !block.closeTime) {
            errors.push(`${schedule.dayName} - Bloque ${index + 1}: Horarios incompletos`)
          } else if (block.openTime >= block.closeTime) {
            errors.push(`${schedule.dayName} - Bloque ${index + 1}: Hora de cierre debe ser posterior a la de apertura`)
          }
        })
        
        // Validar que no se solapen los bloques
        for (let i = 0; i < schedule.timeBlocks.length - 1; i++) {
          const current = schedule.timeBlocks[i]
          const next = schedule.timeBlocks[i + 1]
          if (current.closeTime > next.openTime) {
            errors.push(`${schedule.dayName}: Los bloques ${i + 1} y ${i + 2} se solapan`)
          }
        }
      }
    })

    return errors
  }

  const applyToAllWorkingDays = (openTime: string, closeTime: string) => {
    setSchedules(prev => prev.map(schedule => 
      schedule.isWorkingDay 
        ? { ...schedule, timeBlocks: [{ openTime, closeTime }] }
        : schedule
    ))
  }

  const setAllDaysWorking = (working: boolean) => {
    setSchedules(prev => prev.map(schedule => ({ 
      ...schedule, 
      isWorkingDay: working 
    })))
  }

  const resetToDefaults = () => {
    setSchedules(prev => prev.map(schedule => ({
      ...schedule,
      isWorkingDay: schedule.dayOfWeek >= 1 && schedule.dayOfWeek <= 5,
      timeBlocks: [{ openTime: '09:00', closeTime: '18:00' }]
    })))
  }

  const validationErrors = validateSchedules()
  const workingDaysCount = schedules.filter(s => s.isWorkingDay).length

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Configuración de Horarios Semanales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Configura los horarios de trabajo para cada día de la semana.
            </p>
            <Badge variant="outline">
              {workingDaysCount} días laborables
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {schedules.map((schedule) => (
          <Card key={schedule.dayOfWeek} className={`transition-all ${schedule.isWorkingDay ? 'border-green-200 bg-green-50/30' : 'border-gray-200'}`}>
            <CardContent className="pt-4 md:pt-6">
              <div className="space-y-3">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Switch
                      isChecked={schedule.isWorkingDay}
                      onChange={() => toggleWorkingDay(schedule.dayOfWeek)}
                    />
                    <div className="flex items-center gap-2">
                      <Label className="font-medium w-20">
                        {schedule.dayName}
                      </Label>
                      {schedule.isWorkingDay ? (
                        <Badge variant="default" className="text-xs">
                          <Check className="h-3 w-3 mr-1" />
                          Abierto ({schedule.timeBlocks.length} bloque{schedule.timeBlocks.length > 1 ? 's' : ''})
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          <X className="h-3 w-3 mr-1" />
                          Cerrado
                        </Badge>
                      )}
                    </div>
                  </div>

                  {schedule.isWorkingDay && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addTimeBlock(schedule.dayOfWeek)}
                      className="text-sm h-9 md:h-8 touch-manipulation"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Bloque
                    </Button>
                  )}
                </div>

                {schedule.isWorkingDay && (
                  <div className="space-y-3 ml-0 md:ml-8 mt-3">
                    {schedule.timeBlocks.map((block, blockIndex) => (
                      <div key={blockIndex} className="flex flex-col md:flex-row items-start md:items-center gap-3 p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <Label className="text-sm font-medium text-gray-700 md:w-20">
                          Bloque {blockIndex + 1}
                        </Label>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                          <TimePicker
                            value={block.openTime}
                            onChange={(value) => updateTimeBlock(schedule.dayOfWeek, blockIndex, 'openTime', value)}
                            className="flex-1 md:flex-none"
                          />
                          <span className="text-gray-400 font-medium">—</span>
                          <TimePicker
                            value={block.closeTime}
                            onChange={(value) => updateTimeBlock(schedule.dayOfWeek, blockIndex, 'closeTime', value)}
                            className="flex-1 md:flex-none"
                          />
                        </div>
                        {schedule.timeBlocks.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTimeBlock(schedule.dayOfWeek, blockIndex)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-10 md:h-8 w-full md:w-auto touch-manipulation"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {validationErrors.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Errores de Validación</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-sm text-red-600">{error}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyToAllWorkingDays('09:00', '18:00')}
              className="h-10 md:h-9 touch-manipulation"
            >
              Aplicar 9-18h
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAllDaysWorking(true)}
              className="h-10 md:h-9 touch-manipulation"
            >
              Todos Abiertos
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAllDaysWorking(false)}
              className="h-10 md:h-9 touch-manipulation"
            >
              Todos Cerrados
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefaults}
              className="h-10 md:h-9 touch-manipulation"
            >
              Restablecer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mensaje de éxito y próximos pasos */}
      {justSaved && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-green-900 mb-1">¡Horarios configurados exitosamente!</h3>
                <p className="text-sm text-green-700 mb-3">
                  Tu tienda ya tiene horarios definidos. Ahora puedes:
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.location.href = `/dashboard/shops/${shopId}/services`}
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    📋 Configurar Servicios
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.location.href = `/dashboard/shops/${shopId}/calendar`}
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    📅 Ver Calendario
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.location.href = `/dashboard/shops`}
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    🏪 Volver a Tiendas
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-3">
        <Button
          onClick={saveSchedules}
          disabled={saving || validationErrors.length > 0}
          className={`min-w-32 h-11 md:h-10 text-base md:text-sm touch-manipulation ${justSaved ? 'bg-green-600 hover:bg-green-700' : ''}`}
        >
          {saving ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Guardando...
            </div>
          ) : justSaved ? (
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              ¡Guardado!
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Guardar Horarios
            </div>
          )}
        </Button>
      </div>
    </div>
  )
}