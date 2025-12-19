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
        <div className="relative h-full w-full group">
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="h-full overflow-y-auto snap-y snap-mandatory scrollbar-hide py-[66px] relative z-20"
                style={{ scrollBehavior: "smooth" }}
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
                            onSelect(item);
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
    if (!value) return null;

    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
    const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, "0"));
    const ampms = ["AM", "PM"];

    const currentHour = value.format("h");
    const currentMinute = Math.floor(value.minute() / 5) * 5;
    const currentMinuteStr = currentMinute.toString().padStart(2, "0");
    const currentAmpm = value.format("A");

    const handleHourChange = (newHour) => {
        let h = parseInt(newHour, 10);
        if (currentAmpm === "PM" && h !== 12) h += 12;
        if (currentAmpm === "AM" && h === 12) h = 0;
        onChange(value.hour(h));
    };

    const handleMinuteChange = (newMin) => {
        onChange(value.minute(parseInt(newMin, 10)));
    };

    const handleAmpmChange = (newAmpm) => {
        if (newAmpm === currentAmpm) return;
        let h = value.hour();
        if (newAmpm === "PM" && h < 12) h += 12;
        if (newAmpm === "AM" && h >= 12) h -= 12;
        onChange(value.hour(h));
    };

    return (
        <div className="relative w-full max-w-[320px] mx-auto h-[180px] bg-white rounded-2xl shadow-inner border border-gray-200 overflow-hidden">
            <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-[48px] bg-blue-50/50 border-t border-b border-blue-100 pointer-events-none z-10" />
            <div className="flex h-full relative">
                <TimeColumn items={hours} selectedValue={currentHour} onSelect={handleHourChange} label="Hour" />
                <div className="flex items-center justify-center pt-2 z-20">
                    <span className="text-xl font-bold text-gray-300 mb-1">:</span>
                </div>
                <TimeColumn items={minutes} selectedValue={currentMinuteStr} onSelect={handleMinuteChange} label="Min" />
                <TimeColumn items={ampms} selectedValue={currentAmpm} onSelect={handleAmpmChange} label="Am/Pm" />
            </div>
            <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-white to-transparent pointer-events-none z-30"></div>
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none z-30"></div>
        </div>
    );
}
