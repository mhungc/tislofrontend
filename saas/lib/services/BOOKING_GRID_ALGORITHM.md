# Booking Availability Grid Algorithm

## Overview

This system implements a flexible booking availability algorithm based on a configurable **base time grid** (default: 15 minutes) while supporting services with **arbitrary durations** (e.g., 20, 35, 45 minutes).

The algorithm follows industry-standard behavior similar to platforms like Booksy and Fresha.

## Core Concepts

### Base Time Grid

The **base grid** is a visual and alignment reference that determines:
- Valid start times for bookings (e.g., 07:00, 07:15, 07:30, 07:45)
- The minimum time unit for slot generation
- The blocking granularity for occupied time

**Default value:** 15 minutes  
**Configurable:** Yes, via constructor parameter in `AvailabilityCalculator`

### Service Duration vs. Blocked Time

Services can have **any duration** (not limited to multiples of the base grid):
- A 20-minute service can start at 07:00, 07:15, 07:30, etc.
- A 35-minute service can start at 08:00, 08:15, 08:30, etc.

However, the **blocked time** is always rounded up to the next base grid interval:

```
blockedMinutes = Math.ceil(serviceDurationMinutes / baseSlotMinutes) * baseSlotMinutes
```

**Example with 15-minute base grid:**
- 20-minute service → blocks 30 minutes (2 slots)
- 35-minute service → blocks 45 minutes (3 slots)
- 45-minute service → blocks 45 minutes (3 slots)
- 60-minute service → blocks 60 minutes (4 slots)

### Why Rounding?

The remaining minutes in the last blocked slot are considered **operational dead time** and are not bookable. This prevents:
- Overlapping bookings
- Fragmented availability
- Scheduling conflicts

## Algorithm Rules

### 1. Start Time Alignment

Bookings can **only start** at times aligned to the base grid:

✅ **Valid start times** (15-min grid):
- 07:00, 07:15, 07:30, 07:45, 08:00, etc.

❌ **Invalid start times**:
- 07:07, 07:22, 07:38, etc.

### 2. Continuous Availability

When validating a booking, the system ensures:
- All required base slots are available
- No gaps exist between slots
- The service duration fits within available time
- No conflicts with existing bookings

### 3. Blocking Logic

When a booking is created:
1. Calculate blocked time: `Math.ceil(duration / baseGrid) * baseGrid`
2. Block all required base slots
3. Mark remaining minutes as unavailable (dead time)

## Behavior Examples

### Example 1: 20-minute service with 15-minute grid

**Availability:** 07:00 – 08:00  
**Service duration:** 20 minutes  
**Base grid:** 15 minutes

**Timeline:**

```
07:00 ─┬─ Booking starts (20 min service)
       │  
07:15 ─┤  ← Blocked (slot 2)
       │
07:30 ─┴─ Booking ends (30 min blocked)
       │  10 minutes dead time
07:45 ─── Next available start
```

**Valid bookings:**
- 07:00 → blocks until 07:30 (30 min)
- 07:15 → blocks until 07:45 (30 min)
- 07:30 → blocks until 08:00 (30 min)

**Invalid:**
- 07:45 → insufficient time (only 15 min available, needs 30 min)

### Example 2: 35-minute service with 15-minute grid

**Availability:** 09:00 – 10:00  
**Service duration:** 35 minutes  
**Base grid:** 15 minutes

**Timeline:**

```
09:00 ─┬─ Booking starts (35 min service)
       │
09:15 ─┤  ← Blocked (slot 2)
       │
09:30 ─┤  ← Blocked (slot 3)
       │
09:45 ─┴─ Booking ends (45 min blocked)
       │  10 minutes dead time
10:00 ─── Closing time
```

**Valid bookings:**
- 09:00 → blocks until 09:45 (45 min)
- 09:15 → would need until 10:00, but only 45 min available ❌

**Invalid:**
- 09:15 → insufficient continuity
- 09:30 → insufficient continuity

### Example 3: Multiple services

