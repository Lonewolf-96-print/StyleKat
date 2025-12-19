"use client";

import { useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimeClock } from "@mui/x-date-pickers/TimeClock";
import { Button } from "@mui/material";
import toast from "react-hot-toast";
import MobileTimePicker from "./MobileTimePicker";

dayjs.extend(customParseFormat);

export default function CustomTimeClock({
  onChange,
  blockedTimes = [],
  selectedDate,
  initialValue = null,
  serviceDuration = 30, // Default 30 min if not provided
}) {
  const [value, setValue] = useState(initialValue ? dayjs(initialValue) : null);
  const [ampmMode, setAmpmMode] = useState("AM"); // For DESKTOP MUI Clock only
  const [clockKey, setClockKey] = useState(Date.now());

  // Initialize value if not set, so Mobile Picker has something to show (default 12:00 PM)
  useEffect(() => {
    if (!value) {
      // Default to 12:00 PM today (date doesn't matter for time picker usually, but we need dayjs obj)
      const def = dayjs().set('hour', 12).set('minute', 0);
      setValue(def);
      // Don't trigger onChange yet unless you want to default select
    }
  }, []);

  // Sync internal value with initialValue prop if it changes
  useEffect(() => {
    if (initialValue) {
      setValue(dayjs(initialValue));
    }
  }, [initialValue]);


  // ---------- BLOCKED LOGIC ----------
  const parseBlocked = (timeValue) => {
    if (!selectedDate || !timeValue) return false;

    const duration = Number(serviceDuration) || 30;
    const newStart = timeValue;
    const newEnd = timeValue.add(duration, "minute");

    return blockedTimes.some((block) => {
      // Existing Block Range
      const blockStart = dayjs(`${selectedDate} ${block.startTime}`, ["YYYY-MM-DD HH:mm", "YYYY-MM-DD hh:mm A"]);
      const blockEnd = dayjs(`${selectedDate} ${block.endTime}`, ["YYYY-MM-DD HH:mm", "YYYY-MM-DD hh:mm A"]);

      // OVERLAP LOGIC: (StartA < EndB) && (EndA > StartB)
      return (
        newStart.isBefore(blockEnd) &&
        newEnd.isAfter(blockStart)
      );
    });
  };

  // ---------- DESKTOP HELPERS (AM/PM toggle) ----------
  const applyAmpmToDayjs = (d, targetMode) => {
    if (!d) return d;
    let hour = d.hour();
    if (targetMode === "PM" && hour < 12) return d.hour(hour + 12);
    if (targetMode === "AM" && hour >= 12) return d.hour(hour - 12);
    return d;
  };
  const autoDetectAMPM = (hour, prev) => {
    if (hour >= 12 && prev !== "PM") return "PM";
    if (hour <= 7 && prev !== "AM") return "AM";
    return prev;
  };

  // ---------- HANDLERS ----------
  const handleTimeChange = (newValue) => {
    if (!newValue) {
      setValue(null);
      onChange?.(null);
      return;
    }

    if (parseBlocked(newValue)) {
      toast.error("⛔ This time is already booked!");
      return; // Don't update state
    }

    setValue(newValue);
    onChange?.(newValue);

    // Auto-detect AM/PM for desktop UI consistency
    const hour = newValue.hour();
    const detected = autoDetectAMPM(hour, ampmMode);
    if (detected !== ampmMode) setAmpmMode(detected);
  };

  // Desktop specific wrapper to handle AM/PM toggle logic
  const handleDesktopTimeChange = (newValue) => {
    if (!newValue) return;
    // Apply Desktop AM/PM toggle state
    const adjusted = applyAmpmToDayjs(newValue, ampmMode);
    handleTimeChange(adjusted);
  };

  // Update desktop value when AM/PM button is clicked
  useEffect(() => {
    if (!value) return;
    const adjusted = applyAmpmToDayjs(value, ampmMode);
    if (adjusted.hour() !== value.hour()) {
      handleTimeChange(adjusted);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ampmMode]);


  const handleClear = () => {
    setValue(null);
    onChange?.(null);
    setClockKey(Date.now());
  };

  return (
    <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl shadow border border-white/20 w-full max-w-sm mx-auto">

      {/* 
         MOBILE VIEW (Visible on < md) 
         We use `display: none` technique via Tailwind classes to toggle visibility 
         instead of conditional rendering to ensure hydration matches if needed, 
         or just standard responsive classes.
      */}
      <div className="block md:hidden">
        <div className="text-center mb-4">
          <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Select Time</span>
        </div>
        <MobileTimePicker
          value={value || dayjs().set('hour', 12).set('minute', 0)}
          onChange={handleTimeChange}
        />
      </div>

      {/* 
         DESKTOP VIEW (Visible on >= md) 
         Restoring the MUI TimeClock logic
      */}
      <div className="hidden md:block">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <div className="flex justify-center gap-3 mb-2">
            <Button
              variant={ampmMode === "AM" ? "contained" : "outlined"}
              onClick={() => setAmpmMode("AM")}
              size="small"
            >
              AM
            </Button>

            <Button
              variant={ampmMode === "PM" ? "contained" : "outlined"}
              onClick={() => setAmpmMode("PM")}
              size="small"
            >
              PM
            </Button>
          </div>

          <TimeClock
            key={clockKey}
            ampm={false} // manually handled
            value={value}
            onChange={handleDesktopTimeChange}
            minutesStep={5}
            shouldDisableTime={(timeValue) => {
              if (!selectedDate || !timeValue) return false;
              let merged = dayjs(`${selectedDate} ${timeValue.format("HH:mm")}`, "YYYY-MM-DD HH:mm");
              merged = applyAmpmToDayjs(merged, ampmMode);
              return parseBlocked(merged);
            }}
          />
        </LocalizationProvider>
      </div>

      <div className="flex gap-2 mt-4">
        <Button variant="outlined" color="error" fullWidth onClick={handleClear}>
          Clear Time
        </Button>
      </div>

      <p className="text-sm text-center text-gray-700 mt-2">
        Selected:{" "}
        <span className="font-semibold text-blue-700 text-lg">
          {value ? value.format("hh:mm A") : "--:--"}
        </span>
      </p>
    </div>
  );
}

