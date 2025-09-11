<script lang="ts">
  import type { IconName } from "$lib/types/icons";
  import nextjsIcon from '$lib/components/icons/nextjs.svg?raw';
  import reactIcon from '$lib/components/icons/react.svg?raw';
  import typescriptIcon from '$lib/components/icons/typescript.svg?raw';
  import javascriptIcon from '$lib/components/icons/javascript.svg?raw';
  import figmaIcon from '$lib/components/icons/figma.svg?raw';
  import githubIcon from '$lib/components/icons/github.svg?raw';
  import linkedinIcon from '$lib/components/icons/linkedin.svg?raw';
  import stackoverflowIcon from '$lib/components/icons/stackoverflow.svg?raw';
  import dribbbleIcon from '$lib/components/icons/dribbble.svg?raw';
  import envelopeIcon from '$lib/components/icons/envelope.svg?raw';

  // Map icon names to their SVG content
  const iconMap: Record<IconName, string> = {
    nextjs: nextjsIcon,
    react: reactIcon,
    typescript: typescriptIcon,
    javascript: javascriptIcon,
    figma: figmaIcon,
    github: githubIcon,
    linkedin: linkedinIcon,
    stackoverflow: stackoverflowIcon,
    dribbble: dribbbleIcon,
    envelope: envelopeIcon,
  };

  interface Props {
    name: IconName;
    class?: string;
    color?: string;
  }

  let { name, class: className = "", color }: Props = $props();

  const iconContent = $derived(iconMap[name]);
</script>

{#if iconContent}
  <span class={className} style={color ? `color: ${color};` : ""}>
    {@html iconContent}
  </span>
{:else}
  <div class={className}>Icon not found: {name}</div>
{/if}