import { useEffect, useState } from "react";
import { Slot, TimeSlots, DayOfWeek } from "../types";

const AvailabilityCalendar = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlots>({});

  const DAY_OF_THE_WEEK = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const SLOTS_OF_THE_DAY = [
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

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        "http://127.0.0.1:8000/api/users/1/calendar/free/"
      );
      const data = await response.json();

      // Transform data to required format
      const formattedData: TimeSlots = {};

      data.forEach((slot: Slot) => {
        // Convert UTC time to local browser time (I am in PDT atm. so I get 2025-05-12T16:00:00+00:00 → 09:00 (PDT))
        const localStartTime = new Date(slot.start);

        // Format to HH:MM in local timezone
        const hours = localStartTime.getHours().toString().padStart(2, "0");
        const minutes = localStartTime.getMinutes().toString().padStart(2, "0");
        const timeString = `${hours}:${minutes}`;
        //console.log(`${slot.start} -> ${timeString}`);

        // Initialize the array for this day if it doesn't exist
        if (!formattedData[slot.day_of_week as DayOfWeek]) {
          formattedData[slot.day_of_week as DayOfWeek] = [];
        }

        // Add the start time if not already in the array
        if (
          !formattedData[slot.day_of_week as DayOfWeek]?.includes(timeString)
        ) {
          formattedData[slot.day_of_week as DayOfWeek]!.push(timeString);
        }
      });

      setTimeSlots(formattedData);
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">
        Available Time Slots
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <ul className="grid grid-cols-7 gap-4">
          {/* iterate through all days and for each day, display either slots as available or unavailable */}
          {DAY_OF_THE_WEEK.map((day) => (
            <li key={day} className="border rounded-lg p-3">
              <div className="font-semibold text-center bg-gray-100 p-2 mb-3 rounded">
                {day}
              </div>
              {/* for this day, iterate through all slots starting from 9 AM to 5 PM in 30 min increments. 
                  If a slot is in timeSlots, mark it as available (blue), otherwise mark it as unavailable (grey) */}
              {SLOTS_OF_THE_DAY.map((slot) => (
                <div
                  key={`${day}-${slot}`}
                  className={`text-center p-2 mb-3 rounded ${
                    timeSlots[day as keyof typeof timeSlots]?.includes(slot)
                      ? "bg-blue-500"
                      : "bg-gray-200"
                  }`}
                >
                  {slot}
                </div>
              ))}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
