"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import type { ProjectInfo } from "@/data/projects";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Cross2Icon,
} from "@radix-ui/react-icons";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProjectCarousel } from "@/components/work/project-carousel";
import { ProjectDetails } from "@/components/work/project-details";

type Props = React.HTMLAttributes<HTMLElement> & {
  projects: ProjectInfo[];
};

type OpenProjectImageOption = {
  imageIndex: number;
  projectIndex: number;
};

export function ProjectList({ projects, ...props }: Props) {
  const [openImageOptions, setOpenImageOptions] =
    React.useState<OpenProjectImageOption | null>(null);

  const modalOpen = openImageOptions != null;

  const currentProject = openImageOptions
    ? projects[openImageOptions.projectIndex]
    : null;

  const handlePrevImage = useCallback(() => {
    if (openImageOptions && currentProject) {
      setOpenImageOptions((prev) => ({
        ...prev!,
        imageIndex:
          prev!.imageIndex === 0
            ? currentProject.images.length - 1
            : prev!.imageIndex - 1,
      }));
    }
  }, [openImageOptions, currentProject]);

  const handleNextImage = useCallback(() => {
    if (openImageOptions && currentProject) {
      setOpenImageOptions((prev) => ({
        ...prev!,
        imageIndex:
          prev!.imageIndex === currentProject.images.length - 1
            ? 0
            : prev!.imageIndex + 1,
      }));
    }
  }, [openImageOptions, currentProject]);

  function setModalOpen(open: boolean) {
    if (!open) {
      setOpenImageOptions(null);
    }
  }

  function handleImageClick(projectIndex: number, imageIndex: number) {
    setOpenImageOptions({ projectIndex, imageIndex });
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (modalOpen) {
        if (e.key === "ArrowLeft") {
          handlePrevImage();
        } else if (e.key === "ArrowRight") {
          handleNextImage();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalOpen, handlePrevImage, handleNextImage]);

  return (
    <section {...props}>
      <div className="flex flex-col gap-y-16 sm:gap-y-20">
        {projects.map(({ title, description, link, images }, projectIndex) => (
          <ProjectDetails
            key={title}
            title={title}
            description={description}
            link={link}
          >
            <ProjectCarousel
              currentIndex={
                openImageOptions?.projectIndex === projectIndex
                  ? openImageOptions.imageIndex
                  : 0
              }
              className="mt-6 sm:mt-8"
              images={images}
              onImageClick={(imageIndex) =>
                handleImageClick(projectIndex, imageIndex)
              }
              title={title}
            />
          </ProjectDetails>
        ))}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="sticky top-0 bg-background z-20 p-6 pb-4 shadow-md flex justify-between items-center">
            <DialogTitle>{currentProject?.title}</DialogTitle>
            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <Cross2Icon className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogHeader>

          <div className="p-6 pt-2 relative">
            {currentProject && openImageOptions && (
              <>
                <div className="relative overflow-hidden mt-4">
                  <Image
                    alt={`${currentProject.title} screenshot`}
                    className="w-full h-auto"
                    src={currentProject.images[openImageOptions.imageIndex]}
                    width={1200}
                    height={675}
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 1200px"
                  />
                </div>
                <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between p-4">
                  <button
                    onClick={handlePrevImage}
                    className="bg-black/50 p-2 rounded-full opacity-70 hover:opacity-100 transition-opacity duration-300"
                    aria-label="Previous image"
                  >
                    <ChevronLeftIcon className="w-6 h-6 text-white" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="bg-black/50 p-2 rounded-full opacity-70 hover:opacity-100 transition-opacity duration-300"
                    aria-label="Next image"
                  >
                    <ChevronRightIcon className="w-6 h-6 text-white" />
                  </button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
