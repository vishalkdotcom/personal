import { projects, type ProjectInfo } from "@/data/projects";

import ProjectDetails from "@/components/work/project-details";

type Props = React.HTMLAttributes<HTMLElement> & {
  projects: ProjectInfo[];
};

export function Projects({ projects, ...props }: Props) {
  return (
    <section {...props}>
      <div className="flex flex-col gap-y-12 sm:gap-y-16">
        {projects.map((project) => (
          <ProjectDetails key={project.title} {...project} />
        ))}
      </div>
    </section>
  );
}
