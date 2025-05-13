import React, { useEffect } from "react";

export type NotificationType = "success" | "error" | "info";

interface NotificationProps {
  message: string;
  type: NotificationType;
  isVisible: boolean;
  onClose: () => void;
  autoHideDuration?: number;
}

const Notification: React.FC<NotificationProps> = ({
  message,
  type,
  isVisible,
  onClose,
  autoHideDuration = 5000,
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, autoHideDuration]);

  if (!isVisible) return null;

  const bgColor = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  }[type];

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div
        className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center justify-between min-w-[300px]`}
      >
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200 focus:outline-none"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Notification;
