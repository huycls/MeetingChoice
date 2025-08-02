import React from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface CalendarNavigationProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export const CalendarNavigation: React.FC<CalendarNavigationProps> = ({
  selectedDate,
  onDateChange,
}) => {
  const currentDate = new Date(selectedDate);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
    onDateChange(newDate.toISOString().split("T")[0]);
  };

  const goToToday = () => {
    const today = new Date();
    onDateChange(today.toISOString().split("T")[0]);
  };

  const isToday = () => {
    const today = new Date();
    return currentDate.toDateString() === today.toDateString();
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <button
        onClick={() => navigateDate("prev")}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="flex items-center gap-2 justify-center">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              {formatDate(currentDate)}
            </h2>
          </div>
        </div>

        {isToday() && (
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors">
            Hôm nay
          </button>
        )}
      </div>

      <button
        onClick={() => navigateDate("next")}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};
