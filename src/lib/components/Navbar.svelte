<script lang="ts">
	import { onMount } from 'svelte';
	import Logo from './Logo.svelte';
	import NavItem from './NavItem.svelte';

	const navItems = [
		{ href: "/", label: "About" },
		{ href: "/#work", label: "Work" },
		{ href: "/#contact", label: "Contact" },
	];

	let activeSection = $state("");

	function handleScroll() {
		const sections = ["intro", "work", "contact"];
		for (const section of sections) {
			const element = document.getElementById(section);
			if (element) {
				const rect = element.getBoundingClientRect();
				if (rect.top <= 100 && rect.bottom >= 100) {
					activeSection = section === "intro" ? "" : section;
					break;
				}
			}
		}
	}

	function handleNavClick(href: string) {
		if (href === "/") {
			activeSection = "";
		} else {
			activeSection = href.slice(2);
		}
	}

	onMount(() => {
		window.addEventListener("scroll", handleScroll);
		handleScroll(); // Call once to set initial state
		
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	});
</script>

<header class="sticky top-0 z-10 backdrop-blur-sm bg-background/80">
	<div class="container flex h-16 items-center justify-between sm:h-20">
		<a href="/" aria-label="Home" on:click={() => handleNavClick("/")}>
			<Logo />
		</a>
		<nav class="flex items-baseline justify-end gap-x-6 sm:gap-x-8">
			{#each navItems as item (item.href)}
				<NavItem
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
			{/each}
		</nav>
	</div>
</header>