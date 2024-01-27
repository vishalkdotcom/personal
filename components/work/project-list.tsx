"use client";

import React from "react";
import Image from "next/image";
import type { ProjectInfo } from "@/data/projects";

import {
  Dialog,
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

  const currentImage = openImageOptions
    ? projects[openImageOptions.projectIndex].images[
        openImageOptions.imageIndex
      ]
    : null;
  const currentProjectTitle = openImageOptions
    ? projects[openImageOptions.projectIndex].title
    : "";

  function setModalOpen(open: boolean) {
    if (!open) {
      setOpenImageOptions(null);
    }
  }

  function handleImageClick(projectIndex: number, imageIndex: number) {
    setOpenImageOptions({ projectIndex, imageIndex });
  }

  return (
    <section {...props}>
      <div className="flex flex-col gap-y-12 sm:gap-y-16">
        {projects.map(({ title, description, images }, projectIndex) => (
          <ProjectDetails key={title} title={title} description={description}>
            <ProjectCarousel
              className="mt-4 sm:mt-6"
              images={images}
              onImageClick={handleImageClick.bind(null, projectIndex)}
            />
          </ProjectDetails>
        ))}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="inset-0 mx-auto max-w-full translate-x-0 translate-y-0 grid-rows-[auto,1fr] gap-y-16 rounded-none sm:rounded-none">
          <DialogHeader className="text-left">
            <DialogTitle>{currentProjectTitle}</DialogTitle>
          </DialogHeader>

          {currentImage && (
            <div className="relative overflow-y-auto border-t">
              <Image
                alt="Project screenshot"
                className="!h-auto border"
                src={currentImage}
                sizes="100vw"
                fill
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
