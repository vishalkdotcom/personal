"use client";

import React, { useEffect, useRef, useState } from "react";

interface FadeInSectionProps {
  children: React.ReactNode;
}

export function FadeInSection({ children }: FadeInSectionProps) {
  const [isVisible, setVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => setVisible(entry.isIntersecting));
    });

    const currentElement = domRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, []);

  return (
    <div
      className={`section-fade-in ${isVisible ? "visible" : ""}`}
      ref={domRef}
    >
      {children}
    </div>
  );
}
