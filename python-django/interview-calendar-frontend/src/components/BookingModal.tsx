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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Confirm Booking</h2>
        <p className="mb-6">
          Would you like to book this slot on{" "}
          <span className="font-semibold">{day}</span> at{" "}
          <span className="font-semibold">{time}</span>?
        </p>
        <div className="flex justify-end space-x-4">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
