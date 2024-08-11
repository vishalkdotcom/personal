import { concepts, projects } from "@/data/projects";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeading } from "@/components/page-heading";
import { ProjectList } from "@/components/work/project-list";

export function WorkSection() {
  return (
    <div className="space-y-8 sm:space-y-12 lg:space-y-16">
      <PageHeading text="Work" />

      <Tabs defaultValue="projects" className="w-full">
        <div className="sticky top-20 bg-white/80 backdrop-blur-sm z-10 py-4">
          <TabsList className="w-full mb-6 sm:mb-8">
            <TabsTrigger value="projects" className="w-full">
              Projects
            </TabsTrigger>
            <TabsTrigger value="concepts" className="w-full">
              Concepts
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="projects">
          <ProjectList projects={projects} />
        </TabsContent>
        <TabsContent value="concepts">
          <ProjectList projects={concepts} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
