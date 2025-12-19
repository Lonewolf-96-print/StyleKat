"use client";

import { useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Button } from "../components/ui/button"; // using shadcn button if available, or fallback
import { cn } from "../lib/utils"; // assuming shadcn utils exist, otherwise we'll inline logic
import { Moon, Sun, Sunset } from "lucide-react";

dayjs.extend(customParseFormat);

export default function CustomTimeClock({
  onChange,
  blockedTimes = [],
  selectedDate,
  initialValue = null,
  serviceDuration = 30,
}) {
  const [selectedTime, setSelectedTime] = useState(initialValue ? dayjs(initialValue) : null);

  // Default Shop Hours: 9:00 AM to 9:00 PM (Configurable if needed)
  const SHOP_START_HOUR = 9;
  const SHOP_END_HOUR = 21; // 9 PM

  // Helper: Check if a specific time slot is blocked
  const isBlocked = (slotTime) => {
    if (!selectedDate || !slotTime) return false;

    const duration = Number(serviceDuration) || 30;
    const newStart = slotTime;
    const newEnd = slotTime.add(duration, "minute");

    return blockedTimes.some((block) => {
      const blockStart = dayjs(`${selectedDate} ${block.startTime}`, ["YYYY-MM-DD HH:mm", "YYYY-MM-DD hh:mm A"]);
      const blockEnd = dayjs(`${selectedDate} ${block.endTime}`, ["YYYY-MM-DD HH:mm", "YYYY-MM-DD hh:mm A"]);

      return (
        newStart.isBefore(blockEnd) &&
        newEnd.isAfter(blockStart)
      );
    });
  };

  // Generate Slots
  const timeSlots = useMemo(() => {
    const slots = [];
    let current = dayjs().set("hour", SHOP_START_HOUR).set("minute", 0).set("second", 0);
    const end = dayjs().set("hour", SHOP_END_HOUR).set("minute", 0).set("second", 0);

    while (current.isBefore(end)) {
      slots.push(current);
      current = current.add(30, "minute"); // 30 min intervals
    }
    return slots;
  }, []);

  // Sections
  const sections = [
    { label: "Morning", icon: Sun, filter: (t) => t.hour() < 12 },
    { label: "Afternoon", icon: Sun, filter: (t) => t.hour() >= 12 && t.hour() < 17 }, // 12pm - 5pm
    { label: "Evening", icon: Moon, filter: (t) => t.hour() >= 17 },
  ];

  const handleTimeSelect = (time) => {
    if (isBlocked(time)) return;
    setSelectedTime(time);
    onChange?.(time);
  };

  return (
    <div className="w-full bg-white/50 backdrop-blur-sm p-4 rounded-xl shadow border border-white/20">
      <div className="flex flex-col space-y-4">

        {/* Selected Time Display */}
        <div className="flex justify-between items-center bg-white/60 p-3 rounded-lg">
          <span className="text-sm font-medium text-gray-600">Selected Time</span>
          <span className="text-lg font-bold text-blue-700">
            {selectedTime ? selectedTime.format("hh:mm A") : "-- : --"}
          </span>
        </div>

        <div className="h-[300px] overflow-y-auto custom-scroll pr-2 space-y-6">
          {sections.map(({ label, icon: Icon, filter }) => {
            const sectionSlots = timeSlots.filter(filter);
            if (sectionSlots.length === 0) return null;

            return (
              <div key={label}>
                <div className="flex items-center gap-2 mb-2 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                  <Icon size={14} />
                  {label}
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {sectionSlots.map((slot, idx) => {
                    const blocked = isBlocked(slot);
                    const isSelected = selectedTime && slot.format("HH:mm") === selectedTime.format("HH:mm");

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleTimeSelect(slot)}
                        disabled={blocked}
                        className={cn(
                          "px-2 py-2 text-sm font-medium rounded-lg transition-all border",
                          isSelected
                            ? "bg-blue-600 text-white border-blue-600 shadow-md scale-105"
                            : "bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:bg-blue-50",
                          blocked && "opacity-40 cursor-not-allowed bg-gray-100 text-gray-400 border-transparent hover:bg-gray-100"
                        )}
                      >
                        {slot.format("h:mm A")}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-gray-500 justify-center pt-2 border-t border-gray-200/50">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-white border border-gray-300"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-600"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-gray-200 opacity-50"></div>
            <span>Booked</span>
          </div>
        </div>

      </div>
    </div>
  );
}



