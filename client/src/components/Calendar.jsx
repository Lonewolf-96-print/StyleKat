"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CalendarDate({ onChange }) {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(null);

  const startOfMonth = currentMonth.startOf("month");
  const daysInMonth = currentMonth.daysInMonth();
  const firstDayOfWeek = startOfMonth.day();

  const days = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => startOfMonth.add(i, "day"))
  ];

  const handleSelect = (date) => {
    setSelectedDate(date);
    onChange && onChange(date);
  };

  return (
    <div className="w-full max-w-[320px] md:max-w-sm mx-auto rounded-xl border shadow-sm p-3 md:p-4 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setCurrentMonth(currentMonth.subtract(1, "month"))}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ChevronLeft size={20} />
        </button>

        <h2 className="text-lg font-semibold">
          {currentMonth.format("MMMM YYYY")}
        </h2>

        <button
          onClick={() => setCurrentMonth(currentMonth.add(1, "month"))}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Week Row */}
      <div className="grid grid-cols-7 text-center text-sm text-gray-600 mb-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="font-medium">{d}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (!day) return <div key={index} className="p-2"></div>;

          const isToday = day.isSame(dayjs(), "day");
          const isSelected = selectedDate && day.isSame(selectedDate, "day");

          return (
            <div
              key={index}
              onClick={() => handleSelect(day)}
              className={`
                
                p-2 text-center rounded-lg cursor-pointer transition text-sm md:text-base
                ${isSelected ? "bg-blue-600 text-white" : ""}
                ${!isSelected && isToday ? "ring-1 ring-blue-500" : ""}
                hover:bg-blue-50
              `}
            >
              {day.date()}
            </div>
          );
        })}
      </div>

      {/* Selected Date */}
      <div className="mt-4 text-sm text-gray-700">
        <strong>Selected Date:</strong>{" "}
        {selectedDate ? selectedDate.format("DD MMM YYYY") : "—"}
      </div>
    </div>
  );
}
