"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeading } from "@/components/page-heading";

export function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Add form submission logic here
    setIsSubmitting(false);
  };

  return (
    <section id="contact" className="space-y-16 sm:space-y-20 lg:space-y-24">
      <PageHeading text="Contact" />
      <div className="grid gap-12 sm:grid-cols-2 lg:gap-16">
        <aside className="space-y-6 sm:space-y-8">
          <h2 className="-ml-px font-display text-xl font-normal uppercase leading-none tracking-widest sm:text-3xl sm:leading-none lg:text-4xl lg:leading-none">
            Get in touch
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed tracking-wide sm:mt-6 sm:text-lg sm:leading-relaxed lg:max-w-2xl lg:text-xl lg:leading-relaxed text-muted-foreground">
            I'm always open to new opportunities and collaborations. Feel free
            to reach out!
          </p>
        </aside>
        <article>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input placeholder="Your Name" required aria-label="Your Name" />
            <Input
              type="email"
              placeholder="Your Email"
              required
              aria-label="Your Email"
            />
            <Textarea
              placeholder="Your Message"
              rows={5}
              required
              aria-label="Your Message"
            />
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </article>
      </div>
    </section>
  );
}
