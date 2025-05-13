import { useEffect, useState } from "react";
import { TimeSlots } from "../types";
import { AVAILABILITY_API_URL } from "../config";
import BookingModal from "../components/BookingModal";
import Notification, { NotificationType } from "../components/Notification";
import {
  DAY_OF_THE_WEEK,
  SLOTS_OF_THE_DAY,
  formatTimeSlotsData,
  createBookingData,
} from "../utils";

const AvailabilityCalendar = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlots>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    day: string;
    time: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Notification state
  const [notification, setNotification] = useState<{
    message: string;
    type: NotificationType;
    isVisible: boolean;
  }>({
    message: "",
    type: "info",
    isVisible: false,
  });

  useEffect(() => {
    fetchTimeSlots();
  }, []);

  const fetchTimeSlots = async () => {
    try {
      const response = await fetch(AVAILABILITY_API_URL);
      const data = await response.json();
      setTimeSlots(formatTimeSlotsData(data));
    } catch (error) {
      console.error("Error fetching time slots:", error);
      showNotification("Error fetching time slots. Please try again.", "error");
    }
  };

  const handleSlotClick = (day: string, time: string) => {
    setSelectedSlot({ day, time });
    setIsModalOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;

    setIsLoading(true);

    try {
      // Create the booking data
      const bookingData = createBookingData(
        selectedSlot.day,
        selectedSlot.time
      );

      // Send the POST request
      const response = await fetch(AVAILABILITY_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to book slot");
      }

      // Refresh the data from the server
      await fetchTimeSlots();

      // Close the modal
      setIsModalOpen(false);
      setSelectedSlot(null);

      // Show success notification
      showNotification("Slot booked successfully!", "success");
    } catch (error) {
      console.error("Error booking slot:", error);
      showNotification(
        `Failed to book slot: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = () => {
    setIsModalOpen(false);
    setSelectedSlot(null);
  };

  const showNotification = (message: string, type: NotificationType) => {
    setNotification({
      message,
      type,
      isVisible: true,
    });
  };

  const hideNotification = () => {
    setNotification((prev) => ({
      ...prev,
      isVisible: false,
    }));
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">
        Available Time Slots
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <ul className="grid grid-cols-7 gap-4">
          {DAY_OF_THE_WEEK.map((day) => (
            <li key={day} className="border rounded-lg p-3">
              <div className="font-semibold text-center bg-gray-100 p-2 mb-3 rounded">
                {day}
              </div>
              {SLOTS_OF_THE_DAY.map((slot) => (
                <div
                  key={`${day}-${slot}`}
                  className={`text-center p-2 mb-3 rounded ${
                    timeSlots[day as keyof typeof timeSlots]?.includes(slot)
                      ? "bg-blue-500 cursor-pointer hover:bg-blue-600"
                      : "bg-gray-200"
                  }`}
                  onClick={() =>
                    timeSlots[day as keyof typeof timeSlots]?.includes(slot)
                      ? handleSlotClick(day, slot)
                      : null
                  }
                >
                  {slot}
                </div>
              ))}
            </li>
          ))}
        </ul>
      </div>

      <BookingModal
        isOpen={isModalOpen}
        day={selectedSlot?.day || ""}
        time={selectedSlot?.time || ""}
        onConfirm={handleConfirmBooking}
        onCancel={handleCancelBooking}
      />

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p>Booking your slot...</p>
          </div>
        </div>
      )}

      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
        autoHideDuration={5000}
      />
    </div>
  );
};

export default AvailabilityCalendar;
