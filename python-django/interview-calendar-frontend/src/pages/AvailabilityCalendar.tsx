import { useState, useEffect } from "react";
import { ViewMode } from "../types";
import { DAY_OF_THE_WEEK, SLOTS_OF_THE_DAY } from "../utils";
import BookingModal from "../components/BookingModal";
import UnbookModal from "../components/UnbookModal";
import NotificationToast from "../components/NotificationToast";
import { useCalendarData } from "../hooks/useCalendarData";

const AvailabilityCalendar = () => {
  // Use our custom hook for data fetching and state management
  const {
    timeSlots,
    isLoading,
    notification,
    bookTimeSlot,
    cancelBooking,
    hideNotification,
  } = useCalendarData();

  // UI state
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isUnbookModalOpen, setIsUnbookModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    day: string;
    time: string;
  } | null>(null);

  // Responsive state
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Check screen size on mount and when window resizes
  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth < 768) {
        setViewMode(selectedDay ? "mobile-slots" : "mobile-days");
      } else {
        setViewMode("desktop");
      }
    };

    // Initial check
    checkScreenSize();

    // Add resize listener
    window.addEventListener("resize", checkScreenSize);

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize);
  }, [selectedDay]);

  // Force check screen size when component mounts
  useEffect(() => {
    const checkScreenSize = () => {
      const isMobile = window.innerWidth < 768;
      setViewMode(isMobile ? "mobile-days" : "desktop");
    };

    checkScreenSize();
  }, []);

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

    try {
      await bookTimeSlot(selectedSlot.day, selectedSlot.time);
      setIsBookModalOpen(false);
      setSelectedSlot(null);
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const handleConfirmUnbooking = async () => {
    if (!selectedSlot) return;

    try {
      await cancelBooking(selectedSlot.day, selectedSlot.time);
      setIsUnbookModalOpen(false);
      setSelectedSlot(null);
    } catch (error) {
      // Error is already handled in the hook
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

  const handleDaySelect = (day: string) => {
    setSelectedDay(day);
    setViewMode("mobile-slots");
  };

  const handleBackTodays = () => {
    setSelectedDay(null);
    setViewMode("mobile-days");
  };

  // Desktop view rendering
  const renderDesktopView = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4 text-sm text-gray-600">
        <p>
          • Click on a{" "}
          <span className="text-gray-500 font-semibold">grey slot</span> to book
          it
        </p>
        <p>
          • Click on a{" "}
          <span className="text-green-500 font-semibold">green slot</span> to
          cancel a booking
        </p>
      </div>
      <ul className="grid grid-cols-7 gap-4">
        {DAY_OF_THE_WEEK.map((day) => (
          <li key={day} className="border rounded-lg p-3">
            <div className="font-semibold text-center bg-gray-100 p-2 mb-3 rounded">
              {day}
            </div>
            {SLOTS_OF_THE_DAY.map((slot) => {
              const isAvailable = timeSlots[day]?.includes(slot);
              return (
                <div
                  key={`${day}-${slot}`}
                  className={`text-center p-2 mb-3 rounded cursor-pointer ${
                    isAvailable
                      ? "bg-gray-300 hover:bg-gray-400"
                      : "bg-green-500 hover:bg-green-600 text-white"
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
  );

  // Mobile days view rendering
  const renderMobileDaysView = () => (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <p className="mb-4 text-sm text-gray-600">
        Select a day to view available slots:
      </p>
      <ul className="space-y-3">
        {DAY_OF_THE_WEEK.map((day) => {
          // Count available slots for this day
          const availableCount = timeSlots[day]?.length || 0;
          const totalSlots = SLOTS_OF_THE_DAY.length;
          const bookedCount = totalSlots - availableCount;

          return (
            <li
              key={day}
              className="border rounded-lg p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
              onClick={() => handleDaySelect(day)}
            >
              <div className="font-semibold">{day}</div>
              <div className="text-sm">
                <span className="text-green-500">{bookedCount} booked</span>
                {" / "}
                <span className="text-gray-500">
                  {availableCount} available
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );

  // Mobile slots view rendering
  const renderMobileSlotsView = () => {
    if (!selectedDay) return null;

    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex items-center mb-4">
          <button
            className="mr-2 p-2 rounded-full hover:bg-gray-100"
            onClick={handleBackTodays}
          >
            ← Back
          </button>
          <h2 className="text-lg font-semibold">{selectedDay}</h2>
        </div>

        <div className="mb-4 text-sm text-gray-600">
          <p>
            • Click on a{" "}
            <span className="text-gray-500 font-semibold">grey slot</span> to
            book it
          </p>
          <p>
            • Click on a{" "}
            <span className="text-green-500 font-semibold">green slot</span> to
            cancel a booking
          </p>
        </div>

        <ul className="space-y-2">
          {SLOTS_OF_THE_DAY.map((slot) => {
            const isAvailable = timeSlots[selectedDay]?.includes(slot);
            return (
              <li
                key={`${selectedDay}-${slot}`}
                className={`p-3 rounded cursor-pointer ${
                  isAvailable
                    ? "bg-gray-300 hover:bg-gray-400"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
                onClick={() => handleSlotClick(selectedDay, slot, isAvailable)}
              >
                {slot}
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Render the appropriate view based on viewMode */}
      {viewMode === "desktop" && renderDesktopView()}
      {viewMode === "mobile-days" && renderMobileDaysView()}
      {viewMode === "mobile-slots" && renderMobileSlotsView()}

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

      <NotificationToast
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
