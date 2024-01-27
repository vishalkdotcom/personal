import type { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  title: string;
  description: string;
}>;

export function ProjectDetails({ title, description, children }: Props) {
  return (
    <article>
      <h2 className="-ml-px font-display text-xl font-normal uppercase leading-none tracking-widest sm:text-3xl sm:leading-none lg:text-4xl lg:leading-none">
        {title}
      </h2>
      <div className="mt-2 max-w-xl text-base leading-relaxed tracking-wide sm:mt-3 sm:text-lg sm:leading-relaxed lg:max-w-2xl lg:text-xl lg:leading-relaxed">
        {description}
      </div>
      {children}
    </article>
  );
}
