"use client";

import { useEffect, useRef, type PropsWithChildren } from "react";

interface ParallaxSectionProps extends PropsWithChildren {
  speed?: number;
}

export function ParallaxSection({
  children,
  speed = 0.5,
}: ParallaxSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;

    function handleScroll() {
      if (!section) return;
      const scrollPosition = window.scrollY;
      const sectionPosition = section.offsetTop;
      const distance = scrollPosition - sectionPosition;
      section.style.transform = `translateY(${distance * speed}px)`;
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed]);

  return <div ref={sectionRef}>{children}</div>;
}
