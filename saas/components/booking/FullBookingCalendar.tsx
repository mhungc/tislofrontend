'use client'

import React, { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { BookingCalendarService, CalendarBooking } from '@/lib/services/booking-calendar-service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/ui/dialog'
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Divider,
  Icon,
  useColorModeValue,
  Avatar,
  AvatarBadge,
} from '@chakra-ui/react'
import { 
  Calendar, 
  User, 
  Mail, 
  Phone, 
  Check, 
  X, 
  Clock, 
  DollarSign,
  FileText,
  MapPin,
  Calendar as CalendarIcon,
  Edit,
  Trash2
} from 'lucide-react'
import { toast } from 'sonner'

interface BookingCalendarProps {
  shopId: string
  shopName: string
}

export function FullBookingCalendar({ shopId, shopName }: BookingCalendarProps) {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<CalendarBooking | null>(null)
  const [showBookingDialog, setShowBookingDialog] = useState(false)

  const calendarService = new BookingCalendarService()

  // Chakra UI color mode values - Todos los hooks deben estar al inicio
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.700', 'gray.300')
  const headingColor = useColorModeValue('gray.900', 'white')
  const cardBgColor = useColorModeValue('gray.50', 'gray.700')
  const blueBgColor = useColorModeValue('blue.50', 'blue.900')
  const footerBgColor = useColorModeValue('gray.50', 'gray.800')

  useEffect(() => {
    if (shopId) {
      loadBookings()
    }
  }, [shopId])

  const loadBookings = async () => {
    setLoading(true)
    try {
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - 1)
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + 2)
      
      const data = await calendarService.getBookings(
        shopId,
        formatDate(startDate),
        formatDate(endDate)
      )
      
      const calendarEvents = data.bookings.map((booking: CalendarBooking) => ({
        id: booking.id,
        title: `${booking.customer_name}`,
        start: `${booking.booking_date}T${booking.start_time}:00`,
        end: `${booking.booking_date}T${booking.end_time}:00`,
        backgroundColor: getStatusColor(booking.status),
        borderColor: getStatusColor(booking.status),
        textColor: '#ffffff',
        classNames: [`booking-${booking.status}`],
        extendedProps: {
          booking,
          status: booking.status,
          customerEmail: booking.customer_email,
          totalPrice: booking.total_price,
          services: booking.services
        }
      }))
      
      setEvents(calendarEvents)
    } catch (error) {
      toast.error('Error al cargar reservas')
    } finally {
      setLoading(false)
    }
  }

  const handleEventClick = (clickInfo: any) => {
    const booking = clickInfo.event.extendedProps.booking
    setSelectedBooking(booking)
    setShowBookingDialog(true)
  }

  const handleStatusUpdate = async (bookingId: string, status: 'confirmed' | 'cancelled') => {
    try {
      await calendarService.updateBookingStatus(shopId, bookingId, status)
      toast.success(`Reserva ${status === 'confirmed' ? 'confirmada' : 'cancelada'}`)
      setShowBookingDialog(false)
      loadBookings()
    } catch (error) {
      toast.error('Error al actualizar reserva')
    }
  }

  const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`)
    return dateObj.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    return `${hours}:${minutes}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#22c55e'
      case 'pending': return '#eab308'
      case 'cancelled': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'green'
      case 'pending': return 'yellow'
      case 'cancelled': return 'red'
      default: return 'gray'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente'
      case 'confirmed': return 'Confirmada'
      case 'cancelled': return 'Cancelada'
      default: return status
    }
  }

  if (!shopId) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Cargando tienda...</h3>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendario de Reservas - {shopName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={events}
            eventClick={handleEventClick}
            height="auto"
            aspectRatio={1.8}
            locale="es"
            firstDay={1}
            weekends={true}
            slotMinTime="07:00:00"
            slotMaxTime="22:00:00"
            slotDuration="00:15:00"
            slotLabelInterval="01:00:00"
            slotLabelFormat={{
              hour: 'numeric',
              minute: '2-digit',
              hour12: false
            }}
            allDaySlot={false}
            eventDisplay="block"
            eventMaxStack={3}
            dayMaxEvents={false}
            nowIndicator={true}
            scrollTime="08:00:00"
            scrollTimeReset={false}
            selectable={false}
            selectMirror={false}
            businessHours={{
              daysOfWeek: [1, 2, 3, 4, 5, 6],
              startTime: '09:00',
              endTime: '19:00'
            }}
            eventMouseEnter={(info) => {
              info.el.style.cursor = 'pointer'
              info.el.style.opacity = '0.8'
            }}
            eventMouseLeave={(info) => {
              info.el.style.opacity = '1'
            }}
            eventDidMount={(info) => {
              info.el.setAttribute('title', `${info.event.title} - ${info.event.extendedProps.booking?.customer_email || ''}`)
            }}
            dayHeaderFormat={{
              weekday: 'short',
              day: 'numeric',
              month: 'short'
            }}
            titleFormat={{
              year: 'numeric',
              month: 'long'
            }}
          />
        </CardContent>
      </Card>

      {/* Modal mejorado con Chakra UI */}
      <Dialog 
        isOpen={showBookingDialog} 
        onClose={() => setShowBookingDialog(false)}
        size={{ base: 'full', md: 'lg' }}
        isCentered
      >
        <DialogContent maxW={{ base: '100%', md: '600px' }} p={0}>
          {selectedBooking && (
            <>
              <DialogHeader 
                bg={getStatusColor(selectedBooking.status)}
                color="white"
                p={6}
                borderTopRadius="md"
              >
                <Flex align="center" justify="space-between">
                  <VStack align="start" spacing={1}>
                    <Box as={DialogTitle} color="white" fontSize="xl" fontWeight="bold">
                      Detalles de la Reserva
                    </Box>
                    <Text fontSize="sm" opacity={0.9}>
                      {formatDateTime(selectedBooking.booking_date, selectedBooking.start_time)}
                    </Text>
                  </VStack>
                  <Badge 
                    colorScheme={getStatusBadgeColor(selectedBooking.status)}
                    fontSize="sm"
                    px={3}
                    py={1}
                    borderRadius="full"
                    bg="white"
                    color={getStatusColor(selectedBooking.status)}
                  >
                    {getStatusLabel(selectedBooking.status)}
                  </Badge>
                </Flex>
              </DialogHeader>

              <DialogBody p={6} bg={bgColor}>
                <VStack spacing={6} align="stretch">
                  {/* Información del Cliente */}
                  <Box>
                    <HStack mb={4} align="center">
                      <Icon as={User} boxSize={5} color="blue.500" />
                      <Text fontWeight="semibold" fontSize="md" color={headingColor}>
                        Información del Cliente
                      </Text>
                    </HStack>
                    <Box 
                      bg={cardBgColor}
                      p={4}
                      borderRadius="md"
                      borderWidth="1px"
                      borderColor={borderColor}
                    >
                      <VStack spacing={3} align="stretch">
                        <HStack>
                          <Avatar size="sm" name={selectedBooking.customer_name}>
                            <AvatarBadge 
                              boxSize="1em" 
                              bg={getStatusColor(selectedBooking.status)}
                              borderColor="white"
                            />
                          </Avatar>
                          <VStack align="start" spacing={0} flex={1}>
                            <Text fontWeight="semibold" color={headingColor}>
                              {selectedBooking.customer_name}
                            </Text>
                            <Text fontSize="sm" color={textColor}>
                              Cliente
                            </Text>
                          </VStack>
                        </HStack>
                        
                        <Divider />
                        
                        <HStack spacing={3}>
                          <Icon as={Mail} boxSize={4} color={textColor} />
                          <Text fontSize="sm" color={textColor} flex={1}>
                            {selectedBooking.customer_email}
                          </Text>
                        </HStack>
                        
                        {selectedBooking.customer_phone && (
                          <HStack spacing={3}>
                            <Icon as={Phone} boxSize={4} color={textColor} />
                            <Text fontSize="sm" color={textColor} flex={1}>
                              {selectedBooking.customer_phone}
                            </Text>
                          </HStack>
                        )}
                      </VStack>
                    </Box>
                  </Box>

                  {/* Detalles de la Cita */}
                  <Box>
                    <HStack mb={4} align="center">
                      <Icon as={CalendarIcon} boxSize={5} color="purple.500" />
                      <Text fontWeight="semibold" fontSize="md" color={headingColor}>
                        Detalles de la Cita
                      </Text>
                    </HStack>
                    <Box 
                      bg={cardBgColor}
                      p={4}
                      borderRadius="md"
                      borderWidth="1px"
                      borderColor={borderColor}
                    >
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between">
                          <HStack spacing={2}>
                            <Icon as={CalendarIcon} boxSize={4} color={textColor} />
                            <Text fontSize="sm" color={textColor}>Fecha</Text>
                          </HStack>
                          <Text fontSize="sm" fontWeight="medium" color={headingColor}>
                            {new Date(selectedBooking.booking_date).toLocaleDateString('es-ES', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </Text>
                        </HStack>
                        
                        <Divider />
                        
                        <HStack justify="space-between">
                          <HStack spacing={2}>
                            <Icon as={Clock} boxSize={4} color={textColor} />
                            <Text fontSize="sm" color={textColor}>Horario</Text>
                          </HStack>
                          <Text fontSize="sm" fontWeight="medium" color={headingColor}>
                            {formatTime(selectedBooking.start_time)} - {formatTime(selectedBooking.end_time)}
                          </Text>
                        </HStack>
                        
                        <Divider />
                        
                        <HStack justify="space-between">
                          <HStack spacing={2}>
                            <Icon as={Clock} boxSize={4} color={textColor} />
                            <Text fontSize="sm" color={textColor}>Duración</Text>
                          </HStack>
                          <Text fontSize="sm" fontWeight="medium" color={headingColor}>
                            {selectedBooking.total_duration} minutos
                          </Text>
                        </HStack>
                      </VStack>
                    </Box>
                  </Box>

                  {/* Servicios */}
                  <Box>
                    <HStack mb={4} align="center">
                      <Icon as={FileText} boxSize={5} color="orange.500" />
                      <Text fontWeight="semibold" fontSize="md" color={headingColor}>
                        Servicios ({selectedBooking.services.length})
                      </Text>
                    </HStack>
                    <VStack spacing={2} align="stretch">
                      {selectedBooking.services.map((service, index) => (
                        <Box
                          key={index}
                          bg={cardBgColor}
                          p={4}
                          borderRadius="md"
                          borderWidth="1px"
                          borderColor={borderColor}
                        >
                          <Flex justify="space-between" align="center">
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="medium" color={headingColor}>
                                {service.name}
                              </Text>
                              <Text fontSize="xs" color={textColor}>
                                {service.duration_minutes} minutos
                              </Text>
                            </VStack>
                            <Text fontWeight="semibold" color="green.600">
                              ${service.price.toFixed(2)}
                            </Text>
                          </Flex>
                        </Box>
                      ))}
                    </VStack>
                  </Box>

                  {/* Total */}
                  <Box
                    bg={blueBgColor}
                    p={4}
                    borderRadius="md"
                    borderWidth="2px"
                    borderColor="blue.200"
                  >
                    <Flex justify="space-between" align="center">
                      <HStack spacing={2}>
                        <Icon as={DollarSign} boxSize={5} color="blue.600" />
                        <Text fontWeight="bold" fontSize="lg" color="blue.700">
                          Total
                        </Text>
                      </HStack>
                      <Text fontWeight="bold" fontSize="xl" color="blue.700">
                        ${selectedBooking.total_price.toFixed(2)}
                      </Text>
                    </Flex>
                  </Box>

                  {/* Notas */}
                  {selectedBooking.notes && (
                    <Box>
                      <HStack mb={2} align="center">
                        <Icon as={FileText} boxSize={4} color={textColor} />
                        <Text fontWeight="semibold" fontSize="sm" color={headingColor}>
                          Notas
                        </Text>
                      </HStack>
                      <Box
                        bg={cardBgColor}
                        p={3}
                        borderRadius="md"
                        borderWidth="1px"
                        borderColor={borderColor}
                      >
                        <Text fontSize="sm" color={textColor} fontStyle="italic">
                          {selectedBooking.notes}
                        </Text>
                      </Box>
                    </Box>
                  )}
                </VStack>
              </DialogBody>

              <Box
                as={DialogFooter}
                p={6}
                bg={footerBgColor}
                borderTopWidth="1px"
                borderColor={borderColor}
              >
                <Flex gap={3} w="full" justify="flex-end">
                  {selectedBooking.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => handleStatusUpdate(selectedBooking.id, 'confirmed')}
                        colorScheme="green"
                        leftIcon={<Check size={16} />}
                        size="default"
                      >
                        Confirmar
                      </Button>
                      <Button
                        onClick={() => handleStatusUpdate(selectedBooking.id, 'cancelled')}
                        colorScheme="red"
                        variant="outline"
                        leftIcon={<X size={16} />}
                        size="default"
                      >
                        Cancelar
                      </Button>
                    </>
                  )}
                  {selectedBooking.status === 'confirmed' && (
                    <Button
                      onClick={() => handleStatusUpdate(selectedBooking.id, 'cancelled')}
                      colorScheme="red"
                      variant="outline"
                      leftIcon={<X size={16} />}
                      size="default"
                    >
                      Cancelar Reserva
                    </Button>
                  )}
                  <Button
                    onClick={() => setShowBookingDialog(false)}
                    variant="ghost"
                    size="default"
                  >
                    Cerrar
                  </Button>
                </Flex>
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}