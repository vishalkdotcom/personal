import { FadeInSection } from "@/components/fade-in-section";
import { ContactSection } from "@/components/home/contact-section";
import { Expertise } from "@/components/home/expertise";
import { Intro } from "@/components/home/intro";
import { ProfessionIntro } from "@/components/home/profession-intro";
import { SocialLinks } from "@/components/home/social-links";
import { WorkSection } from "@/components/home/work-section";

export default function HomePage() {
  return (
    <article className="space-y-16 sm:space-y-24 lg:space-y-32">
      <FadeInSection>
        <section id="intro" className="space-y-12 sm:space-y-16 lg:space-y-20">
          <div>
            <Intro />
            <SocialLinks className="mt-6 sm:mt-8 lg:mt-10" />
          </div>
          <Expertise />
          <ProfessionIntro />
        </section>
      </FadeInSection>

      <FadeInSection>
        <section
          id="work"
          className="pt-16 sm:pt-24 lg:pt-32 border-t border-gray-100"
        >
          <WorkSection />
        </section>
      </FadeInSection>

      <FadeInSection>
        <section
          id="contact"
          className="pt-16 sm:pt-24 lg:pt-32 border-t border-gray-100"
        >
          <ContactSection />
        </section>
      </FadeInSection>
    </article>
  );
}
