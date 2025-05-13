import { useState, useEffect, useCallback } from "react";
import { TimeSlots, NotificationType } from "../types";
import { AVAILABILITY_API_URL } from "../const";
import { formatTimeSlotsData, createBookingData } from "../utils";

interface NotificationState {
  message: string;
  type: NotificationType;
  isVisible: boolean;
}

interface UseCalendarDataReturn {
  timeSlots: TimeSlots;
  isLoading: boolean;
  notification: NotificationState;
  fetchTimeSlots: () => Promise<void>;
  bookTimeSlot: (day: string, time: string) => Promise<void>;
  cancelBooking: (day: string, time: string) => Promise<void>;
  showNotification: (message: string, type: NotificationType) => void;
  hideNotification: () => void;
}

export const useCalendarData = (): UseCalendarDataReturn => {
  const [timeSlots, setTimeSlots] = useState<TimeSlots>({});
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    message: "",
    type: "info",
    isVisible: false,
  });

  const fetchTimeSlots = useCallback(async () => {
    try {
      const response = await fetch(AVAILABILITY_API_URL);
      if (!response.ok) {
        throw new Error("Failed to fetch time slots");
      }
      const data = await response.json();
      setTimeSlots(formatTimeSlotsData(data));
    } catch (error) {
      console.error("Error fetching time slots:", error);
      showNotification("Error fetching time slots. Please try again.", "error");
    }
  }, []);

  useEffect(() => {
    fetchTimeSlots();
  }, [fetchTimeSlots]);

  const bookTimeSlot = async (day: string, time: string) => {
    setIsLoading(true);

    try {
      // Create the booking data
      const bookingData = {
        ...createBookingData(day, time),
        operation: "book"
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
        const errorMessage = errorData.error || "Failed to book slot";
        
        // Check if the error is about the slot already being booked
        if (errorMessage.includes("already be booked")) {
          throw new Error("This slot has already been booked by someone else. Please refresh and try another slot.");
        } else {
          throw new Error(errorMessage);
        }
      }

      // Refresh the data from the server
      await fetchTimeSlots();

      // Show success notification
      showNotification("Slot booked successfully!", "success");
      return Promise.resolve();
    } catch (error) {
      console.error("Error booking slot:", error);
      showNotification(
        `${error instanceof Error ? error.message : "Unknown error"}`,
        "error"
      );
      
      // Refresh the data to show the current state
      await fetchTimeSlots();
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelBooking = async (day: string, time: string) => {
    setIsLoading(true);

    try {
      // Create the unbooking data
      const unbookingData = {
        ...createBookingData(day, time),
        operation: "create"
      };

      console.log("Sending cancel booking request with data:", unbookingData);

      // Send the POST request
      const response = await fetch(AVAILABILITY_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(unbookingData),
      });

      console.log("Cancel booking response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response data:", errorData);
        throw new Error(errorData.error || "Failed to cancel booking");
      }

      // Refresh the data from the server
      await fetchTimeSlots();

      // Show success notification
      showNotification("Booking cancelled successfully!", "success");
      return Promise.resolve();
    } catch (error) {
      console.error("Error cancelling booking:", error);
      showNotification(
        `Failed to cancel booking: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "error"
      );
      
      // Refresh the data
      await fetchTimeSlots();
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
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

  return {
    timeSlots,
    isLoading,
    notification,
    fetchTimeSlots,
    bookTimeSlot,
    cancelBooking,
    showNotification,
    hideNotification,
  };
};