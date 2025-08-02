import React from "react";
import { TimeSlot } from "../types/booking";
import { Clock, User, CheckCircle } from "lucide-react";

interface TimeSlotGridProps {
  slots: TimeSlot[];
  selectedDate: string;
  onSlotClick: (slot: TimeSlot) => void;
  isHost?: boolean;
}

export const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({
  slots,
  selectedDate,
  onSlotClick,
  isHost = false,
}) => {
  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const getSlotStyle = (slot: TimeSlot) => {
    if (!slot.isAvailable) {
      return "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200";
    }

    if (slot.isBooked) {
      return "bg-red-50 text-red-700 border-red-200 cursor-not-allowed";
    }

    return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300 cursor-pointer transition-all duration-200 hover:shadow-md";
  };

  const getSlotIcon = (slot: TimeSlot) => {
    if (!slot.isAvailable) {
      return <Clock className="w-4 h-4" />;
    }

    if (slot.isBooked) {
      return <User className="w-4 h-4" />;
    }

    return <CheckCircle className="w-4 h-4" />;
  };

  const filteredSlots = slots.filter((slot) => slot.date === selectedDate);

  if (filteredSlots.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">
          Không có khung giờ nào được thiết lập cho ngày này
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {filteredSlots.map((slot) => {
        return (
          <div
            key={slot.id}
            onClick={() =>
              slot.isAvailable && !slot.isBooked && onSlotClick(slot)
            }
            className={`p-4 rounded-lg border-2 ${getSlotStyle(slot)}`}>
            <div className="flex items-center gap-2 mb-2">
              {getSlotIcon(slot)}
              <span className="font-medium">
                {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
              </span>
            </div>

            {slot.isBooked && (
              <div className="text-sm">
                <p className="font-medium">{slot.guestName}</p>
                {isHost && <p className="text-gray-600">{slot.guestEmail}</p>}
              </div>
            )}

            {!slot.isAvailable && (
              <p className="text-sm text-gray-500">Không khả dụng</p>
            )}

            {slot.isAvailable && !slot.isBooked && (
              <p className="text-sm font-medium">Có thể đặt</p>
            )}
          </div>
        );
      })}
    </div>
  );
};
