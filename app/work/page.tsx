import { concepts, projects } from "@/data/projects";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeading from "@/components/page-heading";
import { Projects } from "@/components/work/projects";

export default function WorkPage() {
  return (
    <div className="space-y-16 sm:space-y-20">
      <PageHeading text="Work" />

      <Tabs defaultValue="projects">
        <TabsList className="-mx-1 w-full">
          <TabsTrigger value="projects" className="w-full">
            Projects
          </TabsTrigger>
          <TabsTrigger value="concepts" className="w-full">
            Concepts
          </TabsTrigger>
        </TabsList>
        <TabsContent value="projects" className="mt-12 sm:mt-16">
          <Projects projects={projects} />
        </TabsContent>
        <TabsContent value="concepts" className="mt-12 sm:mt-16">
          <Projects projects={concepts} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
