import React, { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { CalendarNavigation } from "./components/CalendarNavigation";
import { TimeSlotGrid } from "./components/TimeSlotGrid";
import { BookingModal } from "./components/BookingModal";
import { HostDashboard } from "./components/HostDashboard";
import { NotificationToast } from "./NotificationToast";
import { ConfirmLogoutModal } from "./ConfirmLogoutModal";
import { Login } from "./Login";
import { TimeSlot, BookingRequest, AvailableSlot } from "./types/booking";
import { bookingService, supabase } from "./services/supabase";
// import { calendarService } from "./services/googleCalendar";
import { Calendar, Users, Settings, LogOut } from "lucide-react";

function App() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [currentView, setCurrentView] = useState<"guest" | "host">("guest");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const fetchInitialSlots = async () => {
      setLoading(true);
      try {
        const initialSlots = await bookingService.getTimeSlots();
        setSlots(initialSlots);
      } catch (error) {
        console.error("Error fetching initial slots:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialSlots();

    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setCurrentView("guest");
      }
    });

    const slotsSubscription = bookingService.subscribeToSlotChanges(
      (updatedSlots) => {
        setSlots(updatedSlots);
      }
    );

    return () => {
      authSubscription.unsubscribe();
      slotsSubscription.unsubscribe();
    };
  }, [refresh]);

  const handleSlotClick = async (slot: TimeSlot) => {
    if (currentView === "host" || slot.isBooked || !slot.isAvailable) return;

    setSelectedSlot(slot);
    setIsModalOpen(true);
  };

  const handleBookingConfirm = async (bookingData: {
    guestName: string;
    guestEmail: string;
    guestNote?: string;
  }) => {
    if (!selectedSlot) return;

    setIsBooking(true);
    try {
      await bookingService.bookTimeSlot(selectedSlot.id, bookingData);

      // Send calendar invite
      // await calendarService.sendMeetingInvite(
      //   bookingData.guestEmail,
      //   bookingData.guestName,
      //   "host@company.com",
      //   selectedSlot.date,
      //   selectedSlot.startTime,
      //   selectedSlot.endTime,
      //   bookingData.guestNote
      // );

      setIsModalOpen(false);
      setSelectedSlot(null);
      setToast({ message: "Đặt lịch thành công!", type: "success" });
    } catch (error) {
      console.error("Booking failed:", error);
      setToast({
        message: "Đặt lịch thất bại. Vui lòng thử lại.",
        type: "error",
      });
    } finally {
      setIsBooking(false);
    }
  };

  const handleCreateSlots = async (newSlots: AvailableSlot[]) => {
    try {
      await bookingService.createTimeSlots(newSlots);
      setRefresh(Math.random());
      setToast({ message: "Tạo slot thành công!", type: "success" });
    } catch (error) {
      console.error("Failed to create slots:", error);
      setToast({
        message: "Tạo slot thất bại. Vui lòng thử lại.",
        type: "error",
      });
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    await bookingService.deleteTimeSlot(slotId);

    setSlots((prevSlots) => prevSlots.filter((slot) => slot.id !== slotId));
  };

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // onAuthStateChange listener will handle the rest
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Đăng xuất thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
    }
  };

  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
  //         <p className="text-gray-600">Đang tải dữ liệu...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && (
        <NotificationToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">
                Hệ thống đặt lịch họp
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setCurrentView("guest")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === "guest"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}>
                  <Users className="w-4 h-4" />
                  Khách
                </button>
                <button
                  onClick={() => setCurrentView("host")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === "host"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}>
                  <Settings className="w-4 h-4" />
                  Quản lý
                </button>
                {session && (
                  <button
                    onClick={handleLogoutClick}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === "guest" ? (
          <div className="space-y-6">
            <CalendarNavigation
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Chọn khung giờ phù hợp
              </h2>
              {loading ? (
                <>
                  <div className="flex items-center justify-center gap-2 text-[#2880c3]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#2880c3"
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
                <TimeSlotGrid
                  slots={slots}
                  selectedDate={selectedDate}
                  onSlotClick={handleSlotClick}
                />
              )}
            </div>
          </div>
        ) : session ? (
          <HostDashboard
            slots={slots}
            loading={loading}
            onCreateSlots={handleCreateSlots}
            onDeleteSlot={handleDeleteSlot}
          />
        ) : (
          <Login onLoginSuccess={() => {}} />
        )}
      </main>

      <BookingModal
        slot={selectedSlot}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSlot(null);
        }}
        onConfirm={handleBookingConfirm}
        isLoading={isBooking}
      />

      <ConfirmLogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        isLoading={isLoggingOut}
      />
    </div>
  );
}

export default App;
