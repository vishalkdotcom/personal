import Expertise from "@/components/home/expertise";
import Intro from "@/components/home/intro";
import ProfessionIntro from "@/components/home/profession-intro";
import SocialLinks from "@/components/home/social-links";

export default function Page() {
  return (
    <article className="space-y-16 sm:space-y-20">
      <div>
        <Intro />
        <SocialLinks className="mt-6 sm:mt-8" />
      </div>
      <Expertise />
      <ProfessionIntro />
    </article>
  );
}
