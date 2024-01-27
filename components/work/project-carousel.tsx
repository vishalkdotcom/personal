import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type Props = React.HTMLAttributes<HTMLElement> & {
  images: string[];
  onImageClick?: (index: number) => void;
};

export function ProjectCarousel({ images, onImageClick, ...props }: Props) {
  return (
    <div {...props}>
      <Carousel opts={{ align: "start" }} className="-mx-2 xs:mx-0">
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index} className="sm:basis-1/2 lg:basis-1/3">
              <Card className="overflow-hidden">
                <CardContent className="flex select-none items-center justify-center p-0">
                  <Button
                    variant="ghost"
                    className="relative h-64 w-full xs:h-56 sm:h-40 md:h-48 lg:h-40"
                    onClick={() => onImageClick?.(index)}
                  >
                    <Image
                      alt="Project screenshot"
                      className="h-auto w-full object-cover object-top shadow"
                      src={image}
                      sizes="100vw"
                      fill
                    />
                  </Button>
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
