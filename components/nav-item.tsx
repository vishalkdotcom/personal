import Link from "next/link";

type Props = {
  href: string;
  children?: React.ReactNode;
};

export default function NavItem({ href, children }: Props) {
  return (
    <Link href={href}>
      <span className="text-sm text-muted-foreground hover:text-foreground sm:text-base">
        {children}
      </span>
    </Link>
  );
}
