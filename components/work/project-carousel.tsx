import { useCallback, useEffect, useRef, type HTMLAttributes } from "react";
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
  images: string[];
  onImageClick?: (index: number) => void;
  title: string;
};

export function ProjectCarousel({
  images,
  onImageClick,
  title,
  ...props
}: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel();

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
        opts={{ align: "start" }}
        className="-mx-2 xs:mx-0"
        ref={emblaRef}
      >
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index} className="sm:basis-1/2 lg:basis-1/3">
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <button
                    className="w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    onClick={() => onImageClick?.(index)}
                    aria-label={`View larger image ${index + 1} of project ${title}`}
                  >
                    <Image
                      alt={`${title} screenshot ${index + 1}`}
                      className="h-auto w-full object-cover object-top shadow"
                      src={image}
                      width={400}
                      height={300}
                    />
                  </button>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2 mt-0.5 opacity-60 hover:opacity-100 xs:opacity-100 sm:-left-10 md:-left-12" />
        <CarouselNext className="right-2 mt-0.5 opacity-60 hover:opacity-100 xs:opacity-100 sm:-right-10 md:-right-12" />
      </Carousel>
    </div>
  );
}
