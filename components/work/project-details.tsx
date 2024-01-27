import type { PropsWithChildren } from "react";
import Link from "next/link";
import { ExternalLinkIcon } from "@radix-ui/react-icons";

type Props = PropsWithChildren<{
  title: string;
  description: string;
  link?: string;
}>;

export function ProjectDetails({ title, description, link, children }: Props) {
  return (
    <article>
      <div className="group inline-flex items-baseline gap-x-2">
        <h2 className="-ml-px font-display text-xl font-normal uppercase leading-none tracking-widest sm:text-3xl sm:leading-none lg:text-4xl lg:leading-none">
          {title}
        </h2>
        {link && (
          <Link href={link} target="_blank">
            <ExternalLinkIcon className="size-5 text-muted-foreground group-hover:text-foreground" />
          </Link>
        )}
      </div>
      <div className="mt-2 max-w-xl text-base leading-relaxed tracking-wide sm:mt-3 sm:text-lg sm:leading-relaxed lg:max-w-2xl lg:text-xl lg:leading-relaxed">
        {description}
      </div>
      {children}
    </article>
  );
}
