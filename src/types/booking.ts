export interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isBooked: boolean;
  bookedBy?: string;
  bookedAt?: string;
  guestName?: string;
  guestEmail?: string;
  guestNote?: string;
}

export interface BookingRequest {
  slotId: string;
  guestName: string;
  guestEmail: string;
  guestNote?: string;
}

export interface AvailableSlot {
  date: string;
  startTime: string;
  endTime: string;
}

export interface User {
  id: string;
  email: string;
  role: 'host' | 'guest';
  name?: string;
}