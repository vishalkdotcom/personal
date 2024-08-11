import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
} from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type Props = HTMLAttributes<HTMLElement> & {
  currentIndex: number;
  images: string[];
  onImageClick?: (index: number) => void;
  title: string;
};

export function ProjectCarousel({
  currentIndex,
  images,
  onImageClick,
  title,
  ...props
}: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  // const [selectedIndex, setSelectedIndex] = useState(currentIndex);

  // useEffect(() => {
  //   if (emblaApi) {
  //     emblaApi.on("select", () => {
  //       setSelectedIndex(emblaApi.selectedScrollSnap());
  //     });
  //     emblaApi.scrollTo(currentIndex);
  //   }
  // }, [emblaApi, currentIndex]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!emblaApi) return;
      if (e.key === "ArrowLeft") {
        emblaApi.scrollPrev();
      } else if (e.key === "ArrowRight") {
        emblaApi.scrollNext();
      }
    },
    [emblaApi]
  );

  return (
    <div {...props} onKeyDown={handleKeyDown} tabIndex={0}>
      <Carousel
        opts={{ align: "start", loop: true }}
        className="relative group"
        ref={emblaRef}
      >
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem
              key={index}
              className="sm:basis-1/2 lg:basis-1/3 pl-4"
            >
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <button
                    className="w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    onClick={() => onImageClick?.(index)}
                    aria-label={`View larger image ${index + 1} of project ${title}`}
                  >
                    <div className="relative h-48 sm:h-64">
                      <Image
                        alt={`${title} screenshot ${index + 1}`}
                        className="object-cover"
                        src={image}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  </button>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4 sm:-left-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CarouselNext className="right-4 sm:-right-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="hidden absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentIndex ? "bg-foreground" : "bg-muted"
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                emblaApi?.scrollTo(index);
              }}
              onMouseDown={(e) => e.preventDefault()}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
}
