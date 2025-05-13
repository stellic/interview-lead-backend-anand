import { useEffect, useState } from "react";
import { TimeSlots } from "../types";
import { AVAILABILITY_API_URL } from "../const";
import BookingModal from "../components/BookingModal";
import UnbookModal from "../components/UnbookModal";
import Notification, { NotificationType } from "../components/Notification";
import {
  DAY_OF_THE_WEEK,
  SLOTS_OF_THE_DAY,
  formatTimeSlotsData,
  createBookingData,
} from "../utils";

const AvailabilityCalendar = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlots>({});
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isUnbookModalOpen, setIsUnbookModalOpen] = useState(false);
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

  const handleSlotClick = (day: string, time: string, isAvailable: boolean) => {
    setSelectedSlot({ day, time });
    if (isAvailable) {
      setIsBookModalOpen(true);
    } else {
      setIsUnbookModalOpen(true);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;

    setIsLoading(true);

    try {
      // Create the booking data
      const bookingData = {
        ...createBookingData(selectedSlot.day, selectedSlot.time),
        operation: "book",
      };

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
      setIsBookModalOpen(false);
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

  const handleConfirmUnbooking = async () => {
    if (!selectedSlot) return;

    setIsLoading(true);

    try {
      // Create the unbooking data
      const unbookingData = {
        ...createBookingData(selectedSlot.day, selectedSlot.time),
        operation: "create",
      };

      // Send the POST request
      const response = await fetch(AVAILABILITY_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(unbookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to cancel booking");
      }

      // Refresh the data from the server
      await fetchTimeSlots();

      // Close the modal
      setIsUnbookModalOpen(false);
      setSelectedSlot(null);

      // Show success notification
      showNotification("Booking cancelled successfully!", "success");
    } catch (error) {
      console.error("Error cancelling booking:", error);
      showNotification(
        `Failed to cancel booking: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = () => {
    setIsBookModalOpen(false);
    setSelectedSlot(null);
  };

  const handleCancelUnbooking = () => {
    setIsUnbookModalOpen(false);
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
        <div className="mb-4 text-sm text-gray-600">
          <p>
            <span className="text-blue-500 font-semibold">Blue slots</span> are
            booked. You can click on them to cancel a booking
          </p>
          <p>
            <span className="text-grey-500 font-semibold">Grey slots</span> are
            available. You can click on them to make a booking
          </p>
        </div>
        <ul className="grid grid-cols-7 gap-4">
          {DAY_OF_THE_WEEK.map((day) => (
            <li key={day} className="border rounded-lg p-3">
              <div className="font-semibold text-center bg-gray-100 p-2 mb-3 rounded">
                {day}
              </div>
              {SLOTS_OF_THE_DAY.map((slot) => {
                const isAvailable =
                  timeSlots[day as keyof typeof timeSlots]?.includes(slot);
                return (
                  <div
                    key={`${day}-${slot}`}
                    className={`text-center p-2 mb-3 rounded cursor-pointer ${
                      isAvailable
                        ? "bg-gray-300 hover:bg-gray-400"
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                    }`}
                    onClick={() => handleSlotClick(day, slot, isAvailable)}
                  >
                    {slot}
                  </div>
                );
              })}
            </li>
          ))}
        </ul>
      </div>

      <BookingModal
        isOpen={isBookModalOpen}
        day={selectedSlot?.day || ""}
        time={selectedSlot?.time || ""}
        onConfirm={handleConfirmBooking}
        onCancel={handleCancelBooking}
      />

      <UnbookModal
        isOpen={isUnbookModalOpen}
        day={selectedSlot?.day || ""}
        time={selectedSlot?.time || ""}
        onConfirm={handleConfirmUnbooking}
        onCancel={handleCancelUnbooking}
      />

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p>Processing your request...</p>
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
