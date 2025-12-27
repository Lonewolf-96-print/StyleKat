import { useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import { Card, CardContent } from "../components-barber/ui/card";
import { format, isSameDay, parseISO } from "date-fns";
import { Avatar, AvatarFallback } from "../components-barber/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Calendar, Clock, Phone, X, ChevronRight, ChevronLeft } from "lucide-react";
import { useLanguage } from "./language-provider";

export default function CalendarStrip({ allBookings = [], statusColors }) {
  const { t } = useLanguage();

  const [selectedDate, setSelectedDate] = useState(null);
  const [daysToShow, setDaysToShow] = useState(17);
  const [startOffset, setStartOffset] = useState(0); // 0 = starting at today

  // Responsive day count
  useEffect(() => {
    const resize = () => {
      if (window.innerWidth <= 768) setDaysToShow(6);
      else setDaysToShow(17);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Generate days from (today + startOffset)
  const days = useMemo(() => {
    const arr = [];
    for (let i = startOffset; i < startOffset + daysToShow; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, [startOffset, daysToShow]);

  const bookingDates = useMemo(
    () =>
      Array.from(
        new Set(allBookings.map((b) => format(parseISO(b.date), "yyyy-MM-dd")))
      ),
    [allBookings]
  );

  const displayedBookings = useMemo(() => {
    if (!selectedDate) return [];
    return allBookings.filter((b) =>
      isSameDay(parseISO(b.date), new Date(selectedDate))
    );
  }, [selectedDate, allBookings]);

  return (
    <div className="space-y-6 relative">

      {/* Calendar Header with Arrows */}
      <div className="flex items-center space-x-2 relative bg-white p-2 rounded-2xl shadow-sm border border-gray-100">

        {/* 👈 LEFT ARROW */}
        <button
          onClick={() => setStartOffset((prev) => Math.max(prev - daysToShow, 0))}
          disabled={startOffset === 0}
          className={`p-2 rounded-full transition shrink-0 ${startOffset === 0
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-600 hover:bg-gray-100"
            }`}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* DATE STRIP */}
        <div className="flex overflow-x-auto space-x-3 py-2 px-1 scrollbar-hide w-full items-center">
          {days.map((date) => {
            const formatted = format(date, "yyyy-MM-dd");
            const isSelected = selectedDate === formatted;
            const isBooked = bookingDates.includes(formatted);
            const isTodayDate = isSameDay(date, new Date());

            return (
              <button
                key={formatted}
                onClick={() => setSelectedDate(formatted)}
                className={`flex flex-col items-center justify-center min-w-[3.5rem] py-3 rounded-2xl transition-all duration-300 border ${isSelected
                    ? "bg-gray-900 text-white border-gray-900 shadow-lg scale-105"
                    : isTodayDate
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-white text-gray-500 border-transparent hover:bg-gray-50"
                  }`}
              >
                <span className="text-[10px] uppercase font-bold tracking-wider mb-1">{format(date, "EEE")}</span>
                <span className={`text-lg font-bold ${isSelected ? "text-white" : "text-gray-900"}`}>{format(date, "d")}</span>

                {/* Dot Indicator */}
                <div className={`mt-1.5 w-1.5 h-1.5 rounded-full transition-colors ${isBooked
                    ? (isSelected ? "bg-white" : "bg-green-500")
                    : "bg-transparent"
                  }`} />
              </button>
            );
          })}
        </div>

        {/* 👉 RIGHT ARROW */}
        <button
          onClick={() => setStartOffset((prev) => prev + daysToShow)}
          className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition shrink-0"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Booking Info Section */}
      <div className="relative space-y-4">
        {selectedDate && (
          <div className="flex justify-between items-center mb-4 px-1">
            <h3 className="text-lg font-bold text-gray-800">
              Bookings for {format(new Date(selectedDate), "MMM dd")}
            </h3>
            <button
              onClick={() => setSelectedDate(null)}
              className="p-2 bg-gray-100 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {!selectedDate ? (
          <div className="flex flex-col items-center justify-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            <Calendar className="h-10 w-10 text-gray-300 mb-3" />
            <p className="text-muted-foreground font-medium">Select a date to view bookings</p>
          </div>
        ) : displayedBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            <Clock className="h-10 w-10 text-gray-300 mb-3" />
            <p className="text-center text-muted-foreground">
              No bookings on <span className="font-semibold text-gray-700">{format(new Date(selectedDate), "MMM dd, yyyy")}</span>
            </p>
          </div>
        ) : (
          displayedBookings.map((appointment) => (
            <Card key={appointment._id} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 ring-1 ring-gray-100">
              <div className={`h-1.5 w-full ${appointment.status === 'confirmed' ? 'bg-green-500' :
                  appointment.status === 'pending' ? 'bg-yellow-500' :
                    appointment.status === 'cancelled' ? 'bg-red-500' :
                      'bg-blue-500'
                }`} />
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  {/* Avatar & Name */}
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm ring-1 ring-gray-100">
                      <AvatarFallback className="bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 font-bold">
                        {appointment.customerName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <h4 className="font-bold text-gray-900 text-lg leading-tight">{appointment.customerName}</h4>
                      <p className="text-sm text-gray-500 font-medium">{appointment.service}</p>
                    </div>
                  </div>

                  <Badge className={`${statusColors[appointment.status] || "bg-gray-100 text-gray-700"} uppercase tracking-wide px-2.5 py-1 text-[10px] font-bold shadow-sm border-0`}>
                    {t(`appointmentsPage.status.${appointment.status}`) || appointment.status}
                  </Badge>
                </div>

                {/* Details Grid */}
                <div className="mt-5 grid grid-cols-2 gap-4 bg-gray-50/80 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="font-semibold text-gray-900">{appointment.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4 text-green-500" />
                    <span>{appointment.customerPhone || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 col-span-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase">Staff</span>
                    <span className="font-medium text-gray-900">{appointment.staffName || "Any Staff"}</span>
                  </div>
                  <div className="flex items-center justify-between col-span-2 border-t border-gray-200 pt-3 mt-1">
                    <span className="text-xs font-bold text-gray-400 uppercase">Total Price</span>
                    <span className="text-lg font-bold text-green-600">₹{appointment.price}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
