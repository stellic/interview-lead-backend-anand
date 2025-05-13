import React from "react";

interface BookingModalProps {
  isOpen: boolean;
  day: string;
  time: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  day,
  time,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
          Confirm Booking
        </h2>
        <p className="mb-4 sm:mb-6 text-sm sm:text-base">
          Would you like to book this slot on{" "}
          <span className="font-semibold">{day}</span> at{" "}
          <span className="font-semibold">{time}</span>?
        </p>
        <div className="flex flex-col sm:flex-row-reverse space-y-2 sm:space-y-0 sm:space-x-4 sm:space-x-reverse">
          <button
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm sm:text-base"
            onClick={onConfirm}
          >
            Confirm
          </button>
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm sm:text-base"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
