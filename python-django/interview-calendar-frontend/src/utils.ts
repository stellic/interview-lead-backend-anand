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

// Check the implementation of createBookingData
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

// Make sure this helper function is correctly implemented
export const createDateForDayAndTime = (day: string, time: string) => {
  // Get the current date
  const now = new Date();
  
  // Find the day of the week for the given day string
  const dayIndex = DAY_OF_THE_WEEK.indexOf(day);
  if (dayIndex === -1) {
    throw new Error(`Invalid day: ${day}`);
  }
  
  // Calculate the date for the given day of the week
  const currentDayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ...
  const targetDayOfWeek = dayIndex + 1; // Convert to 1 = Monday, ... 7 = Sunday
  
  // Calculate days to add to get to the target day
  let daysToAdd = targetDayOfWeek - currentDayOfWeek;
  if (daysToAdd <= 0) {
    daysToAdd += 7; // Add a week if the day has already passed
  }
  
  // Create a new date for the target day
  const targetDate = new Date(now);
  targetDate.setDate(now.getDate() + daysToAdd);
  
  // Set the time
  const [hours, minutes] = time.split(':').map(Number);
  targetDate.setHours(hours, minutes, 0, 0);
  
  return targetDate;
};