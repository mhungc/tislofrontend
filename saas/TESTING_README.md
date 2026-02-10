# Booking Availability Manual Test Guide

This document lists manual UI test cases for the booking availability algorithm.

Assumptions
- Base grid: 15 minutes
- Slots start on grid boundaries only (00, 15, 30, 45)
- Blocked time is rounded up to the grid
- Last valid start = close time minus blocked time

Formula
- blockedMinutes = ceil(serviceDuration / baseSlotMinutes) * baseSlotMinutes

Base Schedule A
- Working hours: 09:00 to 11:30
- No existing bookings unless stated

Single-Service Durations
- 15 min -> blocked 15 -> last start 11:15
- 20 min -> blocked 30 -> last start 11:00
- 30 min -> blocked 30 -> last start 11:00
- 35 min -> blocked 45 -> last start 10:45
- 45 min -> blocked 45 -> last start 10:45
- 60 min -> blocked 60 -> last start 10:30
- 75 min -> blocked 75 -> last start 10:15

Multi-Service Totals
- 20 + 25 = 45 -> blocked 45 -> last start 10:45
- 30 + 30 = 60 -> blocked 60 -> last start 10:30
- 40 + 10 = 50 -> blocked 60 -> last start 10:30

Existing Booking Conflicts
- Existing booking: 10:00 to 10:45
  - 45-min blocked service should not allow starts at 10:00, 10:15, 10:30, 10:45
- Existing booking: 09:30 to 10:00
  - 35-min service start at 09:00 should be allowed (blocks 09:00 to 09:45)
  - 35-min service start at 09:15 should be blocked (overlaps 09:30 to 10:00)

Split Schedule Blocks
- Working hours: 09:00 to 10:00 and 10:30 to 11:30
- Service duration: 45 min
  - Start at 09:30 should be invalid (crosses the 10:00 to 10:30 gap)
- Service duration: 30 min
  - Start at 09:30 should be valid (ends at 10:00)
  - Start at 10:30 should be valid (ends at 11:00)

Crossing Midnight (If supported in UI)
- Working hours: 22:00 to 00:00
- Service duration: 45 min -> last start 23:15

Checklist per Test
- Verify start times are aligned to the base grid
- Verify the last allowed start time matches the expected value
- Verify no start times appear that would overlap existing bookings
- Verify gaps between schedule blocks block starts that would cross the gap
