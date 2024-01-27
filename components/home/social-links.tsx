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

export function SocialLinks(props: Props) {
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
  { href: "https://github.com/vishalkdotcom/", icon: GithubLogo },
  { href: "https://www.linkedin.com/in/vishalkdotcom/", icon: LinkedinLogo },
  {
    href: "https://stackoverflow.com/users/1027522/vishal",
    icon: StackOverflowLogo,
  },
  { href: "https://dribbble.com/vishalkdotcom", icon: DribbbleLogo },
  { href: "mailto:hello@vishalk.com", icon: EnvelopeIcon },
];

type SocialIconProps = SocialLink;

function SocialIcon({ href, icon: Icon }: SocialIconProps) {
  return (
    <Link
      href={href}
      className="text-muted-foreground hover:text-foreground"
      target={href.startsWith("mailto") ? undefined : "_blank"}
    >
      <Icon className="size-6 sm:hidden" weight="regular" />
      <Icon className="hidden size-8 sm:block" weight="light" />
    </Link>
  );
}
