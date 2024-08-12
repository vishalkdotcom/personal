import { concepts, projects } from "@/data/projects";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeading } from "@/components/page-heading";
import { ProjectList } from "@/components/work/project-list";

export function WorkSection() {
  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-12">
      <PageHeading text="Work" />

      <Tabs defaultValue="projects" className="w-full">
        <div className="sticky top-16 bg-white/80 backdrop-blur-sm z-10 py-2 sm:py-4">
          <TabsList className="w-full">
            <TabsTrigger value="projects" className="w-full">
              Projects
            </TabsTrigger>
            <TabsTrigger value="concepts" className="w-full">
              Concepts
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="projects" className="pt-4 sm:pt-6">
          <ProjectList projects={projects} />
        </TabsContent>
        <TabsContent value="concepts" className="pt-4 sm:pt-6">
          <ProjectList projects={concepts} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
