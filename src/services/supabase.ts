import { createClient } from '@supabase/supabase-js';
import { TimeSlot, BookingRequest, AvailableSlot } from '../types/booking';

// Note: These should be environment variables in a real app
const supabaseUrl = 'https://bvbhtaebcmhpymwhbhrv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2Ymh0YWViY21ocHltd2hiaHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NjIyMTEsImV4cCI6MjA2OTUzODIxMX0._Mj4n2FJU1UpO_A2DHVuUspSHPZrSLZEKFP-STGM81w';

export const supabase = createClient(supabaseUrl, supabaseKey);

export class BookingService {
  async getTimeSlots(): Promise<TimeSlot[]> {
    const { data, error } = await supabase
      .from('time_slots')
      .select('*')
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching time slots:', error);
      throw error;
    }

    return data.map(slot => ({
      id: slot.id,
      date: slot.date,
      startTime: slot.start_time,
      endTime: slot.end_time,
      isAvailable: slot.is_available,
      isBooked: slot.is_booked,
      bookedBy: slot.booked_by,
      bookedAt: slot.booked_at,
      guestName: slot.guest_name,
      guestEmail: slot.guest_email,
      guestNote: slot.guest_note
    }));
  }

  async createTimeSlots(slots: AvailableSlot[]): Promise<TimeSlot[]> {
    const slotsData = slots.map(slot => ({
      date: slot.date,
      start_time: slot.startTime,
      end_time: slot.endTime,
      is_available: true,
      is_booked: false
    }));

    const { data, error } = await supabase
      .from('time_slots')
      .insert(slotsData)
      .select();

    if (error) {
      console.error('Error creating time slots:', error);
      throw error;
    }

    return data.map(slot => ({
      id: slot.id,
      date: slot.date,
      startTime: slot.start_time,
      endTime: slot.end_time,
      isAvailable: slot.is_available,
      isBooked: slot.is_booked,
      bookedBy: slot.booked_by,
      bookedAt: slot.booked_at,
      guestName: slot.guest_name,
      guestEmail: slot.guest_email,
      guestNote: slot.guest_note
    }));
  }

  async bookTimeSlot(slotId: string, bookingData: Omit<BookingRequest, 'slotId'>): Promise<TimeSlot> {
    const { data, error } = await supabase
      .from('time_slots')
      .update({
        is_booked: true,
        booked_by: bookingData.guestEmail,
        booked_at: new Date().toISOString(),
        guest_name: bookingData.guestName,
        guest_email: bookingData.guestEmail,
        guest_note: bookingData.guestNote
      })
      .eq('id', slotId)
      .eq('is_booked', false) // Prevent double booking
      .select()
      .single();

    if (error) {
      console.error('Error booking time slot:', error);
      throw error;
    }

    return {
      id: data.id,
      date: data.date,
      startTime: data.start_time,
      endTime: data.end_time,
      isAvailable: data.is_available,
      isBooked: data.is_booked,
      bookedBy: data.booked_by,
      bookedAt: data.booked_at,
      guestName: data.guest_name,
      guestEmail: data.guest_email,
      guestNote: data.guest_note
    };
  }

  async deleteTimeSlot(slotId: string): Promise<void> {
    const { error } = await supabase
      .from('time_slots')
      .delete()
      .eq('id', slotId);

    if (error) {
      console.error('Error deleting time slot:', error);
      throw error;
    }
  }

  subscribeToSlotChanges(callback: (slots: TimeSlot[]) => void) {
    return supabase
      .channel('time_slots_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'time_slots'
      }, () => {
        this.getTimeSlots().then(callback);
      })
      .subscribe();
  }
}

export const bookingService = new BookingService();