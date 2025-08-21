'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselProps {
  children: React.ReactNode[];
}

export default function FeatureCarousel({ children }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const minSwipeDistance = 50;

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === children.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? children.length - 1 : prevIndex - 1
    );
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
    
    setIsDragging(false);
  };

  // Auto-play functionality (optional)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDragging) {
        setCurrentIndex((prevIndex) => 
          prevIndex === children.length - 1 ? 0 : prevIndex + 1
        );
      }
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isDragging, children.length]);

  return (
    <div className="relative w-full">
      {/* Desktop: Grid view */}
      <div className="hidden md:grid md:grid-cols-3 gap-8">
        {children}
      </div>

      {/* Mobile: Carousel view */}
      <div className="md:hidden relative overflow-hidden carousel-container">
        <div
          ref={carouselRef}
          className="flex transition-transform duration-300 ease-in-out carousel-track"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {children.map((child, index) => (
            <div key={index} className="w-full flex-shrink-0 px-4 carousel-item">
              {child}
            </div>
          ))}
        </div>

        {/* Navigation buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white dark:bg-nordic-dark shadow-lg rounded-full p-2 z-10 border border-nordic-light dark:border-nordic-primary"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5 text-nordic-primary" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white dark:bg-nordic-dark shadow-lg rounded-full p-2 z-10 border border-nordic-light dark:border-nordic-primary"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5 text-nordic-primary" />
        </button>

        {/* Dots indicator */}
        <div className="flex justify-center mt-6 space-x-2">
          {children.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                currentIndex === index 
                  ? 'bg-nordic-primary scale-110' 
                  : 'bg-nordic-light dark:bg-nordic-dark border border-nordic-primary'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