**Availability:** 10:00 – 12:00  
**Services:** 20 min + 25 min = 45 min total  
**Base grid:** 15 minutes

**Blocked time:** `Math.ceil(45 / 15) * 15 = 45 minutes`

**Timeline:**

```
10:00 ─┬─ Booking starts (45 min total)
       │  Service 1: 20 min
10:15 ─┤  ← Blocked
       │  Service 2: 25 min
10:30 ─┤  ← Blocked
       │
10:45 ─┴─ Booking ends (45 min blocked)
       │
11:00 ─── Next available start
```

## Why Slots Are Not Persisted

The system **does not persist generated time slots** in the database. Instead:

### Persisted Data:
- ✅ Availability rules (shop schedules, recurring hours)
- ✅ Services (name, duration, price)
- ✅ Confirmed bookings (date, start time, end time)
- ✅ Schedule exceptions (holidays, closures)

### Generated Dynamically:
- ⚡ Available time slots
- ⚡ Blocked time ranges
- ⚡ Valid start times

### Benefits:
1. **Flexibility:** Change base grid without data migration
2. **Consistency:** Always calculated from source of truth
3. **Simplicity:** No slot synchronization needed
4. **Scalability:** No exponential data growth

## Configuration

### Current Implementation

The `baseSlotMinutes` parameter is:
- Isolated in `AvailabilityCalculator` constructor
- Default value: 15 minutes
- Passed through the service layer

```typescript
// lib/services/availability-calculator.ts
export class AvailabilityCalculator {
  private readonly baseSlotMinutes: number

  constructor(baseSlotMinutes: number = 15) {
    this.baseSlotMinutes = baseSlotMinutes
  }
}
```

### Future: Per-Store Configuration

To make `baseSlotMinutes` configurable per store:

1. Add column to `shops` table:
```sql
ALTER TABLE shops ADD COLUMN base_slot_minutes INTEGER DEFAULT 15;
```

2. Pass value from shop settings:
```typescript
const calculator = new AvailabilityCalculator(shop.base_slot_minutes)
```

3. Update UI to allow store owners to configure their preferred grid (5, 10, 15, 30 minutes)

## Technical Implementation

### Key Files

- **`lib/services/availability-calculator.ts`** - Core algorithm
- **`lib/repositories/booking-repository.ts`** - Data access with calculator instantiation
- **`lib/services/booking-service.ts`** - Business logic and validation
- **`lib/services/booking-calendar-service.ts`** - Calendar view generation

### Algorithm Flow

```
1. Get shop schedules for date
   ↓
2. Generate base grid slots (every 15 min)
   ↓
3. Get existing bookings for date
   ↓
4. For each slot, validate:
   - Sufficient continuous slots available?
   - No conflicts with existing bookings?
   - Service duration fits before closing?
   ↓
5. Return available start times
```

### Validation Logic

```typescript
// Calculate blocked time (rounded up)
const blockedMinutes = Math.ceil(serviceDuration / baseSlotMinutes) * baseSlotMinutes
const slotsNeeded = blockedMinutes / baseSlotMinutes

// Check each required slot
for (let i = 0; i < slotsNeeded; i++) {
  // Verify slot exists
  // Verify no gaps in continuity
  // Verify no booking conflicts
}
```

## Edge Cases Handled

1. **Overnight schedules** (22:00 – 02:00): Time comparison handles midnight crossing
2. **Multiple schedule blocks**: Slots generated for all blocks, duplicates removed
3. **Service longer than available time**: Correctly marked as unavailable
4. **Gaps in schedule**: Continuity check prevents booking across gaps
5. **Exact fit scenarios**: Service ending exactly at closing time is valid

## Future Enhancements

- [ ] Per-store base grid configuration in database
- [ ] UI for store owners to select preferred grid (5, 10, 15, 30 min)
- [ ] Buffer time between bookings (configurable)
- [ ] Peak hours with different grid settings
- [ ] Multi-resource scheduling (multiple staff members)

---

**Last Updated:** 2024  
**Algorithm Version:** 1.0  
**Base Grid Default:** 15 minutes
