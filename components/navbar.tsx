"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/logo";
import { NavItem } from "@/components/nav-item";

const navItems = [
  { href: "/", label: "About" },
  { href: "/#work", label: "Work" },
  { href: "/#contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["intro", "work", "contact"];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section === "intro" ? "" : section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Call once to set initial state
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    if (href === "/") {
      setActiveSection("");
    } else {
      setActiveSection(href.slice(2));
    }
  };

  return (
    <header className="sticky top-0 z-10 backdrop-blur-sm bg-white/80">
      <div className="container flex h-16 items-center justify-between sm:h-20">
        <Link href="/" aria-label="Home" onClick={() => handleNavClick("/")}>
          <Logo />
        </Link>
        <nav className="flex items-baseline justify-end gap-x-6 sm:gap-x-8">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              active={
                item.href === "/"
                  ? activeSection === ""
                  : activeSection === item.href.slice(2)
              }
              onClick={() => handleNavClick(item.href)}
            >
              {item.label}
            </NavItem>
          ))}
        </nav>
      </div>
    </header>
  );
}