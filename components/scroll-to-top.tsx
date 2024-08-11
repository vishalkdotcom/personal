"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowUpIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = useCallback(() => {
    setIsVisible(window.scrollY > 300);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, [toggleVisibility]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (!isVisible) return null;

  return (
    <Button
      onClick={scrollToTop}
      className="fixed bottom-4 right-4 rounded-full p-2"
      aria-label="Scroll to top"
    >
      <ArrowUpIcon className="h-5 w-5" />
    </Button>
  );
}
