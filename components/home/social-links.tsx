import Link from "next/link";
import { Icon as PhosphorIcon } from "@phosphor-icons/react";
import {
  DribbbleLogo,
  EnvelopeSimple as EnvelopeIcon,
  GithubLogo,
  LinkedinLogo,
  StackOverflowLogo,
} from "@phosphor-icons/react/dist/ssr";

type Props = React.HTMLAttributes<HTMLElement>;

export default function SocialLinks(props: Props) {
  return (
    <section {...props}>
      <div className="flex flex-row gap-x-6 xs:gap-8">
        {links.map(({ href, icon }, index) => (
          <SocialIcon key={index} href={href} icon={icon} />
        ))}
      </div>
    </section>
  );
}

type SocialLink = {
  href: string;
  icon: PhosphorIcon;
};

const links: SocialLink[] = [
  { href: "/", icon: GithubLogo },
  { href: "/", icon: LinkedinLogo },
  { href: "/", icon: StackOverflowLogo },
  { href: "/", icon: DribbbleLogo },
  { href: "/", icon: EnvelopeIcon },
];

type SocialIconProps = SocialLink;

function SocialIcon({ href, icon: Icon }: SocialIconProps) {
  return (
    <Link href={href}>
      <Icon className="size-6 text-muted-foreground hover:text-foreground sm:size-8" />
    </Link>
  );
}
