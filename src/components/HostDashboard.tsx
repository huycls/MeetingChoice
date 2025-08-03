import React, { useState, useMemo } from "react";
import { TimeSlot, AvailableSlot } from "../types/booking";
import {
  Plus,
  Clock,
  Trash2,
  Calendar,
  Users,
  CheckCircle,
  Link,
  Copy,
  Download,
} from "lucide-react";
import { Session } from "@supabase/supabase-js";

interface HostDashboardProps {
  slots: TimeSlot[];
  loading: boolean;
  onCreateSlots: (slots: AvailableSlot[]) => void;
  onDeleteSlot: (slotId: string) => void;
  onCancelBooking: (slot: TimeSlot) => void;
  session: Session | null;
  onConnectGoogleCalendar: () => void;
  setToast: (
    toast: { message: string; type: "success" | "error" } | null
  ) => void;
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
  onCancelBooking,
  session,
  onConnectGoogleCalendar,
  setToast,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newSlotData, setNewSlotData] = useState({
    date: "",
    startTime: "",
    endTime: "",
  });
  const [selectedAvailableDate, setSelectedAvailableDate] = useState("all");
  const [timeForEachMeeting, setTimeForEachMeeting] = useState(30);

  const publicLink = `${window.location.origin}/?host=${session?.user?.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicLink);
    setToast({ message: "Đã sao chép liên kết!", type: "success" });
  };

  const isGoogleCalendarConnected =
    session?.provider_token &&
    session?.user?.app_metadata?.provider === "google";

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
      for (let minute = 0; minute < 60; minute += timeForEachMeeting) {
        const startHour = hour;
        const startMinute = minute;
        const endMinute = minute + timeForEachMeeting;
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

  const handleExportToCsv = () => {
    if (bookedSlots.length === 0) {
      alert("Không có lịch hẹn nào đã được đặt để xuất file.");
      return;
    }

    const headers = [
      "Subject",
      "Start Date",
      "Start Time",
      "End Date",
      "End Time",
      "All Day Event",
      "Description",
      "Location",
      "Private",
    ];

    const formatCsvDate = (dateStr: string) => {
      const date = new Date(dateStr);
      const month = (date.getMonth() + 1).toString();
      const day = date.getDate().toString();
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    };

    const formatCsvTime = (timeStr: string) => {
      return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    };

    const escapeCsvField = (field: string | null | undefined) => {
      const stringField = String(field || "");
      if (/[",\n]/.test(stringField)) {
        return `"${stringField.replace(/"/g, '""')}"`;
      }
      return stringField;
    };

    const rows = bookedSlots.map((slot) => {
      const subject = `Cuộc họp với ${slot.guestName || "khách"}`;
      const startDate = formatCsvDate(slot.date);
      const startTime = formatCsvTime(slot.startTime);
      const endDate = formatCsvDate(slot.date);
      const endTime = formatCsvTime(slot.endTime);
      const allDayEvent = "False";
      const description = slot.guestNote || "";
      const location = ""; // Dữ liệu vị trí không có sẵn
      const isPrivate = "False";

      return [
        subject,
        startDate,
        startTime,
        endDate,
        endTime,
        allDayEvent,
        description,
        location,
        isPrivate,
      ]
        .map(escapeCsvField)
        .join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "google_calendar_import.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const bookedSlots = slots.filter((slot) => slot.isBooked);
  // const availableSlots = slots.filter(
  //   (slot) => slot.isAvailable && !slot.isBooked
  // );

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Chia sẻ trang đặt lịch của bạn
        </h2>
        <p className="text-sm text-gray-600 mb-3">
          Đây là liên kết công khai đến trang đặt lịch của bạn. Bất kỳ ai có
          liên kết này đều có thể xem các khung giờ trống và đặt lịch hẹn.
        </p>
        <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg border border-gray-200">
          <Link className="w-5 h-5 text-gray-500 ml-2 flex-shrink-0" />
          <input
            type="text"
            readOnly
            value={publicLink}
            className="w-full bg-transparent border-none focus:ring-0 text-gray-700"
          />
          <button
            onClick={handleCopyLink}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
            <Copy className="w-4 h-4" />
            Sao chép
          </button>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Quản lý lịch họp
        </h2>

        {/* <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-2">
            Tích hợp Google Calendar
          </h3>
          {isGoogleCalendarConnected ? (
            <div className="flex items-center gap-3 p-3 bg-green-100 border border-green-200 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-medium text-green-800">
                  Đã kết nối với Google Calendar
                </p>
                <p className="text-sm text-green-700">
                  Lời mời sẽ được tự động gửi khi có lịch đặt mới.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Kết nối với Google Calendar để tự động tạo sự kiện và gửi lời
                mời cho khách hàng.
              </p>
              <button
                onClick={onConnectGoogleCalendar}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                <Link className="w-4 h-4" />
                Kết nối ngay
              </button>
            </div>
          )}
        </div> */}

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
            <div className="my-4 flex flex-col">
              <p className="mb-2">Thời gian cho mỗi cuộc họp:</p>
              <select
                value={timeForEachMeeting}
                onChange={(e) =>
                  setTimeForEachMeeting(parseInt(e.target.value))
                }
                className="px-3 py-2 border border-gray-3 w-fit rounded-lg focus:ring-2">
                <option value="15">15 phút</option>
                <option value="30">30 phút</option>
                <option value="45">45 phút</option>
                <option value="60">1 giờ</option>
              </select>
              <small className="text-slate-500 mt-2">
                <span className="">Lưu ý:</span> thời gian ở đây chỉ dành cho
                Tạo slot hàng loạt
              </small>
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
                onClick={generateTimeSlots}
                disabled={!newSlotData.date}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <Clock className="w-4 h-4" />
                Tạo slots hàng loạt
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
          <div className="flex lg:flex-row flex-col justify-between gap-4 items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Lịch đã được đặt
            </h3>{" "}
            <button
              onClick={handleExportToCsv}
              disabled={bookedSlots.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <Download className="w-4 h-4" />
              Xuất lịch đã đặt (.csv)
            </button>
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
            <div className="space-y-3">
              {bookedSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex flex-col relative sm:flex-row items-start sm:items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200 gap-3">
                  <div className="flex-grow">
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
                  <button
                    onClick={() => onCancelBooking(slot)}
                    className="flex-shrink-0 absolute right-4 top-4 flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium self-end sm:self-center">
                    <Trash2 className="w-4 h-4" />
                    Hủy lịch
                  </button>
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
