import Link from "next/link";

type Props = {
  href: string;
  active: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
};

export function NavItem({ href, active, children, onClick }: Props) {
  return (
    <Link
      href={href}
      className={`text-sm sm:text-base transition-colors duration-200 ${
        active
          ? "text-foreground font-medium"
          : "text-muted-foreground hover:text-foreground"
      }`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
