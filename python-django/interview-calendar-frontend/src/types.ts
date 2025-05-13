export interface Appointment {
  id: number;
  title: string;
  date: string;
  duration: number;
  status: 'scheduled' | 'cancelled' | 'completed';
  interviewee: string;
  interviewer: string;
  notes?: string;
}

export interface AppointmentFormData {
  title: string;
  date: string;
  time: string;
  duration: number;
  interviewee: string;
  interviewer: string;
  notes: string;
} 

export interface Slot {
  start: string;
  end?: string;
  day_of_week: string;
}

export type DayOfWeek = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
export type TimeString = string; 
export type TimeSlots = {
  [key in DayOfWeek]?: TimeString[]
}

export interface BookingData {
  start: string;
  end: string;
  day_of_week: string;
  operation?: 'book' | 'create';
}