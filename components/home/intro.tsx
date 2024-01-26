import { PageHeading } from "@/components/page-heading";

type Props = React.HTMLAttributes<HTMLElement>;

export function Intro(props: Props) {
  return (
    <section {...props}>
      <PageHeading text="Vishal Kumar" />

      <p className="mt-2 max-w-xl text-base leading-relaxed tracking-wide sm:mt-3 sm:text-lg sm:leading-relaxed lg:max-w-2xl lg:text-xl lg:leading-relaxed">
        <span>
          Expert frontend engineer specialized in building robust interactive
          web apps.{" "}
        </span>
        <span>
          Crafting beautiful, scalable, and high performing web experiences
          since 2012.
        </span>
      </p>
    </section>
  );
}
