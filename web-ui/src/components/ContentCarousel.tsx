import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const ContentCarousel = ({
  items,
  activeIndex,
  setActiveIndex,
  onItemSelect,
}) => {
  const nextItem = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % items.length);
  };

  const prevItem = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft") {
        prevItem(); // Move to previous item
      } else if (event.key === "ArrowRight") {
        nextItem(); // Move to next item
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="relative h-72">
      <Button
        onClick={prevItem}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10"
        variant="ghost"
      >
        <ChevronLeft className="h-8 w-8" />
      </Button>

      <div className="flex space-x-4 overflow-x-auto py-4 items-end absolute bottom-0 left-0 right-0">
        {items.map((item, index) => (
          <CarouselItem
            key={index}
            item={item}
            className={`flex-none transition-all duration-300 ease-in-out ${
              index === activeIndex ? "w-52 h-72" : "w-40 h-60"
            }`}
            onClick={() => onItemSelect(index)}
          />
        ))}
      </div>

      <Button
        onClick={nextItem}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10"
        variant="ghost"
      >
        <ChevronRight className="h-8 w-8" />
      </Button>
    </div>
  );
};

const CarouselItem = ({ item, className, onClick }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div onClick={onClick} className={className}>
      <div className="relative h-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-300 rounded animate-pulse" />
        )}
        <img
          src={item.posterUrl}
          alt={item.title}
          className={`w-full h-full object-cover rounded transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => setIsLoading(false)}
        />
      </div>
    </div>
  );
};