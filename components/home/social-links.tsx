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
        {links.map(({ href, icon, label }, index) => (
          <SocialIcon key={index} href={href} icon={icon} label={label} />
        ))}
      </div>
    </section>
  );
}

type SocialLink = {
  href: string;
  icon: PhosphorIcon;
  label: string;
};

const links: SocialLink[] = [
  { href: "https://github.com/vishalkdotcom/", icon: GithubLogo, label: "GitHub Profile" },
  { href: "https://www.linkedin.com/in/vishalkdotcom/", icon: LinkedinLogo, label: "LinkedIn Profile" },
  {
    href: "https://stackoverflow.com/users/1027522/vishal",
    icon: StackOverflowLogo,
    label: "StackOverflow Profile",
  },
  { href: "https://dribbble.com/vishalkdotcom", icon: DribbbleLogo, label: "Dribbble Profile" },
  { href: "mailto:hello@vishalk.com", icon: EnvelopeIcon, label: "Email" },
];

type SocialIconProps = SocialLink;

function SocialIcon({ href, icon: Icon, label }: SocialIconProps) {
  return (
    <Link
      href={href}
      className="text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full p-1"
      target={href.startsWith("mailto") ? undefined : "_blank"}
      rel={href.startsWith("mailto") ? undefined : "noopener noreferrer"}
      aria-label={label}
    >
      <Icon className="size-6 sm:size-8" />
    </Link>
  );
}