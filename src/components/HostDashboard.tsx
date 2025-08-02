import React, { useState, useMemo } from "react";
import { TimeSlot, AvailableSlot } from "../types/booking";
import { Plus, Clock, Trash2, Calendar, Users } from "lucide-react";

interface HostDashboardProps {
  slots: TimeSlot[];
  loading: boolean;
  onCreateSlots: (slots: AvailableSlot[]) => void;
  onDeleteSlot: (slotId: string) => void;
}

function getHourNumber(timeString: string): number {
  const [hourString] = timeString.split(":");

  if (!hourString) {
    throw new Error('Invalid time format. Expected "HH:mm:ss"');
  }

  let hour = parseInt(hourString, 10);

  if (isNaN(hour) || hour < 0 || hour > 23) {
    throw new Error("Invalid hour value. Expected a number from 0 to 23");
  }

  return hour;
}

export const HostDashboard: React.FC<HostDashboardProps> = ({
  slots,
  loading,
  onCreateSlots,
  onDeleteSlot,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newSlotData, setNewSlotData] = useState({
    date: "",
    startTime: "",
    endTime: "",
  });
  const [selectedAvailableDate, setSelectedAvailableDate] = useState("all");

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const availableSlots = slots.filter(
    (slot) => slot.isAvailable && !slot.isBooked
  );

  const availableDates = useMemo(
    () =>
      [...new Set(availableSlots.map((slot) => slot.date))].sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime()
      ),
    [availableSlots]
  );

  const filteredAvailableSlots = useMemo(
    () =>
      selectedAvailableDate === "all"
        ? availableSlots
        : availableSlots.filter((slot) => slot.date === selectedAvailableDate),
    [availableSlots, selectedAvailableDate]
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const handleCreateSlot = () => {
    if (newSlotData.date && newSlotData.startTime && newSlotData.endTime) {
      onCreateSlots([
        {
          date: newSlotData.date,
          startTime: newSlotData.startTime,
          endTime: newSlotData.endTime,
        },
      ]);
      setNewSlotData({ date: "", startTime: "", endTime: "" });
      setIsCreating(false);
    }
  };

  const generateTimeSlots = () => {
    if (!newSlotData.date) return;

    const slotsToCreate: AvailableSlot[] = [];

    let workStart = 9; // 9:00 AM default
    let workEnd = 17; // 5:00 PM default

    if (newSlotData.startTime && newSlotData.endTime) {
      try {
        workStart = getHourNumber(newSlotData.startTime);
        workEnd = getHourNumber(newSlotData.endTime);
      } catch (error) {
        console.error("Invalid time input, using default hours:", error);
      }
    }

    for (let hour = workStart; hour < workEnd; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const startHour = hour;
        const startMinute = minute;
        const endMinute = minute + 30;
        const endHour = endMinute >= 60 ? hour + 1 : hour;
        const adjustedEndMinute = endMinute >= 60 ? 0 : endMinute;

        if (endHour <= workEnd) {
          slotsToCreate.push({
            date: newSlotData.date,
            startTime: `${startHour.toString().padStart(2, "0")}:${startMinute
              .toString()
              .padStart(2, "0")}:00`,
            endTime: `${endHour.toString().padStart(2, "0")}:${adjustedEndMinute
              .toString()
              .padStart(2, "0")}:00`,
          });
        }
      }
    }

    onCreateSlots(slotsToCreate);
    setNewSlotData({ date: "", startTime: "", endTime: "" });
  };

  const bookedSlots = slots.filter((slot) => slot.isBooked);
  // const availableSlots = slots.filter(
  //   (slot) => slot.isAvailable && !slot.isBooked
  // );

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Quản lý lịch họp
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Tổng slots
              </span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              {slots.length}
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Còn trống
              </span>
            </div>
            <p className="text-2xl font-bold text-green-900 mt-1">
              {availableSlots.length}
            </p>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">
                Đã đặt
              </span>
            </div>
            <p className="text-2xl font-bold text-orange-900 mt-1">
              {bookedSlots.length}
            </p>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Tạo slot mới
          </button>

          <button
            onClick={generateTimeSlots}
            disabled={!newSlotData.date}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <Clock className="w-4 h-4" />
            Tạo slots cả ngày
          </button>
        </div>

        {isCreating && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-medium text-gray-900 mb-3">
              Tạo slot thời gian mới
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày
                </label>
                <input
                  type="date"
                  value={newSlotData.date}
                  onChange={(e) =>
                    setNewSlotData((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giờ bắt đầu
                </label>
                <input
                  type="time"
                  value={newSlotData.startTime}
                  onChange={(e) =>
                    setNewSlotData((prev) => ({
                      ...prev,
                      startTime: e.target.value + ":00",
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giờ kết thúc
                </label>
                <input
                  type="time"
                  value={newSlotData.endTime}
                  onChange={(e) =>
                    setNewSlotData((prev) => ({
                      ...prev,
                      endTime: e.target.value + ":00",
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleCreateSlot}
                disabled={
                  !newSlotData.date ||
                  !newSlotData.startTime ||
                  !newSlotData.endTime
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Tạo slot
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors">
                Hủy
              </button>
            </div>
          </div>
        )}
      </div>

      {bookedSlots.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Lịch đã được đặt
          </h3>
          {loading ? (
            <>
              <div className="flex items-center justify-center gap-2 text-[#1e40af]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1e40af"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  className="animate-spin lucide lucide-loader-circle-icon lucide-loader-circle">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Đang tải...
              </div>
            </>
          ) : (
            <div className="space-y-3">
              {bookedSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div>
                    <div className="flex items-center gap-4">
                      <span className="font-medium text-orange-900">
                        {formatDate(slot.date)} • {formatTime(slot.startTime)} -{" "}
                        {formatTime(slot.endTime)}
                      </span>
                      <span className="px-2 py-1 bg-orange-200 text-orange-800 text-xs rounded-full">
                        Đã đặt
                      </span>
                    </div>
                    <p className="text-sm text-orange-700 mt-1">
                      {slot.guestName} ({slot.guestEmail})
                    </p>
                    {slot.guestNote && (
                      <p className="text-sm text-gray-600 mt-1 italic">
                        "{slot.guestNote}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {availableSlots.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          {/* <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Slots có sẵn
          </h3> */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Slots có sẵn
            </h3>
            <select
              value={selectedAvailableDate}
              onChange={(e) => setSelectedAvailableDate(e.target.value)}
              disabled={availableDates.length <= 1}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed">
              <option value="all">Tất cả các ngày</option>
              {availableDates.map((date) => (
                <option key={date} value={date}>
                  {formatDate(date)}
                </option>
              ))}
            </select>
          </div>
          {loading ? (
            <>
              <div className="flex items-center justify-center gap-2 text-[#1e40af]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1e40af"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  className="animate-spin lucide lucide-loader-circle-icon lucide-loader-circle">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Đang tải...
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredAvailableSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-sm font-medium text-green-900">
                    {formatDate(slot.date)} • {formatTime(slot.startTime)} -{" "}
                    {formatTime(slot.endTime)}
                  </span>
                  <button
                    onClick={() => onDeleteSlot(slot.id)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
