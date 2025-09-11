<script lang="ts">
  import Icon from "$lib/components/Icon.svelte";
  import type { IconName } from "$lib/types/icons";

  interface SkillItem {
    icon: IconName;
    text: string;
    color?: string;
  }

  const skills: SkillItem[] = [
    {
      icon: "nextjs",
      text: "Next.js",
      color: "#000000",
    },
    {
      icon: "react",
      text: "React.js",
      color: "#61DAFB",
    },
    {
      icon: "typescript",
      text: "TypeScript",
      color: "#3178C6",
    },
    {
      icon: "javascript",
      text: "JavaScript",
      color: "#F7DF1E",
    },
    {
      icon: "figma",
      text: "Figma",
      color: "#F24E1E",
    },
  ];
</script>

<section>
  <div
    class="grid max-w-xl grid-cols-2 gap-3 xs:grid-cols-3 sm:gap-4 lg:max-w-2xl lg:gap-6"
  >
    {#each skills as { icon, text, color }}
      <div class="flex items-center gap-x-2 sm:gap-x-3 lg:gap-x-4">
        <Icon name={icon} class="size-4 sm:size-6 lg:size-7" {color} />
        <span class="text-base tracking-wide sm:text-lg lg:text-xl">
          {text}
        </span>
      </div>
    {/each}
  </div>
</section>
