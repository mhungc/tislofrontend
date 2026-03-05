'use client'

import React, { useState, useEffect } from 'react'
import { ScheduleService } from '@/lib/services/schedule-service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Calendar, Plus, Trash2, Clock, AlertTriangle, Save } from 'lucide-react'
import { toast } from 'sonner'
import type { Dictionary, Locale } from '@/lib/types/dictionary'

interface ScheduleExceptionsEditorProps {
  shopId: string
  onExceptionUpdated?: () => void
  className?: string
  locale: Locale
  scheduleDict: Dictionary['schedule']
}

interface ExceptionForm {
  exception_date: string
  is_closed: boolean
  open_time?: string
  close_time?: string
  reason: string
}

export function ScheduleExceptionsEditor({
  shopId,
  onExceptionUpdated,
  className = '',
  locale,
  scheduleDict
}: ScheduleExceptionsEditorProps) {
  const [exceptions, setExceptions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<ExceptionForm>({
    exception_date: '',
    is_closed: false,
    open_time: '09:00',
    close_time: '18:00',
    reason: ''
  })

  const scheduleService = new ScheduleService()
  const exceptionsDict = scheduleDict.exceptionsPanel

  useEffect(() => {
    loadExceptions()
  }, [shopId])

  const loadExceptions = async () => {
    setLoading(true)
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 30)

      const endDate = new Date()
      endDate.setDate(endDate.getDate() + 365)

      const exceptionsData = await scheduleService.getScheduleExceptions(
        shopId,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      )

      setExceptions(exceptionsData)
    } catch (error) {
      console.error('Error al cargar excepciones:', error)
      toast.error(exceptionsDict.loadError)
    } finally {
      setLoading(false)
    }
  }

  const createException = async () => {
    if (!formData.exception_date) {
      toast.error(exceptionsDict.selectDateError)
      return
    }

    if (!formData.is_closed && (!formData.open_time || !formData.close_time)) {
      toast.error(exceptionsDict.completeHoursError)
      return
    }

    setSaving(true)
    try {
      const exceptionData = {
        shop_id: shopId,
        exception_date: formData.exception_date,
        is_closed: formData.is_closed,
        open_time: formData.is_closed ? null : formData.open_time,
        close_time: formData.is_closed ? null : formData.close_time,
        reason: formData.reason || (formData.is_closed ? exceptionsDict.closed : exceptionsDict.special)
      }

      await scheduleService.createScheduleException(exceptionData)

      toast.success(exceptionsDict.createSuccess)
      setShowForm(false)
      resetForm()
      loadExceptions()
      onExceptionUpdated?.()
    } catch (error) {
      console.error('Error al crear excepción:', error)
      toast.error(exceptionsDict.createError)
    } finally {
      setSaving(false)
    }
  }

  const deleteException = async (exceptionId: string) => {
    if (!confirm(exceptionsDict.deleteConfirm)) {
      return
    }

    try {
      await scheduleService.deleteScheduleException(exceptionId)
      toast.success(exceptionsDict.deleteSuccess)
      loadExceptions()
      onExceptionUpdated?.()
    } catch (error) {
      console.error('Error al eliminar excepción:', error)
      toast.error(exceptionsDict.deleteError)
    }
  }

  const updateForm = (field: keyof ExceptionForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      exception_date: '',
      is_closed: false,
      open_time: '09:00',
      close_time: '18:00',
      reason: ''
    })
  }

  const getExceptionType = (exception: any) => {
    if (exception.is_closed) {
      return { label: exceptionsDict.closed, variant: 'destructive' as const }
    }
    return { label: exceptionsDict.special, variant: 'secondary' as const }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'en' ? 'en-US' : 'es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

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
            <AlertTriangle className="h-5 w-5" />
            {exceptionsDict.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{exceptionsDict.description}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {exceptionsDict.add}
          </Button>
        </CardContent>
      </Card>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{exceptionsDict.newTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="exception-date">{exceptionsDict.date}</Label>
              <Input
                id="exception-date"
                type="date"
                value={formData.exception_date}
                onChange={(e) => updateForm('exception_date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch isChecked={formData.is_closed} onChange={() => updateForm('is_closed', !formData.is_closed)} />
              <Label>{formData.is_closed ? exceptionsDict.closed : exceptionsDict.special}</Label>
            </div>

            {!formData.is_closed && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="open-time">{exceptionsDict.openTime}</Label>
                  <Input id="open-time" type="time" value={formData.open_time} onChange={(e) => updateForm('open_time', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="close-time">{exceptionsDict.closeTime}</Label>
                  <Input id="close-time" type="time" value={formData.close_time} onChange={(e) => updateForm('close_time', e.target.value)} />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="reason">{exceptionsDict.reason}</Label>
              <Input
                id="reason"
                placeholder={formData.is_closed ? exceptionsDict.reasonClosed : exceptionsDict.reasonSpecial}
                value={formData.reason}
                onChange={(e) => updateForm('reason', e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={createException} disabled={saving} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {saving ? exceptionsDict.save : exceptionsDict.save}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  resetForm()
                }}
              >
                {exceptionsDict.cancel}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{exceptionsDict.listTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          {exceptions.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{exceptionsDict.emptyTitle}</p>
              <p className="text-sm">{exceptionsDict.emptyDescription}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {exceptions
                .sort((a, b) => new Date(a.exception_date).getTime() - new Date(b.exception_date).getTime())
                .map((exception) => {
                  const exceptionType = getExceptionType(exception)

                  return (
                    <div key={exception.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{formatDate(exception.exception_date)}</span>
                        </div>

                        <Badge variant={exceptionType.variant}>{exceptionType.label}</Badge>

                        {!exception.is_closed && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{exception.open_time} - {exception.close_time}</span>
                          </div>
                        )}

                        {exception.reason && (
                          <span className="text-sm text-muted-foreground">{exception.reason}</span>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteException(exception.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{exceptions.length}</div>
              <div className="text-sm text-muted-foreground">{exceptionsDict.total}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{exceptions.filter(e => e.is_closed).length}</div>
              <div className="text-sm text-muted-foreground">{exceptionsDict.closedDays}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{exceptions.filter(e => !e.is_closed).length}</div>
              <div className="text-sm text-muted-foreground">{exceptionsDict.specialHours}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
