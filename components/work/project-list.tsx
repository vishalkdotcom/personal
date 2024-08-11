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

  const currentProject = openImageOptions
    ? projects[openImageOptions.projectIndex]
    : null;

  const currentImage = currentProject
    ? currentProject.images[openImageOptions!.imageIndex]
    : null;

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
      <div className="flex flex-col gap-y-16 sm:gap-y-20">
        {projects.map(({ title, description, link, images }, projectIndex) => (
          <ProjectDetails
            key={title}
            title={title}
            description={description}
            link={link}
          >
            <ProjectCarousel
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
        <DialogContent className="max-w-4xl">
          <DialogHeader className="text-left">
            <DialogTitle>{currentProject?.title}</DialogTitle>
          </DialogHeader>

          {currentImage && (
            <div className="relative overflow-hidden rounded-lg">
              <Image
                alt={`${currentProject?.title} screenshot`}
                className="w-full h-auto"
                src={currentImage}
                width={1200}
                height={675}
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 1200px"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
