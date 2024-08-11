import { PageHeading } from "@/components/page-heading";

type Props = React.HTMLAttributes<HTMLElement>;

export function Intro(props: Props) {
  return (
    <section {...props}>
      <PageHeading text="Vishal Kumar" />

      <p className="mt-4 max-w-xl text-base leading-relaxed tracking-wide sm:mt-6 sm:text-lg sm:leading-relaxed lg:max-w-2xl lg:text-xl lg:leading-relaxed">
        Expert frontend engineer specialized in building robust interactive
        web apps. Crafting beautiful, scalable, and high performing web experiences
        since 2012.
      </p>
    </section>
  );
}