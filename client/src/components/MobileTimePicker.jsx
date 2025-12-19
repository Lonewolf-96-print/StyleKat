"use client";

import React, { useRef, useEffect, useState } from "react";
import { cn } from "../lib/utils";

// --- REUSABLE COLUMN COMPONENT ---
const TimeColumn = ({ items, selectedValue, onSelect, label }) => {
    const containerRef = useRef(null);
    const isScrolling = useRef(false);
    const ITEM_HEIGHT = 48; // Height of each item in pixels

    // Scroll to selected item on mount or when value changes externally
    useEffect(() => {
        if (isScrolling.current) return;
        const index = items.indexOf(selectedValue);
        if (index !== -1 && containerRef.current) {
            containerRef.current.scrollTop = index * ITEM_HEIGHT;
        }
    }, [selectedValue, items]);

    const handleScroll = (e) => {
        isScrolling.current = true;
        const container = e.target;
        const scrollTop = container.scrollTop;

        // Calculate index based on scroll position
        const index = Math.round(scrollTop / ITEM_HEIGHT);
        const clampedIndex = Math.min(Math.max(index, 0), items.length - 1);

        // Debounce/Timeout to set selected value only when "settled" near a snap point
        // using a small timeout to clear the "isScrolling" flag
        if (container.timer) clearTimeout(container.timer);
        container.timer = setTimeout(() => {
            isScrolling.current = false;
            if (items[clampedIndex] !== selectedValue) {
                onSelect(items[clampedIndex]);
            }
        }, 150);
    };

    return (
        <div className="relative h-[150px] w-full group">
            {/* Label (optional, currently hidden to be cleaner) */}
            {/* <div className="absolute -top-6 w-full text-center text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</div> */}

            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="h-full overflow-y-auto snap-y snap-mandatory scrollbar-hide py-[50px] relative z-20"
                style={{ scrollBehavior: "smooth" }} // Smooth scroll for programmatic updates
            >
                {items.map((item) => (
                    <div
                        key={item}
                        className={cn(
                            "h-[48px] flex items-center justify-center snap-center transition-all duration-200 cursor-pointer select-none",
                            item === selectedValue
                                ? "text-blue-600 font-bold text-2xl scale-110"
                                : "text-gray-400 font-medium text-lg opacity-60 scale-90"
                        )}
                        onClick={() => {
                            // Allow clicking to select
                            onSelect(item);
                            // The useEffect will handle scrolling to it
                        }}
                    >
                        {item}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function MobileTimePicker({ value, onChange }) {
    // Value is expected to be a dayjs object
    // If null, we default to 12:00 PM for display purposes but don't commit it until changed? 
    // actually component expects value to be set.

    if (!value) return null;

    // GENERATE ARRAYS
    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString()); // "1" to "12"
    const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, "0")); // "00", "05", ... "55"
    const ampms = ["AM", "PM"];

    // PARSE CURRENT VALUE
    const currentHour = value.format("h"); // "1".."12"
    const currentMinute = Math.floor(value.minute() / 5) * 5; // Round to nearest 5
    const currentMinuteStr = currentMinute.toString().padStart(2, "0");
    const currentAmpm = value.format("A"); // "AM" or "PM"

    // HANDLERS
    const handleHourChange = (newHour) => {
        // newHour is "1".."12". preserve AM/PM
        // Convert 12-hour format back to 0-23 for dayjs
        let h = parseInt(newHour, 10);
        if (currentAmpm === "PM" && h !== 12) h += 12;
        if (currentAmpm === "AM" && h === 12) h = 0;

        const newValue = value.hour(h);
        onChange(newValue);
    };

    const handleMinuteChange = (newMin) => {
        const newValue = value.minute(parseInt(newMin, 10));
        onChange(newValue);
    };

    const handleAmpmChange = (newAmpm) => {
        if (newAmpm === currentAmpm) return;
        let h = value.hour();

        if (newAmpm === "PM" && h < 12) h += 12;
        if (newAmpm === "AM" && h >= 12) h -= 12;

        const newValue = value.hour(h);
        onChange(newValue);
    };

    return (
        <div className="relative w-full max-w-[320px] mx-auto h-[180px] bg-white rounded-2xl shadow-inner border border-gray-200 overflow-hidden">

            {/* SELECTION HIGHLIGHT BAR (Center) */}
            <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-[48px] bg-blue-50/50 border-t border-b border-blue-100 pointer-events-none z-10" />

            {/* COLUMNS CONTAINER */}
            <div className="flex h-full relative">
                <TimeColumn items={hours} selectedValue={currentHour} onSelect={handleHourChange} label="Hour" />

                {/* COLON SEPARATOR */}
                <div className="flex items-center justify-center pt-2 z-20">
                    <span className="text-xl font-bold text-gray-300 mb-1">:</span>
                </div>

                <TimeColumn items={minutes} selectedValue={currentMinuteStr} onSelect={handleMinuteChange} label="Min" />
                <TimeColumn items={ampms} selectedValue={currentAmpm} onSelect={handleAmpmChange} label="Am/Pm" />
            </div>

            {/* FADE GRADIENTS */}
            <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-white to-transparent pointer-events-none z-30"></div>
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none z-30"></div>

        </div>
    );
}
