<script lang="ts">
  import Icon from "$lib/components/Icon.svelte";
  import type { IconName } from "$lib/types/icons";

  interface Props {
    className?: string;
  }

  let { className = "" }: Props = $props();

  interface SocialLink {
    href: string;
    icon: IconName;
    label: string;
  }

  const links: SocialLink[] = [
    {
      href: "https://github.com/vishalkdotcom/",
      icon: "github",
      label: "GitHub Profile",
    },
    {
      href: "https://www.linkedin.com/in/vishalkdotcom/",
      icon: "linkedin",
      label: "LinkedIn Profile",
    },
    {
      href: "https://stackoverflow.com/users/1027522/vishal",
      icon: "stackoverflow",
      label: "StackOverflow Profile",
    },
    {
      href: "https://dribbble.com/vishalkdotcom",
      icon: "dribbble",
      label: "Dribbble Profile",
    },
    { href: "mailto:hello@vishalk.com", icon: "envelope", label: "Email" },
  ];
</script>

<section class={className}>
  <div class="flex flex-row gap-x-6 xs:gap-8">
    {#each links as { href, icon, label }}
      <a
        {href}
        class="rounded-full p-1 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        target={href.startsWith("mailto") ? undefined : "_blank"}
        rel={href.startsWith("mailto") ? undefined : "noopener noreferrer"}
        aria-label={label}
      >
        <Icon name={icon} class="size-6 sm:size-8" />
      </a>
    {/each}
  </div>
</section>
