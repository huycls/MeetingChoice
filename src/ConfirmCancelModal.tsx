import React from "react";
import { X, Trash2, AlertTriangle } from "lucide-react";
import { TimeSlot } from "../types/booking";

interface ConfirmCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  slot: TimeSlot | null;
}

export const ConfirmCancelModal: React.FC<ConfirmCancelModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  slot,
}) => {
  if (!isOpen || !slot) return null;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <h2 className="text-lg font-bold text-gray-900">
              Xác nhận Hủy lịch hẹn
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Bạn có chắc chắn muốn hủy lịch hẹn với{" "}
            <span className="font-bold">{slot.guestName}</span> vào lúc{" "}
            <span className="font-bold">
              {formatTime(slot.startTime)} ngày {formatDate(slot.date)}
            </span>
            ?
          </p>
          <p className="text-sm text-gray-600 mb-6">
            Hành động này sẽ làm cho khung giờ trở lại trạng thái "Có thể đặt".
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50">
              Không, giữ lại
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              <Trash2 className="w-4 h-4" />
              {isLoading ? "Đang hủy..." : "Có, hủy lịch"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
