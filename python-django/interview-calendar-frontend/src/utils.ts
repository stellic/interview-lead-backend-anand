import { Slot, TimeSlots, DayOfWeek } from "./types";

/**
 * Days of the week in order
 */
export const DAY_OF_THE_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

/**
 * Time slots of the day in 30-minute increments
 */
export const SLOTS_OF_THE_DAY = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
];

/**
 * Transforms API slot data to the required format for the calendar
 * @param data Array of slot objects from the API
 * @returns Formatted time slots grouped by day of week
 */
export const formatTimeSlotsData = (data: Slot[]): TimeSlots => {
  const formattedData: TimeSlots = {};

  data.forEach((slot: Slot) => {
    // Convert UTC time to local browser time
    const localStartTime = new Date(slot.start);

    // Format to HH:MM in local timezone
    const hours = localStartTime.getHours().toString().padStart(2, "0");
    const minutes = localStartTime.getMinutes().toString().padStart(2, "0");
    const timeString = `${hours}:${minutes}`;

    // Initialize the array for this day if it doesn't exist
    let day = formattedData[slot.day_of_week as DayOfWeek];
    if (!day) {
      day = [];
      formattedData[slot.day_of_week as DayOfWeek] = day;
    }

    // Add the start time if not already in the array
    if (!day.includes(timeString)) {
      day.push(timeString);
    }
  });

  return formattedData;
};

/**
 * Creates a date object for the next occurrence of the specified day
 * @param dayName Name of the day (e.g., "Monday")
 * @param timeString Time in format "HH:MM"
 * @returns Date object for the next occurrence of the day at the specified time
 */
export const createDateForDayAndTime = (dayName: string, timeString: string): Date => {
  const date = new Date();
  const dayIndex = DAY_OF_THE_WEEK.indexOf(dayName);
  
  // Set the date to the next occurrence of the selected day
  const currentDay = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const targetDay = dayIndex + 1; // Convert to 1 = Monday, etc.
  const daysToAdd = (targetDay - currentDay + 7) % 7;
  
  date.setDate(date.getDate() + daysToAdd);
  
  // Set the time
  const [hours, minutes] = timeString.split(':').map(Number);
  date.setHours(hours, minutes, 0, 0);
  
  return date;
};

/**
 * Creates booking data for the API
 * @param day Day of the week
 * @param time Time in format "HH:MM"
 * @returns Booking data object for the API
 */
export const createBookingData = (day: string, time: string) => {
  const date = createDateForDayAndTime(day, time);
  
  // Create end time (30 minutes later)
  const endDate = new Date(date);
  endDate.setMinutes(endDate.getMinutes() + 30);
  
  return {
    start: date.toISOString(),
    end: endDate.toISOString(),
    day_of_week: day
  };
};