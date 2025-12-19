"use client";

import React, { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ShopImageCarousel({ images = [] }) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!emblaApi) return;
        setCount(emblaApi.scrollSnapList().length);
        setCurrent(emblaApi.selectedScrollSnap());

        emblaApi.on("select", () => {
            setCurrent(emblaApi.selectedScrollSnap());
        });
    }, [emblaApi]);

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    // Fallback if no images
    const displayImages = images.length > 0 ? images : [
        "/barbershop1.jpeg",
        "/barbershop2.jpeg",
        "/barbershop.jpg"
    ];

    return (
        <div className="relative group w-full h-[250px] md:h-[400px] bg-gray-100 rounded-b-2xl md:rounded-2xl overflow-hidden">
            <div className="overflow-hidden h-full" ref={emblaRef}>
                <div className="flex touch-pan-y h-full">
                    {displayImages.map((src, index) => (
                        <div className="flex-[0_0_100%] min-w-0 relative h-full" key={index}>
                            <img
                                src={src}
                                alt={`Shop ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                            {/* Overlay for text readability if needed, but keeping clean for now */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Buttons (Desktop only or visible on hover) */}
            <button
                onClick={scrollPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex"
            >
                <ChevronLeft size={20} className="text-gray-800" />
            </button>

            <button
                onClick={scrollNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex"
            >
                <ChevronRight size={20} className="text-gray-800" />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {Array.from({ length: count }).map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => emblaApi?.scrollTo(idx)}
                        className={`
              w-2 h-2 rounded-full transition-all
              ${idx === current ? "bg-white w-4" : "bg-white/50 hover:bg-white/80"}
            `}
                    />
                ))}
            </div>
        </div>
    );
}
