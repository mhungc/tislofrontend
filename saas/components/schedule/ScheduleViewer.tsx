'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Calendar,
  AlertTriangle
} from 'lucide-react'

interface ScheduleViewerProps {
  schedules: any[]
  shopName: string
  onEdit: () => void
  onDelete: () => void
  className?: string
}

export function ScheduleViewer({
  schedules,
  shopName,
  onEdit,
  onDelete,
  className = ''
}: ScheduleViewerProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const dayNames = [
    'Domingo', 'Lunes', 'Martes', 'Miércoles', 
    'Jueves', 'Viernes', 'Sábado'
  ]

  // Agrupar horarios por día
  const schedulesByDay = schedules.reduce((acc, schedule) => {
    const day = schedule.day_of_week
    if (!acc[day]) acc[day] = []
    acc[day].push(schedule)
    return acc
  }, {} as Record<number, any[]>)

  const workingDays = Object.keys(schedulesByDay).length
  
  // Parsear tiempo correctamente independiente del formato
  const parseTime = (timeString: string) => {
    if (timeString.includes('T')) {
      return new Date(timeString)
    }
    // Formato HH:MM
    return new Date(`1970-01-01T${timeString}`)
  }
  
  const totalHours = schedules.reduce((total, schedule) => {
    try {
      const start = parseTime(schedule.open_time)
      const end = parseTime(schedule.close_time)
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
      return total + (isNaN(hours) ? 0 : hours)
    } catch {
      return total
    }
  }, 0)

  const formatTime = (timeString: string) => {
    if (timeString.includes('T')) {
      return new Date(timeString).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    }
    return timeString
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header con estadísticas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Horarios de {shopName}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Configuración actual de horarios de trabajo
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{workingDays}</div>
              <div className="text-sm text-muted-foreground">Días laborables</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{totalHours.toFixed(1)}h</div>
              <div className="text-sm text-muted-foreground">Horas semanales</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{schedules.length}</div>
              <div className="text-sm text-muted-foreground">Bloques horarios</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Horarios por día */}
      <div className="space-y-3">
        {dayNames.map((dayName, dayIndex) => {
          const daySchedules = schedulesByDay[dayIndex] || []
          const isWorkingDay = daySchedules.length > 0

          return (
            <Card key={dayIndex} className={isWorkingDay ? 'border-green-200' : 'border-gray-200'}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-20">
                      <span className="font-medium">{dayName}</span>
                    </div>
                    {isWorkingDay ? (
                      <Badge variant="default" className="text-xs">
                        <Check className="h-3 w-3 mr-1" />
                        Abierto
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        <X className="h-3 w-3 mr-1" />
                        Cerrado
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {daySchedules.map((schedule: any, index: number) => (
                      <div key={index} className="flex items-center gap-1 text-sm">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span>
                          {formatTime(schedule.open_time)} - {formatTime(schedule.close_time)}
                        </span>
                        {daySchedules.length > 1 && (
                          <Badge variant="outline" className="text-xs ml-1">
                            Bloque {index + 1}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Confirmación de eliminación */}
      {showDeleteConfirm && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-red-900 mb-1">
                  ¿Eliminar todos los horarios?
                </h3>
                <p className="text-sm text-red-700 mb-4">
                  Esta acción eliminará todos los horarios configurados para esta tienda. 
                  No podrás deshacer esta acción.
                </p>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => {
                      onDelete()
                      setShowDeleteConfirm(false)
                    }}
                  >
                    Sí, eliminar horarios
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}