import React, { useEffect, useState } from "react";
import { CheckCircle, AlertTriangle } from "lucide-react";

interface NotificationToastProps {
  message: string;
  type: "success" | "error";
  duration?: number;
  onClose: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  message,
  type,
  duration = 3000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in
    const fadeInTimer = setTimeout(() => {
      setIsVisible(true);
    }, 10); // small delay to ensure transition is applied

    // Fade out and close
    const closeTimer = setTimeout(() => {
      setIsVisible(false);
      // Wait for fade out animation to finish before unmounting
      setTimeout(onClose, 300);
    }, duration - 300);

    return () => {
      clearTimeout(fadeInTimer);
      clearTimeout(closeTimer);
    };
  }, [duration, onClose]);

  const baseStyle =
    "fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3 rounded-lg text-white shadow-lg transform transition-all duration-300 ease-out";
  const visibleStyle = "opacity-100 translate-y-0";
  const hiddenStyle = "opacity-0 -translate-y-10";

  const typeStyles = {
    success: "bg-green-500",
    error: "bg-red-500",
  };

  const Icon = type === "success" ? CheckCircle : AlertTriangle;

  return (
    <div
      className={`${baseStyle} ${typeStyles[type]} ${
        isVisible ? visibleStyle : hiddenStyle
      }`}>
      <Icon className="w-6 h-6" />
      <span className="font-medium">{message}</span>
    </div>
  );
};
