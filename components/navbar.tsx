import Logo from "@/components/logo";
import NavItem from "@/components/nav-item";

export default function Navbar() {
  return (
    <div className="flex h-12 items-center border-b bg-white sm:h-14">
      <div className="container flex items-center justify-between">
        <Logo />
        <div className="flex items-baseline justify-end gap-x-6 sm:gap-x-8">
          <NavItem href="/work">Work</NavItem>
          <NavItem href="/contact">Contact</NavItem>
        </div>
      </div>
    </div>
  );
}
