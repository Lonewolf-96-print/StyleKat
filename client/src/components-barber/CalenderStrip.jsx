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

      {/* Calendar Header with Left + Right Arrows */}
      <div className="flex items-center space-x-2 relative">

        {/* 👈 LEFT ARROW */}
        <button
          onClick={() => setStartOffset((prev) => Math.max(prev - daysToShow, 0))}
          disabled={startOffset === 0} // disable when at today
          className={`p-2 rounded-full border transition ${
            startOffset === 0
              ? "opacity-40 cursor-not-allowed"
              : "bg-primary text-white hover:bg-primary/80"
          }`}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* DATE STRIP */}
        <div className="flex overflow-x-auto space-x-2.5 py-3 px-2 bg-muted rounded-xl scrollbar-hide w-full">
          {days.map((date) => {
            const formatted = format(date, "yyyy-MM-dd");
            const isSelected = selectedDate === formatted;
            const isBooked = bookingDates.includes(formatted);

            return (
              <button
                key={formatted}
                onClick={() => setSelectedDate(formatted)}
                className={`flex flex-col items-center justify-center w-14 py-2 rounded-xl transition-all duration-200 ${
                  isSelected
                    ? "bg-primary text-white"
                    : "bg-background border border-border hover:bg-accent"
                }`}
              >
                <span className="text-xs font-medium">{format(date, "EEE")}</span>
                <span className="text-lg font-semibold">{format(date, "d")}</span>

                {isBooked && (
                  <span
                    className={`mt-1 w-2 h-2 rounded-full ${
                      isSelected ? "bg-yellow-300" : "bg-green-500"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* 👉 RIGHT ARROW */}
        <button
          onClick={() => setStartOffset((prev) => prev + daysToShow)}
          className="p-2 rounded-full bg-primary text-white hover:bg-primary/80"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Booking Info Section */}
      <div className="relative space-y-4">
        {selectedDate && (
          <button
            onClick={() => setSelectedDate(null)}
            className="absolute -top-3 right-2 text-gray-500 hover:text-red-500 transition"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {!selectedDate ? (
          <p className="text-center text-muted-foreground">
            Select a date to view bookings
          </p>
        ) : displayedBookings.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No bookings on {format(new Date(selectedDate), "MMM dd, yyyy")}
          </p>
        ) : (
          displayedBookings.map((appointment) => (
            <Card key={appointment._id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">

                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {appointment.customerName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {appointment.customerName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {appointment.service}
                          </p>
                        </div>
                        <Badge className={statusColors[appointment.status]}>
                          {t(`appointmentsPage.status.${appointment.status}`)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {format(parseISO(appointment.date), "MMM dd, yyyy")}
                        </div>

                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          {appointment.time}
                        </div>

                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          {appointment.customerPhone}
                        </div>
                      </div>

                      <div className="text-sm">
                        <span className="text-muted-foreground">
                          {t("appointmentsPage.staff")}:{" "}
                        </span>
                        <span className="font-medium">
                          {appointment.staffName}
                        </span>

                        <span className="text-muted-foreground ml-4">
                          {t("appointmentsPage.price")}:{" "}
                        </span>
                        <span className="font-medium text-green-600">
                          ₹{appointment.price}
                        </span>
                      </div>

                    </div>
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
