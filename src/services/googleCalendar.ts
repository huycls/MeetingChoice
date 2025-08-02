// Google Calendar API integration
// Note: This is a simplified version. In a real app, you'd need proper OAuth setup

export interface CalendarEvent {
  summary: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  attendees: { email: string }[];
  description?: string;
  location?: string;
}

export class GoogleCalendarService {
  private apiKey: string;
  private accessToken: string;

  constructor(apiKey: string, accessToken: string) {
    this.apiKey = apiKey;
    this.accessToken = accessToken;
  }

  async createEvent(event: CalendarEvent): Promise<any> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }
      );

      if (!response.ok) {
        throw new Error(`Calendar API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  }

  async sendMeetingInvite(
    guestEmail: string,
    guestName: string,
    hostEmail: string,
    date: string,
    startTime: string,
    endTime: string,
    note?: string
  ) {
    const startDateTime = `${date}T${startTime}`;
    const endDateTime = `${date}T${endTime}`;

    const event: CalendarEvent = {
      summary: `Cuộc họp với ${guestName}`,
      start: {
        dateTime: startDateTime,
        timeZone: 'Asia/Ho_Chi_Minh',
      },
      end: {
        dateTime: endDateTime,
        timeZone: 'Asia/Ho_Chi_Minh',
      },
      attendees: [
        { email: guestEmail },
        { email: hostEmail },
      ],
      description: note ? `Ghi chú: ${note}` : 'Cuộc họp được đặt thông qua hệ thống booking',
      location: 'Phòng họp - Địa chỉ công ty',
    };

    return await this.createEvent(event);
  }
}

// Mock service for demo purposes
export class MockGoogleCalendarService {
  async sendMeetingInvite(
    guestEmail: string,
    guestName: string,
    hostEmail: string,
    date: string,
    startTime: string,
    endTime: string,
    note?: string
  ) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('📅 Mock Calendar Invite Sent:', {
      to: guestEmail,
      from: hostEmail,
      guest: guestName,
      date,
      time: `${startTime} - ${endTime}`,
      note
    });

    return { success: true, eventId: 'mock-event-' + Date.now() };
  }
}

export const calendarService = new MockGoogleCalendarService();