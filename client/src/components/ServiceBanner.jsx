import React, { useState, useEffect, useRef } from "react";

const slides = [
  "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/gallery/slide1.png",
  "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/gallery/slide2.png",
  "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/gallery/slide3.png",
  "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/gallery/slide4.png",
  "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/gallery/slide5.png",
];

export default function ImageSliderWithThumbnails() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef(null);

  const slideCount = slides.length;

  const goToSlide = (index) => {
    const slider = sliderRef.current;
    if (slider) {
      const slideWidth = slider.children[0].clientWidth;
      slider.style.transform = `translateX(-${index * slideWidth}px)`;
    }
  };

  const nextSlide = () =>
    setCurrentSlide((prev) => (prev + 1) % slideCount);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + slideCount) % slideCount);

  // Auto-slide every 3s
  useEffect(() => {
    const interval = setInterval(nextSlide, 3000);
    return () => clearInterval(interval);
  }, []);

  // Update slider on slide change
  useEffect(() => {
    goToSlide(currentSlide);
  }, [currentSlide]);

  // Update slider on window resize
  useEffect(() => {
    const handleResize = () => goToSlide(currentSlide);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [currentSlide]);

  return (
    <div className="flex flex-col items-center space-y-4 max-w-3xl mx-auto">
      {/* Main Slider with Arrows */}
      <div className="relative w-full overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          ref={sliderRef}
        >
          {slides.map((src, index) => (
            <img
              key={index}
              src={src}
              alt={`Slide ${index + 1}`}
              className="w-full flex-shrink-0 rounded-lg"
            />
          ))}
        </div>

        {/* Left Arrow */}
        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-2 transform -translate-y-1/2 p-2 bg-black/40 rounded-full hover:bg-black/60"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Right Arrow */}
        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-2 transform -translate-y-1/2 p-2 bg-black/40 rounded-full hover:bg-black/60"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-5 gap-4 w-full">
        {slides.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`Thumb ${index + 1}`}
            onClick={() => setCurrentSlide(index)}
            className={`rounded-lg cursor-pointer object-cover transition-opacity duration-300 
              ${currentSlide === index ? "opacity-100 border-2 border-indigo-500" : "opacity-70 hover:opacity-100 hover:scale-120"}`}
          />
        ))}
      </div>
    </div>
  );
}
