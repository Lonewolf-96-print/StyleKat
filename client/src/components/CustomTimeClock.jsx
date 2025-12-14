"use client";

import { useState, useEffect } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimeClock } from "@mui/x-date-pickers/TimeClock";
import { Button } from "@mui/material";
import toast from "react-hot-toast";
export default function CustomTimeClock({
  onChange,
  blockedTimes = [],
  selectedDate,
  initialValue = null,
  serviceDuration = 30, // Default 30 min if not provided
}) {

  // DEBUG: Check what we receive
  useEffect(() => {
    console.log("⏰ CustomTimeClock Props:", {
      blockedTimesCount: blockedTimes.length,
      blockedTimes,
      selectedDate,
      serviceDuration
    });
  }, [blockedTimes, selectedDate, serviceDuration]);

  const [value, setValue] = useState(initialValue ? dayjs(initialValue) : null);
  const [ampmMode, setAmpmMode] = useState("AM"); // "AM" or "PM"
  const [clockKey, setClockKey] = useState(Date.now()); // use to force full re-render when needed

  // ---------- helpers ----------
  // ---------- helpers ----------
  const parseBlocked = (timeValue) => {
    if (!selectedDate || !timeValue) return false;

    // Proposed New Booking Range
    // Start: timeValue
    // End: timeValue + serviceDuration
    // format: dayjs objects
    const duration = Number(serviceDuration) || 30;
    const newStart = timeValue;
    const newEnd = timeValue.add(duration, "minute");

    return blockedTimes.some((block) => {
      // Existing Block Range
      const blockStart = dayjs(`${selectedDate} ${block.startTime}`, ["YYYY-MM-DD HH:mm", "YYYY-MM-DD hh:mm A"]);
      const blockEnd = dayjs(`${selectedDate} ${block.endTime}`, ["YYYY-MM-DD HH:mm", "YYYY-MM-DD hh:mm A"]);

      // OVERLAP LOGIC: (StartA < EndB) && (EndA > StartB)
      // Using minute precision to be safe
      return (
        newStart.isBefore(blockEnd) &&
        newEnd.isAfter(blockStart)
      );
    });
  };

  // Normalize a dayjs (which comes from TimeClock) using the current ampmMode.
  // Returns a new dayjs instance that's adjusted to AM/PM.
  const applyAmpmToDayjs = (d, targetMode) => {
    if (!d) return d;
    let hour = d.hour();

    // If target is PM and hour < 12 -> add 12 (1pm becomes 13)
    if (targetMode === "PM" && hour < 12) {
      // special-case: if hour === 0 (midnight), make 12 AM -> 12 PM? but TimeClock in 24h gives 0..23
      // So simply add 12 for <12
      return d.hour(hour + 12);
    }

    // If target is AM and hour >= 12 -> subtract 12 (13 -> 1 AM, 12 -> 0)
    if (targetMode === "AM" && hour >= 12) {
      return d.hour(hour - 12);
    }

    return d;
  };

  // Auto-detect AM/PM heuristic (keeps your existing idea)
  const autoDetectAMPM = (hour, prev) => {
    if (hour >= 12 && prev !== "PM") return "PM";
    if (hour <= 7 && prev !== "AM") return "AM";
    return prev;
  };

  // ----------------- handle TimeClock selection -----------------
  const handleTimeChange = (newValue) => {
    if (!newValue) {
      setValue(null);
      onChange?.(null);
      return;
    }

    // newValue is a Dayjs object; check blocks using selectedDate + newValue
    if (parseBlocked(newValue)) {
      toast.error("⛔ This time is already booked!");
      return;
    }

    // run auto-detect (doesn't override user explicit mode, but helps)
    const hour = newValue.hour();
    const detected = autoDetectAMPM(hour, ampmMode);
    if (detected !== ampmMode) {
      setAmpmMode(detected);
      // optional toast letting user know
      toast(`Auto-switched to ${detected}`, { icon: "✨" });
    }

    // Apply the *current* ampmMode to the dayjs value
    const adjusted = applyAmpmToDayjs(newValue, ampmMode);

    // store and emit adjusted value (parent should format with .format("hh:mm A"))
    setValue(adjusted);
    onChange?.(adjusted);
  };

  // ----------------- when user toggles AM/PM manually -----------------
  // If a time is already chosen, convert it to the newly selected AM/PM.
  useEffect(() => {
    if (!value) return;

    const adjusted = applyAmpmToDayjs(value, ampmMode);

    // If apply changes the hour, update stored value and emit
    if (adjusted.hour() !== value.hour()) {
      setValue(adjusted);
      onChange?.(adjusted);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ampmMode]); // run when user clicks AM/PM

  // ------------- Clear helper -------------
  const handleClear = () => {
    setValue(null);
    onChange?.(null);
    setClockKey(Date.now());
  };

  // ------------- UI -------------
  return (
    <div className="bg-white/50 p-5 rounded-xl shadow space-y-4 max-w-md">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div className="flex gap-3">
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
          ampm={false} // we handle AM/PM by toggle
          value={value}
          onChange={handleTimeChange}
          minutesStep={5}
          shouldDisableTime={(timeValue) => {
            // timeValue is Dayjs without date info — attach selectedDate for checking
            if (!selectedDate || !timeValue) return false;
            // create a dayjs with date + time
            let merged = dayjs(`${selectedDate} ${timeValue.format("HH:mm")}`, "YYYY-MM-DD HH:mm");

            // CRITICAL FIX: Apply the current AM/PM mode to the time check
            // Otherwise, checking "11:35" in PM mode checks 11:35 AM (not blocked) instead of 11:35 PM (blocked)
            merged = applyAmpmToDayjs(merged, ampmMode);

            return parseBlocked(merged);
          }}
        />
      </LocalizationProvider>

      <div className="flex gap-2">
        <Button variant="outlined" color="error" fullWidth onClick={handleClear}>
          Clear Time
        </Button>
      </div>

      <p className="text-sm text-gray-700">
        Selected Time:{" "}
        <span className="font-semibold">
          {value ? dayjs(value).format("hh:mm A") : "None"}
        </span>
      </p>
    </div>
  );
}
